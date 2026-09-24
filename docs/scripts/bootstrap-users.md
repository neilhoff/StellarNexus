# Bootstrap Users Script

Creates the initial super-admin user for a new StellarNexus site.

## Purpose

Every StellarNexus deployment needs at least one super-admin user to manage the system. This script creates that initial user with full administrative privileges. It's designed to be run once per environment (testing, staging, production) during initial setup.

## Usage

```bash
# Local development (default)
node scripts/bootstrap-users.mjs

# Staging environment
node scripts/bootstrap-users.mjs --env staging

# Production environment
node scripts/bootstrap-users.mjs --env production
```

## Environment Sources

The script reads Turso credentials from `preferences.arc` (local file, gitignored):
```
TURSO_DATABASE_URL
TURSO_AUTH_TOKEN
```

This file is created by `setup-env-testing.mjs`, `setup-env-staging.mjs`, or `setup-env-production.mjs`. All environments (testing, staging, production) are stored in the same `preferences.arc` file under different sections.

## Interactive Prompts

The script prompts for:

1. **Email** (required)
   - Normalized to lowercase
   - Must be unique in the database

2. **Password** (required)
   - Hashed using bcrypt via Better Auth
   - Never stored in plaintext

3. **Display name** (optional)
   - Defaults to email if not provided
   - Used for UI display

## What It Does

### For New Users

1. Generates a UUID for the user
2. Hashes the password using `better-auth/crypto`
3. Inserts a record into the `user` table with:
   - `roles`: `["user","super-admin"]`
   - `disabled`: `0` (active)
   - `email_verified`: `1`
4. Creates an initial session with:
   - 7-day expiration
   - Random session token

### For Existing Users

If the email already exists:
1. Updates the user's roles to include `super-admin`
2. Updates the display name
3. Does **not** change the password

This makes the script **idempotent** - safe to run multiple times.

## Database Schema

The script writes to two tables:

### user table
```sql
INSERT INTO user (
  id, 
  email, 
  email_verified, 
  name, 
  image, 
  roles, 
  disabled, 
  disabled_at, 
  disabled_by, 
  created_at, 
  updated_at, 
  last_sign_in_at
) VALUES (...)
```

### session table
```sql
INSERT INTO session (
  id, 
  user_id, 
  token, 
  expires_at, 
  created_at, 
  updated_at
) VALUES (...)
```

See [User Data Model](../dataModels/users.md) for full schema details.

## Output

On success, the script outputs:
```
=== Stellar Nexus User Bootstrap (testing) ===

Email: admin@example.com
Password: ********
Display name (default: admin@example.com): Admin User

Created super-admin user: admin@example.com
Display name: Admin User
Session token: abc123-def456-...

Bootstrap complete!
```

The session token can be used for immediate login if needed.

## Prerequisites

- Turso database created and accessible
- Database schema applied (auto-created by this script if needed)
- Environment variables set via setup scripts (see [Setup Environment Variables](./setup-env.md))

## Security Considerations

### Password Storage

Passwords are hashed using bcrypt via Better Auth's crypto utilities. The hash is stored in the database, never the plaintext password.

### Role Assignment

The script grants `super-admin` role, which has full administrative access:
- Can manage other users
- Can grant/revoke admin roles
- Can access all admin APIs

**Important:** After bootstrap, use the admin UI or APIs to grant roles. Don't run this script for every admin user.

### Audit Trail

The script sets:
- `disabled_at`: NULL (user is active)
- `disabled_by`: NULL (not disabled)

For production deployments, consider adding audit logging to track who ran the bootstrap and when.

## Troubleshooting

### "TURSO_DATABASE_URL not found"

Run the appropriate setup script first:
```bash
node scripts/setup-env-testing.mjs    # for testing
node scripts/setup-env-staging.mjs    # for staging
node scripts/setup-env-production.mjs # for production
```

### "Table 'user' doesn't exist"

Apply the database schema:
```bash
turso db shell <your-db-name> < scripts/auth-schema.sql
```

### "User already exists"

The script will update the existing user's roles to include `super-admin`. This is expected behavior for re-running the script.

## Workflow Example

### Local Development

```bash
# 1. Set up environment variables
node scripts/setup-env-testing.mjs

# 2. Apply database schema (if needed)
turso db shell stellar-nexus-dev < scripts/auth-schema.sql

# 3. Bootstrap super-admin
node scripts/bootstrap-users.mjs

# 4. Start development server
npm start
```

### Staging Deployment

```bash
# 1. Set up staging environment variables
node scripts/setup-env-staging.mjs

# 2. Deploy to AWS
npx arc deploy

# 3. Bootstrap super-admin (reads from SSM)
node scripts/bootstrap-users.mjs --env staging
```

### Production Deployment

```bash
# 1. Set up production environment variables
node scripts/setup-env-production.mjs

# 2. Deploy to AWS
npx arc deploy --production

# 3. Bootstrap super-admin (reads from SSM)
node scripts/bootstrap-users.mjs --env production
```

## Related Documentation

- [Onboard Script](./onboard.md) - Initial project setup
- [Setup Environment Variables](./setup-env.md) - Configure Lambda secrets
- [User Data Model](../dataModels/users.md) - Database schema details
- [AGENTS.md](../../AGENTS.md#template-bootstrap-new-site) - Bootstrap policy
