import arc from '@architect/functions'
import { logError } from '@architect/shared/stellarErrorLogger.mjs'
import { requireAdminIdentity } from '@architect/shared/adminAuth.mjs'
import {
  getDefaultUserRecord,
  getUserKey,
  normalizeEmail
} from '@architect/shared/userMaintenance.mjs'
import { setCognitoUserDisabled } from '@architect/shared/cognitoAdmin.mjs'

function buildJsonResponse (statusCode, payload) {
  return {
    cors: true,
    statusCode,
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload)
  }
}

function parseBody (req) {
  if (!req?.body) return {}
  if (typeof req.body === 'object') return req.body
  try {
    return JSON.parse(req.body)
  } catch {
    return {}
  }
}

function parseStatusCode (error) {
  return Number.isInteger(error?.statusCode) ? error.statusCode : 500
}

async function disableAdminUser (req, context) {
  try {
    const identity = requireAdminIdentity(req)
    const body = parseBody(req)
    const email = normalizeEmail(body.email)

    if (!email) {
      return buildJsonResponse(400, { error: 'email is required' })
    }

    if (typeof body.disabled !== 'boolean') {
      return buildJsonResponse(400, { error: 'disabled must be a boolean' })
    }

    await setCognitoUserDisabled(email, body.disabled)

    const db = await arc.tables()
    const usersTable = db.users
    const nowIso = new Date().toISOString()
    const currentRecord = await usersTable.get(getUserKey(email))

    const nextRecord = currentRecord || getDefaultUserRecord(email, nowIso)
    nextRecord.disabled = body.disabled
    nextRecord.disabledAt = body.disabled ? nowIso : null
    nextRecord.disabledBy = body.disabled ? identity.email : null
    nextRecord.updatedAt = nowIso
    nextRecord.updatedBy = identity.email

    await usersTable.put(nextRecord)

    return buildJsonResponse(200, {
      success: true,
      email,
      disabled: body.disabled,
      disabledAt: nextRecord.disabledAt,
      disabledBy: nextRecord.disabledBy
    })
  } catch (error) {
    const statusCode = parseStatusCode(error)
    if (statusCode !== 500) {
      return buildJsonResponse(statusCode, { error: error.message })
    }

    const correlationId = await logError(error, 'server', null, { req, context })
    return buildJsonResponse(500, {
      error: 'Server Error: Failed to change user sign-in state.',
      correlationId
    })
  }
}

export const handler = arc.http(disableAdminUser)
