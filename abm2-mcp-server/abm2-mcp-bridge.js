#!/usr/bin/env node
/**
 * ABM² Digital Lab MCP Bridge Server
 * Exposes all ABM2 simulation functions via Model Context Protocol
 *
 * Usage: node abm2-mcp-bridge.js [ABM2_API_URL]
 * Environment: ABM2_API_URL (default: http://localhost:8000)
 *             ABM2_USERNAME, ABM2_PASSWORD for authentication
 */

const http = require('http');
const https = require('https');
const { URL } = require('url');
const fs = require('fs');
const path = require('path');

// Simple .env file loader
function loadEnv() {
    const envPath = path.join(__dirname, '.env');
    if (fs.existsSync(envPath)) {
        const envFile = fs.readFileSync(envPath, 'utf8');
        envFile.split('\n').forEach(line => {
            line = line.trim();
            if (line && !line.startsWith('#')) {
                const [key, ...valueParts] = line.split('=');
                const value = valueParts.join('=').trim();
                if (key && value && !process.env[key]) {
                    process.env[key] = value;
                }
            }
        });
        console.error('[ABM2 MCP Bridge] Loaded .env file');
    }
}

// Load .env file first
loadEnv();

const ABM2_API_URL = process.argv[2] || process.env.ABM2_API_URL || 'http://localhost:8000';
const ABM2_USERNAME = process.env.ABM2_USERNAME || 'admin';
const ABM2_PASSWORD = process.env.ABM2_PASSWORD || '';
const DEBUG = process.env.DEBUG === 'true';

console.error(`[ABM2 MCP Bridge] Starting with API URL: ${ABM2_API_URL}`);
console.error(`[ABM2 MCP Bridge] Username: ${ABM2_USERNAME}`);
console.error(`[ABM2 MCP Bridge] Password configured: ${ABM2_PASSWORD ? 'Yes (' + ABM2_PASSWORD.length + ' chars)' : 'No'}`);

function log(message, level = 'INFO') {
    if (DEBUG || level === 'ERROR') {
        console.error(`[${new Date().toISOString()}] [${level}] ${message}`);
    }
}

function makeHttpRequest(endpoint, method = 'GET', body = null, requiresAuth = false) {
    return new Promise((resolve, reject) => {
        const url = new URL(endpoint, ABM2_API_URL);
        const isHttps = url.protocol === 'https:';
        const httpModule = isHttps ? https : http;

        const headers = {
            'Content-Type': 'application/json',
            'User-Agent': 'ABM2-MCP-Bridge/1.0.0'
        };

        if (requiresAuth && ABM2_USERNAME && ABM2_PASSWORD) {
            const auth = Buffer.from(`${ABM2_USERNAME}:${ABM2_PASSWORD}`).toString('base64');
            headers['Authorization'] = `Basic ${auth}`;
        }

        if (body) {
            headers['Content-Length'] = Buffer.byteLength(body);
        }

        const options = {
            hostname: url.hostname,
            port: url.port || (isHttps ? 443 : 80),
            path: url.pathname + url.search,
            method: method,
            headers: headers,
            timeout: 120000  // 2 minutes for long-running operations
        };

        const req = httpModule.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const result = {
                        status: res.statusCode,
                        data: data ? JSON.parse(data) : null
                    };
                    resolve(result);
                } catch (e) {
                    resolve({
                        status: res.statusCode,
                        data: data,
                        parseError: e.message
                    });
                }
            });
        });

        req.on('error', reject);
        req.on('timeout', () => {
            req.destroy();
            reject(new Error('Request timeout'));
        });

        if (body) {
            req.write(body);
        }
        req.end();
    });
}

class ABM2McpBridge {
    constructor() {
        this.serverInfo = {
            name: 'abm2-digital-lab',
            version: '1.0.0',
            description: 'ABM² Digital Lab - Agent-Based Modeling Platform for Political & Socio-Ecological Simulations'
        };

        // Define all available MCP tools based on ABM2 API
        this.tools = this.defineTools();
    }

