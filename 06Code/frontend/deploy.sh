#!/bin/bash

# --- VARIABLE CONFIGURATION ---
GITHUB_REPO_URL="https://github.com/andrescardenase77-web/AWD-30716-CodeXplorers.git"
FOLDER_NAME="AWD-30716-CodeXplorers"
PROCESS_NAME="fabuladental-frontend"
INITIAL_DIR=$PWD

echo "=== 1. PREPARING THE SYSTEM AND INSTALLING TOOLS ==="
sudo apt-get update
sudo apt-get install -y curl git

echo "=== 2. INSTALLING NODE.JS 24 ==="
curl -fsSL https://deb.nodesource.com/setup_24.x | sudo -E bash -
sudo apt-get install -y nodejs

echo "=== 3. CLEANING PREVIOUS DEPLOYMENTS ==="
pm2 delete "$PROCESS_NAME" 2>/dev/null || true
rm -rf "$FOLDER_NAME"

echo "=== 4. DOWNLOADING UPDATED CODE FROM GITHUB ==="
git clone "$GITHUB_REPO_URL"

echo "=== 5. COPYING PRODUCTION ENVIRONMENT VARIABLES ==="
cp "$INITIAL_DIR/prod.env" "$FOLDER_NAME/06Code/frontend/.env"

echo "=== 6. CLEAN INSTALLING DEPENDENCIES AND BUILDING ==="
cd "$FOLDER_NAME/06Code/frontend" || exit 1
npm install
npm run build

echo "=== 7. STARTING THE APP WITH PM2 ==="
sudo npm install -g pm2 serve
pm2 start "serve -s dist -l 5173" --name "$PROCESS_NAME"

echo "=== 8. CONFIGURING VM REBOOT PERSISTENCE ==="
PM2_STARTUP_CMD=$(pm2 startup systemd | grep "sudo env PATH")
if [ ! -z "$PM2_STARTUP_CMD" ]; then
    eval $PM2_STARTUP_CMD
fi

pm2 save --force

echo "=== DEPLOYMENT COMPLETED SUCCESSFULLY FROM GITHUB! ==="
