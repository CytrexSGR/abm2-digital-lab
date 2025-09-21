import uvicorn
import asyncio
import os
import json
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException, Body, Query, Request, Depends
import uuid
from fastapi.responses import FileResponse, Response
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional, Any, Dict
from pydantic import BaseModel
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Import application modules
from simulation_manager import manager as simulation_manager
from connection_manager import manager as connection_manager
from config.manager import manager as config_manager
from formula_registry import registry as formula_registry
from config.models import FullConfig
from metrics import export_prometheus, CONTENT_TYPE as METRICS_CONTENT_TYPE
from authz import check_role
from simple_auth import authenticate_user, get_current_user_info

# --- FastAPI App Initialization and CORS ---
app = FastAPI()

# Read allowed origins from environment variable, default to localhost
allowed_origins_str = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000")
origins = [origin.strip() for origin in allowed_origins_str.split(',')]

print(f"CORS enabled for the following origins: {origins}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Presets Directory Setup ---
PRESETS_DIR = Path(__file__).parent / "presets"
PRESETS_DIR.mkdir(exist_ok=True)

# --- Background Tasks ---
async def ping_clients():
    while True:
        await asyncio.sleep(5)
        await connection_manager.broadcast({"message": "ping"})

@app.on_event("startup")
async def startup_event():
    if simulation_manager and simulation_manager.model:
        print("SimulationManager is available to the application.")
    else:
        print("CRITICAL: SimulationManager failed to initialize.")
    asyncio.create_task(ping_clients())

# --- API Endpoints ---

@app.get("/api/health")
async def health_check():
    return {"status": "ok", "registry_enabled": formula_registry.enabled}

@app.get("/metrics")
async def metrics_endpoint():
    return Response(content=export_prometheus(), media_type=METRICS_CONTENT_TYPE)

@app.get("/api/registry/health")
async def registry_health():
    pins_status = formula_registry.pins_status()
    return {
        "status": "ok",
        "enabled": formula_registry.enabled,
        "schema_version": "v1",
        "whitelist": ["+", "-", "*", "/", "Min", "Max"],
        "pins_valid": bool(pins_status.get("validation_status", {}).get("ok", False))
    }

# --- Audit API ---
@app.get("/api/audit")
async def get_audit(request: Request, limit: int = 100, offset: int = 0, action: str | None = None, formula: str | None = None, version: str | None = None, since: str | None = None, until: str | None = None):
    user_role = request.headers.get('X-User-Role', '')
    ok, reason = check_role(user_role, ["auditor","operator","approver"])
    req_id = str(uuid.uuid4())
    if not ok:
        formula_registry.audit_failed('authz', reason, request_id=req_id, extra={"endpoint": "get_audit", "user_role": user_role})
        raise HTTPException(status_code=403, detail={"request_id": req_id, "error": "forbidden", "reason": reason})
    path = Path(__file__).parent / 'data' / 'audit.jsonl'
    items = []
    if path.exists():
        lines = path.read_text(encoding='utf-8').splitlines()
        def parse_ts(s):
            import datetime as _dt
            try:
                return _dt.datetime.fromisoformat(s.replace('Z','+00:00'))
            except Exception:
                return None
        since_dt = parse_ts(since) if since else None
        until_dt = parse_ts(until) if until else None
        filtered = []
        for ln in lines:
            try:
                obj = json.loads(ln)
            except Exception:
                continue
            if action and obj.get('action') != action:
                continue
            if formula and obj.get('formula') != formula:
                continue
            if version and obj.get('version') != version:
                continue
            ts = parse_ts(obj.get('ts',''))
            if since_dt and ts and ts < since_dt:
                continue
            if until_dt and ts and ts > until_dt:
                continue
            filtered.append(obj)
        total_estimate = len(filtered)
        slice_ = filtered[offset:offset+limit]
        next_offset = offset + len(slice_) if (offset+len(slice_)) < total_estimate else None
        return {"items": slice_, "next_offset": next_offset, "total_estimate": total_estimate}
    return {"items": [], "next_offset": None, "total_estimate": 0}

@app.post("/api/audit/mark")
async def audit_mark(request: Request, payload: dict = Body()):
    user_role = request.headers.get('X-User-Role', '')
    ok, reason = check_role(user_role, ["operator","approver"])
    req_id = str(uuid.uuid4())
    if not ok:
        formula_registry.audit_failed('authz', reason, request_id=req_id, extra={"endpoint": "audit_mark", "user_role": user_role})
        raise HTTPException(status_code=403, detail={"request_id": req_id, "error": "forbidden", "reason": reason})
    action = payload.get('action') or 'custom'
    info = {k:v for k,v in payload.items() if k != 'action'}
    formula_registry._audit({"action": action, **info, "request_id": req_id, "user_role": user_role})
    return {"ok": True, "request_id": req_id}

class ResetPayload(BaseModel):
    num_agents: int = 100
    network_connections: int = 5

@app.post("/api/simulation/reset")
async def reset_simulation(payload: ResetPayload, user: dict = Depends(get_current_user_info)):
    """Resets the simulation and returns the initial state."""
    simulation_manager.reset_model(
        num_agents=payload.num_agents,
        network_connections=payload.network_connections
    )
    # NEU: Gebe den initialen Zustand direkt zurück
    initial_data = simulation_manager.get_model_data()
    if initial_data:
        # Optional: Sende den ersten Zustand auch per WebSocket
        await connection_manager.broadcast(initial_data)
        return initial_data
    raise HTTPException(status_code=500, detail="Failed to create initial model state.")

@app.post("/api/simulation/step")
async def step_simulation(user: dict = Depends(get_current_user_info)):
    """Advances the simulation by one step and broadcasts the new state."""
    new_data = simulation_manager.step_model()
    if new_data:
        await connection_manager.broadcast(new_data)
        return {"message": f"Simulation advanced to step {new_data.get('step', -1)}."}
    raise HTTPException(status_code=500, detail="Simulation model not available.")

@app.get("/api/simulation/data")
async def get_simulation_data():
    """Gets the current state of the simulation without advancing it."""
    data = simulation_manager.get_model_data()
    if data:
        return data
    raise HTTPException(status_code=500, detail="Simulation model not available.")

# --- Recording Management Endpoints ---

@app.post("/api/recording/start")
async def start_recording(payload: dict):
    """Start recording simulation data to CSV file."""
    if not simulation_manager.model:
        raise HTTPException(status_code=500, detail="Simulation model not available.")
    
    preset_name = payload.get("preset_name", "run")
    simulation_manager.model.start_recording(preset_name)
    return {"message": "Recording started."}

@app.post("/api/recording/stop")
async def stop_recording():
    """Stop recording simulation data."""
    if not simulation_manager.model:
        raise HTTPException(status_code=500, detail="Simulation model not available.")
    
    simulation_manager.model.stop_recording()
    return {"message": "Recording stopped."}

@app.get("/api/recordings")
async def list_recordings():
    """List all available recording files."""
    recordings_dir = Path(__file__).parent / "recordings"
    if not recordings_dir.exists():
        return []
    
    recordings = []
    for csv_file in recordings_dir.glob("*.csv"):
        # Get file stats for additional info
        stat = csv_file.stat()
        recordings.append({
            "filename": csv_file.name,
            "size": stat.st_size,
            "modified": stat.st_mtime
        })
    
    # Sort by modification time (newest first)
    recordings.sort(key=lambda x: x["modified"], reverse=True)
    return recordings

@app.get("/api/recordings/{filename}")
async def download_recording(filename: str):
    """Download a specific recording file."""
    # Sanitize filename to prevent directory traversal
    if not filename.endswith('.csv') or '/' in filename or '\\' in filename:
        raise HTTPException(status_code=400, detail="Invalid filename.")
    
    recordings_dir = Path(__file__).parent / "recordings"
    file_path = recordings_dir / filename
    
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Recording file not found.")
    
    return FileResponse(
        path=str(file_path),
        filename=filename,
        media_type='text/csv'
    )

# --- Formula Registry Endpoints ---

@app.get("/api/registry/health")
async def registry_health():
    pins_status = formula_registry.pins_status()
    return {
        "status": "ok",
        "enabled": formula_registry.enabled,
        "schema_version": "v1",
        "whitelist": ["+", "-", "*", "/", "Min", "Max"],
        "pins_valid": bool(pins_status.get("validation_status", {}).get("ok", False))
    }

@app.get("/api/formulas")
async def list_formulas():
    """Returns a list of all available formulas"""
    try:
        formulas_dir = Path(__file__).parent / "data" / "formulas"
        if not formulas_dir.exists():
            return {"formulas": []}
        
        formulas = []
        for formula_dir in formulas_dir.iterdir():
            if formula_dir.is_dir():
                formulas.append({
                    "name": formula_dir.name,
                    "display_name": formula_dir.name.replace("_", " ").title()
                })
        
        return {"formulas": sorted(formulas, key=lambda x: x["name"])}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error listing formulas: {e}")

@app.get("/api/formulas/{name}")
async def get_formula(name: str):
    data = formula_registry.get_formula(name)
    if not data.get("versions"):
        raise HTTPException(status_code=404, detail="Formula not found")
    return data

@app.put("/api/formulas/{name}")
async def put_formula(name: str, payload: dict = Body(), request: Request = None):
    from authz import check_role
    user_role = request.headers.get('X-User-Role', '') if request else ''
    ok, reason = check_role(user_role, ["editor"])
    req_id = str(uuid.uuid4())
    if not ok:
        formula_registry.audit_failed('authz', reason, request_id=req_id, extra={"endpoint": "put_formula", "formula": name, "user_role": user_role})
        raise HTTPException(status_code=403, detail={"request_id": req_id, "error": "forbidden", "reason": reason})
    try:
        return formula_registry.put_formula(name, payload, request_id=req_id, user_role=user_role)
    except Exception as e:
        formula_registry.audit_failed('create_draft', str(e), request_id=req_id, extra={"formula": name, "user_role": user_role})
        raise HTTPException(status_code=422, detail={"request_id": req_id, "error": str(e)})

@app.post("/api/validate")
async def validate_formula(payload: dict = Body(), request: Request = None):
    name = payload.get("name"); version = payload.get("version")
    user_role = request.headers.get('X-User-Role', '') if request else ''
    ok, reason = __import__('authz').authz.check_role(user_role, ["editor"]) if False else (True, {})
    # direct import workaround
    from authz import check_role
    ok, reason = check_role(user_role, ["editor"])
    req_id = str(uuid.uuid4())
    if not ok:
        formula_registry.audit_failed('authz', reason, request_id=req_id, extra={"endpoint": "validate", "formula": name, "version": version, "user_role": user_role})
        raise HTTPException(status_code=403, detail={"request_id": req_id, "error": "forbidden", "reason": reason})
    result = formula_registry.validate(name, version)
    if not result.get("ok"):
        formula_registry.audit_failed('validate', result, request_id=req_id, extra={"formula": name, "version": version, "user_role": user_role})
        raise HTTPException(status_code=422, detail={"request_id": req_id, **result})
    # audit success
    formula_registry._audit({"action": "validate", "formula": name, "version": version, "request_id": req_id, "user_role": user_role})
    return result

@app.post("/api/compile")
async def compile_formula(payload: dict = Body(), request: Request = None):
    name = payload.get("name"); version = payload.get("version")
    user_role = request.headers.get('X-User-Role', '') if request else ''
    from authz import check_role
    ok, reason = check_role(user_role, ["editor"])
    req_id = str(uuid.uuid4())
    if not ok:
        formula_registry.audit_failed('authz', reason, request_id=req_id, extra={"endpoint": "compile", "formula": name, "version": version, "user_role": user_role})
        raise HTTPException(status_code=403, detail={"request_id": req_id, "error": "forbidden", "reason": reason})
    result = formula_registry.compile(name, version, request_id=req_id, user_role=user_role)
    if not result.get("ok"):
        formula_registry.audit_failed('compile', result, request_id=req_id, extra={"formula": name, "version": version, "user_role": user_role})
        raise HTTPException(status_code=422, detail={"request_id": req_id, **result})
    return result

@app.post("/api/test")
async def test_formula(payload: dict = Body(), request: Request = None):
    name = payload.get("name"); version = payload.get("version")
    user_role = request.headers.get('X-User-Role', '') if request else ''
    from authz import check_role
    ok, reason = check_role(user_role, ["editor"])
    req_id = str(uuid.uuid4())
    if not ok:
        formula_registry.audit_failed('authz', reason, request_id=req_id, extra={"endpoint": "test", "formula": name, "version": version, "user_role": user_role})
        raise HTTPException(status_code=403, detail={"request_id": req_id, "error": "forbidden", "reason": reason})
    result = formula_registry.test(name, version, request_id=req_id, user_role=user_role)
    if not result.get("ok"):
        formula_registry.audit_failed('test', result, request_id=req_id, extra={"formula": name, "version": version, "user_role": user_role})
        raise HTTPException(status_code=422, detail={"request_id": req_id, **result})
    return result

@app.post("/api/release")
async def release_formula(payload: dict = Body(), request: Request = None):
    name = payload.get("name"); version = payload.get("version")
    by = payload.get("released_by", "api")
    user_role = request.headers.get('X-User-Role', '') if request else ''
    from authz import check_role
    ok, reason = check_role(user_role, ["approver"])
    req_id = str(uuid.uuid4())
    if not ok:
        formula_registry.audit_failed('authz', reason, request_id=req_id, extra={"endpoint": "release", "formula": name, "version": version, "user_role": user_role})
        raise HTTPException(status_code=403, detail={"request_id": req_id, "error": "forbidden", "reason": reason})
    result = formula_registry.release(name, version, released_by=by, request_id=req_id, user_role=user_role)
    if not result.get("status") == "released":
        formula_registry.audit_failed('release', result, request_id=req_id, extra={"formula": name, "version": version, "user_role": user_role})
        raise HTTPException(status_code=422, detail={"request_id": req_id, **result})
    return result

@app.get("/api/versions/{name}")
async def list_versions(name: str):
    data = formula_registry.list_versions(name)
    if not data.get("versions"):
        raise HTTPException(status_code=404, detail="Formula not found")
    return data

@app.get("/api/pins")
async def get_pins():
    status = formula_registry.pins_status()
    return {**status, "path": str(formula_registry.pins_path)}

@app.put("/api/pins")
async def put_pins(payload: dict = Body(), request: Request = None):
    pins = payload.get("pins")
    if not isinstance(pins, dict):
        raise HTTPException(status_code=400, detail="pins must be a mapping")
    try:
        user_role = request.headers.get('X-User-Role', '') if request else ''
        from authz import check_role
        ok, reason = check_role(user_role, ["operator"])
        req_id = str(uuid.uuid4())
        if not ok:
            formula_registry.audit_failed('authz', reason, request_id=req_id, extra={"endpoint": "put_pins", "user_role": user_role})
            raise HTTPException(status_code=403, detail={"request_id": req_id, "error": "forbidden", "reason": reason})
        applied = formula_registry.set_pins(pins, request_id=req_id, user_role=user_role)
        return {"ok": True, "applied": applied}
    except Exception as e:
        # Differentiate validation vs. other errors
        req_id = str(uuid.uuid4())
        formula_registry.audit_failed('pin_update', str(e), request_id=req_id, extra={"pins": pins, "user_role": request.headers.get('X-User-Role', '') if request else ''})
        raise HTTPException(status_code=400, detail={"request_id": req_id, "error": str(e)})

# --- Config Management Endpoints ---

@app.get("/api/config", response_model=FullConfig)
async def get_config():
    """Retrieves the current simulation configuration."""
    try:
        return config_manager.get_config()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error reading config: {e}")

@app.post("/api/config")
async def save_config(config_data: FullConfig, user: dict = Depends(get_current_user_info)):
    """Updates and saves the simulation configuration."""
    try:
        config_manager.save_config(config_data)
        return {"message": "Configuration saved successfully."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error saving config: {e}")

@app.patch("/api/config")
async def patch_config(partial_config: dict, user: dict = Depends(get_current_user_info)):
    """Updates a part of the simulation configuration."""
    try:
        current_config = config_manager.get_config()
        # Deep merge the partial config into the current config
        current_dict = current_config.model_dump()
        
        def deep_merge(base_dict, update_dict):
            for key, value in update_dict.items():
                if key in base_dict and isinstance(base_dict[key], dict) and isinstance(value, dict):
                    deep_merge(base_dict[key], value)
                else:
                    base_dict[key] = value
        
        deep_merge(current_dict, partial_config)
        updated_config = FullConfig(**current_dict)
        config_manager.save_config(updated_config)
        return {"message": "Configuration patched successfully."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error patching config: {e}")

# --- Media Sources Management Endpoints ---
@app.get("/api/media_sources")
async def get_media_sources():
    """Retrieves the current media sources configuration."""
    try:
        return config_manager.get_media_sources()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error reading media sources: {e}")

@app.post("/api/media_sources")
async def save_media_sources(sources_data: List[Dict[str, Any]]):
    """Updates and saves the media sources configuration."""
    try:
        config_manager.save_media_sources(sources_data)
        return {"message": "Media sources configuration saved successfully."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error saving media sources: {e}")


# --- Initial Milieus Management Endpoints ---
@app.get("/api/initial_milieus")
async def get_initial_milieus():
    """Retrieves the current initial milieus configuration."""
    try:
        return config_manager.get_initial_milieus()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error reading initial milieus: {e}")

@app.post("/api/initial_milieus")
async def save_initial_milieus(milieus_data: List[Dict[str, Any]]):
    """Updates and saves the initial milieus configuration."""
    try:
        config_manager.save_initial_milieus(milieus_data)
        return {"message": "Initial milieus configuration saved successfully."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error saving initial milieus: {e}")

# --- Milieus Management Endpoints ---
@app.get("/api/milieus")
async def get_milieus():
    """Retrieves the current milieus configuration."""
    try:
        return config_manager.get_milieus()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error reading milieus: {e}")

@app.post("/api/milieus")
async def save_milieus(milieus_data: List[Dict[str, Any]]):
    """Updates and saves the milieus configuration."""
    try:
        config_manager.save_milieus(milieus_data)
        return {"message": "Milieus configuration saved successfully."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error saving milieus: {e}")

# --- Output Schablonen Management Endpoints ---
@app.get("/api/output_schablonen")
async def get_output_schablonen():
    """Retrieves the current output schablonen configuration."""
    try:
        return config_manager.get_output_schablonen()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error reading output schablonen: {e}")

@app.post("/api/output_schablonen")
async def save_output_schablonen(schablonen_data: List[Dict[str, Any]]):
    """Updates and saves the output schablonen configuration."""
    try:
        config_manager.save_output_schablonen(schablonen_data)
        return {"message": "Output schablonen configuration saved successfully."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error saving output schablonen: {e}")

# --- Unified Presets Management Endpoints ---

@app.get("/api/presets/{section_name}")
async def list_presets(section_name: str):
    """Lists all available preset files for a specific section."""
    section_dir = PRESETS_DIR / section_name
    if not section_dir.is_dir():
        return []
    return [p.stem for p in section_dir.glob("*.json")]

@app.get("/api/presets/{section_name}/{preset_name}")
async def load_preset(section_name: str, preset_name: str):
    """Loads a specific preset configuration for a section."""
    preset_path = PRESETS_DIR / section_name / f"{preset_name}.json"
    if not preset_path.exists():
        raise HTTPException(status_code=404, detail="Preset not found.")
    with open(preset_path, 'r') as f:
        return json.load(f)

@app.post("/api/presets/{section_name}/{preset_name}")
async def save_preset(section_name: str, preset_name: str, config_data: Any = Body()):
    """Saves or overwrites a preset for a section."""
    # Allow alphanumeric characters and underscores
    if not preset_name.replace('_', '').isalnum() or not section_name.replace('_', '').isalnum():
        raise HTTPException(status_code=400, detail="Names must be alphanumeric (underscores allowed).")
    
    section_dir = PRESETS_DIR / section_name
    section_dir.mkdir(exist_ok=True)
    
    preset_path = section_dir / f"{preset_name}.json"
    with open(preset_path, 'w') as f:
        json.dump(config_data, f, indent=2)
        
    return {"message": f"Preset '{preset_name}' for section '{section_name}' saved."}

@app.delete("/api/presets/{section_name}/{preset_name}")
async def delete_preset(section_name: str, preset_name: str):
    """Deletes a specific preset file."""
    # Allow alphanumeric characters and underscores
    if not preset_name.replace('_', '').isalnum() or not section_name.replace('_', '').isalnum():
        raise HTTPException(status_code=400, detail="Names must be alphanumeric (underscores allowed).")
    
    preset_path = PRESETS_DIR / section_name / f"{preset_name}.json"
    if not preset_path.exists():
        raise HTTPException(status_code=404, detail="Preset not found.")
    
    try:
        os.remove(preset_path)
        return {"message": f"Preset '{preset_name}' for section '{section_name}' deleted."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting preset: {e}")


# --- WebSocket Endpoint ---
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await connection_manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        connection_manager.disconnect(websocket)

# --- Main Entry Point ---
if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
