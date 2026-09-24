# Onboard Script

Interactive script for setting up a new StellarNexus project from the template.

## Purpose

The onboard script handles initial project configuration when you're starting a new site from the StellarNexus template. It updates project metadata, configures authentication credentials, and prepares the development environment.

## Usage

```bash
npm run onboard
# or
node scripts/onboard.mjs
```

### Dry Run Mode

Preview changes without modifying files:

```bash
node scripts/onboard.mjs --dry-run
```

## What It Does

### 1. Project Metadata Updates

Prompts for and updates:
- **Site display name** - Human-readable project name
- **App identifier** - npm-safe kebab-case name (e.g., `my-awesome-app`)
- **Architect app name** - snake_case name for `app.arc` (e.g., `my_awesome_app`)
- **Project description** - Brief description for package.json
- **Author information** - Name and email

Files modified:
- `package.json` (root)
- `client/package.json`
- `app.arc` (@app name, AWS profile, region)

### 2. AWS Configuration

Prompts for:
- **AWS profile** - AWS credentials profile name (default: `default`)
- **AWS region** - AWS region for deployment (default: `us-west-2`)

Updates `app.arc` with:
```arc
@aws
profile <your-profile>
region <your-region>
```

### 3. Authentication Setup

Prompts for Better Auth + Turso credentials:
- **Turso database URL** - e.g., `libsql://your-db.turso.io`
- **Turso auth token** - Database authentication token
- **Resend API key** - Email delivery service key (e.g., `re_...`)

These are written to `client/.env` files for local development.

### 4. Super-Admin Bootstrap (Optional)

Optionally bootstraps the initial super-admin user:
- Prompts for email, name, and password
- Runs `scripts/bootstrap-users.mjs` with the provided credentials
- Creates a user with `["user","super-admin"]` roles

### 5. Environment Verification (Optional)

Checks for required tools:
- Node.js
- npm
- Architect CLI
- Quasar CLI
- Turso CLI

### 6. Dependency Installation (Optional)

Runs:
- `npm install` (root)
- `npm install` (client)
- `arc hydrate`

## Files Modified

The script creates backups (`.bak-<timestamp>`) before modifying:

- `package.json`
- `client/package.json`
- `app.arc`
- `client/.env`
- `client/.env.template`
- `client/.env.dev`
- `client/.env.staging`
- `client/.env.prod`
- `Readme.md` (title update only)

## Prerequisites

- Node.js and npm installed
- Architect CLI (`npm install -g @architect/architect`)
- Quasar CLI (installed in client/)
- Turso CLI (for database setup)
- AWS credentials configured (for deployment)

## Important Notes

### Idempotency

The script is designed to be run multiple times safely. It:
- Creates backups before each modification
- Updates existing values rather than duplicating them
- Can be re-run if you need to change configuration

### Environment Variables

The script writes authentication credentials to `client/.env` files. These are:
- **Local only** - `.env` is gitignored
- **For development** - Production credentials should be set via `arc env` (see `setup-env.md`)

### Next Steps

After running onboard:

1. **Review changes** - Check modified files and backups
2. **Set up Turso database** - If not already done:
   ```bash
   turso db create <your-db-name>
   turso db show <your-db-name>  # Get URL and token
   ```
3. **Run environment setup** - Set Lambda environment variables:
   ```bash
   node scripts/setup-env-testing.mjs
   ```
4. **Start development**:
   ```bash
   npm start
   ```

## Troubleshooting

### "Run this script from the project root"

Ensure you're in the directory containing `package.json`, `client/`, and `app.arc`.

### Environment verification fails

Install missing tools:
- Architect: `npm install -g @architect/architect`
- Turso: Follow instructions at https://turso.tech
- Quasar: Installed automatically in `client/node_modules`

### AWS credentials not found

Configure AWS CLI:
```bash
aws configure
```

Or set AWS_PROFILE environment variable:
```bash
export AWS_PROFILE=your-profile-name
```

## Related Documentation

- [Bootstrap Users](./bootstrap-users.md) - Create initial super-admin
- [Setup Environment Variables](./setup-env.md) - Configure Lambda environment variables
- [AGENTS.md](../../AGENTS.md) - Project conventions and workflows
