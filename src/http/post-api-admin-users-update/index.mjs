import arc from '@architect/functions'
import { logError } from '@architect/shared/stellarErrorLogger.mjs'
import { requireAdminIdentity } from '@architect/shared/adminAuth.mjs'
import {
  getDefaultUserRecord,
  getUserKey,
  normalizeEmail
} from '@architect/shared/userMaintenance.mjs'

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

async function updateAdminUser (req, context) {
  try {
    const identity = requireAdminIdentity(req)
    const body = parseBody(req)
    const email = normalizeEmail(body.email)

    if (!email) {
      return buildJsonResponse(400, { error: 'email is required' })
    }

    const db = await arc.tables()
    const usersTable = db.users
    const nowIso = new Date().toISOString()

    const currentRecord = await usersTable.get(getUserKey(email))
    const nextRecord = currentRecord || getDefaultUserRecord(email, nowIso)

    if (typeof body.displayName === 'string') {
      nextRecord.displayName = body.displayName.trim() || email
      nextRecord.displayNameLower = nextRecord.displayName.toLowerCase()
    }

    nextRecord.updatedAt = nowIso
    nextRecord.updatedBy = identity.email

    await usersTable.put(nextRecord)

    return buildJsonResponse(200, {
      success: true,
      user: {
        email: nextRecord.email,
        displayName: nextRecord.displayName || nextRecord.email,
        disabled: Boolean(nextRecord.disabled),
        createdAt: nextRecord.createdAt || null,
        lastSignInAt: nextRecord.lastSignInAt || null,
        updatedAt: nextRecord.updatedAt || null
      }
    })
  } catch (error) {
    const statusCode = parseStatusCode(error)
    if (statusCode !== 500) {
      return buildJsonResponse(statusCode, { error: error.message })
    }

    const correlationId = await logError(error, 'server', null, { req, context })
    return buildJsonResponse(500, {
      error: 'Server Error: Failed to update user.',
      correlationId
    })
  }
}

export const handler = arc.http(updateAdminUser)
