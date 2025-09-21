import React from 'react';
import Widget from './Widget';
import AgentMap from '../simulation/AgentMap';
import { useSimulationStore } from '../../store/useSimulationStore';
import { useAgentStore, AgentColorAttribute } from '../../store/useAgentStore';

const AgentMapWidget: React.FC = () => {
    const { simulationData } = useSimulationStore();
    const { agentColorAttribute, setAgentColorAttribute } = useAgentStore();
    
    return (
        <Widget title="Agent Map" widgetId="agentMap">
            <div style={{ 
                position: 'absolute', 
                top: 10, 
                left: 10, 
                zIndex: 1,
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                padding: '5px 10px',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
            }}>
                <label style={{ color: 'white', fontSize: '12px', fontWeight: 'bold' }}>
                    Color by:
                </label>
                <select 
                    value={agentColorAttribute} 
                    onChange={e => setAgentColorAttribute(e.target.value as AgentColorAttribute)}
                    style={{
                        padding: '2px 5px',
                        fontSize: '12px',
                        borderRadius: '3px',
                        border: '1px solid #555',
                        backgroundColor: '#333',
                        color: 'white'
                    }}
                >
                    <option value="political">Political Position</option>
                    <option value="milieu">Milieu</option>
                    <option value="vermoegen">Vermögen</option>
                    <option value="einkommen">Einkommen</option>
                    <option value="risikoaversion">Risikoaversion</option>
                </select>
            </div>
            <AgentMap 
                agents={simulationData?.agent_visuals || []}
                layout={simulationData?.model_report?.layout || []}
                colorAttribute={agentColorAttribute}
                milieusConfig={simulationData?.model_report?.milieus_config || []}
            />
        </Widget>
    );
};

export default AgentMapWidget;