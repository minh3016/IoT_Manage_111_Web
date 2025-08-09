import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { ToastMessage } from '@/types';

interface UiState {
  toasts: ToastMessage[];
  sidebarOpen: boolean;
  loading: boolean;
}

const initialState: UiState = {
  toasts: [],
  sidebarOpen: true,
  loading: false,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    addToast: (state, action: PayloadAction<Omit<ToastMessage, 'id'>>) => {
      const toast: ToastMessage = {
        ...action.payload,
        id: Date.now().toString(),
      };
      state.toasts.push(toast);
    },
    removeToast: (state, action: PayloadAction<string>) => {
      state.toasts = state.toasts.filter(toast => toast.id !== action.payload);
    },
    clearToasts: (state) => {
      state.toasts = [];
    },
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
});

export const {
  addToast,
  removeToast,
  clearToasts,
  toggleSidebar,
  setSidebarOpen,
  setLoading,
} = uiSlice.actions;

export default uiSlice.reducer;

// Selectors
export const selectToasts = (state: { ui: UiState }) => state.ui.toasts;
export const selectSidebarOpen = (state: { ui: UiState }) => state.ui.sidebarOpen;
export const selectUiLoading = (state: { ui: UiState }) => state.ui.loading;
