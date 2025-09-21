from typing import Dict, Any
try:
    from prometheus_client import CollectorRegistry, Gauge, Counter, generate_latest, CONTENT_TYPE_LATEST
    _PROM_AVAILABLE = True
except Exception:
    _PROM_AVAILABLE = False
    CollectorRegistry = object  # type: ignore
    Gauge = Counter = object     # type: ignore
    def generate_latest(*args, **kwargs):  # type: ignore
        return b""
    CONTENT_TYPE_LATEST = "text/plain"

if _PROM_AVAILABLE:
    METRICS_REGISTRY = CollectorRegistry()
    # Gauges for current telemetry snapshot
    G_EVAL_MS_TOTAL = Gauge('registry_eval_ms_total', 'Total evaluation time in ms', registry=METRICS_REGISTRY)
    G_BATCH_CALLS = Gauge('registry_batch_calls', 'Total batch calls', registry=METRICS_REGISTRY)
    G_BATCH_SIZE_AVG = Gauge('registry_batch_size_avg', 'Average batch size', registry=METRICS_REGISTRY)
    G_CACHE_HIT_RATIO = Gauge('registry_cache_hit_ratio', 'Cache hit ratio', registry=METRICS_REGISTRY)
    # Counters for events
    C_AUDIT_FAILED = Counter('audit_failed_total', 'Total failed audit operations', ['action'], registry=METRICS_REGISTRY)
    C_PIN_UPDATE_REJECTED = Counter('pin_update_rejected_total', 'Total rejected pin updates', registry=METRICS_REGISTRY)
else:
    METRICS_REGISTRY = None  # type: ignore


def update_registry_telemetry(t: Dict[str, Any]) -> None:
    if not _PROM_AVAILABLE:
        return
    if 'registry_eval_ms_total' in t:
        G_EVAL_MS_TOTAL.set(float(t['registry_eval_ms_total']))
    if 'batch_calls' in t:
        G_BATCH_CALLS.set(float(t['batch_calls']))
    if 'batch_size_avg' in t:
        G_BATCH_SIZE_AVG.set(float(t['batch_size_avg']))
    # cache hit ratio either provided or computable
    if 'cache_hit_ratio' in t and t['cache_hit_ratio'] is not None:
        G_CACHE_HIT_RATIO.set(float(t['cache_hit_ratio']))
    elif 'cache_hit' in t and 'cache_miss' in t:
        ch = float(t.get('cache_hit', 0.0)); cm = float(t.get('cache_miss', 0.0))
        ratio = ch / (ch + cm) if (ch + cm) > 0 else 0.0
        G_CACHE_HIT_RATIO.set(ratio)


def inc_audit_failed(action: str) -> None:
    if not _PROM_AVAILABLE:
        return
    C_AUDIT_FAILED.labels(action=action).inc()


def inc_pin_update_rejected() -> None:
    if not _PROM_AVAILABLE:
        return
    C_PIN_UPDATE_REJECTED.inc()


def export_prometheus() -> bytes:
    return generate_latest(METRICS_REGISTRY)


CONTENT_TYPE = CONTENT_TYPE_LATEST
