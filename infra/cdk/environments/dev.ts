import type { EnvCfg } from '../types/env.js';

export const envConfig: EnvCfg = {
  name: 'dev',
  account: '883273260741',
  region: 'us-east-1',
  domainPrefix: 'couponleaks-dev',
  uiUrls: {
    signIn: 'https://dev.couponleaks.com/auth/callback',
    signOut: 'https://dev.couponleaks.com',
  },
  adminUrls: {
    signIn: 'https://admin-dev.couponleaks.com/auth/callback',
    signOut: 'https://admin-dev.couponleaks.com',
  },
  tags: { app: 'CouponLeaks', env: 'dev' },
};
