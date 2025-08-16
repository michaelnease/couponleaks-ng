// lib/appsync-stack.ts
import { Stack, StackProps, CfnOutput, Duration } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as appsync from 'aws-cdk-lib/aws-appsync';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as path from 'path';
import { fileURLToPath } from 'url';

type AppSyncProps = StackProps & {
  cfg: { name: string };
  functions: { profiles: lambda.Function };
  userPool: cognito.IUserPool;
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class AppSyncStack extends Stack {
  public readonly api: appsync.GraphqlApi;

  constructor(scope: Construct, id: string, props: AppSyncProps) {
    super(scope, id, props);

    const schemaPath = path.resolve(
      __dirname,
      '../../../packages/graphql/src/lib/schema.graphql'
    );

    this.api = new appsync.GraphqlApi(this, 'Api', {
      name: `CouponLeaks-AppSync-${props.cfg.name}`,
      definition: appsync.Definition.fromFile(schemaPath),
      authorizationConfig: {
        defaultAuthorization: {
          authorizationType: appsync.AuthorizationType.API_KEY,
          apiKeyConfig: { expires: undefined },
        },
        additionalAuthorizationModes: [
          {
            authorizationType: appsync.AuthorizationType.USER_POOL,
            userPoolConfig: { userPool: props.userPool },
          },
        ],
      },
      xrayEnabled: true,
      logConfig: { fieldLogLevel: appsync.FieldLogLevel.ERROR },
    });

    const profilesDS = this.api.addLambdaDataSource(
      'ProfilesDS',
      props.functions.profiles
    );

    profilesDS.createResolver('GetProfile', {
      typeName: 'Query',
      fieldName: 'getProfile',
    });

    profilesDS.createResolver('UpdateProfile', {
      typeName: 'Mutation',
      fieldName: 'updateProfile',
    });

    new CfnOutput(this, 'GraphqlUrl', { value: this.api.graphqlUrl });
    new CfnOutput(this, 'ApiId', { value: this.api.apiId });
    new CfnOutput(this, 'ApiKey', { value: this.api.apiKey ?? '' });
  }
}
