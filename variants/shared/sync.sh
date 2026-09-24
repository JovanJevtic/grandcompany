#!/bin/sh
# Copy the shared Grand Company data and assets into every variant.
set -e
cd "$(dirname "$0")/.."
for v in v1-root v2-maison v3-cipher; do
  [ -d "$v" ] || continue
  mkdir -p "$v/src/gc" "$v/public"
  cp shared/gc.ts shared/gc-data.json "$v/src/gc/"
  cp -R shared/public/products shared/public/photos "$v/public/"
done
echo synced
