import React from 'react';
import { AreaChart, Area, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, BarChart, Bar, Cell } from 'recharts';
import { useSimulationStore } from '../../store/useSimulationStore';
import { useDashboardStore } from '../../store/useDashboardStore';

const PoliticalExplorerView: React.FC = () => {
    const { simulationData, history } = useSimulationStore();
    const { setActiveView } = useDashboardStore();

    // Template colors for consistency
    const templateColors: Record<string, string> = {
        'liberal': '#3498db',
        'links': '#e74c3c', 
        'linksradikal': '#c0392b',
        'mitte': '#95a5a6',
        'rechts': '#f39c12',
        'rechtsextrem': '#8e44ad',
        'Unclassified': '#7f8c8d'
    };

    // Prepare template distribution over time (stacked area chart)
    const templateEvolution = React.useMemo(() => {
        if (history.length === 0) return [];
        
        // Get all template names
        const allTemplates = new Set<string>();
        history.forEach(entry => {
            if (entry.model_report?.population_report?.schablonen_verteilung) {
                Object.keys(entry.model_report.population_report.schablonen_verteilung).forEach(template => {
                    allTemplates.add(template);
                });
            }
        });

        return history.map(entry => {
            const baseData: any = { step: entry.step };
            const distribution = entry.model_report?.population_report?.schablonen_verteilung || {};
            
            // Add all templates to ensure consistent data structure
            Array.from(allTemplates).forEach(template => {
                baseData[template] = distribution[template] || 0;
            });
            
            return baseData;
        });
    }, [history]);

    // Get all template names for the area chart
    const templateNames = React.useMemo(() => {
        const names = new Set<string>();
        templateEvolution.forEach(entry => {
            Object.keys(entry).forEach(key => {
                if (key !== 'step') names.add(key);
            });
        });
        return Array.from(names).sort();
    }, [templateEvolution]);

    // Prepare ideological position scatter plot data
    const ideologicalPositions = React.useMemo(() => {
        if (!simulationData?.agent_visuals) return [];
        
        return simulationData.agent_visuals.map(agent => ({
            x: agent.political_position?.a || 0,  // Economic axis
            y: agent.political_position?.b || 0,  // Social axis
            template: agent.schablone,
            id: agent.id,
            wealth: agent.vermoegen,
            altruism: (agent as any).altruism,
            freedom: (agent as any).freedom
        }));
    }, [simulationData]);

    // Current template distribution for summary
    const currentTemplateDistribution = React.useMemo(() => {
        if (!simulationData?.model_report?.population_report?.schablonen_verteilung) return [];
        
        const distribution = simulationData.model_report.population_report.schablonen_verteilung;
        return Object.entries(distribution).map(([template, count]) => ({
            template,
            count,
            color: templateColors[template] || '#34495e'
        })).sort((a, b) => b.count - a.count);
    }, [simulationData, templateColors]);

    // Political metrics summary
    const currentMetrics = simulationData?.model_report || {};

    return (
        <div style={{ 
            padding: '20px', 
            height: '100vh',
            overflowY: 'auto',
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
                        backgroundColor: '#e74c3c',
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
                <h2 style={{ color: '#fff', margin: 0 }}>Political Explorer</h2>
            </div>

            {/* Political Indicators Summary */}
            <div style={{ 
                marginBottom: '30px',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '15px'
            }}>
                {[
                    { label: 'Mean Freedom', value: (currentMetrics as any).Mean_Freedom, format: 'decimal' },
                    { label: 'Mean Altruism', value: (currentMetrics as any).Mean_Altruism, format: 'decimal' },
                    { label: 'Polarization', value: (currentMetrics as any).Polarization, format: 'decimal' },
                    { label: 'Total Templates', value: currentTemplateDistribution.length, format: 'integer' },
                    { label: 'Largest Group', value: Math.max(...currentTemplateDistribution.map(t => t.count)), format: 'integer' }
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
                            {metric.format === 'decimal' 
                                ? (metric.value || 0).toFixed(3)
                                : (metric.value || 0).toString()
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
                {/* Template Distribution Bar Chart */}
                <div style={{
                    backgroundColor: 'rgba(255,255,255,0.03)',
                    borderRadius: '12px',
                    padding: '20px',
                    border: '1px solid rgba(255,255,255,0.1)'
                }}>
                    <h3 style={{ color: '#fff', marginTop: 0, marginBottom: '20px' }}>
                        Current Template Distribution
                    </h3>
                    <div style={{ height: '300px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={currentTemplateDistribution}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                <XAxis 
                                    dataKey="template" 
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
                                <Bar 
                                    dataKey="count" 
                                    fill="#95a5a6"
                                >
                                    {currentTemplateDistribution.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Ideological Position Scatter Plot */}
                <div style={{
                    backgroundColor: 'rgba(255,255,255,0.03)',
                    borderRadius: '12px',
                    padding: '20px',
                    border: '1px solid rgba(255,255,255,0.1)'
                }}>
                    <h3 style={{ color: '#fff', marginTop: 0, marginBottom: '20px' }}>
                        Ideological Positions
                    </h3>
                    <div style={{ height: '300px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <ScatterChart data={ideologicalPositions}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                <XAxis 
                                    type="number"
                                    dataKey="x"
                                    domain={[-1, 1]}
                                    stroke="#fff"
                                    fontSize={11}
                                    label={{ value: 'Economic Axis', position: 'bottom', style: { fill: '#fff' } }}
                                />
                                <YAxis 
                                    type="number"
                                    dataKey="y"
                                    domain={[-1, 1]}
                                    stroke="#fff"
                                    fontSize={11}
                                    label={{ value: 'Social Axis', angle: -90, position: 'insideLeft', style: { fill: '#fff' } }}
                                />
                                <Tooltip 
                                    contentStyle={{ 
                                        backgroundColor: 'rgba(0,0,0,0.9)',
                                        border: '1px solid #555',
                                        borderRadius: '4px',
                                        color: '#fff'
                                    }}
                                    formatter={(value: any, name: any) => [
                                        name === 'x' ? `Economic: ${value.toFixed(3)}` : `Social: ${value.toFixed(3)}`,
                                        ''
                                    ]}
                                    labelFormatter={(label: any, payload: any) => {
                                        if (payload && payload.length > 0) {
                                            const data = payload[0].payload;
                                            return `Agent ${data.id} (${data.template})`;
                                        }
                                        return '';
                                    }}
                                />
                                <Scatter dataKey="y" fill="#3498db" />
                            </ScatterChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Template Evolution Stacked Area Chart */}
                <div style={{
                    backgroundColor: 'rgba(255,255,255,0.03)',
                    borderRadius: '12px',
                    padding: '20px',
                    border: '1px solid rgba(255,255,255,0.1)',
                    gridColumn: 'span 2'
                }}>
                    <h3 style={{ color: '#fff', marginTop: 0, marginBottom: '20px' }}>
                        Template Distribution Evolution
                    </h3>
                    <div style={{ height: '400px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={templateEvolution}>
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
                                {templateNames.map((template, index) => (
                                    <Area
                                        key={template}
                                        type="monotone"
                                        dataKey={template}
                                        stackId="1"
                                        stroke={templateColors[template] || `hsl(${index * 360 / templateNames.length}, 70%, 50%)`}
                                        fill={templateColors[template] || `hsl(${index * 360 / templateNames.length}, 70%, 50%)`}
                                        fillOpacity={0.7}
                                    />
                                ))}
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PoliticalExplorerView;