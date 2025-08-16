// bin/couponleaks.ts
import 'source-map-support/register.js';
import { App, Tags } from 'aws-cdk-lib';
import type { Environment } from 'aws-cdk-lib';
import type { EnvCfg } from '../types/env.ts';

import { envConfig as dev } from '../environments/dev';
import { envConfig as staging } from '../environments/staging';
import { envConfig as prod } from '../environments/prod';

import { FoundationStack } from '../lib/foundation-stack';
import { FunctionsStack } from '../lib/functions-stack';
import { AppSyncStack } from '../lib/appsync-stack';

function assertEnv(e: EnvCfg) {
  const missing: string[] = [];
  if (!e.name) missing.push('name');
  if (!e.account) missing.push('account');
  if (!e.region) missing.push('region');
  if (!e.domainPrefix) missing.push('domainPrefix');
  if (!e.uiUrls?.signIn || !e.uiUrls?.signOut)
    missing.push('uiUrls.signIn/uiUrls.signOut');
  if (!e.adminUrls?.signIn || !e.adminUrls?.signOut)
    missing.push('adminUrls.signIn/adminUrls.signOut');
  if (missing.length)
    throw new Error(`envConfig is missing: ${missing.join(', ')}`);
}

const app = new App();
const target = process.env.ENV ?? 'dev';
const cfg = target === 'prod' ? prod : target === 'staging' ? staging : dev;
assertEnv(cfg);

const env: Environment = { account: cfg.account!, region: cfg.region! };

const foundation = new FoundationStack(
  app,
  `CouponLeaks-Foundation-${cfg.name}`,
  { env, cfg }
);
const functions = new FunctionsStack(app, `CouponLeaks-Functions-${cfg.name}`, {
  env,
  cfg,
  profilesTable: foundation.profilesTable,
});
new AppSyncStack(app, `CouponLeaks-AppSync-${cfg.name}`, {
  env,
  cfg,
  functions: { profiles: functions.profiles },
  userPool: foundation.userPool,
});

Tags.of(app).add('App', 'CouponLeaks');
Tags.of(app).add('Env', cfg.name);
