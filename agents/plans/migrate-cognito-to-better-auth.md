# Migration Plan: Cognito → Better Auth with Turso SQLite

## Overview

Migrate StellarNexus authentication from AWS Cognito to Better Auth, using Turso (libSQL/SQLite) as the user database. This replaces the dual-authority model (Cognito for identity + roles, DynamoDB for app state) with a single unified user store in Turso.

## Current State

- **Identity provider**: AWS Cognito (User Pool `us-east-1_VmIicVsbD`)
- **User data**: DynamoDB `users` table (`pk=USER#<email>`, `sk=PROFILE`)
- **Roles**: Cognito groups (`admin`, `super-admin`) — source of truth
- **Session**: JWT-based, 7-day refresh window via Cognito refresh tokens
- **API auth**: Bearer token in `Authorization` header, WebSocket via query param
- **Analytics**: DynamoDB `stellarTracks` table (stays as-is)
- **Connections**: DynamoDB `connections` table for WebSocket (stays as-is)

## Target State

- **Identity provider**: Better Auth (self-hosted, email/password + OAuth providers)
- **User database**: Turso SQLite (libSQL) — single source of truth for identity, roles, and user state
- **Roles**: `roles` column in Turso users table (JSON array). Every user gets `["user"]` on signup. Admin roles: `["user", "admin"]`, super-admin: `["user", "super-admin"]`. Page-level access uses page-specific roles (e.g., `["user", "page1", "page2"]`). `guest` role for limited access. Admin implicitly has access to all pages.
- **Session**: Better Auth session management (cookie-based for web, Bearer token for API)
- **API auth**: Bearer token in `Authorization` header (compatible with existing pattern)
- **Analytics**: DynamoDB `stellarTracks` table (unchanged)
- **Connections**: DynamoDB `connections` table (unchanged)

## Better Auth Setup

### Project ID and API Key

Better Auth requires a `BETTER_AUTH_PROJECT_ID` and `BETTER_AUTH_API_KEY` for the MCP server. These are obtained by:

1. Running `npx create-better-auth@latest` in the project to scaffold the auth server
2. The setup generates a `.env` with these values
3. Alternatively, use the Better Auth CLI to initialize: `npx better-auth init`

**For local development**: No external service needed — Better Auth runs as part of the app. The MCP server tools (`analyze_project`, `setup_better_auth`) can help plan the migration but require the project to be initialized first.

### Turso Database

Create separate databases per environment for isolation:

1. Install Turso CLI: `curl -sSf https://get.tur.so/install.sh | bash`
2. Create databases:
   - `turso db create stellar-nexus-dev`
   - `turso db create stellar-nexus-staging`
   - `turso db create stellar-nexus-prod`
3. Get connection URLs and auth tokens for each:
   - `turso db show stellar-nexus-dev --url` + `turso db tokens create stellar-nexus-dev`
   - (repeat for staging and prod)
4. Store in `.env` files:
   ```
   # .env (local/dev)
   TURSO_DATABASE_URL=libsql://stellar-nexus-dev.turso.io
   TURSO_AUTH_TOKEN=<dev-token>

   # .env.prod
   TURSO_DATABASE_URL=libsql://stellar-nexus-prod.turso.io
   TURSO_AUTH_TOKEN=<prod-token>
   ```

## Phase 1: Infrastructure & Dependencies

### 1.1 Add Turso to Backend

**Files to create/modify:**
- `src/shared/tursoClient.mjs` — Turso database client (using `@libsql/client`)
- `package.json` (root) — add `@libsql/client` dependency
- `app.arc` — no changes needed (Turso is external)

**Actions:**
- Run `npm install @libsql/client` at repo root
- Create shared Turso client module
- Add Turso env vars to `.env`, `.env.template`, `.env.dev`, `.env.prod`

### 1.2 Add Better Auth to Backend

**Files to create/modify:**
- `src/shared/betterAuth.mjs` — Better Auth server instance with Turso adapter
- `src/shared/authActions.mjs` — Auth action handlers (signin, signup, signout, refresh, forgot-password, reset-password, verify-email, session)
- `src/http/post-api-auth/index.mjs` — Single auth endpoint, dispatches to action handlers based on `action` param
- `package.json` (root) — add `better-auth` dependency
- `app.arc` — register single auth route

