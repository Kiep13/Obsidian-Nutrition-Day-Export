#!/bin/bash

set -euo pipefail

PLUGIN_SRC="$(cd "$(dirname "$0")" && pwd)"
PLUGIN_ID="$(node -e "const fs=require('fs'); console.log(JSON.parse(fs.readFileSync('$PLUGIN_SRC/manifest.json','utf8')).id)")"

echo "Building plugin..."
corepack pnpm build

if [ -n "${1:-}" ]; then
  VAULT_PATH="$1"
elif [ -n "${OBSIDIAN_VAULT_PATH:-}" ]; then
  VAULT_PATH="$OBSIDIAN_VAULT_PATH"
else
  echo "Usage: ./install.sh /path/to/obsidian-vault"
  exit 1
fi

VAULT_PATH="${VAULT_PATH/#\~/$HOME}"
DESTINATION_PATH="$VAULT_PATH/.obsidian/plugins/$PLUGIN_ID"

if [ ! -d "$VAULT_PATH" ]; then
  echo "Error: vault not found at '$VAULT_PATH'"
  exit 1
fi

mkdir -p "$DESTINATION_PATH"
cp "$PLUGIN_SRC/main.js" "$DESTINATION_PATH/main.js"
cp "$PLUGIN_SRC/manifest.json" "$DESTINATION_PATH/manifest.json"

if [ -f "$PLUGIN_SRC/styles.css" ]; then
  cp "$PLUGIN_SRC/styles.css" "$DESTINATION_PATH/styles.css"
fi

echo "Installed to: $DESTINATION_PATH"
