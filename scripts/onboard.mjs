#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import { spawnSync } from 'node:child_process'
import { createInterface } from 'node:readline/promises'
import { stdin as input, stdout as output } from 'node:process'

const ROOT_DIR = process.cwd()
const CLIENT_DIR = path.join(ROOT_DIR, 'client')
let awsSdk = null

async function getAwsSdk() {
  if (awsSdk) return awsSdk
  const moduleRef = await import('aws-sdk')
  awsSdk = moduleRef.default || moduleRef
  return awsSdk
}

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
      label: 'AWS CLI',
      command: 'aws',
      args: ['--version']
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

async function getAwsCredentials(profile) {
  const AWS = await getAwsSdk()
  return new AWS.SharedIniFileCredentials({ profile })
}

async function createCognitoClient({ region, profile }) {
  const AWS = await getAwsSdk()
  const credentials = await getAwsCredentials(profile)
  AWS.config.update({ region, credentials })
  return new AWS.CognitoIdentityServiceProvider({ apiVersion: '2016-04-18', region, credentials })
}

async function ensureGroup(cognito, userPoolId, groupName, precedence) {
  try {
    await cognito.getGroup({
      GroupName: groupName,
      UserPoolId: userPoolId
    }).promise()
    return { created: false }
  } catch (error) {
    if (error.code !== 'ResourceNotFoundException') {
      throw error
    }
  }

  await cognito.createGroup({
    GroupName: groupName,
    UserPoolId: userPoolId,
    Precedence: precedence
  }).promise()

  return { created: true }
}

async function ensureSuperAdminUser({
  cognito,
  userPoolId,
  email,
  givenName,
  familyName,
  displayName,
  superAdminGroup,
  tempPassword,
  setPermanentPassword,
  sendInviteEmail
}) {
  let userExists = true

  try {
    await cognito.adminGetUser({
      UserPoolId: userPoolId,
      Username: email
    }).promise()
  } catch (error) {
    if (error.code === 'UserNotFoundException') {
      userExists = false
    } else {
      throw error
    }
  }

  if (!userExists) {
    const userAttributes = [
      { Name: 'email', Value: email },
      { Name: 'email_verified', Value: 'true' }
    ]

    if (givenName) userAttributes.push({ Name: 'given_name', Value: givenName })
    if (familyName) userAttributes.push({ Name: 'family_name', Value: familyName })
    if (displayName) userAttributes.push({ Name: 'name', Value: displayName })

    const createParams = {
      UserPoolId: userPoolId,
      Username: email,
      UserAttributes: userAttributes,
      DesiredDeliveryMediums: ['EMAIL']
    }

    if (!sendInviteEmail) {
      createParams.MessageAction = 'SUPPRESS'
    }

    if (tempPassword) {
      createParams.TemporaryPassword = tempPassword
    }

    await cognito.adminCreateUser(createParams).promise()

    if (tempPassword && setPermanentPassword) {
      await cognito.adminSetUserPassword({
        UserPoolId: userPoolId,
        Username: email,
        Password: tempPassword,
        Permanent: true
      }).promise()
    }
  }

  await cognito.adminAddUserToGroup({
    UserPoolId: userPoolId,
    Username: email,
    GroupName: superAdminGroup
  }).promise()

  return { created: !userExists }
}

