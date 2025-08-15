'use client';

export type PrefsSlice = {
  theme: 'light' | 'dark' | 'system';
  country: string;
  currency: string;
  setTheme: (t: PrefsSlice['theme']) => void;
  setCountry: (c: string) => void;
  setCurrency: (c: string) => void;
};

export const createPrefsSlice = (set: any): PrefsSlice => ({
  theme: 'system',
  country: 'US',
  currency: 'USD',
  setTheme: (theme) => set((s: any) => ({ prefs: { ...s.prefs, theme } })),
  setCountry: (country) => set((s: any) => ({ prefs: { ...s.prefs, country } })),
  setCurrency: (currency) => set((s: any) => ({ prefs: { ...s.prefs, currency } }))
});
