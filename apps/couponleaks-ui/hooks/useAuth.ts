'use client';

import { useStore } from '../lib/store';
import {
  selectAuthStatus,
  selectAuthIsSignedIn,
  selectAuthIsSignedOut,
  selectAuthIsRefreshing,
  selectAuthIsUnknown,
  selectAuthUsername,
} from '@couponleaks-ng/store';

export function useAuth() {
  const status = useStore(selectAuthStatus);
  const isSignedIn = useStore(selectAuthIsSignedIn);
  const isSignedOut = useStore(selectAuthIsSignedOut);
  const isRefreshing = useStore(selectAuthIsRefreshing);
  const isUnknown = useStore(selectAuthIsUnknown);
  const username = useStore(selectAuthUsername);
  const refresh = useStore((s) => s.auth.refresh);
  const logout = useStore((s) => s.auth.logout);

  return {
    status,
    isSignedIn,
    isSignedOut,
    isRefreshing,
    isUnknown,
    username,
    refresh,
    logout,
  };
}
