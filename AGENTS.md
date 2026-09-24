# AGENTS.md - StellarNexus

## Project Overview

Full-stack serverless application with a Quasar/Vue frontend in `client/` and AWS Architect Lambdas in `src/`. Static build output lives in `public/` and is served via `@static` in `app.arc`.

- `app.arc` is the backend source of truth: HTTP routes, WebSocket actions, DynamoDB tables, streams, AWS profile/region, and static hosting
- Frontend and backend are loosely coupled through REST (`/api/*`) and a shared WebSocket contract. Track changes on both sides when modifying either interface

## Local Workflow

- Install dependencies: run `npm install` at repo root and in `client/`
- Start local dev from repo root with `npm start`; Quasar dev runs on `http://localhost:9000` and `arc sandbox` on `http://localhost:3333`
- Run `arc hydrate` after adding or changing Lambda dependencies
- Frontend quality checks: use `npm run lint` inside `client/` and `quasar build` to verify production output
- Test scripts are Cypress UI launchers (`npm run testDev`, `npm run testStaging`)

## Environment Variables (Lambda Secrets)

- **Never** put backend secrets (Turso, Resend, Better Auth keys) in `client/.env` files. Those are for frontend-only config
- Architect manages Lambda environment variables via the `arc env` CLI. See `ArchitectEnvironmentVariables.md` for the full command reference
- Three environments: `testing` (local sandbox), `staging` (AWS SSM), `production` (AWS SSM)
- `arc env` (no flags) prints all vars across all environments. `arc env -e <env>` prints vars for one environment
- **Add a var**: `arc env --add --env <testing|staging|production> KEY "value"`
- **Remove a var**: `arc env --remove --env <testing|staging|production> KEY`
- For `testing`, vars are stored locally in `preferences.arc` (gitignored). For `staging`/`production`, vars are stored in AWS SSM Parameter Store
- `ARC_APP_SECRET` must be set for session encoding (min 32 bytes). Reserved names: `ARC_ENV`, `ARC_APP_NAME`, `ARC_SESSION_TABLE_NAME`
- Setup scripts: `node scripts/setup-env-testing.mjs`, `node scripts/setup-env-staging.mjs`, `node scripts/setup-env-production.mjs`

## Frontend Patterns

- `client/src/boot/defaults.js` initializes WebSocket, registers global click tracker, exposes `window.store` for Cypress, and sends UI errors through Quasar `Notify` plus StellarTrack
- Routing is split by layout in `client/src/router/routes.js`: public pages use `PublicLayout`, authenticated pages use `ProtectedLayout`, protected routes live under `/p` with `meta.requiresAuth`
- Auth decisions happen in `client/src/router/index.js`, which calls `isAuthenticated()` on every navigation and emits page-view tracking
- Pinia stores hold cross-page state. `client/src/stores/authStore.js` persists only essential session fields, not access tokens; don't assume the full session is durable across reloads
- Quasar configured for static hosting in `client/quasar.config.js`: router mode is `hash`, `distDir` points to `../public/`, sourcemaps enabled, `Notify` is a first-class UI pattern

## WebSocket + Tracking

- Use `client/src/services/ws/baseWebSocketService.js` as the only client socket entry point. It is a singleton, registers a global handler up front, and page-specific listeners should use `addMessageHandler()` / `removeMessageHandler()`
- Outbound socket messages use `send(action, data, includeMe)` and the backend expects an `action` matching an `@ws` route in `app.arc`
- `client/src/services/stellarTrack.js` sends page views, clicks, and client errors over the `stellar-track` socket action; click analytics depend on `data-cy` attributes, so don't remove them casually
- Feature-specific pages should register their own handler instead of stuffing logic into `globalMessageHandler.js`

## Backend Patterns

- Architect handlers are folder-per-function. HTTP handlers live under `src/http/<route-name>/`; WebSocket handlers live under `src/ws/<action>/`
- HTTP handlers commonly use `arc.http(...)` and may be CommonJS (`index.js`) or ESM (`index.mjs`) depending on the function. Match the existing module style in that folder
- WebSocket handlers use ESM and export `handler`; see `src/ws/stellar-track/index.mjs` for the expected event shape
- Some functions have local `config.arc` files such as `src/http/get-api-call_api/config.arc`; keep function-specific timeout/memory settings there instead of inventing ad hoc config files
- Shared backend logic belongs in `src/shared/` and is imported from Lambdas via `@architect/shared/...`

## Auth + Admin Policy

### Source of Truth

- Better Auth with Turso SQLite is the source of truth for:
  - User identity (email, name, password hash)
  - Roles (`user`, `admin`, `super-admin`, plus page-specific roles)
  - Sign-in eligibility (enabled/disabled)
