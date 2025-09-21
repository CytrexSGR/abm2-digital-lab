import React from 'react';
import { useSimulationStore } from '../../store/useSimulationStore';

const SimulationControls: React.FC = () => {
    const { runSimulation, stopSimulation, resetSimulation, stepSimulation, isRunning } = useSimulationStore();

    return (
        <div style={{ padding: '10px', border: '1px solid #555', borderRadius: '5px', backgroundColor: '#333' }}>
            <h4>Simulation Controls</h4>
            <div style={{ display: 'flex', justifyContent: 'space-around', gap: '8px' }}>
                <button onClick={runSimulation} disabled={isRunning}>
                    ▶ Start
                </button>
                <button onClick={() => stepSimulation(1)} disabled={isRunning}>
                    ⏭ 1 Step
                </button>
                <button onClick={() => stepSimulation(10)} disabled={isRunning}>
                    ⏭⏭ 10 Steps
                </button>
                <button onClick={stopSimulation} disabled={!isRunning}>
                    ■ Stop
                </button>
                <button onClick={resetSimulation} disabled={isRunning}>
                    ⟳ Reset
                </button>
            </div>
        </div>
    );
};

export default SimulationControls;