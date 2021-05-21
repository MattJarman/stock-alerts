#!/usr/bin/env bash

DIR="app"
COMMAND=()

for arg in "$@"; do
  case $arg in
  "-w" | "--working-dir")
    DIR="$2"
    shift
    shift
    ;;
  *)
    COMMAND+=("$1")
    shift
    ;;
  esac
done

docker-compose run --rm --user "$(id -u)":"$(id -g)" -w /node/"$DIR" sa_node ${COMMAND[*]}
