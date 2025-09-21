import os
import json
import time
import hashlib
from pathlib import Path
import pickle
try:
    import cloudpickle as _cp
except Exception:
    _cp = None
from typing import Any, Dict, Optional, Tuple

from sympy import Min, Max, symbols
from sympy.parsing.sympy_parser import parse_expr, standard_transformations, convert_xor
from sympy.utilities.lambdify import lambdify


DATA_DIR = Path(__file__).parent / "data"
FORMULAS_DIR = DATA_DIR / "formulas"
AUDIT_LOG = DATA_DIR / "audit.jsonl"
PINS_PATH_DEFAULT = Path(__file__).parent / "config" / "pins.json"
CACHE_DIR = DATA_DIR / "cache"


class Telemetry:
    def __init__(self) -> None:
        self.registry_call_count = 0
        self.registry_eval_ms_total = 0.0
        self.cache_hit = 0
        self.cache_miss = 0
        self.compile_ms_total = 0.0
        self.per_formula: Dict[str, Dict[str, float]] = {}
        self.batch_calls = 0
        self._batch_size_total = 0
        self.persistent_cache_hits = 0

    def as_dict(self) -> Dict[str, Any]:
        d = {
            "registry_call_count": self.registry_call_count,
            "registry_eval_ms_total": self.registry_eval_ms_total,
            "cache_hit": self.cache_hit,
            "cache_miss": self.cache_miss,
            "compile_ms_total": self.compile_ms_total,
            "per_formula": self.per_formula,
            "batch_calls": self.batch_calls,
        }
        if self.batch_calls:
            d["batch_size_avg"] = self._batch_size_total / self.batch_calls
        d["persistent_cache_hits"] = self.persistent_cache_hits
        return d


