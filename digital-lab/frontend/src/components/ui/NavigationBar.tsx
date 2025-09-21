import React from 'react';
import { NavLink } from 'react-router-dom';
import { theme } from '../../styles/theme';

const navStyle: React.CSSProperties = {
    display: 'flex',
    gap: theme.spacing.large,
    padding: `0 ${theme.spacing.large}`,
    background: theme.colors.surface,
    borderBottom: `1px solid ${theme.colors.border}`,
};

const linkStyle: React.CSSProperties = {
    padding: `${theme.spacing.medium} 0`,
    color: theme.colors.text,
    textDecoration: 'none',
    fontWeight: 'bold',
};

const NavigationBar: React.FC = () => {
    return (
        <nav style={navStyle}>
            <NavLink to="/" style={linkStyle} className={({ isActive }) => isActive ? 'active-link' : ''}>
                Dashboard
            </NavLink>
            <NavLink to="/configuration" style={linkStyle} className={({ isActive }) => isActive ? 'active-link' : ''}>
                Configuration
            </NavLink>
            <NavLink to="/formulas/consumption_rate" style={linkStyle} className={({ isActive }) => isActive ? 'active-link' : ''}>
                Formula Editor
            </NavLink>
        </nav>
    );
};

export default NavigationBar;