**Actions:**
- Run `npm install better-auth` at repo root
- Create Better Auth instance with Turso adapter
- Configure email/password provider + Resend for email delivery
- Configure OAuth providers (GitHub, Google, etc.)
- Set up session management (cookie + Bearer token support)
- Create action handlers in `authActions.mjs`:
  - `handleSignIn({ email, password })`
  - `handleSignUp({ email, password, name })`
  - `handleSignOut({ token })`
  - `handleRefresh({ refreshToken })`
  - `handleForgotPassword({ email })`
  - `handleResetPassword({ email, code, newPassword })`
  - `handleVerifyEmail({ email, code })`
  - `handleGetSession({ token })`

### 1.3 Create Turso Schema

**SQL migration:**
```sql
CREATE TABLE user (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  email_verified INTEGER DEFAULT 0,
  name TEXT,
  image TEXT,
  roles TEXT DEFAULT '["user"]',
  disabled INTEGER DEFAULT 0,
  disabled_at TEXT,
  disabled_by TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  last_sign_in_at TEXT
);

CREATE TABLE session (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  token TEXT UNIQUE NOT NULL,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES user(id)
);

CREATE TABLE account (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  provider_id TEXT NOT NULL,
  provider_account_id TEXT NOT NULL,
  access_token TEXT,
  refresh_token TEXT,
  expires_at INTEGER,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES user(id)
);

CREATE TABLE verification (
  id TEXT PRIMARY KEY,
  identifier TEXT NOT NULL,
  value TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- Indexes
CREATE INDEX idx_user_email ON user(email);
CREATE INDEX idx_session_token ON session(token);
CREATE INDEX idx_session_user_id ON session(user_id);
CREATE INDEX idx_account_user_id ON account(user_id);
```

## Phase 2: Backend Auth Layer

### 2.1 Replace Shared Auth Modules

**Files to replace:**
- `src/shared/authIdentity.mjs` → rewrite to parse Better Auth session/token
- `src/shared/adminAuth.mjs` → rewrite to check `role` column instead of Cognito groups
- `src/shared/cognitoAdmin.mjs` → **delete** (no longer needed)
- `src/shared/userMaintenance.mjs` → rewrite to use Turso instead of DynamoDB

**Key changes:**
- `authIdentity.mjs`: Parse Better Auth session cookie or Bearer token, extract `email`, `roles` (JSON array), `userId`
- `adminAuth.mjs`: Check `roles` array for `admin` or `super-admin` instead of `cognito:groups`
- `userMaintenance.mjs`: All user CRUD operations use Turso SQL queries instead of DynamoDB

### 2.2 Update Existing HTTP Endpoints

**Files to modify:**
- `src/http/get-api-admin-users/index.mjs` — query Turso instead of DynamoDB
- `src/http/post-api-admin-users-update/index.mjs` — update Turso user record
- `src/http/post-api-admin-users-disable/index.mjs` — update Turso `disabled` flag (no Cognito API call)
- `src/http/post-api-users/sync/index.mjs` — **delete or repurpose** (user sync is now handled by Better Auth)
- `src/http/get-api-users-search/index.mjs` — query Turso with LIKE on email/name

**Key changes:**
- Remove all Cognito API calls (`adminDisableUser`, `adminEnableUser`, etc.)
- Replace DynamoDB queries with Turso SQL
- Admin disable now only updates Turso `disabled` flag (single source of truth)

### 2.3 Update WebSocket Auth

**Files to modify:**
- `src/ws/stellar-track/index.mjs` — parse Better Auth token from query param
- `src/shared/authIdentity.mjs` — support WebSocket connect event with Better Auth token

**Key changes:**
- WebSocket connect still uses query param `token`, but now it's a Better Auth session token
- Token validation uses Better Auth's session verification instead of Cognito JWT

### 2.4 Register New Routes in app.arc

**Add to `@http`:**
```
post /api/auth
```

The single endpoint accepts `{ action, ...params }` and dispatches to the appropriate handler.

**Example request:**
```json
{ "action": "signin", "email": "user@example.com", "password": "secret" }
{ "action": "signup", "email": "user@example.com", "password": "secret", "name": "User" }
{ "action": "refresh", "refreshToken": "..." }
{ "action": "session", "token": "..." }
```

