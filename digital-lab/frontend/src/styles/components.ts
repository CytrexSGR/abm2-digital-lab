import { theme } from './theme';

export const buttonStyles = {
    base: {
        color: theme.colors.primaryText,
        border: 'none',
        padding: `${theme.spacing.small} ${theme.spacing.large}`,
        cursor: 'pointer',
        borderRadius: theme.borderRadius.small,
        fontSize: theme.fontSize.normal,
    } as React.CSSProperties,

    primary: {
        backgroundColor: theme.colors.primary,
    } as React.CSSProperties,

    secondary: {
        backgroundColor: theme.colors.secondary,
    } as React.CSSProperties,

    success: {
        backgroundColor: theme.colors.success,
    } as React.CSSProperties,

    danger: {
        backgroundColor: theme.colors.danger,
    } as React.CSSProperties,

    disabled: {
        backgroundColor: '#ccc',
        cursor: 'not-allowed',
    } as React.CSSProperties,

    small: {
        padding: `${theme.spacing.xs} ${theme.spacing.small}`,
        fontSize: theme.fontSize.small,
        minWidth: '24px',
    } as React.CSSProperties,
};

export const inputStyles = {
    base: {
        width: '100%',
        padding: theme.spacing.small,
        border: `1px solid ${theme.colors.border}`,
        borderRadius: theme.borderRadius.small,
        backgroundColor: theme.colors.inputBackground,
        color: theme.colors.text,
        fontSize: theme.fontSize.normal,
        minWidth: '0',
    } as React.CSSProperties,

    disabled: {
        backgroundColor: '#2a2d35',
        cursor: 'not-allowed',
        opacity: 0.6,
    } as React.CSSProperties,

    small: {
        padding: '6px',
        fontSize: theme.fontSize.normal,
    } as React.CSSProperties,
};

export const labelStyles = {
    base: {
        display: 'block',
        color: theme.colors.text,
        fontSize: theme.fontSize.normal,
        marginBottom: theme.spacing.xs,
        fontWeight: 'bold',
    } as React.CSSProperties,

    small: {
        fontSize: theme.fontSize.small,
    } as React.CSSProperties,

    inline: {
        textAlign: 'right',
        fontSize: '0.9em',
    } as React.CSSProperties,
};

export const containerStyles = {
    card: {
        border: `1px solid ${theme.colors.border}`,
        borderRadius: theme.borderRadius.medium,
        padding: theme.spacing.large,
        marginBottom: theme.spacing.large,
        backgroundColor: theme.colors.surface,
    } as React.CSSProperties,

    grid2: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: theme.spacing.large,
    } as React.CSSProperties,

    grid3: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 120px',
        gap: theme.spacing.medium,
    } as React.CSSProperties,

    gridAuto: {
        display: 'grid',
        gridTemplateColumns: 'auto 1fr',
        gap: theme.spacing.medium,
        alignItems: 'center',
    } as React.CSSProperties,

    flexBetween: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: theme.spacing.medium,
    } as React.CSSProperties,

    flexCenter: {
        display: 'flex',
        alignItems: 'center',
        gap: theme.spacing.small,
    } as React.CSSProperties,
};

export const miscStyles = {
    colorSquare: {
        width: '20px',
        height: '20px',
        border: `2px solid ${theme.colors.border}`,
        borderRadius: theme.borderRadius.small,
        flexShrink: 0,
    } as React.CSSProperties,

    rightAlign: {
        textAlign: 'right',
        marginTop: theme.spacing.medium,
    } as React.CSSProperties,

    smallText: {
        color: theme.colors.textSecondary,
    } as React.CSSProperties,
};