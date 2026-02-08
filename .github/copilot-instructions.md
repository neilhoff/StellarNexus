# StellarNexus Development Guide

## Architecture Overview

StellarNexus is a **full-stack serverless application** with a clear separation between frontend and backend:

- **Frontend**: Quasar Framework (Vue 3 + Vite) located in `/client`
- **Backend**: AWS Architect (serverless framework) with Lambda functions in `/src`
- **Build Output**: Client builds to `/public` (served as static site via `@static` in `app.arc`)

## Project Structure

```
client/             # Quasar Vue 3 frontend (independent package.json)
  src/
    boot/          # Quasar boot files (axios.js, defaults.js)
    layouts/       # PublicLayout.vue, ProtectedLayout.vue
    pages/         # Split into public/ and protected/ subdirectories
    services/      # Business logic (auth/, ws/, stellarTrack.js)
    stores/        # Pinia stores (authStore, configStore, callRestApiStore)
    router/        # Vue Router with auth guards
src/               # Architect serverless backend
  http/            # HTTP Lambda handlers (get-api-*, options-api-*)
  ws/              # WebSocket Lambda handlers (connect/, chat/, stellar-track/)
  shared/          # Shared backend utilities (stellarErrorLogger.mjs, tableHelper.mjs)
  tables-streams/  # DynamoDB stream handlers
```

## Development Workflow

### Start Development Environment
```bash
npm start  # From root - runs both client and server in parallel
```

