import React, { useState, useEffect } from 'react';
import { apiClient } from '../../api/axiosConfig';
import PresetManager from '../ui/PresetManager';
import Card from '../ui/Card';
import BiomeEditor from './BiomeEditor';
import MediaEditor from './MediaEditor';
import MilieuEditor from '../ui/MilieuEditor';
import GlobalEconomicParametersCard from './GlobalEconomicParametersCard';
import AgentLearningParametersCard from './AgentLearningParametersCard';
import GlobalModelParametersCard from './GlobalModelParametersCard';
import DataArchive from './DataArchive';
import { FullConfig, BiomeConfig, GlobalModelParameters } from '../../types';
import { useSimulationStore } from '../../store/useSimulationStore';

interface ConfigurationPanelProps {
    isDisabled: boolean;
}

const ConfigurationPanel: React.FC<ConfigurationPanelProps> = ({ isDisabled }) => {
    const [config, setConfig] = useState<FullConfig | null>(null);
    const [status, setStatus] = useState<string>('Loading...');
    const { resetSimulation } = useSimulationStore();

    useEffect(() => {
        fetchConfig();
    }, []);

    const fetchConfig = async () => {
        try {
            const response = await apiClient.get<FullConfig>('/api/config');
            setConfig(response.data);
            setStatus('Loaded successfully.');
        } catch (error) {
            console.error("Failed to fetch config:", error);
            setStatus('Error loading config.');
        }
    };

    const handleSaveSection = async (sectionName: string, sectionData: any) => {
        try {
            await apiClient.patch('/api/config', { [sectionName]: sectionData });
            alert(`${sectionName} configuration applied! Resetting simulation...`);
            resetSimulation();
        } catch (error) {
            console.error(`Failed to save ${sectionName} config`, error);
            alert(`Error applying ${sectionName} configuration.`);
        }
    };

    const handleLoadPresetForSection = (section: string, data: any) => {
        if (!config) return;
        setConfig({
            ...config,
            [section]: typeof data === 'string' ? JSON.parse(data) : data,
        });
    };
    
    // Handler for changing biome data
    const handleBiomeChange = (index: number, updatedBiome: BiomeConfig) => {
        if (!config) return;
        const newBiomes = [...config.biomes];
        newBiomes[index] = updatedBiome;
        setConfig({ ...config, biomes: newBiomes });
    };

    // Handler for changing entire biomes array (CRUD operations)
    const handleBiomesChange = (newBiomes: BiomeConfig[]) => {
        if (!config) return;
        setConfig({ ...config, biomes: newBiomes });
    };

    // Handler for simulation parameters changes
    const handleSimParamChange = (field: string, value: string) => {
        if (!config) return;
        setConfig({
            ...config,
            simulation_parameters: {
                ...config.simulation_parameters,
                [field]: Number(value)
            }
        });
    };

    // Handler for learning parameters changes (now in simulation_parameters)
    const handleLearningParamChange = (field: string, value: string) => {
        if (!config) return;
        setConfig({
            ...config,
            simulation_parameters: {
                ...config.simulation_parameters,
                [field]: field === 'education_dampening_k' ? parseInt(value) : parseFloat(value)
            }
        });
    };

    // Handler for global model parameters changes
    const handleGlobalParamChange = (field: keyof GlobalModelParameters, value: string) => {
        if (!config) return;
        setConfig({
            ...config,
            simulation_parameters: {
                ...config.simulation_parameters,
                [field]: Number(value)
            }
        });
    };

    if (!config) {
        return <div>{status}</div>;
    }

    return (
        <div style={{ padding: '15px' }}>
            <h2 style={{ margin: '0 0 10px 0' }}>Configuration Editor</h2>
            <p style={{ margin: '0 0 15px 0' }}>Status: {status}</p>

            <Card title="Biomes">
                {config && (
                    <BiomeEditor
                        biomes={config.biomes}
                        onBiomeChange={handleBiomeChange}
                        onBiomesChange={handleBiomesChange}
                        isDisabled={isDisabled}
                    />
                )}
                <div style={{ textAlign: 'right', marginTop: '10px' }}>
                    <button onClick={() => handleSaveSection('biomes', config?.biomes)} disabled={isDisabled}>
                        Apply Biome Changes
                    </button>
                </div>
                {config && (
                    <PresetManager
                        sectionName="biomes"
                        onLoadPreset={(data) => handleLoadPresetForSection('biomes', data)}
                        getConfigDataForSave={() => config.biomes}
                        isDisabled={isDisabled}
                    />
                )}
            </Card>

            <GlobalEconomicParametersCard
                config={config}
                onConfigChange={handleSimParamChange}
                onSaveSection={handleSaveSection}
                onLoadPresetForSection={handleLoadPresetForSection}
                isDisabled={isDisabled}
            />

            <AgentLearningParametersCard
                config={config}
                onLearningParamChange={handleLearningParamChange}
                onSaveSection={handleSaveSection}
                onLoadPresetForSection={handleLoadPresetForSection}
                isDisabled={isDisabled}
            />

            <GlobalModelParametersCard
                config={config}
                onGlobalParamChange={handleGlobalParamChange}
                onSaveSection={handleSaveSection}
                onLoadPresetForSection={handleLoadPresetForSection}
                isDisabled={isDisabled}
            />

            <MediaEditor isDisabled={isDisabled} />

            <MilieuEditor isDisabled={isDisabled} />

            <DataArchive />

        </div>
    );
};

export default ConfigurationPanel;