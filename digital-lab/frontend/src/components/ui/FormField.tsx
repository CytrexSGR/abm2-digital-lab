import React from 'react';
import { labelStyles } from '../../styles/components';

interface FormFieldProps {
    label: string;
    description?: string;
    children: React.ReactNode;
    gridColumns?: string;
}

const FormField: React.FC<FormFieldProps> = ({ 
    label, 
    description, 
    children, 
    gridColumns = 'auto 1fr' 
}) => (
    <div style={{ marginBottom: '15px' }}>
        <div style={{ 
            display: 'grid', 
            gridTemplateColumns: gridColumns, 
            gap: '10px',
            alignItems: 'center' 
        }}>
            <label style={labelStyles.base}>
                {label}:
            </label>
            {children}
        </div>
        {description && (
            <small style={{ color: 'var(--text-secondary)', fontSize: '11px', display: 'block', marginTop: '4px' }}>
                {description}
            </small>
        )}
    </div>
);

export default FormField;