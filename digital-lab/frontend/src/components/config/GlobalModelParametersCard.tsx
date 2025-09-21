import React from 'react';
import Card from '../ui/Card';
import PresetManager from '../ui/PresetManager';
import { FullConfig, GlobalModelParameters } from '../../types';

interface GlobalModelParametersCardProps {
    config: FullConfig;
    onGlobalParamChange: (field: keyof GlobalModelParameters, value: string) => void;
    onSaveSection: (sectionName: string, sectionData: any) => void;
    onLoadPresetForSection: (section: string, data: any) => void;
    isDisabled: boolean;
}

const GlobalModelParametersCard: React.FC<GlobalModelParametersCardProps> = ({
    config,
    onGlobalParamChange,
    onSaveSection,
    onLoadPresetForSection,
    isDisabled
}) => {
    return (
        <Card title="Global Model Parameters" defaultOpen={false}>
            {config?.simulation_parameters && (() => {
                const globalParams: (keyof GlobalModelParameters)[] = [
                    'max_investment_rate',
                    'investment_return_factor', 
                    'investment_success_probability',
                    'wealth_threshold_cognitive_stress',
                    'max_cognitive_penalty',
                    'wealth_sensitivity_factor',
                    'cognitive_moderator_education_weight',
                    'cognitive_moderator_capacity_weight',
                    'default_risk_aversion',
                    'default_time_preference',
                    'default_political_efficacy',
                    'grid_size',
                    'gini_threshold_change',
                    'default_mean_altruism'
                ];
                
                return (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', alignItems: 'center' }}>
                        {globalParams.map((param) => (
                            <React.Fragment key={param}>
                                <label style={{ textAlign: 'right', fontSize: '0.9em' }}>
                                    {param.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}:
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={config.simulation_parameters[param] || 0}
                                    onChange={e => onGlobalParamChange(param, e.target.value)}
                                    disabled={isDisabled}
                                    style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', minWidth: '0' }}
                                />
                            </React.Fragment>
                        ))}
                    </div>
                );
            })()}
            <div style={{ textAlign: 'right', marginTop: '10px' }}>
                <button onClick={() => onSaveSection('simulation_parameters', config.simulation_parameters)} disabled={isDisabled}>
                    Apply Global Model Parameters
                </button>
            </div>
            {config && (
                <PresetManager
                    sectionName="global_model_parameters"
                    onLoadPreset={(data) => onLoadPresetForSection('simulation_parameters', data)}
                    getConfigDataForSave={() => config.simulation_parameters}
                    isDisabled={isDisabled}
                />
            )}
        </Card>
    );
};

export default GlobalModelParametersCard;