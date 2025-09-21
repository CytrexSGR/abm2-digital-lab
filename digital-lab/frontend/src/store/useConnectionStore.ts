import { create } from 'zustand';
import { apiClient } from '../api/axiosConfig';
import { SimulationUpdatePayload } from '../types';

interface ConnectionState {
  isConnected: boolean;
  connect: () => void;
  disconnect: () => void;
}

let ws: WebSocket | null = null;

// Import simulation store to update simulation data from WebSocket
let setSimulationData: ((data: SimulationUpdatePayload) => void) | null = null;
let addToHistory: ((data: SimulationUpdatePayload) => void) | null = null;

export const useConnectionStore = create<ConnectionState>((set, get) => ({
  isConnected: false,
  
  connect: () => {
    if (ws) return; // Already connected or connecting

    const httpApiUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';
    const wsApiUrl = httpApiUrl.replace(/^http/, 'ws') + '/ws';
    
    ws = new WebSocket(wsApiUrl);

    ws.onopen = () => {
      set({ isConnected: true });
    };

    // Load initial data when connection is established
    const fetchInitialData = async () => {
      try {
        const response = await apiClient.get('/api/simulation/data');
        if (setSimulationData) {
          setSimulationData(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch initial simulation data:", error);
      }
    };
    fetchInitialData();

    ws.onmessage = (event) => {
      try {
        const data: SimulationUpdatePayload | { message: string } = JSON.parse(event.data);
        
        // Filter out ping messages and update simulation store
        if ('step' in data) {
          if (setSimulationData) {
            setSimulationData(data);
          }
          if (addToHistory) {
            addToHistory(data);
          }
        }
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      set({ isConnected: false });
    };

    ws.onclose = () => {
      set({ isConnected: false });
      ws = null;
    };
  },
  
  disconnect: () => {
    if (ws) {
      ws.close();
    }
  },
}));

// Function to register simulation store callbacks
export const registerSimulationCallbacks = (
  setSimulationDataCallback: (data: SimulationUpdatePayload) => void,
  addToHistoryCallback: (data: SimulationUpdatePayload) => void
) => {
  setSimulationData = setSimulationDataCallback;
  addToHistory = addToHistoryCallback;
};