#!/bin/bash

# --- VARIABLE CONFIGURATION ---
FOLDER_NAME="AWD-30716-CodeXplorers"
PROCESS_NAME="fabuladental-frontend"
INITIAL_DIR=$PWD

echo "=== 1. NAVIGATING TO REPOSITORY ==="
cd "$FOLDER_NAME" || exit 1

echo "=== 2. PULLING LATEST CHANGES FROM GITHUB ==="
git pull

echo "=== 3. UPDATING ENVIRONMENT VARIABLES ==="
cp "$INITIAL_DIR/prod.env" "06Code/frontend/.env"

echo "=== 4. REBUILDING FRONTEND APPLICATION ==="
cd "06Code/frontend" || exit 1
npm install
npm run build

echo "=== 5. RESTARTING EXPRESS APP WITH PM2 ==="
pm2 restart "$PROCESS_NAME" --update-env
echo "=== FAST UPDATE COMPLETED SUCCESSFULLY! ==="
