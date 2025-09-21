import { create } from 'zustand';
import { MosaicNode, MosaicDirection } from 'react-mosaic-component';
import { DEFAULT_LAYOUT } from '../config/dashboardLayouts';

type AppView = 'global' | 'economic_explorer' | 'political_explorer';
type MosaicLayout = MosaicNode<string> | null;

interface DashboardState {
  mosaicLayout: MosaicLayout;
  activeView: AppView;
  updateMosaicLayout: (layout: MosaicLayout) => void;
  addWidget: (widgetId: string) => void;
  addWidgetAtLeaf: (targetId: string, widgetId: string, direction?: MosaicDirection) => void;
  removeWidget: (widgetId: string) => void;
  setActiveView: (view: AppView) => void;
  setDefaultLayout: () => void;
  loadDefaultLayout: () => void;
  resetDashboard: () => void;
  loadLayoutPreset: (layout: MosaicLayout) => void;
}


// Relaxed validation: accept branch nodes, leaf strings, and null
const validateLayout = (layout: any): boolean => {
  if (layout === null) return true;
  if (typeof layout === 'string') return true; // leaf node is valid
  // Branch node must have required properties
  return (
    typeof layout === 'object' &&
    'direction' in layout &&
    'first' in layout &&
    'second' in layout
  );
};

// Helper function to check for duplicate IDs in valid layouts
const checkForDuplicateIds = (layout: MosaicLayout): boolean => {
  if (!layout) return true;
  if (typeof layout === 'string') return true;
  
  const collectIds = (node: MosaicLayout): string[] => {
    if (typeof node === 'string') return [node];
    if (!node) return [];
    return [...collectIds(node.first), ...collectIds(node.second)];
  };
  
  const ids = collectIds(layout);
  const uniqueIds = new Set(ids);
  return ids.length === uniqueIds.size;
};

// Helper function to get safe initial layout with strict validation
const getSafeInitialLayout = (): MosaicLayout => {
  try {
    const stored = localStorage.getItem('mosaicLayout');
    if (stored && stored !== 'null') {
      const parsed = JSON.parse(stored);
      // Use relaxed validation - accept leaf strings and complex layouts
      if (validateLayout(parsed) && checkForDuplicateIds(parsed)) {
        return parsed;
      }
      console.warn('Invalid or incomplete layout detected in localStorage, using default');
      localStorage.removeItem('mosaicLayout');
    }
  } catch (error) {
    console.error('Error parsing localStorage layout:', error);
    localStorage.removeItem('mosaicLayout');
  }
  return DEFAULT_LAYOUT;
};

