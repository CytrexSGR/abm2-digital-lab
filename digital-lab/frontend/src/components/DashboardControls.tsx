import React, { useState } from 'react';
import { useDashboardStore } from '../store/useDashboardStore';
import { PRESET_MINIMAL, PRESET_MONITORING, PRESET_ANALYSIS } from '../config/dashboardLayouts';

interface WidgetOption {
    id: string;
    label: string;
    description: string;
    category: 'global' | 'analysis' | 'legacy';
}

const DashboardControls: React.FC = () => {
    const { addWidget, resetDashboard, loadDefaultLayout, loadLayoutPreset } = useDashboardStore();
    const [showDropdown, setShowDropdown] = useState(false);

    const availableWidgets: WidgetOption[] = [
        // Global Dashboard Widgets
        { id: 'agentMap', label: 'Agent Map', description: 'Spatial visualization of agents', category: 'global' },
        { id: 'globalMetrics', label: 'Global Metrics', description: 'Key metrics sparklines', category: 'global' },
        { id: 'templateDistribution', label: 'Template Distribution', description: 'Current template breakdown', category: 'global' },
        { id: 'eventLog', label: 'Event Log', description: 'Recent simulation events', category: 'global' },
        
        // Analysis Widgets
        { id: 'templateDynamics', label: 'Template Dynamics', description: 'Template evolution over time', category: 'analysis' },
        { id: 'timeSeriesExplorer', label: 'Time Series Explorer', description: 'Interactive metrics over time', category: 'analysis' },
        { id: 'economicExplorer', label: 'Economic Explorer', description: 'Wealth & income analysis', category: 'analysis' },
        { id: 'geospatialExplorer', label: 'Geospatial Explorer', description: 'Regional cross-tabulation', category: 'analysis' },
        
        // Legacy Widgets
        { id: 'metrics', label: 'Legacy Metrics', description: 'Detailed metrics dashboard', category: 'legacy' },
        { id: 'agentInspector', label: 'Agent Inspector', description: 'Individual agent details', category: 'legacy' }
    ];

    const handleAddWidget = (widgetId: string) => {
        addWidget(widgetId);
        setShowDropdown(false);
    };

    const getCategoryColor = (category: string) => {
        switch (category) {
            case 'global': return '#3498db';
            case 'analysis': return '#e74c3c';
            case 'legacy': return '#95a5a6';
            default: return '#007acc';
        }
    };

    const getCategoryLabel = (category: string) => {
        switch (category) {
            case 'global': return 'Global Dashboard';
            case 'analysis': return 'Analysis Widgets';
            case 'legacy': return 'Legacy Widgets';
            default: return 'Other';
        }
    };

    const groupedWidgets = availableWidgets.reduce((acc, widget) => {
        if (!acc[widget.category]) acc[widget.category] = [];
        acc[widget.category].push(widget);
        return acc;
    }, {} as Record<string, WidgetOption[]>);

    const buttonBaseStyle = {
        padding: '8px 16px',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '13px',
        fontWeight: '500',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        transition: 'all 0.2s ease',
        minHeight: '36px'
    };

    return (
        <div style={{ 
            padding: '12px 16px', 
            borderBottom: '1px solid var(--border-color)', 
            backgroundColor: 'var(--surface-color)',
            display: 'flex',
            gap: '16px',
            alignItems: 'center',
            position: 'relative',
            flexWrap: 'wrap'
        }}>
            <span style={{ 
                fontWeight: 'bold', 
                color: 'var(--text-color)',
                fontSize: '14px',
                marginRight: '8px'
            }}>
                Dashboard Controls
            </span>
            
            {/* Widget Actions Group */}
            <div style={{ 
                display: 'flex', 
                gap: '8px', 
                alignItems: 'center',
                padding: '4px 8px',
                backgroundColor: 'rgba(255,255,255,0.03)',
                borderRadius: '8px',
                border: '1px solid rgba(255,255,255,0.1)'
            }}>
                <span style={{ 
                    fontSize: '11px', 
                    color: 'var(--text-muted)',
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                }}>
                    Widget Actions
                </span>
                
                {/* Add Widget Dropdown */}
                <div style={{ position: 'relative' }}>
                    <button 
                        onClick={() => setShowDropdown(!showDropdown)}
                        style={{
                            ...buttonBaseStyle,
                            backgroundColor: '#007acc',
                            color: 'white'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#0056b3';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '#007acc';
                        }}
                    >
                        ➕ Add Widget
                        <span style={{ 
                            transform: showDropdown ? 'rotate(180deg)' : 'rotate(0deg)', 
                            transition: 'transform 0.2s',
                            fontSize: '10px'
                        }}>
                            ▼
                        </span>
                    </button>

                {showDropdown && (
                    <div style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        marginTop: '4px',
                        backgroundColor: 'var(--surface-color)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '6px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                        zIndex: 1000,
                        minWidth: '320px',
                        maxHeight: '400px',
                        overflowY: 'auto'
                    }}>
                        {Object.entries(groupedWidgets).map(([category, widgets]) => (
                            <div key={category} style={{ padding: '8px 0' }}>
                                <div style={{
                                    padding: '8px 16px',
                                    backgroundColor: 'rgba(255,255,255,0.05)',
                                    fontSize: '12px',
                                    fontWeight: 'bold',
                                    color: getCategoryColor(category),
                                    borderBottom: '1px solid rgba(255,255,255,0.1)'
                                }}>
                                    {getCategoryLabel(category)}
                                </div>
                                {widgets.map(widget => (
                                    <button
                                        key={widget.id}
                                        onClick={() => handleAddWidget(widget.id)}
                                        style={{
                                            width: '100%',
                                            padding: '12px 16px',
                                            backgroundColor: 'transparent',
                                            color: 'var(--text-color)',
                                            border: 'none',
                                            textAlign: 'left',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: '4px',
                                            fontSize: '13px'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.backgroundColor = 'transparent';
                                        }}
                                    >
                                        <div style={{ fontWeight: 'bold' }}>
                                            {widget.label}
                                        </div>
                                        <div style={{ 
                                            fontSize: '11px', 
                                            color: 'var(--text-muted)',
                                            opacity: 0.8 
                                        }}>
                                            {widget.description}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        ))}
                    </div>
                )}
                
                {/* Click outside to close dropdown */}
                {showDropdown && (
                    <div 
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            zIndex: 999
                        }}
                        onClick={() => setShowDropdown(false)}
                    />
                )}
            </div>
            </div>

            {/* Layout Actions Group */}
            <div style={{ 
                display: 'flex', 
                gap: '8px', 
                alignItems: 'center',
                padding: '4px 8px',
                backgroundColor: 'rgba(255,255,255,0.03)',
                borderRadius: '8px',
                border: '1px solid rgba(255,255,255,0.1)'
            }}>
                <span style={{ 
                    fontSize: '11px', 
                    color: 'var(--text-muted)',
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                }}>
                    Layout Actions
                </span>
                
                <button 
                    onClick={loadDefaultLayout}
                    style={{
                        ...buttonBaseStyle,
                        backgroundColor: '#28a745',
                        color: 'white'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#218838';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#28a745';
                    }}
                    title="Load default layout with all analysis widgets"
                >
                    📊 Default Layout
                </button>

                <button 
                    onClick={() => loadLayoutPreset(PRESET_MINIMAL)}
                    style={{
                        ...buttonBaseStyle,
                        backgroundColor: '#6c757d',
                        color: 'white'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#5a6268';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#6c757d';
                    }}
                    title="Load minimal layout"
                >
                    🧱 Minimal
                </button>

                <button 
                    onClick={() => loadLayoutPreset(PRESET_MONITORING)}
                    style={{
                        ...buttonBaseStyle,
                        backgroundColor: '#17a2b8',
                        color: 'white'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#138496';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#17a2b8';
                    }}
                    title="Load monitoring layout"
                >
                    📈 Monitoring
                </button>

                <button 
                    onClick={() => loadLayoutPreset(PRESET_ANALYSIS)}
                    style={{
                        ...buttonBaseStyle,
                        backgroundColor: '#ffc107',
                        color: '#212529'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#e0a800';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#ffc107';
                    }}
                    title="Load analysis layout"
                >
                    🔬 Analysis
                </button>

                <button 
                    onClick={() => {
                        if (window.confirm('Reset dashboard to minimal layout? This will remove all widgets except the Agent Map.')) {
                            resetDashboard();
                        }
                    }}
                    style={{
                        ...buttonBaseStyle,
                        backgroundColor: '#dc3545',
                        color: 'white'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#c82333';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#dc3545';
                    }}
                    title="Reset to minimal layout"
                >
                    🔄 Reset
                </button>
            </div>

            {/* Layout Status */}
            <div style={{
                fontSize: '12px',
                color: 'var(--text-muted)',
                padding: '4px 8px',
                backgroundColor: 'rgba(255,255,255,0.1)',
                borderRadius: '4px'
            }}>
                Mosaic Layout Active
            </div>
        </div>
    );
};

export default DashboardControls;
