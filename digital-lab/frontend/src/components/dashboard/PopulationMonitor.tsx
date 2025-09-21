import React from 'react';
import { useSimulationStore } from '../../store/useSimulationStore';

const PopulationMonitor: React.FC = () => {
    const { simulationData, history } = useSimulationStore();

    if (!simulationData?.model_report?.population_report) {
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
                    👥 Population Monitor
                </h4>
                <div style={{ 
                    color: 'var(--text-color)', 
                    opacity: 0.7,
                    textAlign: 'center',
                    padding: '20px',
                    fontStyle: 'italic',
                    fontSize: '12px'
                }}>
                    Loading population data...
                </div>
            </div>
        );
    }

    const populationReport = simulationData.model_report.population_report;
    
    

    // Get change indicators for averages
    const getChangeIndicator = (currentValue: number, key: keyof typeof populationReport.key_averages) => {
        if (history.length === 0) return { icon: '▶', color: 'var(--text-color)' };
        
        const previousData = history[history.length - 1];
        const previousValue = previousData?.model_report?.population_report?.key_averages?.[key];
        
        if (previousValue === undefined || previousValue === currentValue) {
            return { icon: '▶', color: 'var(--text-color)' };
        } else if (currentValue > previousValue) {
            return { icon: '▲', color: '#51cf66' };
        } else {
            return { icon: '▼', color: '#ff6b6b' };
        }
    };

    const formatCurrency = (value: number) => {
        return `€${value.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
    };

    const formatDecimal = (value: number, decimals: number = 2) => {
        return value.toFixed(decimals);
    };

    const formatPercentage = (value: number) => {
        return `${(value * 100).toFixed(1)}%`;
    };

    const averagesConfig = [
        { key: 'mean_wealth' as const, label: 'Mean Wealth', formatter: formatCurrency },
        { key: 'mean_income' as const, label: 'Mean Income', formatter: formatCurrency },
        { key: 'mean_altruism' as const, label: 'Mean Altruism', formatter: (v: number) => formatDecimal(v, 2) },
        { key: 'mean_effective_cognition' as const, label: 'Mean Effective Cognition', formatter: (v: number) => formatDecimal(v, 2) },
        { key: 'mean_risk_aversion' as const, label: 'Mean Risk Aversion', formatter: formatPercentage }
    ];

    return (
        <div style={{
            backgroundColor: 'var(--surface-color)',
            borderRadius: '8px',
            padding: '15px',
            border: '1px solid var(--border-color)'
        }}>
            <h4 style={{ 
                margin: '0 0 15px 0', 
                color: 'var(--text-color)',
                fontSize: '14px',
                borderBottom: '1px solid var(--border-color)',
                paddingBottom: '5px'
            }}>
                👥 Population Monitor
            </h4>
            

            {/* Key Population Averages Section */}
            <div>
                <h5 style={{
                    margin: '0 0 10px 0',
                    color: 'var(--text-color)',
                    fontSize: '12px',
                    fontWeight: 'bold'
                }}>
                    Key Population Averages
                </h5>
                <div style={{ fontSize: '11px' }}>
                    {averagesConfig.map((config) => {
                        const currentValue = populationReport.key_averages[config.key];
                        const changeIndicator = getChangeIndicator(currentValue, config.key);
                        
                        return (
                            <div key={config.key} style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: '8px',
                                padding: '6px 8px',
                                backgroundColor: 'var(--background-color)',
                                borderRadius: '4px',
                                border: '1px solid var(--border-color)'
                            }}>
                                <div style={{ 
                                    color: 'var(--text-color)',
                                    fontWeight: 'bold'
                                }}>
                                    {config.label}:
                                </div>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px'
                                }}>
                                    <span style={{ color: 'var(--text-color)' }}>
                                        {config.formatter(currentValue)}
                                    </span>
                                    <span style={{ 
                                        color: changeIndicator.color,
                                        fontSize: '12px'
                                    }}>
                                        {changeIndicator.icon}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Milieu Distribution Section */}
            <div style={{ marginTop: '15px' }}>
                <h5 style={{
                    margin: '0 0 10px 0',
                    color: 'var(--text-color)',
                    fontSize: '12px',
                    fontWeight: 'bold'
                }}>
                    Real-Time Milieu Distribution
                </h5>
                <div style={{ fontSize: '11px' }}>
                    {populationReport.milieu_distribution && Object.entries(populationReport.milieu_distribution).map(([milieuName, count]) => {
                        const totalAgents = Object.values(populationReport.milieu_distribution!).reduce((sum, c) => sum + c, 0);
                        const percentage = totalAgents > 0 ? ((count / totalAgents) * 100) : 0;
                        
                        return (
                            <div key={milieuName} style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: '6px',
                                padding: '4px 8px',
                                backgroundColor: 'var(--background-color)',
                                borderRadius: '4px',
                                border: '1px solid var(--border-color)'
                            }}>
                                <div style={{ 
                                    color: 'var(--text-color)',
                                    fontWeight: 'bold'
                                }}>
                                    {milieuName}:
                                </div>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px'
                                }}>
                                    <span style={{ color: 'var(--text-color)' }}>
                                        {count} ({percentage.toFixed(1)}%)
                                    </span>
                                    <div style={{
                                        width: '40px',
                                        height: '8px',
                                        backgroundColor: 'var(--border-color)',
                                        borderRadius: '4px',
                                        overflow: 'hidden'
                                    }}>
                                        <div style={{
                                            width: `${percentage}%`,
                                            height: '100%',
                                            backgroundColor: 'var(--primary-color)',
                                            transition: 'width 0.3s ease'
                                        }} />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div style={{
                marginTop: '10px',
                fontSize: '10px',
                color: 'var(--text-color)',
                opacity: 0.7,
                textAlign: 'center'
            }}>
                ▲ Increase • ▼ Decrease • ▶ No change
            </div>
        </div>
    );
};

export default PopulationMonitor;