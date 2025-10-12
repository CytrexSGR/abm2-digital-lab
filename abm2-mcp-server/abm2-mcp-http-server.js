#!/usr/bin/env node
/**
 * ABM² Digital Lab MCP HTTP Server
 * Provides MCP protocol over HTTP for remote access
 *
 * Usage: node abm2-mcp-http-server.js [PORT]
 * Environment: PORT (default: 3002)
 */

const http = require('http');
const https = require('https');
const { URL } = require('url');
const fs = require('fs');
const path = require('path');
const { getLogger, LogLevel } = require('./logger');
const { retryWithBackoff, withGracefulDegradation } = require('./retry-utils');
const { generateSystemStatus, generateSimulationReport } = require('./report-generator');

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
        console.log('[ABM2 MCP HTTP] Loaded .env file');
    }
}

loadEnv();

const PORT = parseInt(process.argv[2] || process.env.PORT || '3002');
const ABM2_API_URL = process.env.ABM2_API_URL || 'http://localhost:8000';
const ABM2_USERNAME = process.env.ABM2_USERNAME || 'admin';
const ABM2_PASSWORD = process.env.ABM2_PASSWORD || '';

// Initialize structured logger
const logger = getLogger({
    logDir: '/tmp',
    serviceName: 'abm2-mcp-http',
    minLevel: process.env.LOG_LEVEL ? parseInt(process.env.LOG_LEVEL) : LogLevel.INFO
});

logger.logStartup(PORT, {
    ABM2_API_URL,
    ABM2_PASSWORD
});

function makeHttpRequest(endpoint, method = 'GET', body = null, requiresAuth = false, requestId = null) {
    const startTime = Date.now();

    return new Promise((resolve, reject) => {
        const url = new URL(endpoint, ABM2_API_URL);
        const isHttps = url.protocol === 'https:';
        const httpModule = isHttps ? https : http;

        const headers = {
            'Content-Type': 'application/json',
            'User-Agent': 'ABM2-MCP-Server/1.0.0'
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
            timeout: 120000
        };

        logger.debug('Backend API request starting', {
            requestId: requestId,
            endpoint: endpoint,
            method: method,
            requiresAuth: requiresAuth
        });

        const req = httpModule.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                const duration = Date.now() - startTime;

                try {
                    const result = {
                        status: res.statusCode,
                        data: data ? JSON.parse(data) : null
                    };

                    logger.logHttpRequest(endpoint, method, res.statusCode, duration, requestId);
                    resolve(result);
                } catch (e) {
                    logger.warning('Failed to parse backend response', {
                        requestId: requestId,
                        endpoint: endpoint,
                        error: e.message
                    });

                    resolve({
                        status: res.statusCode,
                        data: data,
                        parseError: e.message
                    });
                }
            });
        });

        req.on('error', (error) => {
            const duration = Date.now() - startTime;

            // Attach status code for error classification
            error.statusCode = error.statusCode || null;

            logger.error('Backend API request failed', {
                requestId: requestId,
                endpoint: endpoint,
                method: method,
                error: error.message,
                error_code: error.code,
                duration_ms: duration
            });
            reject(error);
        });

        req.on('timeout', () => {
            const duration = Date.now() - startTime;
            logger.error('Backend API request timeout', {
                requestId: requestId,
                endpoint: endpoint,
                method: method,
                duration_ms: duration
            });
            req.destroy();
            reject(new Error('Request timeout'));
        });

        if (body) {
            req.write(body);
        }
        req.end();
    });
}

