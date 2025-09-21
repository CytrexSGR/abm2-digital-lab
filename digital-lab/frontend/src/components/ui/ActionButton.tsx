import React from 'react';
import { buttonStyles } from '../../styles/components';

interface ActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'success' | 'danger';
    size?: 'normal' | 'small';
    children: React.ReactNode;
}

const ActionButton: React.FC<ActionButtonProps> = ({ 
    children, 
    variant = 'primary', 
    size = 'normal',
    disabled = false,
    style, 
    ...props 
}) => {
    const baseStyle = { ...buttonStyles.base };
    const variantStyle = buttonStyles[variant] || buttonStyles.primary;
    const sizeStyle = size === 'small' ? buttonStyles.small : {};
    const disabledStyle = disabled ? buttonStyles.disabled : {};
    
    const combinedStyle = {
        ...baseStyle,
        ...variantStyle,
        ...sizeStyle,
        ...disabledStyle,
        ...style,
    };
    
    return (
        <button 
            style={combinedStyle} 
            disabled={disabled}
            {...props}
        >
            {children}
        </button>
    );
};

export default ActionButton;