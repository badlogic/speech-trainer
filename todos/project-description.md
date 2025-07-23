# Project: Speech Trainer

A web-based speech training application (currently in MVP development stage) built with modern web technologies and containerized deployment.

## Features
- Currently a starter template ready for speech training features
- Live reload development environment
- Automatic SSL with production deployment
- Intended features: speech recognition, practice exercises, progress tracking, pronunciation feedback

## Tech Stack
- TypeScript for type-safe development
- Tailwind CSS v4 for styling
- Caddy web server with automatic HTTPS
- Docker & Docker Compose for containerization
- tsup bundler for TypeScript compilation
- Biome for code formatting and linting
- Live reload via WebSocket proxy

## Structure
- `src/` - Source files (HTML, TypeScript, CSS)
- `dist/` - Build output (git ignored)
- `infra/` - Infrastructure and build configuration
- `todos/` - Project planning and task management
- Entry points: `src/index.html`, `src/index.ts`, `run.sh`

## Architecture
- Static site architecture with client-side TypeScript
- Docker-based development and production environments
- Caddy handles routing and SSL
- Custom build pipeline using Node.js scripts
- WebSocket-based live reload for development

## Commands
- Build: `npm run build`
- Test: No tests configured yet
- Lint: `npm run check` (Biome + TypeScript)
- Dev/Run: `./run.sh dev` or `npm run dev`
- Deploy: `./run.sh deploy`
- Stop: `./run.sh stop`
- Logs: `./run.sh logs`

## Testing
No testing framework is currently set up. To add tests, install a framework like Vitest and create test files in `src/__tests__/` or alongside source files with `.test.ts` extension.