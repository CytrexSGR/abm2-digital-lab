import React from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { SimulationUpdatePayload } from '../../types';

// --- Component Props ---
interface MetricsDashboardProps {
    history: SimulationUpdatePayload[];
}

const MetricsDashboard: React.FC<MetricsDashboardProps> = ({ history }) => {
    // Recharts expects a flat array of data objects.
    const chartData = history.map(item => ({
        step: item.step,
        ...item.model_report
    }));

    // Check if there's data to display
    if (chartData.length === 0) {
        return <div>Waiting for simulation data...</div>;
    }

    return (
        <div style={{ width: '100%' }}>
            <h3>Economic Inequality</h3>
            <ResponsiveContainer width="100%" height={200}>
                <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                    <XAxis dataKey="step" stroke="var(--text-color)" />
                    <YAxis domain={[0, 1]} stroke="var(--text-color)" />
                    <Tooltip />
                    <Legend wrapperStyle={{ color: 'var(--text-color)' }} />
                    <Line type="monotone" dataKey="Gini_Einkommen" stroke="#8884d8" name="Gini (Income)" />
                    <Line type="monotone" dataKey="Gini_Vermoegen" stroke="#82ca9d" name="Gini (Wealth)" />
                </LineChart>
            </ResponsiveContainer>

            <h3>System Wealth & Shocks</h3>
            <ResponsiveContainer width="100%" height={200}>
                <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                    <XAxis dataKey="step" stroke="var(--text-color)" />
                    <YAxis yAxisId="left" label={{ value: 'Avg. Wealth', angle: -90, position: 'insideLeft' }} stroke="var(--text-color)" />
                    <YAxis yAxisId="right" orientation="right" label={{ value: 'Events', angle: 90, position: 'insideRight' }} stroke="var(--text-color)" />
                    <Tooltip />
                    <Legend wrapperStyle={{ color: 'var(--text-color)' }} />
                    <Bar yAxisId="left" dataKey="Durchschnittsvermoegen" fill="#8884d8" name="Avg. Wealth" />
                    <Bar yAxisId="right" dataKey="Hazard_Events_Count" fill="#ff7300" name="Hazard Events" />
                </BarChart>
            </ResponsiveContainer>

            <h3>Consumption Dynamics</h3>
            <ResponsiveContainer width="100%" height={200}>
                <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                    <XAxis dataKey="step" stroke="var(--text-color)" />
                    <YAxis stroke="var(--text-color)" />
                    <Tooltip />
                    <Legend wrapperStyle={{ color: 'var(--text-color)' }} />
                    <Line type="monotone" dataKey="Durchschnittlicher_Konsum" stroke="#ffc658" name="Avg. Consumption" />
                    <Line type="monotone" dataKey="Durchschnittseinkommen" stroke="#82ca9d" name="Avg. Income" />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

export default MetricsDashboard;