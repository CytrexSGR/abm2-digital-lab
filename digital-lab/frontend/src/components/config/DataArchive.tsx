import React, { useState, useEffect } from 'react';
import { apiClient } from '../../api/axiosConfig';
import Card from '../ui/Card';
// Using simple text icons instead of react-icons for compatibility

interface Recording {
    filename: string;
    size?: number;          // Size in bytes from backend
    modified?: number;      // Unix timestamp from backend
}

const DataArchive: React.FC = () => {
    const [recordings, setRecordings] = useState<Recording[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const fetchRecordings = async () => {
        setIsLoading(true);
        try {
            const response = await apiClient.get<Recording[]>('/api/recordings');
            setRecordings(response.data);
        } catch (error) {
            console.error("Failed to fetch recordings:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchRecordings();
    }, []);

    const handleDownload = (filename: string) => {
        // Der Download wird durch direktes Ansteuern der URL im Browser ausgelöst
        window.open(`${apiClient.defaults.baseURL}/api/recordings/${filename}`);
    };

    return (
        <Card title="Data Archive (Recorded Runs)">
            <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-color)', fontSize: '14px' }}>
                    {recordings.length} recorded simulation runs
                </span>
                <button 
                    onClick={fetchRecordings} 
                    disabled={isLoading}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '8px 16px',
                        backgroundColor: isLoading ? '#666' : '#3498db',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: isLoading ? 'not-allowed' : 'pointer',
                        fontSize: '14px'
                    }}
                >
                    🔄 Refresh
                </button>
            </div>
            
            {recordings.length === 0 ? (
                <div style={{ 
                    textAlign: 'center', 
                    padding: '40px 20px',
                    color: 'var(--text-color)',
                    fontSize: '14px'
                }}>
                    {isLoading ? 'Loading recordings...' : 'No recorded runs found. Start a recording from the simulation controls.'}
                </div>
            ) : (
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ 
                        width: '100%', 
                        borderCollapse: 'collapse',
                        fontSize: '14px'
                    }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                                <th style={{ 
                                    padding: '12px 8px', 
                                    textAlign: 'left',
                                    color: 'var(--text-color)',
                                    fontWeight: 'bold'
                                }}>
                                    Filename
                                </th>
                                <th style={{ 
                                    padding: '12px 8px', 
                                    textAlign: 'right',
                                    color: 'var(--text-color)',
                                    fontWeight: 'bold'
                                }}>
                                    Size (KB)
                                </th>
                                <th style={{ 
                                    padding: '12px 8px', 
                                    textAlign: 'left',
                                    color: 'var(--text-color)',
                                    fontWeight: 'bold'
                                }}>
                                    Date
                                </th>
                                <th style={{ 
                                    padding: '12px 8px', 
                                    textAlign: 'center',
                                    color: 'var(--text-color)',
                                    fontWeight: 'bold'
                                }}>
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {recordings.map((rec, index) => (
                                <tr 
                                    key={rec.filename}
                                    style={{ 
                                        borderBottom: '1px solid var(--border-color)',
                                        backgroundColor: index % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)'
                                    }}
                                >
                                    <td style={{ 
                                        padding: '12px 8px',
                                        color: 'var(--text-color)',
                                        fontFamily: 'monospace'
                                    }}>
                                        {rec.filename}
                                    </td>
                                    <td style={{ 
                                        padding: '12px 8px', 
                                        textAlign: 'right',
                                        color: 'var(--text-color)'
                                    }}>
                                        {rec.size ? (rec.size / 1024).toFixed(2) : 'N/A'}
                                    </td>
                                    <td style={{ 
                                        padding: '12px 8px',
                                        color: 'var(--text-color)'
                                    }}>
                                        {rec.modified ? new Date(rec.modified * 1000).toLocaleString() : 'N/A'}
                                    </td>
                                    <td style={{ 
                                        padding: '12px 8px', 
                                        textAlign: 'center'
                                    }}>
                                        <button 
                                            onClick={() => handleDownload(rec.filename)}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '4px',
                                                padding: '6px 12px',
                                                backgroundColor: '#2ecc71',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '4px',
                                                cursor: 'pointer',
                                                fontSize: '12px',
                                                margin: '0 auto'
                                            }}
                                            title={`Download ${rec.filename}`}
                                        >
                                            💾 Download
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </Card>
    );
};

export default DataArchive;