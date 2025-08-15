#!/usr/bin/env bash
set -euo pipefail

# Adjust if your paths differ
ROOT="${ROOT:-$(pwd)}"
APPS=("couponleaks-ui" "admin-ui" "cplks-ui")
PKG_SCOPE="@couponleaks-ng"
STORE_PKG_NAME="$PKG_SCOPE/store"
STORE_DIR="$ROOT/packages/store"

echo "Scaffolding shared Zustand store package at $STORE_DIR"
mkdir -p "$STORE_DIR/src/slices"

# package.json
cat > "$STORE_DIR/package.json" <<'JSON'
{
  "name": "@couponleaks-ng/store",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "main": "src/index.ts",
  "exports": { ".": "./src/index.ts" },
  "peerDependencies": {
    "zustand": "*"
  }
}
JSON

# tsconfig.json
cat > "$STORE_DIR/tsconfig.json" <<'JSON'
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "types": []
  },
  "include": ["src"]
}
JSON

# src/makeStore.ts
cat > "$STORE_DIR/src/makeStore.ts" <<'TS'
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
TS

# src/slices/auth.ts
cat > "$STORE_DIR/src/slices/auth.ts" <<'TS'
'use client';

export type AuthStatus = 'unknown' | 'signed-in' | 'signed-out' | 'refreshing';

export type AuthSlice = {
  status: AuthStatus;
  username: string | null;
  setStatus: (s: AuthStatus) => void;
  setUser: (u: string | null) => void;
  /**
   * Tries to read Amplify session dynamically.
   * No hard dep here. Falls back to signed-out if not available.
   */
  refresh: () => Promise<void>;
};

export const createAuthSlice = (set: any, get: any): AuthSlice => ({
  status: 'unknown',
  username: null,
  setStatus: (status) =>
    set((s: any) => ({ auth: { ...s.auth, status } })),
  setUser: (username) =>
    set((s: any) => ({ auth: { ...s.auth, username } })),
  refresh: async () => {
    try {
      const mod: any = await import('aws-amplify/auth');
      const session = await mod.fetchAuthSession();
      const idToken = session?.tokens?.idToken?.toString();
      if (idToken) {
        const user = await mod.getCurrentUser().catch(() => null);
        set((s: any) => ({
          auth: {
            ...s.auth,
            status: 'signed-in',
            username: user?.username ?? null
          }
        }));
        return;
      }
    } catch {
      // ignore
    }
    set((s: any) => ({
      auth: { ...s.auth, status: 'signed-out', username: null }
    }));
  }
});
TS

# src/slices/ui.ts
cat > "$STORE_DIR/src/slices/ui.ts" <<'TS'
'use client';

export type UISlice = {
  headerCollapsed: boolean;
  modal: { open: boolean; name?: string; data?: unknown };
  setHeaderCollapsed: (v: boolean) => void;
  openModal: (name: string, data?: unknown) => void;
  closeModal: () => void;
};

export const createUISlice = (set: any): UISlice => ({
  headerCollapsed: false,
  modal: { open: false },
  setHeaderCollapsed: (v) =>
    set((s: any) => ({ ui: { ...s.ui, headerCollapsed: v } })),
  openModal: (name, data) =>
    set((s: any) => ({ ui: { ...s.ui, modal: { open: true, name, data } } })),
  closeModal: () =>
    set((s: any) => ({ ui: { ...s.ui, modal: { open: false } } }))
});
TS

# src/slices/prefs.ts
cat > "$STORE_DIR/src/slices/prefs.ts" <<'TS'
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
TS

# src/slices/interactions.ts
cat > "$STORE_DIR/src/slices/interactions.ts" <<'TS'
'use client';

export type InteractionsSlice = {
  following: Record<string, boolean>;
  favorites: Record<string, boolean>;
  toggleFollow: (username: string) => void;
  toggleFavorite: (id: string) => void;
};

export const createInteractionsSlice = (set: any, get: any): InteractionsSlice => ({
  following: {},
  favorites: {},
  toggleFollow: (username) =>
    set((s: any) => {
      const next = !s.interactions.following[username];
      return {
        interactions: {
          ...s.interactions,
          following: { ...s.interactions.following, [username]: next }
        }
      };
    }),
  toggleFavorite: (id) =>
    set((s: any) => {
      const next = !s.interactions.favorites[id];
      return {
        interactions: {
          ...s.interactions,
          favorites: { ...s.interactions.favorites, [id]: next }
        }
      };
    })
});
TS

# src/index.ts
cat > "$STORE_DIR/src/index.ts" <<'TS'
export { makeStore } from './makeStore';
export { createAuthSlice, type AuthSlice, type AuthStatus } from './slices/auth';
export { createUISlice, type UISlice } from './slices/ui';
export { createPrefsSlice, type PrefsSlice } from './slices/prefs';
export { createInteractionsSlice, type InteractionsSlice } from './slices/interactions';
TS

echo "Shared store package created."

# Per-app store composition and bootstrap
for APP in "${APPS[@]}"; do
  APP_DIR="$ROOT/apps/$APP"
  echo "Scaffolding app store for $APP_DIR"

  mkdir -p "$APP_DIR/lib/store" "$APP_DIR/components"

  # lib/store/index.ts
  cat > "$APP_DIR/lib/store/index.ts" <<'TS'
'use client';

import {
  makeStore,
  createAuthSlice, type AuthSlice,
  createUISlice, type UISlice,
  createPrefsSlice, type PrefsSlice,
  createInteractionsSlice, type InteractionsSlice
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
  interactions: createInteractionsSlice(set, get)
}));
TS

  # components/AuthBootstrap.tsx
  cat > "$APP_DIR/components/AuthBootstrap.tsx" <<'TSX'
'use client';

import { useEffect } from 'react';
import { Hub } from 'aws-amplify/utils';
import { useStore } from '@/lib/store';
import AmplifyRuntime from '@/components/AmplifyRuntime';

export default function AuthBootstrap() {
  const refresh = useStore((s) => s.auth.refresh);

  useEffect(() => {
    let mounted = true;
    (async () => {
      await refresh();
    })();

    const unsub = Hub.listen('auth', async () => {
      if (!mounted) return;
      await refresh();
    });

    return () => {
      mounted = false;
      unsub();
    };
  }, [refresh]);

  // Ensure Amplify is configured once for the client
  return <AmplifyRuntime />;
}
TSX

done

echo
echo "Linking deps with pnpm..."
echo "1) Install root workspace (required): pnpm install"
echo "2) Ensure each app depends on the shared store:"
echo "   pnpm -F ${APPS[*]} add ${STORE_PKG_NAME}@workspace:*"
echo "   (zustand should already be installed in each app)"
echo
echo "If Next needs to transpile the shared package, add to next.config.* in each app:"
cat <<'CONF'

  // next.config.ts
  const nextConfig = {
    transpilePackages: ['@couponleaks-ng/store']
  }
  export default nextConfig;

CONF

echo "Done."
