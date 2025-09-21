import React, { useState } from 'react';
import { useSimulationStore } from '../../store/useSimulationStore';
import Widget from './Widget';

type CrossTabVariable = 'milieu' | 'schablone' | 'wealth_quintile' | 'income_quintile';

interface CrossTabCell {
    row: string;
    col: string;
    count: number;
    percentage: number;
}

const GeospatialExplorerWidget: React.FC = () => {
    const { simulationData } = useSimulationStore();
    const [selectedVariable, setSelectedVariable] = useState<CrossTabVariable>('milieu');

    // Available variables for cross-tabulation
    const variableOptions = [
        { key: 'milieu' as CrossTabVariable, label: 'Milieu' },
        { key: 'schablone' as CrossTabVariable, label: 'Template (Schablone)' },
        { key: 'wealth_quintile' as CrossTabVariable, label: 'Wealth Quintile' },
        { key: 'income_quintile' as CrossTabVariable, label: 'Income Quintile' }
    ];

    // Process cross-tabulation data
    const processCrossTabData = (): { cells: CrossTabCell[], rows: string[], cols: string[] } => {
        if (!simulationData?.agent_visuals) return { cells: [], rows: [], cols: [] };

        const agents = simulationData.agent_visuals;
        
        // Helper function to get quintile from value array
        const getQuintile = (values: number[], value: number): string => {
            const sorted = [...values].sort((a, b) => a - b);
            const quintileSize = Math.floor(sorted.length / 5);
            
            for (let i = 1; i <= 5; i++) {
                const threshold = sorted[Math.min(i * quintileSize - 1, sorted.length - 1)];
                if (value <= threshold || i === 5) {
                    return `Q${i}`;
                }
            }
            return 'Q5';
        };

        // Get variable values for each agent
        const processedAgents = agents.map(agent => {
            let variableValue: string;
            
            switch (selectedVariable) {
                case 'milieu':
                    variableValue = agent.milieu || 'Unknown';
                    break;
                case 'schablone':
                    variableValue = agent.schablone || 'Unknown';
                    break;
                case 'wealth_quintile':
                    const wealthValues = agents.map(a => a.vermoegen || 0);
                    variableValue = getQuintile(wealthValues, agent.vermoegen || 0);
                    break;
                case 'income_quintile':
                    const incomeValues = agents.map(a => a.einkommen || 0);
                    variableValue = getQuintile(incomeValues, agent.einkommen || 0);
                    break;
                default:
                    variableValue = 'Unknown';
            }
            
            return {
                region: agent.region || 'Unknown',
                variable: variableValue
            };
        });

        // Build cross-tabulation matrix
        const crosstab = new Map<string, Map<string, number>>();
        const allRegions = new Set<string>();
        const allVariables = new Set<string>();

        processedAgents.forEach(({ region, variable }) => {
            allRegions.add(region);
            allVariables.add(variable);
            
            if (!crosstab.has(region)) {
                crosstab.set(region, new Map());
            }
            
            const regionMap = crosstab.get(region)!;
            regionMap.set(variable, (regionMap.get(variable) || 0) + 1);
        });

        const regions = Array.from(allRegions).sort();
        const variables = Array.from(allVariables).sort();
        
        // Calculate percentages and create cells
        const totalAgents = processedAgents.length;
        const cells: CrossTabCell[] = [];
        
        regions.forEach(region => {
            variables.forEach(variable => {
                const count = crosstab.get(region)?.get(variable) || 0;
                const percentage = totalAgents > 0 ? (count / totalAgents) * 100 : 0;
                
                cells.push({
                    row: region,
                    col: variable,
                    count,
                    percentage
                });
            });
        });

        return { cells, rows: regions, cols: variables };
    };

    const { cells, rows, cols } = processCrossTabData();

    // Get color intensity based on percentage
    const getColorIntensity = (percentage: number): string => {
        const maxPercentage = Math.max(...cells.map(cell => cell.percentage));
        if (maxPercentage === 0) return 'rgba(52, 152, 219, 0.1)';
        
        const intensity = percentage / maxPercentage;
        return `rgba(52, 152, 219, ${0.1 + intensity * 0.7})`;
    };

    return (
        <Widget title="Geospatial Explorer" widgetId="geospatialExplorer">
            <div style={{ width: '100%', height: '100%', minHeight: '300px' }}>
                {/* Variable Selection */}
                <div style={{ 
                    marginBottom: '15px', 
                    padding: '10px',
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    borderRadius: '5px',
                    border: '1px solid var(--border-color)'
                }}>
                    <div style={{ 
                        marginBottom: '8px', 
                        fontSize: '12px', 
                        fontWeight: 'bold',
                        color: 'var(--text-color)'
                    }}>
                        Cross-tabulate Regions with:
                    </div>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {variableOptions.map(option => (
                            <button
                                key={option.key}
                                onClick={() => setSelectedVariable(option.key)}
                                style={{
                                    padding: '6px 12px',
                                    backgroundColor: selectedVariable === option.key ? '#3498db' : 'transparent',
                                    color: selectedVariable === option.key ? 'white' : 'var(--text-color)',
                                    border: `1px solid ${selectedVariable === option.key ? '#3498db' : 'var(--border-color)'}`,
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '11px'
                                }}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Cross-Tabulation Matrix */}
                {!simulationData?.agent_visuals || simulationData.agent_visuals.length === 0 ? (
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: 'calc(100% - 100px)',
                        color: 'var(--text-color)',
                        fontSize: '14px'
                    }}>
                        No agent data available. Initialize and run simulation to explore geospatial patterns.
                    </div>
                ) : cells.length === 0 ? (
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: 'calc(100% - 100px)',
                        color: 'var(--text-color)',
                        fontSize: '14px'
                    }}>
                        No data available for selected variable.
                    </div>
                ) : (
                    <div style={{ 
                        height: 'calc(100% - 100px)',
                        overflowX: 'auto',
                        overflowY: 'auto'
                    }}>
                        <table style={{ 
                            width: '100%', 
                            borderCollapse: 'collapse',
                            fontSize: '11px',
                            minWidth: '400px'
                        }}>
                            <thead>
                                <tr>
                                    <th style={{ 
                                        padding: '8px', 
                                        backgroundColor: 'var(--surface-color)',
                                        border: '1px solid var(--border-color)',
                                        color: 'var(--text-color)',
                                        fontWeight: 'bold',
                                        position: 'sticky',
                                        top: 0,
                                        left: 0,
                                        zIndex: 3
                                    }}>
                                        Region \ {variableOptions.find(v => v.key === selectedVariable)?.label}
                                    </th>
                                    {cols.map(col => (
                                        <th key={col} style={{ 
                                            padding: '8px', 
                                            backgroundColor: 'var(--surface-color)',
                                            border: '1px solid var(--border-color)',
                                            color: 'var(--text-color)',
                                            fontWeight: 'bold',
                                            position: 'sticky',
                                            top: 0,
                                            zIndex: 2,
                                            minWidth: '80px',
                                            textAlign: 'center'
                                        }}>
                                            {col}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {rows.map(row => (
                                    <tr key={row}>
                                        <td style={{ 
                                            padding: '8px', 
                                            backgroundColor: 'var(--surface-color)',
                                            border: '1px solid var(--border-color)',
                                            color: 'var(--text-color)',
                                            fontWeight: 'bold',
                                            position: 'sticky',
                                            left: 0,
                                            zIndex: 1
                                        }}>
                                            {row}
                                        </td>
                                        {cols.map(col => {
                                            const cell = cells.find(c => c.row === row && c.col === col);
                                            return (
                                                <td key={`${row}-${col}`} style={{ 
                                                    padding: '8px', 
                                                    border: '1px solid var(--border-color)',
                                                    backgroundColor: cell ? getColorIntensity(cell.percentage) : 'transparent',
                                                    color: 'var(--text-color)',
                                                    textAlign: 'center',
                                                    cursor: 'pointer'
                                                }}
                                                title={cell ? `${cell.count} agents (${cell.percentage.toFixed(1)}%)` : '0 agents (0.0%)'}
                                                >
                                                    <div style={{ fontWeight: 'bold' }}>
                                                        {cell?.count || 0}
                                                    </div>
                                                    <div style={{ fontSize: '9px', opacity: 0.8 }}>
                                                        {cell ? `${cell.percentage.toFixed(1)}%` : '0.0%'}
                                                    </div>
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Legend */}
                {cells.length > 0 && (
                    <div style={{ 
                        marginTop: '10px',
                        padding: '8px',
                        backgroundColor: 'rgba(255,255,255,0.05)',
                        borderRadius: '5px',
                        border: '1px solid var(--border-color)',
                        fontSize: '10px',
                        color: 'var(--text-color)'
                    }}>
                        <strong>Legend:</strong> Cell intensity shows relative frequency. 
                        Numbers show agent count and percentage of total population.
                        Hover over cells for details.
                    </div>
                )}
            </div>
        </Widget>
    );
};

export default GeospatialExplorerWidget;