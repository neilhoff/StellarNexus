#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import { spawnSync } from 'node:child_process'
import { createInterface } from 'node:readline/promises'
import { stdin as input, stdout as output } from 'node:process'

const ROOT_DIR = process.cwd()
const CLIENT_DIR = path.join(ROOT_DIR, 'client')

function fileExists(filePath) {
  return fs.existsSync(filePath)
}

function readText(filePath) {
  return fs.readFileSync(filePath, 'utf8')
}

function writeText(filePath, content) {
  fs.writeFileSync(filePath, content, 'utf8')
}

function readJson(filePath) {
  return JSON.parse(readText(filePath))
}

function writeJson(filePath, value) {
  const formatted = `${JSON.stringify(value, null, 2)}\n`
  writeText(filePath, formatted)
}

function toKebabCase(value) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function toSnakeCase(value) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
}

function toDisplayName(value) {
  const trimmed = value.trim()
  if (!trimmed) return trimmed
  return trimmed
    .split(/\s+/)
    .map((part) => `${part.slice(0, 1).toUpperCase()}${part.slice(1)}`)
    .join(' ')
}

function parseAuthor(value) {
  if (!value) return { name: '', email: '' }
  const trimmed = `${value}`.trim()
  const match = trimmed.match(/^(.+?)\s*<([^>]+)>$/)
  if (!match) {
    return { name: trimmed, email: '' }
  }

  return {
    name: match[1].trim(),
    email: match[2].trim()
  }
}

function formatAuthor(name, email) {
  const safeName = `${name || ''}`.trim()
  const safeEmail = `${email || ''}`.trim()
  if (!safeName && !safeEmail) return ''
  if (safeName && safeEmail) return `${safeName} <${safeEmail}>`
  return safeName || safeEmail
}

function parseAppArc(content) {
  const lines = content.split(/\r?\n/)
  let appName = ''
  let profile = ''
  let region = ''

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i].trim()
    if (line === '@app' && i + 1 < lines.length) {
      appName = (lines[i + 1] || '').trim()
    }
    if (line.startsWith('profile ')) {
      profile = line.replace(/^profile\s+/, '').trim()
    }
    if (line.startsWith('region ')) {
      region = line.replace(/^region\s+/, '').trim()
    }
  }

  return { appName, profile, region }
}

function updateAppArc(content, updates) {
  const lines = content.split(/\r?\n/)

  for (let i = 0; i < lines.length; i += 1) {
    const trimmed = lines[i].trim()
    if (trimmed === '@app' && i + 1 < lines.length && updates.appName) {
      lines[i + 1] = updates.appName
    }
    if (trimmed.startsWith('profile ') && updates.profile) {
      lines[i] = `profile ${updates.profile}`
    }
    if (trimmed.startsWith('region ') && updates.region) {
      lines[i] = `region ${updates.region}`
    }
  }

  return `${lines.join('\n')}\n`
}

function upsertEnvVars(content, variables) {
  const lines = content.split(/\r?\n/)
  const nextLines = []
  const touched = new Set()

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i]
    if (!line.includes('=')) {
      nextLines.push(line)
      continue
    }

    const key = line.split('=')[0].trim()
    if (Object.prototype.hasOwnProperty.call(variables, key)) {
      const value = variables[key] ?? ''
      nextLines.push(`${key}=${value}`)
      touched.add(key)
    } else {
      nextLines.push(line)
    }
  }

  const remainingKeys = Object.keys(variables).filter((key) => !touched.has(key))
  if (remainingKeys.length > 0 && nextLines.length > 0 && nextLines[nextLines.length - 1] !== '') {
    nextLines.push('')
  }

  for (let i = 0; i < remainingKeys.length; i += 1) {
    const key = remainingKeys[i]
    nextLines.push(`${key}=${variables[key] ?? ''}`)
  }

  return `${nextLines.join('\n')}\n`
}

function parseEnvVars(content) {
  const variables = {}
  const lines = content.split(/\r?\n/)

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i].trim()
    if (!line || line.startsWith('#') || !line.includes('=')) continue
    const separatorIndex = line.indexOf('=')
    const key = line.slice(0, separatorIndex).trim()
    const value = line.slice(separatorIndex + 1).trim()
    variables[key] = value
  }

  return variables
}

function backupFile(filePath) {
  if (!fileExists(filePath)) return null
  const stamp = new Date().toISOString().replace(/[:.]/g, '-')
  const backupPath = `${filePath}.bak-${stamp}`
  fs.copyFileSync(filePath, backupPath)
  return backupPath
}

