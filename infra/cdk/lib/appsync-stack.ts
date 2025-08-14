import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';

export class AppSyncStack extends Stack {
  constructor(scope: Construct, id: string, props: StackProps & { cfg: any }) {
    super(scope, id, props);
    // Add AppSync API and resolvers here
  }
}
