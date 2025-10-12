/**
 * Report Generator for ABM² MCP Server
 * Generates system status reports and simulation analysis reports
 */

const fs = require('fs');
const path = require('path');
const { generateSparkline, generateLineChart, generateBarChart, getTrendIndicator } = require('./chart-utils');

/**
 * Generate system status report
 * @param {Object} options - Options
 * @param {Function} options.makeHttpRequest - HTTP request function
 * @param {Array} options.tools - Available MCP tools
 * @param {string} options.requestId - Request ID
 * @returns {Promise<Object>} - System status
 */
async function generateSystemStatus(options) {
    const { makeHttpRequest, tools, requestId } = options;
    const status = {
        timestamp: new Date().toISOString(),
        mcp_server: {
            version: '1.2.0',
            tools_count: tools.length,
            tools_available: tools.map(t => t.name)
        },
        backend: {
            status: 'unknown',
            reachable: false
        },
        logs: {
            main_log: '/tmp/abm2-mcp-http.log',
            error_log: '/tmp/abm2-mcp-http-errors.log',
            backend_log: '/tmp/abm2-backend.log'
        }
    };

    // Check backend health
    try {
        const health = await makeHttpRequest('/api/health', 'GET', null, false, requestId);
        if (health.status === 200) {
            status.backend.status = 'healthy';
            status.backend.reachable = true;
            status.backend.response = health.data;
        } else {
            status.backend.status = 'unhealthy';
            status.backend.status_code = health.status;
        }
    } catch (error) {
        status.backend.status = 'error';
        status.backend.error = error.message;
        status.backend.reachable = false;
    }

    // Check simulation state
    if (status.backend.reachable) {
        try {
            const simData = await makeHttpRequest('/api/simulation/data', 'GET', null, false, requestId);
            if (simData.status === 200) {
                status.simulation = {
                    initialized: true,
                    step: simData.data.step,
                    num_agents: simData.data.num_agents,
                    history_size: simData.data.model_report ? 'available' : 'none'
                };
            }
        } catch (error) {
            status.simulation = {
                initialized: false,
                error: error.message
            };
        }
    }

    // Get log file sizes
    try {
        const logFiles = [
            '/tmp/abm2-mcp-http.log',
            '/tmp/abm2-mcp-http-errors.log',
            '/tmp/abm2-backend.log'
        ];

        status.logs.sizes = {};
        for (const logFile of logFiles) {
            try {
                const stats = fs.statSync(logFile);
                const sizeKB = (stats.size / 1024).toFixed(2);
                status.logs.sizes[path.basename(logFile)] = `${sizeKB} KB`;
            } catch (e) {
                status.logs.sizes[path.basename(logFile)] = 'not found';
            }
        }
    } catch (error) {
        status.logs.error = error.message;
    }

    return status;
}

/**
 * Generate simulation analysis report
 * @param {Object} options - Options
 * @param {Function} options.makeHttpRequest - HTTP request function
 * @param {boolean} options.includeAgents - Include agent details
 * @param {boolean} options.includeHistory - Include time series
 * @param {string} options.format - Output format
 * @param {string} options.requestId - Request ID
 * @returns {Promise<string>} - Report in specified format
 */
async function generateSimulationReport(options) {
    const { makeHttpRequest, includeAgents, includeHistory, format, requestId } = options;

    // Gather data
    const data = {
        timestamp: new Date().toISOString(),
        simulation: null,
        agents: null,
        timeSeries: null
    };

    // Get simulation state
    try {
        const simResp = await makeHttpRequest('/api/simulation/data', 'GET', null, false, requestId);
        if (simResp.status === 200) {
            data.simulation = simResp.data;
        }
    } catch (error) {
        data.errors = data.errors || [];
        data.errors.push(`Failed to get simulation data: ${error.message}`);
    }

    // Get agent data if requested
    if (includeAgents && data.simulation) {
        try {
            const agentsResp = await makeHttpRequest(
                '/api/agents/query',
                'POST',
                JSON.stringify({
                    limit: 100,
                    aggregations: [
                        'count',
                        'mean_vermoegen',
                        'std_vermoegen',
                        'distribution_milieu',
                        'distribution_region'
                    ]
                }),
                true,
                requestId
            );
            if (agentsResp.status === 200) {
                data.agents = agentsResp.data;
            }
        } catch (error) {
            data.errors = data.errors || [];
            data.errors.push(`Failed to query agents: ${error.message}`);
        }
    }

    // Get time series if requested
    if (includeHistory && data.simulation && data.simulation.step > 0) {
        try {
            const tsResp = await makeHttpRequest(
                '/api/simulation/timeseries?metrics=model_report.Gini_Vermoegen&metrics=model_report.Mean_Altruism&metrics=model_report.Hazard_Events_Count&metrics=model_report.Durchschnittsvermoegen&metrics=model_report.Polarization',
                'GET',
                null,
                false,
                requestId
            );
            if (tsResp.status === 200) {
                data.timeSeries = tsResp.data;
            }
        } catch (error) {
            data.errors = data.errors || [];
            data.errors.push(`Failed to get time series: ${error.message}`);
        }
    }

    // Generate report based on format
    if (format === 'json') {
        return JSON.stringify(data, null, 2);
    } else {
        return generateMarkdownReport(data);
    }
}

