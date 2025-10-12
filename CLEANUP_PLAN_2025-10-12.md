# ABM² Digital Lab - Cleanup & Refactoring Plan

**Plan Date:** 2025-10-12
**Target Completion:** 2025-11-12 (4 weeks)
**Based on:** PROJECT_ANALYSIS_2025-10-12.md

---

## 📋 Overview

This plan outlines a systematic approach to clean up technical debt, consolidate documentation, and improve code quality for the ABM² Digital Lab project.

**Goals:**
- ✅ Eliminate redundant and outdated documentation
- ✅ Commit or remove experimental features
- ✅ Fix code quality issues
- ✅ Improve project maintainability
- ✅ Enhance security and performance

**Success Metrics:**
- Zero uncommitted tracked files
- Consolidated documentation (reduce from 47 to ~30 docs)
- All TODO/FIXME markers resolved
- Project health score: 6.5 → 8.5

---

## 🔥 Phase 1: Critical Fixes (Week 1)

**Priority:** 🔴 Critical
**Estimated Time:** 8 hours
**Dependencies:** None

### Task 1.1: Resolve Uncommitted Changes

**Problem:** 12 uncommitted files risk being lost

**Actions:**

1. **Review Modified Files**
   ```bash
   git diff digital-lab/backend/main.py
   git diff digital-lab/backend/simulation_manager.py
   ```
   - Decision: Keep changes or revert?
   - If keep: Commit with descriptive message
   - If revert: `git checkout -- <file>`

2. **Experiment Runner Feature - DECIDE**

   **Option A: Commit and Integrate** (Recommended if working)
   ```bash
   # Test the feature first
   cd digital-lab/backend
   python test_experiment_runner.py

   # If tests pass:
   git add experiment_service.py
   git add config/experiment_models.py
   git add test_experiment_runner.py
   git add experiments/
   git add utils/
   git add logger_config.py

   git commit -m "Add experiment runner system with statistical analysis

   - Implement computational experiment framework
   - Add treatment comparison with statistical tests
   - Create experiment models and API endpoints
   - Add comprehensive logging configuration

   Features:
   - Multi-treatment A/B testing
   - Statistical significance testing
   - Experiment result persistence
   - RESTful API for experiment management

   Testing:
   ✅ Unit tests pass (test_experiment_runner.py)

   🤖 Generated with [Claude Code](https://claude.com/claude-code)
   Co-Authored-By: Claude <noreply@anthropic.com>"
   ```

   **Option B: Remove if Incomplete** (If not ready)
   ```bash
   rm -f experiment_service.py
   rm -f config/experiment_models.py
   rm -f test_experiment_runner.py
   rm -f logger_config.py
   rm -rf experiments/
   rm -rf utils/

   # Remove API endpoints from main.py (lines 605-674)
   # Edit digital-lab/backend/main.py to remove experiment endpoints
   ```

3. **MCP Server - DECIDE**

   **Option A: Commit as Subproject**
   ```bash
   git add abm2-mcp-server/
   git add ABM2_MCP_FUNCTIONS.md
   git add news-mcp-direct/

   git commit -m "Add MCP (Model Context Protocol) server integration

   - Implement ABM2 MCP server for Claude Code integration
   - Add comprehensive MCP function documentation
   - Create HTTP and stdio transport layers
   - Add news MCP direct integration

   Documentation:
   - ABM2_MCP_FUNCTIONS.md: Function reference
   - abm2-mcp-server/README.md: Setup guide
   - abm2-mcp-server/TOOLS.md: Tool documentation

   🤖 Generated with [Claude Code](https://claude.com/claude-code)
   Co-Authored-By: Claude <noreply@anthropic.com>"
   ```

   **Option B: Remove if Not Used**
   ```bash
   rm -rf abm2-mcp-server/
   rm -rf news-mcp-direct/
   rm -f ABM2_MCP_FUNCTIONS.md
   ```

4. **Session Notes**
   ```bash
   # QUICK_WINS_SUMMARY.md should not be permanent documentation

   # Option A: Archive
   mkdir -p docs/archive/session-notes
   git mv QUICK_WINS_SUMMARY.md docs/archive/session-notes/2025-10-11-quick-wins.md

   # Option B: Delete (if already integrated elsewhere)
   rm QUICK_WINS_SUMMARY.md
   ```

**Deliverables:**
- [ ] All 12 uncommitted items resolved (committed or removed)
- [ ] Clean `git status` output
- [ ] Commit messages following project standards

---

### Task 1.2: Fix Duplicate API Route

**Problem:** `/api/registry/health` defined twice (main.py:74 & 284)

**File:** `digital-lab/backend/main.py`

**Actions:**