**Remove from `@http` (or keep as deprecated during migration):**
- `post /api/users/sync` — no longer needed

## Phase 3: Frontend Auth Layer

### 3.1 Replace Cognito Service

**Files to replace:**
- `client/src/services/auth/cognitoService.js` → `client/src/services/auth/betterAuthService.js`

**New service methods:**
```javascript
export async function signIn(email, password)
export async function signUp(email, password, attributes)
export async function signOut()
export async function refreshSession(refreshToken)
export async function forgotPassword(email)
export async function resetPassword(email, code, newPassword)
export async function confirmSignUp(email, code)
export async function resendConfirmationCode(email)
export async function isAuthenticated()
export async function hasAdminAccess()
export async function getSession()
```

**Key changes:**
- Replace `amazon-cognito-identity-js` SDK calls with `fetch()` to `POST /api/auth` with action params
- Token format changes from Cognito JWT to Better Auth session token
- `hasAdminAccess()` checks `roles` array from session response for `admin` or `super-admin`
- Single endpoint pattern: `{ action: "signin", email, password }`

### 3.2 Update Auth Store

**Files to modify:**
- `client/src/stores/authStore.js`

**Key changes:**
- Replace `refreshToken` with Better Auth session token
- Add `roles` array to state (from session response, default `["user"]`)
- Update `signIn()`, `signOut()`, `refresh()` to use new service with single endpoint pattern
- Update `isAuthenticated` getter to check Better Auth session validity

### 3.3 Update Router Guard

**Files to modify:**
- `client/src/router/index.js`

**Key changes:**
- `hasAdminAccess()` now checks `authStore.roles` array for `admin` or `super-admin`
- Session validation uses Better Auth session expiry

### 3.4 Update API Helper

**Files to modify:**
- `client/src/services/serviceHelpers.js`

**Key changes:**
- `Authorization: Bearer <token>` header now uses Better Auth session token
- Remove `X-User-Email` header (email is in the session token)

### 3.5 Update WebSocket Service

**Files to modify:**
- `client/src/services/ws/baseWebSocketService.js`

**Key changes:**
- WebSocket connect query param `token` now uses Better Auth session token

### 3.6 Update UI Components

**Files to modify:**
- `client/src/pages/public/SignupSignin.vue` — update to use new auth service (single endpoint)
- `client/src/layouts/ProtectedLayout.vue` — check `authStore.roles` for admin access
- `client/src/pages/protected/IndexPage.vue` — same
- `client/src/services/protected/essentialLinks.js` — no changes needed (still uses `isAdmin` boolean)
- `client/src/services/protected/users/userSyncService.js` — **delete** (no longer needed)

## Phase 4: Data Migration

### 4.1 Bootstrap Initial Users

Since there are no live sites, no password migration is needed. Instead, bootstrap the initial users directly in Turso:

**Bootstrap script:** `scripts/bootstrap-users.mjs`

**Steps:**
1. Create the initial `super-admin` user directly in Turso (idempotent, auditable)
2. Script accepts: email, password, role, displayName
3. Password is hashed by Better Auth during creation
4. Run once per environment (dev, staging, production)

### 4.2 Remove DynamoDB Users Table

- Remove `users` table from `app.arc` `@tables` section
- Remove `post /api/users/sync` from `app.arc` `@http` section
- Run `arc deploy` to remove the table from AWS
- Delete `src/http/post-api-users/sync/index.mjs`

## Phase 5: Cleanup & Verification

### 5.1 Remove Cognito Dependencies

**Files to delete:**
- `client/src/services/auth/cognitoService.js`
- `src/shared/cognitoAdmin.mjs`
- `client/src/services/protected/users/userSyncService.js`
- `src/http/post-api-users/sync/index.mjs`

**Files to clean:**
- `client/.env`, `.env.template`, `.env.dev`, `.env.prod` — remove Cognito env vars
- `client/package.json` — remove `amazon-cognito-identity-js` dependency
- `package.json` (root) — remove AWS Cognito SDK dependencies

### 5.2 Update app.arc

