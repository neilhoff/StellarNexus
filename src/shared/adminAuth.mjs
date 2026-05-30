import { getIdentityFromHttpRequest } from './authIdentity.mjs'

function requireAuthenticatedIdentity (req) {
  const identity = getIdentityFromHttpRequest(req)
  if (!identity?.email) {
    const error = new Error('Unauthorized: missing user identity')
    error.statusCode = 401
    throw error
  }
  return identity
}

function requireAdminIdentity (req) {
  const identity = requireAuthenticatedIdentity(req)
  if (!identity.isAdmin) {
    const error = new Error('Forbidden: admin access required')
    error.statusCode = 403
    throw error
  }
  return identity
}

function requireSuperAdminIdentity (req) {
  const identity = requireAuthenticatedIdentity(req)
  if (!identity.isSuperAdmin) {
    const error = new Error('Forbidden: super-admin access required')
    error.statusCode = 403
    throw error
  }
  return identity
}

export {
  requireAuthenticatedIdentity,
  requireAdminIdentity,
  requireSuperAdminIdentity
}
