import { create } from 'zustand';

interface SelectedDeckState {
  selectedDeckId: string | null;
  setSelectedDeckId: (id: string) => void;
}

export const useSelectedDeck = create<SelectedDeckState>((set) => ({
  selectedDeckId: localStorage.getItem('selectedDeckId'),
  setSelectedDeckId: (id: string) => {
    localStorage.setItem('selectedDeckId', id);
    set({ selectedDeckId: id });
  },
})); 