function loadExistingEnvDefaults(envFilePaths) {
  const merged = {}

  for (let i = 0; i < envFilePaths.length; i += 1) {
    const envFile = envFilePaths[i]
    if (!fileExists(envFile)) continue
    const parsed = parseEnvVars(readText(envFile))
    Object.assign(merged, parsed)
  }

  return merged
}

function runCommand(command, args, cwd = ROOT_DIR) {
  const result = spawnSync(command, args, {
    cwd,
    shell: process.platform === 'win32',
    encoding: 'utf8'
  })

  return {
    ok: result.status === 0,
    status: result.status,
    stdout: result.stdout || '',
    stderr: result.stderr || ''
  }
}

function checkDevEnvironment() {
  const checks = [
    {
      label: 'Node.js',
      command: 'node',
      args: ['-v']
    },
    {
      label: 'npm',
      command: 'npm',
      args: ['-v']
    },
    {
      label: 'Architect CLI',
      command: 'npx',
      args: ['arc', '--version']
    },
    {
      label: 'Quasar CLI',
      command: 'npx',
      args: ['quasar', '--version'],
      cwd: CLIENT_DIR
    },
    {
      label: 'Turso CLI',
      command: 'turso',
      args: ['--version']
    }
  ]

  const results = []
  for (let i = 0; i < checks.length; i += 1) {
    const check = checks[i]
    const result = runCommand(check.command, check.args, check.cwd || ROOT_DIR)
    results.push({
      ...check,
      ...result
    })
  }

  return results
}

function printEnvironmentResults(results) {
  console.log('\nEnvironment verification:')
  for (let i = 0; i < results.length; i += 1) {
    const item = results[i]
    const icon = item.ok ? '✅' : '❌'
    const summary = item.ok
      ? (item.stdout || item.stderr).trim().split(/\r?\n/)[0]
      : (item.stderr || item.stdout || 'not available').trim().split(/\r?\n/)[0]
    console.log(`  ${icon} ${item.label}: ${summary || 'ok'}`)
  }
}

function parseYesNo(inputValue, defaultValue) {
  const normalized = `${inputValue || ''}`.trim().toLowerCase()
  if (!normalized) return defaultValue
  if (['y', 'yes'].includes(normalized)) return true
  if (['n', 'no'].includes(normalized)) return false
  return defaultValue
}

async function ask(rl, question, defaultValue = '') {
  const suffix = defaultValue ? ` (${defaultValue})` : ''
  const answer = await rl.question(`${question}${suffix}: `)
  const trimmed = `${answer || ''}`.trim()
  return trimmed || defaultValue
}

async function askYesNo(rl, question, defaultValue = true) {
  const suffix = defaultValue ? ' (Y/n)' : ' (y/N)'
  const answer = await rl.question(`${question}${suffix}: `)
  return parseYesNo(answer, defaultValue)
}

