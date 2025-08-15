import type { ResourcesConfig } from 'aws-amplify';
// Shared builder that reads from the consuming app's env
export type AmplifyEnv = {
  region: string;
  userPoolId: string;
  userPoolWebClientId: string;
  domain: string;
  redirectSignIn: string;
  redirectSignOut: string;
  graphqlEndpoint: string;
  apiKey?: string;
};

export function buildAmplifyConfig(
  fromEnv: Partial<AmplifyEnv> = {}
): ResourcesConfig {
  const env: AmplifyEnv = {
    region: fromEnv.region ?? process.env.NEXT_PUBLIC_COGNITO_REGION ?? '',
    userPoolId:
      fromEnv.userPoolId ?? process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID ?? '',
    userPoolWebClientId:
      fromEnv.userPoolWebClientId ??
      process.env.NEXT_PUBLIC_COGNITO_UI_CLIENT_ID ??
      '',
    domain: fromEnv.domain ?? process.env.NEXT_PUBLIC_COGNITO_DOMAIN ?? '',
    redirectSignIn:
      fromEnv.redirectSignIn ?? process.env.NEXT_PUBLIC_REDIRECT_SIGN_IN ?? '',
    redirectSignOut:
      fromEnv.redirectSignOut ??
      process.env.NEXT_PUBLIC_REDIRECT_SIGN_OUT ??
      '',
    graphqlEndpoint:
      fromEnv.graphqlEndpoint ?? process.env.NEXT_PUBLIC_APPSYNC_URL ?? '',
    apiKey: fromEnv.apiKey ?? process.env.NEXT_PUBLIC_APPSYNC_API_KEY,
  };

  return {
    Auth: {
      Cognito: {
        userPoolId: env.userPoolId,
        userPoolClientId: env.userPoolWebClientId,
        loginWith: {
          oauth: {
            domain: env.domain,
            scopes: ['openid', 'email', 'profile'],
            redirectSignIn: [env.redirectSignIn],
            redirectSignOut: [env.redirectSignOut],
            responseType: 'code' as const,
          },
        },
      },
    },
    API: {
      GraphQL: {
        endpoint: env.graphqlEndpoint,
        region: env.region,
        // 👇 v6 value (not 'AMAZON_COGNITO_USER_POOLS')
        defaultAuthMode: 'userPool' as const,
        // If you plan to use Amplify's GraphQL client with API key too:
        apiKey: env.apiKey, // optional
      },
    },
  };
}
