import { create } from 'zustand';

export type AgentColorAttribute = 'political' | 'milieu' | 'vermoegen' | 'einkommen' | 'risikoaversion';

interface AgentState {
  selectedAgentId: number | null;
  agentColorAttribute: AgentColorAttribute;
  selectAgent: (agentId: number | null) => void;
  setAgentColorAttribute: (attr: AgentColorAttribute) => void;
}

export const useAgentStore = create<AgentState>((set) => ({
  selectedAgentId: null,
  agentColorAttribute: 'political',
  
  selectAgent: (agentId) => set({ selectedAgentId: agentId }),
  
  setAgentColorAttribute: (attr) => set({ agentColorAttribute: attr }),
}));