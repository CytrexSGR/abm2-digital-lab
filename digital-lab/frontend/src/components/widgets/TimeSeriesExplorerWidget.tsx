import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useSimulationStore } from '../../store/useSimulationStore';
import Widget from './Widget';

interface MetricConfig {
    key: string;
    label: string;
    color: string;
    enabled: boolean;
}

const TimeSeriesExplorerWidget: React.FC = () => {
    const { history } = useSimulationStore();

    // Available metrics with their display labels and colors
    const [availableMetrics, setAvailableMetrics] = useState<MetricConfig[]>([
        { key: 'Mean_Freedom', label: 'Mean Freedom', color: '#3498db', enabled: true },
        { key: 'Mean_Altruism', label: 'Mean Altruism', color: '#e74c3c', enabled: true },
        { key: 'Polarization', label: 'Polarization', color: '#f39c12', enabled: false },
        { key: 'Gini_Resources', label: 'Gini Resources', color: '#9b59b6', enabled: false },
        { key: 'Durchschnittsvermoegen', label: 'Average Wealth', color: '#2ecc71', enabled: false },
        { key: 'Durchschnittseinkommen', label: 'Average Income', color: '#1abc9c', enabled: false },
        { key: 'Durchschnittlicher_Konsum', label: 'Average Consumption', color: '#e67e22', enabled: false },
        { key: 'Gini_Vermoegen', label: 'Gini Wealth', color: '#34495e', enabled: false },
        { key: 'Gini_Einkommen', label: 'Gini Income', color: '#95a5a6', enabled: false },
        { key: 'Hazard_Events_Count', label: 'Hazard Events', color: '#c0392b', enabled: false },
    ]);

    // Transform history data for chart
    const processData = () => {
        if (history.length === 0) return [];

        return history.map(entry => {
            const step = entry.step;
            const report = entry.model_report;
            
            const dataPoint: any = { step };
            
            // Add all metric values to the data point
            availableMetrics.forEach(metric => {
                const value = (report as any)[metric.key];
                dataPoint[metric.key] = typeof value === 'number' ? value : null;
            });
            
            return dataPoint;
        });
    };

    const chartData = processData();
    const enabledMetrics = availableMetrics.filter(m => m.enabled);

    // Toggle metric visibility
    const toggleMetric = (metricKey: string) => {
        setAvailableMetrics(prev => 
            prev.map(m => 
                m.key === metricKey ? { ...m, enabled: !m.enabled } : m
            )
        );
    };

    // Custom tooltip formatter
    const formatTooltip = (value: any, name: string) => {
        const metric = availableMetrics.find(m => m.key === name);
        const displayName = metric?.label || name;
        
        if (value === null || value === undefined) {
            return ['No data', displayName];
        }
        
        // Format numbers based on metric type
        if (name.includes('Gini') || name === 'Polarization') {
            return [`${(value * 100).toFixed(1)}%`, displayName];
        } else if (name === 'Hazard_Events_Count') {
            return [value.toString(), displayName];
        } else {
            return [value.toFixed(3), displayName];
        }
    };

    return (
        <Widget title="Time Series Explorer" widgetId="timeSeriesExplorer">
            <div style={{ width: '100%', height: '100%', minHeight: '300px' }}>
                {/* Metric Selection Controls */}
                <div style={{ 
                    marginBottom: '15px', 
                    padding: '10px',
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    borderRadius: '5px',
                    border: '1px solid var(--border-color)'
                }}>
                    <div style={{ 
                        marginBottom: '8px', 
                        fontSize: '12px', 
                        fontWeight: 'bold',
                        color: 'var(--text-color)'
                    }}>
                        Select Metrics to Display:
                    </div>
                    <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                        gap: '8px',
                        maxHeight: '80px',
                        overflowY: 'auto'
                    }}>
                        {availableMetrics.map(metric => (
                            <label 
                                key={metric.key}
                                style={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: '6px',
                                    fontSize: '11px',
                                    color: 'var(--text-color)',
                                    cursor: 'pointer',
                                    padding: '2px 4px',
                                    borderRadius: '3px',
                                    backgroundColor: metric.enabled ? 'rgba(255,255,255,0.1)' : 'transparent'
                                }}
                            >
                                <input
                                    type="checkbox"
                                    checked={metric.enabled}
                                    onChange={() => toggleMetric(metric.key)}
                                    style={{ 
                                        accentColor: metric.color,
                                        width: '12px',
                                        height: '12px'
                                    }}
                                />
                                <span 
                                    style={{ 
                                        width: '12px', 
                                        height: '12px', 
                                        backgroundColor: metric.color, 
                                        borderRadius: '2px',
                                        display: 'inline-block'
                                    }}
                                />
                                <span>{metric.label}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Chart */}
                {chartData.length === 0 ? (
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: 'calc(100% - 120px)',
                        color: 'var(--text-color)',
                        fontSize: '14px'
                    }}>
                        No historical data available. Run simulation steps to see time series.
                    </div>
                ) : enabledMetrics.length === 0 ? (
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: 'calc(100% - 120px)',
                        color: 'var(--text-color)',
                        fontSize: '14px'
                    }}>
                        Select at least one metric to display.
                    </div>
                ) : (
                    <div style={{ height: 'calc(100% - 120px)' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart 
                                data={chartData} 
                                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                <XAxis 
                                    dataKey="step" 
                                    stroke="var(--text-color)"
                                    fontSize={11}
                                    label={{ value: 'Simulation Step', position: 'insideBottom', offset: -5, style: { textAnchor: 'middle', fill: 'var(--text-color)', fontSize: '11px' } }}
                                />
                                <YAxis 
                                    stroke="var(--text-color)"
                                    fontSize={11}
                                    label={{ value: 'Value', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: 'var(--text-color)', fontSize: '11px' } }}
                                />
                                <Tooltip 
                                    formatter={formatTooltip}
                                    contentStyle={{
                                        backgroundColor: 'var(--surface-color)',
                                        border: '1px solid var(--border-color)',
                                        borderRadius: '4px',
                                        color: 'var(--text-color)',
                                        fontSize: '12px'
                                    }}
                                    labelStyle={{ color: 'var(--text-color)', fontSize: '12px' }}
                                />
                                <Legend 
                                    wrapperStyle={{ color: 'var(--text-color)', fontSize: '11px' }}
                                />
                                {enabledMetrics.map(metric => (
                                    <Line 
                                        key={metric.key}
                                        type="monotone" 
                                        dataKey={metric.key} 
                                        stroke={metric.color}
                                        strokeWidth={2}
                                        dot={{ fill: metric.color, strokeWidth: 0, r: 2 }}
                                        activeDot={{ r: 4, stroke: metric.color, strokeWidth: 2 }}
                                        connectNulls={false}
                                        name={metric.label}
                                    />
                                ))}
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </div>
        </Widget>
    );
};

export default TimeSeriesExplorerWidget;