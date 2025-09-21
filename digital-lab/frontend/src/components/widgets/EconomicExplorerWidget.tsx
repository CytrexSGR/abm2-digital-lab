import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ScatterChart, Scatter } from 'recharts';
import { useSimulationStore } from '../../store/useSimulationStore';
import Widget from './Widget';

type ViewMode = 'histogram' | 'correlation';

const EconomicExplorerWidget: React.FC = () => {
    const { simulationData } = useSimulationStore();
    const [viewMode, setViewMode] = useState<ViewMode>('histogram');

    // Process wealth distribution for histogram
    const processWealthDistribution = () => {
        if (!simulationData?.agent_visuals) return [];

        const agents = simulationData.agent_visuals;
        const wealthValues = agents
            .map(agent => agent.vermoegen || 0)
            .filter(wealth => wealth !== undefined);

        if (wealthValues.length === 0) return [];

        // Calculate histogram bins
        const min = Math.min(...wealthValues);
        const max = Math.max(...wealthValues);
        const binCount = 15;
        const binWidth = (max - min) / binCount;

        const bins = Array.from({ length: binCount }, (_, i) => ({
            binStart: min + i * binWidth,
            binEnd: min + (i + 1) * binWidth,
            count: 0,
            binLabel: `${(min + i * binWidth).toFixed(0)}-${(min + (i + 1) * binWidth).toFixed(0)}`
        }));

        // Fill bins
        wealthValues.forEach(wealth => {
            const binIndex = Math.min(Math.floor((wealth - min) / binWidth), binCount - 1);
            if (binIndex >= 0 && binIndex < binCount) {
                bins[binIndex].count++;
            }
        });

        return bins;
    };

    // Process correlation data (wealth vs income)
    const processCorrelationData = () => {
        if (!simulationData?.agent_visuals) return [];

        return simulationData.agent_visuals
            .filter(agent => agent.vermoegen !== undefined && agent.einkommen !== undefined)
            .map(agent => ({
                wealth: agent.vermoegen || 0,
                income: agent.einkommen || 0,
                region: agent.region || 'Unknown'
            }));
    };

    const histogramData = processWealthDistribution();
    const correlationData = processCorrelationData();

    // Custom tooltip for histogram
    const formatHistogramTooltip = (value: any, name: string) => {
        if (name === 'count') {
            return [`${value} agents`, 'Count'];
        }
        return [value, name];
    };

    // Custom tooltip for scatter plot
    const formatScatterTooltip = (value: any, name: string, props: any) => {
        if (props && props.payload) {
            const data = props.payload;
            return [
                [`Wealth: ${data.wealth?.toFixed(2)}`, ''],
                [`Income: ${data.income?.toFixed(2)}`, ''],
                [`Region: ${data.region}`, '']
            ];
        }
        return [value, name];
    };

    // Calculate correlation coefficient
    const calculateCorrelation = () => {
        if (correlationData.length < 2) return 0;

        const n = correlationData.length;
        const sumX = correlationData.reduce((sum, d) => sum + d.wealth, 0);
        const sumY = correlationData.reduce((sum, d) => sum + d.income, 0);
        const sumXY = correlationData.reduce((sum, d) => sum + d.wealth * d.income, 0);
        const sumX2 = correlationData.reduce((sum, d) => sum + d.wealth * d.wealth, 0);
        const sumY2 = correlationData.reduce((sum, d) => sum + d.income * d.income, 0);

        const numerator = n * sumXY - sumX * sumY;
        const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

        return denominator !== 0 ? numerator / denominator : 0;
    };

    const correlation = calculateCorrelation();

    return (
        <Widget title="Economic Explorer" widgetId="economicExplorer">
            <div style={{ width: '100%', height: '100%', minHeight: '300px' }}>
                {/* View Mode Controls */}
                <div style={{ 
                    marginBottom: '15px', 
                    padding: '10px',
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    borderRadius: '5px',
                    border: '1px solid var(--border-color)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button
                            onClick={() => setViewMode('histogram')}
                            style={{
                                padding: '6px 12px',
                                backgroundColor: viewMode === 'histogram' ? '#3498db' : 'transparent',
                                color: viewMode === 'histogram' ? 'white' : 'var(--text-color)',
                                border: `1px solid ${viewMode === 'histogram' ? '#3498db' : 'var(--border-color)'}`,
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '12px'
                            }}
                        >
                            Wealth Distribution
                        </button>
                        <button
                            onClick={() => setViewMode('correlation')}
                            style={{
                                padding: '6px 12px',
                                backgroundColor: viewMode === 'correlation' ? '#3498db' : 'transparent',
                                color: viewMode === 'correlation' ? 'white' : 'var(--text-color)',
                                border: `1px solid ${viewMode === 'correlation' ? '#3498db' : 'var(--border-color)'}`,
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '12px'
                            }}
                        >
                            Wealth vs Income
                        </button>
                    </div>
                    
                    {viewMode === 'correlation' && correlationData.length > 1 && (
                        <div style={{ 
                            fontSize: '12px', 
                            color: 'var(--text-color)',
                            fontFamily: 'monospace'
                        }}>
                            Correlation: {correlation.toFixed(3)}
                        </div>
                    )}
                </div>

                {/* Chart Content */}
                {!simulationData?.agent_visuals || simulationData.agent_visuals.length === 0 ? (
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: 'calc(100% - 80px)',
                        color: 'var(--text-color)',
                        fontSize: '14px'
                    }}>
                        No agent data available. Initialize and run simulation to explore economic patterns.
                    </div>
                ) : (
                    <div style={{ height: 'calc(100% - 80px)' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            {viewMode === 'histogram' ? (
                                <BarChart 
                                    data={histogramData} 
                                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                    <XAxis 
                                        dataKey="binLabel" 
                                        stroke="var(--text-color)"
                                        fontSize={10}
                                        angle={-45}
                                        textAnchor="end"
                                        height={80}
                                        label={{ 
                                            value: 'Wealth Range', 
                                            position: 'insideBottom', 
                                            offset: -10, 
                                            style: { textAnchor: 'middle', fill: 'var(--text-color)', fontSize: '11px' } 
                                        }}
                                    />
                                    <YAxis 
                                        stroke="var(--text-color)"
                                        fontSize={11}
                                        label={{ 
                                            value: 'Agent Count', 
                                            angle: -90, 
                                            position: 'insideLeft', 
                                            style: { textAnchor: 'middle', fill: 'var(--text-color)', fontSize: '11px' } 
                                        }}
                                    />
                                    <Tooltip 
                                        formatter={formatHistogramTooltip}
                                        contentStyle={{
                                            backgroundColor: 'var(--surface-color)',
                                            border: '1px solid var(--border-color)',
                                            borderRadius: '4px',
                                            color: 'var(--text-color)',
                                            fontSize: '12px'
                                        }}
                                        labelStyle={{ color: 'var(--text-color)', fontSize: '12px' }}
                                    />
                                    <Bar 
                                        dataKey="count" 
                                        fill="#3498db"
                                        fillOpacity={0.8}
                                    />
                                </BarChart>
                            ) : (
                                <ScatterChart 
                                    data={correlationData} 
                                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                    <XAxis 
                                        dataKey="wealth" 
                                        type="number"
                                        stroke="var(--text-color)"
                                        fontSize={11}
                                        label={{ 
                                            value: 'Wealth', 
                                            position: 'insideBottom', 
                                            offset: -5, 
                                            style: { textAnchor: 'middle', fill: 'var(--text-color)', fontSize: '11px' } 
                                        }}
                                    />
                                    <YAxis 
                                        dataKey="income" 
                                        type="number"
                                        stroke="var(--text-color)"
                                        fontSize={11}
                                        label={{ 
                                            value: 'Income', 
                                            angle: -90, 
                                            position: 'insideLeft', 
                                            style: { textAnchor: 'middle', fill: 'var(--text-color)', fontSize: '11px' } 
                                        }}
                                    />
                                    <Tooltip 
                                        formatter={formatScatterTooltip}
                                        contentStyle={{
                                            backgroundColor: 'var(--surface-color)',
                                            border: '1px solid var(--border-color)',
                                            borderRadius: '4px',
                                            color: 'var(--text-color)',
                                            fontSize: '12px'
                                        }}
                                        labelStyle={{ color: 'var(--text-color)', fontSize: '12px' }}
                                    />
                                    <Scatter 
                                        name="Agents"
                                        fill="#e74c3c"
                                        fillOpacity={0.6}
                                    />
                                </ScatterChart>
                            )}
                        </ResponsiveContainer>
                    </div>
                )}
            </div>
        </Widget>
    );
};

export default EconomicExplorerWidget;