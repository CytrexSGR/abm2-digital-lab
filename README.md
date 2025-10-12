# ABM² Digital Lab - Political Agent-Based Model Simulation Platform

[![Status](https://img.shields.io/badge/Status-Fully%20Functional-green.svg)](#)
[![Python](https://img.shields.io/badge/Python-3.8%2B-blue.svg)](#)
[![React](https://img.shields.io/badge/React-18.3-blue.svg)](#)
[![FastAPI](https://img.shields.io/badge/FastAPI-Latest-green.svg)](#)
[![TypeScript](https://img.shields.io/badge/TypeScript-4.9-blue.svg)](#)
[![Security](https://img.shields.io/badge/Security-Basic%20Auth-orange.svg)](#)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](#license)

A cutting-edge, web-based system for simulating and analyzing Agent-Based Models (ABM) in political and socio-ecological contexts. The platform combines modern web technologies with scientific simulation logic for research and education, completely refactored in 2024/25 for maximum modularity, performance, and security.

## 🎯 What is ABM² Digital Lab?

**ABM² Digital Lab** is a comprehensive research platform for simulating complex political and socio-economic systems. The system uses Agent-Based Modeling (ABM) to represent individual actors with their interactions, decisions, and adaptive behavior in various geographical and social environments.

### 🔬 Scientific Approach
- **Agent-Based Modeling**: Individual agents with autonomous behavior and interactions
- **Political Simulations**: Realistic modeling of political opinion formation and dynamics
- **Socio-ecological Couplings**: Bidirectional feedbacks between environment and society
- **Emergent Phenomena**: Study of macro-patterns from micro-interactions
- **Empirical Calibration**: Parameterization based on real demographic and political data

## 📋 Table of Contents

- [Key Features](#key-features)
  - [MCP Integration (NEW)](#-mcp-model-context-protocol-integration--new)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Quick Start](#quick-start)
- [Authentication & Security](#authentication--security)
- [System Architecture](#system-architecture)
- [Deployment Guide](#deployment-guide)
- [API Documentation](#api-documentation)
- [Performance & Scaling](#performance--scaling)
- [Development](#development)
- [Contributing](#contributing)
- [License](#license)

## ⭐ Key Features

### 🤖 Agent-Based Modeling
- **Political Agents**: Individual agents with political positions on two axes (economic/social)
- **Adaptive Learning**: Agents adapt opinions based on personal experiences, media consumption, and social interactions
- **Complex Networks**: Barabási-Albert networks for realistic social interaction structures
- **6-Milieu System**: Scientifically-based political archetypes with specific attribute distributions
- **Behavioral Economics**: Investment, consumption, and risk decisions with psychological factors
- **Cognitive Capacity**: Dynamic thinking ability influenced by stress, education, and wealth
- **Media Landscape**: Selective media choice based on ideological proximity

### 🌍 Environment Simulation
- **Multi-Biome System**: 4 main environments (Urban, Industrial, Rural, Remote) with specific economic parameters
- **Dynamic Resource Management**: Biome-specific capacities, regeneration rates, and productivity factors
- **Hazard Events**: Probabilistic natural disasters with biome-specific impacts on wealth and income
- **Environment Feedback**: Investment and altruism levels influence environmental quality and hazard probabilities
- **Seasonal Effects**: Expandable for seasonal variations in resource availability
- **Geographic Distribution**: Agents positioned on 2D map according to milieu-biome matrix

### 📊 Interactive Visualization
- **Real-time Maps**: 2D visualization of all agents with Deck.GL
- **Dashboard System**: Modular, draggable widget architecture
- **Metrics & Analytics**: Live tracking of Gini coefficient, averages
- **Agent Inspector**: Detailed view of individual agents with all properties

### ⚙️ Configuration & Management
- **YAML-based Configuration**: Fully customizable simulation parameters with Pydantic validation
- **Advanced Preset Systems**: Save and load scenarios for Biomes, Milieus, Media Sources
- **Live Configuration**: Adjust parameters during running simulation with real-time validation
- **Formula Registry**: Dynamic configuration of all agent formulas with versioning and caching
- **Export & Import**: Comprehensive data exports (JSON, CSV) for scientific analysis
- **Feature Flags**: Pin system for experimental features and A/B testing

### 🔐 Authentication & Security
- **Single-User Authentication**: HTTP Basic Auth for administrator access
- **Session Management**: Automatic login persistence and logout functionality
- **Protected Endpoints**: Critical simulation and configuration operations secured
- **Environment-based Configuration**: Secure credential management
- **Production Ready**: CORS, rate limiting, and SSL support

### 🤖 MCP (Model Context Protocol) Integration ⭐ NEW

**Control ABM² with natural language via Claude Desktop!**

The platform features comprehensive MCP integration with **40+ tools** that enable AI-powered interaction with the simulation system. Connect Claude Desktop directly to ABM² for intuitive, conversational control of complex simulations.

#### Key MCP Capabilities
- **🎮 Simulation Control**: Reset, step, query state via natural language
- **⚙️ Configuration Management**: Get/set/patch simulation parameters
- **📊 Experiment Runner**: Design and execute A/B tests with statistical analysis
- **🧮 Formula Registry**: Create, validate, compile, and release custom formulas
- **📝 Preset Management**: Load/save/manage scenario configurations
- **📈 Recording & Export**: CSV data capture and analysis
- **🔍 Audit System**: Query logs and track changes

#### Quick Example
```
User: "Start a simulation with 150 agents and run 50 steps"
Claude: [Uses abm2_reset_simulation + abm2_step_simulation]
        "Simulation running with 150 agents. Completed 50 steps.
         Current Gini coefficient: 0.34"

User: "Compare wealth distribution with higher altruism"
Claude: [Uses abm2_create_experiment + abm2_run_experiment]
        "Experiment complete. Higher altruism reduces inequality
         by 18% (p<0.01, Cohen's d=0.67)"
```

#### Setup for Claude Desktop
```json
{
  "mcpServers": {
    "abm2-digital-lab": {
      "command": "node",
      "args": ["/path/to/abm2-mcp-server/abm2-mcp-bridge.js"],
      "env": {
        "ABM2_API_URL": "http://localhost:8000",
        "ABM2_USERNAME": "admin",
        "ABM2_PASSWORD": "your_password"
      }
    }
  }
}
```

**📖 Full Documentation**: [MCP Integration Guide](docs/guides/mcp-integration.md)

## 🛠️ Technology Stack

### 🐍 Backend (Python)
- **[FastAPI](https://fastapi.tiangolo.com/)** - Modern, fast web framework with OpenAPI
- **[Mesa](https://mesa.readthedocs.io/)** - Agent-Based Modeling Framework (v2.1.5+)
- **[Uvicorn](https://www.uvicorn.org/)** - High-Performance ASGI Server with WebSocket support
- **[Pydantic](https://docs.pydantic.dev/)** - Data validation, settings management and type safety
- **[WebSockets](https://websockets.readthedocs.io/)** - Bidirectional real-time communication with auto-reconnect
- **[PyYAML](https://pyyaml.org/)** - YAML configuration files with schema validation
- **[NetworkX](https://networkx.org/)** - Network analysis and Barabási-Albert graphs
- **[NumPy](https://numpy.org/)** - Numerical computations and statistics

### ⚛️ Frontend (React)
- **[React 18.3](https://react.dev/)** - Modern UI library with Concurrent Features and Hooks
- **[TypeScript 4.9](https://www.typescriptlang.org/)** - Type-safe JavaScript development with strict checks
- **[Deck.GL](https://deck.gl/)** - Hardware-accelerated WebGL visualizations for 1000+ agents
- **[Zustand](https://zustand-demo.pmnd.rs/)** - Minimal, modular state management (4 specialized stores)
- **[Recharts](https://recharts.org/)** - Composable React charts for metrics and trends
- **[Axios](https://axios-http.com/)** - HTTP client with interceptors and error handling

## 📁 Project Structure

```
abm2/
├── 📚 docs/                         # Comprehensive documentation
│   ├── api/                        # REST API & WebSocket reference
│   ├── guides/                     # User & installation guides
│   │   └── mcp-integration.md      # 🆕 MCP integration guide (40+ tools)
│   └── architecture/               # System architecture & design
│
├── 🤖 abm2-mcp-server/              # 🆕 Model Context Protocol Server
│   ├── abm2-mcp-bridge.js          # MCP server for Claude Desktop
│   ├── abm2-mcp-http-server.js     # HTTP mode for remote access
│   ├── package.json                # Node.js dependencies
│   ├── README.md                   # MCP server documentation
│   └── SETUP.md                    # Installation & configuration guide
│
├── 🏭 digital-lab/                  # Main application (Refactored 2024/25)
│   ├── 🐍 backend/                 # Python FastAPI Backend
│   │   ├── main.py                 # FastAPI server & WebSocket handler
│   │   ├── simple_auth.py          # 🆕 Authentication system
│   │   ├── simulation_manager.py   # Simulation lifecycle management
│   │   ├── connection_manager.py   # WebSocket connection management
│   │   ├── formula_registry.py     # Dynamic formula engine
│   │   ├── experiment_service.py   # 🆕 A/B testing & experiments
│   │   ├── authz.py                # Authorization & security
│   │   ├── config/                 # Modular configuration management
│   │   ├── political_abm/          # ABM simulation core
│   │   ├── data/                   # Data & cache management
│   │   ├── presets/                # Predefined scenarios
│   │   ├── recordings/             # CSV export files
│   │   ├── experiments/            # 🆕 Experiment results & data
│   │   ├── requirements.txt        # Python dependencies
│   │   ├── requirements-lock.txt   # 🆕 Pinned dependency versions
│   │   ├── .env.production         # 🆕 Production configuration
│   │   └── README.md               # Backend documentation
│   │
│   └── ⚛️ frontend/                # React TypeScript Frontend
│       ├── src/
│       │   ├── components/        # Modular React components
│       │   │   ├── auth/          # 🆕 Authentication components
│       │   │   ├── config/        # Configuration-related UI
│       │   │   ├── dashboard/     # Dashboard & monitoring
│       │   │   ├── simulation/    # Simulation-specific UI
│       │   │   ├── ui/           # Reusable UI components
│       │   │   └── widgets/      # Dashboard widget wrapper
│       │   ├── hooks/            # 🆕 Custom React hooks (useAuth)
│       │   ├── store/            # Modular state management
│       │   ├── pages/            # Page-level components
│       │   └── types.ts          # TypeScript type definitions
│       ├── package.json          # Frontend dependencies
│       ├── .env.example          # 🆕 Environment variable template
│       └── build/                # Production build output
│
├── 📋 README.md                    # This documentation
├── 📝 CHANGELOG.md                 # 🆕 Version history & release notes
├── 🤝 CONTRIBUTING.md              # 🆕 Development & contribution guidelines
├── 🔧 DEPLOYMENT_PRODUCTION.md     # Comprehensive production deployment with troubleshooting
└── 📄 LICENSE                     # MIT License
```

## 🚀 Quick Start

### ⚡ Express Installation (5 minutes)

```bash
# 1. Clone repository
git clone <repository-url> abm2 && cd abm2

# 2. Start backend (Terminal 1)
cd digital-lab/backend
pip install -r requirements.txt
python main.py

# 3. Start frontend (Terminal 2)
cd digital-lab/frontend
npm install && npm start
```

### ✅ System Requirements
| Component | Minimum | Recommended |
|-----------|---------|-------------|
| Python | 3.8+ | 3.10+ |
| Node.js | 16.0+ | 18.0+ |
| RAM | 4 GB | 8 GB+ |
| Browser | Chrome/Firefox/Safari | Chrome 90+ |

### 🌐 Access Points
| Service | URL | Description |
|---------|-----|-------------|
| **Frontend** | http://localhost:3000 | Main application (Dashboard) |
| **Backend API** | http://localhost:8000 | REST API endpoints |
| **API Docs** | http://localhost:8000/docs | Interactive Swagger documentation |
| **Health Check** | http://localhost:8000/api/health | System status |
| **WebSocket** | ws://localhost:8000/ws | Real-time data stream |

### 🎮 First Steps
1. **Open Dashboard**: http://localhost:3000
2. **Login**: Use default credentials (see backend/.env.example for setup)
3. **Start Simulation**: Click ▶️ Play button
4. **Observe Agents**: Explore interactive map
5. **Adjust Parameters**: Use configuration panel
6. **Monitor Metrics**: Watch live dashboards

## 🔐 Authentication & Security

### 🔑 Single-User Authentication
The system now includes HTTP Basic Authentication for secure access:

- **Login Interface**: Automatic redirect to login form
- **Session Persistence**: Credentials stored securely in browser
- **Protected Endpoints**: Critical operations require authentication
- **Easy Logout**: One-click logout functionality

### 🛡️ Security Features
- **CORS Protection**: Configurable allowed origins
- **Environment Variables**: Secure credential management
- **Authorization Checks**: Role-based access control ready
- **Audit Logging**: Complete system audit trails

### ⚙️ Configuration
```bash
# backend/.env.production
ADMIN_USERNAME=your_username
ADMIN_PASSWORD=your_secure_password
ALLOWED_ORIGINS=https://yourdomain.com
LOG_LEVEL=INFO
```

## 🏛️ System Architecture

### 🧠 Backend Architecture
```
┌─────────────────────────────────────────────────────────────────────┐
│                        ABM² Digital Lab Backend                      │
├─────────────────────────────────────────────────────────────────────┤
│  FastAPI Web Server + Authentication                                 │
│  ┌─────────────────┐  ┌──────────────────┐  ┌─────────────────┐    │
│  │   REST API      │  │ SimulationManager│  │ ConnectionManager│    │
│  │   + Auth        │◄─┤  Lifecycle       │◄─┤ WebSocket Hub   │    │
│  └─────────────────┘  └──────────────────┘  └─────────────────┘    │
├─────────────────────────────────────────────────────────────────────┤
│  Agent-Based Model Core (Mesa Framework)                           │
│  ┌─────────────────────────────────────────────────────────────────┐│
│  │                    PoliticalModel                              ││
│  │  ┌─────────────────┐         ┌──────────────────────────────┐  ││
│  │  │ Agent System    │         │    Specialized Managers      │  ││
│  │  │ • PoliticalAgent│         │  • ResourceManager           │  ││
│  │  │ • 25+ Properties│         │  • HazardManager             │  ││
│  │  │ • Behavior Logic│         │  • MediaManager              │  ││
│  │  └─────────────────┘         └──────────────────────────────┘  ││
│  └─────────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────┘
```

### ⚛️ Frontend Architecture
```
┌─────────────────────────────────────────────────────────────────┐
│                 ABM² Digital Lab Frontend                       │
├─────────────────────────────────────────────────────────────────┤
│  React 18.3 + TypeScript + Authentication                      │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │            Component Architecture + Auth                    ││
│  │ ┌─────────────┬─────────────┬─────────────┬───────────────┐ ││
│  │ │ Auth System │ Dashboard   │ Simulation  │   Widgets     │ ││
│  │ │ • LoginForm │ • LiveDash  │ • AgentMap  │ • Modular     │ ││
│  │ │ • useAuth   │ • Metrics   │ • Controls  │ • Draggable   │ ││
│  │ │ • Sessions  │ • Monitor   │ • Inspector │ • Collapsible │ ││
│  │ └─────────────┴─────────────┴─────────────┴───────────────┘ ││
│  └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

## 🚀 Deployment Guide

### 💻 Resource Requirements

| Scenario | vCPUs | RAM | SSD | Agents | Concurrent Users |
|----------|-------|-----|-----|---------|------------------|
| **Minimal** | 2 | 4 GB | 20 GB | 100-200 | 1-2 |
| **Standard** | 4 | 8 GB | 40 GB | 500-800 | 3-5 |
| **Performance** | 8 | 16 GB | 80 GB | 1000+ | 5-10 |

### 🌐 Recommended: Standard Configuration
```bash
# VPS Specifications
vCPUs: 4 cores
RAM: 8 GB
SSD: 40 GB NVMe
Bandwidth: 100 Mbit/s (unlimited)
```

### 🔧 Production Deployment

#### 1. Environment Setup
```bash
# Backend configuration
cd digital-lab/backend
cp .env.production .env
nano .env  # Update credentials and domain

# Build frontend
cd ../frontend
npm run build
```

#### 2. SSL & Reverse Proxy (Nginx)
```nginx
server {
    listen 443 ssl;
    server_name yourdomain.com;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
    }

    # WebSocket
    location /ws {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

#### 3. Process Management
```bash
# Use PM2 for process management
npm install -g pm2

# Start services
cd digital-lab/backend && pm2 start "python main.py" --name abm2-backend
cd ../frontend && pm2 serve build 3000 --name abm2-frontend

# Save PM2 configuration
pm2 save && pm2 startup
```

For detailed deployment instructions, see **[DEPLOYMENT_PRODUCTION.md](DEPLOYMENT_PRODUCTION.md)** for comprehensive production deployment with troubleshooting.

## 🌐 API Documentation

### 🔌 Authentication
All protected endpoints require HTTP Basic Authentication:
```bash
curl -u username:password http://localhost:8000/api/simulation/data
```

### 📡 WebSocket Events
```javascript
// Connect with authentication
const ws = new WebSocket('ws://localhost:8000/ws');

// Simulation updates
{
  "type": "simulation_update",
  "data": {
    "step": 42,
    "agents": [...],
    "metrics": {...}
  }
}
```

### 🔑 Key Endpoints
```bash
# Simulation Control (Protected)
POST /api/simulation/reset    # Reset simulation
POST /api/simulation/step     # Advance one step
GET  /api/simulation/data     # Get current state

# Configuration (Protected)
GET  /api/config              # Get configuration
POST /api/config              # Save configuration

# Public Endpoints
GET  /api/health              # System health check
GET  /docs                    # API documentation
```

## ⚡ Performance & Scaling

### 📈 Performance Guidelines
| Agents | Backend RAM | Frontend RAM | Performance |
|--------|-------------|--------------|-------------|
| 100 | ~500 MB | ~100 MB | Excellent |
| 500 | ~1.5 GB | ~200 MB | Very Good |
| 1000 | ~3 GB | ~400 MB | Good |
| 2000+ | ~6 GB+ | ~800 MB+ | Requires Optimization |

### 🔧 Optimization Tips
- **WebGL Rendering**: Hardware-accelerated visualization
- **Selective Broadcasting**: Only send changed data via WebSocket
- **Memory Management**: Efficient Mesa model reuse
- **Code Splitting**: Lazy loading of components

## 🛠️ Development

### 📋 Available Scripts

#### Backend
```bash
# Development server
python main.py

# With debug logging
LOG_LEVEL=DEBUG python main.py

# Tests
python -m pytest
```

#### Frontend
```bash
# Development server
npm start

# Type checking
npm run type-check

# Production build
npm run build

# Tests
npm test
```

### 🎨 Code Quality
```bash
# Python formatting
black . --line-length 88

# TypeScript linting
npm run lint
```

## 🤝 Contributing

### 👥 Development Workflow
1. **Fork** the repository
2. **Create feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit changes**: `git commit -m 'Add amazing feature'`
4. **Push to branch**: `git push origin feature/amazing-feature`
5. **Create Pull Request**

### 📝 Code Style Guidelines
- **Python**: Black formatter + Type hints
- **TypeScript**: ESLint + Prettier + Strict types
- **Commits**: Conventional Commits format
- **Documentation**: Comprehensive inline comments

## 📄 License

**MIT License**

Copyright (c) 2024 Infinimind Creations

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

## 👨‍💻 Author & Organization

**Created by**: [Cytrex](https://github.com/cytrex) at [Infinimind Creations](https://github.com/infinimind-creations)

*Infinimind Creations* develops cutting-edge simulation and research platforms that push the boundaries of computational social science and agent-based modeling.

## 🙏 Acknowledgments

- **[Mesa Framework](https://mesa.readthedocs.io/)** - Agent-Based Modeling foundation
- **[FastAPI](https://fastapi.tiangolo.com/)** - Modern Python web framework
- **[React Team](https://react.dev/)** - Frontend UI framework
- **[Deck.GL Team](https://deck.gl/)** - WebGL visualizations
- **Open Source Community** - Countless contributors and maintainers

## 🛠️ Troubleshooting

If you encounter issues during installation or deployment:

- **[DEPLOYMENT_PRODUCTION.md](DEPLOYMENT_PRODUCTION.md)** - Complete troubleshooting guide with solutions for 12+ common issues
- Covers networking, dependencies, configuration, and performance optimization
- All known installation issues have been resolved and documented

## 📞 Support & Contact

- **🐛 Bug Reports**: [GitHub Issues](../../issues)
- **💡 Feature Requests**: [GitHub Discussions](../../discussions)
- **📧 Email**: [cytrex@infinimind.dev](mailto:cytrex@infinimind.dev)
- **🏢 Organization**: [Infinimind Creations](https://github.com/infinimind-creations)

---

<div align="center">

**🔬 Developed for Political Simulation Research 🔬**

*Agent-Based Modeling • Political Systems • Socio-Economic Dynamics*

[![GitHub Stars](https://img.shields.io/github/stars/infinimind-creations/abm2-digital-lab?style=social)](#)
[![Contributors](https://img.shields.io/github/contributors/infinimind-creations/abm2-digital-lab)](#)

</div>