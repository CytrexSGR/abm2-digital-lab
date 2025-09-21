import React, { useState, useEffect } from 'react';
import { MilieuConfig, IdeologicalCenter, MilieuAttributeDistributions, DistributionConfig } from '../../types';
import { apiClient } from '../../api/axiosConfig';
import Card from './Card';
import DistributionEditor from './DistributionEditor';
import PresetManager from './PresetManager';
import ActionButton from './ActionButton';
import StyledInput from './StyledInput';
import { containerStyles } from '../../styles/components';

const MilieuEditor: React.FC<{ isDisabled: boolean }> = ({ isDisabled }) => {
    const [milieus, setMilieus] = useState<MilieuConfig[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchMilieus();
    }, []);

    const fetchMilieus = async () => {
        try {
            const response = await apiClient.get('/api/milieus');
            setMilieus(response.data);
        } catch (error) {
            console.error('Error fetching milieus:', error);
        } finally {
            setLoading(false);
        }
    };

    const saveMilieus = async () => {
        // Validate proportions sum to 1
        const totalProportion = milieus.reduce((sum, milieu) => sum + milieu.proportion, 0);
        if (Math.abs(totalProportion - 1.0) > 0.001) {
            alert(`Warning: Milieu proportions sum to ${totalProportion.toFixed(3)}, but should sum to 1.0`);
        }

        setSaving(true);
        try {
            await apiClient.post('/api/milieus', milieus);
            alert('Milieus saved successfully!');
        } catch (error) {
            console.error('Error saving milieus:', error);
            alert('Error saving milieus');
        } finally {
            setSaving(false);
        }
    };

    const addMilieu = () => {
        const newMilieu: MilieuConfig = {
            name: `New Milieu ${milieus.length + 1}`,
            proportion: 0.1,
            color: '#808080',
            ideological_center: {
                economic_axis: 0.0,
                social_axis: 0.0
            },
            attribute_distributions: {
                bildung: { type: 'beta', alpha: 2.0, beta: 2.0 },
                freedom_preference: { type: 'beta', alpha: 2.0, beta: 2.0 },
                altruism_factor: { type: 'beta', alpha: 2.0, beta: 2.0 },
                sozialkapital: { type: 'beta', alpha: 2.0, beta: 2.0 }
            }
        };
        setMilieus([...milieus, newMilieu]);
    };

    const updateMilieu = (index: number, field: keyof MilieuConfig, value: any) => {
        const updated = [...milieus];
        (updated[index] as any)[field] = value;
        setMilieus(updated);
    };

    const updateIdeologicalCenter = (index: number, field: keyof IdeologicalCenter, value: number) => {
        const updated = [...milieus];
        updated[index].ideological_center[field] = value;
        setMilieus(updated);
    };

    const updateDistribution = (milieuIndex: number, attributeName: keyof MilieuAttributeDistributions, distribution: DistributionConfig) => {
        const updated = [...milieus];
        updated[milieuIndex].attribute_distributions[attributeName] = distribution;
        setMilieus(updated);
    };

    const deleteMilieu = (index: number) => {
        if (window.confirm('Are you sure you want to delete this milieu?')) {
            setMilieus(milieus.filter((_, i) => i !== index));
        }
    };

    const normalizeProportions = () => {
        const total = milieus.reduce((sum, milieu) => sum + milieu.proportion, 0);
        if (total > 0) {
            const normalized = milieus.map(milieu => ({
                ...milieu,
                proportion: milieu.proportion / total
            }));
            setMilieus(normalized);
        }
    };

    const handleLoadPresetForMilieus = (data: MilieuConfig[]) => {
        setMilieus(data);
    };

    if (loading) {
        return <Card title="Milieu Configuration">Loading...</Card>;
    }

    return (
        <Card title="Milieu Configuration">
            <div style={{ marginBottom: '15px' }}>
                <p style={{ color: 'var(--text-color)', fontSize: '12px', marginBottom: '10px' }}>
                    Define socio-ideological starting conditions for agent initialization. Each milieu has an ideological center and attribute distributions for social characteristics only.
                </p>
                <div style={containerStyles.flexCenter}>
                    <ActionButton
                        onClick={addMilieu}
                        disabled={isDisabled}
                        variant="primary"
                    >
                        Add Milieu
                    </ActionButton>
                    <ActionButton
                        onClick={normalizeProportions}
                        disabled={isDisabled}
                        variant="secondary"
                    >
                        Normalize Proportions
                    </ActionButton>
                    <ActionButton
                        onClick={saveMilieus}
                        disabled={saving || isDisabled}
                        variant="success"
                    >
                        {saving ? 'Saving...' : 'Save'}
                    </ActionButton>
                </div>
            </div>

            <PresetManager
                sectionName="milieus"
                onLoadPreset={handleLoadPresetForMilieus}
                getConfigDataForSave={() => milieus}
                isDisabled={isDisabled}
            />

            {milieus.map((milieu, index) => (
                <Card title={`${milieu.name} (${(milieu.proportion * 100).toFixed(1)}%)`} key={index} defaultOpen={false}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                        <div style={{ flex: 1 }}>
                            {/* Basic Milieu Parameters */}
                            <div style={{ marginBottom: '15px' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto 1fr auto 1fr', gap: '10px', alignItems: 'center' }}>
                                    <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Name:</label>
                                    <StyledInput
                                        type="text"
                                        value={milieu.name}
                                        onChange={(e) => updateMilieu(index, 'name', e.target.value)}
                                        disabled={isDisabled}
                                        variant="small"
                                    />
                                    
                                    <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Proportion:</label>
                                    <StyledInput
                                        type="number"
                                        value={milieu.proportion}
                                        onChange={(e) => updateMilieu(index, 'proportion', parseFloat(e.target.value) || 0)}
                                        disabled={isDisabled}
                                        min="0"
                                        max="1"
                                        step="0.01"
                                        variant="small"
                                    />
                                    
                                    <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Color:</label>
                                    <input
                                        type="color"
                                        value={milieu.color}
                                        onChange={(e) => updateMilieu(index, 'color', e.target.value)}
                                        disabled={isDisabled}
                                        style={{
                                            padding: '2px',
                                            border: '1px solid var(--border-color)',
                                            borderRadius: '4px',
                                            width: '40px',
                                            height: '30px',
                                            cursor: isDisabled ? 'not-allowed' : 'pointer'
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                        
                        <ActionButton
                            onClick={() => deleteMilieu(index)}
                            disabled={isDisabled}
                            variant="danger"
                            size="small"
                            style={{ marginLeft: '10px' }}
                        >
                            Delete
                        </ActionButton>
                    </div>

                    {/* Ideological Center */}
                    <Card title="Ideological Center" defaultOpen={true}>
                        <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '10px' }}>
                            The ideological position that defines this milieu's political orientation (-1 to +1 on each axis).
                        </p>
                        <div style={containerStyles.gridAuto}>
                            <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Economic Axis:</label>
                            <StyledInput
                                type="number"
                                value={milieu.ideological_center.economic_axis}
                                onChange={(e) => updateIdeologicalCenter(index, 'economic_axis', parseFloat(e.target.value) || 0)}
                                disabled={isDisabled}
                                min="-1"
                                max="1"
                                step="0.1"
                                variant="small"
                            />
                            
                            <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Social Axis:</label>
                            <StyledInput
                                type="number"
                                value={milieu.ideological_center.social_axis}
                                onChange={(e) => updateIdeologicalCenter(index, 'social_axis', parseFloat(e.target.value) || 0)}
                                disabled={isDisabled}
                                min="-1"
                                max="1"
                                step="0.1"
                                variant="small"
                            />
                        </div>
                    </Card>

                    {/* Attribute Distributions - Only the 4 allowed attributes */}
                    <Card title="Attribute Distributions" defaultOpen={false}>
                        <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '10px' }}>
                            Social and ideological attributes assigned to agents from this milieu. Economic attributes come from biomes.
                        </p>
                        
                        {(Object.keys(milieu.attribute_distributions) as (keyof MilieuAttributeDistributions)[]).map((attributeName) => (
                            <div key={attributeName} style={{ marginBottom: '15px' }}>
                                <h4 style={{ 
                                    fontSize: '13px', 
                                    fontWeight: 'bold', 
                                    color: 'var(--text-color)', 
                                    marginBottom: '8px',
                                    textTransform: 'capitalize'
                                }}>
                                    {attributeName.replace('_', ' ')}:
                                </h4>
                                <DistributionEditor
                                    config={milieu.attribute_distributions[attributeName]}
                                    onChange={(newDist) => updateDistribution(index, attributeName, newDist)}
                                    isDisabled={isDisabled}
                                />
                            </div>
                        ))}
                    </Card>
                </Card>
            ))}
        </Card>
    );
};

export default MilieuEditor;