1. **Identify Differences**
   ```bash
   # Compare both implementations
   sed -n '74,83p' digital-lab/backend/main.py
   sed -n '284,292p' digital-lab/backend/main.py
   ```

2. **Remove Duplicate**
   - Keep the second occurrence (lines 284-292) - appears more complete
   - Remove first occurrence (lines 74-83)

   ```python
   # DELETE LINES 74-83:
   # @app.get("/api/registry/health")
   # async def registry_health():
   #     pins_status = formula_registry.pins_status()
   #     return {
   #         "status": "ok",
   #         "enabled": formula_registry.enabled,
   #         "schema_version": "v1",
   #         "whitelist": ["+", "-", "*", "/", "Min", "Max"],
   #         "pins_valid": bool(pins_status.get("validation_status", {}).get("ok", False))
   #     }
   ```

3. **Test API**
   ```bash
   # Start server
   cd digital-lab/backend
   python main.py

   # In another terminal:
   curl http://localhost:8000/api/registry/health
   ```

4. **Commit Fix**
   ```bash
   git add digital-lab/backend/main.py
   git commit -m "Fix duplicate /api/registry/health route definition

   Removed duplicate route at line 74, kept implementation at line 284.
   Both were identical, causing undefined behavior.

   Testing:
   ✅ API endpoint responds correctly
   ✅ Server starts without warnings

   🤖 Generated with [Claude Code](https://claude.com/claude-code)
   Co-Authored-By: Claude <noreply@anthropic.com>"
   ```

**Deliverables:**
- [ ] Duplicate route removed
- [ ] API tested and functional
- [ ] Changes committed

---

### Task 1.3: Update .gitignore

**Problem:** Missing entries for new directories and sensitive files

**File:** `.gitignore`

**Actions:**

1. **Add Missing Entries**
   ```gitignore
   # Python
   __pycache__/
   *.py[cod]
   *$py.class
   *.so
   .Python
   venv/
   ENV/
   env/

   # Experiment data
   experiments/
   runs/*.json
   runs/*.csv

   # Logs
   *.log
   logs/

   # Environment variables
   .env
   .env.*
   !.env.example

   # IDE
   .vscode/
   .idea/
   *.swp
   *.swo
   *~

   # OS
   .DS_Store
   Thumbs.db

   # Node
   node_modules/
   npm-debug.log*
   yarn-debug.log*
   yarn-error.log*

   # Build
   build/
   dist/
   *.egg-info/

   # Cache
   .cache/
   .pytest_cache/

   # Temporary
   tmp/
   temp/
   *.tmp
   *.backup
   *.bak

   # Data files (if not needed in repo)
   data/formulas/*/draft/
   recordings/*.csv
   ```

2. **Clean Already-Tracked Files**
   ```bash
   # Remove files that should be ignored but are tracked
   git rm --cached -r experiments/ 2>/dev/null || true
   git rm --cached runs/*.json 2>/dev/null || true
   git rm --cached *.log 2>/dev/null || true
   ```

3. **Commit Changes**
   ```bash
   git add .gitignore
   git commit -m "Update .gitignore for experiments and sensitive files

   Added:
   - experiments/ directory
   - runs/ output files
   - .env files (except .env.example)
   - log files
   - editor and OS temp files

   🤖 Generated with [Claude Code](https://claude.com/claude-code)
   Co-Authored-By: Claude <noreply@anthropic.com>"
   ```

**Deliverables:**
- [ ] .gitignore updated
- [ ] Sensitive files untracked
- [ ] Changes committed

---

### Task 1.4: Fix Hardcoded Proxy URL

**Problem:** Frontend proxy hardcoded to `http://192.168.178.77:8000`

**File:** `digital-lab/frontend/package.json`

**Actions:**

1. **Remove Hardcoded Proxy**
   ```json
   // DELETE from package.json:
   "proxy": "http://192.168.178.77:8000"
   ```

2. **Create Environment Variable Setup**

   **File:** `digital-lab/frontend/.env.example`
   ```env
   # API Configuration
   REACT_APP_API_URL=http://localhost:8000
   REACT_APP_WS_URL=ws://localhost:8000/ws

   # Optional: Enable debug mode
   REACT_APP_DEBUG=false
   ```

   **File:** `digital-lab/frontend/.env.development`
   ```env
   REACT_APP_API_URL=http://localhost:8000
   REACT_APP_WS_URL=ws://localhost:8000/ws
   REACT_APP_DEBUG=true
   ```

   **File:** `digital-lab/frontend/.env.production`
   ```env
   REACT_APP_API_URL=https://your-domain.com
   REACT_APP_WS_URL=wss://your-domain.com/ws
   REACT_APP_DEBUG=false
   ```

