import React from 'react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { useSimulationStore } from '../../store/useSimulationStore';
import { useAgentStore } from '../../store/useAgentStore';

const AgentInspector: React.FC = () => {
    const { simulationData, history } = useSimulationStore();
    const { selectedAgentId, selectAgent } = useAgentStore();

    // Find the agent data first
    const agentData = simulationData?.agent_visuals.find(a => a.id === selectedAgentId);

    // Extract attribute history for sparklines (always call hooks)
    const attributeHistory = React.useMemo(() => {
        if (!selectedAgentId || !simulationData) return [];
        
        const data = [];
        
        // Add historical data
        for (const entry of history) {
            const agent = entry.agent_visuals.find(a => a.id === selectedAgentId);
            if (agent) {
                data.push({
                    step: entry.step,
                    vermoegen: agent.vermoegen,
                    einkommen: agent.einkommen,
                    risikoaversion: agent.risikoaversion,
                    sozialleistungen: agent.sozialleistungen,
                    effektive_kognitive_kapazitaet: agent.effektive_kognitive_kapazitaet,
                    politische_wirksamkeit: agent.politische_wirksamkeit
                });
            }
        }
        
        // Add current data
        if (agentData) {
            data.push({
                step: simulationData.step,
                vermoegen: agentData.vermoegen,
                einkommen: agentData.einkommen,
                risikoaversion: agentData.risikoaversion,
                sozialleistungen: agentData.sozialleistungen,
                effektive_kognitive_kapazitaet: agentData.effektive_kognitive_kapazitaet,
                politische_wirksamkeit: agentData.politische_wirksamkeit
            });
        }
        
        return data;
    }, [history, simulationData, selectedAgentId, agentData]);

    if (!selectedAgentId || !simulationData) {
        return (
            <div style={{ 
                padding: '15px', 
                backgroundColor: 'var(--surface-color)', 
                borderRadius: '8px', 
                margin: '10px 0',
                textAlign: 'center',
                color: 'var(--text-color)'
            }}>
                Click on an agent to inspect their details.
            </div>
        );
    }

    if (!agentData) {
        return (
            <div style={{ 
                padding: '15px', 
                backgroundColor: 'var(--surface-color)', 
                borderRadius: '8px', 
                margin: '10px 0',
                color: '#ff6b6b',
                border: '1px solid #ff6b6b'
            }}>
                Agent not found.
            </div>
        );
    }

    const formatCurrency = (value?: number) => {
        if (value === undefined) return 'N/A';
        return `€${value.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
    };

    const formatPercentage = (value?: number) => {
        if (value === undefined) return 'N/A';
        return `${(value * 100).toFixed(1)}%`;
    };

    const formatDecimal = (value?: number, decimals: number = 2) => {
        if (value === undefined) return 'N/A';
        return value.toFixed(decimals);
    };

    // Sparkline component for attribute trends
    const Sparkline: React.FC<{ 
        data: any[], 
        dataKey: string, 
        color: string, 
        title: string 
    }> = ({ data, dataKey, color, title }) => {
        if (data.length < 2) return null;
        
        return (
            <div style={{ marginTop: '8px' }}>
                <div style={{ fontSize: '11px', color: '#666', marginBottom: '2px' }}>
                    {title} Trend
                </div>
                <div style={{ height: '40px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data}>
                            <Line 
                                type="monotone" 
                                dataKey={dataKey} 
                                stroke={color} 
                                strokeWidth={1.5}
                                dot={false}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        );
    };

    return (
        <div style={{ 
            padding: '15px', 
            backgroundColor: 'var(--surface-color)', 
            border: '1px solid var(--border-color)',
            borderRadius: '8px', 
            margin: '10px 0',
            boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
            color: 'var(--text-color)'
        }}>
            <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: '15px'
            }}>
                <h4 style={{ margin: 0, color: 'var(--text-color)' }}>
                    Agent Inspector (ID: {agentData.id})
                </h4>
                <button 
                    onClick={() => selectAgent(null)}
                    style={{
                        background: '#f44336',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '5px 10px',
                        cursor: 'pointer',
                        fontSize: '12px'
                    }}
                >
                    ✕ Close
                </button>
            </div>
            
            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: '1fr 1fr', 
                gap: '10px',
                fontSize: '14px'
            }}>
                {/* Basic Info */}
                <div style={{ gridColumn: '1 / -1' }}>
                    <strong style={{ color: '#1976d2' }}>Basic Information</strong>
                </div>
                
                <div>
                    <strong>Biome:</strong> {agentData.region}
                </div>
                
                {agentData.alter !== undefined && (
                    <div>
                        <strong>Age:</strong> {agentData.alter} years
                    </div>
                )}
                
                <div>
                    <strong>Political Position:</strong> 
                    <br />
                    <small>Economic: {formatDecimal(agentData.political_position.a)}, 
                    Social: {formatDecimal(agentData.political_position.b)}</small>
                </div>

                {/* Economic Status */}
                <div style={{ gridColumn: '1 / -1', marginTop: '10px' }}>
                    <strong style={{ color: '#388e3c' }}>Economic Status</strong>
                </div>
                
                {agentData.einkommen !== undefined && (
                    <div>
                        <strong>Income:</strong> {formatCurrency(agentData.einkommen)}
                        <Sparkline 
                            data={attributeHistory} 
                            dataKey="einkommen" 
                            color="#3498db" 
                            title="Income" 
                        />
                    </div>
                )}
                
                {agentData.vermoegen !== undefined && (
                    <div>
                        <strong>Wealth:</strong> {formatCurrency(agentData.vermoegen)}
                        <Sparkline 
                            data={attributeHistory} 
                            dataKey="vermoegen" 
                            color="#2ecc71" 
                            title="Wealth" 
                        />
                    </div>
                )}
                
                {agentData.sozialleistungen !== undefined && (
                    <div>
                        <strong>Social Benefits:</strong> {formatCurrency(agentData.sozialleistungen)}
                    </div>
                )}
                
                {agentData.konsumquote !== undefined && (
                    <div>
                        <strong>Consumption Rate:</strong> {formatPercentage(agentData.konsumquote)}
                    </div>
                )}
                
                {agentData.ersparnis !== undefined && (
                    <div>
                        <strong>Savings (Last Step):</strong> {formatCurrency(agentData.ersparnis)}
                    </div>
                )}

                {/* Psychological Traits */}
                <div style={{ gridColumn: '1 / -1', marginTop: '10px' }}>
                    <strong style={{ color: '#7b1fa2' }}>Psychological Traits</strong>
                </div>
                
                {agentData.risikoaversion !== undefined && (
                    <div>
                        <strong>Risk Aversion:</strong> {formatPercentage(agentData.risikoaversion)}
                        <Sparkline 
                            data={attributeHistory} 
                            dataKey="risikoaversion" 
                            color="#e74c3c" 
                            title="Risk Aversion" 
                        />
                    </div>
                )}
                
                {agentData.kognitive_kapazitaet_basis !== undefined && (
                    <div>
                        <strong>Base Cognitive Capacity:</strong> {formatDecimal(agentData.kognitive_kapazitaet_basis)}
                    </div>
                )}
                
                {agentData.effektive_kognitive_kapazitaet !== undefined && (
                    <div>
                        <strong>Effective Cognitive Capacity:</strong> {formatDecimal(agentData.effektive_kognitive_kapazitaet)}
                        <Sparkline 
                            data={attributeHistory} 
                            dataKey="effektive_kognitive_kapazitaet" 
                            color="#9b59b6" 
                            title="Cognitive Capacity" 
                        />
                    </div>
                )}
                
                {agentData.politische_wirksamkeit !== undefined && (
                    <div>
                        <strong>Political Efficacy:</strong> {formatDecimal(agentData.politische_wirksamkeit)}
                    </div>
                )}
                
                {agentData.sozialkapital !== undefined && (
                    <div>
                        <strong>Social Capital:</strong> {formatDecimal(agentData.sozialkapital)}
                    </div>
                )}
            </div>

            {/* Additional contextual information */}
            {(agentData.kognitive_kapazitaet_basis !== undefined && 
              agentData.effektive_kognitive_kapazitaet !== undefined) && (
                <div style={{ 
                    marginTop: '10px', 
                    padding: '8px', 
                    backgroundColor: 'var(--background-color)', 
                    borderRadius: '4px',
                    fontSize: '12px',
                    color: 'var(--text-color)',
                    border: '1px solid var(--border-color)'
                }}>
                    <strong>Cognitive Stress:</strong> {
                        agentData.effektive_kognitive_kapazitaet < agentData.kognitive_kapazitaet_basis ? 
                        'Experiencing stress-related cognitive reduction' : 
                        'Operating at full cognitive capacity'
                    }
                </div>
            )}
        </div>
    );
};

export default AgentInspector;