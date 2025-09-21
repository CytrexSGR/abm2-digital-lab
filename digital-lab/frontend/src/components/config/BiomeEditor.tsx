import React from 'react';
import { BiomeConfig } from '../../types';
import Card from '../ui/Card';
import DistributionEditor from '../ui/DistributionEditor';

interface Props {
    biomes: BiomeConfig[];
    onBiomeChange: (index: number, updatedBiome: BiomeConfig) => void;
    onBiomesChange: (newBiomes: BiomeConfig[]) => void;
    isDisabled: boolean;
}

const BiomeEditor: React.FC<Props> = ({ biomes, onBiomeChange, onBiomesChange, isDisabled }) => {
    
    // NEUE HANDLER
    const handleAddBiome = () => {
        const newBiome: BiomeConfig = {
            name: `New Biome ${biomes.length + 1}`,
            einkommen_verteilung: { type: 'lognormal', mean: 10.0, std_dev: 0.5 },
            vermoegen_verteilung: { type: 'pareto', alpha: 2.0 },
            sozialleistungs_niveau: 0.2,
            hazard_probability: 0.02,
            hazard_impact_factor: 0.3,
            // Neue Felder mit Standardwerten
            capacity: 1000.0,
            initial_quality: 500.0,
            regeneration_rate: 25.0,
            produktivitaets_faktor: 1.0,
            knappheits_schwelle: 6000.0,
            risiko_vermoegen_schwelle: 4000.0,
            population_percentage: 25.0,  // Default to equal distribution
            environmental_sensitivity: 0.000002  // Default sensitivity value
        };
        onBiomesChange([...biomes, newBiome]);
    };

    const handleRemoveBiome = (indexToRemove: number) => {
        if (window.confirm(`Are you sure you want to remove ${biomes[indexToRemove].name}?`)) {
            onBiomesChange(biomes.filter((_, index) => index !== indexToRemove));
        }
    };
    
    const handleSimpleValueChange = (index: number, field: keyof BiomeConfig, value: string) => {
        const biome = biomes[index];
        const numericValue = parseFloat(value);
        
        if (field === 'name') {
            onBiomeChange(index, { ...biome, [field]: value });
        } else {
            onBiomeChange(index, { ...biome, [field]: isNaN(numericValue) ? 0 : numericValue });
        }
    };

    const handleDistributionChange = (index: number, field: 'einkommen_verteilung' | 'vermoegen_verteilung', newConfig: any) => {
        const biome = biomes[index];
        onBiomeChange(index, { ...biome, [field]: newConfig });
    };

    const calculatePercentageSum = () => {
        return biomes.reduce((sum, biome) => sum + biome.population_percentage, 0);
    };

    const percentageSum = calculatePercentageSum();
    const isPercentageValid = Math.abs(percentageSum - 100) < 0.1;

    return (
        <div>
            {/* Validation Summary */}
            <div style={{ 
                marginBottom: '15px', 
                padding: '10px', 
                borderRadius: '4px',
                backgroundColor: isPercentageValid ? '#d4edda' : '#f8d7da',
                border: `1px solid ${isPercentageValid ? '#c3e6cb' : '#f5c6cb'}`,
                color: isPercentageValid ? '#155724' : '#721c24'
            }}>
                <strong>Population Distribution: {percentageSum.toFixed(1)}%</strong>
                {!isPercentageValid && (
                    <div style={{ fontSize: '12px', marginTop: '5px' }}>
                        ⚠️ Total should equal 100%. Current total: {percentageSum.toFixed(1)}%
                    </div>
                )}
            </div>

            {biomes.map((biome, index) => (
                <Card title={biome.name} key={index} defaultOpen={false}>
                    {/* HINZUFÜGEN DES REMOVE-BUTTONS */}
                    <button 
                        onClick={() => handleRemoveBiome(index)} 
                        disabled={isDisabled || biomes.length <= 1}
                        style={{ 
                            float: 'right', 
                            backgroundColor: '#dc3545', 
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            padding: '5px 10px',
                            cursor: isDisabled || biomes.length <= 1 ? 'not-allowed' : 'pointer',
                            marginBottom: '10px'
                        }}
                        title={biomes.length <= 1 ? "Cannot remove the last biome" : "Remove this biome"}
                    >
                        Remove
                    </button>
                    <div style={{ clear: 'both' }}></div>
                    <div style={{ marginBottom: '15px' }}>
                        <h4 style={{ marginBottom: '10px', color: 'var(--text-color)' }}>Basic Parameters</h4>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                                    Biome Name:
                                </label>
                                <input
                                    type="text"
                                    value={biome.name}
                                    onChange={(e) => handleSimpleValueChange(index, 'name', e.target.value)}
                                    disabled={isDisabled}
                                    style={{ width: '100%', padding: '5px', border: '1px solid #ccc', borderRadius: '4px' }}
                                />
                            </div>
                            
                            <div>
                                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                                    Population Percentage:
                                </label>
                                <input
                                    type="number"
                                    step="0.1"
                                    min="0"
                                    max="100"
                                    value={biome.population_percentage}
                                    onChange={(e) => handleSimpleValueChange(index, 'population_percentage', e.target.value)}
                                    disabled={isDisabled}
                                    style={{ width: '100%', padding: '5px', border: '1px solid #ccc', borderRadius: '4px' }}
                                />
                                <small style={{ color: 'var(--text-secondary)' }}>Percentage of total agents in this biome</small>
                            </div>
                            
                            <div>
                                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                                    Social Benefits Level:
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    max="1"
                                    value={biome.sozialleistungs_niveau}
                                    onChange={(e) => handleSimpleValueChange(index, 'sozialleistungs_niveau', e.target.value)}
                                    disabled={isDisabled}
                                    style={{ width: '100%', padding: '5px', border: '1px solid #ccc', borderRadius: '4px' }}
                                />
                                <small style={{ color: 'var(--text-secondary)' }}>Proportion of median income (e.g., 0.15 = 15%)</small>
                            </div>
                            
                            <div>
                                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                                    Hazard Probability:
                                </label>
                                <input
                                    type="number"
                                    step="0.001"
                                    min="0"
                                    max="1"
                                    value={biome.hazard_probability}
                                    onChange={(e) => handleSimpleValueChange(index, 'hazard_probability', e.target.value)}
                                    disabled={isDisabled}
                                    style={{ width: '100%', padding: '5px', border: '1px solid #ccc', borderRadius: '4px' }}
                                />
                                <small style={{ color: 'var(--text-secondary)' }}>Per-step probability (e.g., 0.05 = 5%)</small>
                            </div>
                            
                            <div>
                                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                                    Hazard Impact Factor:
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    max="1"
                                    value={biome.hazard_impact_factor}
                                    onChange={(e) => handleSimpleValueChange(index, 'hazard_impact_factor', e.target.value)}
                                    disabled={isDisabled}
                                    style={{ width: '100%', padding: '5px', border: '1px solid #ccc', borderRadius: '4px' }}
                                />
                                <small style={{ color: 'var(--text-secondary)' }}>Wealth/income loss factor (e.g., 0.4 = 40%)</small>
                            </div>
                        </div>
                    </div>

                    <div style={{ marginBottom: '15px' }}>
                        <h4 style={{ marginBottom: '10px', color: 'var(--text-color)' }}>Income Distribution</h4>
                        <DistributionEditor
                            config={biome.einkommen_verteilung}
                            onChange={(newConfig) => handleDistributionChange(index, 'einkommen_verteilung', newConfig)}
                            isDisabled={isDisabled}
                        />
                        <small style={{ color: 'var(--text-secondary)', display: 'block', marginTop: '5px' }}>
                            Controls how agent incomes are generated in this biome
                        </small>
                    </div>

                    <div style={{ marginBottom: '15px' }}>
                        <h4 style={{ marginBottom: '10px', color: 'var(--text-color)' }}>Wealth Distribution</h4>
                        <DistributionEditor
                            config={biome.vermoegen_verteilung}
                            onChange={(newConfig) => handleDistributionChange(index, 'vermoegen_verteilung', newConfig)}
                            isDisabled={isDisabled}
                        />
                        <small style={{ color: 'var(--text-secondary)', display: 'block', marginTop: '5px' }}>
                            Controls initial agent wealth distribution in this biome
                        </small>
                    </div>

                    {/* --- NEUE SEKTION 1 --- */}
                    <div style={{ marginBottom: '15px' }}>
                        <h4 style={{ marginBottom: '10px', color: 'var(--text-color)' }}>Ecological Parameters</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                                    Capacity:
                                </label>
                                <input 
                                    type="number" 
                                    value={biome.capacity} 
                                    onChange={e => handleSimpleValueChange(index, 'capacity', e.target.value)} 
                                    disabled={isDisabled}
                                    style={{ width: '100%', padding: '5px', border: '1px solid #ccc', borderRadius: '4px' }}
                                />
                                <small style={{ color: 'var(--text-secondary)' }}>Maximum environmental capacity</small>
                            </div>
                            
                            <div>
                                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                                    Initial Quality:
                                </label>
                                <input 
                                    type="number" 
                                    value={biome.initial_quality} 
                                    onChange={e => handleSimpleValueChange(index, 'initial_quality', e.target.value)} 
                                    disabled={isDisabled}
                                    style={{ width: '100%', padding: '5px', border: '1px solid #ccc', borderRadius: '4px' }}
                                />
                                <small style={{ color: 'var(--text-secondary)' }}>Starting environmental quality</small>
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                                    Regeneration Rate:
                                </label>
                                <input 
                                    type="number" 
                                    value={biome.regeneration_rate} 
                                    onChange={e => handleSimpleValueChange(index, 'regeneration_rate', e.target.value)} 
                                    disabled={isDisabled}
                                    style={{ width: '100%', padding: '5px', border: '1px solid #ccc', borderRadius: '4px' }}
                                />
                                <small style={{ color: 'var(--text-secondary)' }}>Environmental recovery rate per step</small>
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                                    Productivity Factor:
                                </label>
                                <input 
                                    type="number" 
                                    step="0.1"
                                    value={biome.produktivitaets_faktor} 
                                    onChange={e => handleSimpleValueChange(index, 'produktivitaets_faktor', e.target.value)} 
                                    disabled={isDisabled}
                                    style={{ width: '100%', padding: '5px', border: '1px solid #ccc', borderRadius: '4px' }}
                                />
                                <small style={{ color: 'var(--text-secondary)' }}>Income generation multiplier (e.g., 1.2 = 120%)</small>
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                                    Environmental Sensitivity:
                                </label>
                                <input 
                                    type="number" 
                                    step="0.000001"
                                    value={biome.environmental_sensitivity} 
                                    onChange={e => handleSimpleValueChange(index, 'environmental_sensitivity', e.target.value)} 
                                    disabled={isDisabled}
                                    style={{ width: '100%', padding: '5px', border: '1px solid #ccc', borderRadius: '4px' }}
                                />
                                <small style={{ color: 'var(--text-secondary)' }}>Multiplier for investment → hazard link</small>
                            </div>
                        </div>
                    </div>

                    {/* --- NEUE SEKTION 2 --- */}
                    <div style={{ marginBottom: '15px' }}>
                        <h4 style={{ marginBottom: '10px', color: 'var(--text-color)' }}>Behavioral Thresholds</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                                    Scarcity Threshold:
                                </label>
                                <input 
                                    type="number" 
                                    value={biome.knappheits_schwelle} 
                                    onChange={e => handleSimpleValueChange(index, 'knappheits_schwelle', e.target.value)} 
                                    disabled={isDisabled}
                                    style={{ width: '100%', padding: '5px', border: '1px solid #ccc', borderRadius: '4px' }}
                                />
                                <small style={{ color: 'var(--text-secondary)' }}>Wealth level that triggers scarcity effects</small>
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                                    Risk/Wealth Threshold:
                                </label>
                                <input 
                                    type="number" 
                                    value={biome.risiko_vermoegen_schwelle} 
                                    onChange={e => handleSimpleValueChange(index, 'risiko_vermoegen_schwelle', e.target.value)} 
                                    disabled={isDisabled}
                                    style={{ width: '100%', padding: '5px', border: '1px solid #ccc', borderRadius: '4px' }}
                                />
                                <small style={{ color: 'var(--text-secondary)' }}>Wealth threshold for risk-related behavior</small>
                            </div>
                        </div>
                    </div>
                </Card>
            ))}
            {/* HINZUFÜGEN DES ADD-BUTTONS */}
            <div style={{ marginTop: '15px', textAlign: 'center' }}>
                <button 
                    onClick={handleAddBiome} 
                    disabled={isDisabled}
                    style={{
                        backgroundColor: '#28a745',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '10px 20px',
                        fontSize: '16px',
                        cursor: isDisabled ? 'not-allowed' : 'pointer',
                        transition: 'background-color 0.3s'
                    }}
                    onMouseOver={(e) => {
                        if (!isDisabled) e.currentTarget.style.backgroundColor = '#218838';
                    }}
                    onMouseOut={(e) => {
                        if (!isDisabled) e.currentTarget.style.backgroundColor = '#28a745';
                    }}
                >
                    + Add Biome
                </button>
            </div>
        </div>
    );
};

export default BiomeEditor;