import React from 'react';
import { useSimulationStore } from '../../store/useSimulationStore';
import EventLog from '../simulation/EventLog';
import BiomeMonitor from './BiomeMonitor';
import PopulationMonitor from './PopulationMonitor';

const LiveDashboard: React.FC = () => {
    const { simulationData } = useSimulationStore();

    return (
        <div style={{
            width: '300px',
            height: '100vh',
            overflowY: 'auto',
            backgroundColor: 'var(--background-color)',
            borderLeft: '1px solid var(--border-color)',
            padding: '15px',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px'
        }}>
            <div style={{
                backgroundColor: 'var(--surface-color)',
                borderRadius: '8px',
                padding: '15px',
                border: '1px solid var(--border-color)'
            }}>
                <h3 style={{ 
                    margin: '0 0 15px 0', 
                    color: 'var(--text-color)',
                    fontSize: '18px',
                    borderBottom: '2px solid var(--primary-color)',
                    paddingBottom: '5px'
                }}>
                    Live Dynamics
                </h3>
                
                {simulationData && (
                    <>
                        <div style={{ marginBottom: '10px' }}>
                            <span style={{ 
                                color: 'var(--primary-color)', 
                                fontWeight: 'bold',
                                fontSize: '14px'
                            }}>
                                Step: {simulationData.step}
                            </span>
                        </div>
                        
                        <div style={{ fontSize: '12px', color: 'var(--text-color)', opacity: 0.8 }}>
                            Real-time system dynamics monitoring
                        </div>
                    </>
                )}
            </div>

            <EventLog />
            {simulationData?.model_report?.biomes_dynamic_data && (
                <BiomeMonitor dynamicData={simulationData.model_report.biomes_dynamic_data} />
            )}
            <PopulationMonitor />
        </div>
    );
};

export default LiveDashboard;