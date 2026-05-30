import arc from '@architect/functions'
import { logError } from '@architect/shared/stellarErrorLogger.mjs'
import { requireAuthenticatedIdentity } from '@architect/shared/adminAuth.mjs'
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

async function syncCurrentUser (req, context) {
  try {
    const identity = requireAuthenticatedIdentity(req)
    const body = parseBody(req)
    const email = normalizeEmail(identity.email)
    const nowIso = new Date().toISOString()

    const db = await arc.tables()
    const usersTable = db.users

    const currentRecord = await usersTable.get(getUserKey(email))

    const displayName = body.displayName || identity.tokenPayload?.name || identity.email

    const nextRecord = currentRecord || getDefaultUserRecord(email, nowIso)
    nextRecord.displayName = displayName
    nextRecord.displayNameLower = String(displayName || email).toLowerCase()
    nextRecord.updatedAt = nowIso
    nextRecord.lastSignInAt = nowIso

    await usersTable.put(nextRecord)

    return buildJsonResponse(200, {
      success: true,
      user: {
        email: nextRecord.email,
        displayName: nextRecord.displayName,
        disabled: Boolean(nextRecord.disabled)
      }
    })
  } catch (error) {
    const statusCode = parseStatusCode(error)
    if (statusCode !== 500) {
      return buildJsonResponse(statusCode, { error: error.message })
    }

    const correlationId = await logError(error, 'server', null, { req, context })
    return buildJsonResponse(500, {
      error: 'Server Error: Failed to sync current user.',
      correlationId
    })
  }
}

export const handler = arc.http(syncCurrentUser)