// MCP Tools Definition (importing from bridge logic)
const MCP_TOOLS = [
    {
        name: 'abm2_reset_simulation',
        description: 'Reset the simulation and create a new model',
        inputSchema: {
            type: 'object',
            properties: {
                num_agents: { type: 'number', default: 100 },
                network_connections: { type: 'number', default: 5 }
            }
        }
    },
    {
        name: 'abm2_step_simulation',
        description: 'Advance simulation by one step',
        inputSchema: { type: 'object', properties: {} }
    },
    {
        name: 'abm2_get_simulation_data',
        description: 'Get current simulation state',
        inputSchema: { type: 'object', properties: {} }
    },
    {
        name: 'abm2_health_check',
        description: 'Check system health',
        inputSchema: { type: 'object', properties: {} }
    },
    {
        name: 'abm2_list_formulas',
        description: 'List all available formulas in the Formula Registry',
        inputSchema: { type: 'object', properties: {} }
    },
    {
        name: 'abm2_get_formula',
        description: 'Get detailed information about a specific formula including its expression, inputs, tests, and versions',
        inputSchema: {
            type: 'object',
            properties: {
                name: {
                    type: 'string',
                    description: 'Formula name (e.g., investment_amount, hazard_prob_next, political_position_economic)'
                }
            },
            required: ['name']
        }
    },
    {
        name: 'abm2_get_formula_versions',
        description: 'Get version history of a specific formula',
        inputSchema: {
            type: 'object',
            properties: {
                name: { type: 'string', description: 'Formula name' }
            },
            required: ['name']
        }
    },
    {
        name: 'abm2_query_agents',
        description: 'Query and filter agents with powerful filtering and aggregations. Solves the problem of too much data by returning only what you need.',
        inputSchema: {
            type: 'object',
            properties: {
                filters: {
                    type: 'object',
                    description: 'Filter conditions. Examples: {"vermoegen": {"min": 50000, "max": 100000}} for range, {"milieu": ["Links-Liberal"]} for list, {"region": "Prosperous Metropolis"} for exact match'
                },
                fields: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'Specific fields to return (default: id, vermoegen, einkommen, region, milieu, political_position). Available: alter, risikoaversion, sozialleistungen, effektive_kognitive_kapazitaet, etc.'
                },
                limit: {
                    type: 'number',
                    default: 100,
                    description: 'Maximum number of agents to return'
                },
                aggregations: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'Aggregations to compute: "count", "mean_<field>", "sum_<field>", "std_<field>", "min_<field>", "max_<field>", "distribution_<field>", "percentile_<N>_<field>"'
                }
            }
        }
    },
    {
        name: 'abm2_get_time_series',
        description: 'Get time series data for metrics over simulation steps. Enables trend analysis like "Does inequality increase over time?"',
        inputSchema: {
            type: 'object',
            properties: {
                metrics: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'Metric paths using dot notation. Examples: "model_report.Gini_Vermoegen", "model_report.Mean_Altruism", "model_report.Hazard_Events_Count", "model_report.Regions.Urban"'
                },
                start_step: {
                    type: 'number',
                    default: 0,
                    description: 'Starting step (default: 0)'
                },
                end_step: {
                    type: 'number',
                    description: 'Ending step (null = current step)'
                }
            },
            required: ['metrics']
        }
    },
    {
        name: 'abm2_get_system_status',
        description: 'Get comprehensive system status including backend health, available tools, and recent activity. Useful for debugging and understanding the current state.',
        inputSchema: {
            type: 'object',
            properties: {}
        }
    },
    {
        name: 'abm2_generate_report',
        description: 'Generate a comprehensive markdown report of the current simulation state, including agent statistics, trends, and key insights. Can export as markdown file.',
        inputSchema: {
            type: 'object',
            properties: {
                include_agents: {
                    type: 'boolean',
                    default: false,
                    description: 'Include detailed agent list in report'
                },
                include_history: {
                    type: 'boolean',
                    default: true,
                    description: 'Include time series trends'
                },
                format: {
                    type: 'string',
                    enum: ['markdown', 'json'],
                    default: 'markdown',
                    description: 'Report format'
                }
            }
        }
    },
    // === EXPERIMENT RUNNER ===
    {
        name: 'abm2_create_experiment',
        description: 'Create a new computational experiment with treatments for causal testing',
        inputSchema: {
            type: 'object',
            properties: {
                name: { type: 'string', description: 'Experiment name' },
                description: { type: 'string', description: 'Experiment description' },
                baseline_config: { type: 'object', description: 'Base simulation configuration' },
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
                target_steps: { type: 'number', description: 'Number of simulation steps', default: 100 }
            },
            required: ['name', 'description', 'baseline_config', 'treatments']
        }
    },
    {
        name: 'abm2_list_experiments',
        description: 'List all experiments (sorted by creation date, newest first)',
        inputSchema: { type: 'object', properties: {} }
    },
    {
        name: 'abm2_get_experiment',
        description: 'Get experiment definition by ID',
        inputSchema: {
            type: 'object',
            properties: {
                experiment_id: { type: 'string', description: 'Experiment UUID' }
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
                experiment_id: { type: 'string', description: 'Experiment UUID' }
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
                experiment_id: { type: 'string', description: 'Experiment UUID' }
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
                experiment_id: { type: 'string', description: 'Experiment UUID' },
                metric: {
                    type: 'string',
                    description: 'Metric to compare',
                    enum: ['gini', 'avg_wealth', 'avg_income', 'mean_altruism', 'top10_share'],
                    default: 'gini'
                }
            },
            required: ['experiment_id']
        }
    }
];

