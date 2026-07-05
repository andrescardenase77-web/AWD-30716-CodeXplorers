#!/bin/bash

# --- VARIABLE CONFIGURATION ---
FOLDER_NAME="AWD-30716-CodeXplorers"
PROCESS_NAME="fabuladental-business"
INITIAL_DIR=$PWD

echo "=== 1. NAVIGATING TO REPOSITORY ==="
cd "$FOLDER_NAME" || exit 1

echo "=== 2. PULLING LATEST CHANGES FROM GITHUB ==="
git pull

echo "=== 3. UPDATING ENVIRONMENT VARIABLES ==="
# Reemplaza el archivo .env en la carpeta de lógica de negocio
cp "$INITIAL_DIR/prod.env" "06Code/business-logic/.env"

echo "=== 4. RESTARTING EXPRESS APP WITH PM2 ==="
pm2 restart "$PROCESS_NAME" --update-env
echo "=== FAST UPDATE COMPLETED SUCCESSFULLY! ==="
