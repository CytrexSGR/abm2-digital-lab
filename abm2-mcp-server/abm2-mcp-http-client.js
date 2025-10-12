#!/usr/bin/env node
/**
 * ABM² MCP HTTP Client
 * Connects Claude Desktop to ABM2 HTTP MCP Server
 * This runs on Windows/Claude Desktop side
 */

const http = require('http');
const { URL } = require('url');

const SERVER_URL = process.env.ABM2_MCP_SERVER_URL || 'http://192.168.178.77:3002';
const DEBUG = process.env.DEBUG === 'true';

function log(message, level = 'INFO') {
    if (DEBUG) {
        console.error(`[${new Date().toISOString()}] [${level}] ${message}`);
    }
}

function makeHttpRequest(method, path, data = null) {
    return new Promise((resolve, reject) => {
        const url = new URL(path, SERVER_URL);
        const options = {
            hostname: url.hostname,
            port: url.port,
            path: url.pathname,
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'Claude-Desktop-MCP-Client/1.0.0'
            },
            timeout: 60000
        };

        if (data) {
            const postData = JSON.stringify(data);
            options.headers['Content-Length'] = Buffer.byteLength(postData);
        }

        const req = http.request(options, (res) => {
            let responseData = '';
            res.on('data', (chunk) => {
                responseData += chunk;
            });
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(responseData);
                    resolve(parsed);
                } catch (e) {
                    resolve({ error: 'Invalid JSON response', raw: responseData, status: res.statusCode });
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        req.on('timeout', () => {
            req.destroy();
            reject(new Error('Request timeout'));
        });

        if (data) {
            req.write(JSON.stringify(data));
        }
        req.end();
    });
}

class ABM2McpHttpClient {
    constructor() {
        this.serverUrl = SERVER_URL;
        this.tools = [];
        console.error(`[ABM2 MCP Client] Connecting to ${this.serverUrl}`);
    }

    async initialize() {
        try {
            // Test connection
            const health = await makeHttpRequest('GET', '/health');
            if (health.status !== 'healthy') {
                throw new Error('Server not healthy');
            }

            // Load tools
            const toolsResponse = await makeHttpRequest('GET', '/tools');
            if (toolsResponse.tools) {
                this.tools = toolsResponse.tools;
                console.error(`[ABM2 MCP Client] Loaded ${this.tools.length} tools`);
            } else {
                throw new Error('Failed to load tools');
            }
        } catch (error) {
            console.error(`[ABM2 MCP Client] Initialization failed: ${error.message}`);
            throw error;
        }
    }

    async handleRequest(request) {
        log(`Handling MCP request: ${request.method}`);

        switch (request.method) {
            case 'initialize':
                return {
                    protocolVersion: '2024-11-05',
                    capabilities: {
                        tools: {}
                    },
                    serverInfo: {
                        name: 'abm2-digital-lab-client',
                        version: '1.0.0'
                    }
                };

            case 'tools/list':
                return {
                    tools: this.tools
                };

            case 'resources/list':
                return { resources: [] };

            case 'prompts/list':
                return { prompts: [] };

            case 'notifications/initialized':
                return null;

            case 'tools/call':
                const toolName = request.params.name;
                const args = request.params.arguments || {};

                try {
                    log(`Calling HTTP API: ${toolName} with args ${JSON.stringify(args)}`);

                    const response = await makeHttpRequest('POST', '/call', {
                        method: toolName,
                        params: args
                    });

                    if (response.error) {
                        return {
                            isError: true,
                            content: [
                                {
                                    type: 'text',
                                    text: `Error: ${JSON.stringify(response.error, null, 2)}`
                                }
                            ]
                        };
                    }

                    // Format response
                    let content;
                    if (response.result && typeof response.result === 'object') {
                        content = JSON.stringify(response.result, null, 2);
                    } else {
                        content = String(response.result || 'No result');
                    }

                    return {
                        content: [
                            {
                                type: 'text',
                                text: content
                            }
                        ]
                    };
                } catch (error) {
                    log(`HTTP request failed: ${error.message}`, 'ERROR');
                    return {
                        isError: true,
                        content: [
                            {
                                type: 'text',
                                text: `HTTP request failed: ${error.message}`
                            }
                        ]
                    };
                }

            default:
                throw new Error(`Unknown MCP method: ${request.method}`);
        }
    }
}

async function main() {
    const client = new ABM2McpHttpClient();

    try {
        await client.initialize();
        console.error('[ABM2 MCP Client] Initialized successfully');
    } catch (error) {
        console.error(`[ABM2 MCP Client] Failed: ${error.message}`);
        process.exit(1);
    }

    let buffer = '';

    process.stdin.on('data', async (chunk) => {
        buffer += chunk.toString();

        let lines = buffer.split('\n');
        buffer = lines.pop();

        for (const line of lines) {
            if (line.trim()) {
                let request = null;
                try {
                    request = JSON.parse(line);
                    log(`Received request: ${request.method}`);

                    const response = await client.handleRequest(request);

                    if (request.id !== undefined && response !== null) {
                        const responseMessage = {
                            jsonrpc: '2.0',
                            id: request.id,
                            result: response
                        };

                        process.stdout.write(JSON.stringify(responseMessage) + '\n');
                        log(`Sent response for: ${request.method}`);
                    } else if (response === null) {
                        log(`Processed notification: ${request.method}`);
                    }
                } catch (error) {
                    console.error(`[ABM2 MCP Client] Error: ${error.message}`);

                    const errorResponse = {
                        jsonrpc: '2.0',
                        id: request?.id || 0,
                        error: {
                            code: -32603,
                            message: error.message
                        }
                    };
                    process.stdout.write(JSON.stringify(errorResponse) + '\n');
                }
            }
        }
    });

    process.stdin.on('end', () => {
        log('Input stream ended');
        process.exit(0);
    });

    console.error('[ABM2 MCP Client] Ready for Claude Desktop');
}

if (require.main === module) {
    main().catch(error => {
        console.error(`[ABM2 MCP Client] Fatal: ${error.message}`);
        process.exit(1);
    });
}
