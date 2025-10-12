#!/usr/bin/env node
/**
 * ABM² MCP Server Test Suite
 * Validates all MCP tools and measures performance
 */

const http = require('http');

// Test configuration
const MCP_SERVER_HOST = process.env.MCP_SERVER_HOST || 'localhost';
const MCP_SERVER_PORT = process.env.MCP_SERVER_PORT || 3002;
const VERBOSE = process.env.VERBOSE === 'true';

// Test results
const results = {
    passed: 0,
    failed: 0,
    skipped: 0,
    tests: [],
    benchmarks: {}
};

/**
 * Make HTTP request to MCP server
 */
function makeRequest(path, method = 'GET', body = null) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: MCP_SERVER_HOST,
            port: MCP_SERVER_PORT,
            path: path,
            method: method,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        if (body) {
            options.headers['Content-Length'] = Buffer.byteLength(body);
        }

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    resolve({
                        statusCode: res.statusCode,
                        data: data ? JSON.parse(data) : null
                    });
                } catch (e) {
                    resolve({
                        statusCode: res.statusCode,
                        data: data,
                        parseError: e.message
                    });
                }
            });
        });

        req.on('error', reject);
        req.setTimeout(30000);

        if (body) {
            req.write(body);
        }
        req.end();
    });
}

/**
 * Call MCP tool
 */
async function callTool(toolName, params = {}) {
    const body = JSON.stringify({
        method: toolName,
        params: params
    });

    return await makeRequest('/call', 'POST', body);
}

/**
 * Test helper
 */
async function test(name, fn) {
    const testResult = {
        name: name,
        status: 'unknown',
        duration: 0,
        error: null
    };

    const startTime = Date.now();

    try {
        await fn();
        testResult.status = 'passed';
        results.passed++;
        process.stdout.write('✓');
    } catch (error) {
        testResult.status = 'failed';
        testResult.error = error.message;
        results.failed++;
        process.stdout.write('✗');
        if (VERBOSE) {
            console.log(`\n  Error: ${error.message}`);
        }
    }

    testResult.duration = Date.now() - startTime;
    results.tests.push(testResult);
}

/**
 * Assert helper
 */
function assert(condition, message) {
    if (!condition) {
        throw new Error(message || 'Assertion failed');
    }
}

/**
 * Benchmark helper
 */
async function benchmark(name, fn, iterations = 10) {
    const times = [];

    for (let i = 0; i < iterations; i++) {
        const start = Date.now();
        await fn();
        times.push(Date.now() - start);
    }

    const avg = times.reduce((a, b) => a + b, 0) / times.length;
    const min = Math.min(...times);
    const max = Math.max(...times);

    results.benchmarks[name] = {
        avg: avg.toFixed(2),
        min: min,
        max: max,
        iterations: iterations
    };
}

/**
 * Run all tests
 */
