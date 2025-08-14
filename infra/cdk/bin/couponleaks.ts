import 'source-map-support/register.js';
import { App, Environment, Tags } from 'aws-cdk-lib';
import { envConfig as dev } from '../environments/dev.js';
import { envConfig as staging } from '../environments/staging.js';
import { envConfig as prod } from '../environments/prod.js';
import { FoundationStack } from '../lib/foundation-stack.js';
import { FunctionsStack } from '../lib/functions-stack.js';
import { AppSyncStack } from '../lib/appsync-stack.js';

const app = new App();
const which = app.node.tryGetContext('env') ?? 'dev';
const cfg = which === 'prod' ? prod : which === 'staging' ? staging : dev;

const env: Environment = { account: cfg.account, region: cfg.region };

const foundation = new FoundationStack(
  app,
  `CouponLeaks-Foundation-${cfg.name}`,
  { env, cfg }
);

const functions = new FunctionsStack(app, `CouponLeaks-Functions-${cfg.name}`, {
  env,
  cfg,
});

const api = new AppSyncStack(app, `CouponLeaks-AppSync-${cfg.name}`, {
  env,
  cfg,
  functions: {
    profiles: functions.profiles,
  },
  userPool: foundation.userPool,
});

// Ensure correct stack creation order
api.addDependency(functions);
functions.addDependency(foundation);

Object.entries(cfg.tags).forEach(([k, v]) => Tags.of(app).add(k, v));
