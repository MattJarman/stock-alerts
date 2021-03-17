#!/usr/bin/env bash

# Text modifiers
BOLD=$'\033[1m'
NC=$'\033[0m'
LIGHT_GREEN=$'\033[1;32m'

printf "%s%sInstalling project dependencies.%s\n" "$LIGHT_GREEN" "$BOLD" "$NC"
docker-compose run --rm --user "$(id -u)":"$(id -g)" sa_node sh -c "(cd app && npm i) && (cd infrastructure && npm i)"

docker-compose up -d
