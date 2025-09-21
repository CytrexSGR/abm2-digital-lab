import React from 'react';
import Widget from './Widget';
import AgentInspector from '../simulation/AgentInspector';

const AgentInspectorWidget: React.FC = () => {
    return (
        <Widget title="Agent Inspector" widgetId="agentInspector">
            <div style={{ padding: '10px', height: '100%' }}>
                <AgentInspector />
            </div>
        </Widget>
    );
};

export default AgentInspectorWidget;