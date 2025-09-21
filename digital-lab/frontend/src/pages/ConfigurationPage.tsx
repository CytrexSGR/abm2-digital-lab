import React from 'react';
import { useSimulationStore } from '../store/useSimulationStore';
import ConfigurationPanel from '../components/config/ConfigurationPanel';

const ConfigurationPage: React.FC = () => {
    const { isRunning } = useSimulationStore();

    return (
        <div style={{ 
            flexGrow: 1, 
            overflowY: 'auto',
            padding: '20px' 
        }}>
            <ConfigurationPanel isDisabled={isRunning} />
        </div>
    );
};

export default ConfigurationPage;