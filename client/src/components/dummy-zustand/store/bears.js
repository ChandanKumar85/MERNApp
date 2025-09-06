import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useBearStore = create(
  persist(
    (set) => ({
      bears: 0,
      increasePopulation: () => set((state) => ({ bears: state.bears + 1 })),
      removeAllBears: () => set({ bears: 0 }),
      updateBears: (newBears) => set({ bears: newBears }),
    }),
    {
      name: 'bear-storage', // storage key in localStorage
    }
  )
);

export default useBearStore;
