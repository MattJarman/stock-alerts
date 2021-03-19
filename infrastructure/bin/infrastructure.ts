#!/usr/bin/env node
import 'source-map-support/register'
import { Env, InfrastructureStack, LogLevel } from '../lib/infrastructure-stack'
import { App } from '@aws-cdk/core'
import Config from 'config'
import Helpers from '../lib/Helpers'

const env: Env = Config.get('env')
const region: string = process.env.CDK_DEPLOY_REGION ?? 'eu-west-1'
const logLevel: LogLevel = Config.get('logLevel')
const timeoutSeconds: number = Config.get('lambda.timeoutSeconds')
const schedule: string = Config.get('lambda.schedule')
const memorySize: number = Config.get('lambda.memorySize')
const regionShortName = Helpers.getRegionShortName(region)
const stackName = `cf-${env.charAt(0)}-${regionShortName}-stock-alerts`

const app = new App()
new InfrastructureStack(app, stackName, {
  app: {
    env: env,
    logLevel: logLevel
  },
  lambda: {
    timeoutSeconds: timeoutSeconds,
    schedule: schedule,
    memorySize: memorySize
  },
  env: {
    account: process.env.CDK_DEPLOY_ACCOUNT,
    region: region
  }
})
