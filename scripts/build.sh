#!/usr/bin/env bash

set -euo pipefail

CWD=$(cd -P -- "$(dirname -- "$0")" && pwd -P)
cd "$CWD/.."

rm -rf dist
npx rollup -c rollup.config.js
cd dist
gzip -kf index.min.js
gzip -kf validate.min.js
ls -al
