#!/usr/bin/env bash

# Formatting
NO_COLOUR=$'\033[0m'
RED=$'\033[0;31m'
ORANGE=$'\033[1;33m'
LIGHT_GREEN=$'\033[1;32m'

DEFAULT_REGION="eu-west-1"
DEFAULT_PROFILE="default"

FULL_PATH=$(realpath "$0")
ROOT_DIR="$(dirname "$FULL_PATH")/.."

ENVIRONMENT=""
ACCOUNT_NUMBER=""
PROFILE=""
REGION=""

error () {
  printf >&2 "%s%s%s\n" "$RED" "$@" "$NO_COLOUR"
  exit 1
}

warn () {
  printf >&2 "%s%s%s\n" "$ORANGE" "$@" "$NO_COLOUR"
}

log () {
  printf >&2 "%s%s%s\r\n" "$LIGHT_GREEN" "$@" "$NO_COLOUR"
}

for arg in "$@"; do
  case $arg in
  "-e" | "--environment")
    ENVIRONMENT="$2"
    shift
    shift
    ;;
  "-an" | "--account-number")
    ACCOUNT_NUMBER="$2"
    shift
    shift
    ;;
  "-p" | "--profile")
    PROFILE="$2"
    shift
    shift
    ;;
  "-r" | "--region")
    REGION="$2"
    shift
    shift
    ;;
  esac
done

if [ -z "$ENVIRONMENT" ]
then
  error "No environment set."
fi

if [ -z "$ACCOUNT_NUMBER" ]
then
  error "No account number set."
fi

if [ -z "$REGION" ]
then
  warn "No region set. Defaulting to '$DEFAULT_REGION'."
  REGION=$DEFAULT_REGION
fi


if [ -z "$PROFILE" ]
then
  warn "No profile set. Defaulting to '$DEFAULT_PROFILE'."
  PROFILE=$DEFAULT_PROFILE
fi

export CDK_DEPLOY_ACCOUNT=$ACCOUNT_NUMBER
export CDK_DEPLOY_REGION=$REGION
export NODE_ENV=$ENVIRONMENT

log "Building lambda function code..."
(cd "$ROOT_DIR/app" && npm run build)

log "Installing production dependencies..."
(cd "$ROOT_DIR/app" && npm prune --production)

log "Deploying..."
(cd "$ROOT_DIR/infrastructure" && npm run deploy -- --profile="$PROFILE")

log "Reinstalling dev dependencies..."
(cd "$ROOT_DIR/app" && npm ci)
