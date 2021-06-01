# Stock Alerts
A Lambda function to check for stock updates and send alerts to the user.

## Overview
The project is split into two different parts: [app](https://github.com/MattJarman/stock-alerts/tree/main/app)
and [infrastructure](https://github.com/MattJarman/stock-alerts/tree/main/infrastructure).

The app part of the project contains the lambda function code, written in Typescript.

The infrastructure part of the project defines the resources needed for the stack, and was written
using the [AWS CDK](https://docs.aws.amazon.com/cdk/latest/guide/home.html) Framework
and Typescript.

This stack contains three major parts:

* **Lambda function** - Used for checking a website for stock updates
* **DynamoDB** - Used for recording when an alert was last sent
* **SNS** - Used for sending the alert

## Development
To run this project, you'll need the following:

* [Git](https://git-scm.com/downloads)
* [Docker Compose](https://docs.docker.com/compose/)

To set up the project, you can run `install.sh` located in the `scripts` directory.

```
$ ./scripts/install.sh
```

### Running Commands

To aid with development, the `run.sh` script located in the `scripts` directory has been provided to run commands
through docker-compose. To choose the directory in which to run the command, you can supply the `-w`, `--working-dir`
flag followed by either `app` or `infrastructure` (defaults to app). For example, to install a new package in both
directories, you can use the following commands:

```
$ ./scripts/run.sh npm i example-package
$ ./scripts/run.sh -w infrastructure npm i example-package
```

This script can also be used to run any of the npm commands found in `app/package.json` and
`infrastructure/package.json`.

### Deployment
To deploy the lambda function, you can use the `deploy.sh` script located in the `scripts` directory. If you're planning
on using this script on your local machine (*recommended if you have AWS profiles set up*), then you'll need
[Node.js](https://nodejs.org/en/) installed.

The deploy script accepts the following flags:

| Flag                       | Description                                                                                       | Required         | Default    |
|:---------------------------|:--------------------------------------------------------------------------------------------------|:-----------------|:-----------|
| `-e`, `--environment`      | Environment for the function. Must be one of: *dev*, *prod*.                                      |:heavy_check_mark:| *None*     |
| `-an`, `--account-number`  | Account number of account that the lambda will be deployed to.                                    |:heavy_check_mark:| *None*     |
| `-p`, `--profile`          | AWS profile which contains your credentials.                                                      |:x:               | *default*  |
| `-r`, `--region`           | Region the lambda will be deployed to.                                                            |:x:               | *eu-west-1*|

*Before first deployment, you may need to provision the resources. You can do this by running the
following*:

```
$ ./scripts/run.sh -w infrastructure npm run cdk bootstrap
```

#### Deploy from local machine

##### 1. Export your AWS credentials (optional)

***If you already have an AWS profile set up in `~/.aws/credentials`, then you can skip this step.***

```
$ export AWS_ACCESS_KEY_ID=YOUR_AWS_ACCESS_KEY_ID
$ export AWS_SECRET_ACCESS_KEY=YOUR_AWS_SECRET_ACCESS_KEY
```

##### 2. Run the deployment script
```
$ ./scripts/deploy.sh -e prod -an AWS_ACCOUNT_NUMBER -r AWS_REGION
```

If you didn't export your credentials and instead chose to use your AWS profile, then you should run this command
instead:

```
$ ./scripts/deploy.sh -e prod -an AWS_ACCOUNT_NUMBER -r AWS_REGION -p AWS_PROFILE
```

#### Deploy from Docker Compose

If you would rather not install Node.js, then you can use this method instead.

##### 1. Run the node container

```
$ docker-compose run --rm --user "$(id -u)":"$(id -g)" sa_node sh
```

##### 2. Export your AWS credentials
```
/var/www $ export AWS_ACCESS_KEY_ID=YOUR_AWS_ACCESS_KEY_ID
/var/www $ export AWS_SECRET_ACCESS_KEY=YOUR_AWS_SECRET_ACCESS_KEY
```

##### 3. Run the deployment script
```
/var/www $ sh ./scripts/deploy.sh -e prod -an AWS_ACCOUNT_NUMBER -r AWS_REGION
```
