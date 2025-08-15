import type { AuthSlice } from '../slices/auth';

export const selectAuthStatus = (state: { auth: AuthSlice }) =>
  state.auth.status;
export const selectAuthUsername = (state: { auth: AuthSlice }) =>
  state.auth.username;
export const selectAuthIsSignedIn = (state: { auth: AuthSlice }) =>
  state.auth.status === 'signed-in';
export const selectAuthIsSignedOut = (state: { auth: AuthSlice }) =>
  state.auth.status === 'signed-out';
export const selectAuthIsRefreshing = (state: { auth: AuthSlice }) =>
  state.auth.status === 'refreshing';
export const selectAuthIsUnknown = (state: { auth: AuthSlice }) =>
  state.auth.status === 'unknown';
