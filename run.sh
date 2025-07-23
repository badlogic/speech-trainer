#!/bin/bash

set -e

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

PROJECT=speech-trainer
SERVER=slayer.marioslab.io
SERVER_DIR=/home/badlogic
DOMAIN=speechtrainer.mariozechner.at

# Use different project name if PORT is set to allow multiple instances
if [ -n "$PORT" ]; then
    PROJECT="${PROJECT}-${PORT}"
fi

sync_files() {
    echo "Building for production..."
    npm install
    node infra/build.js

    echo "Syncing files..."
    rsync -avz \
      --include="dist/***" \
      --include="infra/***" \
      --include="run.sh" \
      --include="package.json" \
      --include="package-lock.json" \
      --exclude="*" \
      --delete \
      ./ $SERVER:$SERVER_DIR/$DOMAIN/
}

pushd "$SCRIPT_DIR" > /dev/null

case "$1" in
dev)
    echo "Starting development server..."
    npm install
    node infra/build.js

    # Generate .env file from env.vars
    node infra/generate-env.js > .env

    node infra/build.js --watch &
    docker compose -p $PROJECT -f infra/docker-compose.yml -f infra/docker-compose.dev.yml up --build --menu=false
    ;;
prod)
    echo "Starting production server..."
    docker compose -p $PROJECT -f infra/docker-compose.yml -f infra/docker-compose.prod.yml up -d --build
    ;;
stop)
    echo "Stopping services..."
    docker compose -p $PROJECT -f infra/docker-compose.yml -f infra/docker-compose.dev.yml down 2>/dev/null || \
    docker compose -p $PROJECT -f infra/docker-compose.yml -f infra/docker-compose.prod.yml down
    ;;
logs)
    docker compose -p $PROJECT -f infra/docker-compose.yml -f infra/docker-compose.dev.yml logs -f 2>/dev/null || \
    docker compose -p $PROJECT -f infra/docker-compose.yml -f infra/docker-compose.prod.yml logs -f
    ;;
deploy)
    echo "Deploying $PROJECT to $DOMAIN..."
    npm install
    node infra/build.js
    sync_files

    echo "Restarting services..."
    # Generate .env file from env.vars
    ENV_CONTENT=$(node infra/generate-env.js)

    # Deploy with generated .env file
    ssh $SERVER "cd $SERVER_DIR/$DOMAIN && cat > .env << 'EOF'
$ENV_CONTENT
EOF
    ./run.sh stop && ./run.sh prod"

    echo "✅ Deployed to https://$DOMAIN"
    ;;
sync)
    echo "Syncing $PROJECT to $DOMAIN..."
    sync_files
    echo "✅ Synced to $DOMAIN"
    ;;
build)
    echo "Building project..."
    npm install
    node infra/build.js
    echo "✅ Built to dist/"
    ;;
logs-remote)
    echo "Showing remote logs from $DOMAIN (Ctrl+C to exit)..."
    ssh $SERVER "cd $SERVER_DIR/$DOMAIN && ./run.sh logs"
    ;;
*)
    echo "Usage: $0 {dev|prod|stop|logs|build|deploy|sync|logs-remote}"
    echo ""
    echo "  dev         - Start development server (foreground)"
    echo "  prod        - Start production server (background)"
    echo "  stop        - Stop all services"
    echo "  logs        - Show local logs"
    echo "  build       - Build project to dist/"
    echo "  deploy      - Deploy and restart services"
    echo "  sync        - Sync files only, no restart"
    echo "  logs-remote - Show logs from remote server"
    exit 1
    ;;
esac

popd > /dev/null