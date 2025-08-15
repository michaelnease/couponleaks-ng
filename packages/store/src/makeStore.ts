'use client';

import { create } from 'zustand';
import { devtools, persist, subscribeWithSelector } from 'zustand/middleware';

/**
 * Generic factory that wraps your root creator with:
 * - devtools
 * - subscribeWithSelector
 * - persist (whitelists ui and prefs only)
 */
export function makeStore<T>(createRoot: any) {
  return create<T>()(
    devtools(
      subscribeWithSelector(
        persist(createRoot, {
          name: 'cl-store',
          version: 1,
          partialize: (s: any) => ({
            ui: s.ui,
            prefs: s.prefs
          })
        })
      ),
      { name: 'couponleaks' }
    )
  );
}
