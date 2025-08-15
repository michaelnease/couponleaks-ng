import {
  Stack,
  StackProps,
  Duration,
  Expiration,
  CfnOutput,
} from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as appsync from 'aws-cdk-lib/aws-appsync';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as path from 'path';
import { fileURLToPath } from 'url';

// Recreate __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class AppSyncStack extends Stack {
  constructor(
    scope: Construct,
    id: string,
    props: StackProps & {
      cfg: any;
      functions: { profiles: lambda.Function };
      userPool: cognito.IUserPool;
    }
  ) {
    super(scope, id, props);

    const schemaFsPath = path.join(
      __dirname,
      '../../../packages/graphql/src/lib/schema.graphql'
    );

    const api = new appsync.GraphqlApi(this, 'Api', {
      name: `couponleaks-${props.cfg.name}`,
      schema: appsync.SchemaFile.fromAsset(schemaFsPath),
      authorizationConfig: {
        defaultAuthorization: {
          authorizationType: appsync.AuthorizationType.API_KEY,
          apiKeyConfig: {
            expires: Expiration.after(Duration.days(365)),
          },
        },
        additionalAuthorizationModes: [
          {
            authorizationType: appsync.AuthorizationType.USER_POOL,
            userPoolConfig: {
              userPool: props.userPool,
            },
          },
        ],
      },
      xrayEnabled: true,
    });

    const profilesDS = api.addLambdaDataSource(
      'ProfilesDS',
      props.functions.profiles
    );

    profilesDS.createResolver('GetProfile', {
      typeName: 'Query',
      fieldName: 'getProfile',
    });

    new CfnOutput(this, 'GraphqlUrl', { value: api.graphqlUrl });
    new CfnOutput(this, 'ApiId', { value: api.apiId });
    new CfnOutput(this, 'ApiKey', { value: api.apiKey ?? '' });
  }
}
