import React from 'react';
import { useConnectionStore } from '../../store/useConnectionStore';

const ConnectionStatus: React.FC = () => {
    const { isConnected } = useConnectionStore();

    return (
        <div style={{
            padding: '8px 16px',
            borderRadius: '4px',
            backgroundColor: isConnected ? '#2d8f47' : '#d32f2f',
            color: 'white',
            fontSize: '12px',
            fontWeight: 'bold'
        }}>
            {isConnected ? 'Connected' : 'Disconnected'}
        </div>
    );
};

export default ConnectionStatus;