This runs:
- Client: `cd client && quasar dev` (http://localhost:9000)
- Server: `arc sandbox` (http://localhost:3333)

### Key Commands
- **Install Dependencies**: Run `npm install` in root AND in `/client`
- **Hydrate Backend**: `arc hydrate` (installs dependencies for each Lambda in `/src/http`)
- **Run Tests**: `npm run testDev` (Cypress for dev) or `npm run testStaging`
- **Build Client**: `cd client && quasar build` (outputs to `/public`)
- **Deploy**: `arc deploy` (staging) or `arc deploy --production`

## Critical Patterns

### 1. Authentication Flow (AWS Cognito)
- **Service**: [client/src/services/auth/cognitoService.js](client/src/services/auth/cognitoService.js)
- **Store**: [client/src/stores/authStore.js](client/src/stores/authStore.js) (Pinia with persistence)
- **Router Guards**: [client/src/router/index.js](client/src/router/index.js) - checks `isAuthenticated()` before protected routes
- **Protected Routes**: `/p/*` routes have `meta: { requiresAuth: true }`
- **Tokens**: Stored in Pinia (accessToken, idToken, refreshToken) with optional persistence

### 2. WebSocket Architecture
- **Client Service**: [client/src/services/ws/baseWebSocketService.js](client/src/services/ws/baseWebSocketService.js)
  - Singleton pattern with connection pooling
  - Multi-handler registration: `addMessageHandler(handler)` and `removeMessageHandler(handler)`
  - Global handler: [globalMessageHandler.js](client/src/services/ws/globalMessageHandler.js)
  - Send format: `send(action, data, includeMe)`
- **Backend Handlers**: `/src/ws/{connect,disconnect,chat,stellar-track,broadcast-update}/`
  - Use `.mjs` extension (not `.js` like HTTP handlers)
  - DynamoDB connections table tracks active WebSocket connectionIds
- **Connection Lifecycle**: Boot file [client/src/boot/defaults.js](client/src/boot/defaults.js) initializes WebSocket on app load

### 3. StellarTrack Analytics System
Purpose: Track user interactions, page views, errors, and analytics data.

**Client-Side**:
- [client/src/services/stellarTrack.js](client/src/services/stellarTrack.js): `trackPageView()`, `trackClicks()`, `trackError()`
- Auto-tracking via [client/src/boot/defaults.js](client/src/boot/defaults.js) global click listener
- Data sent via WebSocket `stellar-track` action

**Backend**:
- Sharded DynamoDB pattern in [src/shared/tableHelper.mjs](src/shared/tableHelper.mjs)
  - Uses 16 shards (`0-F`) to prevent throttling: `pk: error#${shard}#${YYYY-MM}`
  - Query all shards with `pLimit` concurrency control (≤25 parallel)
- Error logging: [src/shared/stellarErrorLogger.mjs](src/shared/stellarErrorLogger.mjs) builds structured error items

### 4. Architect-Specific Conventions
- **Function Structure**: Each `/src/http/get-api-*` folder is a separate Lambda
  - CommonJS format: `exports.handler = arc.http(handlerFn)`
  - HTTP handlers use `arc.http()` wrapper
  - WebSocket handlers use `arc.ws()` wrapper
- **CORS Handling**: [src/http/options-api-catchall/index.js](src/http/options-api-catchall/index.js) handles preflight
- **Shared Code**: `/src/shared` folder accessible via `@architect/shared` in Lambdas
- **DynamoDB Tables**: Defined in `app.arc` under `@tables` (stellarTracks, connections, chat)
  - TTL enabled on `expires` attribute for auto-cleanup
  - Stream processing via `@tables-streams`

### 5. Environment Variables
- **Client**: `.env` file in `/client` (copy from `.env-template`)
  - `COGNITO_USER_POOL_ID`, `COGNITO_CLIENT_ID`, `WS_URL`
  - Accessed via `process.env.VAR_NAME` in Quasar
- **Backend**: AWS Architect environment variables (see project docs)

### 6. Quasar-Specific Patterns
- **Boot Files**: Run before app initialization - use for global setup (axios config, WebSocket init)
- **Layouts**: Two main layouts - `PublicLayout.vue` (marketing) and `ProtectedLayout.vue` (authenticated)
- **Build Config**: [client/quasar.config.js](client/quasar.config.js)
  - Output dir: `distDir: '../public/'` (overwrites root `/public`)
  - Router mode: `vueRouterMode: 'hash'` (required for static S3 hosting)
  - Plugins: `Notify` enabled for toast notifications

## Common Integration Points

### Adding a New HTTP Endpoint
1. Create folder in `/src/http/` (e.g., `get-api-my-endpoint`)
2. Add `index.js` with `exports.handler = arc.http(handlerFn)`
3. Add route to `app.arc` under `@http`
4. Run `arc hydrate` to install dependencies in Lambda folder

### Adding a WebSocket Action
1. Create folder in `/src/ws/` (e.g., `my-action`)
2. Add `index.mjs` (note `.mjs` extension)
3. Add action to `app.arc` under `@ws`
4. Update [client/src/services/ws/globalMessageHandler.js](client/src/services/ws/globalMessageHandler.js) to handle responses

### Adding a Protected Route
1. Add route to [client/src/router/routes.js](client/src/router/routes.js) under `/p` path
2. Set `meta: { requiresAuth: true }` (or `requiresAdmin: true`)
3. Create page component in `client/src/pages/protected/`

## Testing Strategy
- **Cypress**: E2E tests configured in `cypress.config.js`
- **Test Environments**: `testDev` and `testStaging` scripts
- **Cypress Store Access**: `window.store` exposed in [client/src/boot/defaults.js](client/src/boot/defaults.js) when `window.Cypress` exists

## Deployment Notes
- **Staging**: `arc deploy` (default profile from `app.arc`)
- **Production**: `arc deploy --production`
- **AWS Profile**: Set in `app.arc` under `@aws` (default: `profile default`)
- **Static Assets**: Client build goes to `/public`, served via CloudFront CDN
- **API Gateway URL**: Printed after deployment for WebSocket/HTTP endpoints

## Data Conventions
- **DynamoDB Key Patterns**:
  - Sharded analytics: `pk: type#shard#YYYY-MM`, `sk: ISO-timestamp`
  - Connections: `connectionId` as partition key with TTL
- **Error Handling**: Use `stellarErrorLogger.mjs` to structure errors with correlation IDs
- **Date Formatting**: Use `date-fns` library (imported in both client and backend)

## Important Files for Context
- [app.arc](app.arc): Serverless infrastructure definition
- [Readme.md](Readme.md): Setup and deployment instructions
- [client/src/router/routes.js](client/src/router/routes.js): All frontend routes
- [src/shared/tableHelper.mjs](src/shared/tableHelper.mjs): DynamoDB sharding utilities
