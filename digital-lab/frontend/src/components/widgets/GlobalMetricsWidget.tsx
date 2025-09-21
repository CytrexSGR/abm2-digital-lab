import React from 'react';
import Widget from './Widget';
import MetricsDashboard from '../dashboard/MetricsDashboard';
import { useSimulationStore } from '../../store/useSimulationStore';

const GlobalMetricsWidget: React.FC = () => {
    const { history } = useSimulationStore();
    
    return (
        <Widget title="Global Metrics" widgetId="globalMetrics">
            <MetricsDashboard history={history} />
        </Widget>
    );
};

export default GlobalMetricsWidget;