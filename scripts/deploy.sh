#!/bin/bash

set -e

SSH_SERVER_CONFIG="ctaws"
REMOTE_DIR="/var/www/collar_project/frontend"

echo "Building frontend..."
npm run build

echo "Deploying frontend..."
rsync -avz --delete \
    ./dist/ \
    "$SSH_SERVER_CONFIG:$REMOTE_DIR/dist/"

echo "Deploy finished successfully."
