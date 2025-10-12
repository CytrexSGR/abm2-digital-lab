# MCP Integration Guide - ABM² Digital Lab

**Status:** Active
**Last Updated:** 2025-10-12
**Target Audience:** Developers, AI Tool Users, Claude Desktop Users

---

## Overview

ABM² Digital Lab features a comprehensive **Model Context Protocol (MCP)** integration that makes all simulation capabilities available to Claude Desktop and other MCP-compatible clients. This enables natural language interaction with complex agent-based simulations.

### What is MCP?

The Model Context Protocol is Anthropic's standard for connecting AI assistants to external tools and data sources. Our MCP server exposes **40+ tools** covering every aspect of ABM² simulation control and configuration.

## Key Features

### 🎯 Complete Simulation Control
- Reset simulations with custom parameters
- Execute single or multiple simulation steps
- Query simulation state and agent data
- Real-time monitoring and data export

### ⚙️ Configuration Management
- Get/set full simulation configuration
- Patch specific configuration sections
- Manage biomes, milieus, media sources
- Load and save preset configurations

### 🧮 Formula Registry Access
- Create and validate custom formulas
- Compile and test formulas
- Release formulas to production
- Manage formula versioning and pins

### 📊 Experiment Runner
- Design multi-treatment experiments
- Run controlled computational experiments
- Statistical comparison of treatments
- Export experiment results

### 📝 Audit & Monitoring
- Query audit logs with filters
- Track configuration changes
- Monitor formula registry operations
- Custom audit markers

## Installation

### Prerequisites

- **Node.js:** 14.0.0 or higher
- **ABM² Backend:** Running on `http://localhost:8000` (or configured URL)
- **Claude Desktop:** Latest version (for Claude Desktop integration)

### Quick Setup

1. **Navigate to MCP server directory:**

```bash
cd /home/cytrex/abm2-digital-lab/abm2-mcp-server
```

2. **Install dependencies:**

```bash
npm install
```

3. **Configure environment (optional):**

Create `.env` file:

```bash
ABM2_API_URL=http://localhost:8000
ABM2_USERNAME=admin
ABM2_PASSWORD=your_password
DEBUG=false
```

## Claude Desktop Integration

### Configuration

Add to your Claude Desktop configuration file:

