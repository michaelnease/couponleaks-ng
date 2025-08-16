// lib/functions-stack.ts
import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

type FunctionsProps = StackProps & {
  cfg: any;
  profilesTable: dynamodb.Table;
};

export class FunctionsStack extends Stack {
  public readonly profiles: lambda.Function;

  constructor(scope: Construct, id: string, props: FunctionsProps) {
    super(scope, id, props);

    this.profiles = new lambda.Function(this, 'ProfilesLambda', {
      runtime: lambda.Runtime.PYTHON_3_11,
      handler: 'handler.handler',
      code: lambda.Code.fromAsset(
        path.join(__dirname, '../../../lambdas/profiles')
      ),
      environment: {
        PROFILES_TABLE: props.profilesTable.tableName,
      },
    });

    props.profilesTable.grantReadWriteData(this.profiles);
    if (props.profilesTable.tableStreamArn) {
      this.profiles.addEnvironment(
        'PROFILES_STREAM_ARN',
        props.profilesTable.tableStreamArn
      );
    }
  }
}
