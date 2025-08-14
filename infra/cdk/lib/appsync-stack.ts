import { Stack, StackProps, Duration } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as appsync from 'aws-cdk-lib/aws-appsync';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as path from 'path';

type FunctionsRef = {
  profiles: lambda.Function;
};

export class AppSyncStack extends Stack {
  constructor(
    scope: Construct,
    id: string,
    props: StackProps & { cfg: any; functions: FunctionsRef }
  ) {
    super(scope, id, props);

    const schemaFsPath = path.resolve(
      process.cwd(),
      'packages/src/lib/graphql/schema.graphql'
    );

    const api = new appsync.GraphqlApi(this, 'Api', {
      name: `couponleaks-${props.cfg.name}`,
      schema: appsync.SchemaFile.fromAsset(schemaFsPath),
      authorizationConfig: {
        defaultAuthorization: {
          authorizationType: appsync.AuthorizationType.API_KEY,
        },
      },
      xrayEnabled: true,
    });

    // create a default API key explicitly
    api.addApiKey('DefaultApiKey', {
      description: `default key for ${props.cfg.name}`,
      expires: Duration.days(365),
    });

    const profilesDS = api.addLambdaDataSource(
      'ProfilesDS',
      props.functions.profiles
    );

    profilesDS.createResolver('GetProfile', {
      typeName: 'Query',
      fieldName: 'getProfile',
    });

    // If you want outputs, uncomment:
    // new cdk.CfnOutput(this, 'GraphqlUrl', { value: api.graphqlUrl });
    // new cdk.CfnOutput(this, 'ApiId', { value: api.apiId });
  }
}
