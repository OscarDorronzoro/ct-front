#!/bin/bash

SSH_SERVER_CONFIG="ctprod"

echo "Deploying frontend..."
rsync -avz --delete . $SSH_SERVER_CONFIG:/var/www/collar_project/frontend \
  --exclude-from='.rsyncignore'

echo "Building frontend..."
ssh $SSH_SERVER_CONFIG "source ~/.nvm/nvm.sh && cd /var/www/collar_project/frontend && npm install && npm run build"

echo "Deploy finished."

