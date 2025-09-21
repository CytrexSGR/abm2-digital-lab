import React, { useState, useEffect } from 'react';
import { InitialMilieu, MilieuConfig } from '../../types';
import { apiClient } from '../../api/axiosConfig';
import Card from '../ui/Card';
import PresetManager from '../ui/PresetManager';
import MilieuCard from './MilieuCard';
import { useMilieuManagement } from '../../hooks/useMilieuManagement';

const InitialPopulationEditor: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    
    // Initialize the hook with empty array, we'll update it after loading
    const { 
        milieus, 
        setMilieus, 
        addMilieu, 
        removeMilieu, 
        updateMilieu, 
        updateDistribution, 
        normalizeProportions, 
        validateProportions 
    } = useMilieuManagement([]);

    useEffect(() => {
        initializeWithPresets();
    }, []);

    const fetchMilieus = async () => {
        try {
            const response = await apiClient.get('/api/initial_milieus');
            setMilieus(response.data);
        } catch (error) {
            console.error('Error fetching initial milieus:', error);
        } finally {
            setLoading(false);
        }
    };


    const initializeWithPresets = async () => {
        try {
            // Define our 6 specific political archetype preset names
            const desiredPresets = [
                'linksradikal', 'links', 'mitte', 'liberal', 'rechts', 'rechtsextrem'
            ];

            const allMilieus: InitialMilieu[] = [];
            
            // Load each specific preset and convert to InitialMilieu format
            for (const presetName of desiredPresets) {
                try {
                    const presetResponse = await apiClient.get<MilieuConfig[]>(`/api/presets/milieus/${presetName}`);
                    const presetData = presetResponse.data[0];
                    
                    const initialMilieu: InitialMilieu = {
                        name: presetData.name,
                        proportion: 1.0 / desiredPresets.length, // Equal distribution (1/6 each)
                        color: presetData.color,
                        attribute_distributions: presetData.attribute_distributions ? {
                            ...presetData.attribute_distributions,
                            // Add legacy attributes with defaults if missing
                            alter: { type: 'uniform_int', min: 18, max: 65 },
                            kognitive_kapazitaet: presetData.attribute_distributions.bildung // Use bildung as fallback
                        } : {}  // Fallback to empty object for legacy compatibility
                    };
                    
                    allMilieus.push(initialMilieu);
                } catch (error) {
                    console.error(`Failed to load preset ${presetName}:`, error);
                }
            }

            if (allMilieus.length > 0) {
                setMilieus(allMilieus);
            } else {
                // Fallback to original API if presets fail
                fetchMilieus();
            }
        } catch (error) {
            console.error('Failed to initialize with presets:', error);
            // Fallback to original API if presets fail
            fetchMilieus();
        } finally {
            setLoading(false);
        }
    };


    const saveMilieus = async () => {
        // Validate proportions sum to 1
        const validation = validateProportions();
        if (!validation.isValid) {
            alert(`Warning: Milieu proportions sum to ${validation.total.toFixed(3)}, but should sum to 1.0`);
        }

        setSaving(true);
        try {
            await apiClient.post('/api/initial_milieus', milieus);
            alert('Initial milieus saved successfully!');
        } catch (error) {
            console.error('Error saving initial milieus:', error);
            alert('Error saving initial milieus');
        } finally {
            setSaving(false);
        }
    };

    const handleLoadPresetForMilieus = (data: InitialMilieu[]) => {
        setMilieus(data);
    };

    if (loading) {
        return <Card title="Initial Population Setup (Startup Milieus)">Loading...</Card>;
    }

    return (
        <Card title="Initial Population Setup (Startup Milieus)">
            <div style={{ marginBottom: '15px' }}>
                <p style={{ color: 'var(--text-color)', fontSize: '12px', marginBottom: '10px' }}>
                    Define how agents are initialized at the start of the simulation. Each milieu represents a group of agents with specific attribute distributions.
                </p>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <button
                        onClick={addMilieu}
                        style={{
                            padding: '8px 15px',
                            backgroundColor: 'var(--primary-color)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px'
                        }}
                    >
                        Add Milieu
                    </button>
                    <button
                        onClick={normalizeProportions}
                        style={{
                            padding: '8px 15px',
                            backgroundColor: 'var(--secondary-color)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px'
                        }}
                    >
                        Normalize Proportions
                    </button>
                    <button
                        onClick={saveMilieus}
                        disabled={saving}
                        style={{
                            padding: '8px 15px',
                            backgroundColor: saving ? '#ccc' : 'var(--success-color)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: saving ? 'not-allowed' : 'pointer',
                            fontSize: '12px'
                        }}
                    >
                        {saving ? 'Saving...' : 'Save'}
                    </button>
                </div>
            </div>

            <PresetManager
                sectionName="milieus"
                onLoadPreset={handleLoadPresetForMilieus}
                getConfigDataForSave={() => milieus}
                isDisabled={false}
            />

            {milieus.map((milieu, index) => (
                <MilieuCard
                    key={index}
                    milieu={milieu}
                    index={index}
                    onUpdate={(field, value) => updateMilieu(index, field, value)}
                    onUpdateDistribution={(attributeName, distribution) => updateDistribution(index, attributeName, distribution)}
                    onRemove={() => removeMilieu(index)}
                    isDisabled={false}
                />
            ))}

            {milieus.length === 0 && (
                <p style={{ 
                    color: 'var(--text-color)', 
                    opacity: 0.7, 
                    textAlign: 'center', 
                    padding: '20px',
                    fontStyle: 'italic',
                    fontSize: '12px'
                }}>
                    No milieus defined. Click "Add Milieu" to start.
                </p>
            )}
        </Card>
    );
};

export default InitialPopulationEditor;