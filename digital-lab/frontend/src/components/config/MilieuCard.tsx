import React, { useState } from 'react';
import { InitialMilieu, DistributionConfig } from '../../types';
import DistributionEditor from '../ui/DistributionEditor';
import ActionButton from '../ui/ActionButton';
import StyledInput from '../ui/StyledInput';
import { containerStyles, miscStyles } from '../../styles/components';

interface MilieuCardProps {
    milieu: InitialMilieu;
    index: number;
    onUpdate: (field: keyof InitialMilieu, value: any) => void;
    onUpdateDistribution: (attributeName: string, distribution: DistributionConfig) => void;
    onRemove: () => void;
    isDisabled?: boolean;
}

const MilieuCard: React.FC<MilieuCardProps> = ({ 
    milieu, 
    index,
    onUpdate, 
    onUpdateDistribution,
    onRemove, 
    isDisabled = false 
}) => {
    const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
    const [isAttributesCollapsed, setIsAttributesCollapsed] = useState<boolean>(false);

    const toggleCollapse = () => setIsCollapsed(!isCollapsed);
    const toggleAttributesCollapse = () => setIsAttributesCollapsed(!isAttributesCollapsed);

    return (
        <div style={containerStyles.card}>
            <div style={containerStyles.flexBetween}>
                <div style={containerStyles.flexCenter}>
                    <ActionButton
                        onClick={toggleCollapse}
                        size="small"
                        variant="secondary"
                    >
                        {isCollapsed ? '▶' : '▼'}
                    </ActionButton>
                    <div
                        style={{
                            ...miscStyles.colorSquare,
                            backgroundColor: milieu.color || '#808080'
                        }}
                    ></div>
                    <h4 style={{ margin: 0, color: 'var(--text-color)', fontSize: '14px' }}>
                        {milieu.name} ({(milieu.proportion * 100).toFixed(1)}%)
                    </h4>
                </div>
                <ActionButton
                    onClick={onRemove}
                    disabled={isDisabled}
                    variant="danger"
                    size="small"
                >
                    Delete
                </ActionButton>
            </div>

            {!isCollapsed && (
                <>
                    <div style={{ marginBottom: '15px' }}>
                        <div style={containerStyles.grid3}>
                            <div>
                                <label style={{ display: 'block', color: 'var(--text-color)', fontSize: '12px', marginBottom: '4px' }}>
                                    Name:
                                </label>
                                <StyledInput
                                    type="text"
                                    value={milieu.name}
                                    onChange={(e) => onUpdate('name', e.target.value)}
                                    disabled={isDisabled}
                                    variant="small"
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', color: 'var(--text-color)', fontSize: '12px', marginBottom: '4px' }}>
                                    Proportion ({(milieu.proportion * 100).toFixed(1)}%):
                                </label>
                                <StyledInput
                                    type="number"
                                    min="0"
                                    max="1"
                                    step="0.01"
                                    value={milieu.proportion}
                                    onChange={(e) => onUpdate('proportion', parseFloat(e.target.value) || 0)}
                                    disabled={isDisabled}
                                    variant="small"
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', color: 'var(--text-color)', fontSize: '12px', marginBottom: '4px' }}>
                                    Color:
                                </label>
                                <input
                                    type="color"
                                    value={milieu.color || '#808080'}
                                    onChange={(e) => onUpdate('color', e.target.value)}
                                    disabled={isDisabled}
                                    style={{
                                        width: '100%',
                                        height: '32px',
                                        border: '1px solid var(--border-color)',
                                        borderRadius: '4px',
                                        backgroundColor: isDisabled ? '#f5f5f5' : 'var(--background-color)',
                                        cursor: isDisabled ? 'not-allowed' : 'pointer'
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                            <button
                                onClick={toggleAttributesCollapse}
                                style={{
                                    padding: '4px 8px',
                                    backgroundColor: 'var(--secondary-color)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '11px',
                                    minWidth: '24px'
                                }}
                            >
                                {isAttributesCollapsed ? '▶' : '▼'}
                            </button>
                            <h5 style={{ margin: 0, color: 'var(--text-color)', fontSize: '13px' }}>
                                Attribute Distributions
                            </h5>
                        </div>
                        
                        {!isAttributesCollapsed && (
                            <div>
                                {Object.entries(milieu.attribute_distributions).map(([attributeName, distribution]) => (
                                    <div key={attributeName} style={{ marginBottom: '10px' }}>
                                        <label style={{ display: 'block', color: 'var(--text-color)', fontSize: '11px', marginBottom: '4px' }}>
                                            {attributeName}:
                                        </label>
                                        <DistributionEditor
                                            config={distribution}
                                            onChange={(newDist) => onUpdateDistribution(attributeName, newDist)}
                                            isDisabled={isDisabled}
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default MilieuCard;