import React from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useSimulationStore } from '../../store/useSimulationStore';
import { useDashboardStore } from '../../store/useDashboardStore';

const EconomicExplorerView: React.FC = () => {
    const { simulationData, history } = useSimulationStore();
    const { setActiveView } = useDashboardStore();

    // Prepare wealth distribution histogram data
    const wealthDistribution = React.useMemo(() => {
        if (!simulationData?.agent_visuals) return [];
        
        const wealthValues = simulationData.agent_visuals.map(agent => agent.vermoegen || 0).filter(v => v !== undefined);
        if (wealthValues.length === 0) return [];
        
        const bins = 10;
        const min = Math.min(...wealthValues);
        const max = Math.max(...wealthValues);
        const binSize = (max - min) / bins;
        
        const histogram = Array.from({ length: bins }, (_, i) => ({
            range: `${Math.round(min + i * binSize)}-${Math.round(min + (i + 1) * binSize)}`,
            count: 0,
            minValue: min + i * binSize,
            maxValue: min + (i + 1) * binSize
        }));
        
        wealthValues.forEach(wealth => {
            const binIndex = Math.min(Math.floor((wealth - min) / binSize), bins - 1);
            histogram[binIndex].count++;
        });
        
        return histogram;
    }, [simulationData]);

    // Prepare income distribution histogram data
    const incomeDistribution = React.useMemo(() => {
        if (!simulationData?.agent_visuals) return [];
        
        const incomeValues = simulationData.agent_visuals.map(agent => agent.einkommen || 0).filter(v => v !== undefined);
        if (incomeValues.length === 0) return [];
        
        const bins = 10;
        const min = Math.min(...incomeValues);
        const max = Math.max(...incomeValues);
        const binSize = (max - min) / bins;
        
        const histogram = Array.from({ length: bins }, (_, i) => ({
            range: `${Math.round(min + i * binSize)}-${Math.round(min + (i + 1) * binSize)}`,
            count: 0,
            minValue: min + i * binSize,
            maxValue: min + (i + 1) * binSize
        }));
        
        incomeValues.forEach(income => {
            const binIndex = Math.min(Math.floor((income - min) / binSize), bins - 1);
            histogram[binIndex].count++;
        });
        
        return histogram;
    }, [simulationData]);

    // Prepare time series data for detailed trends
    const timeSeriesData = React.useMemo(() => {
        if (history.length === 0) return [];
        
        return history.map(entry => ({
            step: entry.step,
            avgWealth: entry.model_report?.Durchschnittsvermoegen || 0,
            avgIncome: entry.model_report?.Durchschnittseinkommen || 0,
            wealthGini: entry.model_report?.Gini_Vermoegen || 0,
            incomeGini: entry.model_report?.Gini_Einkommen || 0,
            avgConsumption: entry.model_report?.Durchschnittlicher_Konsum || 0
        }));
    }, [history]);

    // Economic indicators summary
    const currentMetrics = simulationData?.model_report || {};

    return (
        <div style={{
            padding: '20px',
            height: '100vh',
            overflow: 'hidden', // Prevent scrollbar flickering
            backgroundColor: '#1a1d23'
        }}>
            {/* Header with back button */}
            <div style={{ 
                marginBottom: '30px',
                display: 'flex',
                alignItems: 'center',
                gap: '20px'
            }}>
                <button 
                    onClick={() => setActiveView('global')}
                    style={{
                        padding: '10px 20px',
                        backgroundColor: '#3498db',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}
                >
                    ← Back to Global Dashboard
                </button>
                <h2 style={{ color: '#fff', margin: 0 }}>Economic Explorer</h2>
            </div>

            {/* Economic Indicators Summary */}
            <div style={{ 
                marginBottom: '30px',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '15px'
            }}>
                {[
                    { label: 'Average Wealth', value: (currentMetrics as any).Durchschnittsvermoegen, format: 'currency' },
                    { label: 'Average Income', value: (currentMetrics as any).Durchschnittseinkommen, format: 'currency' },
                    { label: 'Average Consumption', value: (currentMetrics as any).Durchschnittlicher_Konsum, format: 'currency' },
                    { label: 'Wealth Gini', value: (currentMetrics as any).Gini_Vermoegen, format: 'decimal' },
                    { label: 'Income Gini', value: (currentMetrics as any).Gini_Einkommen, format: 'decimal' }
                ].map(metric => (
                    <div key={metric.label} style={{
                        padding: '15px',
                        backgroundColor: 'rgba(255,255,255,0.05)',
                        borderRadius: '8px',
                        border: '1px solid rgba(255,255,255,0.1)'
                    }}>
                        <div style={{ fontSize: '12px', color: '#bbb', marginBottom: '5px' }}>
                            {metric.label}
                        </div>
                        <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#fff' }}>
                            {metric.format === 'currency' 
                                ? `€${(metric.value || 0).toLocaleString()}` 
                                : (metric.value || 0).toFixed(3)
                            }
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts Grid */}
            <div style={{ 
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
                gap: '30px'
            }}>
                {/* Wealth Distribution Histogram */}
                <div style={{
                    backgroundColor: 'rgba(255,255,255,0.03)',
                    borderRadius: '12px',
                    padding: '20px',
                    border: '1px solid rgba(255,255,255,0.1)'
                }}>
                    <h3 style={{ color: '#fff', marginTop: 0, marginBottom: '20px' }}>
                        Wealth Distribution
                    </h3>
                    <div style={{ height: '300px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={wealthDistribution}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                <XAxis 
                                    dataKey="range" 
                                    stroke="#fff"
                                    fontSize={11}
                                    angle={-45}
                                    textAnchor="end"
                                    height={60}
                                />
                                <YAxis stroke="#fff" fontSize={11} />
                                <Tooltip 
                                    contentStyle={{ 
                                        backgroundColor: 'rgba(0,0,0,0.9)',
                                        border: '1px solid #555',
                                        borderRadius: '4px',
                                        color: '#fff'
                                    }}
                                    formatter={(value: any) => [`${value} agents`, 'Count']}
                                />
                                <Bar dataKey="count" fill="#2ecc71" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Income Distribution Histogram */}
                <div style={{
                    backgroundColor: 'rgba(255,255,255,0.03)',
                    borderRadius: '12px',
                    padding: '20px',
                    border: '1px solid rgba(255,255,255,0.1)'
                }}>
                    <h3 style={{ color: '#fff', marginTop: 0, marginBottom: '20px' }}>
                        Income Distribution
                    </h3>
                    <div style={{ height: '300px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={incomeDistribution}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                <XAxis 
                                    dataKey="range" 
                                    stroke="#fff"
                                    fontSize={11}
                                    angle={-45}
                                    textAnchor="end"
                                    height={60}
                                />
                                <YAxis stroke="#fff" fontSize={11} />
                                <Tooltip 
                                    contentStyle={{ 
                                        backgroundColor: 'rgba(0,0,0,0.9)',
                                        border: '1px solid #555',
                                        borderRadius: '4px',
                                        color: '#fff'
                                    }}
                                    formatter={(value: any) => [`${value} agents`, 'Count']}
                                />
                                <Bar dataKey="count" fill="#3498db" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Wealth & Income Time Series */}
                <div style={{
                    backgroundColor: 'rgba(255,255,255,0.03)',
                    borderRadius: '12px',
                    padding: '20px',
                    border: '1px solid rgba(255,255,255,0.1)',
                    gridColumn: 'span 2'
                }}>
                    <h3 style={{ color: '#fff', marginTop: 0, marginBottom: '20px' }}>
                        Economic Trends Over Time
                    </h3>
                    <div style={{ height: '300px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={timeSeriesData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                <XAxis 
                                    dataKey="step" 
                                    stroke="#fff"
                                    fontSize={11}
                                />
                                <YAxis stroke="#fff" fontSize={11} />
                                <Tooltip 
                                    contentStyle={{ 
                                        backgroundColor: 'rgba(0,0,0,0.9)',
                                        border: '1px solid #555',
                                        borderRadius: '4px',
                                        color: '#fff'
                                    }}
                                />
                                <Legend />
                                <Line 
                                    type="monotone" 
                                    dataKey="avgWealth" 
                                    stroke="#2ecc71" 
                                    strokeWidth={2}
                                    name="Average Wealth"
                                />
                                <Line 
                                    type="monotone" 
                                    dataKey="avgIncome" 
                                    stroke="#3498db" 
                                    strokeWidth={2}
                                    name="Average Income"
                                />
                                <Line 
                                    type="monotone" 
                                    dataKey="avgConsumption" 
                                    stroke="#f39c12" 
                                    strokeWidth={2}
                                    name="Average Consumption"
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Inequality Time Series */}
                <div style={{
                    backgroundColor: 'rgba(255,255,255,0.03)',
                    borderRadius: '12px',
                    padding: '20px',
                    border: '1px solid rgba(255,255,255,0.1)',
                    gridColumn: 'span 2'
                }}>
                    <h3 style={{ color: '#fff', marginTop: 0, marginBottom: '20px' }}>
                        Inequality Trends (Gini Coefficients)
                    </h3>
                    <div style={{ height: '300px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={timeSeriesData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                <XAxis 
                                    dataKey="step" 
                                    stroke="#fff"
                                    fontSize={11}
                                />
                                <YAxis 
                                    stroke="#fff" 
                                    fontSize={11}
                                    domain={[0, 1]}
                                />
                                <Tooltip 
                                    contentStyle={{ 
                                        backgroundColor: 'rgba(0,0,0,0.9)',
                                        border: '1px solid #555',
                                        borderRadius: '4px',
                                        color: '#fff'
                                    }}
                                />
                                <Legend />
                                <Line 
                                    type="monotone" 
                                    dataKey="wealthGini" 
                                    stroke="#e74c3c" 
                                    strokeWidth={2}
                                    name="Wealth Gini"
                                />
                                <Line 
                                    type="monotone" 
                                    dataKey="incomeGini" 
                                    stroke="#9b59b6" 
                                    strokeWidth={2}
                                    name="Income Gini"
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EconomicExplorerView;