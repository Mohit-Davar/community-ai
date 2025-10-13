import { StateCreator } from 'zustand';

export interface UiSlice {
	sidebarOpen: boolean;
	setSidebarOpen: (isOpen: boolean) => void;
}

export const createUiSlice: StateCreator<UiSlice & any, [], [], UiSlice> = (set) => ({
	sidebarOpen: false,
	setSidebarOpen: (isOpen: boolean) => set({ sidebarOpen: isOpen }),
});
