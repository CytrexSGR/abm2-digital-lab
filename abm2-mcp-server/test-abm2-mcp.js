#!/usr/bin/env node
/**
 * Test script for ABM² MCP Bridge
 * Tests connection and basic tool calls
 */

const { spawn } = require('child_process');
const readline = require('readline');

const ABM2_API_URL = process.env.ABM2_API_URL || 'http://localhost:8000';

console.log('=== ABM² MCP Bridge Test ===');
console.log(`Testing connection to: ${ABM2_API_URL}`);
console.log('');

// Start the bridge process
const bridge = spawn('node', ['abm2-mcp-bridge.js'], {
    env: {
        ...process.env,
        ABM2_API_URL: ABM2_API_URL,
        DEBUG: 'true'
    }
});

let responseCount = 0;
const expectedResponses = 4;

// Setup readline to handle responses
const rl = readline.createInterface({
    input: bridge.stdout,
    output: process.stdout,
    terminal: false
});

rl.on('line', (line) => {
    try {
        const response = JSON.parse(line);
        responseCount++;

        console.log(`\n[Response ${responseCount}]`);
        console.log(JSON.stringify(response, null, 2));

        if (responseCount >= expectedResponses) {
            console.log('\n=== All tests completed ===');
            bridge.kill();
            process.exit(0);
        }
    } catch (e) {
        console.error('Failed to parse response:', line);
    }
});

bridge.stderr.on('data', (data) => {
    console.error(`[Bridge Log] ${data.toString().trim()}`);
});

bridge.on('close', (code) => {
    console.log(`\nBridge process exited with code ${code}`);
});

// Wait a moment for the bridge to start
setTimeout(() => {
    console.log('\n=== Starting tests ===\n');

    // Test 1: Initialize
    console.log('[Test 1] Initialize...');
    bridge.stdin.write(JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'initialize',
        params: {
            protocolVersion: '2024-11-05',
            capabilities: {},
            clientInfo: {
                name: 'test-client',
                version: '1.0.0'
            }
        }
    }) + '\n');

    // Test 2: List tools
    setTimeout(() => {
        console.log('\n[Test 2] List tools...');
        bridge.stdin.write(JSON.stringify({
            jsonrpc: '2.0',
            id: 2,
            method: 'tools/list',
            params: {}
        }) + '\n');
    }, 1000);

    // Test 3: Health check
    setTimeout(() => {
        console.log('\n[Test 3] Call health check tool...');
        bridge.stdin.write(JSON.stringify({
            jsonrpc: '2.0',
            id: 3,
            method: 'tools/call',
            params: {
                name: 'abm2_health_check',
                arguments: {}
            }
        }) + '\n');
    }, 2000);

    // Test 4: Get config
    setTimeout(() => {
        console.log('\n[Test 4] Get configuration...');
        bridge.stdin.write(JSON.stringify({
            jsonrpc: '2.0',
            id: 4,
            method: 'tools/call',
            params: {
                name: 'abm2_get_config',
                arguments: {}
            }
        }) + '\n');
    }, 3000);

    // Timeout after 30 seconds
    setTimeout(() => {
        console.error('\n=== Test timeout ===');
        bridge.kill();
        process.exit(1);
    }, 30000);

}, 500);
