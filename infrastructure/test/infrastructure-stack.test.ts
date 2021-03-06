import { Capture, expect as expectCDK, haveResource } from '@aws-cdk/assert'
import { App } from '@aws-cdk/core'
import { InfrastructureStack } from '../lib/infrastructure-stack'

describe('Test Infrastructure', () => {
  test('It successfully creates the infrastructure', () => {
    const app = new App()
    const stack = new InfrastructureStack(app, 'cf-t-ew1-test-stack', {
      app: {
        env: 'test',
        logLevel: 'ERROR'
      },
      lambda: {
        timeoutSeconds: 15,
        schedule: 'cron(* 9-21 * * ? *)',
        memorySize: 512
      },
      env: {
        account: '000000000',
        region: 'eu-west-1'
      }
    })

    expectCDK(stack).to(
      haveResource('AWS::Lambda::Function', {
        FunctionName: 'l-t-ew1-stock-alerts',
        MemorySize: 512,
        Timeout: 15,
        Environment: {
          Variables: {
            NODE_ENV: 'test',
            LOG_LEVEL: 'ERROR',
            STOCK_ALERTS_TABLE_NAME: Capture.anyType().capture()
          }
        }
      })
    )

    expectCDK(stack).to(
      haveResource('AWS::Events::Rule', {
        ScheduleExpression: 'cron(* 9-21 * * ? *)'
      })
    )
  })
})
