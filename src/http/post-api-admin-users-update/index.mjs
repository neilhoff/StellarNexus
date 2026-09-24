import arc from '@architect/functions'
import { logError } from '@architect/shared/stellarErrorLogger.mjs'
import { requireAdminIdentity } from '@architect/shared/adminAuth.mjs'
import { upsertUser, getUserByEmail, normalizeEmail } from '@architect/shared/userMaintenance.mjs'

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
    const identity = await requireAdminIdentity(req)
    const body = parseBody(req)
    const email = normalizeEmail(body.email)

    if (!email) {
      return buildJsonResponse(400, { error: 'email is required' })
    }

    const existing = await getUserByEmail(email)
    const updates = {}

    if (typeof body.displayName === 'string') {
      updates.name = body.displayName.trim() || email
    }

    if (existing) {
      const updated = await upsertUser(email, updates)
      return buildJsonResponse(200, {
        success: true,
        user: {
          email: updated.email,
          displayName: updated.name || updated.email,
          disabled: Boolean(updated.disabled),
          createdAt: updated.created_at || null,
          lastSignInAt: updated.last_sign_in_at || null,
          updatedAt: updated.updated_at || null
        }
      })
    }

    return buildJsonResponse(404, { error: 'User not found' })
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
