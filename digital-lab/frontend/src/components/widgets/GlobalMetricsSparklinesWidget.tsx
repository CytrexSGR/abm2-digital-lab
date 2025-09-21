import React from 'react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { useSimulationStore } from '../../store/useSimulationStore';
import { useDashboardStore } from '../../store/useDashboardStore';
import Widget from './Widget';

const GlobalMetricsSparklinesWidget: React.FC = () => {
    const { history } = useSimulationStore();
    const { setActiveView } = useDashboardStore();

    // Define the metrics we want to display as sparklines
    const metrics = [
        { 
            key: 'Gini_Vermoegen',
            label: 'Wealth Inequality',
            color: '#e74c3c',
            description: 'Gini coefficient for wealth distribution'
        },
        { 
            key: 'Durchschnittsvermoegen',
            label: 'Average Wealth',
            color: '#2ecc71', 
            description: 'Mean wealth across all agents'
        },
        { 
            key: 'Mean_Freedom',
            label: 'Mean Freedom',
            color: '#3498db',
            description: 'Average freedom preference'
        },
        { 
            key: 'Mean_Altruism',
            label: 'Mean Altruism',
            color: '#f39c12',
            description: 'Average altruism factor'
        },
        // Additional compact metrics
        {
            key: 'Durchschnittseinkommen',
            label: 'Average Income',
            color: '#1abc9c',
            description: 'Mean income across all agents'
        },
        {
            key: 'Durchschnittlicher_Konsum',
            label: 'Avg Consumption',
            color: '#9b59b6',
            description: 'Average consumption per step'
        },
        {
            key: 'Gini_Einkommen',
            label: 'Income Inequality',
            color: '#e67e22',
            description: 'Gini coefficient for income distribution'
        },
        {
            key: 'Hazard_Events_Count',
            label: 'Hazard Events',
            color: '#c0392b',
            description: 'Number of hazard events this step'
        },
        // Cognitive/psychological averages
        {
            key: 'mean_effective_cognition',
            label: 'Mean Effective Cognition',
            color: '#16a085',
            description: 'Average effective cognitive capacity'
        },
        {
            key: 'mean_risk_aversion',
            label: 'Mean Risk Aversion',
            color: '#8e44ad',
            description: 'Average risk aversion across agents'
        }
    ];

    // Prepare chart data from history
    const chartData = history.map(entry => {
        const mr: any = entry.model_report || {};
        const ka: any = mr.population_report?.key_averages || {};
        return {
            step: entry.step,
            ...mr,
            // Flatten key_averages for easy metric bindings
            mean_effective_cognition: ka.mean_effective_cognition,
            mean_risk_aversion: ka.mean_risk_aversion,
        };
    });

    const handleMetricClick = (metricKey: string) => {
        setActiveView('economic_explorer');
    };

    // Value formatter: compact for monetary, 3 decimals for ratios
    const formatValue = (key: string, val: any) => {
        if (typeof val !== 'number' || isNaN(val)) return '---';
        const moneyKeys = ['Durchschnittsvermoegen', 'Durchschnittseinkommen', 'Durchschnittlicher_Konsum'];
        if (moneyKeys.includes(key)) {
            const abs = Math.abs(val);
            if (abs >= 1_000_000) return `€${(val/1_000_000).toFixed(2)}m`;
            if (abs >= 1_000) return `€${(val/1_000).toFixed(1)}k`;
            return `€${val.toFixed(0)}`;
        }
        return val.toFixed(3);
    };

    return (
        <Widget title="Global Metrics" widgetId="globalMetrics">
            <div style={{ padding: '8px', height: '100%', overflow: 'auto' }}>
                <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                    gap: '10px',
                    height: '100%'
                }}>
                    {metrics.map(metric => {
                        const currentValue = chartData.length > 0 ? (chartData[chartData.length - 1] as any)?.[metric.key] : 0;
                        const previousValue = chartData.length > 1 ? (chartData[chartData.length - 2] as any)?.[metric.key] : currentValue;
                        const trend = currentValue > previousValue ? '↗' : currentValue < previousValue ? '↘' : '→';
                        const trendColor = currentValue > previousValue ? '#2ecc71' : currentValue < previousValue ? '#e74c3c' : '#95a5a6';

                        return (
                            <div 
                                key={metric.key}
                                onClick={() => handleMetricClick(metric.key)}
                                style={{ 
                                    backgroundColor: 'rgba(255,255,255,0.05)', 
                                    borderRadius: '8px', 
                                    padding: '8px',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'space-between',
                                    minHeight: '120px'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)';
                                    e.currentTarget.style.transform = 'scale(1.02)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)';
                                    e.currentTarget.style.transform = 'scale(1)';
                                }}
                                title={metric.description}
                            >
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
                                        <span style={{ fontSize: 11, color: '#bbb' }}>{metric.label}</span>
                                        <span style={{ color: trendColor, fontSize: 14 }}>{trend}</span>
                                    </div>
                                    <div style={{ fontSize: 14, fontWeight: 700, color: metric.color }}>
                                        {formatValue(metric.key, currentValue)}
                                    </div>
                                </div>
                                
                                {chartData.length > 1 && (
                                    <div style={{ height: '56px', marginTop: 6 }}>
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart data={chartData}>
                                                <Line 
                                                    type="monotone" 
                                                    dataKey={metric.key} 
                                                    stroke={metric.color}
                                                    strokeWidth={1.5}
                                                    dot={false}
                                                />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                )}
                                
                                {chartData.length <= 1 && (
                                    <div style={{ height: '56px', marginTop: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666', fontSize: 10 }}>No historical data</div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </Widget>
    );
};

export default GlobalMetricsSparklinesWidget;
