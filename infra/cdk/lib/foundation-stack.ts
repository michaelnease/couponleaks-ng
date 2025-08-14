import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';

export class FoundationStack extends Stack {
  constructor(scope: Construct, id: string, props: StackProps & { cfg: any }) {
    super(scope, id, props);
    // Add VPC, S3 buckets, KMS keys, etc. later
  }
}
