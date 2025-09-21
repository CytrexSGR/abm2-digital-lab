import React, { useState, useEffect } from 'react';
import { MediaSource } from '../../types';
import { apiClient } from '../../api/axiosConfig';
import Card from '../ui/Card';
import PresetManager from '../ui/PresetManager';

interface Props {
    isDisabled: boolean;
}

const MediaEditor: React.FC<Props> = ({ isDisabled }) => {
    const [mediaSources, setMediaSources] = useState<MediaSource[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [status, setStatus] = useState<string>('Loading...');

    useEffect(() => {
        fetchMediaSources();
    }, []);

    const fetchMediaSources = async () => {
        try {
            setIsLoading(true);
            const response = await apiClient.get<MediaSource[]>('/api/media_sources');
            setMediaSources(response.data);
            setStatus('Loaded successfully.');
        } catch (error) {
            console.error('Failed to fetch media sources:', error);
            setStatus('Error loading media sources.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddMediaSource = () => {
        const newSource: MediaSource = {
            name: `New Media Source ${mediaSources.length + 1}`,
            ideological_position: {
                economic_axis: 0.0,
                social_axis: 0.0
            }
        };
        setMediaSources([...mediaSources, newSource]);
    };

    const handleRemoveMediaSource = (indexToRemove: number) => {
        if (window.confirm(`Are you sure you want to remove ${mediaSources[indexToRemove].name}?`)) {
            setMediaSources(mediaSources.filter((_, index) => index !== indexToRemove));
        }
    };

    const handleMediaSourceChange = (index: number, field: string, value: string | number) => {
        const updatedSources = [...mediaSources];
        if (field === 'name') {
            updatedSources[index].name = value as string;
        } else if (field === 'economic_axis') {
            updatedSources[index].ideological_position.economic_axis = Number(value);
        } else if (field === 'social_axis') {
            updatedSources[index].ideological_position.social_axis = Number(value);
        }
        setMediaSources(updatedSources);
    };

    const handleSaveMediaSources = async () => {
        try {
            await apiClient.post('/api/media_sources', mediaSources);
            setStatus('Media sources saved successfully!');
            setTimeout(() => setStatus('Loaded successfully.'), 3000);
        } catch (error) {
            console.error('Failed to save media sources:', error);
            setStatus('Error saving media sources.');
        }
    };

    const handleLoadPreset = (data: MediaSource[]) => {
        setMediaSources(data);
        setStatus('Preset loaded successfully!');
        setTimeout(() => setStatus('Loaded successfully.'), 3000);
    };

    if (isLoading) {
        return <div>Loading media sources...</div>;
    }

    return (
        <Card title="Media Landscape">
            <div style={{ marginBottom: '15px', fontSize: '12px', color: 'var(--text-color)', opacity: 0.8 }}>
                Configure the media sources available in the simulation. Each source has an ideological position 
                in the political space (Economic: -1=Left to 1=Right, Social: -1=Authoritarian to 1=Libertarian).
            </div>

            <div style={{ marginBottom: '10px', fontSize: '11px', color: 'var(--text-color)' }}>
                Status: {status}
            </div>

            {mediaSources.map((source, index) => (
                <div key={index} style={{
                    marginBottom: '15px',
                    padding: '12px',
                    backgroundColor: 'var(--background-color)',
                    borderRadius: '6px',
                    border: '1px solid var(--border-color)'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <h4 style={{ margin: 0, fontSize: '13px', color: 'var(--text-color)' }}>
                            Media Source {index + 1}
                        </h4>
                        <button
                            onClick={() => handleRemoveMediaSource(index)}
                            disabled={isDisabled || mediaSources.length <= 1}
                            style={{
                                backgroundColor: '#ff6b6b',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                padding: '4px 8px',
                                fontSize: '10px',
                                cursor: 'pointer'
                            }}
                        >
                            Remove
                        </button>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', fontSize: '11px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', color: 'var(--text-color)' }}>
                                Name:
                            </label>
                            <input
                                type="text"
                                value={source.name}
                                onChange={(e) => handleMediaSourceChange(index, 'name', e.target.value)}
                                disabled={isDisabled}
                                style={{
                                    width: '100%',
                                    padding: '4px',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: '3px',
                                    fontSize: '11px',
                                    backgroundColor: 'var(--surface-color)',
                                    color: 'var(--text-color)'
                                }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', color: 'var(--text-color)' }}>
                                Economic Axis (-1 to 1):
                            </label>
                            <input
                                type="number"
                                min="-1"
                                max="1"
                                step="0.1"
                                value={source.ideological_position.economic_axis}
                                onChange={(e) => handleMediaSourceChange(index, 'economic_axis', e.target.value)}
                                disabled={isDisabled}
                                style={{
                                    width: '100%',
                                    padding: '4px',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: '3px',
                                    fontSize: '11px',
                                    backgroundColor: 'var(--surface-color)',
                                    color: 'var(--text-color)'
                                }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', color: 'var(--text-color)' }}>
                                Social Axis (-1 to 1):
                            </label>
                            <input
                                type="number"
                                min="-1"
                                max="1"
                                step="0.1"
                                value={source.ideological_position.social_axis}
                                onChange={(e) => handleMediaSourceChange(index, 'social_axis', e.target.value)}
                                disabled={isDisabled}
                                style={{
                                    width: '100%',
                                    padding: '4px',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: '3px',
                                    fontSize: '11px',
                                    backgroundColor: 'var(--surface-color)',
                                    color: 'var(--text-color)'
                                }}
                            />
                        </div>
                    </div>

                    <div style={{ marginTop: '8px', fontSize: '10px', color: 'var(--text-color)', opacity: 0.7 }}>
                        Position: ({source.ideological_position.economic_axis}, {source.ideological_position.social_axis})
                        {source.ideological_position.economic_axis < -0.3 && ' (Left-leaning)'}
                        {source.ideological_position.economic_axis > 0.3 && ' (Right-leaning)'}
                        {Math.abs(source.ideological_position.economic_axis) <= 0.3 && ' (Centrist)'}
                    </div>
                </div>
            ))}

            <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                <button
                    onClick={handleAddMediaSource}
                    disabled={isDisabled}
                    style={{
                        backgroundColor: 'var(--primary-color)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '8px 16px',
                        fontSize: '11px',
                        cursor: 'pointer'
                    }}
                >
                    Add Media Source
                </button>
                
                <button
                    onClick={handleSaveMediaSources}
                    disabled={isDisabled}
                    style={{
                        backgroundColor: '#51cf66',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '8px 16px',
                        fontSize: '11px',
                        cursor: 'pointer'
                    }}
                >
                    Save Media Sources
                </button>
            </div>
            
            <PresetManager
                sectionName="media_landscape"
                onLoadPreset={handleLoadPreset}
                getConfigDataForSave={() => mediaSources}
                isDisabled={isDisabled}
            />
        </Card>
    );
};

export default MediaEditor;