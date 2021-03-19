#!/usr/bin/env bash

if [ "$1" ]
then
  docker-compose run --rm --user -w node/app  "$(id -u)":"$(id -g)" -w /node/app sa_node npm run test:e2e -- --name "$1"
  exit
fi


docker-compose run --rm --user "$(id -u)":"$(id -g)" -w /node/app sa_node npm run test:e2e
