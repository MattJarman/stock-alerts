import { Construct, Duration, RemovalPolicy, Stack, StackProps } from '@aws-cdk/core'
import { AssetCode, Function, Runtime } from '@aws-cdk/aws-lambda'
import { Rule, Schedule } from '@aws-cdk/aws-events'
import { LambdaFunction } from '@aws-cdk/aws-events-targets'
import { AttributeType, BillingMode, Table } from '@aws-cdk/aws-dynamodb'
import Helpers from './Helpers'

export type LogLevel = 'ERROR' | 'WARNING' | 'LOG' | 'INFO' | 'DEBUG'
export type Env = 'test' | 'dev' | 'prod'

interface InfrastructureStackProps extends StackProps {
  app: {
    env: Env
    logLevel: LogLevel
  }
  lambda: {
    timeoutSeconds: number
    schedule: string
    memorySize: number
  }
}

export class InfrastructureStack extends Stack {
  constructor (scope: Construct, id: string, props: InfrastructureStackProps) {
    super(scope, id, props)

    if (!props.env?.region) {
      throw new Error('AWS Region is required.')
    }

    const regionShortName = Helpers.getRegionShortName(props.env.region)

    const stockAlertsTable = new Table(this, 'stock-alerts-table', {
      partitionKey: {
        name: 'product',
        type: AttributeType.STRING
      },
      sortKey: {
        name: 'source',
        type: AttributeType.STRING
      },
      tableName: `ddb-${props.app.env.charAt(0)}-${regionShortName}-stock-alerts`,
      billingMode: BillingMode.PAY_PER_REQUEST,
      removalPolicy: RemovalPolicy.DESTROY
    })

    const lambda = new Function(this, 'stock-alerts-lambda', {
      code: new AssetCode('../app/', {
        exclude: [
          '*.ts',
          'src/*',
          'test/*',
          'jest.config.js',
          '.eslintignore',
          '.eslintrc.js',
          'tsconfig*.json'
        ]
      }),
      handler: 'dist/Handler.handler',
      runtime: Runtime.NODEJS_14_X,
      environment: {
        NODE_ENV: props.app.env,
        LOG_LEVEL: props.app.logLevel,
        STOCK_ALERTS_TABLE_NAME: stockAlertsTable.tableName
      },
      functionName: `l-${props.app.env.charAt(0)}-${regionShortName}-stock-alerts`,
      timeout: Duration.seconds(props.lambda.timeoutSeconds),
      memorySize: props.lambda.memorySize
    })

    const rule = new Rule(this, 'stock-alerts-schedule', {
      schedule: Schedule.expression(props.lambda.schedule)
    })

    rule.addTarget(new LambdaFunction(lambda))
    stockAlertsTable.grantReadWriteData(lambda)
  }
}
