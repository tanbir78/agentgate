#!/usr/bin/env bash
# Run on a machine with Java + network access. The Maven Wrapper bootstraps Maven. Fails loudly if any pom coordinate cannot be resolved.
set -euo pipefail
cd "$(dirname "$0")/../backend"
./mvnw -B -q dependency:resolve dependency:resolve-plugins
./mvnw -B -q dependency:tree | tee ../docs/architecture/dependency-tree.txt
echo "Dependencies resolved. Now confirm versions against official compatibility docs."
