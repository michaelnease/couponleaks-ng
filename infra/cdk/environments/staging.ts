import type { EnvCfg } from '../types/env.js';

export const envConfig: EnvCfg = {
  name: 'staging',
  account: '883273260741',
  region: 'us-east-1',
  domainPrefix: 'couponleaks-stg',
  uiUrls: {
    signIn: 'https://staging.couponleaks.com/auth/callback',
    signOut: 'https://staging.couponleaks.com',
  },
  adminUrls: {
    signIn: 'https://admin-staging.couponleaks.com/auth/callback',
    signOut: 'https://admin-staging.couponleaks.com',
  },
  tags: { app: 'CouponLeaks', env: 'staging' },
};