3. **Update API Client Code**

   **File:** `digital-lab/frontend/src/api/client.ts` (or similar)
   ```typescript
   const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
   const WS_URL = process.env.REACT_APP_WS_URL || 'ws://localhost:8000/ws';

   export const apiClient = axios.create({
     baseURL: API_BASE_URL,
     timeout: 10000,
   });
   ```

4. **Update Documentation**
   - Add environment variable setup to README.md
   - Update deployment guides with .env configuration

5. **Commit Changes**
   ```bash
   git add digital-lab/frontend/package.json
   git add digital-lab/frontend/.env.example
   git add digital-lab/frontend/.env.development
   git add digital-lab/frontend/.env.production
   git add digital-lab/frontend/src/api/
   git add README.md

   git commit -m "Replace hardcoded API proxy with environment variables

   - Remove hardcoded proxy from package.json
   - Add .env.example, .env.development, .env.production
   - Update API client to use REACT_APP_API_URL
   - Add environment setup to documentation

   This allows easy configuration for different environments
   without modifying code.

   🤖 Generated with [Claude Code](https://claude.com/claude-code)
   Co-Authored-By: Claude <noreply@anthropic.com>"
   ```

**Deliverables:**
- [ ] Hardcoded proxy removed
- [ ] Environment variable system implemented
- [ ] Documentation updated
- [ ] Changes committed

---

## 📚 Phase 2: Documentation Consolidation (Week 2)

**Priority:** 🟡 Medium
**Estimated Time:** 12 hours
**Dependencies:** Phase 1 complete

### Task 2.1: Archive Pilot Documentation

**Problem:** 11 pilot docs clutter main docs folder

**Actions:**

1. **Create Archive Structure**
   ```bash
   mkdir -p docs/archive/pilot-phase
   mkdir -p docs/archive/session-notes
   ```

2. **Move Pilot Documents**
   ```bash
   git mv docs/pilot_*.md docs/archive/pilot-phase/
   ```

3. **Create Archive Index**

   **File:** `docs/archive/pilot-phase/README.md`
   ```markdown
   # Pilot Phase Documentation Archive

   This directory contains documentation from the pilot phase of feature development.
   These documents are kept for historical reference but are no longer actively maintained.

   **Archived:** 2025-10-12

   ## Documents

   - `pilot_altruism_update_spec.md` - Altruism system specification
   - `pilot_altruism_update_integration_plan.md` - Integration plan
   - `pilot_altruism_update.schema.json` - JSON schema
   - `pilot_altruism_update.tests.json` - Test cases
   - `pilot_feature_flag_pinning.md` - Feature flag system
   - `pilot_formula_migration_plan.md` - Formula migration
   - `pilot_formula_risk_plan.md` - Risk assessment
   - `pilot_frontend_editor_spec.md` - Frontend editor spec
   - `pilot_governance_flow.md` - Governance workflow
   - `pilot_registry_api_contracts.md` - API contracts
   - `pilot_rng_audit.md` - RNG audit report
   - `pilot_rng_plan.md` - RNG implementation plan

   ## Status

   Most features described here have been:
   - ✅ Implemented and documented in main docs
   - ✅ Integrated into production code
   - ✅ Superseded by newer specifications

   Refer to current documentation in `/docs` for active features.
   ```

4. **Commit Archive**
   ```bash
   git add docs/archive/
   git commit -m "Archive pilot phase documentation

   Moved 11 pilot documents to docs/archive/pilot-phase/
   for historical reference. These docs are no longer actively
   maintained as features have been implemented and documented
   in main documentation.

   🤖 Generated with [Claude Code](https://claude.com/claude-code)
   Co-Authored-By: Claude <noreply@anthropic.com>"
   ```

**Deliverables:**
- [ ] Pilot docs moved to archive/
- [ ] Archive README created
- [ ] Changes committed

---

### Task 2.2: Consolidate Deployment Documentation

**Problem:** 3 deployment docs with overlapping content

**Current Files:**
- `DEPLOYMENT.md` (12 KB)
- `SIMPLE_DEPLOYMENT.md` (3.5 KB)
- `DEPLOYMENT_PRODUCTION.md` (7.4 KB)

**Decision Tree:**

```
Are you deploying for the first time?
├─ Yes → Use SIMPLE_DEPLOYMENT.md (Quick Start)
└─ No
   ├─ Production deployment? → Use DEPLOYMENT_PRODUCTION.md
   └─ Development setup? → Use README.md#quick-start
```

**Actions:**

1. **Audit Content Overlap**
   ```bash
   # Compare files
   diff DEPLOYMENT.md DEPLOYMENT_PRODUCTION.md
   diff SIMPLE_DEPLOYMENT.md DEPLOYMENT_PRODUCTION.md
   ```