**Location:**
- **Windows:** `%APPDATA%\Claude\claude_desktop_config.json`
- **Mac:** `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Linux:** `~/.config/Claude/claude_desktop_config.json`

**Configuration:**

```json
{
  "mcpServers": {
    "abm2-digital-lab": {
      "command": "node",
      "args": [
        "/home/cytrex/abm2-digital-lab/abm2-mcp-server/abm2-mcp-bridge.js"
      ],
      "env": {
        "ABM2_API_URL": "http://localhost:8000",
        "ABM2_USERNAME": "admin",
        "ABM2_PASSWORD": "your_password",
        "DEBUG": "false"
      }
    }
  }
}
```

### Network Configuration

For remote access, configure with full URL:

```json
{
  "mcpServers": {
    "abm2-digital-lab": {
      "command": "node",
      "args": [
        "/home/cytrex/abm2-digital-lab/abm2-mcp-server/abm2-mcp-bridge.js",
        "http://192.168.178.77:8000"
      ],
      "env": {
        "ABM2_USERNAME": "admin",
        "ABM2_PASSWORD": "your_password"
      }
    }
  }
}
```

### Verification

After configuration:

1. **Restart Claude Desktop**
2. **Test connection:** "List all available ABM2 tools"
3. **Verify:** Claude should show 40+ ABM2 tools

## Available Tools (40+)

### Simulation Control (4 tools)

| Tool | Description | Example Use |
|------|-------------|-------------|
| `abm2_reset_simulation` | Reset with new parameters | "Start simulation with 200 agents" |
| `abm2_step_simulation` | Execute simulation steps | "Run 10 simulation steps" |
| `abm2_get_simulation_data` | Get current state | "Show current simulation state" |
| `abm2_health_check` | System health check | "Check if ABM2 is running" |

### Configuration Management (3 tools)

| Tool | Description | Example Use |
|------|-------------|-------------|
| `abm2_get_config` | Get full configuration | "Show current configuration" |
| `abm2_set_config` | Set full configuration | "Update configuration with..." |
| `abm2_patch_config` | Partial update | "Change number of agents to 150" |

### Preset Management (4 tools)

| Tool | Description | Example Use |
|------|-------------|-------------|
| `abm2_list_presets` | List presets by section | "Show all biome presets" |
| `abm2_get_preset` | Load specific preset | "Load urban biome preset" |
| `abm2_save_preset` | Save new preset | "Save current config as preset" |
| `abm2_delete_preset` | Delete preset | "Delete old preset" |

### Media & Milieus (8 tools)

| Tool | Description |
|------|-------------|
| `abm2_get_media_sources` | Get media configuration |
| `abm2_set_media_sources` | Update media sources |
| `abm2_get_milieus` | Get milieu configuration |
| `abm2_set_milieus` | Update milieus |
| `abm2_get_initial_milieus` | Get initial milieus |
| `abm2_set_initial_milieus` | Update initial milieus |
| `abm2_get_output_schablonen` | Get output templates |
| `abm2_set_output_schablonen` | Update output templates |

### Recording & Export (4 tools)

| Tool | Description | Example Use |
|------|-------------|-------------|
| `abm2_start_recording` | Start CSV recording | "Start recording as 'experiment1'" |
| `abm2_stop_recording` | Stop recording | "Stop recording" |
| `abm2_list_recordings` | List all recordings | "Show all recordings" |
| `abm2_get_recording` | Download recording | "Download latest recording" |

### Formula Registry (9 tools)

| Tool | Description | Example Use |
|------|-------------|-------------|
| `abm2_list_formulas` | List all formulas | "Show all available formulas" |
| `abm2_get_formula` | Get formula details | "Show details of wealth formula" |
| `abm2_create_formula` | Create/update formula | "Create new investment formula" |
| `abm2_validate_formula` | Validate syntax | "Validate formula syntax" |
| `abm2_compile_formula` | Compile formula | "Compile formula for testing" |
| `abm2_test_formula` | Test with data | "Test formula with sample data" |
| `abm2_release_formula` | Release to production | "Release formula v1.2" |
| `abm2_get_pins` | Get pin configuration | "Show pinned formulas" |
| `abm2_set_pins` | Update pins | "Pin formula version" |

### Experiment Runner (6 tools)

| Tool | Description | Example Use |
|------|-------------|-------------|
| `abm2_create_experiment` | Create experiment | "Create A/B test experiment" |
| `abm2_list_experiments` | List all experiments | "Show all experiments" |
| `abm2_get_experiment` | Get experiment details | "Show experiment details" |
| `abm2_run_experiment` | Execute experiment | "Run experiment with 10 treatments" |
| `abm2_get_experiment_results` | Get results | "Show experiment results" |
| `abm2_compare_treatments` | Statistical comparison | "Compare treatment outcomes" |

### Audit System (2 tools)

| Tool | Description | Example Use |
|------|-------------|-------------|
| `abm2_get_audit_logs` | Query audit logs | "Show recent audit logs" |
| `abm2_add_audit_mark` | Custom audit entry | "Add audit marker for deployment" |

## Usage Examples

### Basic Simulation

```
User: "Start a new simulation with 150 agents and 5 network connections"
Claude: [Uses abm2_reset_simulation]
        "Simulation reset with 150 agents and 5 connections"

User: "Run 20 simulation steps"
Claude: [Uses abm2_step_simulation 20 times]
        "Completed 20 simulation steps. Current metrics: Gini=0.34, ..."

User: "Show me the wealth distribution"
Claude: [Uses abm2_get_simulation_data]
        [Analyzes and presents wealth statistics]
