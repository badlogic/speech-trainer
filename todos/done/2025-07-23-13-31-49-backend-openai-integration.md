# Backend OpenAI Integration
**Status:** Done
**Agent PID:** 85940

## Original Todo
Add a backend server that uses OpenAI (key in env OPENAI_API_KEY) to generate the words, and image image for every 3rd image.

## Description
We're building a simple Express backend server that integrates with OpenAI's API to dynamically generate themed words for speech practice and create AI-generated images for every 3rd word. The backend will replace the current static word database with AI-powered content generation, making the app more dynamic and engaging for children learning speech sounds.

## Implementation Plan
- [x] Create backend directory structure and Express server setup (src/backend/server.ts)
- [x] Add backend service to Docker Compose configuration (infra/docker-compose.yml)
- [x] Update Caddyfile to proxy /api routes to backend (infra/Caddyfile)
- [x] Implement POST /api/generate-words endpoint using OpenAI chat completion
- [x] Implement POST /api/generate-image endpoint using DALL-E for every 3rd word
- [x] Update frontend to call API instead of using static word database (src/index.ts:524)
- [x] Add loading states and error handling in frontend
- [x] Test the integration with docker-compose up

## Notes
Using simple Express server with OpenAI SDK for straightforward implementation.