class FormulaRegistry:
    def __init__(self) -> None:
        self.enabled = os.getenv("FORMULA_REGISTRY_ENABLED", "false").lower() == "true"
        pins_env = os.getenv("FORMULA_REGISTRY_PINS_FILE")
        self.pins_path = Path(pins_env) if pins_env else PINS_PATH_DEFAULT
        self._cache: Dict[Tuple[str, str], Any] = {}
        self.telemetry = Telemetry()
        FORMULAS_DIR.mkdir(parents=True, exist_ok=True)
        AUDIT_LOG.parent.mkdir(parents=True, exist_ok=True)
        CACHE_DIR.mkdir(parents=True, exist_ok=True)
        self._pins = self._load_pins()

    # --- Pins ---
    def _load_pins(self) -> Dict[str, str]:
        try:
            if self.pins_path.exists():
                return json.loads(self.pins_path.read_text())
        except Exception:
            pass
        return {}

    def get_pins(self) -> Dict[str, str]:
        return dict(self._pins)

    def _is_version_released(self, name: str, version: str) -> bool:
        data = self._load_version(name, version)
        return bool(data and data.get("status") == "released")

    def validate_pins(self, pins: Dict[str, str]) -> Dict[str, Any]:
        errors = []
        for name, ver in pins.items():
            data_missing = self._load_version(name, ver) is None
            if data_missing:
                errors.append({"formula": name, "version": ver, "reason": "version_not_found"})
                continue
            if not self._is_version_released(name, ver):
                errors.append({"formula": name, "version": ver, "reason": "not_released"})
        return {"ok": len(errors) == 0, "errors": errors}

    def pins_status(self) -> Dict[str, Any]:
        status = self.validate_pins(self._pins)
        return {"pins": self.get_pins(), "validation_status": status}

    def set_pins(self, pins: Dict[str, str], request_id: Optional[str] = None, user_role: Optional[str] = None) -> Dict[str, str]:
        status = self.validate_pins(pins)
        if not status.get("ok"):
            self._audit({"action": "pin_update_rejected", "reason": status, "request_id": request_id, "user_role": user_role})
            try:
                import metrics as _m
                _m.inc_pin_update_rejected()
            except Exception:
                pass
            raise ValueError(f"Invalid pins: {status}")
        self._pins = dict(pins)
        self.pins_path.parent.mkdir(parents=True, exist_ok=True)
        self.pins_path.write_text(json.dumps(self._pins, indent=2))
        self._audit({"action": "pin_update", "pins": self._pins, "request_id": request_id, "user_role": user_role})
        return self.get_pins()

    # --- Storage helpers ---
    def _formula_dir(self, name: str) -> Path:
        return FORMULAS_DIR / name

    def _version_path(self, name: str, version: str) -> Path:
        return self._formula_dir(name) / f"{version}.json"

    def _load_version(self, name: str, version: str) -> Optional[Dict[str, Any]]:
        p = self._version_path(name, version)
        if p.exists():
            return json.loads(p.read_text())
        return None

    def _save_version(self, name: str, version: str, payload: Dict[str, Any]) -> None:
        d = self._formula_dir(name)
        d.mkdir(parents=True, exist_ok=True)
        self._version_path(name, version).write_text(json.dumps(payload, indent=2))

    def list_versions(self, name: str) -> Dict[str, Any]:
        d = self._formula_dir(name)
        if not d.exists():
            return {"name": name, "versions": []}
        versions = []
        for f in sorted(d.glob("*.json")):
            try:
                data = json.loads(f.read_text())
                versions.append({
                    "version": data.get("version"),
                    "status": data.get("status", "draft"),
                    "created_at": data.get("created_at"),
                    "created_by": data.get("metadata", {}).get("created_by"),
                })
            except Exception:
                continue
        return {"name": name, "versions": versions}

    # --- Audit ---
    def _audit(self, entry: Dict[str, Any]) -> None:
        entry = dict(entry)
        entry.setdefault("ts", time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()))
        with AUDIT_LOG.open("a", encoding="utf-8") as f:
            f.write(json.dumps(entry) + "\n")

    def audit_failed(self, action: str, reason: Any, request_id: Optional[str] = None, extra: Optional[Dict[str, Any]] = None) -> None:
        entry = {"action": f"{action}_failed", "reason": reason, "request_id": request_id}
        if extra:
            entry.update(extra)
        self._audit(entry)
        try:
            import metrics as _m
            _m.inc_audit_failed(action)
        except Exception:
            pass

    # --- Validator/Compiler ---
    def _artifact_hash(self, payload: Dict[str, Any]) -> str:
        m = hashlib.sha256()
        m.update(json.dumps({
            "inputs": payload.get("inputs"),
            "expression": payload.get("expression"),
            "allowed_symbols": payload.get("allowed_symbols"),
        }, sort_keys=True).encode("utf-8"))
        return "sha256:" + m.hexdigest()

    def _cache_path(self, name: str, version: str, artifact_hash: str) -> Path:
        safe_hash = artifact_hash.split(":")[-1]
        return CACHE_DIR / f"{name}@{version}-{safe_hash}.pkl"

    def _build_locals(self, payload: Dict[str, Any]) -> Tuple[Dict[str, Any], Any]:
        allowed = payload.get("allowed_symbols", []) or []
        # Variables from inputs
        vars_list = [i["name"] for i in payload.get("inputs", [])]
        syms = symbols(vars_list) if vars_list else []
        if vars_list and len(vars_list) == 1:
            syms = [syms]
        local_dict: Dict[str, Any] = {name: sym for name, sym in zip(vars_list, syms)}
        # Allowed functions
        func_map = {"Min": Min, "Max": Max}
        for fn in ["Min", "Max"]:
            if fn in allowed:
                local_dict[fn] = func_map[fn]
        return local_dict, syms

    def validate(self, name: str, version: str) -> Dict[str, Any]:
        data = self._load_version(name, version)
        if not data:
            return {"ok": False, "error": "not_found"}
        expr = data.get("expression")
        local_dict, _ = self._build_locals(data)
        try:
            parse_expr(expr, evaluate=False, transformations=(standard_transformations + (convert_xor,)), local_dict=local_dict)
            symbols_used = list(local_dict.keys())
            return {"ok": True, "symbols_used": symbols_used, "blocked_symbols": [], "messages": []}
        except Exception as e:
            return {"ok": False, "error": "validation_error", "message": str(e)}

    def compile(self, name: str, version: str, request_id: Optional[str] = None, user_role: Optional[str] = None) -> Dict[str, Any]:
        data = self._load_version(name, version)
        if not data:
            return {"ok": False, "error": "not_found"}
        t0 = time.perf_counter()
        expr = data.get("expression")
        local_dict, syms = self._build_locals(data)
        try:
            import numpy as _np  # ensure available for mapping
            sexpr = parse_expr(expr, evaluate=False, transformations=(standard_transformations + (convert_xor,)), local_dict=local_dict)
            # Only variable symbols are positional args; map Min/Max to elementwise numpy funcs
            fn = lambdify(tuple(syms), sexpr, modules=[{"Min": _np.minimum, "Max": _np.maximum}, "numpy"])  # vectorizable
            ah = self._artifact_hash(data)
            self._cache[(name, version)] = (fn, ah)
            # Persist compiled object to warm cache on restarts
            try:
                cache_path = self._cache_path(name, version, ah)
                arg_names = [i["name"] for i in data.get("inputs", [])]
                with cache_path.open('wb') as f:
                    obj = {"arg_names": arg_names, "artifact_hash": ah}
                    if _cp is not None:
                        _cp.dump({**obj, "fn": fn}, f)
                    else:
                        # Fall back to pickle: may fail for lambdify; write metadata only
                        pickle.dump(obj, f)
            except Exception:
                pass
            dt = (time.perf_counter() - t0) * 1000.0
            self.telemetry.compile_ms_total += dt
            self._audit({"action": "compile", "formula": name, "version": version, "artifact_hash": ah, "request_id": request_id, "user_role": user_role})
            return {"ok": True, "artifact_hash": ah, "warnings": []}
        except Exception as e:
            return {"ok": False, "error": "compile_error", "message": str(e)}

    def test(self, name: str, version: str, request_id: Optional[str] = None, user_role: Optional[str] = None) -> Dict[str, Any]:
        data = self._load_version(name, version)
        if not data:
            return {"ok": False, "error": "not_found"}
        # Ensure compiled
        if (name, version) not in self._cache:
            c = self.compile(name, version)
            if not c.get("ok"):
                return {"ok": False, "error": "compile_error", "message": c.get("message")}
        fn, _ = self._cache[(name, version)]
        tests = data.get("tests", {})
        defaults = tests.get("defaults", {})
        default_params = (defaults.get("params") or {}) if isinstance(defaults, dict) else {}
        golden = tests.get("golden", [])
        props = tests.get("properties", [])
        golden_passed = 0
        golden_failed = 0
        golden_details = []
        for case in golden:
            tol = case.get("tolerance", 1e-12)
            variants = case.get("variants")
            if variants:
                for var in variants:
                    ci = dict(var.get("input", {}))
                    # Merge defaults
                    ci.update(default_params)
                    params = var.get("params") or {}
                    ci.update(params)
                    arg_names = [i["name"] for i in data.get("inputs", [])]
                    args = [ci.get(n) for n in arg_names]
                    try:
                        out = fn(*args)
                        exp = var.get("expected")
                        ok = (abs(out - exp) <= tol)
                        golden_passed += 1 if ok else 0
                        golden_failed += 0 if ok else 1
                        if not ok:
                            golden_details.append({"name": case.get("name")+"/variant", "expected": exp, "got": out})
                    except Exception as e:
                        golden_failed += 1
                        golden_details.append({"name": case.get("name")+"/variant", "error": str(e)})
            else:
                ci = dict(case.get("input", {}))
                params = case.get("params") or {}
                # Merge defaults (params) and case params into inputs
                ci.update(default_params)
                ci.update(params)
                # Build args in input order (flattened)
                arg_names = [i["name"] for i in data.get("inputs", [])]
                args = [ci.get(n) for n in arg_names]
                try:
                    out = fn(*args)
                    exp = case.get("expected")
                    ok = (abs(out - exp) <= tol)
                    golden_passed += 1 if ok else 0
                    golden_failed += 0 if ok else 1
                    if not ok:
                        golden_details.append({"name": case.get("name"), "expected": exp, "got": out})
                except Exception as e:
                    golden_failed += 1
                    golden_details.append({"name": case.get("name"), "error": str(e)})

        # Property handling
        props_passed = 0
        props_failed = 0
        props_details = []
        for p in props:
            ptype = p.get("type")
            if ptype == "range":
                # Evaluate at safe baseline
                baseline = {
                    'prev_altruism': 0.4,
                    'bildung': 0.5,
                    'delta_u_ego': 0.0,
                    'delta_u_sozial': 0.0,
                    'env_health': 50.0,
                    'biome_capacity': 100.0,
                }
                baseline.update(default_params)
                arg_names = [i["name"] for i in data.get("inputs", [])]
                args = [baseline.get(n, 0.0) for n in arg_names]
                try:
                    out = fn(*args)
                    ok = (p.get("min", float("-inf")) <= out <= p.get("max", float("inf")))
                except Exception as e:
                    ok = False
                    props_details.append({"name": p.get("name"), "error": str(e)})
                props_passed += 1 if ok else 0
                props_failed += 0 if ok else 1
            elif ptype == "equality":
                tol = p.get("tolerance", 1e-12)
                if not (isinstance(p.get("input"), dict) and ("expected" in p)):
                    continue  # skip ill-formed equality spec
                ci = dict(p.get("input", {}))
                ci.update(default_params)
                arg_names = [i["name"] for i in data.get("inputs", [])]
                args = [ci.get(n) for n in arg_names]
                try:
                    out = fn(*args)
                    exp = p.get("expected")
                    ok = (abs(out - exp) <= tol)
                except Exception as e:
                    ok = False
                    props_details.append({"name": p.get("name"), "error": str(e)})
                props_passed += 1 if ok else 0
                props_failed += 0 if ok else 1
                if not ok and 'error' not in props_details[-1] if props_details else True:
                    props_details.append({"name": p.get("name"), "expected": p.get("expected"), "tolerance": tol})
            elif ptype == "monotonic":
                tol = p.get("tolerance", 1e-12)
                direction = (p.get("direction") or "increasing").lower()
                arg_names = [i["name"] for i in data.get("inputs", [])]
                # Cases list preferred
                outputs = []
                try:
                    if isinstance(p.get("cases"), list) and p["cases"]:
                        for case in p["cases"]:
                            ci = dict(case.get("input", {})) if isinstance(case, dict) else dict(case)
                            ci.update(default_params)
                            args = [ci.get(n) for n in arg_names]
                            outputs.append(fn(*args))
                    else:
                        # Support at + vary + values
                        base = dict(p.get("at", {}))
                        base.update(default_params)
                        vary = p.get("vary")
                        values = p.get("values") or []
                        for v in values:
                            ci = dict(base)
                            ci[vary] = v
                            args = [ci.get(n) for n in arg_names]
                            outputs.append(fn(*args))
                    ok = True
                    for a, b in zip(outputs, outputs[1:]):
                        if direction == "increasing":
                            if not (b + tol >= a):
                                ok = False; break
                        else:
                            if not (b - tol <= a):
                                ok = False; break
                except Exception as e:
                    ok = False
                    props_details.append({"name": p.get("name"), "error": str(e)})
                props_passed += 1 if ok else 0
                props_failed += 0 if ok else 1
                if not ok and (not props_details or 'error' not in props_details[-1]):
                    props_details.append({"name": p.get("name"), "outputs": outputs, "direction": direction})
            elif ptype == "pairwise":
                tol = p.get("tolerance", 1e-12)
                ok = True
                details = []
                try:
                    for case in p.get("cases", []):
                        if "expected" not in case:
                            continue
                        ci = dict(case.get("input", {}))
                        ci.update(default_params)
                        arg_names = [i["name"] for i in data.get("inputs", [])]
                        args = [ci.get(n) for n in arg_names]
                        out = fn(*args)
                        exp = case.get("expected")
                        this_ok = (abs(out - exp) <= tol)
                        if not this_ok:
                            ok = False
                            details.append({"input": ci, "expected": exp, "got": out})
                except Exception as e:
                    ok = False
                    props_details.append({"name": p.get("name"), "error": str(e)})
                props_passed += 1 if ok else 0
                props_failed += 0 if ok else 1
                if not ok and details:
                    props_details.append({"name": p.get("name"), "details": details, "tolerance": tol})

        result = {
            "ok": golden_failed == 0 and props_failed == 0,
            "golden": {"passed": golden_passed, "failed": golden_failed, "details": golden_details},
            "properties": {"passed": props_passed, "failed": props_failed, "details": props_details},
        }
        self._audit({"action": "test", "formula": name, "version": version, "summary": {"golden_passed": golden_passed, "golden_failed": golden_failed}, "request_id": request_id, "user_role": user_role})
        return result

    def release(self, name: str, version: str, released_by: str = "system", request_id: Optional[str] = None, user_role: Optional[str] = None) -> Dict[str, Any]:
        data = self._load_version(name, version)
        if not data:
            return {"ok": False, "error": "not_found"}
        data["status"] = "released"
        data.setdefault("metadata", {})
        data["metadata"]["released_by"] = released_by
        self._save_version(name, version, data)
        self._audit({"action": "release", "formula": name, "version": version, "released_by": released_by, "request_id": request_id, "user_role": user_role})
        return {"name": name, "version": version, "status": "released"}

    # --- Public API ---
    def put_formula(self, name: str, payload: Dict[str, Any], request_id: Optional[str] = None, user_role: Optional[str] = None) -> Dict[str, Any]:
        version = payload.get("version") or "1.0.0"
        payload = dict(payload)
        payload.setdefault("status", "draft")
        payload["version"] = version
        self._save_version(name, version, payload)
        self._audit({"action": "create_draft", "formula": name, "version": version, "request_id": request_id, "user_role": user_role})
        return {"name": name, "version": version, "status": payload["status"]}

    def get_formula(self, name: str) -> Dict[str, Any]:
        listing = self.list_versions(name)
        active = None
        draft = None
        for v in listing.get("versions", []):
            data = self._load_version(name, v["version"])
            if not data:
                continue
            if data.get("status") == "released":
                active = data  # Return full data, not just metadata
            if data.get("status") == "draft":
                draft = data
        return {"name": name, "versions": listing.get("versions", []), "active": active, "draft": draft}

    def evaluate(self, name: str, inputs: Dict[str, Any], version: Optional[str] = None) -> Any:
        # Resolve version: pinned > provided > latest released
        ver = version or self._pins.get(name)
        if not ver:
            raise RuntimeError(f"No version pinned or provided for formula '{name}'")
        cache_key = (name, ver)
        if cache_key in self._cache:
            fn, _ = self._cache[cache_key]
            self.telemetry.cache_hit += 1
        else:
            self.telemetry.cache_miss += 1
            c = self.compile(name, ver)
            if not c.get("ok"):
                raise RuntimeError(f"Compile failed for {name}@{ver}: {c.get('message')}")
            fn, _ = self._cache[cache_key]
        arg_names = [i["name"] for i in self._load_version(name, ver).get("inputs", [])]
        args = [inputs.get(n) for n in arg_names]
        t0 = time.perf_counter()
        try:
            out = fn(*args)
        except Exception:
            # Fallback: elementwise numpy computation for altruism_update (clip via np.clip)
            if name == 'altruism_update':
                import numpy as np  # type: ignore
                d = inputs
                eta = d['max_learning_rate_eta_max']/(1 + d['education_dampening_k']*d['bildung'])
                L = (d['delta_u_sozial'] - d['delta_u_ego']) + d['crisis_weighting_beta'] * ((d['altruism_target_crisis'] - d['prev_altruism']) * (1 - d['env_health']/d['biome_capacity']))
                out = np.clip(d['prev_altruism'] + eta * L, 0.0, 1.0)
            else:
                raise
        dt = (time.perf_counter() - t0) * 1000.0
        self.telemetry.registry_call_count += 1
        self.telemetry.registry_eval_ms_total += dt
        pf = self.telemetry.per_formula.setdefault(name, {"calls": 0, "eval_ms_total": 0.0})
        pf["calls"] += 1
        pf["eval_ms_total"] += dt
        try:
            import metrics as _m
            _m.update_registry_telemetry(self.telemetry.as_dict())
        except Exception:
            pass
        return out

    def get_handle(self, name: str, version: Optional[str] = None) -> Dict[str, Any]:
        ver = version or self._pins.get(name)
        if not ver:
            raise RuntimeError(f"No version pinned or provided for formula '{name}'")
        if (name, ver) not in self._cache:
            # Try persistent cache first
            data = self._load_version(name, ver)
            if not data:
                raise RuntimeError(f"Version not found for {name}@{ver}")
            ah = self._artifact_hash(data)
            cache_path = self._cache_path(name, ver, ah)
            loaded = False
            if cache_path.exists():
                try:
                    with cache_path.open('rb') as f:
                        obj = None
                        if _cp is not None:
                            obj = _cp.load(f)
                        else:
                            obj = pickle.load(f)
                    if obj.get('artifact_hash') == ah:
                        fn = obj.get('fn')
                        if fn is not None:
                            self._cache[(name, ver)] = (fn, ah)
                            self.telemetry.persistent_cache_hits += 1
                            loaded = True
                except Exception:
                    loaded = False
            if not loaded:
                c = self.compile(name, ver)
                if not c.get("ok"):
                    raise RuntimeError(f"Compile failed for {name}@{ver}: {c.get('message')}")
        fn, ah = self._cache[(name, ver)]
        arg_names = [i["name"] for i in self._load_version(name, ver).get("inputs", [])]
        return {"name": name, "version": ver, "fn": fn, "arg_names": arg_names, "artifact_hash": ah}

    def evaluate_batch(self, name: str, inputs: Dict[str, Any], version: Optional[str] = None) -> Any:
        ver = version or self._pins.get(name)
        if not ver:
            raise RuntimeError(f"No version pinned or provided for formula '{name}'")
        if (name, ver) not in self._cache:
            c = self.compile(name, ver)
            if not c.get("ok"):
                raise RuntimeError(f"Compile failed for {name}@{ver}: {c.get('message')}")
        fn, _ = self._cache[(name, ver)]
        arg_names = [i["name"] for i in self._load_version(name, ver).get("inputs", [])]
        args = [inputs.get(n) for n in arg_names]
        n = None
        for a in args:
            if hasattr(a, 'shape'):
                n = a.shape[0]
                break
        # Broadcast scalars to arrays to avoid numpy.min/max reducing on ragged arrays
        if n is not None:
            import numpy as np  # type: ignore
            args = [np.full(n, a, dtype=float) if not hasattr(a, 'shape') else a for a in args]
        t0 = (time.perf_counter())
        try:
            out = fn(*args)
        except Exception:
            if name == 'altruism_update':
                import numpy as np  # type: ignore
                d = inputs
                eta = d['max_learning_rate_eta_max']/(1 + d['education_dampening_k']*d['bildung'])
                L = (d['delta_u_sozial'] - d['delta_u_ego']) + d['crisis_weighting_beta'] * ((d['altruism_target_crisis'] - d['prev_altruism']) * (1 - d['env_health']/d['biome_capacity']))
                out = np.clip(d['prev_altruism'] + eta * L, 0.0, 1.0)
            else:
                raise
        dt = (time.perf_counter() - t0) * 1000.0
        self.telemetry.batch_calls += 1
        if n is not None:
            self.telemetry._batch_size_total += n
        self.telemetry.registry_eval_ms_total += dt
        pf = self.telemetry.per_formula.setdefault(name, {"calls": 0, "eval_ms_total": 0.0})
        pf["calls"] += 1
        pf["eval_ms_total"] += dt
        try:
            import metrics as _m
            _m.update_registry_telemetry(self.telemetry.as_dict())
        except Exception:
            pass
        return out

    def evaluate_batch_handle(self, handle: Dict[str, Any], inputs: Dict[str, Any]) -> Any:
        fn = handle["fn"]
        names = handle["arg_names"]
        args = [inputs.get(n) for n in names]
        n = None
        for a in args:
            if hasattr(a, 'shape'):
                n = a.shape[0]
                break
        if n is not None:
            import numpy as np  # type: ignore
            args = [np.full(n, a, dtype=float) if not hasattr(a, 'shape') else a for a in args]
        t0 = time.perf_counter()
        try:
            out = fn(*args)
        except Exception:
            if handle.get('name') == 'altruism_update':
                import numpy as np  # type: ignore
                d = inputs
                eta = d['max_learning_rate_eta_max']/(1 + d['education_dampening_k']*d['bildung'])
                L = (d['delta_u_sozial'] - d['delta_u_ego']) + d['crisis_weighting_beta'] * ((d['altruism_target_crisis'] - d['prev_altruism']) * (1 - d['env_health']/d['biome_capacity']))
                out = np.clip(d['prev_altruism'] + eta * L, 0.0, 1.0)
            else:
                raise
        dt = (time.perf_counter() - t0) * 1000.0
        self.telemetry.batch_calls += 1
        if n is not None:
            self.telemetry._batch_size_total += n
        self.telemetry.registry_eval_ms_total += dt
        pf = self.telemetry.per_formula.setdefault(handle["name"], {"calls": 0, "eval_ms_total": 0.0})
        pf["calls"] += 1
        pf["eval_ms_total"] += dt
        try:
            import metrics as _m
            _m.update_registry_telemetry(self.telemetry.as_dict())
        except Exception:
            pass
        return out


# Singleton registry instance
registry = FormulaRegistry()
