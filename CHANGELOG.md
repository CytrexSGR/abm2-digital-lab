# Changelog

All notable changes to the ABM² Digital Lab project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Added
- Experiment runner system with statistical analysis and treatment comparison
- MCP (Model Context Protocol) server integration for Claude Code
- Simulation history tracking (up to 1000 snapshots)
- Agent query API with filtering and aggregations
- Time series API for metric extraction over simulation steps
- Environment variable configuration for frontend (`.env.example`)
- Comprehensive project analysis and cleanup plan documents

### Changed
- Consolidated deployment documentation (3 docs → 1)
- Archived 12 pilot phase documents to `docs/archive/pilot-phase/`
- Removed hardcoded proxy URL, now using environment variables
- Updated .gitignore for experiment data and secrets

### Fixed
- Duplicate `/api/registry/health` route definition
- Frontend API configuration now environment-based
- Missing .gitignore entries for generated data

---

## [1.0.0] - 2024-09-21

**Major Refactoring Release** - Complete system rewrite for 2024/25

### Added

#### Core Platform
- Complete refactoring of ABM² Digital Lab with modern architecture
- FastAPI backend with WebSocket support for real-time updates
- React 18.3 frontend with TypeScript for type safety
- HTTP Basic Authentication for single-user admin access
- Role-based authorization system (RBAC ready)
- Comprehensive audit logging to JSONL files

#### Agent-Based Modeling
- Political agents with 25+ properties
- 6-milieu system (Sinus-Milieus inspired)
- Barabási-Albert social networks for realistic interactions
- Behavioral economics: investment, consumption, risk decisions
- Cognitive capacity influenced by stress, education, wealth
- Media landscape with ideological proximity matching
- Adaptive learning from personal experiences

#### Environment Simulation
- Multi-biome system (Urban, Industrial, Rural, Remote)
- Dynamic resource management with biome-specific parameters
- Hazard events with probabilistic natural disasters
- Environment feedback loops (investment/altruism affects environment)
- Biome-specific capacity, regeneration rates, productivity factors

#### Configuration & Management
- YAML-based configuration with Pydantic validation
- Advanced preset system for Biomes, Milieus, Media Sources
- Live configuration updates during simulation
- Formula registry with versioning and dynamic compilation
- Feature flag system with pins for experimental features
- Export functionality (JSON, CSV) for scientific analysis

#### Visualization & UI
- Real-time 2D map visualization with Deck.GL
- Modular, draggable dashboard widget system
- Live metrics tracking (Gini coefficient, averages, distributions)
- Agent inspector for detailed individual agent analysis
- Interactive configuration panels
- WebSocket-based real-time data streaming

#### API & Integration
- RESTful API with OpenAPI/Swagger documentation
- WebSocket endpoints for bidirectional communication
- Prometheus metrics endpoint for monitoring
- Health check endpoints
- Recording API for CSV export management
- Formula registry API with validation, compilation, testing

#### Development & Operations
- Comprehensive documentation (README, deployment guides, API docs)
- Production deployment guide with troubleshooting
- Docker support (optional)
- PM2 process management support
- Nginx reverse proxy configuration examples
- SSL/TLS support with Certbot integration

### Documentation
- Comprehensive README with architecture diagrams
- Production deployment guide (`DEPLOYMENT_PRODUCTION.md`)
- API documentation (Swagger/OpenAPI at `/docs`)
- Development guide (`digital-lab/DEVELOPMENT.md`)
- User guides for configuration and usage
- Troubleshooting section with 12+ common issues resolved

### Technical Stack
- **Backend:** Python 3.8+, FastAPI, Uvicorn, Mesa 2.1.5+, Pydantic, WebSockets
- **Frontend:** React 18.3, TypeScript 4.9, Deck.GL, Zustand, Recharts, Axios
- **Infrastructure:** Nginx, PM2, SSL/TLS (Certbot)

---

## [0.9.0] - 2023-XX-XX (Legacy)

### Added
- Original ABM implementation (pre-refactoring)
- Basic simulation features
- Early prototype visualization
- Initial agent behaviors
- Simple web interface

### Notes
This version was the initial prototype that led to the complete refactoring in v1.0.0. It served as proof-of-concept and identified requirements for the modern architecture.

---

## Version History Summary

| Version | Date | Description | Status |
|---------|------|-------------|--------|
| Unreleased | 2025-10-12 | Experiment runner, MCP integration, cleanup | In Development |
| 1.0.0 | 2024-09-21 | Complete refactoring, modern architecture | ✅ Stable |
| 0.9.0 | 2023-XX-XX | Original prototype | 🗄️ Archived |

---

## Migration Notes

### From 0.9.0 to 1.0.0
Complete system rewrite - not a direct upgrade path. Key changes:
- Migrated from legacy stack to FastAPI + React
- New authentication system
- Redesigned configuration structure
- Enhanced agent behaviors
- Modern visualization with Deck.GL

### From 1.0.0 to Unreleased
Incremental improvements - backward compatible:
- New experiment runner API (optional feature)
- MCP integration (optional tool)
- Frontend configuration via environment variables
- Enhanced query capabilities

---

## Contributing

Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on how to contribute to this project.

---

**Maintained by:** [Infinimind Creations](https://github.com/infinimind-creations)
**License:** MIT
