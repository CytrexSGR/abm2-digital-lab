import React, { useState } from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import ConfigEditor from './ConfigEditor';
import SimulationControls from './simulation/SimulationControls';
import { useSimulationStore } from '../store/useSimulationStore';

const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isConfigOpen, setIsConfigOpen] = useState(true);
    const { isRunning } = useSimulationStore();

    return (
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: '100%' }}>
            {/* Top bar with Configuration and Simulation Controls */}
            <div style={{ 
                display: 'flex', 
                flexShrink: 0, 
                borderBottom: '1px solid var(--border-color)',
                backgroundColor: 'var(--surface-color)'
            }}>
                {/* Configuration section */}
                <div style={{
                    width: isConfigOpen ? '500px' : '40px',
                    minWidth: isConfigOpen ? '500px' : '40px',
                    maxWidth: isConfigOpen ? 'none' : '40px',
                    transition: 'width 0.3s ease, min-width 0.3s ease',
                    borderRight: '1px solid var(--border-color)',
                    display: 'flex',
                    alignItems: 'center'
                }}>
                    <div style={{
                        display: 'flex',
                        justifyContent: isConfigOpen ? 'flex-end' : 'center',
                        alignItems: 'center',
                        padding: '10px',
                        width: '100%'
                    }}>
                        {isConfigOpen && (
                            <h3 style={{ margin: '0', marginRight: 'auto', color: 'var(--text-color)' }}>
                                Configuration
                            </h3>
                        )}
                        <button 
                            onClick={() => setIsConfigOpen(!isConfigOpen)}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: 'var(--text-color)',
                                cursor: 'pointer',
                                padding: '5px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            {isConfigOpen ? FaChevronLeft({}) : FaChevronRight({})}
                        </button>
                    </div>
                </div>

                {/* Simulation Controls in center */}
                <div style={{ 
                    flexGrow: 1, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    padding: '0 20px'
                }}>
                    <SimulationControls />
                </div>
            </div>

            {/* Main content area */}
            <div style={{ display: 'flex', flex: 1, minHeight: 0, minWidth: 0 }}>
                {/* Configuration editor sidebar */}
                <div style={{
                    width: isConfigOpen ? '500px' : '0px',
                    minWidth: isConfigOpen ? '500px' : '0px',
                    maxWidth: isConfigOpen ? 'none' : '0px',
                    transition: 'width 0.3s ease, min-width 0.3s ease',
                    height: '100%',
                    overflowY: 'auto',
                    overflowX: 'hidden',
                    borderRight: isConfigOpen ? '1px solid var(--border-color)' : 'none',
                    backgroundColor: 'var(--surface-color)',
                    display: isConfigOpen ? 'block' : 'none'
                }}>
                    <ConfigEditor isDisabled={isRunning} />
                </div>

                {/* Dashboard content */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, minWidth: 0, overflow: 'auto' }}>
                    {children}
                </div>
            </div>
        </div>
    );
};

export default DashboardLayout;