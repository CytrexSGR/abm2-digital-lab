import React from 'react';
import Card from '../ui/Card';
import PresetManager from '../ui/PresetManager';
import FormField from '../ui/FormField';
import StyledInput from '../ui/StyledInput';
import ActionButton from '../ui/ActionButton';
import { FullConfig } from '../../types';
import { containerStyles, miscStyles } from '../../styles/components';

interface GlobalEconomicParametersCardProps {
    config: FullConfig;
    onConfigChange: (field: string, value: string) => void;
    onSaveSection: (sectionName: string, sectionData: any) => void;
    onLoadPresetForSection: (section: string, data: any) => void;
    isDisabled: boolean;
}

const GlobalEconomicParametersCard: React.FC<GlobalEconomicParametersCardProps> = ({
    config,
    onConfigChange,
    onSaveSection,
    onLoadPresetForSection,
    isDisabled
}) => {
    return (
        <Card title="Global Economic Parameters">
            <div style={containerStyles.grid2}>
                <FormField 
                    label="Environmental Capacity"
                    description="Global environmental capacity limit"
                >
                    <StyledInput
                        type="number"
                        step="0.1"
                        value={config?.simulation_parameters.environmental_capacity || 0}
                        onChange={e => onConfigChange('environmental_capacity', e.target.value)}
                        disabled={isDisabled}
                    />
                </FormField>
                
                <FormField 
                    label="Media Influence Factor"
                    description="Strength of media influence on agents"
                >
                    <StyledInput
                        type="number"
                        step="0.01"
                        value={config?.simulation_parameters.media_influence_factor || 0}
                        onChange={e => onConfigChange('media_influence_factor', e.target.value)}
                        disabled={isDisabled}
                    />
                </FormField>
                
                <FormField 
                    label="Resilience Bonus Factor"
                    description="Multiplier for altruism → regeneration link"
                >
                    <StyledInput
                        type="number"
                        step="0.1"
                        value={config?.simulation_parameters.resilience_bonus_factor || 0}
                        onChange={e => onConfigChange('resilience_bonus_factor', e.target.value)}
                        disabled={isDisabled}
                    />
                </FormField>

                <FormField 
                    label="Base Consumption Rate"
                    description="Base percentage of income consumed"
                >
                    <StyledInput
                        type="number"
                        step="0.1"
                        value={config?.simulation_parameters.base_consumption_rate || 0}
                        onChange={e => onConfigChange('base_consumption_rate', e.target.value)}
                        disabled={isDisabled}
                    />
                </FormField>

                <FormField 
                    label="Time Preference Sensitivity"
                    description="How time preference affects consumption rate"
                >
                    <StyledInput
                        type="number"
                        step="0.1"
                        value={config?.simulation_parameters.zeitpraeferenz_sensitivity || 0}
                        onChange={e => onConfigChange('zeitpraeferenz_sensitivity', e.target.value)}
                        disabled={isDisabled}
                    />
                </FormField>

                <FormField 
                    label="Risk Aversion Sensitivity"
                    description="How risk aversion affects consumption rate"
                >
                    <StyledInput
                        type="number"
                        step="0.1"
                        value={config?.simulation_parameters.risikoaversion_sensitivity || 0}
                        onChange={e => onConfigChange('risikoaversion_sensitivity', e.target.value)}
                        disabled={isDisabled}
                    />
                </FormField>
            </div>
            <div style={miscStyles.rightAlign}>
                <ActionButton 
                    onClick={() => onSaveSection('simulation_parameters', config.simulation_parameters)} 
                    disabled={isDisabled}
                    variant="success"
                >
                    Apply Global Parameters
                </ActionButton>
            </div>
            {config && (
                <PresetManager
                    sectionName="global_simulation_parameters"
                    onLoadPreset={(data) => onLoadPresetForSection('simulation_parameters', data)}
                    getConfigDataForSave={() => config.simulation_parameters}
                    isDisabled={isDisabled}
                />
            )}
        </Card>
    );
};

export default GlobalEconomicParametersCard;