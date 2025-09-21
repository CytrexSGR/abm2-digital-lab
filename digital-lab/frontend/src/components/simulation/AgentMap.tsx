import React, { useMemo } from 'react';
import DeckGL from '@deck.gl/react';
import { OrthographicView } from '@deck.gl/core';
import { ScatterplotLayer, SolidPolygonLayer, TextLayer, IconLayer, LineLayer } from '@deck.gl/layers';
import { scaleSequential } from 'd3-scale';
import { interpolateViridis } from 'd3-scale-chromatic';
import { useAgentStore, AgentColorAttribute } from '../../store/useAgentStore';
import { AgentVisual, MilieuConfig } from '../../types';

// Typ-Definitionen für Props und Layout
interface BiomeLayout { name: string; x_min: number; x_max: number; }
interface AgentMapProps {
    agents: AgentVisual[];
    layout: BiomeLayout[];
    colorAttribute: AgentColorAttribute;
    milieusConfig: MilieuConfig[]; // NEW: Milieu configuration for visualization
}

// --- Komponente ---
const AgentMap: React.FC<AgentMapProps> = ({ agents, layout, colorAttribute, milieusConfig }) => {
    const { selectedAgentId } = useAgentStore();

    // Dynamic color scale for continuous attributes
    const colorScale = useMemo(() => {
        if (agents.length === 0 || colorAttribute === 'political' || colorAttribute === 'milieu') {
            return null;
        }
        
        const values = agents.map(a => {
            switch (colorAttribute) {
                case 'vermoegen': return a.vermoegen || 0;
                case 'einkommen': return a.einkommen || 0;
                case 'risikoaversion': return a.risikoaversion || 0;
                default: return 0;
            }
        });
        
        const domain = [Math.min(...values), Math.max(...values)];
        return scaleSequential(domain, interpolateViridis);
    }, [agents, colorAttribute]);

    // Helper function to convert hex color to RGB array
    const hexToRgb = (hex: string): [number, number, number, number] => {
        const cleanHex = hex.replace('#', '');
        const r = parseInt(cleanHex.substr(0, 2), 16);
        const g = parseInt(cleanHex.substr(2, 2), 16);
        const b = parseInt(cleanHex.substr(4, 2), 16);
        return [r, g, b, 255];
    };
    
    
    const layers = useMemo(() => {
        const biomeLayer = new SolidPolygonLayer({
            id: 'biome-layout-layer',
            data: layout,
            getPolygon: d => [[d.x_min, 0], [d.x_max, 0], [d.x_max, 100], [d.x_min, 100]],
            getFillColor: (d, { index }) => index % 2 === 0 ? [42, 45, 53, 255] : [52, 55, 63, 255],
        });

        const agentLayer = new ScatterplotLayer<AgentVisual>({
            id: `agent-scatterplot-${colorAttribute}`,
            data: agents,
            coordinateSystem: 1,
            getPosition: d => d.position,
            getRadius: 0.8,
            getFillColor: d => {
                // Dynamic coloring based on selected attribute
                switch (colorAttribute) {
                    case 'political':
                        // Color by political position (using 'a' axis for left-right)
                        const politicalValue = d.political_position?.a || 0;
                        if (politicalValue < -0.33) return [255, 0, 0, 255]; // Red for left
                        if (politicalValue > 0.33) return [0, 0, 255, 255]; // Blue for right
                        return [128, 128, 128, 255]; // Gray for center
                        
                    case 'milieu':
                        // Color by milieu using dynamic milieusConfig
                        const getMilieuColor = (milieuName?: string): [number, number, number, number] => {
                            if (!milieuName) {
                                return [136, 136, 136, 255]; // Default gray
                            }
                            
                            const milieu = milieusConfig.find(m => m.name === milieuName);
                            if (milieu && milieu.color) {
                                return hexToRgb(milieu.color);
                            }
                            
                            return [136, 136, 136, 255]; // Default gray if no color defined
                        };
                        return getMilieuColor(d.milieu); // USE DYNAMIC MILIEU ASSIGNMENT
                        
                    case 'vermoegen':
                    case 'einkommen':
                    case 'risikoaversion':
                        // Color by continuous scale
                        if (!colorScale) return [136, 136, 136, 255];
                        
                        const value = (() => {
                            switch (colorAttribute) {
                                case 'vermoegen': return d.vermoegen || 0;
                                case 'einkommen': return d.einkommen || 0;
                                case 'risikoaversion': return d.risikoaversion || 0;
                                default: return 0;
                            }
                        })();
                        
                        const hexColor = colorScale(value);
                        return hexToRgb(hexColor);
                        
                    default:
                        return [136, 136, 136, 255]; // Default gray
                }
            },
            pickable: true,
            onClick: (info) => info.object && useAgentStore.getState().selectAgent(info.object.id)
        });

        const labelLayer = new TextLayer({
            id: 'biome-label-layer',
            data: layout,
            getPosition: d => [(d.x_min + d.x_max) / 2, 95],
            getText: d => d.name,
            getSize: 16.875,
            getColor: [224, 224, 224, 255],
            getTextAnchor: 'middle',
        });

        // NEW: IconLayer for milieu centers
        const milieuCenterLayer = new IconLayer({
            id: 'milieu-center-layer',
            data: milieusConfig,
            getPosition: d => [
                // Scale from [-1, 1] to [0, 100] coordinate space
                (d.ideological_center.economic_axis + 1) * 50,
                (d.ideological_center.social_axis + 1) * 50
            ],
            // Using a simple circle icon
            iconAtlas: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
            iconMapping: { "marker": { "x": 0, "y": 0, "width": 1, "height": 1, "mask": true } },
            getIcon: d => 'marker',
            getSize: 15,
            getColor: d => {
                const hex = d.color;
                return hexToRgb(hex);
            },
        });

        // Trajectory layer for selected agent
        const selectedAgent = agents.find(a => a.id === selectedAgentId);
        const trajectoryData: any[] = [];
        
        if (selectedAgent && (selectedAgent as any).position_history && (selectedAgent as any).position_history.length > 1) {
            const history = (selectedAgent as any).position_history as [number, number][];
            for (let i = 0; i < history.length - 1; i++) {
                trajectoryData.push({
                    sourcePosition: history[i],
                    targetPosition: history[i + 1]
                });
            }
        }
        
        const trajectoryLayer = new LineLayer({
            id: 'agent-trajectory-layer',
            data: trajectoryData,
            getSourcePosition: (d: any) => d.sourcePosition,
            getTargetPosition: (d: any) => d.targetPosition,
            getColor: [255, 255, 255, 150],
            getWidth: 2,
        });

        return [biomeLayer, agentLayer, labelLayer, milieuCenterLayer, trajectoryLayer];
    }, [agents, layout, milieusConfig, colorAttribute, colorScale, selectedAgentId]);

    return (
        <div style={{ height: '100%', width: '100%', position: 'relative' }}>
            <DeckGL
                views={new OrthographicView({ id: 'static-ortho-view' })}
                initialViewState={{ target: [50, 50, 0], zoom: Math.log2(1216/100) }}
                controller={false} // WICHTIG: Controller deaktiviert
                layers={layers}
                style={{ background: 'transparent' }}
            />
        </div>
    );
};

export default AgentMap;