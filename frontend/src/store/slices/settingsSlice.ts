import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { AppSettings } from '@/types';

const initialState: AppSettings = {
  theme: 'light',
  language: 'en',
  refreshInterval: 30000, // 30 seconds
  notifications: true,
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.theme = action.payload;
    },
    setLanguage: (state, action: PayloadAction<'en' | 'vi'>) => {
      state.language = action.payload;
    },
    setRefreshInterval: (state, action: PayloadAction<number>) => {
      state.refreshInterval = action.payload;
    },
    setNotifications: (state, action: PayloadAction<boolean>) => {
      state.notifications = action.payload;
    },
    updateSettings: (state, action: PayloadAction<Partial<AppSettings>>) => {
      return { ...state, ...action.payload };
    },
  },
});

export const {
  setTheme,
  setLanguage,
  setRefreshInterval,
  setNotifications,
  updateSettings,
} = settingsSlice.actions;

export default settingsSlice.reducer;

// Selectors
export const selectTheme = (state: { settings: AppSettings }) => state.settings.theme;
export const selectLanguage = (state: { settings: AppSettings }) => state.settings.language;
export const selectRefreshInterval = (state: { settings: AppSettings }) => state.settings.refreshInterval;
export const selectNotifications = (state: { settings: AppSettings }) => state.settings.notifications;
