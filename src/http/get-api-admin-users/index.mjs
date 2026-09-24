import arc from '@architect/functions'
import { logError } from '@architect/shared/stellarErrorLogger.mjs'
import { requireAdminIdentity } from '@architect/shared/adminAuth.mjs'
import { listUsers, mapUserForList } from '@architect/shared/userMaintenance.mjs'

function buildJsonResponse (statusCode, payload) {
  return {
    cors: true,
    statusCode,
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload)
  }
}

function parseStatusCode (error) {
  return Number.isInteger(error?.statusCode) ? error.statusCode : 500
}

async function getAdminUsers (req, context) {
  try {
    const identity = await requireAdminIdentity(req)

    const users = await listUsers(500)
    const mappedUsers = users
      .map(mapUserForList)
      .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''))

    return buildJsonResponse(200, {
      users: mappedUsers,
      requestedBy: identity.email
    })
  } catch (error) {
    const statusCode = parseStatusCode(error)
    if (statusCode !== 500) {
      return buildJsonResponse(statusCode, { error: error.message })
    }

    const correlationId = await logError(error, 'server', null, { req, context })
    return buildJsonResponse(500, {
      error: 'Server Error: Failed to retrieve users.',
      correlationId
    })
  }
}

export const handler = arc.http(getAdminUsers)
