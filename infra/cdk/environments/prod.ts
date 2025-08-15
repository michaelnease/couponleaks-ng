import type { EnvCfg } from '../types/env.js';

export const envConfig: EnvCfg = {
  name: 'prod',
  account: '883273260741',
  region: 'us-east-1',
  domainPrefix: 'couponleaks',
  uiUrls: {
    signIn: 'https://couponleaks.com/auth/callback',
    signOut: 'https://couponleaks.com',
  },
  adminUrls: {
    signIn: 'https://admin.couponleaks.com/auth/callback',
    signOut: 'https://admin.couponleaks.com',
  },
  tags: { app: 'CouponLeaks', env: 'prod' },
};
