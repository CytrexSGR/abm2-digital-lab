import React from 'react';
import { inputStyles } from '../../styles/components';

interface StyledInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    variant?: 'normal' | 'small';
}

const StyledInput: React.FC<StyledInputProps> = ({ 
    variant = 'normal',
    disabled = false,
    style, 
    ...props 
}) => {
    const baseStyle = { ...inputStyles.base };
    const variantStyle = variant === 'small' ? inputStyles.small : {};
    const disabledStyle = disabled ? inputStyles.disabled : {};
    
    const combinedStyle = {
        ...baseStyle,
        ...variantStyle,
        ...disabledStyle,
        ...style,
    };
    
    return (
        <input 
            style={combinedStyle} 
            disabled={disabled}
            {...props}
        />
    );
};

export default StyledInput;