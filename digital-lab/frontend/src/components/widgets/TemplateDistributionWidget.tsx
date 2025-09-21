import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useSimulationStore } from '../../store/useSimulationStore';
import { useDashboardStore } from '../../store/useDashboardStore';
import Widget from './Widget';

const TemplateDistributionWidget: React.FC = () => {
    const { simulationData } = useSimulationStore();
    const { setActiveView } = useDashboardStore();

    // Prepare data for the donut chart
    const templateData = React.useMemo(() => {
        if (!simulationData?.model_report?.population_report?.schablonen_verteilung) {
            return [];
        }

        // Colors for different templates
        const templateColors: Record<string, string> = {
            'liberal': '#3498db',
            'links': '#e74c3c', 
            'linksradikal': '#c0392b',
            'mitte': '#95a5a6',
            'rechts': '#f39c12',
            'rechtsextrem': '#8e44ad',
            'Unclassified': '#7f8c8d'
        };

        const distribution = simulationData.model_report.population_report.schablonen_verteilung;
        
        return Object.entries(distribution).map(([template, count]) => ({
            name: template,
            value: count,
            color: templateColors[template] || '#34495e',
            percentage: simulationData.model_report ? 
                ((count / Object.values(distribution).reduce((a, b) => a + b, 0)) * 100).toFixed(1) : '0'
        }));
    }, [simulationData]);

    const handleChartClick = () => {
        setActiveView('political_explorer');
    };

    const totalAgents = templateData.reduce((sum, item) => sum + item.value, 0);

    return (
        <Widget title="Template Distribution" widgetId="templateDistribution">
            <div 
                style={{ 
                    padding: '10px', 
                    height: '100%', 
                    display: 'flex',
                    flexDirection: 'column',
                    cursor: 'pointer'
                }}
                onClick={handleChartClick}
                title="Click to explore political templates"
            >
                {templateData.length > 0 ? (
                    <>
                        <div style={{ flex: 1, minHeight: '150px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={templateData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius="40%"
                                        outerRadius="80%"
                                        paddingAngle={2}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {templateData.map((entry, index) => (
                                            <Cell 
                                                key={`cell-${index}`} 
                                                fill={entry.color}
                                            />
                                        ))}
                                    </Pie>
                                    <Tooltip 
                                        formatter={(value: any, name: any) => [
                                            `${value} agents (${templateData.find(d => d.name === name)?.percentage}%)`, 
                                            name
                                        ]}
                                        labelStyle={{ color: 'var(--text-color)' }}
                                        contentStyle={{ 
                                            backgroundColor: 'rgba(255,255,255,0.95)',
                                            border: '1px solid #ccc',
                                            borderRadius: '4px'
                                        }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        
                        <div style={{ 
                            marginTop: '10px',
                            fontSize: '11px',
                            color: '#bbb'
                        }}>
                            <div style={{ 
                                display: 'flex', 
                                flexWrap: 'wrap',
                                gap: '8px',
                                justifyContent: 'center'
                            }}>
                                {templateData.slice(0, 6).map((item) => ( // Show max 6 items to avoid overcrowding
                                    <div 
                                        key={item.name}
                                        style={{ 
                                            display: 'flex', 
                                            alignItems: 'center',
                                            gap: '4px'
                                        }}
                                    >
                                        <div 
                                            style={{
                                                width: '8px',
                                                height: '8px',
                                                borderRadius: '50%',
                                                backgroundColor: item.color
                                            }}
                                        />
                                        <span>{item.name}: {item.value}</span>
                                    </div>
                                ))}
                            </div>
                            
                            <div style={{ 
                                textAlign: 'center', 
                                marginTop: '8px',
                                fontWeight: 'bold'
                            }}>
                                Total: {totalAgents} agents
                            </div>
                        </div>
                    </>
                ) : (
                    <div style={{ 
                        height: '100%', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        color: '#666',
                        fontSize: '14px'
                    }}>
                        No template data available
                    </div>
                )}
            </div>
        </Widget>
    );
};

export default TemplateDistributionWidget;