async function main() {
  const rl = createInterface({ input, output })

  try {
    const args = new Set(process.argv.slice(2))
    const dryRun = args.has('--dry-run')

    const rootPackagePath = path.join(ROOT_DIR, 'package.json')
    const clientPackagePath = path.join(CLIENT_DIR, 'package.json')
    const appArcPath = path.join(ROOT_DIR, 'app.arc')
    const envFilePaths = [
      path.join(CLIENT_DIR, '.env'),
      path.join(CLIENT_DIR, '.env.template'),
      path.join(CLIENT_DIR, '.env.dev'),
      path.join(CLIENT_DIR, '.env.staging'),
      path.join(CLIENT_DIR, '.env.prod')
    ]

    if (!fileExists(rootPackagePath) || !fileExists(clientPackagePath) || !fileExists(appArcPath)) {
      throw new Error('Run this script from the project root where package.json, client/package.json, and app.arc exist')
    }

    const rootPackage = readJson(rootPackagePath)
    const clientPackage = readJson(clientPackagePath)
    const appArcText = readText(appArcPath)
    const appArcMeta = parseAppArc(appArcText)
    const existingEnv = loadExistingEnvDefaults(envFilePaths)

    console.log('\nStellarNexus onboarding')
    console.log('This script updates project metadata, verifies tooling, and configures auth bootstrap.\n')

    const siteDisplayNameInput = await ask(rl, 'Site display name', clientPackage.productName || 'StellarNexus')
    const siteDisplayName = toDisplayName(siteDisplayNameInput)
    const appIdentifierInput = await ask(rl, 'App identifier (npm-safe, lowercase)', toKebabCase(siteDisplayName))
    const appIdentifier = toKebabCase(appIdentifierInput)
    const appArcName = await ask(rl, 'Architect @app name (snake_case)', appArcMeta.appName || toSnakeCase(siteDisplayName))
    const siteDescription = await ask(rl, 'Project description', `${siteDisplayName} App`)
    const authorDefaults = parseAuthor(clientPackage.author || rootPackage.author || '')
    const authorName = await ask(rl, 'Author name', authorDefaults.name)
    const authorEmail = await ask(rl, 'Author email', authorDefaults.email)
    const author = formatAuthor(authorName, authorEmail)

    const awsProfile = await ask(rl, 'AWS profile', appArcMeta.profile || 'default')
    const awsRegion = await ask(rl, 'AWS region', appArcMeta.region || 'us-west-2')

    const verifyEnvironment = await askYesNo(rl, 'Verify local development environment now?', true)
    let environmentResults = []
    if (verifyEnvironment) {
      environmentResults = checkDevEnvironment()
      printEnvironmentResults(environmentResults)
    }

    console.log('\nAuthentication setup (Better Auth + Turso SQLite)')
    console.log('You will need:')
    console.log('  - Turso database URL and auth token (create at https://turso.tech)')
    console.log('  - Resend API key for email delivery (create at https://resend.com)')

    const configureAuth = await askYesNo(rl, 'Configure authentication now?', true)

    let tursoDatabaseUrl = ''
    let tursoAuthToken = ''
    let resendApiKey = ''

    if (configureAuth) {
      tursoDatabaseUrl = await ask(rl, 'Turso database URL', existingEnv.TURSO_DATABASE_URL || '')
      tursoAuthToken = await ask(rl, 'Turso auth token', existingEnv.TURSO_AUTH_TOKEN || '')
      resendApiKey = await ask(rl, 'Resend API key', existingEnv.RESEND_API_KEY || '')

      if (!tursoDatabaseUrl || !tursoAuthToken) {
        console.log('\n⚠ Turso credentials are required for authentication to work.')
        console.log('Create a database at https://turso.tech and get your URL and token.')
        console.log('Run: turso db create stellar-nexus-dev')
      }

      if (!resendApiKey) {
        console.log('\n⚠ Resend API key is required for email verification.')
        console.log('Sign up at https://resend.com and get your API key.')
      }

      const bootstrapSuperAdmin = await askYesNo(rl, 'Bootstrap initial super-admin user after setup?', true)
      if (bootstrapSuperAdmin && tursoDatabaseUrl && tursoAuthToken) {
        const superAdminEmail = await ask(rl, 'Super-admin email')
        const superAdminName = await ask(rl, 'Super-admin name', '')
        const superAdminPassword = await ask(rl, 'Super-admin password', '')

        if (superAdminEmail && superAdminPassword) {
          console.log('\nTo bootstrap the super-admin, run:')
          console.log(`  TURSO_DATABASE_URL=${tursoDatabaseUrl} TURSO_AUTH_TOKEN=${tursoAuthToken} node scripts/bootstrap-users.mjs`)
          console.log('Then follow the prompts to create the initial user.')
        }
      }
    } else {
      tursoDatabaseUrl = existingEnv.TURSO_DATABASE_URL || ''
      tursoAuthToken = existingEnv.TURSO_AUTH_TOKEN || ''
      resendApiKey = existingEnv.RESEND_API_KEY || ''
    }

    const normalizedArcName = toSnakeCase(appArcName)

    console.log('\nPlanned updates:')
    console.log(`  - package.json name: ${rootPackage.name} -> ${appIdentifier}`)
    console.log(`  - package.json description: ${rootPackage.description} -> ${siteDescription}`)
    console.log(`  - client/package.json productName: ${clientPackage.productName} -> ${siteDisplayName}`)
    console.log(`  - app.arc @app: ${appArcMeta.appName} -> ${normalizedArcName}`)
    console.log(`  - app.arc aws profile/region: ${appArcMeta.profile}/${appArcMeta.region} -> ${awsProfile}/${awsRegion}`)
    if (dryRun) {
      console.log('\nDry run mode enabled. No files will be changed.')
      return
    }

    const applyChanges = await askYesNo(rl, 'Apply these changes to files?', true)
    if (!applyChanges) {
      console.log('\nNo files were changed.')
      return
    }

    const filesToBackup = [
      rootPackagePath,
      clientPackagePath,
      appArcPath,
      path.join(ROOT_DIR, 'Readme.md'),
      ...envFilePaths
    ]
    const backupPaths = []
    for (let i = 0; i < filesToBackup.length; i += 1) {
      const backupPath = backupFile(filesToBackup[i])
      if (backupPath) backupPaths.push(backupPath)
    }

    rootPackage.name = appIdentifier
    rootPackage.description = siteDescription
    if (author) {
      rootPackage.author = author
    }
    writeJson(rootPackagePath, rootPackage)

    clientPackage.productName = siteDisplayName
    clientPackage.description = `${siteDisplayName} Template`
    if (author) {
      clientPackage.author = author
    }
    writeJson(clientPackagePath, clientPackage)

    const updatedArc = updateAppArc(appArcText, {
      appName: normalizedArcName,
      profile: awsProfile,
      region: awsRegion
    })
    writeText(appArcPath, updatedArc)

    const envVars = {
      APP_NAME: siteDisplayName.replace(/\s+/g, ''),
      APP_DISPLAY_NAME: siteDisplayName,
      TURSO_DATABASE_URL: tursoDatabaseUrl,
      TURSO_AUTH_TOKEN: tursoAuthToken,
      RESEND_API_KEY: resendApiKey
    }

    const templateEnvPath = path.join(CLIENT_DIR, '.env.template')
    const runtimeEnvPath = path.join(CLIENT_DIR, '.env')
    if (!fileExists(runtimeEnvPath) && fileExists(templateEnvPath)) {
      writeText(runtimeEnvPath, readText(templateEnvPath))
    }

    for (let i = 0; i < envFilePaths.length; i += 1) {
      const envFile = envFilePaths[i]
      if (!fileExists(envFile)) continue
      const envText = readText(envFile)
      writeText(envFile, upsertEnvVars(envText, envVars))
    }

    const runInstalls = await askYesNo(rl, 'Run dependency install + hydrate now (npm install, client npm install, arc hydrate)?', false)
    if (runInstalls) {
      const setupCommands = [
        { label: 'npm install (root)', command: 'npm', args: ['install'], cwd: ROOT_DIR },
        { label: 'npm install (client)', command: 'npm', args: ['install'], cwd: CLIENT_DIR },
        { label: 'arc hydrate', command: 'npx', args: ['arc', 'hydrate'], cwd: ROOT_DIR }
      ]

      for (let i = 0; i < setupCommands.length; i += 1) {
        const task = setupCommands[i]
        console.log(`\nRunning: ${task.label}`)
        const result = runCommand(task.command, task.args, task.cwd)
        if (!result.ok) {
          console.log(result.stdout)
          console.error(result.stderr)
          throw new Error(`Failed: ${task.label}`)
        }
        if (result.stdout) console.log(result.stdout.trim())
      }
    }

    const readmePath = path.join(ROOT_DIR, 'Readme.md')
    if (fileExists(readmePath)) {
      const readmeText = readText(readmePath)
      const nextReadmeText = readmeText.replace(
        /^#\s+.*?:\s+Full-Stack Serverless Template/m,
        `# ${siteDisplayName}: Full-Stack Serverless Template`
      )
      if (nextReadmeText !== readmeText) {
        writeText(readmePath, nextReadmeText)
      }
    }

    console.log('\n✅ Onboarding script completed')
    console.log('\nUpdated files:')
    console.log('  - package.json')
    console.log('  - client/package.json')
    console.log('  - app.arc')
    console.log('  - client/.env* (where present)')
    console.log('  - Readme.md title (if present)')
    console.log('  - Backup files (.bak-<timestamp>) created before each write')

    if (backupPaths.length > 0) {
      console.log('\nBackups created:')
      for (let i = 0; i < backupPaths.length; i += 1) {
        console.log(`  - ${backupPaths[i]}`)
      }
    }

    if (verifyEnvironment && environmentResults.some((item) => !item.ok)) {
      console.log('\n⚠ Some environment checks failed. Fix these before running npm start.')
    }

    console.log(`\nNext: run \`npm start\` from ${ROOT_DIR}`)
    console.log(`AWS credentials file expected at ${path.join(os.homedir(), '.aws', 'credentials')}`)
  } catch (error) {
    console.error('\n❌ Onboarding failed')
    console.error(error.message || error)
    process.exitCode = 1
  } finally {
    rl.close()
  }
}

main()
