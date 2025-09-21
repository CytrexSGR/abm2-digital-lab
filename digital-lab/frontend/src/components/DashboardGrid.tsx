import React from 'react';
import { Mosaic, MosaicWindow } from 'react-mosaic-component';
import { useDashboardStore } from '../store/useDashboardStore';
import AgentMapWidget from './widgets/AgentMapWidget';
import GlobalMetricsWidget from './widgets/GlobalMetricsWidget';
import AgentInspectorWidget from './widgets/AgentInspectorWidget';
import GlobalMetricsSparklinesWidget from './widgets/GlobalMetricsSparklinesWidget';
import TemplateDistributionWidget from './widgets/TemplateDistributionWidget';
import EventLogWidget from './widgets/EventLogWidget';
import TemplateDynamicsWidget from './widgets/TemplateDynamicsWidget';
import TimeSeriesExplorerWidget from './widgets/TimeSeriesExplorerWidget';
import EconomicExplorerWidget from './widgets/EconomicExplorerWidget';
import GeospatialExplorerWidget from './widgets/GeospatialExplorerWidget';
import EconomicExplorerView from './explorers/EconomicExplorerView';
import PoliticalExplorerView from './explorers/PoliticalExplorerView';

const DashboardGrid: React.FC = () => {
    const { mosaicLayout, updateMosaicLayout, activeView, removeWidget } = useDashboardStore();
    
    
    // Fallback if layout is null/undefined
    if (!mosaicLayout) {
        return (
            <div style={{ 
                padding: '20px', 
                textAlign: 'center',
                color: 'white',
                backgroundColor: '#1a1d23',
                height: '100vh'
            }}>
                <h3>No Dashboard Layout</h3>
                <p>Das Layout ist leer. Versuchen Sie 'Default Layout' zu laden.</p>
            </div>
        );
    }

    const baseIdOf = (id: string) => (id.includes('#') ? id.split('#')[0] : id);

    // Widget title mapping
    const getWidgetTitle = (widgetId: string): string => {
        const base = baseIdOf(widgetId);
        const titles: Record<string, string> = {
            agentMap: 'Agent Map',
            globalMetrics: 'Global Metrics',
            templateDistribution: 'Template Distribution',
            eventLog: 'Event Log',
            templateDynamics: 'Template Dynamics',
            timeSeriesExplorer: 'Time Series Explorer',
            economicExplorer: 'Economic Explorer',
            geospatialExplorer: 'Geospatial Explorer',
            metrics: 'Metrics Dashboard',
            agentInspector: 'Agent Inspector'
        };
        return titles[base] || base;
    };

    const renderWidget = (widgetId: string) => {
        const base = baseIdOf(widgetId);
                
        try {
            switch (base) {
                // Global Dashboard widgets
                case 'agentMap': 
                                        return <AgentMapWidget />;
                case 'globalMetrics':
                                        return <GlobalMetricsSparklinesWidget />;
                case 'templateDistribution':
                                        return <TemplateDistributionWidget />;
                case 'eventLog':
                                        return <EventLogWidget />;
                
                // Analysis widgets
                case 'templateDynamics':
                                        return <TemplateDynamicsWidget />;
                case 'timeSeriesExplorer':
                                        return <TimeSeriesExplorerWidget />;
                case 'economicExplorer':
                                        return <EconomicExplorerWidget />;
                case 'geospatialExplorer':
                                        return <GeospatialExplorerWidget />;
                
                // Legacy detailed widgets
                case 'metrics':
                                        return <GlobalMetricsWidget />;
                case 'agentInspector':
                                        return <AgentInspectorWidget />;
                default: 
                                        return (
                        <div style={{ 
                            height: '100%', 
                            backgroundColor: 'var(--surface-color)', 
                            borderRadius: '5px',
                            padding: '10px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white'
                        }}>
                            <div>
                                <h3>Widget: {widgetId}</h3>
                                <p>This is a placeholder widget</p>
                            </div>
                        </div>
                    );
            }
        } catch (error) {
            console.error('Error rendering widget', widgetId, error);
            return (
                <div style={{ 
                    height: '100%', 
                    backgroundColor: '#ff4444', 
                    padding: '10px',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    ERROR: Widget {widgetId} failed to render
                </div>
            );
        }
    };

    // Handle different view states
    if (activeView === 'economic_explorer') {
        return <EconomicExplorerView />;
    }

    if (activeView === 'political_explorer') {
        return <PoliticalExplorerView />;
    }

    return (
        // Container fills available space; Mosaic fills container
        <div style={{ position: 'relative', height: '100%', width: '100%' }}>
            <div style={{ position: 'absolute', inset: 0 }}>
            <Mosaic<string>
                renderTile={(id, path) => (
                    <MosaicWindow<string>
                        path={path}
                        createNode={() => {
                            // Simple picker via prompt; suggest known IDs
                            const choices = [
                                'agentMap',
                                'globalMetrics',
                                'templateDistribution',
                                'eventLog',
                                'templateDynamics',
                                'timeSeriesExplorer',
                                'economicExplorer',
                                'geospatialExplorer',
                                'metrics',
                                'agentInspector'
                            ];
                            const input = window.prompt(`Add widget id (one of):\n${choices.join(', ')}`, choices[1]);
                            const type = (input && input.trim()) || 'agentMap';
                            return `${type}#${Math.random().toString(36).slice(2,8)}`;
                        }}
                        title={getWidgetTitle(id)}
                        toolbarControls={[
                            // Add-here control: splits this tile with a chosen widget
                            <button
                                key="add-here"
                                className="pt-button pt-minimal"
                                onClick={() => {
                                    const choices = [
                                        'agentMap',
                                        'globalMetrics',
                                        'templateDistribution',
                                        'eventLog',
                                        'templateDynamics',
                                        'timeSeriesExplorer',
                                        'economicExplorer',
                                        'geospatialExplorer',
                                        'metrics',
                                        'agentInspector'
                                    ];
                                    const input = window.prompt(`Add widget next to '${getWidgetTitle(id)}'. Choose one of:\n${choices.join(', ')}`, choices[1]);
                                    if (!input) return;
                                    const dir = window.confirm('Split vertically? Click OK for vertical, Cancel for horizontal') ? 'column' : 'row';
                                    useDashboardStore.getState().addWidgetAtLeaf(id, input as string, dir as any);
                                }}
                                title="Add widget here"
                                style={{ 
                                    background: 'transparent',
                                    border: 'none',
                                    color: '#ffffff',
                                    cursor: 'pointer',
                                    marginRight: 8
                                }}
                            >
                                ＋
                            </button>,
                            <button 
                                key="close"
                                className="pt-button pt-minimal pt-icon-cross"
                                onClick={() => removeWidget(id)}
                                title="Close widget"
                                style={{ 
                                    background: 'transparent',
                                    border: 'none',
                                    color: '#ffffff',
                                    cursor: 'pointer'
                                }}
                            />
                        ]}
                    >
                        <div style={{ 
                            height: '100%', 
                            width: '100%', 
                            overflow: 'auto',
                            minHeight: '300px'
                        }}>
                            {renderWidget(id)}
                        </div>
                    </MosaicWindow>
                )}
                value={mosaicLayout}
                onChange={updateMosaicLayout}
                className="mosaic-blueprint-theme" // Essential theme for correct rendering
                resize={{ minimumPaneSizePercentage: 5 }}
                zeroStateView={<div style={{ padding: '20px', color: 'white' }}>Empty Dashboard</div>}
            />
            </div>
        </div>
    );
};

export default DashboardGrid;