async function runTests() {
    console.log('ABM² MCP Server Test Suite');
    console.log('==========================\n');

    // Test 1: Server health
    await test('Server /health endpoint responds', async () => {
        const res = await makeRequest('/health');
        assert(res.statusCode === 200, 'Health check should return 200');
        assert(res.data.status === 'healthy', 'Status should be healthy');
    });

    // Test 2: Tools list
    await test('Server /tools endpoint returns tools', async () => {
        const res = await makeRequest('/tools');
        assert(res.statusCode === 200, 'Tools endpoint should return 200');
        assert(Array.isArray(res.data.tools), 'Should return tools array');
        assert(res.data.tools.length >= 11, 'Should have at least 11 tools');
    });

    // Test 3: Health check tool
    await test('abm2_health_check tool works', async () => {
        const res = await callTool('abm2_health_check');
        assert(res.statusCode === 200, 'Tool should return 200');
        assert(res.data.result, 'Should have result');
    });

    // Test 4: Get simulation data
    await test('abm2_get_simulation_data tool works', async () => {
        const res = await callTool('abm2_get_simulation_data');
        assert(res.statusCode === 200, 'Tool should return 200');
        assert(res.data.result.step !== undefined, 'Should have step');
    });

    // Test 5: List formulas
    await test('abm2_list_formulas tool works', async () => {
        const res = await callTool('abm2_list_formulas');
        assert(res.statusCode === 200, 'Tool should return 200');
        assert(Array.isArray(res.data.result), 'Should return array of formulas');
    });

    // Test 6: Get specific formula
    await test('abm2_get_formula tool works', async () => {
        const res = await callTool('abm2_get_formula', { name: 'investment_amount' });
        assert(res.statusCode === 200, 'Tool should return 200');
        assert(res.data.result.name === 'investment_amount', 'Should return correct formula');
    });

    // Test 7: Query agents
    await test('abm2_query_agents tool works', async () => {
        const res = await callTool('abm2_query_agents', {
            limit: 10,
            aggregations: ['count', 'mean_vermoegen']
        });
        assert(res.statusCode === 200, 'Tool should return 200');
        assert(res.data.result.count !== undefined, 'Should have count');
        assert(res.data.result.aggregations, 'Should have aggregations');
    });

    // Test 8: Query agents with filters
    await test('abm2_query_agents with filters works', async () => {
        const res = await callTool('abm2_query_agents', {
            filters: { vermoegen: { min: 50000 } },
            limit: 5
        });
        assert(res.statusCode === 200, 'Tool should return 200');
        assert(Array.isArray(res.data.result.agents), 'Should have agents array');
    });

    // Test 9: Get time series
    await test('abm2_get_time_series tool works', async () => {
        const res = await callTool('abm2_get_time_series', {
            metrics: ['model_report.Gini_Vermoegen']
        });
        assert(res.statusCode === 200, 'Tool should return 200');
        assert(res.data.result.step, 'Should have step array');
        assert(res.data.result.metrics, 'Should have metrics');
    });

    // Test 10: System status
    await test('abm2_get_system_status tool works', async () => {
        const res = await callTool('abm2_get_system_status');
        assert(res.statusCode === 200, 'Tool should return 200');
        assert(res.data.result.mcp_server, 'Should have MCP server info');
        assert(res.data.result.backend, 'Should have backend info');
    });

    // Test 11: Generate report
    await test('abm2_generate_report tool works (markdown)', async () => {
        const res = await callTool('abm2_generate_report', {
            include_agents: false,
            include_history: true,
            format: 'markdown'
        });
        assert(res.statusCode === 200, 'Tool should return 200');
        assert(res.data.result.report, 'Should have report');
        assert(res.data.result.report.includes('# ABM²'), 'Report should be markdown');
    });

    // Test 12: Generate report (JSON)
    await test('abm2_generate_report tool works (json)', async () => {
        const res = await callTool('abm2_generate_report', {
            format: 'json'
        });
        assert(res.statusCode === 200, 'Tool should return 200');
        assert(res.data.result.report, 'Should have report');
        // Report should be parseable JSON
        JSON.parse(res.data.result.report);
    });

    // Test 13: Error handling - invalid tool
    await test('Unknown tool returns error', async () => {
        const res = await callTool('abm2_invalid_tool');
        assert(res.statusCode === 500, 'Should return 500 for unknown tool');
    });

    // Test 14: Error handling - missing required parameter
    await test('Missing required parameter returns error', async () => {
        const res = await callTool('abm2_get_formula', {}); // Missing 'name'
        assert(res.statusCode === 500, 'Should return 500 for missing param');
    });

    console.log('\n\nRunning benchmarks...\n');

    // Benchmark 1: Health check
    await benchmark('Health check', async () => {
        await callTool('abm2_health_check');
    }, 20);

    // Benchmark 2: Get simulation data
    await benchmark('Get simulation data', async () => {
        await callTool('abm2_get_simulation_data');
    }, 10);

    // Benchmark 3: Query agents
    await benchmark('Query agents (small)', async () => {
        await callTool('abm2_query_agents', { limit: 10 });
    }, 10);

    // Benchmark 4: Query agents with aggregations
    await benchmark('Query agents with aggregations', async () => {
        await callTool('abm2_query_agents', {
            limit: 100,
            aggregations: ['count', 'mean_vermoegen', 'distribution_milieu']
        });
    }, 5);

    console.log('✓ Benchmarks completed\n');
}

/**
 * Print results
 */
function printResults() {
    console.log('\n==========================');
    console.log('Test Results');
    console.log('==========================\n');

    console.log(`Total: ${results.passed + results.failed}`);
    console.log(`Passed: ${results.passed}`);
    console.log(`Failed: ${results.failed}`);
    console.log(`Success rate: ${((results.passed / (results.passed + results.failed)) * 100).toFixed(1)}%`);

    if (results.failed > 0) {
        console.log('\nFailed tests:');
        results.tests.filter(t => t.status === 'failed').forEach(t => {
            console.log(`  ✗ ${t.name}`);
            console.log(`    Error: ${t.error}`);
        });
    }

    console.log('\n==========================');
    console.log('Benchmarks');
    console.log('==========================\n');

    Object.entries(results.benchmarks).forEach(([name, stats]) => {
        console.log(`${name}:`);
        console.log(`  Average: ${stats.avg} ms`);
        console.log(`  Min: ${stats.min} ms`);
        console.log(`  Max: ${stats.max} ms`);
        console.log(`  Iterations: ${stats.iterations}`);
        console.log();
    });

    // Exit with error code if tests failed
    if (results.failed > 0) {
        process.exit(1);
    }
}

// Run tests
runTests()
    .then(printResults)
    .catch(error => {
        console.error('\n\nFatal error running tests:');
        console.error(error);
        process.exit(1);
    });