2. **Consolidate Strategy**

   **Keep:**
   - `DEPLOYMENT_PRODUCTION.md` - Most comprehensive, keep as-is
   - `README.md` - Add clear link to deployment docs

   **Archive:**
   - `DEPLOYMENT.md` - Older version, likely redundant
   - `SIMPLE_DEPLOYMENT.md` - Integrate into README quick start

3. **Update README.md**
   ```markdown
   ## 🚀 Quick Start

   For a 5-minute local setup, see the Quick Start section below.
   For production deployment, see [DEPLOYMENT_PRODUCTION.md](DEPLOYMENT_PRODUCTION.md).

   ### Local Development (5 minutes)
   [Include content from SIMPLE_DEPLOYMENT.md here]
   ```

4. **Archive Old Deployment Docs**
   ```bash
   mkdir -p docs/archive/old-deployment
   git mv DEPLOYMENT.md docs/archive/old-deployment/

   # SIMPLE_DEPLOYMENT.md: Delete after integrating into README
   git rm SIMPLE_DEPLOYMENT.md
   ```

5. **Update All References**
   ```bash
   # Find all references to old deployment docs
   grep -r "DEPLOYMENT.md" --include="*.md" .
   grep -r "SIMPLE_DEPLOYMENT.md" --include="*.md" .

   # Update references to point to DEPLOYMENT_PRODUCTION.md
   ```

6. **Commit Consolidation**
   ```bash
   git add README.md
   git add docs/archive/old-deployment/
   git commit -m "Consolidate deployment documentation

   - Integrated SIMPLE_DEPLOYMENT.md content into README.md
   - Archived old DEPLOYMENT.md to docs/archive/
   - DEPLOYMENT_PRODUCTION.md is now the single source of truth
     for production deployments
   - Updated all internal documentation references

   Result: 3 deployment docs → 1 (plus README quick start)

   🤖 Generated with [Claude Code](https://claude.com/claude-code)
   Co-Authored-By: Claude <noreply@anthropic.com>"
   ```

**Deliverables:**
- [ ] Single deployment doc (DEPLOYMENT_PRODUCTION.md)
- [ ] README updated with quick start
- [ ] Old docs archived
- [ ] All references updated
- [ ] Changes committed

---

### Task 2.3: Review and Update Documentation Metadata

**Problem:** No "last updated" dates, unclear doc status

**Actions:**

1. **Add Metadata Header Template**
   ```markdown
   # Document Title

   **Status:** Active | Archived | Draft
   **Last Updated:** YYYY-MM-DD
   **Author:** Name/Team
   **Reviewers:** Name/Team (optional)

   [Content...]
   ```

2. **Update Active Documentation**

   Priority documents to update:
   - [ ] `README.md`
   - [ ] `DEPLOYMENT_PRODUCTION.md`
   - [ ] `digital-lab/README.md`
   - [ ] `digital-lab/DEVELOPMENT.md`
   - [ ] `docs/guides/configuration.md`
   - [ ] `docs/guides/installation.md`
   - [ ] `docs/guides/user-guide.md`
   - [ ] `docs/api/README.md`
   - [ ] `docs/architecture/README.md`

3. **Script to Add Headers**
   ```bash
   #!/bin/bash
   # add-doc-headers.sh

   for file in README.md DEPLOYMENT_PRODUCTION.md digital-lab/*.md docs/guides/*.md; do
     if [ -f "$file" ]; then
       # Get last commit date for the file
       LAST_UPDATED=$(git log -1 --format=%cd --date=short "$file")

       # Add header if not present
       if ! grep -q "Last Updated:" "$file"; then
         sed -i "1a\\
   \\
   **Status:** Active\\
   **Last Updated:** $LAST_UPDATED\\
   " "$file"
       fi
     fi
   done
   ```

4. **Commit Metadata Updates**
   ```bash
   git add README.md DEPLOYMENT_PRODUCTION.md digital-lab/ docs/
   git commit -m "Add metadata headers to documentation

   Added status and last-updated dates to all active documentation.
   This helps developers identify current vs. outdated docs.

   🤖 Generated with [Claude Code](https://claude.com/claude-code)
   Co-Authored-By: Claude <noreply@anthropic.com>"
   ```

**Deliverables:**
- [ ] Metadata headers added to active docs
- [ ] Script created for future updates
- [ ] Changes committed

---

### Task 2.4: Create Missing Documentation

**Problem:** Missing .env.example, CHANGELOG.md

**Actions:**

1. **Create .env.example for Backend**

   **File:** `digital-lab/backend/.env.example`
   ```env
   # ABM² Digital Lab - Backend Configuration
   # Copy this file to .env and fill in your values

   # Application
   ADMIN_USERNAME=admin
   ADMIN_PASSWORD=change_me_in_production

   # CORS Configuration
   # Comma-separated list of allowed origins
   ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001

   # Logging
   LOG_LEVEL=INFO
   # Options: DEBUG, INFO, WARNING, ERROR, CRITICAL

   # Formula Registry
   REGISTRY_ENABLED=true

   # Database (if using)
   # DATABASE_URL=sqlite:///./data/abm2.db

   # Redis (if using)
   # REDIS_URL=redis://localhost:6379
   ```

