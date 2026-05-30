function decodeJwtPayload (token) {
  if (!token || typeof token !== 'string') return null
  const parts = token.split('.')
  if (parts.length !== 3) return null

  try {
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    const padded = base64.padEnd(base64.length + (4 - (base64.length % 4 || 4)) % 4, '=')
    return JSON.parse(Buffer.from(padded, 'base64').toString('utf8'))
  } catch {
    return null
  }
}

function getBearerToken (authorizationHeader) {
  if (!authorizationHeader || typeof authorizationHeader !== 'string') return null
  const match = authorizationHeader.match(/^Bearer\s+(.+)$/i)
  return match?.[1] || null
}

function getCognitoGroups (payload) {
  const rawGroups = payload?.['cognito:groups']
  if (!rawGroups) return []
  if (Array.isArray(rawGroups)) return rawGroups
  if (typeof rawGroups === 'string') return [rawGroups]
  return []
}

function getIdentityFromToken (token) {
  const payload = decodeJwtPayload(token)
  if (!payload) return null

  const email = payload.email || payload['cognito:username'] || null
  const exp = Number.isFinite(payload.exp) ? payload.exp : null
  const groups = getCognitoGroups(payload)
  const isSuperAdmin = groups.includes('super-admin')
  const isAdmin = isSuperAdmin || groups.includes('admin')

  return {
    email,
    userName: email,
    exp,
    groups,
    isAdmin,
    isSuperAdmin,
    payload
  }
}

function getIdentityFromConnectEvent (event) {
  const qs = event?.queryStringParameters || {}
  const token = qs.token || null
  const tokenIdentity = getIdentityFromToken(token)
  const email = tokenIdentity?.email || qs.email || null

  return {
    email,
    userName: email,
    token,
    tokenExp: tokenIdentity?.exp || null,
    tokenPayload: tokenIdentity?.payload || null
  }
}

function getBodyObject (req) {
  const body = req?.body
  if (!body) return null
  if (typeof body === 'object') return body
  if (typeof body !== 'string') return null

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

function getIdentityFromHttpRequest (req) {
  const headers = req?.headers || {}
  const authorization = headers.authorization || headers.Authorization || null
  const token = getBearerToken(authorization)
  const tokenIdentity = getIdentityFromToken(token)
  const emailHeader = headers['x-user-email'] || headers['X-User-Email'] || null
  const fallbackUser = getRequestUserNameFallback(req)
  const email = tokenIdentity?.email || emailHeader || fallbackUser || null

  return {
    email,
    userName: email,
    token,
    tokenExp: tokenIdentity?.exp || null,
    groups: tokenIdentity?.groups || [],
    isAdmin: Boolean(tokenIdentity?.isAdmin),
    isSuperAdmin: Boolean(tokenIdentity?.isSuperAdmin),
    tokenPayload: tokenIdentity?.payload || null
  }
}

function getIdentityFromConnectionRecord (connectionRecord) {
  const email = connectionRecord?.email || connectionRecord?.userName || null
  return {
    email,
    userName: email,
    displayName: connectionRecord?.displayName || email
  }
}

export {
  decodeJwtPayload,
  getBearerToken,
  getCognitoGroups,
  getIdentityFromToken,
  getIdentityFromConnectEvent,
  getIdentityFromHttpRequest,
  getIdentityFromConnectionRecord
}
