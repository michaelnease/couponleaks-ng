// scripts/generate-env.js
import { execSync } from 'child_process';
import fs from 'fs';

// Your environment name
const ENV = process.argv[2] || 'dev';

function getStackOutputs(stackName) {
  const cmd = `aws cloudformation describe-stacks --stack-name ${stackName} --region us-east-1 --query "Stacks[0].Outputs" --output json`;
  const output = execSync(cmd, { encoding: 'utf8' });
  return JSON.parse(output).reduce((acc, { OutputKey, OutputValue }) => {
    acc[OutputKey] = OutputValue;
    return acc;
  }, {});
}

console.log(`Fetching CloudFormation outputs for env=${ENV}...`);

const foundationOutputs = getStackOutputs(`CouponLeaks-Foundation-${ENV}`);
const appsyncOutputs = getStackOutputs(`CouponLeaks-AppSync-${ENV}`);

const envVars = {
  NEXT_PUBLIC_APPSYNC_URL: appsyncOutputs.GraphqlUrl,
  NEXT_PUBLIC_APPSYNC_API_KEY: appsyncOutputs.ApiKey,

  NEXT_PUBLIC_COGNITO_REGION: 'us-east-1',
  NEXT_PUBLIC_COGNITO_USER_POOL_ID: foundationOutputs.UserPoolId,
  NEXT_PUBLIC_COGNITO_UI_CLIENT_ID: foundationOutputs.UiClientId,
  NEXT_PUBLIC_COGNITO_DOMAIN: foundationOutputs.HostedUiDomain,

  NEXT_PUBLIC_REDIRECT_SIGN_IN: `https://${ENV}.couponleaks.com/auth/callback`,
  NEXT_PUBLIC_REDIRECT_SIGN_OUT: `https://${ENV}.couponleaks.com`,
};

const envContent = Object.entries(envVars)
  .map(([k, v]) => `${k}=${v}`)
  .join('\n');

fs.writeFileSync('.env.local', envContent);

console.log(`.env.local created for ${ENV}:\n`);
console.log(envContent);
