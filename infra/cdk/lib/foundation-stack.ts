import { Stack, StackProps, RemovalPolicy } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as cognito from 'aws-cdk-lib/aws-cognito';

export class FoundationStack extends Stack {
  public readonly userPool: cognito.UserPool;

  constructor(scope: Construct, id: string, props: StackProps & { cfg: any }) {
    super(scope, id, props);

    // Create Cognito User Pool
    this.userPool = new cognito.UserPool(this, 'UserPool', {
      userPoolName: `couponleaks-${props.cfg.name}`,
      selfSignUpEnabled: true,
      signInAliases: { username: true, email: true },
      removalPolicy: RemovalPolicy.DESTROY, // Change to RETAIN in prod
    });

    // Optional: Add a client for testing
    this.userPool.addClient('UserPoolClient', {
      authFlows: {
        userPassword: true,
        userSrp: true,
      },
    });
  }
}
