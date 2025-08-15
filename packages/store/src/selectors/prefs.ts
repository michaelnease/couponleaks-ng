import type { PrefsSlice } from '../slices/prefs';

export const selectPrefsTheme = (state: { prefs: PrefsSlice }) =>
  state.prefs.theme;
export const selectPrefsCountry = (state: { prefs: PrefsSlice }) =>
  state.prefs.country;
export const selectPrefsCurrency = (state: { prefs: PrefsSlice }) =>
  state.prefs.currency;
export const selectPrefsIsDarkTheme = (state: { prefs: PrefsSlice }) =>
  state.prefs.theme === 'dark';
export const selectPrefsIsLightTheme = (state: { prefs: PrefsSlice }) =>
  state.prefs.theme === 'light';
export const selectPrefsIsSystemTheme = (state: { prefs: PrefsSlice }) =>
  state.prefs.theme === 'system';
