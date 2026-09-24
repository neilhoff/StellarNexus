import arc from '@architect/functions'
import { logError } from '@architect/shared/stellarErrorLogger.mjs'
import {
  handleSignIn,
  handleSignUp,
  handleSignOut,
  handleRefresh,
  handleForgotPassword,
  handleResetPassword,
  handleVerifyEmail,
  handleGetSession
} from '@architect/shared/authActions.mjs'

const ACTION_HANDLERS = {
  signin: handleSignIn,
  signup: handleSignUp,
  signout: handleSignOut,
  refresh: handleRefresh,
  'forgot-password': handleForgotPassword,
  'reset-password': handleResetPassword,
  'verify-email': handleVerifyEmail,
  session: handleGetSession
}

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

async function authHandler (req, context) {
  try {
    const body = parseBody(req)
    const action = body.action

    if (!action || !ACTION_HANDLERS[action]) {
      const validActions = Object.keys(ACTION_HANDLERS).join(', ')
      return buildJsonResponse(400, {
        error: `Invalid or missing action. Valid actions: ${validActions}`
      })
    }

    const result = await ACTION_HANDLERS[action](body)
    return buildJsonResponse(200, result)
  } catch (error) {
    const statusCode = parseStatusCode(error)
    if (statusCode !== 500) {
      return buildJsonResponse(statusCode, { error: error.message })
    }

    const correlationId = await logError(error, 'server', null, { req, context })
    return buildJsonResponse(500, {
      error: 'Server Error: Authentication operation failed.',
      correlationId
    })
  }
}

export const handler = arc.http(authHandler)
