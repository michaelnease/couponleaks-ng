// lib/foundation-stack.ts
import { Stack, StackProps, RemovalPolicy, CfnOutput } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { ProfilesTable } from './profiles-table';

export type UrlPair = { signIn: string; signOut: string };
export type EnvCfg = {
  name: string;
  account?: string;
  region?: string;
  domainPrefix: string;
  uiUrls: UrlPair;
  adminUrls: UrlPair;
};

type FoundationProps = StackProps & { cfg: EnvCfg };

export class FoundationStack extends Stack {
  public readonly userPool: cognito.UserPool;
  public readonly uiClient: cognito.UserPoolClient;
  public readonly adminClient: cognito.UserPoolClient;
  public readonly profilesTable: dynamodb.Table;

  constructor(scope: Construct, id: string, props: FoundationProps) {
    super(scope, id, props);

    this.userPool = new cognito.UserPool(this, 'UserPool', {
      userPoolName: `couponleaks-${props.cfg.name}`,
      selfSignUpEnabled: true,
      signInAliases: { username: true, email: true },
      removalPolicy: RemovalPolicy.DESTROY,
    });

    const domain = this.userPool.addDomain('HostedUiDomain', {
      cognitoDomain: { domainPrefix: props.cfg.domainPrefix },
    });

    this.uiClient = this.userPool.addClient('UiClient', {
      authFlows: { userPassword: true, userSrp: true },
      oAuth: {
        flows: { authorizationCodeGrant: true },
        callbackUrls: [props.cfg.uiUrls.signIn],
        logoutUrls: [props.cfg.uiUrls.signOut],
      },
    });

    this.adminClient = this.userPool.addClient('AdminClient', {
      authFlows: { userPassword: true, userSrp: true },
      oAuth: {
        flows: { authorizationCodeGrant: true },
        callbackUrls: [props.cfg.adminUrls.signIn],
        logoutUrls: [props.cfg.adminUrls.signOut],
      },
    });

    const profiles = new ProfilesTable(this, 'Profiles', {
      envName: props.cfg.name,
      removalPolicy: RemovalPolicy.DESTROY,
      enablePitr: true,
    });
    this.profilesTable = profiles.table;

    new CfnOutput(this, 'UserPoolId', { value: this.userPool.userPoolId });
    new CfnOutput(this, 'UiClientId', {
      value: this.uiClient.userPoolClientId,
    });
    new CfnOutput(this, 'AdminClientId', {
      value: this.adminClient.userPoolClientId,
    });
    const hostedUiDomain = `${props.cfg.domainPrefix}.auth.${this.region}.amazoncognito.com`;
    new CfnOutput(this, 'HostedUiDomain', { value: hostedUiDomain });
    new CfnOutput(this, 'HostedUiSignInUrlExample', {
      value: domain.signInUrl(this.uiClient, {
        redirectUri: props.cfg.uiUrls.signIn,
      }),
    });
    new CfnOutput(this, 'ProfilesTableName', {
      value: this.profilesTable.tableName,
    });
  }
}
