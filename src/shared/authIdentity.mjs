import { getTursoClient } from './tursoClient.mjs'

function getBearerToken (authorizationHeader) {
  if (!authorizationHeader || typeof authorizationHeader !== 'string') return null
  const match = authorizationHeader.match(/^Bearer\s+(.+)$/i)
  return match?.[1] || null
}

async function getIdentityFromToken (token) {
  if (!token || typeof token !== 'string') return null

  try {
    const db = getTursoClient()
    const result = await db.execute({
      sql: `
        SELECT s.token, s.expires_at, s.user_id, u.email, u.name, u.roles, u.disabled
        FROM session s
        JOIN user u ON s.user_id = u.id
        WHERE s.token = ?
      `,
      args: [token]
    })

    if (!result.rows || result.rows.length === 0) return null

    const row = result.rows[0]
    const expiresAt = new Date(row.expires_at)
    if (expiresAt < new Date()) return null

    const roles = JSON.parse(row.roles || '["user"]')
    const isSuperAdmin = roles.includes('super-admin')
    const isAdmin = isSuperAdmin || roles.includes('admin')

    return {
      email: row.email,
      userName: row.email,
      userId: row.user_id,
      name: row.name,
      roles,
      isAdmin,
      isSuperAdmin,
      disabled: Boolean(row.disabled),
      exp: Math.floor(expiresAt.getTime() / 1000)
    }
  } catch {
    return null
  }
}

async function getIdentityFromConnectEvent (event) {
  const qs = event?.queryStringParameters || {}
  const token = qs.token || null
  const tokenIdentity = await getIdentityFromToken(token)
  const email = tokenIdentity?.email || qs.email || null

  return {
    email,
    userName: email,
    token,
    tokenExp: tokenIdentity?.exp || null,
    roles: tokenIdentity?.roles || [],
    isAdmin: Boolean(tokenIdentity?.isAdmin),
    isSuperAdmin: Boolean(tokenIdentity?.isSuperAdmin),
    disabled: Boolean(tokenIdentity?.disabled),
    tokenPayload: tokenIdentity || null
  }
}

function getBodyObject (req) {
  const body = req?.body
  if (!body) return null
  if (typeof body === 'object') return body
  try {
    return JSON.parse(body)
  } catch {
    return null
  }
}

function getRequestUserNameFallback (req) {
  const qs = req?.queryStringParameters || {}
  const body = getBodyObject(req) || {}
  return qs.userName || qs.email || body.userName || body.email || null
}

async function getIdentityFromHttpRequest (req) {
  const headers = req?.headers || {}
  const authorization = headers.authorization || headers.Authorization || null
  const token = getBearerToken(authorization)
  const tokenIdentity = await getIdentityFromToken(token)
  const emailHeader = headers['x-user-email'] || headers['X-User-Email'] || null
  const fallbackUser = getRequestUserNameFallback(req)
  const email = tokenIdentity?.email || emailHeader || fallbackUser || null

  return {
    email,
    userName: email,
    userId: tokenIdentity?.userId || null,
    name: tokenIdentity?.name || null,
    token,
    tokenExp: tokenIdentity?.exp || null,
    roles: tokenIdentity?.roles || [],
    isAdmin: Boolean(tokenIdentity?.isAdmin),
    isSuperAdmin: Boolean(tokenIdentity?.isSuperAdmin),
    disabled: Boolean(tokenIdentity?.disabled),
    tokenPayload: tokenIdentity || null
  }
}

function getIdentityFromConnectionRecord (connectionRecord) {
  const email = connectionRecord?.email || connectionRecord?.userName || null
  return {
    email,
    userName: email,
    displayName: connectionRecord?.displayName || email,
    roles: connectionRecord?.roles || ['user']
  }
}

export {
  getBearerToken,
  getIdentityFromToken,
  getIdentityFromConnectEvent,
  getIdentityFromHttpRequest,
  getIdentityFromConnectionRecord
}
