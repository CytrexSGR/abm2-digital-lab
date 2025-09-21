import React, { useState } from 'react';

interface Props {
    title: string;
    children: React.ReactNode;
    defaultOpen?: boolean;
}

const cardStyle: React.CSSProperties = {
    backgroundColor: 'var(--surface-color)',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    padding: '16px',
    marginBottom: '20px',
};

const titleStyle: React.CSSProperties = {
    marginTop: 0,
    borderBottom: '1px solid var(--border-color)',
    paddingBottom: '10px',
    cursor: 'pointer', // Wichtig für die UX
    display: 'flex',
    justifyContent: 'space-between',
    userSelect: 'none', // Verhindert das Markieren von Text beim Klicken
    color: 'var(--text-color)',
};

const Card: React.FC<Props> = ({ title, children, defaultOpen = true }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    const toggleOpen = () => {
        setIsOpen(!isOpen);
    };

    return (
        <div style={cardStyle}>
            <h3 style={titleStyle} onClick={toggleOpen}>
                <span>{title}</span>
                <span>{isOpen ? '▾' : '▸'}</span>
            </h3>
            {isOpen && (
                <div>
                    {children}
                </div>
            )}
        </div>
    );
};

export default Card;