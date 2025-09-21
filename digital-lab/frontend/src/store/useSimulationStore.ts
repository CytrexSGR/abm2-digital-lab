import { create } from 'zustand';
import { apiClient } from '../api/axiosConfig';
import { SimulationUpdatePayload } from '../types';
import { registerSimulationCallbacks } from './useConnectionStore';

const MAX_HISTORY_LENGTH = 2000;

interface SimulationState {
  isRunning: boolean;
  simulationData: SimulationUpdatePayload | null;
  history: SimulationUpdatePayload[];
  runSimulation: () => void;
  stopSimulation: () => void;
  resetSimulation: () => void;
  stepSimulation: (steps?: number) => void;
  setSimulationData: (data: SimulationUpdatePayload) => void;
  addToHistory: (data: SimulationUpdatePayload) => void;
}

let simulationInterval: NodeJS.Timeout | null = null;

export const useSimulationStore = create<SimulationState>((set, get) => ({
  isRunning: false,
  simulationData: null,
  history: [],

  runSimulation: () => {
    if (get().isRunning) return;
    set({ isRunning: true });
    
    const step = async () => {
        try {
            await apiClient.post('/api/simulation/step');
        } catch (error) {
            console.error("Simulation step failed:", error);
            get().stopSimulation(); // Stop on error
        }
    };
    
    step(); // Run first step immediately
    simulationInterval = setInterval(step, 500); // Step every 500ms
  },

  stopSimulation: () => {
    if (simulationInterval) {
        clearInterval(simulationInterval);
        simulationInterval = null;
    }
    set({ isRunning: false });
  },

  resetSimulation: async () => {
    get().stopSimulation();
    set({ history: [], simulationData: null });
    try {
        await apiClient.post('/api/simulation/reset', {
            num_agents: 100,
            network_connections: 5
        });
        // Optionally fetch initial data after reset
        const response = await apiClient.get('/api/simulation/data');
        set({ simulationData: response.data });
    } catch (error) {
        console.error("Simulation reset failed:", error);
    }
  },

  stepSimulation: async (steps = 1) => {
    if (get().isRunning) return; // Don't allow stepping while running
    
    try {
        for (let i = 0; i < steps; i++) {
            await apiClient.post('/api/simulation/step');
        }
    } catch (error) {
        console.error("Simulation step failed:", error);
    }
  },

  setSimulationData: (data: SimulationUpdatePayload) => {
    set(state => {
      const newHistory = [...state.history, data];
      // Wenn die History zu lang wird, entferne das älteste Element
      if (newHistory.length > MAX_HISTORY_LENGTH) {
        newHistory.shift(); // Entfernt das erste (älteste) Element
      }
      return {
        simulationData: data,
        history: newHistory
      };
    });
  },
  
  addToHistory: (data) => {
    // This method is now redundant as setSimulationData handles both operations
    // Keep for backwards compatibility but make it a no-op
    // The history is already updated by setSimulationData
  },
}));

// Register callbacks with connection store for WebSocket communication
const store = useSimulationStore.getState();
registerSimulationCallbacks(
  store.setSimulationData,
  store.addToHistory
);