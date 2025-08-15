import { Stack, StackProps, CfnOutput, Duration } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as appsync from 'aws-cdk-lib/aws-appsync';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as path from 'path';
import { fileURLToPath } from 'url';

// __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

type AppSyncProps = StackProps & {
  cfg: { name: string };
  functions: { profiles: lambda.Function };
  userPool: cognito.IUserPool;
};

export class AppSyncStack extends Stack {
  constructor(scope: Construct, id: string, props: AppSyncProps) {
    super(scope, id, props);

    const schemaFsPath = path.join(
      __dirname,
      '../../../packages/graphql/src/lib/schema.graphql'
    );

    const api = new appsync.GraphqlApi(this, 'Api', {
      name: `couponleaks-${props.cfg.name}`,
      schema: appsync.SchemaFile.fromAsset(schemaFsPath),
      authorizationConfig: {
        // safer default: Cognito
        defaultAuthorization: {
          authorizationType: appsync.AuthorizationType.USER_POOL,
          userPoolConfig: { userPool: props.userPool },
        },
        // allow unauth reads where your schema permits with @aws_api_key
        additionalAuthorizationModes: [
          { authorizationType: appsync.AuthorizationType.API_KEY },
        ],
      },
      xrayEnabled: true,
      logConfig: { fieldLogLevel: appsync.FieldLogLevel.ERROR },
    });

    // Create an API key (since apiKeyConfig prop no longer exists)
    // Expiry is epoch seconds, rounded to the hour
    const oneYearInSeconds = Math.floor(Duration.days(365).toSeconds());
    const nowSeconds = Math.floor(Date.now() / 1000);
    const expires = nowSeconds + oneYearInSeconds;

    const apiKey = new appsync.CfnApiKey(this, 'DefaultApiKey', {
      apiId: api.apiId,
      expires, // optional; omit to use service default
      description: `couponleaks ${props.cfg.name} public key`,
    });

    // Data source and resolver
    const profilesDS = api.addLambdaDataSource(
      'ProfilesDS',
      props.functions.profiles
    );

    profilesDS.createResolver('GetProfile', {
      typeName: 'Query',
      fieldName: 'getProfile',
    });

    // Outputs
    new CfnOutput(this, 'GraphqlUrl', { value: api.graphqlUrl });
    new CfnOutput(this, 'ApiId', { value: api.apiId });
    new CfnOutput(this, 'ApiKey', { value: apiKey.attrApiKey });
  }
}
