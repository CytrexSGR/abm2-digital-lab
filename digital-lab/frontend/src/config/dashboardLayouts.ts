import { MosaicNode } from 'react-mosaic-component';

export const DEFAULT_LAYOUT: MosaicNode<string> = {
    direction: 'column',
    first: {
        direction: 'row',
        first: 'agentMap',
        second: 'globalMetrics',
        splitPercentage: 70,
    },
    second: {
        direction: 'row',
        first: 'timeSeriesExplorer',
        second: 'templateDynamics',
        splitPercentage: 70,
    },
    splitPercentage: 60,
};

export const PRESET_MINIMAL: MosaicNode<string> = 'agentMap';

export const PRESET_MONITORING: MosaicNode<string> = {
    direction: 'column',
    first: {
        direction: 'row',
        first: 'agentMap',
        second: 'globalMetrics',
        splitPercentage: 70,
    },
    second: {
        direction: 'row',
        first: 'templateDistribution',
        second: 'eventLog',
        splitPercentage: 50,
    },
    splitPercentage: 65,
};

export const PRESET_ANALYSIS: MosaicNode<string> = {
    direction: 'column',
    first: {
        direction: 'row',
        first: 'agentMap',
        second: 'timeSeriesExplorer',
        splitPercentage: 60,
    },
    second: {
        direction: 'row',
        first: 'economicExplorer',
        second: 'geospatialExplorer',
        splitPercentage: 50,
    },
    splitPercentage: 55,
};
