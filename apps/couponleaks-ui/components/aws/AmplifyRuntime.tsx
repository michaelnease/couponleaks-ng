'use client';

import { Amplify } from 'aws-amplify';
import { buildAmplifyConfig } from '@couponleaks-ng/aws';

let configured = false;

export function AmplifyRuntime() {
  if (!configured) {
    Amplify.configure(buildAmplifyConfig());
    configured = true;
  }
  return null;
}
