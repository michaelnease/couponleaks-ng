// lib/profiles-table.ts
import { Construct } from 'constructs';
import { RemovalPolicy, CfnOutput, Duration } from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as lambda from 'aws-cdk-lib/aws-lambda';

export interface ProfilesTableProps {
  envName: string;
  removalPolicy?: RemovalPolicy;
  enablePitr?: boolean;
  streamConsumerFn?: lambda.IFunction;
}

export class ProfilesTable extends Construct {
  public readonly table: dynamodb.Table;

  constructor(scope: Construct, id: string, props: ProfilesTableProps) {
    super(scope, id);

    const {
      envName,
      removalPolicy = RemovalPolicy.DESTROY,
      enablePitr = true,
      streamConsumerFn,
    } = props;

    this.table = new dynamodb.Table(this, 'ProfilesTable', {
      tableName: `Profiles-${envName}`,
      partitionKey: { name: 'username', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      pointInTimeRecovery: enablePitr,
      encryption: dynamodb.TableEncryption.AWS_MANAGED,
      stream: dynamodb.StreamViewType.NEW_IMAGE,
      removalPolicy,
    });

    this.table.addGlobalSecondaryIndex({
      indexName: 'email-index',
      partitionKey: { name: 'email', type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    this.table.addGlobalSecondaryIndex({
      indexName: 'name-index',
      partitionKey: { name: 'nameKey', type: dynamodb.AttributeType.STRING },
      sortKey: {
        name: 'displayNameLower',
        type: dynamodb.AttributeType.STRING,
      },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    this.table.addGlobalSecondaryIndex({
      indexName: 'featured-index',
      partitionKey: {
        name: 'isFeaturedKey',
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: { name: 'updatedAt', type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    if (streamConsumerFn) {
      this.table.grantStreamRead(streamConsumerFn);
      streamConsumerFn.addEventSourceMapping('ProfilesStreamMapping', {
        eventSourceArn: this.table.tableStreamArn!,
        startingPosition: lambda.StartingPosition.LATEST,
        batchSize: 100,
        maxBatchingWindow: Duration.seconds(5),
        retryAttempts: 3,
        enabled: true,
      });
    }

    new CfnOutput(this, 'ProfilesTableName', { value: this.table.tableName });
    new CfnOutput(this, 'ProfilesTableArn', { value: this.table.tableArn });
    if (this.table.tableStreamArn) {
      new CfnOutput(this, 'ProfilesStreamArn', {
        value: this.table.tableStreamArn,
      });
    }
  }
}