    defineTools() {
        return [
            // === SIMULATION CONTROL ===
            {
                name: 'abm2_reset_simulation',
                description: 'Reset the simulation and create a new model with specified parameters',
                inputSchema: {
                    type: 'object',
                    properties: {
                        num_agents: {
                            type: 'number',
                            description: 'Number of agents to create (default: 100)',
                            default: 100
                        },
                        network_connections: {
                            type: 'number',
                            description: 'Number of network connections per agent (default: 5)',
                            default: 5
                        }
                    }
                }
            },
            {
                name: 'abm2_step_simulation',
                description: 'Advance the simulation by one step',
                inputSchema: {
                    type: 'object',
                    properties: {}
                }
            },
            {
                name: 'abm2_get_simulation_data',
                description: 'Get current simulation state without advancing (includes all metrics, agents, biomes)',
                inputSchema: {
                    type: 'object',
                    properties: {}
                }
            },
            {
                name: 'abm2_health_check',
                description: 'Check system health and status',
                inputSchema: {
                    type: 'object',
                    properties: {}
                }
            },

            // === CONFIGURATION MANAGEMENT ===
            {
                name: 'abm2_get_config',
                description: 'Get the complete simulation configuration (biomes, agent dynamics, parameters)',
                inputSchema: {
                    type: 'object',
                    properties: {}
                }
            },
            {
                name: 'abm2_set_config',
                description: 'Set a new complete configuration (requires authentication)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        config: {
                            type: 'object',
                            description: 'Complete FullConfig object with all parameters'
                        }
                    },
                    required: ['config']
                }
            },
            {
                name: 'abm2_patch_config',
                description: 'Update parts of the configuration with deep merge (requires authentication)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        config_patch: {
                            type: 'object',
                            description: 'Partial configuration object to merge'
                        }
                    },
                    required: ['config_patch']
                }
            },

            // === PRESET MANAGEMENT ===
            {
                name: 'abm2_list_presets',
                description: 'List all available presets for a configuration section',
                inputSchema: {
                    type: 'object',
                    properties: {
                        section_name: {
                            type: 'string',
                            description: 'Section name (e.g., biomes, milieus, media_sources)',
                            enum: ['biomes', 'milieus', 'media_sources', 'output_schablonen', 'agent_dynamics']
                        }
                    },
                    required: ['section_name']
                }
            },
            {
                name: 'abm2_get_preset',
                description: 'Load a specific preset configuration',
                inputSchema: {
                    type: 'object',
                    properties: {
                        section_name: {
                            type: 'string',
                            description: 'Section name'
                        },
                        preset_name: {
                            type: 'string',
                            description: 'Preset name'
                        }
                    },
                    required: ['section_name', 'preset_name']
                }
            },
            {
                name: 'abm2_save_preset',
                description: 'Save or overwrite a preset (requires authentication)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        section_name: {
                            type: 'string',
                            description: 'Section name'
                        },
                        preset_name: {
                            type: 'string',
                            description: 'Preset name'
                        },
                        data: {
                            type: 'object',
                            description: 'Preset configuration data'
                        }
                    },
                    required: ['section_name', 'preset_name', 'data']
                }
            },
            {
                name: 'abm2_delete_preset',
                description: 'Delete a preset (requires authentication)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        section_name: {
                            type: 'string',
                            description: 'Section name'
                        },
                        preset_name: {
                            type: 'string',
                            description: 'Preset name'
                        }
                    },
                    required: ['section_name', 'preset_name']
                }
            },

            // === MEDIA SOURCES ===
            {
                name: 'abm2_get_media_sources',
                description: 'Get all configured media sources',
                inputSchema: {
                    type: 'object',
                    properties: {}
                }
            },
            {
                name: 'abm2_set_media_sources',
                description: 'Set media sources configuration (requires authentication)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        media_sources: {
                            type: 'array',
                            description: 'Array of MediaSourceConfig objects'
                        }
                    },
                    required: ['media_sources']
                }
            },

            // === MILIEUS ===
            {
                name: 'abm2_get_milieus',
                description: 'Get milieu configuration',
                inputSchema: {
                    type: 'object',
                    properties: {}
                }
            },
            {
                name: 'abm2_set_milieus',
                description: 'Set milieu configuration (requires authentication)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        milieus: {
                            type: 'array',
                            description: 'Array of MilieuConfig objects'
                        }
                    },
                    required: ['milieus']
                }
            },
            {
                name: 'abm2_get_initial_milieus',
                description: 'Get initial milieu distribution',
                inputSchema: {
                    type: 'object',
                    properties: {}
                }
            },
            {
                name: 'abm2_set_initial_milieus',
                description: 'Set initial milieu distribution (requires authentication)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        initial_milieus: {
                            type: 'array',
                            description: 'Array of InitialMilieuConfig objects'
                        }
                    },
                    required: ['initial_milieus']
                }
            },

            // === OUTPUT SCHABLONEN ===
            {
                name: 'abm2_get_output_schablonen',
                description: 'Get output classification templates',
                inputSchema: {
                    type: 'object',
                    properties: {}
                }
            },
            {
                name: 'abm2_set_output_schablonen',
                description: 'Set output classification templates (requires authentication)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        schablonen: {
                            type: 'array',
                            description: 'Array of OutputSchabloneConfig objects'
                        }
                    },
                    required: ['schablonen']
                }
            },

            // === RECORDING & EXPORT ===
            {
                name: 'abm2_start_recording',
                description: 'Start CSV recording of simulation data',
                inputSchema: {
                    type: 'object',
                    properties: {
                        preset_name: {
                            type: 'string',
                            description: 'Name for the recording (will be part of filename)'
                        }
                    },
                    required: ['preset_name']
                }
            },
            {
                name: 'abm2_stop_recording',
                description: 'Stop the current CSV recording',
                inputSchema: {
                    type: 'object',
                    properties: {}
                }
            },
            {
                name: 'abm2_list_recordings',
                description: 'List all available CSV recordings',
                inputSchema: {
                    type: 'object',
                    properties: {}
                }
            },
            {
                name: 'abm2_get_recording',
                description: 'Download a specific CSV recording file',
                inputSchema: {
                    type: 'object',
                    properties: {
                        filename: {
                            type: 'string',
                            description: 'Recording filename'
                        }
                    },
                    required: ['filename']
                }
            },

            // === FORMULA REGISTRY ===
            {
                name: 'abm2_list_formulas',
                description: 'List all available formulas in the registry',
                inputSchema: {
                    type: 'object',
                    properties: {}
                }
            },
            {
                name: 'abm2_get_formula',
                description: 'Get details about a specific formula (all versions)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        formula_name: {
                            type: 'string',
                            description: 'Formula name (e.g., altruism_update)'
                        }
                    },
                    required: ['formula_name']
                }
            },
            {
                name: 'abm2_create_formula',
                description: 'Create or update a formula version (requires editor role)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        formula_name: {
                            type: 'string',
                            description: 'Formula name'
                        },
                        formula_data: {
                            type: 'object',
                            description: 'Formula definition (version, expression, inputs, tests)',
                            properties: {
                                version: { type: 'string' },
                                expression: { type: 'string' },
                                inputs: { type: 'array' },
                                tests: { type: 'object' }
                            }
                        }
                    },
                    required: ['formula_name', 'formula_data']
                }
            },
            {
                name: 'abm2_validate_formula',
                description: 'Validate a formula version',
                inputSchema: {
                    type: 'object',
                    properties: {
                        formula_name: {
                            type: 'string',
                            description: 'Formula name'
                        },
                        version: {
                            type: 'string',
                            description: 'Version to validate'
                        }
                    },
                    required: ['formula_name', 'version']
                }
            },
            {
                name: 'abm2_compile_formula',
                description: 'Compile a formula version to executable code',
                inputSchema: {
                    type: 'object',
                    properties: {
                        formula_name: {
                            type: 'string',
                            description: 'Formula name'
                        },
                        version: {
                            type: 'string',
                            description: 'Version to compile'
                        }
                    },
                    required: ['formula_name', 'version']
                }
            },
            {
                name: 'abm2_test_formula',
                description: 'Run tests for a formula version',
                inputSchema: {
                    type: 'object',
                    properties: {
                        formula_name: {
                            type: 'string',
                            description: 'Formula name'
                        },
                        version: {
                            type: 'string',
                            description: 'Version to test'
                        }
                    },
                    required: ['formula_name', 'version']
                }
            },
            {
                name: 'abm2_release_formula',
                description: 'Mark a formula version as released (requires approver role)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        formula_name: {
                            type: 'string',
                            description: 'Formula name'
                        },
                        version: {
                            type: 'string',
                            description: 'Version to release'
                        },
                        released_by: {
                            type: 'string',
                            description: 'Name of the person releasing'
                        }
                    },
                    required: ['formula_name', 'version', 'released_by']
                }
            },
            {
                name: 'abm2_get_pins',
                description: 'Get current formula pin configuration',
                inputSchema: {
                    type: 'object',
                    properties: {}
                }
            },
            {
                name: 'abm2_set_pins',
                description: 'Set formula pin configuration (requires operator role)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        pins: {
                            type: 'object',
                            description: 'Pin configuration object (formula_name: version)'
                        }
                    },
                    required: ['pins']
                }
            },
            {
                name: 'abm2_get_formula_versions',
                description: 'List all versions of a specific formula',
                inputSchema: {
                    type: 'object',
                    properties: {
                        formula_name: {
                            type: 'string',
                            description: 'Formula name'
                        }
                    },
                    required: ['formula_name']
                }
            },

            // === EXPERIMENT RUNNER ===
            {
                name: 'abm2_create_experiment',
                description: 'Create a new computational experiment with treatments for causal testing',
                inputSchema: {
                    type: 'object',
                    properties: {
                        name: {
                            type: 'string',
                            description: 'Experiment name'
                        },
                        description: {
                            type: 'string',
                            description: 'Experiment description'
                        },
                        baseline_config: {
                            type: 'object',
                            description: 'Base simulation configuration'
                        },
                        treatments: {
                            type: 'array',
                            description: 'Array of treatment configurations',
                            items: {
                                type: 'object',
                                properties: {
                                    name: { type: 'string' },
                                    config_modifications: { type: 'object' },
                                    num_runs: { type: 'number', default: 10 },
                                    color: { type: 'string', default: '#888888' }
                                }
                            }
                        },
                        target_steps: {
                            type: 'number',
                            description: 'Number of simulation steps to run',
                            default: 100
                        }
                    },
                    required: ['name', 'description', 'baseline_config', 'treatments']
                }
            },
            {
                name: 'abm2_list_experiments',
                description: 'List all experiments (sorted by creation date, newest first)',
                inputSchema: {
                    type: 'object',
                    properties: {}
                }
            },
            {
                name: 'abm2_get_experiment',
                description: 'Get experiment definition by ID',
                inputSchema: {
                    type: 'object',
                    properties: {
                        experiment_id: {
                            type: 'string',
                            description: 'Experiment UUID'
                        }
                    },
                    required: ['experiment_id']
                }
            },
            {
                name: 'abm2_run_experiment',
                description: 'Execute all treatments of an experiment (may take several minutes!)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        experiment_id: {
                            type: 'string',
                            description: 'Experiment UUID'
                        }
                    },
                    required: ['experiment_id']
                }
            },
            {
                name: 'abm2_get_experiment_results',
                description: 'Get complete results of a completed experiment with statistical tests',
                inputSchema: {
                    type: 'object',
                    properties: {
                        experiment_id: {
                            type: 'string',
                            description: 'Experiment UUID'
                        }
                    },
                    required: ['experiment_id']
                }
            },
            {
                name: 'abm2_compare_treatments',
                description: 'Get statistical comparison between treatments for a specific metric',
                inputSchema: {
                    type: 'object',
                    properties: {
                        experiment_id: {
                            type: 'string',
                            description: 'Experiment UUID'
                        },
                        metric: {
                            type: 'string',
                            description: 'Metric to compare',
                            enum: ['gini', 'avg_wealth', 'avg_income', 'mean_altruism', 'top10_share'],
                            default: 'gini'
                        }
                    },
                    required: ['experiment_id']
                }
            },

            // === AUDIT SYSTEM ===
            {
                name: 'abm2_get_audit_logs',
                description: 'Get audit logs with optional filters',
                inputSchema: {
                    type: 'object',
                    properties: {
                        limit: {
                            type: 'number',
                            description: 'Maximum number of entries'
                        },
                        offset: {
                            type: 'number',
                            description: 'Start offset'
                        },
                        action: {
                            type: 'string',
                            description: 'Filter by action'
                        },
                        formula: {
                            type: 'string',
                            description: 'Filter by formula name'
                        },
                        version: {
                            type: 'string',
                            description: 'Filter by version'
                        },
                        since: {
                            type: 'string',
                            description: 'Filter by start time (ISO datetime)'
                        },
                        until: {
                            type: 'string',
                            description: 'Filter by end time (ISO datetime)'
                        }
                    }
                }
            },
            {
                name: 'abm2_add_audit_mark',
                description: 'Add custom audit log entry (requires operator/approver role)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        action: {
                            type: 'string',
                            description: 'Action description'
                        },
                        details: {
                            type: 'object',
                            description: 'Additional details'
                        }
                    },
                    required: ['action']
                }
            }
        ];
    }

    async initialize(params) {
        log('Initializing ABM2 MCP Bridge...');

        try {
            // Test connection to ABM2 API
            const healthCheck = await makeHttpRequest('/api/health', 'GET');

            if (healthCheck.status !== 200) {
                throw new Error(`ABM2 API not available: HTTP ${healthCheck.status}`);
            }

            log(`Connected to ABM2 API at ${ABM2_API_URL}`);
            log(`Registry enabled: ${healthCheck.data.registry_enabled}`);

            return {
                protocolVersion: params.protocolVersion || '2024-11-05',
                serverInfo: this.serverInfo,
                capabilities: {
                    tools: { listChanged: false }
                }
            };
        } catch (error) {
            log(`Initialization failed: ${error.message}`, 'ERROR');
            throw error;
        }
    }

    async handleToolCall(name, args) {
        log(`Tool call: ${name} with args: ${JSON.stringify(args)}`);

        try {
            let result;

            switch (name) {
                // === SIMULATION CONTROL ===
                case 'abm2_reset_simulation':
                    result = await makeHttpRequest('/api/simulation/reset', 'POST',
                        JSON.stringify({
                            num_agents: args.num_agents || 100,
                            network_connections: args.network_connections || 5
                        }), true);
                    break;

                case 'abm2_step_simulation':
                    result = await makeHttpRequest('/api/simulation/step', 'POST', null, true);
                    break;

                case 'abm2_get_simulation_data':
                    result = await makeHttpRequest('/api/simulation/data', 'GET');
                    break;

                case 'abm2_health_check':
                    result = await makeHttpRequest('/api/health', 'GET');
                    break;

                // === CONFIGURATION ===
                case 'abm2_get_config':
                    result = await makeHttpRequest('/api/config', 'GET');
                    break;

                case 'abm2_set_config':
                    result = await makeHttpRequest('/api/config', 'POST',
                        JSON.stringify(args.config), true);
                    break;

                case 'abm2_patch_config':
                    result = await makeHttpRequest('/api/config', 'PATCH',
                        JSON.stringify(args.config_patch), true);
                    break;

                // === PRESETS ===
                case 'abm2_list_presets':
                    result = await makeHttpRequest(`/api/presets/${args.section_name}`, 'GET');
                    break;

                case 'abm2_get_preset':
                    result = await makeHttpRequest(`/api/presets/${args.section_name}/${args.preset_name}`, 'GET');
                    break;

                case 'abm2_save_preset':
                    result = await makeHttpRequest(`/api/presets/${args.section_name}/${args.preset_name}`,
                        'POST', JSON.stringify(args.data), true);
                    break;

                case 'abm2_delete_preset':
                    result = await makeHttpRequest(`/api/presets/${args.section_name}/${args.preset_name}`,
                        'DELETE', null, true);
                    break;

                // === MEDIA SOURCES ===
                case 'abm2_get_media_sources':
                    result = await makeHttpRequest('/api/media_sources', 'GET');
                    break;

                case 'abm2_set_media_sources':
                    result = await makeHttpRequest('/api/media_sources', 'POST',
                        JSON.stringify(args.media_sources), true);
                    break;

                // === MILIEUS ===
                case 'abm2_get_milieus':
                    result = await makeHttpRequest('/api/milieus', 'GET');
                    break;

                case 'abm2_set_milieus':
                    result = await makeHttpRequest('/api/milieus', 'POST',
                        JSON.stringify(args.milieus), true);
                    break;

                case 'abm2_get_initial_milieus':
                    result = await makeHttpRequest('/api/initial_milieus', 'GET');
                    break;

                case 'abm2_set_initial_milieus':
                    result = await makeHttpRequest('/api/initial_milieus', 'POST',
                        JSON.stringify(args.initial_milieus), true);
                    break;

                // === OUTPUT SCHABLONEN ===
                case 'abm2_get_output_schablonen':
                    result = await makeHttpRequest('/api/output_schablonen', 'GET');
                    break;

                case 'abm2_set_output_schablonen':
                    result = await makeHttpRequest('/api/output_schablonen', 'POST',
                        JSON.stringify(args.schablonen), true);
                    break;

                // === RECORDING ===
                case 'abm2_start_recording':
                    result = await makeHttpRequest('/api/recording/start', 'POST',
                        JSON.stringify({ preset_name: args.preset_name }), true);
                    break;

                case 'abm2_stop_recording':
                    result = await makeHttpRequest('/api/recording/stop', 'POST', null, true);
                    break;

                case 'abm2_list_recordings':
                    result = await makeHttpRequest('/api/recordings', 'GET');
                    break;

                case 'abm2_get_recording':
                    result = await makeHttpRequest(`/api/recordings/${args.filename}`, 'GET');
                    break;

                // === FORMULA REGISTRY ===
                case 'abm2_list_formulas':
                    result = await makeHttpRequest('/api/formulas', 'GET');
                    break;

                case 'abm2_get_formula':
                    result = await makeHttpRequest(`/api/formulas/${args.formula_name}`, 'GET');
                    break;

                case 'abm2_create_formula':
                    result = await makeHttpRequest(`/api/formulas/${args.formula_name}`, 'PUT',
                        JSON.stringify(args.formula_data), true);
                    break;

                case 'abm2_validate_formula':
                    result = await makeHttpRequest('/api/validate', 'POST',
                        JSON.stringify({ name: args.formula_name, version: args.version }), true);
                    break;

                case 'abm2_compile_formula':
                    result = await makeHttpRequest('/api/compile', 'POST',
                        JSON.stringify({ name: args.formula_name, version: args.version }), true);
                    break;

                case 'abm2_test_formula':
                    result = await makeHttpRequest('/api/test', 'POST',
                        JSON.stringify({ name: args.formula_name, version: args.version }), true);
                    break;

                case 'abm2_release_formula':
                    result = await makeHttpRequest('/api/release', 'POST',
                        JSON.stringify({
                            name: args.formula_name,
                            version: args.version,
                            released_by: args.released_by
                        }), true);
                    break;

                case 'abm2_get_pins':
                    result = await makeHttpRequest('/api/pins', 'GET');
                    break;

                case 'abm2_set_pins':
                    result = await makeHttpRequest('/api/pins', 'PUT',
                        JSON.stringify({ pins: args.pins }), true);
                    break;

                case 'abm2_get_formula_versions':
                    result = await makeHttpRequest(`/api/versions/${args.formula_name}`, 'GET');
                    break;

                // === EXPERIMENT RUNNER ===
                case 'abm2_create_experiment':
                    result = await makeHttpRequest('/api/experiments', 'POST',
                        JSON.stringify({
                            name: args.name,
                            description: args.description,
                            baseline_config: args.baseline_config,
                            treatments: args.treatments,
                            target_steps: args.target_steps || 100
                        }), true);
                    break;

                case 'abm2_list_experiments':
                    result = await makeHttpRequest('/api/experiments', 'GET');
                    break;

                case 'abm2_get_experiment':
                    result = await makeHttpRequest(`/api/experiments/${args.experiment_id}`, 'GET');
                    break;

                case 'abm2_run_experiment':
                    result = await makeHttpRequest(`/api/experiments/${args.experiment_id}/run`, 'POST', null, true);
                    break;

                case 'abm2_get_experiment_results':
                    result = await makeHttpRequest(`/api/experiments/${args.experiment_id}/results`, 'GET');
                    break;

                case 'abm2_compare_treatments':
                    const metric = args.metric || 'gini';
                    result = await makeHttpRequest(`/api/experiments/${args.experiment_id}/compare?metric=${metric}`, 'GET');
                    break;

                // === AUDIT ===
                case 'abm2_get_audit_logs':
                    const queryParams = new URLSearchParams();
                    if (args.limit) queryParams.append('limit', args.limit);
                    if (args.offset) queryParams.append('offset', args.offset);
                    if (args.action) queryParams.append('action', args.action);
                    if (args.formula) queryParams.append('formula', args.formula);
                    if (args.version) queryParams.append('version', args.version);
                    if (args.since) queryParams.append('since', args.since);
                    if (args.until) queryParams.append('until', args.until);

                    const queryString = queryParams.toString();
                    result = await makeHttpRequest(`/api/audit${queryString ? '?' + queryString : ''}`, 'GET');
                    break;

                case 'abm2_add_audit_mark':
                    result = await makeHttpRequest('/api/audit/mark', 'POST',
                        JSON.stringify({ action: args.action, details: args.details || {} }), true);
                    break;

                default:
                    throw new Error(`Unknown tool: ${name}`);
            }

            // Format response
            if (result.status >= 200 && result.status < 300) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(result.data, null, 2)
                        }
                    ]
                };
            } else {
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Error (HTTP ${result.status}): ${JSON.stringify(result.data, null, 2)}`
                        }
                    ],
                    isError: true
                };
            }

        } catch (error) {
            log(`Tool call failed: ${error.message}`, 'ERROR');
            return {
                content: [
                    {
                        type: 'text',
                        text: `Error: ${error.message}`
                    }
                ],
                isError: true
            };
        }
    }

    async handleRequest(request) {
        const { method, params, id } = request;

        try {
            let result;

            switch (method) {
                case 'initialize':
                    result = await this.initialize(params);
                    break;

                case 'tools/list':
                    result = { tools: this.tools };
                    break;

                case 'tools/call':
                    result = await this.handleToolCall(params.name, params.arguments);
                    break;

                case 'prompts/list':
                    result = { prompts: [] };
                    break;

                case 'resources/list':
                    result = { resources: [] };
                    break;

                case 'ping':
                    result = {};
                    break;

                default:
                    throw new Error(`Unknown method: ${method}`);
            }

            return {
                jsonrpc: '2.0',
                id: id,
                result: result
            };
        } catch (error) {
            return {
                jsonrpc: '2.0',
                id: id,
                error: {
                    code: -32603,
                    message: error.message
                }
            };
        }
    }

    start() {
        log('Starting stdio listener for MCP protocol...');

        let buffer = '';

        process.stdin.on('data', async (chunk) => {
            buffer += chunk.toString();

            let newlineIndex;
            while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
                const line = buffer.slice(0, newlineIndex).trim();
                buffer = buffer.slice(newlineIndex + 1);

                if (line) {
                    try {
                        const request = JSON.parse(line);
                        log(`Received: ${request.method}`);

                        // Notifications don't have an id and don't expect a response
                        if (request.method && request.method.includes('notifications/')) {
                            log('Notification received (no response needed)');
                            continue;
                        }

                        const response = await this.handleRequest(request);
                        process.stdout.write(JSON.stringify(response) + '\n');
                    } catch (error) {
                        log(`Error processing request: ${error.message}`, 'ERROR');

                        process.stdout.write(JSON.stringify({
                            jsonrpc: '2.0',
                            id: null,
                            error: {
                                code: -32700,
                                message: 'Parse error'
                            }
                        }) + '\n');
                    }
                }
            }
        });

        process.stdin.on('end', () => {
            log('stdin closed, exiting');
            process.exit(0);
        });

        process.on('SIGINT', () => {
            log('Received SIGINT, exiting');
            process.exit(0);
        });

        process.on('SIGTERM', () => {
            log('Received SIGTERM, exiting');
            process.exit(0);
        });

        log('ABM2 MCP Bridge ready for Claude Desktop');
    }
}

// Start the bridge
const bridge = new ABM2McpBridge();
bridge.start();
