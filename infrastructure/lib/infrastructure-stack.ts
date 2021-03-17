import { Construct, Duration, Stack, StackProps } from '@aws-cdk/core'
import { AssetCode, Function, Runtime } from '@aws-cdk/aws-lambda'
import { Rule, Schedule } from '@aws-cdk/aws-events'
import { LambdaFunction } from '@aws-cdk/aws-events-targets'

export type LogLevel = 'ERROR' | 'WARNING' | 'LOG' | 'INFO' | 'DEBUG'
export type Env = 'test' | 'dev' | 'prod'

interface InfrastructureStackProps extends StackProps {
  app: {
    env: Env
    logLevel: LogLevel
  }
  lambda: {
    timeoutSeconds: number
    scheduleMinutes: number
    memorySize: number
    name: string
  }
}

export class InfrastructureStack extends Stack {
  constructor (scope: Construct, id: string, props: InfrastructureStackProps) {
    super(scope, id, props)

    const lambda = new Function(this, 'stock-alerts', {
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
        LOG_LEVEL: props.app.logLevel
      },
      functionName: props.lambda.name,
      timeout: Duration.seconds(props.lambda.timeoutSeconds),
      memorySize: props.lambda.memorySize
    })

    const rule = new Rule(this, 'stock-alerts-schedule', {
      schedule: Schedule.rate(Duration.minutes(props.lambda.scheduleMinutes))
    })

    rule.addTarget(new LambdaFunction(lambda))
  }
}
