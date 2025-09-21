import React from 'react';
import Card from '../ui/Card';
import PresetManager from '../ui/PresetManager';
import FormField from '../ui/FormField';
import StyledInput from '../ui/StyledInput';
import { FullConfig } from '../../types';
import { containerStyles } from '../../styles/components';

interface AgentLearningParametersCardProps {
    config: FullConfig;
    onLearningParamChange: (field: string, value: string) => void;
    onSaveSection: (sectionName: string, sectionData: any) => void;
    onLoadPresetForSection: (section: string, data: any) => void;
    isDisabled: boolean;
}

const AgentLearningParametersCard: React.FC<AgentLearningParametersCardProps> = ({
    config,
    onLearningParamChange,
    onSaveSection,
    onLoadPresetForSection,
    isDisabled
}) => {
    return (
        <Card title="Agent Learning Parameters">
            <div style={containerStyles.grid2}>
                <FormField 
                    label="Altruism Target Crisis"
                    description="Target altruism level during environmental crisis"
                >
                    <StyledInput
                        type="number"
                        step="0.01"
                        value={config?.simulation_parameters.altruism_target_crisis || 0}
                        onChange={e => onLearningParamChange('altruism_target_crisis', e.target.value)}
                        disabled={isDisabled}
                    />
                </FormField>
                
                <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                        Crisis Weighting Beta:
                    </label>
                    <input
                        type="number"
                        step="0.01"
                        value={config?.simulation_parameters.crisis_weighting_beta || 0}
                        onChange={e => onLearningParamChange('crisis_weighting_beta', e.target.value)}
                        disabled={isDisabled}
                        style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', minWidth: '0' }}
                    />
                    <small style={{ color: 'var(--text-secondary)' }}>Weight of environmental crisis signal in learning</small>
                </div>
                
                <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                        Max Learning Rate (η_max):
                    </label>
                    <input
                        type="number"
                        step="0.001"
                        value={config?.simulation_parameters.max_learning_rate_eta_max || 0}
                        onChange={e => onLearningParamChange('max_learning_rate_eta_max', e.target.value)}
                        disabled={isDisabled}
                        style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', minWidth: '0' }}
                    />
                    <small style={{ color: 'var(--text-secondary)' }}>Maximum learning rate for socio-ecological adaptation</small>
                </div>
                
                <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                        Education Dampening (k):
                    </label>
                    <input
                        type="number"
                        step="1"
                        value={config?.simulation_parameters.education_dampening_k || 0}
                        onChange={e => onLearningParamChange('education_dampening_k', e.target.value)}
                        disabled={isDisabled}
                        style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', minWidth: '0' }}
                    />
                    <small style={{ color: 'var(--text-secondary)' }}>Education factor dampening parameter (higher = more education effect)</small>
                </div>
            </div>
            <div style={{ textAlign: 'right', marginTop: '10px' }}>
                 <button onClick={() => onSaveSection('simulation_parameters', config.simulation_parameters)} disabled={isDisabled}>
                    Apply Learning Parameters
                </button>
            </div>
            {config && (
                <PresetManager
                    sectionName="agent_learning_parameters"
                    onLoadPreset={(data) => onLoadPresetForSection('simulation_parameters', data)}
                    getConfigDataForSave={() => config.simulation_parameters}
                    isDisabled={isDisabled}
                />
            )}
        </Card>
    );
};

export default AgentLearningParametersCard;