```

### Configuration Management

```
User: "Load the 'urban_focus' biome preset"
Claude: [Uses abm2_get_preset('biomes', 'urban_focus')]
        "Loaded urban focus configuration with 70% urban population"

User: "Change the hazard probability to 0.05"
Claude: [Uses abm2_patch_config]
        "Updated hazard probability to 0.05"
```

### Experiment Design

```
User: "Create an experiment comparing different altruism levels"
Claude: [Uses abm2_create_experiment]
        "Created experiment 'altruism-comparison' with 3 treatments"

User: "Run the experiment with 5 runs per treatment"
Claude: [Uses abm2_run_experiment]
        "Running experiment... [progress updates]"
        "Results: Treatment A vs B: p=0.023 (significant), Cohen's d=0.67"
```

### Formula Development

```
User: "Create a new formula for calculating political influence"
Claude: [Uses abm2_create_formula]
        "Created draft formula 'political_influence_v1'"

User: "Validate the formula syntax"
Claude: [Uses abm2_validate_formula]
        "Formula validated successfully. No syntax errors."

User: "Test with sample data"
Claude: [Uses abm2_test_formula]
        "Test passed. Result: 0.73 for given parameters"

User: "Release version 1.0"
Claude: [Uses abm2_release_formula]
        "Formula released as v1.0 and available for use"
```

### Data Analysis

```
User: "Start recording the next simulation"
Claude: [Uses abm2_start_recording]
        "Recording started as 'simulation_2025-10-12'"

User: "Run 100 steps"
Claude: [Uses abm2_step_simulation x100]
        "Completed 100 steps with recording active"

User: "Stop recording and show me the file"
Claude: [Uses abm2_stop_recording, abm2_list_recordings]
        "Recording stopped. File: simulation_2025-10-12.csv (2.4 MB)"
```

## HTTP Server Mode

For advanced use cases, the MCP server can run as an HTTP service:

### Start HTTP Server

```bash
cd abm2-mcp-server
node abm2-mcp-http-server.js
```

Server runs on `http://localhost:3002`

### Client Connection

```bash
node abm2-mcp-http-client.js
```

This enables:
- Remote MCP access
- Multi-client support
- Web-based integrations
- Load balancing

## Troubleshooting

### Claude Desktop doesn't see the MCP server

**Check:**
1. Verify paths in `claude_desktop_config.json`
2. Ensure Node.js is installed: `node --version`
3. View logs: Help > View Logs in Claude Desktop
4. Test manually: `node abm2-mcp-bridge.js`

### Connection to ABM2 API fails

**Solutions:**
1. Verify backend is running: `curl http://localhost:8000/api/health`
2. Check `ABM2_API_URL` in configuration
3. Verify network connectivity
4. Check firewall settings

### Authentication errors

**Solutions:**
1. Verify `ABM2_USERNAME` and `ABM2_PASSWORD` are correct
2. Check backend authentication settings
3. Test credentials: `curl -u admin:password http://localhost:8000/api/health`

### Debug mode

Enable detailed logging:

```json
{
  "env": {
    "DEBUG": "true"
  }
}
```

Logs appear in Claude Desktop logs (Help > View Logs)

## Testing

### Manual Testing

```bash
# Test MCP server directly
node test-abm2-mcp.js

# Run full test suite
node test-suite.js
```

### Automated Testing

```bash
# Test all tools
npm test

# Test specific functionality
node test-abm2-mcp.js --tool=reset_simulation
```

## Advanced Configuration

### Custom API Endpoint

```bash
# Environment variable
export ABM2_API_URL=https://abm2.research.university.edu

# Or command line argument
node abm2-mcp-bridge.js https://abm2.research.university.edu
```

### Proxy Configuration

```bash
export HTTP_PROXY=http://proxy.company.com:8080
export HTTPS_PROXY=https://proxy.company.com:8443
```

### Timeout Settings

Edit `abm2-mcp-bridge.js`:

