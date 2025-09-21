import os
from typing import List, Tuple, Dict, Any


def rbac_mode() -> str:
    return os.getenv("REGISTRY_RBAC_MODE", "permissive").lower()


def check_role(user_role: str, allowed_roles: List[str]) -> Tuple[bool, Dict[str, Any]]:
    mode = rbac_mode()
    role = (user_role or "").strip().lower()
    if mode != "enforced":
        return True, {"mode": mode, "role": role, "allowed": allowed_roles}
    ok = role in [r.lower() for r in allowed_roles]
    reason = {"mode": mode, "role": role or None, "allowed": allowed_roles}
    return ok, reason

