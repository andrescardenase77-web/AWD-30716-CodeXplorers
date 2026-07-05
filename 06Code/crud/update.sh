#!/bin/bash

FOLDER_NAME="AWD-30716-CodeXplorers"
PROCESS_NAME="fabuladental-crud"
INITIAL_DIR=$PWD

echo "=== 1. NAVIGATING TO REPOSITORY ==="
cd "$FOLDER_NAME" || exit 1

echo "=== 2. PULLING LATEST CHANGES FROM GITHUB ==="
git pull

echo "=== 3. UPDATING ENVIRONMENT VARIABLES ==="
# Copia y reemplaza el prod.env actualizado hacia la raíz del servidor CRUD
cp "$INITIAL_DIR/prod.env" "06Code/crud/.env"

echo "=== 4. RESTARTING EXPRESS APP WITH PM2 ==="
pm2 restart "$PROCESS_NAME" --update-env
echo "=== FAST UPDATE COMPLETED SUCCESSFULLY! ==="
