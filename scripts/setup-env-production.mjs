/**
 * Interactive setup for Lambda environment variables in the production environment.
 *
 * Uses `arc env --add --env production` to store vars in AWS SSM Parameter Store.
 * Requires AWS credentials with SSM write access.
 *
 * Usage:
 *   node scripts/setup-env-production.mjs
 */

import { spawnSync } from 'node:child_process'
import { createInterface } from 'node:readline/promises'
import { stdin as input, stdout as output } from 'node:process'
import { randomBytes } from 'node:crypto'

const ENVIRONMENT = 'production'

const VARIABLES = [
  {
    name: 'ARC_APP_SECRET',
    description: 'Session encoding secret (min 32 bytes)',
    generateDefault: function () { return randomBytes(32).toString('hex') },
    sensitive: true
  },
  {
    name: 'TURSO_DATABASE_URL',
    description: 'Turso SQLite database URL (e.g. libsql://your-db.turso.io)',
    generateDefault: function () { return '' },
    sensitive: false
  },
  {
    name: 'TURSO_AUTH_TOKEN',
    description: 'Turso database auth token',
    generateDefault: function () { return '' },
    sensitive: true
  },
  {
    name: 'RESEND_API_KEY',
    description: 'Resend email API key (e.g. re_...)',
    generateDefault: function () { return '' },
    sensitive: true
  }
]

function runArcEnv (name, value) {
  const result = spawnSync('npx', ['arc', 'env', '--add', '--env', ENVIRONMENT, name, value], {
    shell: process.platform === 'win32',
    encoding: 'utf8',
    stdio: ['pipe', 'pipe', 'pipe']
  })

  return {
    ok: result.status === 0,
    stdout: (result.stdout || '').trim(),
    stderr: (result.stderr || '').trim()
  }
}

function maskValue (value) {
  if (!value || value.length <= 4) return '****'
  return value.slice(0, 2) + '*'.repeat(value.length - 4) + value.slice(-2)
}

async function main () {
  const rl = createInterface({ input, output })

  try {
    console.log(`\nStellarNexus environment setup: ${ENVIRONMENT}`)
    console.log(`Vars will be stored in AWS SSM via \`arc env --add --env ${ENVIRONMENT}\``)
    console.log('Requires valid AWS credentials with SSM access.')
    console.log('*** PRODUCTION ENVIRONMENT ***\n')

    const existingResult = spawnSync('npx', ['arc', 'env', '--env', ENVIRONMENT], {
      shell: process.platform === 'win32',
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe']
    })

    if (existingResult.status === 0 && existingResult.stdout.trim()) {
      console.log('Current vars:')
      console.log(existingResult.stdout.trim())
      console.log()
    } else {
      console.log('(Could not read existing vars. Check AWS credentials.)\n')
    }

    const values = {}

    for (const variable of VARIABLES) {
      const defaultValue = variable.generateDefault()
      const hint = defaultValue ? ` (enter to generate)` : ''
      const prompt = `${variable.description}${hint}\n  ${variable.name}: `
      const answer = (await rl.question(prompt)).trim()
      values[variable.name] = answer || defaultValue
    }

    console.log('\nValues to set:')
    for (const variable of VARIABLES) {
      const display = variable.sensitive ? maskValue(values[variable.name]) : values[variable.name]
      console.log(`  ${variable.name} = ${display || '(empty)'}`)
    }

    const confirm = (await rl.question(`\n*** PRODUCTION *** Write to AWS SSM? (y/N): `)).trim().toLowerCase()
    if (confirm !== 'y' && confirm !== 'yes') {
      console.log('\nCancelled. No vars were set.')
      return
    }

    console.log()
    let successCount = 0
    let failCount = 0

    for (const variable of VARIABLES) {
      const value = values[variable.name]
      if (!value) {
        console.log(`  SKIP ${variable.name} (empty)`)
        continue
      }

      process.stdout.write(`  Setting ${variable.name}... `)
      const result = runArcEnv(variable.name, value)

      if (result.ok) {
        console.log('ok')
        successCount++
      } else {
        console.log('FAILED')
        if (result.stderr) console.log(`    ${result.stderr}`)
        if (result.stdout) console.log(`    ${result.stdout}`)
        failCount++
      }
    }

    console.log(`\nDone. ${successCount} set, ${failCount} failed, ${VARIABLES.length - successCount - failCount} skipped.`)

    if (successCount > 0) {
      console.log(`\nVerify: arc env --env ${ENVIRONMENT}`)
      console.log('Deploy to apply: npx arc deploy production')
    }
  } catch (error) {
    console.error('\nSetup failed:', error.message || error)
    process.exitCode = 1
  } finally {
    rl.close()
  }
}

main()
