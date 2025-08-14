import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as path from 'path';
import { fileURLToPath } from 'url';

// ESM-safe __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class FunctionsStack extends Stack {
  public readonly profiles: lambda.Function;

  constructor(scope: Construct, id: string, props: StackProps & { cfg: any }) {
    super(scope, id, props);

    this.profiles = new lambda.Function(this, 'ProfilesLambda', {
      runtime: lambda.Runtime.PYTHON_3_11,
      handler: 'handler.handler',
      code: lambda.Code.fromAsset(
        path.join(__dirname, '../../../lambdas/profiles') // <-- updated
      ),
    });
  }
}