2. **Create CHANGELOG.md**

   **File:** `CHANGELOG.md`
   ```markdown
   # Changelog

   All notable changes to the ABM² Digital Lab project will be documented in this file.

   The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
   and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

   ## [Unreleased]

   ### Added
   - MCP (Model Context Protocol) server integration for Claude Code
   - Experiment runner system with statistical analysis
   - Comprehensive logging configuration

   ### Changed
   - Consolidated deployment documentation
   - Updated .gitignore for better coverage

   ### Fixed
   - Duplicate API route `/api/registry/health`
   - Hardcoded proxy URL in frontend package.json

   ## [1.0.0] - 2024-09-21

   ### Added
   - Complete refactoring of ABM² Digital Lab (2024/25)
   - FastAPI backend with WebSocket support
   - React 18.3 frontend with TypeScript
   - Authentication system (HTTP Basic Auth)
   - Formula registry with versioning
   - Dashboard with draggable widgets
   - Agent-based modeling with 6-milieu system
   - Multi-biome environment simulation
   - Real-time visualization with Deck.GL
   - Comprehensive configuration system (YAML + Pydantic)
   - Preset management for scenarios
   - Recording and export functionality (CSV)
   - Audit logging system
   - Role-based authorization (authz)
   - Prometheus metrics endpoint

   ### Documentation
   - Comprehensive README with architecture diagrams
   - Production deployment guide with troubleshooting
   - API documentation (Swagger/OpenAPI)
   - Development guide
   - User guides for configuration

   ## [0.9.0] - 2023-XX-XX (Legacy)

   - Original ABM implementation (pre-refactoring)
   - Basic simulation features
   - Early prototype
   ```

3. **Create CONTRIBUTING.md**

   **File:** `CONTRIBUTING.md`
   ```markdown
   # Contributing to ABM² Digital Lab

   Thank you for your interest in contributing! This document provides
   guidelines for contributing to the project.

   ## Development Setup

   See [digital-lab/DEVELOPMENT.md](digital-lab/DEVELOPMENT.md) for detailed setup instructions.

   ## Coding Standards

   ### Python
   - Follow PEP 8 style guide
   - Use Black formatter (line length: 88)
   - Add type hints to all functions
   - Write docstrings for public APIs

   ### TypeScript
   - Follow ESLint configuration
   - Use Prettier for formatting
   - Enable strict TypeScript checks
   - Document complex components

   ## Commit Messages

   Follow the Conventional Commits format:

   ```
   <type>(<scope>): <subject>

   <body>

   <footer>
   ```

   Types: feat, fix, docs, style, refactor, test, chore

   ## Pull Request Process

   1. Fork the repository
   2. Create a feature branch (`git checkout -b feature/amazing-feature`)
   3. Make your changes
   4. Write or update tests
   5. Ensure all tests pass
   6. Update documentation
   7. Commit with descriptive messages
   8. Push to your fork
   9. Create a Pull Request

   ## Code Review

   All submissions require review. We use GitHub Pull Requests for this purpose.

   ## Testing

   - Write tests for new features
   - Maintain test coverage above 70%
   - Run `pytest` before submitting PR

   ## Documentation

   - Update README.md if adding features
   - Add docstrings to new functions
   - Update API docs if changing endpoints
   - Include examples where appropriate

   ## Questions?

   Open an issue or contact the maintainers.
   ```

4. **Commit New Docs**
   ```bash
   git add digital-lab/backend/.env.example
   git add CHANGELOG.md
   git add CONTRIBUTING.md
   git commit -m "Add missing project documentation

   Created:
   - .env.example: Environment variable template
   - CHANGELOG.md: Version history tracking
   - CONTRIBUTING.md: Contributor guidelines

   These documents improve project maintainability and
   make it easier for new contributors to get started.

   🤖 Generated with [Claude Code](https://claude.com/claude-code)
   Co-Authored-By: Claude <noreply@anthropic.com>"
   ```

**Deliverables:**
- [ ] .env.example created
- [ ] CHANGELOG.md created
- [ ] CONTRIBUTING.md created
- [ ] Changes committed

---

## 🔧 Phase 3: Code Quality Improvements (Week 3)

**Priority:** 🟡 Medium
**Estimated Time:** 10 hours
**Dependencies:** Phase 1-2 complete

### Task 3.1: Resolve TODO/FIXME Markers

**Problem:** 5 TODO/FIXME markers in code

