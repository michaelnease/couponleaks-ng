import { Amplify } from 'aws-amplify';
import { buildAmplifyConfig } from './amplify-config.js';

// Prevent double configure across HMR and SSR
function isConfigured() {
  return Boolean((globalThis as any).__AMPLIFY_CONFIGURED__);
}
function markConfigured() {
  (globalThis as any).__AMPLIFY_CONFIGURED__ = true;
}

export function ensureAmplifyConfigured() {
  if (isConfigured()) return;
  Amplify.configure(buildAmplifyConfig());
  markConfigured();
}
