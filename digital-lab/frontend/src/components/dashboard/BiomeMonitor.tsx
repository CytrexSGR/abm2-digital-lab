import React from 'react';
import { ModelReport } from '../../types';

interface BiomeMonitorProps {
    dynamicData: ModelReport['biomes_dynamic_data'];
}

const BiomeMonitor: React.FC<BiomeMonitorProps> = ({ dynamicData }) => {
    if (!dynamicData || Object.keys(dynamicData).length === 0) {
        return <div>No biome dynamic data available.</div>;
    }

    return (
        <div style={{ marginTop: '20px' }}>
            <h3>Biome Monitor (Live Data)</h3>
            <table style={{ 
                width: '100%', 
                borderCollapse: 'collapse',
                backgroundColor: '#2a2a2a',
                color: 'white',
                borderRadius: '8px',
                overflow: 'hidden'
            }}>
                <thead>
                    <tr style={{ 
                        backgroundColor: '#404040',
                        textAlign: 'left'
                    }}>
                        <th style={{ 
                            padding: '12px',
                            borderRight: '1px solid #555'
                        }}>Biome</th>
                        <th style={{ 
                            padding: '12px',
                            borderRight: '1px solid #555'
                        }}>Total Investment</th>
                        <th style={{ 
                            padding: '12px',
                            borderRight: '1px solid #555'
                        }}>Hazard Prob. (Effective)</th>
                        <th style={{ 
                            padding: '12px'
                        }}>Regen. Rate (Effective)</th>
                    </tr>
                </thead>
                <tbody>
                    {Object.keys(dynamicData).map((name, index) => {
                        const data = dynamicData[name];
                        const isHighInvestment = data.total_investment > 50000;
                        const isHighHazard = data.effective_hazard_probability > 0.02;
                        const isHighRegen = data.effective_regeneration_rate > 30;
                        
                        return (
                            <tr key={name} style={{ 
                                borderBottom: index < Object.keys(dynamicData).length - 1 ? '1px solid #555' : 'none',
                                backgroundColor: isHighInvestment ? '#1a3a1a' : 'transparent'
                            }}>
                                <td style={{ 
                                    padding: '10px 12px',
                                    fontWeight: 'bold',
                                    borderRight: '1px solid #555'
                                }}>{name}</td>
                                <td style={{ 
                                    padding: '10px 12px',
                                    borderRight: '1px solid #555',
                                    color: isHighInvestment ? '#4CAF50' : 'white'
                                }}>
                                    {data.total_investment.toFixed(0)}
                                </td>
                                <td style={{ 
                                    padding: '10px 12px',
                                    borderRight: '1px solid #555',
                                    color: isHighHazard ? '#F44336' : 'white'
                                }}>
                                    {(data.effective_hazard_probability * 100).toFixed(3)}%
                                </td>
                                <td style={{ 
                                    padding: '10px 12px',
                                    color: isHighRegen ? '#4CAF50' : 'white'
                                }}>
                                    {data.effective_regeneration_rate.toFixed(2)}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
            <div style={{ 
                marginTop: '10px', 
                fontSize: '12px', 
                color: '#888',
                fontStyle: 'italic'
            }}>
                💡 Colors indicate: Green = High investment/regeneration, Red = High hazard probability
            </div>
        </div>
    );
};

export default BiomeMonitor;