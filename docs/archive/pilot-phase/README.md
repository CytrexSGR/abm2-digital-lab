# Pilot Phase Documentation Archive

**Status:** Archived
**Archived Date:** 2025-10-12
**Original Phase:** Q3-Q4 2024

---

## Overview

This directory contains documentation from the pilot phase of feature development for the ABM² Digital Lab. These documents are preserved for historical reference but are no longer actively maintained.

## Documents

### Altruism System
- `pilot_altruism_update_spec.md` - Altruism mechanism specification
- `pilot_altruism_update_integration_plan.md` - Integration roadmap
- `pilot_altruism_update.schema.json` - JSON schema definition
- `pilot_altruism_update.tests.json` - Test cases and validation

### Formula Registry System
- `pilot_formula_migration_plan.md` - Migration strategy from legacy formulas
- `pilot_formula_risk_plan.md` - Risk assessment and mitigation
- `pilot_feature_flag_pinning.md` - Feature flag implementation plan
- `pilot_registry_api_contracts.md` - API contract specifications

### Frontend & Governance
- `pilot_frontend_editor_spec.md` - Formula editor UI specification
- `pilot_governance_flow.md` - Approval workflow design

### Random Number Generation
- `pilot_rng_audit.md` - RNG system audit report
- `pilot_rng_plan.md` - RNG implementation and testing plan

---

## Status of Pilot Features

Most features described in these documents have been:

✅ **Implemented** - Features are now part of the production codebase
✅ **Documented** - Current documentation available in main `/docs` folder
✅ **Tested** - Integration tests and validation completed
✅ **Deployed** - Running in production environment

---

## Current Documentation

For active feature documentation, refer to:

- **Formula Registry:** `/docs/formula_registry_roadmap.md`
- **API Contracts:** `/docs/api/README.md`
- **Configuration:** `/docs/guides/configuration.md`
- **Architecture:** `/docs/architecture/README.md`

---

## Historical Context

These pilot documents were created during the major refactoring phase (2024/25) when transitioning from the legacy system to the modern FastAPI + React architecture. They served as:

- Technical specifications for feature development
- Risk assessments and mitigation strategies
- Integration plans and test scenarios
- API contract definitions

The pilot phase successfully validated:
- Formula registry with versioning
- Dynamic configuration system
- Feature flag mechanism
- Audit logging infrastructure
- Role-based authorization

---

**Note:** Do not use these documents as current references. Always consult the main documentation in `/docs` for up-to-date information.

**Last Updated:** 2025-10-12