async function handleToolCall(toolName, args, requestId = null) {
    const startTime = Date.now();
    logger.logRequest(toolName, args, requestId);

    let result;

    // Configure retry options based on operation type
    const getRetryOptions = (operationType) => {
        // Read operations: more retries, shorter delays
        if (operationType === 'read') {
            return {
                maxRetries: 3,
                initialDelayMs: 500,
                maxDelayMs: 5000,
                onRetry: (attempt, maxRetries, delay, error) => {
                    logger.warning(`Retrying ${toolName}`, {
                        requestId: requestId,
                        attempt: attempt,
                        maxRetries: maxRetries,
                        delay_ms: delay,
                        error: error.message
                    });
                }
            };
        }
        // Write operations: fewer retries, longer delays
        else {
            return {
                maxRetries: 2,
                initialDelayMs: 1000,
                maxDelayMs: 8000,
                onRetry: (attempt, maxRetries, delay, error) => {
                    logger.warning(`Retrying ${toolName}`, {
                        requestId: requestId,
                        attempt: attempt,
                        maxRetries: maxRetries,
                        delay_ms: delay,
                        error: error.message
                    });
                }
            };
        }
    };

    try {
        switch (toolName) {
            case 'abm2_reset_simulation':
                result = await retryWithBackoff(
                    () => makeHttpRequest('/api/simulation/reset', 'POST',
                        JSON.stringify({
                            num_agents: args.num_agents || 100,
                            network_connections: args.network_connections || 5
                        }), true, requestId),
                    getRetryOptions('write')
                );
                break;

            case 'abm2_step_simulation':
                result = await retryWithBackoff(
                    () => makeHttpRequest('/api/simulation/step', 'POST', null, true, requestId),
                    getRetryOptions('write')
                );
                break;

            case 'abm2_get_simulation_data':
                result = await retryWithBackoff(
                    () => makeHttpRequest('/api/simulation/data', 'GET', null, false, requestId),
                    getRetryOptions('read')
                );
                break;

            case 'abm2_health_check':
                // Use graceful degradation for health checks
                result = await withGracefulDegradation(
                    () => makeHttpRequest('/api/health', 'GET', null, false, requestId),
                    { status: 503, data: { status: 'unhealthy', message: 'Backend not reachable' } },
                    {
                        onError: (error) => {
                            logger.warning('Health check failed, returning degraded response', {
                                requestId: requestId,
                                error: error.message
                            });
                        }
                    }
                );
                break;

            case 'abm2_list_formulas':
                result = await retryWithBackoff(
                    () => makeHttpRequest('/api/formulas', 'GET', null, false, requestId),
                    getRetryOptions('read')
                );
                break;

            case 'abm2_get_formula':
                if (!args.name) {
                    throw new Error('Formula name is required');
                }
                result = await retryWithBackoff(
                    () => makeHttpRequest(`/api/formulas/${args.name}`, 'GET', null, false, requestId),
                    getRetryOptions('read')
                );
                break;

            case 'abm2_get_formula_versions':
                if (!args.name) {
                    throw new Error('Formula name is required');
                }
                result = await retryWithBackoff(
                    () => makeHttpRequest(`/api/versions/${args.name}`, 'GET', null, false, requestId),
                    getRetryOptions('read')
                );
                break;

            case 'abm2_query_agents':
                result = await retryWithBackoff(
                    () => makeHttpRequest('/api/agents/query', 'POST',
                        JSON.stringify({
                            filters: args.filters || null,
                            fields: args.fields || null,
                            limit: args.limit || 100,
                            aggregations: args.aggregations || null
                        }), true, requestId),
                    getRetryOptions('read')
                );
                break;

            case 'abm2_get_time_series':
                if (!args.metrics || args.metrics.length === 0) {
                    throw new Error('At least one metric is required');
                }
                // Build query string
                const params = new URLSearchParams();
                args.metrics.forEach(metric => params.append('metrics', metric));
                if (args.start_step !== undefined) {
                    params.append('start_step', args.start_step);
                }
                if (args.end_step !== undefined) {
                    params.append('end_step', args.end_step);
                }
                result = await retryWithBackoff(
                    () => makeHttpRequest(`/api/simulation/timeseries?${params.toString()}`, 'GET', null, false, requestId),
                    getRetryOptions('read')
                );
                break;

            case 'abm2_get_system_status':
                // Generate system status report
                const status = await generateSystemStatus({
                    makeHttpRequest: (endpoint, method, body, auth) =>
                        makeHttpRequest(endpoint, method, body, auth, requestId),
                    tools: MCP_TOOLS,
                    requestId: requestId
                });
                result = { status: 200, data: status };
                break;

            case 'abm2_generate_report':
                // Generate simulation report
                const report = await generateSimulationReport({
                    makeHttpRequest: (endpoint, method, body, auth) =>
                        makeHttpRequest(endpoint, method, body, auth, requestId),
                    includeAgents: args.include_agents || false,
                    includeHistory: args.include_history !== false,
                    format: args.format || 'markdown',
                    requestId: requestId
                });
                result = { status: 200, data: { report: report, format: args.format || 'markdown' } };
                break;

            // === EXPERIMENT RUNNER ===
            case 'abm2_create_experiment':
                result = await retryWithBackoff(
                    () => makeHttpRequest('/api/experiments', 'POST',
                        JSON.stringify({
                            name: args.name,
                            description: args.description,
                            baseline_config: args.baseline_config,
                            treatments: args.treatments,
                            target_steps: args.target_steps || 100
                        }), true, requestId),
                    getRetryOptions('write')
                );
                break;

            case 'abm2_list_experiments':
                result = await retryWithBackoff(
                    () => makeHttpRequest('/api/experiments', 'GET', null, false, requestId),
                    getRetryOptions('read')
                );
                break;

            case 'abm2_get_experiment':
                if (!args.experiment_id) {
                    throw new Error('experiment_id is required');
                }
                result = await retryWithBackoff(
                    () => makeHttpRequest(`/api/experiments/${args.experiment_id}`, 'GET', null, false, requestId),
                    getRetryOptions('read')
                );
                break;

            case 'abm2_run_experiment':
                if (!args.experiment_id) {
                    throw new Error('experiment_id is required');
                }
                // Longer timeout for experiment execution
                result = await retryWithBackoff(
                    () => makeHttpRequest(`/api/experiments/${args.experiment_id}/run`, 'POST', null, true, requestId),
                    { maxRetries: 1, initialDelayMs: 2000, maxDelayMs: 10000 }
                );
                break;

            case 'abm2_get_experiment_results':
                if (!args.experiment_id) {
                    throw new Error('experiment_id is required');
                }
                result = await retryWithBackoff(
                    () => makeHttpRequest(`/api/experiments/${args.experiment_id}/results`, 'GET', null, false, requestId),
                    getRetryOptions('read')
                );
                break;

            case 'abm2_compare_treatments':
                if (!args.experiment_id) {
                    throw new Error('experiment_id is required');
                }
                const metric = args.metric || 'gini';
                result = await retryWithBackoff(
                    () => makeHttpRequest(`/api/experiments/${args.experiment_id}/compare?metric=${metric}`, 'GET', null, false, requestId),
                    getRetryOptions('read')
                );
                break;

            default:
                throw new Error(`Unknown tool: ${toolName}`);
        }

        const duration = Date.now() - startTime;
        logger.logResponse(toolName, true, duration, requestId);
        return result;

    } catch (error) {
        const duration = Date.now() - startTime;
        logger.logResponse(toolName, false, duration, requestId, error.message);
        throw error;
    }
}

