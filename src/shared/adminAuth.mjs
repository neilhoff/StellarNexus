import { getIdentityFromHttpRequest } from './authIdentity.mjs'

async function requireAuthenticatedIdentity (req) {
  const identity = await getIdentityFromHttpRequest(req)
  if (!identity?.email) {
    const error = new Error('Unauthorized: missing user identity')
    error.statusCode = 401
    throw error
  }
  if (identity.disabled) {
    const error = new Error('Forbidden: account has been disabled')
    error.statusCode = 403
    throw error
  }
  return identity
}

async function requireAdminIdentity (req) {
  const identity = await requireAuthenticatedIdentity(req)
  if (!identity.isAdmin) {
    const error = new Error('Forbidden: admin access required')
    error.statusCode = 403
    throw error
  }
  return identity
}

async function requireSuperAdminIdentity (req) {
  const identity = await requireAuthenticatedIdentity(req)
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
