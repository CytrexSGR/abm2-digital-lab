import React, { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../../api/axiosConfig';

interface Props {
    sectionName: string;
    onLoadPreset: (data: any) => void;
    getConfigDataForSave: () => any; // Funktion, um die aktuellen Daten der Sektion zu holen
    isDisabled: boolean;
}

const PresetManager: React.FC<Props> = ({ sectionName, onLoadPreset, getConfigDataForSave, isDisabled }) => {
    const [presets, setPresets] = useState<string[]>([]);
    const [selectedPreset, setSelectedPreset] = useState<string>('');
    const [newPresetName, setNewPresetName] = useState<string>('');

    const fetchPresets = useCallback(async () => {
        try {
            const response = await apiClient.get<string[]>(`/api/presets/${sectionName}`);
            setPresets(response.data);
            if (response.data.length > 0) {
                setSelectedPreset(response.data[0]);
            } else {
                setSelectedPreset('');
            }
        } catch (error) { console.error(`Failed to fetch ${sectionName} presets`, error); }
    }, [sectionName]);

    useEffect(() => { fetchPresets(); }, [fetchPresets]);

    const handleLoad = async () => {
        if (!selectedPreset) return;
        try {
            const response = await apiClient.get(`/api/presets/${sectionName}/${selectedPreset}`);
            onLoadPreset(response.data);
        } catch (error) { console.error(`Failed to load preset`, error); }
    };

    const handleDelete = async () => {
        if (!selectedPreset) return;
        
        if (window.confirm(`Are you sure you want to delete the preset "${selectedPreset}"?`)) {
            try {
                await apiClient.delete(`/api/presets/${sectionName}/${selectedPreset}`);
                fetchPresets(); // Liste aktualisieren
            } catch (error) {
                console.error(`Failed to delete preset`, error);
                alert('Error deleting preset.');
            }
        }
    };

    const handleSave = async () => {
        if (!newPresetName) return;
        try {
            const currentData = getConfigDataForSave();
            await apiClient.post(`/api/presets/${sectionName}/${newPresetName}`, currentData);
            setNewPresetName('');
            fetchPresets(); // Liste aktualisieren
        } catch (error) { console.error(`Failed to save preset`, error); }
    };

    return (
        <div style={{ marginTop: '20px', borderTop: '1px solid #444', paddingTop: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <select value={selectedPreset} onChange={e => setSelectedPreset(e.target.value)} disabled={isDisabled || presets.length === 0}>
                        {presets.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                    <button onClick={handleLoad} disabled={isDisabled || !selectedPreset}>Load</button>
                    <button onClick={handleDelete} disabled={isDisabled || !selectedPreset} style={{ backgroundColor: '#dc3545' }}>Delete</button>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <input type="text" placeholder="New preset name..." value={newPresetName} onChange={e => setNewPresetName(e.target.value)} disabled={isDisabled} />
                    <button onClick={handleSave} disabled={isDisabled || !newPresetName}>Save as New</button>
                </div>
            </div>
        </div>
    );
};

export default PresetManager;