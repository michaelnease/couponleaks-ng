import { Stack, StackProps, Duration, aws_lambda as lambda } from 'aws-cdk-lib';
import { Construct } from 'constructs';

export class FunctionsStack extends Stack {
  public readonly functions: { profiles: lambda.Function };

  constructor(scope: Construct, id: string, props: StackProps & { cfg: any }) {
    super(scope, id, props);

    const profilesFn = new lambda.Function(this, 'ProfilesFunction', {
      runtime: lambda.Runtime.PYTHON_3_11,
      handler: 'handler.handler',
      // from infra/cdk -> go up two levels to reach repo root, then into lambdas/
      code: lambda.Code.fromAsset('../../lambdas/profiles'),
      timeout: Duration.seconds(5),
      memorySize: 256,
      environment: { STAGE: props.cfg.name },
    });

    this.functions = { profiles: profilesFn };
  }
}
