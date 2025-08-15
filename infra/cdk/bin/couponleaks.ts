// bin/couponleaks.ts
import 'source-map-support/register.js';

import { App, Tags } from 'aws-cdk-lib';
import type { Environment } from 'aws-cdk-lib';

// If you created a shared type, import it:
import type { EnvCfg } from '../types/env.ts';

import { envConfig as dev } from '../environments/dev.ts';
import { envConfig as staging } from '../environments/staging.ts';
import { envConfig as prod } from '../environments/prod.ts';

import { FoundationStack } from '../lib/foundation-stack.ts';
import { FunctionsStack } from '../lib/functions-stack.ts';
import { AppSyncStack } from '../lib/appsync-stack.ts';

const app = new App();
const which =
  (app.node.tryGetContext('env') as 'dev' | 'staging' | 'prod') ?? 'dev';

const cfg: EnvCfg =
  which === 'prod' ? prod : which === 'staging' ? staging : dev;

// optional: basic sanity check so deploys fail fast if an env file is missing fields
assertEnv(cfg);

const env: Environment = { account: cfg.account, region: cfg.region };

// 1) Foundation (Cognito)
const foundation = new FoundationStack(
  app,
  `CouponLeaks-Foundation-${cfg.name}`,
  {
    env,
    cfg,
  }
);

// 2) Functions (Lambdas)
const functions = new FunctionsStack(app, `CouponLeaks-Functions-${cfg.name}`, {
  env,
  cfg,
});

// 3) AppSync API
const api = new AppSyncStack(app, `CouponLeaks-AppSync-${cfg.name}`, {
  env,
  cfg,
  functions: { profiles: functions.profiles },
  userPool: foundation.userPool,
});

// Ensure creation order
api.addDependency(functions);
functions.addDependency(foundation);

// Tags
Object.entries(cfg.tags).forEach(([k, v]) => Tags.of(app).add(k, v));

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
  if (missing.length) {
    throw new Error(`envConfig is missing: ${missing.join(', ')}`);
  }
}
