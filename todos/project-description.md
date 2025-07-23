# Project: Speech Trainer

An interactive word practice application for children learning speech sounds, featuring AI-powered content generation through OpenAI integration.

## Features
- Interactive speech sound practice with 5 target sounds (S, T, P, K, W)
- AI-generated themed words using OpenAI GPT-4
- AI-generated images for every 3rd word using DALL-E
- Card-based navigation with keyboard support
- Live reload development environment
- Automatic SSL with production deployment

## Tech Stack
- TypeScript for type-safe development
- Express.js backend with OpenAI SDK integration
- Tailwind CSS v4 for styling
- Caddy web server with automatic HTTPS
- Docker & Docker Compose for containerization
- tsup bundler for TypeScript compilation
- Biome for code formatting and linting
- Live reload via WebSocket proxy

## Structure
- `src/` - Frontend source files (HTML, TypeScript, CSS)
- `src/backend/` - Backend Express server
- `dist/` - Build output (git ignored)
- `infra/` - Infrastructure and build configuration
- `todos/` - Project planning and task management
- Entry points: `src/index.html`, `src/index.ts`, `src/backend/server.ts`, `run.sh`

## Architecture
- Frontend: Single-page application with vanilla TypeScript
- Backend: Express.js API server for OpenAI integration
- Docker-based development and production environments
- Caddy handles routing, SSL, and API proxying
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