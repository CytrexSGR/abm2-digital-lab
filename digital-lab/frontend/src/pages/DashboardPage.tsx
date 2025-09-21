import React, { useEffect } from 'react';
import { useConnectionStore } from '../store/useConnectionStore';
import SimulationControls from '../components/simulation/SimulationControls';
import DashboardControls from '../components/DashboardControls';
import DashboardGrid from '../components/DashboardGrid';
import ConnectionStatus from '../components/ui/ConnectionStatus';

const DashboardPage: React.FC = () => {
    const { connect } = useConnectionStore();

    useEffect(() => {
        connect();
    }, [connect]);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, minHeight: '100vh', overflow: 'auto' }}>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '10px',
                backgroundColor: 'var(--surface-color)',
                borderBottom: '1px solid var(--border-color)',
                flexShrink: 0
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <SimulationControls />
                    <DashboardControls />
                </div>
                <ConnectionStatus />
            </div>
            {/* Scrollable dashboard area with explicit viewport-based height */}
            <div style={{ position: 'relative', overflow: 'auto', height: 'calc(100vh - 56px)' }}>
                <DashboardGrid />
            </div>
        </div>
    );
}; 

export default DashboardPage;