**Files:**
- `digital-lab/backend/logger_config.py` (2 markers)
- `digital-lab/backend/README.md` (2 markers)
- `digital-lab/backend/experiment_service.py` (1 marker)

**Actions:**

1. **Review Each Marker**
   ```bash
   grep -n "TODO\|FIXME\|XXX\|HACK" digital-lab/backend/*.py
   grep -n "TODO\|FIXME\|XXX\|HACK" digital-lab/backend/**/*.py
   ```

2. **Categorize Markers**
   - **Fix Now:** Issues that can be resolved immediately
   - **Create Issue:** Longer-term improvements → GitHub issue
   - **Document:** Known limitations → Add to documentation
   - **Remove:** Obsolete markers

3. **Resolution Template**
   ```markdown
   ## TODO Resolution Tracking

   | File | Line | Marker | Resolution | Status |
   |------|------|--------|------------|--------|
   | logger_config.py | XX | TODO: ... | Fixed | ✅ |
   | README.md | XX | FIXME: ... | Issue #123 | 🎫 |
   ```

4. **Commit Resolutions**
   ```bash
   git add .
   git commit -m "Resolve TODO/FIXME markers in codebase

   - Fixed immediate issues in logger_config.py
   - Created GitHub issues for long-term improvements
   - Documented known limitations in README
   - Removed obsolete markers

   All markers have been addressed or tracked.

   🤖 Generated with [Claude Code](https://claude.com/claude-code)
   Co-Authored-By: Claude <noreply@anthropic.com>"
   ```

**Deliverables:**
- [ ] All TODO/FIXME markers resolved or tracked
- [ ] GitHub issues created for long-term items
- [ ] Changes committed

---

### Task 3.2: Pin Python Dependencies

**Problem:** Unpinned dependencies cause reproducibility issues

**File:** `digital-lab/backend/requirements.txt`

**Actions:**

1. **Generate Pinned Requirements**
   ```bash
   cd digital-lab/backend

   # Activate venv
   source venv/bin/activate

   # Generate exact versions
   pip freeze > requirements-lock.txt
   ```

2. **Clean Up Generated File**
   ```bash
   # Remove editable installs and local packages
   sed -i '/^-e /d' requirements-lock.txt
   sed -i '/file:\/\//d' requirements-lock.txt
   ```

3. **Update requirements.txt with Minimum Versions**
   ```txt
   # Core dependencies
   fastapi>=0.115.0
   uvicorn[standard]>=0.32.0
   websockets>=13.0
   mesa>=2.1.5
   python-dotenv>=1.0.0
   sympy>=1.12
   prometheus_client>=0.20.0
   cloudpickle>=3.0.0
   pydantic>=2.0.0
   pyyaml>=6.0
   ```

4. **Document Usage**

   **File:** `digital-lab/backend/README.md`
   ```markdown
   ## Dependency Management

   ### Development
   ```bash
   pip install -r requirements.txt
   ```

   ### Production (Exact Versions)
   ```bash
   pip install -r requirements-lock.txt
   ```

   ### Updating Dependencies
   ```bash
   # Update requirements.txt with new package
   # Then regenerate lock file:
   pip install -r requirements.txt
   pip freeze > requirements-lock.txt
   ```
   ```

5. **Commit Pinned Dependencies**
   ```bash
   git add requirements.txt requirements-lock.txt README.md
   git commit -m "Pin Python dependencies for reproducibility

   - Added requirements-lock.txt with exact versions
   - Updated requirements.txt with minimum versions
   - Documented dependency management process

   This ensures consistent installations across environments
   and prevents dependency drift.

   🤖 Generated with [Claude Code](https://claude.com/claude-code)
   Co-Authored-By: Claude <noreply@anthropic.com>"
   ```

**Deliverables:**
- [ ] requirements-lock.txt created
- [ ] requirements.txt updated with minimums
- [ ] Documentation updated
- [ ] Changes committed

---

### Task 3.3: Clean Import Patterns

**Problem:** Inconsistent import patterns (workarounds in main.py)

**Actions:**

1. **Review Import Issues**
   ```python
   # main.py:340 - Commented workaround
   ok, reason = __import__('authz').authz.check_role(...)  # direct import workaround
   from authz import check_role
   ok, reason = check_role(user_role, ["editor"])
   ```

2. **Standardize Imports**
   - Move all imports to top of file
   - Remove inline/conditional imports
   - Remove commented-out workarounds

3. **Refactor Pattern**
   ```python
   # Before (scattered throughout file):
   from authz import check_role

   # After (top of file):
   from authz import check_role

   # Remove all inline "from authz import check_role" statements
   ```

