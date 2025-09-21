import React from 'react';
import { useSimulationStore } from '../../store/useSimulationStore';

const EventLog: React.FC = () => {
    const { simulationData, history } = useSimulationStore();

    // Combine current events with recent history to show last 10 events
    const allEvents: Array<{ step: number; event: string }> = [];
    
    // Add events from current step
    if (simulationData?.model_report?.events) {
        simulationData.model_report.events.forEach(event => {
            allEvents.push({ step: simulationData.step, event });
        });
    }
    
    // Add events from history (if we track events in history)
    history.slice(-10).forEach(historyEntry => {
        if (historyEntry.model_report.events) {
            historyEntry.model_report.events.forEach(event => {
                allEvents.push({ step: historyEntry.step, event });
            });
        }
    });
    
    // Keep only last 10 events
    const recentEvents = allEvents.slice(-10);

    const formatEvent = (event: string) => {
        const [type, ...details] = event.split('|');
        switch (type) {
            case 'HAZARD_EVENT':
                return { icon: '⚠️', text: `Hazard in ${details[0]}`, color: '#ff6b6b' };
            case 'GINI_WEALTH_THRESHOLD_CROSSED':
                const direction = details[0];
                const value = details[1];
                return { 
                    icon: direction === 'INCREASE' ? '📈' : '📉', 
                    text: `Wealth inequality ${direction.toLowerCase()}: ${value}`,
                    color: direction === 'INCREASE' ? '#ff6b6b' : '#51cf66'
                };
            default:
                return { icon: 'ℹ️', text: event, color: 'var(--text-color)' };
        }
    };

    return (
        <div style={{
            backgroundColor: 'var(--surface-color)',
            borderRadius: '8px',
            padding: '15px',
            border: '1px solid var(--border-color)'
        }}>
            <h4 style={{ 
                margin: '0 0 10px 0', 
                color: 'var(--text-color)',
                fontSize: '14px',
                borderBottom: '1px solid var(--border-color)',
                paddingBottom: '5px'
            }}>
                📋 Event Log
            </h4>
            
            <div style={{
                maxHeight: '200px',
                overflowY: 'auto',
                fontSize: '11px'
            }}>
                {recentEvents.length > 0 ? (
                    <div>
                        {recentEvents.map((eventEntry, index) => {
                            const formatted = formatEvent(eventEntry.event);
                            return (
                                <div key={index} style={{
                                    marginBottom: '8px',
                                    padding: '6px 8px',
                                    backgroundColor: 'var(--background-color)',
                                    borderRadius: '4px',
                                    borderLeft: `3px solid ${formatted.color}`,
                                    display: 'flex',
                                    alignItems: 'flex-start',
                                    gap: '8px'
                                }}>
                                    <span style={{ fontSize: '12px' }}>{formatted.icon}</span>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ 
                                            color: 'var(--text-color)', 
                                            fontWeight: 'bold',
                                            marginBottom: '2px'
                                        }}>
                                            [Step {eventEntry.step}]
                                        </div>
                                        <div style={{ color: formatted.color }}>
                                            {formatted.text}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div style={{ 
                        color: 'var(--text-color)', 
                        opacity: 0.7,
                        textAlign: 'center',
                        padding: '20px',
                        fontStyle: 'italic'
                    }}>
                        No events recorded yet
                    </div>
                )}
            </div>
        </div>
    );
};

export default EventLog;