/**
 * Generate markdown report from data
 * @param {Object} data - Report data
 * @returns {string} - Markdown report
 */
function generateMarkdownReport(data) {
    let md = '# ABM² Digital Lab - Simulation Report\n\n';
    md += `**Generated:** ${data.timestamp}\n\n`;

    // Errors
    if (data.errors && data.errors.length > 0) {
        md += '## ⚠️ Errors\n\n';
        data.errors.forEach(err => {
            md += `- ${err}\n`;
        });
        md += '\n';
    }

    // Simulation overview
    if (data.simulation) {
        md += '## Simulation Overview\n\n';
        md += `- **Step:** ${data.simulation.step}\n`;
        md += `- **Agents:** ${data.simulation.num_agents}\n`;

        if (data.simulation.model_report) {
            md += '\n### Key Metrics\n\n';
            const report = data.simulation.model_report;

            // Core metrics
            md += `- **Gini Coefficient (Wealth):** ${report.Gini_Vermoegen?.toFixed(3) || 'N/A'}\n`;
            md += `- **Gini Coefficient (Income):** ${report.Gini_Einkommen?.toFixed(3) || 'N/A'}\n`;
            md += `- **Mean Altruism:** ${report.Mean_Altruism?.toFixed(3) || 'N/A'}\n`;
            md += `- **Mean Wealth:** ${report.Durchschnittsvermoegen?.toFixed(0) || report.Mean_Vermoegen?.toFixed(0) || 'N/A'}\n`;
            md += `- **Mean Income:** ${report.Durchschnittseinkommen?.toFixed(0) || report.Mean_Einkommen?.toFixed(0) || 'N/A'}\n`;

            // Hazard events
            if (report.Hazard_Events_Count !== undefined) {
                md += `- **Hazard Events:** ${report.Hazard_Events_Count}\n`;
            }

            // Polarization
            if (report.Polarization !== undefined) {
                md += `- **Political Polarization:** ${report.Polarization?.toFixed(3) || 'N/A'}\n`;
            }

            if (report.Regions) {
                md += '\n### Regional Distribution\n\n';
                md += '```\n';
                md += generateBarChart(report.Regions, { maxWidth: 30, showValues: true });
                md += '```\n';
            }

            if (report.Milieus) {
                md += '\n### Milieu Distribution\n\n';
                md += '```\n';
                md += generateBarChart(report.Milieus, { maxWidth: 30, showValues: true });
                md += '```\n';
            }
        }
    }

    // Agent analysis
    if (data.agents) {
        md += '\n## Agent Analysis\n\n';

        if (data.agents.aggregations) {
            const agg = data.agents.aggregations;

            md += `- **Total Agents:** ${agg.count || 0}\n`;
            md += `- **Mean Wealth:** ${agg.mean_vermoegen?.toFixed(0) || 'N/A'}\n`;
            md += `- **Wealth Std Dev:** ${agg.std_vermoegen?.toFixed(0) || 'N/A'}\n`;

            if (agg.distribution_milieu) {
                md += '\n### Milieu Distribution\n\n';
                Object.entries(agg.distribution_milieu).forEach(([milieu, count]) => {
                    md += `- **${milieu}:** ${count}\n`;
                });
            }

            if (agg.distribution_region) {
                md += '\n### Regional Distribution\n\n';
                Object.entries(agg.distribution_region).forEach(([region, count]) => {
                    md += `- **${region}:** ${count}\n`;
                });
            }
        }
    }

    // Time series trends
    if (data.timeSeries && data.timeSeries.metrics) {
        md += '\n## Trends Over Time\n\n';

        const metrics = data.timeSeries.metrics;
        const steps = data.timeSeries.step || [];

        // Gini trend
        if (metrics['model_report.Gini_Vermoegen']) {
            const giniData = metrics['model_report.Gini_Vermoegen'];
            const giniStart = giniData[0];
            const giniEnd = giniData[giniData.length - 1];
            const giniChange = giniEnd - giniStart;

            md += `### Inequality (Gini Coefficient)\n\n`;
            md += `- **Trend:** ${getTrendIndicator(giniChange)}\n`;
            md += `- **Start:** ${giniStart?.toFixed(3)}\n`;
            md += `- **End:** ${giniEnd?.toFixed(3)}\n`;
            md += `- **Sparkline:** ${generateSparkline(giniData, 50)}\n\n`;

            // Add line chart for longer series
            if (giniData.length > 5) {
                md += '```\n';
                md += generateLineChart(giniData, {
                    height: 8,
                    width: 50,
                    label: 'Gini Coefficient Over Time'
                });
                md += '```\n\n';
            }
        }

        // Altruism trend
        if (metrics['model_report.Mean_Altruism']) {
            const altData = metrics['model_report.Mean_Altruism'];
            const altStart = altData[0];
            const altEnd = altData[altData.length - 1];
            const altChange = altEnd - altStart;

            md += `### Altruism\n\n`;
            md += `- **Trend:** ${getTrendIndicator(altChange)}\n`;
            md += `- **Start:** ${altStart?.toFixed(3)}\n`;
            md += `- **End:** ${altEnd?.toFixed(3)}\n`;
            md += `- **Sparkline:** ${generateSparkline(altData, 50)}\n\n`;
        }

        // Wealth trend
        if (metrics['model_report.Durchschnittsvermoegen']) {
            const wealthData = metrics['model_report.Durchschnittsvermoegen'];
            const wealthStart = wealthData[0];
            const wealthEnd = wealthData[wealthData.length - 1];
            const wealthChange = wealthEnd - wealthStart;

            md += `### Average Wealth\n\n`;
            md += `- **Trend:** ${getTrendIndicator(wealthChange, 100)}\n`;
            md += `- **Start:** ${wealthStart?.toFixed(0)}\n`;
            md += `- **End:** ${wealthEnd?.toFixed(0)}\n`;
            md += `- **Sparkline:** ${generateSparkline(wealthData, 50)}\n\n`;
        }

        // Hazard events trend
        if (metrics['model_report.Hazard_Events_Count']) {
            const hazardData = metrics['model_report.Hazard_Events_Count'];
            const totalHazards = hazardData.reduce((sum, val) => sum + (val || 0), 0);
            const maxHazards = Math.max(...hazardData);

            md += `### Hazard Events\n\n`;
            md += `- **Total Events:** ${totalHazards}\n`;
            md += `- **Max per Step:** ${maxHazards}\n`;
            md += `- **Average per Step:** ${(totalHazards / hazardData.length).toFixed(2)}\n\n`;
        }

        // Polarization trend
        if (metrics['model_report.Polarization']) {
            const polData = metrics['model_report.Polarization'];
            const polStart = polData[0];
            const polEnd = polData[polData.length - 1];
            const polChange = polEnd - polStart;
            const polTrend = polChange > 0 ? '📈 Increasing' : polChange < 0 ? '📉 Decreasing' : '➡️ Stable';

            md += `### Political Polarization\n\n`;
            md += `- **Trend:** ${polTrend}\n`;
            md += `- **Start:** ${polStart?.toFixed(3)}\n`;
            md += `- **End:** ${polEnd?.toFixed(3)}\n`;
            md += `- **Change:** ${polChange > 0 ? '+' : ''}${polChange.toFixed(3)}\n\n`;
        }
    }

    md += '\n---\n\n';
    md += '*Report generated by ABM² MCP Server*\n';

    return md;
}

module.exports = {
    generateSystemStatus,
    generateSimulationReport
};
