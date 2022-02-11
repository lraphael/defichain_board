#!/usr/bin/env bash
set -e

echo "$@"

if [[ "$@" == "" ]]; then
    echo "quasar dev"
    quasar dev
else
    exec "$@"
fi
