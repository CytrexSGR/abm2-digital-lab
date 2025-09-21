import React from 'react';
import { useSimulationStore } from '../../store/useSimulationStore';
import { useDashboardStore } from '../../store/useDashboardStore';
import Widget from './Widget';

const EventLogWidget: React.FC = () => {
    const { simulationData, history } = useSimulationStore();
    const { setActiveView } = useDashboardStore();

    // Get recent events from the last few simulation steps
    const recentEvents = React.useMemo(() => {
        const events: any[] = [];
        
        // Get events from current simulation data
        if (simulationData?.model_report?.events) {
            events.push(...simulationData.model_report.events.map((event: any) => ({
                type: event.type || 'info',
                message: event.message || event.description || 'Event',
                description: event.description,
                step: simulationData.step,
                ...event
            })));
        }

        // Get events from recent history (last 5 steps)
        const recentHistory = history.slice(-5);
        recentHistory.forEach(entry => {
            if (entry.model_report?.events) {
                events.push(...entry.model_report.events.map((event: any) => ({
                    type: event.type || 'info',
                    message: event.message || event.description || 'Event',
                    description: event.description,
                    step: entry.step,
                    ...event
                })));
            }
        });

        // Sort by step (most recent first) and limit to last 10 events
        return events
            .sort((a: any, b: any) => b.step - a.step)
            .slice(0, 10);
    }, [simulationData, history]);

    // Get hazard events count for quick reference
    const hazardEventsCount = simulationData?.model_report?.Hazard_Events_Count || 0;

    const handleEventLogClick = () => {
        setActiveView('economic_explorer'); // Could be a dedicated events explorer
    };

    return (
        <Widget title="Event Log" widgetId="eventLog">
            <div 
                style={{ 
                    padding: '10px', 
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    cursor: 'pointer'
                }}
                onClick={handleEventLogClick}
                title="Click to explore detailed events"
            >
                {/* Summary stats */}
                <div style={{ 
                    marginBottom: '10px',
                    padding: '8px',
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    borderRadius: '4px',
                    fontSize: '12px'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Current Step:</span>
                        <span style={{ color: '#3498db' }}>{simulationData?.step || 0}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Hazard Events:</span>
                        <span style={{ color: hazardEventsCount > 0 ? '#e74c3c' : '#2ecc71' }}>
                            {hazardEventsCount}
                        </span>
                    </div>
                </div>

                {/* Events list */}
                <div style={{ 
                    flex: 1, 
                    overflowY: 'auto',
                    fontSize: '11px'
                }}>
                    {recentEvents.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            {recentEvents.map((event, index) => (
                                <div 
                                    key={`${event.step}-${index}`}
                                    style={{
                                        padding: '6px 8px',
                                        backgroundColor: 'rgba(255,255,255,0.03)',
                                        borderRadius: '3px',
                                        borderLeft: `3px solid ${getEventColor(event.type || 'info')}`
                                    }}
                                >
                                    <div style={{ 
                                        display: 'flex', 
                                        justifyContent: 'space-between',
                                        marginBottom: '2px'
                                    }}>
                                        <span style={{ 
                                            color: getEventColor(event.type || 'info'),
                                            fontWeight: 'bold'
                                        }}>
                                            {event.type || 'System'}
                                        </span>
                                        <span style={{ color: '#888' }}>
                                            Step {event.step}
                                        </span>
                                    </div>
                                    <div style={{ color: '#ccc' }}>
                                        {event.message || event.description || JSON.stringify(event)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div style={{ 
                            height: '100%', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            color: '#666',
                            fontSize: '12px'
                        }}>
                            No recent events
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div style={{ 
                    marginTop: '8px',
                    paddingTop: '8px',
                    borderTop: '1px solid rgba(255,255,255,0.1)',
                    fontSize: '10px',
                    color: '#888',
                    textAlign: 'center'
                }}>
                    Showing last {Math.min(recentEvents.length, 10)} events
                </div>
            </div>
        </Widget>
    );
};

// Helper function to get color based on event type
const getEventColor = (eventType: string): string => {
    switch (eventType.toLowerCase()) {
        case 'hazard':
        case 'error':
            return '#e74c3c';
        case 'warning':
            return '#f39c12';
        case 'success':
            return '#2ecc71';
        case 'investment':
            return '#3498db';
        default:
            return '#95a5a6';
    }
};

export default EventLogWidget;