// HTTP Server
const server = http.createServer(async (req, res) => {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    const url = new URL(req.url, `http://${req.headers.host}`);

    // Health check
    if (url.pathname === '/health' && req.method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'healthy', service: 'abm2-mcp-http' }));
        return;
    }

    // MCP tools endpoint
    if (url.pathname === '/tools' && req.method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ tools: MCP_TOOLS }));
        return;
    }

    // MCP call endpoint
    if (url.pathname === '/call' && req.method === 'POST') {
        const requestId = logger.generateRequestId();
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', async () => {
            try {
                const { method, params } = JSON.parse(body);
                const result = await handleToolCall(method, params || {}, requestId);

                if (result.status >= 200 && result.status < 300) {
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ result: result.data }));
                } else {
                    res.writeHead(result.status, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: result.data }));
                }
            } catch (error) {
                logger.error('Tool call failed', {
                    requestId: requestId,
                    error: error.message,
                    stack: error.stack
                });
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: error.message }));
            }
        });
        return;
    }

    // MCP protocol endpoint (JSON-RPC)
    if (url.pathname === '/mcp' && req.method === 'POST') {
        const requestId = logger.generateRequestId();
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', async () => {
            try {
                const request = JSON.parse(body);
                const { method, params, id } = request;

                logger.debug('MCP JSON-RPC request', {
                    requestId: requestId,
                    method: method,
                    rpcId: id
                });

                let result;

                if (method === 'initialize') {
                    result = {
                        protocolVersion: '2024-11-05',
                        serverInfo: {
                            name: 'abm2-digital-lab',
                            version: '1.0.0'
                        },
                        capabilities: {
                            tools: {}
                        }
                    };
                    logger.info('MCP client initialized', { requestId: requestId });
                } else if (method === 'tools/list') {
                    result = { tools: MCP_TOOLS };
                } else if (method === 'tools/call') {
                    const toolResult = await handleToolCall(params.name, params.arguments || {}, requestId);
                    result = {
                        content: [{
                            type: 'text',
                            text: JSON.stringify(toolResult.data, null, 2)
                        }]
                    };
                } else {
                    throw new Error(`Unknown method: ${method}`);
                }

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    jsonrpc: '2.0',
                    id: id,
                    result: result
                }));

            } catch (error) {
                logger.error('MCP JSON-RPC error', {
                    requestId: requestId,
                    error: error.message,
                    stack: error.stack
                });
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    jsonrpc: '2.0',
                    id: null,
                    error: {
                        code: -32603,
                        message: error.message
                    }
                }));
            }
        });
        return;
    }

    // 404
    res.writeHead(404);
    res.end('Not Found');
});

server.listen(PORT, '0.0.0.0', () => {
    logger.info('Server ready', {
        port: PORT,
        endpoints: ['/health', '/tools', '/call', '/mcp'],
        tools_count: MCP_TOOLS.length
    });
    console.log(`[ABM2 MCP HTTP] Server listening on http://0.0.0.0:${PORT}`);
    console.log(`[ABM2 MCP HTTP] Endpoints:`);
    console.log(`  - GET  /health     - Health check`);
    console.log(`  - GET  /tools      - List available tools`);
    console.log(`  - POST /call       - Execute tool`);
    console.log(`  - POST /mcp        - MCP JSON-RPC endpoint`);
    console.log(`[ABM2 MCP HTTP] Logs: /tmp/abm2-mcp-http.log, /tmp/abm2-mcp-http-errors.log`);
});

// Graceful shutdown
process.on('SIGINT', () => {
    logger.logShutdown('SIGINT received');
    server.close(() => {
        logger.info('Server closed');
        process.exit(0);
    });
});

process.on('SIGTERM', () => {
    logger.logShutdown('SIGTERM received');
    server.close(() => {
        logger.info('Server closed');
        process.exit(0);
    });
});
