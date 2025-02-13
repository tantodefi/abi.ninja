import { createStore } from 'zustand';

interface LuksoProviderStore {
  provider: any;
  setProvider: (provider: any) => void;
}

const store = createStore<LuksoProviderStore>((set) => ({
  provider: null,
  setProvider: (provider) => set({ provider }),
}));

export const useLuksoProvider = () => {
  return {
    provider: store.getState().provider,
    setProvider: store.getState().setProvider,
  };
};

// Export the store for direct access
export const luksoStore = store; 