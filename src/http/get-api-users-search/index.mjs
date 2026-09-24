import arc from '@architect/functions'
import { logError } from '@architect/shared/stellarErrorLogger.mjs'
import { requireAuthenticatedIdentity } from '@architect/shared/adminAuth.mjs'
import { searchUsers, mapUserForPicker } from '@architect/shared/userMaintenance.mjs'

function buildJsonResponse (statusCode, payload) {
  return {
    cors: true,
    statusCode,
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload)
  }
}

async function searchUsersHandler (req, context) {
  try {
    await requireAuthenticatedIdentity(req)
    const search = String(req?.queryStringParameters?.search || '').trim()

    const users = await searchUsers(search, 20)
    const mappedUsers = users
      .filter((item) => !item.disabled)
      .map(mapUserForPicker)

    return buildJsonResponse(200, { users: mappedUsers })
  } catch (error) {
    const statusCode = Number.isInteger(error?.statusCode) ? error.statusCode : 500
    if (statusCode !== 500) {
      return buildJsonResponse(statusCode, { error: error.message })
    }

    const correlationId = await logError(error, 'server', null, { req, context })
    return buildJsonResponse(500, {
      error: 'Server Error: Failed to search users.',
      correlationId
    })
  }
}

export const handler = arc.http(searchUsersHandler)
