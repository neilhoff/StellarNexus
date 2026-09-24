/**
 * Bootstrap script for creating the initial super-admin user in Turso.
 *
 * Usage:
 *   node scripts/bootstrap-users.mjs [--env testing|staging|production]
 *
 * Environment:
 *   - Reads from preferences.arc (all environments stored locally)
 *   - testing (default): uses testing section
 *   - staging: uses staging section
 *   - production: uses production section
 *
 * Interactive prompts:
 *   - Email (required)
 *   - Password (required)
 *   - Display name (optional, defaults to email)
 *
 * This script is idempotent - running it again with the same email will
 * update the existing user's roles to include super-admin.
 */

import { createClient } from '@libsql/client'
import { readFileSync, existsSync } from 'fs'
import { hashPassword } from 'better-auth/crypto'
import readline from 'readline'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

function ask (question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => resolve(answer))
  })
}

function parsePreferencesArc (filePath, envName) {
  if (!existsSync(filePath)) return {}

  const content = readFileSync(filePath, 'utf8')
  const lines = content.split(/\r?\n/)
  const vars = {}
  let inTargetSection = false

  for (const line of lines) {
    const trimmed = line.trim()

    // Start of target environment section
    if (trimmed === envName) {
      inTargetSection = true
      continue
    }

    // End of section (new section or comment)
    if (inTargetSection && (trimmed === 'testing' || trimmed === 'staging' || trimmed === 'production' || trimmed.startsWith('@'))) {
      inTargetSection = false
      continue
    }

    // Parse key-value pairs in target section
    if (inTargetSection && trimmed && !trimmed.startsWith('#')) {
      const parts = trimmed.split(/\s+/)
      if (parts.length >= 2) {
        vars[parts[0]] = parts.slice(1).join(' ')
      }
    }
  }

  return vars
}

async function ensureSchema (db) {
  const schemaPath = join(__dirname, 'auth-schema.sql')
  
  if (!existsSync(schemaPath)) {
    console.error('Warning: auth-schema.sql not found, assuming tables exist')
    return
  }

  console.log('Reading schema from:', schemaPath)
  const schema = readFileSync(schemaPath, 'utf8')
  
  // Split by semicolon and process each statement
  const statements = schema
    .split(';')
    .map(s => {
      // Remove comment lines (lines starting with --)
      return s.split('\n')
        .filter(line => !line.trim().startsWith('--'))
        .join('\n')
        .trim()
    })
    .filter(s => s.length > 0)

  console.log(`Found ${statements.length} schema statements to execute`)
  
  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i]
    try {
      await db.execute({ sql: statement, args: [] })
      // Log what was created (first line of statement)
      const firstLine = statement.split('\n')[0].substring(0, 60)
      console.log(`  ✓ ${firstLine}...`)
    } catch (err) {
      // Only log errors for statements without IF NOT EXISTS
      if (!statement.includes('IF NOT EXISTS')) {
        console.error(`  ✗ Schema error on statement ${i + 1}:`, err.message)
        console.error('    Statement:', statement.substring(0, 100))
      }
    }
  }
}

async function bootstrap () {
  const args = process.argv.slice(2)
  const envIndex = args.indexOf('--env')
  const envName = envIndex !== -1 ? args[envIndex + 1] : 'testing'

  let databaseUrl = process.env.TURSO_DATABASE_URL
  let authToken = process.env.TURSO_AUTH_TOKEN

  if (!databaseUrl) {
    const prefs = parsePreferencesArc('preferences.arc', envName)
    databaseUrl = prefs.TURSO_DATABASE_URL
    authToken = prefs.TURSO_AUTH_TOKEN
  }

  if (!databaseUrl) {
    console.error('Error: TURSO_DATABASE_URL not found')
    console.error(`Environment: ${envName}`)
    console.error(`Run \`node scripts/setup-env-${envName}.mjs\` first, or set TURSO_DATABASE_URL env var`)
    process.exit(1)
  }

  console.log(`=== Stellar Nexus User Bootstrap (${envName}) ===\n`)

  const email = (await ask('Email: ')).trim().toLowerCase()
  if (!email) {
    console.error('Error: Email is required')
    process.exit(1)
  }

  const password = await ask('Password: ')
  if (!password) {
    console.error('Error: Password is required')
    process.exit(1)
  }

  const name = (await ask(`Display name (default: ${email}): `)).trim() || email

  const db = createClient({
    url: databaseUrl,
    authToken: authToken || undefined
  })

  // Ensure database schema exists
  console.log('Ensuring database schema exists...')
  await ensureSchema(db)

  // Check if user already exists
  const existing = await db.execute({
    sql: 'SELECT id, email, name, roles FROM user WHERE email = ?',
    args: [email]
  })

  const nowIso = new Date().toISOString()
  const passwordHash = await hashPassword(password)

  if (existing.rows && existing.rows.length > 0) {
    const user = existing.rows[0]
    console.log(`\nUser already exists: ${user.email}`)
    console.log(`Current roles: ${user.roles}`)

    // Update to super-admin
    await db.execute({
      sql: 'UPDATE user SET roles = ?, name = ?, updated_at = ? WHERE email = ?',
      args: ['["user","super-admin"]', name, nowIso, email]
    })

    console.log(`\nUpdated ${email} to super-admin role`)
  } else {
    const userId = crypto.randomUUID()

    await db.execute({
      sql: `INSERT INTO user (id, email, email_verified, name, image, roles, disabled, disabled_at, disabled_by, created_at, updated_at, last_sign_in_at)
            VALUES (?, ?, 1, ?, NULL, ?, 0, NULL, NULL, ?, ?, ?)`,
      args: [userId, email, name, '["user","super-admin"]', nowIso, nowIso, nowIso]
    })

    console.log(`\nCreated super-admin user: ${email}`)
    console.log(`Display name: ${name}`)
  }

  console.log('\nBootstrap complete!')
  rl.close()
}

bootstrap().catch((err) => {
  console.error('Bootstrap failed:', err)
  rl.close()
  process.exit(1)
})
