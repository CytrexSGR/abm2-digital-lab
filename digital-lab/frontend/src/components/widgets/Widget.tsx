import React from 'react';

interface Props {
    title: string;
    widgetId: string;
    children: React.ReactNode;
}

const Widget: React.FC<Props> = ({ title, widgetId, children }) => {
    return (
        <div style={{ 
            border: '1px solid var(--border-color)', 
            borderRadius: '8px', 
            height: '100%',
            display: 'flex', 
            flexDirection: 'column',
            backgroundColor: '#1c1e25',
            position: 'relative',
            overflow: 'hidden'
        }}>
            <header 
                className="widget-header"
                style={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    padding: '8px 12px', 
                    background: 'var(--surface-color)', 
                    borderBottom: '1px solid var(--border-color)',
                    minHeight: '40px'
                }} 
            >
                <strong style={{ 
                    color: 'var(--text-color)', 
                    fontSize: '14px',
                    fontWeight: '600',
                    letterSpacing: '0.3px'
                }}>
                    {title}
                </strong>
            </header>
            <div style={{ 
                flexGrow: 1, 
                position: 'relative', 
                background: '#1c1e25',
                overflow: 'auto'
            }}>
                {children}
            </div>
        </div>
    );
};

export default Widget;