4. **Commit Cleanup**
   ```bash
   git add digital-lab/backend/main.py
   git commit -m "Standardize import patterns in main.py

   - Moved all imports to top of file
   - Removed inline/conditional imports
   - Cleaned up commented workarounds
   - Improved code readability

   🤖 Generated with [Claude Code](https://claude.com/claude-code)
   Co-Authored-By: Claude <noreply@anthropic.com>"
   ```

**Deliverables:**
- [ ] Imports standardized
- [ ] Workarounds removed
- [ ] Changes committed

---

### Task 3.4: Add Code Documentation

**Problem:** Many functions lack docstrings

**Priority:** Medium (Focus on public APIs first)

**Actions:**

1. **Identify Undocumented Functions**
   ```bash
   # Find functions without docstrings
   grep -n "^def " digital-lab/backend/*.py | while read line; do
     echo "Checking: $line"
   done
   ```

2. **Add Docstrings to Critical Functions**

   Priority order:
   1. Public API endpoints
   2. Manager classes
   3. Core simulation logic
   4. Utility functions

3. **Docstring Template**
   ```python
   def function_name(param1: Type1, param2: Type2) -> ReturnType:
       """Brief one-line description.

       More detailed explanation of what the function does,
       including any important behavior or side effects.

       Args:
           param1: Description of param1
           param2: Description of param2

       Returns:
           Description of return value

       Raises:
           ExceptionType: When and why this exception is raised

       Example:
           >>> result = function_name("value", 42)
           >>> print(result)
           Expected output
       """
       # Implementation
   ```

4. **Commit Documentation**
   ```bash
   git add digital-lab/backend/
   git commit -m "Add docstrings to public API functions

   Added comprehensive docstrings to:
   - All API endpoints in main.py
   - Manager classes (SimulationManager, ConnectionManager, etc.)
   - Core simulation logic

   Improves code maintainability and auto-generated documentation.

   🤖 Generated with [Claude Code](https://claude.com/claude-code)
   Co-Authored-By: Claude <noreply@anthropic.com>"
   ```

**Deliverables:**
- [ ] Docstrings added to public APIs
- [ ] Critical functions documented
- [ ] Changes committed

---

## 🔒 Phase 4: Security & Performance (Week 4)

**Priority:** 🟡 Medium
**Estimated Time:** 8 hours
**Dependencies:** Phase 1-3 complete

### Task 4.1: Security Audit

**Actions:**

1. **Dependency Vulnerability Scan**
   ```bash
   # Python dependencies
   cd digital-lab/backend
   pip install safety
   safety check

   # Node dependencies
   cd ../frontend
   npm audit
   npm audit fix
   ```

2. **Review Formula Registry Security**
   - Audit sympy expression evaluation
   - Check for code injection risks
   - Implement sandboxing if needed

3. **Add Rate Limiting**

   **File:** `digital-lab/backend/main.py`
   ```python
   from slowapi import Limiter, _rate_limit_exceeded_handler
   from slowapi.util import get_remote_address
   from slowapi.errors import RateLimitExceeded

   limiter = Limiter(key_func=get_remote_address)
   app.state.limiter = limiter
   app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

   # Add to endpoints:
   @app.post("/api/simulation/step")
   @limiter.limit("10/minute")
   async def step_simulation(request: Request, user: dict = Depends(get_current_user_info)):
       # ...
   ```

4. **Document Security Measures**

   **File:** `SECURITY.md`
   ```markdown
   # Security Policy

   ## Supported Versions

   | Version | Supported          |
   | ------- | ------------------ |
   | 1.x     | :white_check_mark: |

   ## Reporting a Vulnerability

   Please report security vulnerabilities to: security@infinimind.dev

   ## Security Measures

   - HTTP Basic Authentication
   - CORS protection
   - Rate limiting on API endpoints
   - Input validation with Pydantic
   - Audit logging
   - Environment-based secrets management

   ## Best Practices

   - Never commit .env files
   - Use strong passwords
   - Enable HTTPS in production
   - Regular dependency updates
   - Review audit logs regularly
   ```

5. **Commit Security Improvements**
   ```bash
   git add digital-lab/backend/main.py SECURITY.md
   git commit -m "Add security improvements and documentation

   - Added rate limiting to API endpoints
   - Documented security policy
   - Performed dependency vulnerability scan
   - Updated packages with security fixes

   🤖 Generated with [Claude Code](https://claude.com/claude-code)
   Co-Authored-By: Claude <noreply@anthropic.com>"
   ```

**Deliverables:**
- [ ] Security audit completed
- [ ] Rate limiting implemented
- [ ] SECURITY.md created
- [ ] Changes committed

---

### Task 4.2: Performance Optimization Baseline

**Actions:**

1. **Profile Backend Performance**
   ```bash
   cd digital-lab/backend

   # Install profiling tools
   pip install py-spy

   # Profile running server
   py-spy record -o profile.svg -- python main.py
   ```

