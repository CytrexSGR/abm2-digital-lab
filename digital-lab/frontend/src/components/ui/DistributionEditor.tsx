import React from 'react';
import { DistributionConfig } from '../../types';

interface Props {
    config: DistributionConfig;
    onChange: (newConfig: DistributionConfig) => void;
    isDisabled?: boolean;
}

const distributionTypes = ['beta', 'uniform_int', 'normal', 'uniform_float', 'lognormal', 'pareto'] as const;

const DistributionEditor: React.FC<Props> = ({ config, onChange, isDisabled = false }) => {
    
    const handleTypeChange = (newType: DistributionConfig['type']) => {
        let newConfig: DistributionConfig = { type: newType };
        switch (newType) {
            case 'beta': 
                newConfig = { ...newConfig, alpha: 2, beta: 2 }; 
                break;
            case 'uniform_int': 
                newConfig = { ...newConfig, min: 0, max: 100 }; 
                break;
            case 'uniform_float': 
                newConfig = { ...newConfig, min: 0, max: 1 }; 
                break;
            case 'normal': 
                newConfig = { ...newConfig, mean: 0.5, std_dev: 0.15 }; 
                break;
            case 'lognormal': 
                newConfig = { ...newConfig, mean: 10.0, std_dev: 0.5 }; 
                break;
            case 'pareto': 
                newConfig = { ...newConfig, alpha: 2.0 }; 
                break;
        }
        onChange(newConfig);
    };

    const handleParamChange = (param: keyof DistributionConfig, value: string) => {
        const numericValue = value === '' ? undefined : Number(value);
        const newConfig = { ...config, [param]: numericValue };
        onChange(newConfig);
    };

    const renderParameterFields = () => {
        const inputProps = (param: keyof DistributionConfig) => ({
            type: "number",
            step: "0.01",
            value: config[param] ?? '',
            onChange: (e: React.ChangeEvent<HTMLInputElement>) => handleParamChange(param, e.target.value),
            disabled: isDisabled,
            style: { marginLeft: '5px', width: '80px' }
        });

        switch (config.type) {
            case 'beta':
                return (
                    <div>
                        Alpha: <input {...inputProps('alpha')} />
                        Beta: <input {...inputProps('beta')} />
                    </div>
                );
            case 'uniform_int':
            case 'uniform_float':
                return (
                    <div>
                        Min: <input {...inputProps('min')} />
                        Max: <input {...inputProps('max')} />
                    </div>
                );
            case 'normal':
            case 'lognormal':
                return (
                    <div>
                        Mean: <input {...inputProps('mean')} />
                        Std Dev: <input {...inputProps('std_dev')} />
                    </div>
                );
            case 'pareto':
                return (
                    <div>
                        Alpha: <input {...inputProps('alpha')} />
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div style={{ marginBottom: '10px', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}>
            <div style={{ marginBottom: '5px' }}>
                Type: 
                <select 
                    value={config.type} 
                    onChange={(e) => handleTypeChange(e.target.value as DistributionConfig['type'])}
                    disabled={isDisabled}
                    style={{ marginLeft: '5px' }}
                >
                    {distributionTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                    ))}
                </select>
            </div>
            {renderParameterFields()}
        </div>
    );
};

export default DistributionEditor;