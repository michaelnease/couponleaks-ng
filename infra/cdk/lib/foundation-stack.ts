// infra/cdk/stacks/foundation-stack.ts
import { Stack, StackProps, RemovalPolicy, CfnOutput } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as cognito from 'aws-cdk-lib/aws-cognito';

// Reuse the same shape across env files and stacks
export type UrlPair = { signIn: string; signOut: string };
export type EnvCfg = {
  name: string; // dev | staging | prod
  domainPrefix: string; // e.g. couponleaks-dev
  uiUrls: UrlPair; // UI callback/logout
  adminUrls: UrlPair; // Admin callback/logout
};

type FoundationProps = StackProps & { cfg: EnvCfg };

export class FoundationStack extends Stack {
  public readonly userPool: cognito.UserPool;

  constructor(scope: Construct, id: string, props: FoundationProps) {
    super(scope, id, props);

    const isProd = props.cfg.name === 'prod';

    this.userPool = new cognito.UserPool(this, 'UserPool', {
      userPoolName: `couponleaks-${props.cfg.name}`,
      selfSignUpEnabled: true,
      signInAliases: { username: true, email: true },
      standardAttributes: {
        email: { required: true, mutable: true },
      },
      // Reasonable defaults. Tighten further in prod if you want.
      passwordPolicy: {
        minLength: 12,
        requireLowercase: true,
        requireUppercase: true,
        requireDigits: true,
        requireSymbols: true,
      },
      accountRecovery: cognito.AccountRecovery.EMAIL_ONLY,
      // Safer in prod
      removalPolicy: isProd ? RemovalPolicy.RETAIN : RemovalPolicy.DESTROY,
    });

    // Hosted UI domain (Cognito-managed)
    // domainPrefix must be unique in the region for your account
    const domain = this.userPool.addDomain('Domain', {
      cognitoDomain: { domainPrefix: props.cfg.domainPrefix },
    });

    const oauthFor = (urls: UrlPair): cognito.OAuthSettings => ({
      flows: { authorizationCodeGrant: true },
      scopes: [
        cognito.OAuthScope.OPENID,
        cognito.OAuthScope.EMAIL,
        cognito.OAuthScope.PROFILE,
      ],
      callbackUrls: [urls.signIn],
      logoutUrls: [urls.signOut],
    });

    // Browser clients, no secrets
    const uiClient = this.userPool.addClient('UiWebClient', {
      userPoolClientName: 'couponleaks-ui',
      generateSecret: false,
      authFlows: { userPassword: true, userSrp: true },
      preventUserExistenceErrors: true,
      supportedIdentityProviders: [
        cognito.UserPoolClientIdentityProvider.COGNITO,
      ],
      enableTokenRevocation: true,
      oAuth: oauthFor(props.cfg.uiUrls),
    });

    const adminClient = this.userPool.addClient('AdminWebClient', {
      userPoolClientName: 'couponleaks-admin-ui',
      generateSecret: false,
      authFlows: { userPassword: true, userSrp: true },
      preventUserExistenceErrors: true,
      supportedIdentityProviders: [
        cognito.UserPoolClientIdentityProvider.COGNITO,
      ],
      enableTokenRevocation: true,
      oAuth: oauthFor(props.cfg.adminUrls),
    });

    // RBAC seed group
    new cognito.CfnUserPoolGroup(this, 'AdminsGroup', {
      userPoolId: this.userPool.userPoolId,
      groupName: 'admins',
      precedence: 1,
    });

    // Outputs for wiring apps
    new CfnOutput(this, 'UserPoolId', { value: this.userPool.userPoolId });
    new CfnOutput(this, 'UiClientId', { value: uiClient.userPoolClientId });
    new CfnOutput(this, 'AdminClientId', {
      value: adminClient.userPoolClientId,
    });

    const hostedUiDomain = `${props.cfg.domainPrefix}.auth.${this.region}.amazoncognito.com`;
    new CfnOutput(this, 'HostedUiDomain', { value: hostedUiDomain });

    // Handy example link to test sign-in for the UI client
    new CfnOutput(this, 'HostedUiSignInUrlExample', {
      value: domain.signInUrl(uiClient, {
        redirectUri: props.cfg.uiUrls.signIn,
      }),
    });
  }
}