async function createUserPoolAndClient(cognito, { siteDisplayName, appClientName }) {
  const pool = await cognito.createUserPool({
    PoolName: `${siteDisplayName} Users`,
    AutoVerifiedAttributes: ['email'],
    UsernameAttributes: ['email'],
    AdminCreateUserConfig: {
      AllowAdminCreateUserOnly: true
    }
  }).promise()

  const userPoolId = pool?.UserPool?.Id
  if (!userPoolId) {
    throw new Error('User pool was created but no UserPoolId was returned')
  }

  const client = await cognito.createUserPoolClient({
    UserPoolId: userPoolId,
    ClientName: appClientName,
    GenerateSecret: false,
    ExplicitAuthFlows: [
      'ALLOW_USER_PASSWORD_AUTH',
      'ALLOW_REFRESH_TOKEN_AUTH',
      'ALLOW_ADMIN_USER_PASSWORD_AUTH'
    ]
  }).promise()

  const userPoolClientId = client?.UserPoolClient?.ClientId
  if (!userPoolClientId) {
    throw new Error('User pool client was created but no ClientId was returned')
  }

  return { userPoolId, userPoolClientId }
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
    console.log('This script updates project metadata, verifies tooling, and configures Cognito bootstrap.\n')

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

    let userPoolId = ''
    let userPoolClientId = ''
    const configureCognito = await askYesNo(rl, 'Configure Cognito bootstrap now?', true)
    const superAdminGroup = await ask(rl, 'Super-admin group name', existingEnv.GLOBAL_ADMIN_GROUP || 'super-admin')
    const adminGroup = await ask(rl, 'Admin group name', existingEnv.SITE_ADMIN_GROUP || 'admin')

    if (configureCognito) {
      const useExistingPool = await askYesNo(rl, 'Use an existing Cognito user pool?', true)
      const cognito = await createCognitoClient({ region: awsRegion, profile: awsProfile })

      if (useExistingPool) {
        userPoolId = await ask(rl, 'Existing Cognito User Pool ID')
        userPoolClientId = await ask(rl, 'Existing Cognito App Client ID')
      } else {
        const appClientName = await ask(rl, 'New app client name', `${siteDisplayName} Web App`)
        const created = await createUserPoolAndClient(cognito, { siteDisplayName, appClientName })
        userPoolId = created.userPoolId
        userPoolClientId = created.userPoolClientId
        console.log(`\nCreated user pool: ${userPoolId}`)
        console.log(`Created app client: ${userPoolClientId}`)
      }

      if (!userPoolId || !userPoolClientId) {
        throw new Error('Cognito setup requires both a User Pool ID and App Client ID')
      }

      const groupSuperResult = await ensureGroup(cognito, userPoolId, superAdminGroup, 1)
      const groupAdminResult = await ensureGroup(cognito, userPoolId, adminGroup, 5)

      console.log(`\nGroup ${superAdminGroup}: ${groupSuperResult.created ? 'created' : 'already exists'}`)
      console.log(`Group ${adminGroup}: ${groupAdminResult.created ? 'created' : 'already exists'}`)

      const createSuperAdmin = await askYesNo(rl, 'Create or update initial super-admin user now?', true)
      if (createSuperAdmin) {
        const superAdminEmail = await ask(rl, 'Super-admin email')
        const givenName = await ask(rl, 'Super-admin given name', '')
        const familyName = await ask(rl, 'Super-admin family name', '')
        const fullNameDefault = `${givenName} ${familyName}`.trim()
        const displayName = await ask(rl, 'Super-admin display name', fullNameDefault)

        const setPasswordNow = await askYesNo(rl, 'Set an initial password now?', false)
        let tempPassword = ''
        let setPermanentPassword = false

        if (setPasswordNow) {
          tempPassword = await ask(rl, 'Initial password (must satisfy Cognito policy)')
          setPermanentPassword = await askYesNo(rl, 'Mark this password as permanent?', true)
        }

        const sendInviteEmail = await askYesNo(rl, 'Send Cognito invitation email?', true)

        const userResult = await ensureSuperAdminUser({
          cognito,
          userPoolId,
          email: superAdminEmail,
          givenName,
          familyName,
          displayName,
          superAdminGroup,
          tempPassword,
          setPermanentPassword,
          sendInviteEmail
        })

        console.log(`Super-admin user ${userResult.created ? 'created' : 'already existed'} and ensured in ${superAdminGroup}`)
      }
    } else {
      // Preserve existing env values when Cognito setup is skipped.
      userPoolId = existingEnv.COGNITO_USER_POOL_ID || ''
      userPoolClientId = existingEnv.COGNITO_CLIENT_ID || ''
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
      COGNITO_USER_POOL_ID: userPoolId || existingEnv.COGNITO_USER_POOL_ID || '',
      COGNITO_CLIENT_ID: userPoolClientId || existingEnv.COGNITO_CLIENT_ID || '',
      GLOBAL_ADMIN_GROUP: superAdminGroup,
      SITE_ADMIN_GROUP: adminGroup
    }

    const templateEnvPath = path.join(CLIENT_DIR, '.env.template')
    const runtimeEnvPath = path.join(CLIENT_DIR, '.env')
    if (!fileExists(runtimeEnvPath) && fileExists(templateEnvPath)) {
      // Ensure client/.env exists for local development.
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