```javascript
const API_TIMEOUT = 30000; // 30 seconds (default: 10s)
```

## Architecture

### Components

```
┌─────────────────────────────────────────────────────────┐
│                   Claude Desktop                        │
│                   (MCP Client)                          │
└─────────────────┬───────────────────────────────────────┘
                  │ MCP Protocol (stdio/HTTP)
┌─────────────────▼───────────────────────────────────────┐
│              abm2-mcp-bridge.js                         │
│              (MCP Server)                               │
│  ┌──────────────────────────────────────────────────┐   │
│  │ Tool Definitions (40+ tools)                     │   │
│  │ - Simulation Control                             │   │
│  │ - Configuration Management                       │   │
│  │ - Formula Registry                               │   │
│  │ - Experiment Runner                              │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────┬───────────────────────────────────────┘
                  │ HTTP/REST API
┌─────────────────▼───────────────────────────────────────┐
│              ABM² Backend (FastAPI)                     │
│                 Port: 8000                              │
└─────────────────────────────────────────────────────────┘
```

### Data Flow

1. **User → Claude Desktop:** Natural language request
2. **Claude → MCP Server:** Tool invocation via MCP protocol
3. **MCP Server → ABM2 API:** HTTP REST call
4. **ABM2 API → Simulation:** Execute operation
5. **Simulation → ABM2 API:** Return results
6. **ABM2 API → MCP Server:** JSON response
7. **MCP Server → Claude:** Formatted result
8. **Claude → User:** Natural language response with data

## Security Considerations

### Authentication

- All authenticated endpoints require `ABM2_USERNAME` and `ABM2_PASSWORD`
- Credentials stored in environment variables (not in config file)
- HTTP Basic Auth for API communication

### Network Security

- Localhost-only by default (`127.0.0.1`)
- HTTPS recommended for remote access
- Firewall rules for production deployments

### Audit Trail

- All operations logged via audit system
- User tracking (via MCP user context)
- Operation timestamps and request IDs

## Performance

### Tool Invocation Overhead

- **Average latency:** <100ms per tool call
- **Simulation step:** 50-200ms depending on agent count
- **Configuration updates:** <50ms
- **Data retrieval:** <30ms

### Optimization Tips

1. **Batch operations:** Use multi-step simulation instead of single steps
2. **Selective data retrieval:** Request only needed fields
3. **Caching:** MCP server caches configuration data
4. **Connection pooling:** HTTP keep-alive enabled

## Limitations

### Current Limitations

- **Concurrent simulations:** Not supported (single simulation instance)
- **WebSocket support:** Not yet exposed via MCP
- **Real-time streaming:** Limited to polling-based updates
- **File uploads:** Limited to inline JSON payloads

### Planned Features

- [ ] WebSocket tool for real-time updates
- [ ] Batch tool execution
- [ ] Simulation state snapshots
- [ ] Enhanced visualization data
- [ ] Multi-simulation support

## Resources

### Documentation

- **MCP Server README:** `/abm2-mcp-server/README.md`
- **Tool Reference:** `/abm2-mcp-server/TOOLS.md`
- **Setup Guide:** `/abm2-mcp-server/SETUP.md`
- **HTTP Mode:** `/abm2-mcp-server/SETUP-HTTP.md`
- **Experiment Runner:** `/abm2-mcp-server/EXPERIMENT_RUNNER_MCP.md`

### External Links

- **MCP Specification:** https://modelcontextprotocol.io
- **Claude Desktop:** https://claude.ai/desktop
- **ABM² GitHub:** https://github.com/infinimind-creations/abm2-digital-lab

### Support

- **GitHub Issues:** https://github.com/infinimind-creations/abm2-digital-lab/issues
- **Email:** cytrex@infinimind.dev
- **Documentation:** `/docs` directory in project

---

**Version:** 1.0.0
**Last Updated:** 2025-10-12
**Maintainer:** Infinimind Creations
