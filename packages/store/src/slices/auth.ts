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
