import arc from '@architect/functions'
import { logError } from '@architect/shared/stellarErrorLogger.mjs'
import { requireAdminIdentity } from '@architect/shared/adminAuth.mjs'
import { disableUser, enableUser, getUserByEmail, normalizeEmail } from '@architect/shared/userMaintenance.mjs'

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
    const identity = await requireAdminIdentity(req)
    const body = parseBody(req)
    const email = normalizeEmail(body.email)

    if (!email) {
      return buildJsonResponse(400, { error: 'email is required' })
    }

    if (typeof body.disabled !== 'boolean') {
      return buildJsonResponse(400, { error: 'disabled must be a boolean' })
    }

    const existing = await getUserByEmail(email)
    if (!existing) {
      return buildJsonResponse(404, { error: 'User not found' })
    }

    const updated = body.disabled
      ? await disableUser(email, identity.email)
      : await enableUser(email)

    return buildJsonResponse(200, {
      success: true,
      email,
      disabled: body.disabled,
      disabledAt: updated?.disabled_at || null,
      disabledBy: updated?.disabled_by || null
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
