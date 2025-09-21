import React, { useMemo, useCallback } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useSimulationStore } from '../../store/useSimulationStore';
import Widget from './Widget';

// Template colors for consistency - moved outside component to prevent re-creation
const templateColors: Record<string, string> = {
    'liberal': '#3498db',
    'links': '#e74c3c',
    'linksradikal': '#c0392b',
    'mitte': '#95a5a6',
    'rechts': '#f39c12',
    'rechtsextrem': '#8e44ad',
    'Unclassified': '#7f8c8d'
};

const TemplateDynamicsWidget: React.FC = () => {
    const { history } = useSimulationStore();

    // Transform history data into format suitable for stacked area chart - memoized to prevent unnecessary recalculations
    const chartData = useMemo(() => {
        if (history.length === 0) return [];

        // Get all unique template names across all history entries
        const allTemplates = new Set<string>();
        history.forEach(entry => {
            if (entry.model_report?.population_report?.schablonen_verteilung) {
                Object.keys(entry.model_report.population_report.schablonen_verteilung).forEach(template => {
                    allTemplates.add(template);
                });
            }
        });

        // Process each history entry
        return history.map(entry => {
            const step = entry.step;
            const distribution = entry.model_report?.population_report?.schablonen_verteilung || {};

            // Calculate total population for percentage calculation
            const totalPopulation = Object.values(distribution).reduce((sum, count) => sum + count, 0);

            // Create data point with percentages for each template
            const dataPoint: any = { step };

            if (totalPopulation > 0) {
                Array.from(allTemplates).forEach(template => {
                    const count = distribution[template] || 0;
                    dataPoint[template] = count / totalPopulation; // Convert to percentage (0-1)
                });
            } else {
                // If no population data, set all to 0
                Array.from(allTemplates).forEach(template => {
                    dataPoint[template] = 0;
                });
            }

            return dataPoint;
        });
    }, [history]);

    const templateNames = useMemo(() =>
        chartData.length > 0 ? Object.keys(chartData[0]).filter(k => k !== 'step').sort() : []
    , [chartData]);

    // Custom tooltip formatter - memoized to prevent re-creation
    const formatTooltip = useCallback((value: any, name: string) => {
        return [`${(value * 100).toFixed(1)}%`, name];
    }, []);

    return (
        <Widget title="Template Dynamics" widgetId="templateDynamics">
            <div style={{
                width: '100%',
                height: '100%',
                minHeight: '300px',
                overflow: 'hidden' // Prevent scrollbar flickering
            }}>
                {chartData.length === 0 ? (
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '100%',
                        color: 'var(--text-color)',
                        fontSize: '14px'
                    }}>
                        No historical data available. Run simulation steps to see template dynamics.
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart 
                            data={chartData} 
                            stackOffset="expand"
                            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                            <XAxis 
                                dataKey="step" 
                                stroke="var(--text-color)"
                                fontSize={12}
                            />
                            <YAxis 
                                tickFormatter={(tick) => `${(tick * 100).toFixed(0)}%`}
                                stroke="var(--text-color)"
                                fontSize={12}
                            />
                            <Tooltip 
                                formatter={formatTooltip}
                                contentStyle={{
                                    backgroundColor: 'var(--surface-color)',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: '4px',
                                    color: 'var(--text-color)'
                                }}
                                labelStyle={{ color: 'var(--text-color)' }}
                            />
                            <Legend 
                                wrapperStyle={{ color: 'var(--text-color)', fontSize: '12px' }}
                            />
                            {templateNames.map((name, index) => {
                                const color = templateColors[name] || `hsl(${index * 360 / templateNames.length}, 70%, 50%)`;
                                return (
                                    <Area 
                                        key={name}
                                        type="monotone" 
                                        dataKey={name} 
                                        stackId="1" 
                                        stroke={color}
                                        fill={color}
                                        fillOpacity={0.8}
                                        strokeWidth={1}
                                    />
                                );
                            })}
                        </AreaChart>
                    </ResponsiveContainer>
                )}
            </div>
        </Widget>
    );
};

export default TemplateDynamicsWidget;