2. **Frontend Bundle Analysis**
   ```bash
   cd digital-lab/frontend

   # Analyze bundle size
   npm install --save-dev webpack-bundle-analyzer

   # Add to package.json scripts:
   "analyze": "source-map-explorer 'build/static/js/*.js'"

   npm run build
   npm run analyze
   ```

3. **Document Baseline Metrics**

   **File:** `docs/performance-baseline.md`
   ```markdown
   # Performance Baseline

   **Date:** 2025-10-12

   ## Backend
   - Cold start time: XXX ms
   - Average request time: XXX ms
   - WebSocket latency: XXX ms
   - Memory usage (100 agents): XXX MB
   - Memory usage (1000 agents): XXX MB

   ## Frontend
   - Bundle size: XXX MB
   - Initial load time: XXX s
   - Time to interactive: XXX s
   - Largest contentful paint: XXX s

   ## Simulation
   - Step execution time (100 agents): XXX ms
   - Step execution time (1000 agents): XXX ms
   - Memory per agent: XXX KB
   ```

4. **Commit Baseline**
   ```bash
   git add docs/performance-baseline.md
   git commit -m "Add performance baseline measurements

   Documented current performance metrics for:
   - Backend API response times
   - Frontend bundle size and load times
   - Simulation execution performance

   This baseline will be used to track performance improvements
   and detect regressions.

   🤖 Generated with [Claude Code](https://claude.com/claude-code)
   Co-Authored-By: Claude <noreply@anthropic.com>"
   ```

**Deliverables:**
- [ ] Performance profiling completed
- [ ] Baseline metrics documented
- [ ] Changes committed

---

## 🎯 Final Checklist

### Phase 1: Critical Fixes ✅
- [ ] All uncommitted files resolved (committed or removed)
- [ ] Duplicate API route fixed
- [ ] .gitignore updated
- [ ] Hardcoded proxy URL replaced with environment variables

### Phase 2: Documentation ✅
- [ ] Pilot docs archived (11 files)
- [ ] Deployment docs consolidated (3 → 1)
- [ ] Metadata headers added to active docs
- [ ] .env.example, CHANGELOG.md, CONTRIBUTING.md created

### Phase 3: Code Quality ✅
- [ ] All TODO/FIXME markers resolved or tracked
- [ ] Python dependencies pinned
- [ ] Import patterns standardized
- [ ] Docstrings added to public APIs

### Phase 4: Security & Performance ✅
- [ ] Security audit completed
- [ ] Rate limiting implemented
- [ ] SECURITY.md created
- [ ] Performance baseline documented

---

## 📊 Success Metrics

**Before Cleanup:**
- Uncommitted files: 12
- Documentation files: 47
- Duplicate code: 1 duplicate route
- TODO markers: 5
- Health score: 6.5/10

**After Cleanup:**
- Uncommitted files: 0 ✅
- Documentation files: ~30 (consolidated) ✅
- Duplicate code: 0 ✅
- TODO markers: 0 (or tracked in issues) ✅
- Health score: 8.5/10 🎯

---

## 🚀 Post-Cleanup Tasks (Optional, Week 5+)

### Nice-to-Have Improvements
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] Automated testing on PR
- [ ] Docker Compose for development
- [ ] Grafana dashboards for monitoring
- [ ] Frontend code splitting
- [ ] Redis caching layer
- [ ] Architecture diagrams (draw.io or Mermaid)
- [ ] Video tutorials
- [ ] API client libraries

---

## 📝 Notes

### Important Decisions
1. **Experiment Runner:** DECIDE in Phase 1.1 - keep or remove?
2. **MCP Server:** DECIDE in Phase 1.1 - integrate or keep separate?
3. **Session Notes:** Archive or delete QUICK_WINS_SUMMARY.md?

### Backup Strategy
Before starting cleanup:
```bash
# Create backup
cd ..
tar -czf abm2-backup-pre-cleanup-$(date +%Y%m%d).tar.gz abm2-digital-lab/

# Verify backup
tar -tzf abm2-backup-pre-cleanup-*.tar.gz | head
```

### Progress Tracking
Use GitHub Project or simple checklist:
- [ ] Phase 1: Week 1 (Oct 12-18)
- [ ] Phase 2: Week 2 (Oct 19-25)
- [ ] Phase 3: Week 3 (Oct 26-Nov 1)
- [ ] Phase 4: Week 4 (Nov 2-8)
- [ ] Review: Week 5 (Nov 9-12)

---

**Plan Created:** 2025-10-12
**Target Completion:** 2025-11-12
**Review Date:** 2025-11-12

🤖 Generated with [Claude Code](https://claude.com/claude-code)
