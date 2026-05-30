import arc from '@architect/functions'
import { logError } from '@architect/shared/stellarErrorLogger.mjs'
import { requireAuthenticatedIdentity } from '@architect/shared/adminAuth.mjs'
import { mapUserForPicker } from '@architect/shared/userMaintenance.mjs'

function buildJsonResponse (statusCode, payload) {
  return {
    cors: true,
    statusCode,
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload)
  }
}

async function searchUsers (req, context) {
  try {
    requireAuthenticatedIdentity(req)
    const search = String(req?.queryStringParameters?.search || '').trim().toLowerCase()

    const db = await arc.tables()
    const usersTable = db.users
    const result = await usersTable.scan({
      FilterExpression: 'begins_with(pk, :userPrefix) AND sk = :profileSk',
      ExpressionAttributeValues: {
        ':userPrefix': 'USER#',
        ':profileSk': 'PROFILE'
      }
    })

    const users = (result.Items || [])
      .filter((item) => !item.disabled)
      .filter((item) => {
        if (!search) return true
        const email = String(item.email || '').toLowerCase()
        const displayName = String(item.displayName || '').toLowerCase()
        return email.includes(search) || displayName.includes(search)
      })
      .map(mapUserForPicker)
      .slice(0, 20)

    return buildJsonResponse(200, { users })
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

export const handler = arc.http(searchUsers)