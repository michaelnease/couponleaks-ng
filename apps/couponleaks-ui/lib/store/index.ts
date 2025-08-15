'use client';

import {
  makeStore,
  createAuthSlice,
  type AuthSlice,
  createUISlice,
  type UISlice,
  createPrefsSlice,
  type PrefsSlice,
  createInteractionsSlice,
  type InteractionsSlice,
} from '@couponleaks-ng/store';

export type RootState = {
  auth: AuthSlice;
  ui: UISlice;
  prefs: PrefsSlice;
  interactions: InteractionsSlice;
};

export const useStore = makeStore<RootState>((set: any, get: any) => ({
  auth: createAuthSlice(set, get),
  ui: createUISlice(set, get),
  prefs: createPrefsSlice(set, get),
  interactions: createInteractionsSlice(set, get),
}));
