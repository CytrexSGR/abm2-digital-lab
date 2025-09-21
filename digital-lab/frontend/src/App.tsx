import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import DashboardPage from './pages/DashboardPage';
import ConfigurationPage from './pages/ConfigurationPage';
import FormulaEditorPage from './pages/FormulaEditorPage';
import NavigationBar from './components/ui/NavigationBar';
import { LoginForm } from './components/auth/LoginForm';
import { useAuth } from './hooks/useAuth';

function App() {
    const { isAuthenticated, login, logout, error, loading, username } = useAuth();

    // Show login form if not authenticated
    if (!isAuthenticated) {
        return <LoginForm onLogin={login} error={error || undefined} loading={loading} />;
    }

    // Show main app if authenticated
    return (
        <Router>
            <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: 'var(--bg-color)' }}>
                <NavigationBar />
                <div style={{ padding: '0.5rem', backgroundColor: '#f8f9fa', borderBottom: '1px solid #dee2e6' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.9rem', color: '#6c757d' }}>
                            Angemeldet als: <strong>{username}</strong>
                        </span>
                        <button
                            onClick={logout}
                            style={{
                                padding: '0.25rem 0.5rem',
                                backgroundColor: '#dc3545',
                                color: 'white',
                                border: 'none',
                                borderRadius: '3px',
                                cursor: 'pointer',
                                fontSize: '0.8rem'
                            }}
                        >
                            Abmelden
                        </button>
                    </div>
                </div>
                <Routes>
                    <Route path="/" element={<DashboardPage />} />
                    <Route path="/configuration" element={<ConfigurationPage />} />
                    <Route path="/formulas/:name" element={<FormulaEditorPage />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
