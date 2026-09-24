# Setup Environment Variables Scripts

Interactive scripts for configuring Lambda environment variables across all environments.

## Purpose

These scripts set up the secret environment variables that Lambda functions need to access external services (Turso database, Resend email, etc.). Each script targets a specific environment and uses the appropriate storage mechanism.

## Scripts Overview

| Script | Environment | Storage | Use Case |
|--------|-------------|---------|----------|
| `setup-env-testing.mjs` | Local development | `preferences.arc` | Day-to-day development |
| `setup-env-staging.mjs` | Staging | AWS SSM Parameter Store | Pre-production testing |
| `setup-env-production.mjs` | Production | AWS SSM Parameter Store | Live deployment |

## Environment Variables

All three scripts configure the same variables:

### ARC_APP_SECRET
- **Purpose**: Session encoding secret for Architect
- **Requirements**: Minimum 32 bytes
- **Auto-generated**: Yes (if you press Enter without typing a value)
- **Example**: `ea3cd2bb963e9a3425c6588dd9b3473a2817e291f9ac3e500831f5b71c838a9f`

### TURSO_DATABASE_URL
- **Purpose**: Turso SQLite database connection URL
- **Format**: `libsql://<db-name>-<org>.turso.io`
- **Where to get**: Turso dashboard or `turso db show <db-name>`
- **Example**: `libsql://stellar-nexus-dev-neilhoff.aws-us-east-2.turso.io`

### TURSO_AUTH_TOKEN
- **Purpose**: Authentication token for Turso database
- **Where to get**: Turso dashboard or `turso db tokens create <db-name>`
- **Format**: JWT token
- **Sensitive**: Yes

### RESEND_API_KEY
- **Purpose**: Resend email delivery service API key
- **Where to get**: https://resend.com/api-keys
- **Format**: `re_...`
- **Sensitive**: Yes

## Usage

### Testing (Local Development)

```bash
node scripts/setup-env-testing.mjs
```

**Storage**: Variables are written to `preferences.arc` (gitignored)

**Auto-creates `preferences.arc`** if it doesn't exist with:
```arc
@env
testing
```

**Example session**:
```
StellarNexus environment setup: testing
Vars will be stored via `arc env --add --env testing`

preferences.arc not found. Creating it now...
Created preferences.arc

Session encoding secret (min 32 bytes)
  (enter to generate)
  ARC_APP_SECRET: [press Enter or type value]

Turso SQLite database URL (e.g. libsql://your-db.turso.io)
  TURSO_DATABASE_URL: libsql://my-db.turso.io

...

Values to set:
  ARC_APP_SECRET = ea****9f
  TURSO_DATABASE_URL = libsql://my-db.turso.io
  ...

Proceed? (Y/n): y

  Setting ARC_APP_SECRET... ok
  Setting TURSO_DATABASE_URL... ok
  ...

Done. 4 set, 0 failed, 0 skipped.

Verify: arc env --env testing
```

### Staging

```bash
node scripts/setup-env-staging.mjs
```

**Storage**: Variables are written to AWS SSM Parameter Store

**Requirements**:
- AWS CLI installed and configured
- IAM permissions for `ssm:PutParameter`
- App deployed at least once (`npx arc deploy`)

**Confirmation**: Requires explicit `y` to proceed (default is `N`)

### Production

```bash
node scripts/setup-env-production.mjs
```

**Storage**: Variables are written to AWS SSM Parameter Store

**Requirements**: Same as staging

**Extra caution**: Displays `*** PRODUCTION ENVIRONMENT ***` warning and requires explicit confirmation

## How It Works

### Interactive Flow

1. **Display current vars** - Shows existing values (masked for sensitive data)
2. **Prompt for each var** - One at a time with descriptions
3. **Show summary** - Displays all values to be set (sensitive values masked)
4. **Confirm** - Ask for confirmation before writing
5. **Execute** - Calls `arc env --add --env <env> <name> <value>` for each var
6. **Report results** - Shows success/failure count

### Sensitive Value Masking

Sensitive values are displayed as:
```
ARC_APP_SECRET = ea****9f
```

Only the first 2 and last 2 characters are shown.

### Auto-Generation

`ARC_APP_SECRET` is auto-generated if you press Enter without typing a value:
```javascript
randomBytes(32).toString('hex')  // 64-character hex string
```

## Storage Mechanisms

### preferences.arc (testing)

Local file format:
```arc
@env
testing
  ARC_APP_SECRET ea3cd2bb...
  TURSO_DATABASE_URL libsql://...
  TURSO_AUTH_TOKEN eyJhbGci...
  RESEND_API_KEY re_...
```

