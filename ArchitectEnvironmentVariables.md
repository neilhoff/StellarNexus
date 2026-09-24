# Architect Environment Variables

Reference for all Lambda environment variables managed via `arc env`.
See [AGENTS.md](./AGENTS.md#environment-variables-lambda-secrets) for policy.

Commands are grouped by environment. Copy individual commands to run them standalone.

## Reserved Names

These cannot be set by the app: `ARC_ENV`, `ARC_APP_NAME`, `ARC_SESSION_TABLE_NAME`.

## Required Variables

| Variable | Description | Notes |
|---|---|---|
| `ARC_APP_SECRET` | Session encoding secret | Min 32 bytes |
| `TURSO_DATABASE_URL` | Turso SQLite database URL | |
| `TURSO_AUTH_TOKEN` | Turso database auth token | |
| `RESEND_API_KEY` | Resend email API key | |

---

## Testing (Local Sandbox)

Vars stored in `preferences.arc` (gitignored).

```sh
arc env --add --env testing ARC_APP_SECRET "your-secret-min-32-bytes"
arc env --add --env testing TURSO_DATABASE_URL "libsql://your-db.turso.io"
arc env --add --env testing TURSO_AUTH_TOKEN "your-turso-auth-token"
arc env --add --env testing RESEND_API_KEY "re_your_resend_key"
```

Interactive setup: `node scripts/setup-env-testing.mjs`

---

## Staging (AWS SSM)

Vars stored in AWS SSM Parameter Store. Requires AWS credentials with SSM access.

```sh
arc env --add --env staging ARC_APP_SECRET "your-secret-min-32-bytes"
arc env --add --env staging TURSO_DATABASE_URL "libsql://your-db.turso.io"
arc env --add --env staging TURSO_AUTH_TOKEN "your-turso-auth-token"
arc env --add --env staging RESEND_API_KEY "re_your_resend_key"
```

Interactive setup: `node scripts/setup-env-staging.mjs`

---

## Production (AWS SSM)

Vars stored in AWS SSM Parameter Store. Requires AWS credentials with SSM access.

```sh
arc env --add --env production ARC_APP_SECRET "your-secret-min-32-bytes"
arc env --add --env production TURSO_DATABASE_URL "libsql://your-db.turso.io"
arc env --add --env production TURSO_AUTH_TOKEN "your-turso-auth-token"
arc env --add --env production RESEND_API_KEY "re_your_resend_key"
```

Interactive setup: `node scripts/setup-env-production.mjs`

---

## Utility Commands

```sh
# List all vars across all environments
arc env

# List vars for one environment
arc env --env testing
arc env --env staging
arc env --env production

# Remove a var
arc env --remove --env testing TURSO_DATABASE_URL
arc env --remove --env staging TURSO_DATABASE_URL
arc env --remove --env production TURSO_DATABASE_URL
```
