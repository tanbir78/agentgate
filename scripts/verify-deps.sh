#!/usr/bin/env bash
# Run on a machine with network + Maven. Fails loudly if any pom coordinate cannot be resolved.
set -euo pipefail
cd "$(dirname "$0")/../backend"
mvn -B -q dependency:resolve dependency:resolve-plugins
mvn -B -q dependency:tree | tee ../docs/architecture/dependency-tree.txt
echo "Dependencies resolved. Now confirm versions against official compatibility docs."