export const useDashboardStore = create<DashboardState>((set, get) => ({
  mosaicLayout: getSafeInitialLayout(),
  activeView: 'global',
  
  updateMosaicLayout: (layout) => {
    if (layout && !checkForDuplicateIds(layout)) {
      console.error('Attempted to set layout with duplicate IDs, ignoring');
      return;
    }
    localStorage.setItem('mosaicLayout', JSON.stringify(layout));
    set({ mosaicLayout: layout });
  },
  
  addWidget: (widgetId) => {
    const state = get();
    const currentLayout = state.mosaicLayout;
    
    // Allow duplicates: convert widget type to unique instance id
    const makeInstanceId = (type: string) => `${type}#${Math.random().toString(36).slice(2,8)}`;
    const instanceId = makeInstanceId(widgetId);
    
    if (currentLayout === null) {
      // If no layout exists, create a simple single widget layout
      const newLayout = instanceId;
      set({ mosaicLayout: newLayout });
      localStorage.setItem('mosaicLayout', JSON.stringify(newLayout));
      return;
    }
    
    // Insert into the first found leaf instead of wrapping the whole tree
    const insertIntoFirstLeaf = (node: MosaicLayout): MosaicLayout => {
      if (!node) return widgetId; // shouldn't happen
      if (typeof node === 'string') {
        // Split this leaf into two, keeping existing leaf on the left
        return {
          direction: 'row' as MosaicDirection,
          first: node,
          second: instanceId
        } as MosaicLayout;
      }
      // Recurse into the left side first
      return { ...node, first: insertIntoFirstLeaf(node.first as MosaicLayout) } as MosaicLayout;
    };

    const newLayout = insertIntoFirstLeaf(currentLayout);
    set({ mosaicLayout: newLayout });
    localStorage.setItem('mosaicLayout', JSON.stringify(newLayout));
  },

  addWidgetAtLeaf: (targetId, widgetId, direction: MosaicDirection = 'row') => {
    const state = get();
    const makeInstanceId = (type: string) => `${type}#${Math.random().toString(36).slice(2,8)}`;
    const instanceId = makeInstanceId(widgetId);

    const replaceLeaf = (node: MosaicLayout): MosaicLayout => {
      if (!node) return null;
      if (typeof node === 'string') {
        if (node !== targetId) return node; // not the target
        return {
          direction,
          first: node,
          second: instanceId
        } as MosaicLayout;
      }
      return {
        ...node,
        first: replaceLeaf(node.first as MosaicLayout),
        second: replaceLeaf(node.second as MosaicLayout)
      } as MosaicLayout;
    };

    const newLayout = replaceLeaf(state.mosaicLayout);
    set({ mosaicLayout: newLayout });
    localStorage.setItem('mosaicLayout', JSON.stringify(newLayout));
  },

  removeWidget: (widgetId) => {
    const state = get();
    const prune = (node: MosaicLayout): MosaicLayout => {
      if (!node) return null;
      if (typeof node === 'string') {
        return node === widgetId ? null : node;
      }
      // It's a branch node
      const prunedFirst = prune(node.first as MosaicLayout);
      const prunedSecond = prune(node.second as MosaicLayout);

      // If both children are gone, this branch disappears
      if (!prunedFirst && !prunedSecond) return null;
      // If one child is gone, collapse to the remaining one
      if (!prunedFirst) return prunedSecond as MosaicLayout;
      if (!prunedSecond) return prunedFirst as MosaicLayout;

      // Otherwise return updated branch
      return { ...node, first: prunedFirst, second: prunedSecond } as MosaicLayout;
    };

    const newLayout = prune(state.mosaicLayout);
    set({ mosaicLayout: newLayout });
    localStorage.setItem('mosaicLayout', JSON.stringify(newLayout));
  },

  setActiveView: (view) => set({ activeView: view }),

  setDefaultLayout: () => {
    localStorage.setItem('mosaicLayout', JSON.stringify(DEFAULT_LAYOUT));
    set({ mosaicLayout: DEFAULT_LAYOUT });
  },

  loadDefaultLayout: () => {
    localStorage.setItem('mosaicLayout', JSON.stringify(DEFAULT_LAYOUT));
    set({ mosaicLayout: DEFAULT_LAYOUT });
  },

  resetDashboard: () => {
    // Minimal layout: single Agent Map widget
    const minimal: MosaicLayout = `agentMap#${Math.random().toString(36).slice(2,8)}`;
    localStorage.setItem('mosaicLayout', JSON.stringify(minimal));
    set({ mosaicLayout: minimal });
  },

  loadLayoutPreset: (layout) => {
    // Instantiate a preset by assigning unique instance ids to any leaf strings
    const instantiate = (node: MosaicLayout): MosaicLayout => {
      if (!node) return null;
      if (typeof node === 'string') {
        return `${node}#${Math.random().toString(36).slice(2,8)}`;
      }
      return {
        ...node,
        first: instantiate(node.first as MosaicLayout),
        second: instantiate(node.second as MosaicLayout)
      } as MosaicLayout;
    };
    const instantiated = instantiate(layout);
    localStorage.setItem('mosaicLayout', JSON.stringify(instantiated));
    set({ mosaicLayout: instantiated });
  },
}));