- User data is stored in the `user` table in Turso — not in DynamoDB

### Role Management

- Roles are stored as a JSON array in the `roles` column of the Turso `user` table
- Every user gets `["user"]` on signup
- Granting/revoking `admin` or `super-admin` must be done via backend admin APIs
- UI checks and route guards are convenience only. Every admin endpoint must enforce authorization server-side

### Disabling Users

- Disabling a user sets `disabled = 1` in the Turso `user` table
- The backend checks `disabled` on every authentication attempt
- Audit fields `disabledAt` and `disabledBy` are written for tracking

### Template Bootstrap (New Site)

- Each new site must bootstrap one initial `super-admin`
- Use `node scripts/bootstrap-users.mjs [--env testing|staging|production]`
- Default is `testing`. All environments read from `preferences.arc` (gitignored)
- Bootstrap must be idempotent and auditable
- After bootstrap, all admin grants should be done from app admin APIs

### Security Rules

- Do not implement privileged auth based only on client-provided identity fields
- Do not treat client-side role flags as authoritative — always verify server-side
- Keep audit context for admin mutations (`changedBy`, `changedAt`, correlation IDs)
- Follow HTTP error logging standards (`logError`) on all admin APIs

## Data Conventions

- Analytics and error logs use monthly sharded DynamoDB keys from `src/shared/tableHelper.mjs`: `pk = <type>#<shard>#<YYYY-MM>`, `sk = ISO timestamp`. Query helpers rely on all 16 shards (`0-F`) and `pLimit(25)`
- `blankToNull()` exists because Architect table writes do not tolerate blank strings/undefined well; use it before persisting nested request payloads
- Server and client errors should flow through `src/shared/stellarErrorLogger.mjs`, which generates correlation IDs and writes both DynamoDB records and structured CloudWatch logs
- **HTTP Error Logging**: All HTTP handlers must wrap logic in try/catch and use `logError()` for errors. Pattern: `const correlationId = await logError(error, 'server', null, { req, context })`, then return error response with both `error` message and `correlationId`. See `src/http/get-api-stellar_tracks/index.mjs` for a reference implementation

## Design System

- The visual identity is defined in `DESIGN.md` at the repo root. Follow its tokens, component patterns, and do's/don'ts for all UI work
- Color tokens, typography, spacing, and component styles are centralized in `client/src/css/quasar.variables.scss` and `client/src/css/app.scss`
- The dashboard (authenticated) and landing page (public) share the same color DNA but differ in layout density. When creating new pages, consult `DESIGN.md` for the appropriate context
- Do not introduce ad hoc colors or spacing values — use existing SCSS variables from `quasar.variables.scss`

## Icons

- **Primary**: Use Quasar's built-in FontAwesome v6 icons (`icon="fas fa-*"` or `icon="far fa-*"` or `icon="fab fa-*"`). These are already loaded in `quasar.config.js` and should be the first choice
- **Backup**: When FontAwesome doesn't have the icon you need, use the `better-icons` CLI (installed globally) to search and retrieve icons from 150+ collections (Lucide, Heroicons, Material Design, etc.)
  - Search: `npx better-icons search <query> --prefix lucide --limit 10`
  - Get SVG: `npx better-icons get lucide:<name> --size 24`
  - Popular collections: `lucide`, `mdi`, `heroicons`, `tabler`, `ph`, `ri`
- Save retrieved SVGs to `client/src/assets/icons/<name>.svg` (strip the `width`/`height` attributes, keep `viewBox`)
- Use the `<SnIcon>` component to render custom icons: `<SnIcon name="sparkle" size="24" />`
- When using better-icons SVGs inline, set `fill="currentColor"` so icons inherit the text color and work with dark mode
- Do not install icon libraries as npm dependencies — use FontAwesome (already loaded) or inline SVGs from better-icons

## Code Style

- **Function declarations**: Use the `function name() { }` standard for all function declarations, not arrow functions or const assignments. This applies to both standalone functions and methods within objects/classes
- **Comments**: Add brief comments when logic is non-obvious, when the reason a function exists isn't clear from its name alone, or when a decision was made for a non-obvious reason. Keep comments short — a single line is preferred. Don't comment self-explanatory code

## When Adding Features

- New HTTP endpoint: add the handler folder under `src/http/`, register the route in `app.arc`, add any per-function `config.arc`, then run `arc hydrate` if dependencies changed
- New WebSocket action: add the handler under `src/ws/`, register it in `app.arc`, then update the client-side sender/handler flow
- New protected page: add the page under `client/src/pages/protected/`, wire it into `client/src/router/routes.js`, and keep auth assumptions aligned with the router guard
- If a change affects analytics or user interaction flows, update `data-cy` hooks and verify `trackClicks()` / `trackError()` still capture meaningful context