**Remove:**
- `users` table from `@tables` (if fully migrated to Turso)
- `post /api/users/sync` from `@http`
- `connections` table's `email` index if no longer needed

### 5.3 Update Documentation

**Files to update:**
- `AGENTS.md` — update auth section, remove Cognito references
- `DESIGN.md` — no changes needed (design-agnostic)
- `README.md` — update setup instructions

### 5.4 Testing Checklist

- [ ] Sign up new user → creates Turso record
- [ ] Sign in existing user → validates against Turso
- [ ] Session refresh → works with Better Auth session
- [ ] Forgot password → sends email, resets successfully
- [ ] Admin role check → `hasAdminAccess()` returns correct value
- [ ] Admin user list → queries Turso, returns all users
- [ ] Admin disable user → updates Turso `disabled` flag, blocks sign-in
- [ ] WebSocket connect → authenticates with Better Auth token
- [ ] Protected routes → router guard works correctly
- [ ] Sign out → clears session, redirects to login

## File Change Summary

### New Files (~12)
| File | Purpose |
|------|---------|
| `src/shared/tursoClient.mjs` | Turso database client |
| `src/shared/betterAuth.mjs` | Better Auth server instance |
| `src/shared/authActions.mjs` | Auth action handlers (signin, signup, etc.) |
| `src/http/post-api-auth/index.mjs` | Single auth endpoint (dispatches by action) |
| `client/src/services/auth/betterAuthService.js` | Frontend auth service |
| `scripts/bootstrap-users.mjs` | Initial user bootstrap script |
| `scripts/auth-schema.sql` | Turso database schema |

### Modified Files (~20)
| File | Changes |
|------|---------|
| `src/shared/authIdentity.mjs` | Parse Better Auth session, extract `roles` array |
| `src/shared/adminAuth.mjs` | Check `roles` array instead of Cognito groups |
| `src/shared/userMaintenance.mjs` | Use Turso instead of DynamoDB |
| `src/http/get-api-admin-users/index.mjs` | Query Turso |
| `src/http/post-api-admin-users-update/index.mjs` | Update Turso |
| `src/http/post-api-admin-users-disable/index.mjs` | Update Turso, remove Cognito API call |
| `src/http/get-api-users-search/index.mjs` | Query Turso |
| `src/ws/stellar-track/index.mjs` | Parse Better Auth token |
| `client/src/stores/authStore.js` | Use Better Auth session, add `role` field |
| `client/src/router/index.js` | Check `roles` array instead of Cognito groups |
| `client/src/services/serviceHelpers.js` | Use Better Auth token |
| `client/src/services/ws/baseWebSocketService.js` | Use Better Auth token |
| `client/src/pages/public/SignupSignin.vue` | Use new auth service |
| `client/src/layouts/ProtectedLayout.vue` | Check `authStore.roles` |
| `client/src/pages/protected/IndexPage.vue` | Check `authStore.roles` |
| `app.arc` | Add `post /api/auth`, remove users table + sync route |
| `client/.env` | Remove Cognito vars, add Turso vars |
| `client/.env.template` | Same |
| `package.json` (root) | Add `@libsql/client`, `better-auth` |
| `client/package.json` | Remove `amazon-cognito-identity-js` |

### Deleted Files (~4)
| File | Reason |
|------|--------|
| `client/src/services/auth/cognitoService.js` | Replaced by betterAuthService.js |
| `src/shared/cognitoAdmin.mjs` | No longer needed |
| `client/src/services/protected/users/userSyncService.js` | No longer needed |
| `src/http/post-api-users/sync/index.mjs` | No longer needed |

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Turso connection limits | Use connection pooling, set appropriate limits |
| Email delivery (Better Auth needs SMTP) | Configure Resend, SendGrid, or AWS SES for email |
| Admin bootstrap failure | Script is idempotent, logs output, can be re-run safely |

## Estimated Effort

| Phase | Effort |
|-------|--------|
| Phase 1: Infrastructure | 2-3 hours |
| Phase 2: Backend Auth Layer | 6-8 hours |
| Phase 3: Frontend Auth Layer | 4-6 hours |
| Phase 4: Data Migration | 1-2 hours |
| Phase 5: Cleanup & Verification | 3-4 hours |
| **Total** | **14-20 hours** |