**Gitignored**: Yes (see `.gitignore`)

**Read by**: `arc sandbox` automatically loads these vars into Lambda environment

### AWS SSM Parameter Store (staging/production)

Parameter paths:
```
/stellar_nexus/staging/ARC_APP_SECRET
/stellar_nexus/staging/TURSO_DATABASE_URL
...

/stellar_nexus/production/ARC_APP_SECRET
/stellar_nexus/production/TURSO_DATABASE_URL
...
```

**Encryption**: SecureString (KMS-encrypted)

**Read by**: Lambda functions at runtime via `process.env`

## Prerequisites

### All Environments

- Architect CLI installed (`@architect/architect`)
- `app.arc` file exists in project root

### Staging/Production

- AWS CLI installed: `aws --version`
- AWS credentials configured: `aws configure`
- IAM permissions:
  ```json
  {
    "Effect": "Allow",
    "Action": [
      "ssm:PutParameter",
      "ssm:GetParameter",
      "ssm:GetParametersByPath"
    ],
    "Resource": "arn:aws:ssm:*:*:parameter/stellar_nexus/*"
  }
  ```
- App deployed at least once (creates the SSM parameter hierarchy)

## Verification

After running the scripts, verify the variables are set:

```bash
# All environments
arc env

# Specific environment
arc env --env testing
arc env --env staging
arc env --env production
```

## Deployment

After setting staging/production variables, deploy to apply them:

```bash
# Staging
npx arc deploy

# Production
npx arc deploy --production
```

**Note**: Environment variables are injected into Lambda functions at deploy time. Changing them requires a redeploy.

## Workflow

### Initial Local Setup

```bash
# 1. Run onboarding (optional, sets up project metadata)
npm run onboard

# 2. Set up local environment variables
node scripts/setup-env-testing.mjs

# 3. Bootstrap super-admin user
node scripts/bootstrap-users.mjs

# 4. Start development
npm start
```

### Staging Deployment

```bash
# 1. Set up staging environment variables
node scripts/setup-env-staging.mjs

# 2. Deploy to staging
npx arc deploy

# 3. Bootstrap super-admin for staging
node scripts/bootstrap-users.mjs --env staging
```

### Production Deployment

```bash
# 1. Set up production environment variables
node scripts/setup-env-production.mjs

# 2. Deploy to production
npx arc deploy --production

# 3. Bootstrap super-admin for production
node scripts/bootstrap-users.mjs --env production
```

## Troubleshooting

### "arc: command not found"

Install Architect CLI:
```bash
npm install -g @architect/architect
```

### "preferences.arc not found" (testing)

The script auto-creates it. If that fails, create manually:
```bash
echo "@env" > preferences.arc
echo "testing" >> preferences.arc
```

### "Could not read existing vars" (staging/production)

Check AWS credentials:
```bash
aws sts get-caller-identity
```

Ensure you have SSM read permissions.

### "AccessDenied" when setting vars (staging/production)

Verify IAM permissions include `ssm:PutParameter` for the parameter path.

### Variables not available in Lambda

Redeploy after setting variables:
```bash
npx arc deploy          # staging
npx arc deploy --production  # production
```

### "App not found" errors

Deploy the app at least once before setting environment variables:
```bash
npx arc deploy
```

## Manual Commands

If you prefer not to use the interactive scripts, you can set variables manually:

```bash
# Testing
arc env --add --env testing ARC_APP_SECRET "your-secret"
arc env --add --env testing TURSO_DATABASE_URL "libsql://..."

# Staging
arc env --add --env staging ARC_APP_SECRET "your-secret"
arc env --add --env staging TURSO_DATABASE_URL "libsql://..."

# Production
arc env --add --env production ARC_APP_SECRET "your-secret"
arc env --add --env production TURSO_DATABASE_URL "libsql://..."
```

See [ArchitectEnvironmentVariables.md](../../ArchitectEnvironmentVariables.md) for the complete command reference.

## Security Notes

- **Never commit** `preferences.arc` or `.env` files with real values
- **Sensitive values** are masked in script output
- **SSM encryption** uses AWS KMS for staging/production
- **ARC_APP_SECRET** must be at least 32 bytes for session security
- **Rotate secrets** periodically by re-running the scripts with new values

## Related Documentation

- [Onboard Script](./onboard.md) - Initial project setup
- [Bootstrap Users](./bootstrap-users.md) - Create initial super-admin
- [ArchitectEnvironmentVariables.md](../../ArchitectEnvironmentVariables.md) - Command reference
- [AGENTS.md](../../AGENTS.md#environment-variables-lambda-secrets) - Environment variable policy
