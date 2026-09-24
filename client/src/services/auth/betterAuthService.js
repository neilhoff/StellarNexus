const API_URL = process.env.API_URL || 'http://localhost:3333'

async function callAuthEndpoint (action, params = {}) {
  const response = await fetch(`${API_URL}/api/auth`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, ...params })
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || 'Authentication request failed')
  }

  return data
}

export async function signIn (email, password) {
  const result = await callAuthEndpoint('signin', { email, password })
  return {
    accessToken: result.session.token,
    idToken: result.session.token,
    user: result.user
  }
}

export async function signUp (email, password, attributes = {}) {
  const result = await callAuthEndpoint('signup', {
    email,
    password,
    name: attributes.name || email
  })
  return {
    accessToken: result.session.token,
    idToken: result.session.token,
    user: result.user
  }
}

export async function signOut (token) {
  if (token) {
    await callAuthEndpoint('signout', { token })
  }
}

export async function refreshSession (token) {
  const result = await callAuthEndpoint('refresh', { token })
  return {
    accessToken: token,
    idToken: token,
    user: result.user
  }
}

export async function forgotPassword (email) {
  return callAuthEndpoint('forgot-password', { email })
}

export async function confirmNewPassword (email, verificationCode, newPassword) {
  return callAuthEndpoint('reset-password', {
    token: verificationCode,
    newPassword
  })
}

export async function confirmSignUp (email, confirmationCode) {
  return callAuthEndpoint('verify-email', { token: confirmationCode })
}

export async function resendConfirmationCode (email) {
  return callAuthEndpoint('forgot-password', { email })
}

export async function isAuthenticated (token) {
  if (!token) return false
  try {
    const result = await callAuthEndpoint('session', { token })
    return result.success && !result.user.disabled
  } catch {
    return false
  }
}

export async function hasAdminAccess (token) {
  if (!token) return false
  try {
    const result = await callAuthEndpoint('session', { token })
    if (!result.success) return false
    const roles = result.user.roles || []
    return roles.includes('admin') || roles.includes('super-admin')
  } catch {
    return false
  }
}

export async function getSession (token) {
  if (!token) return null
  try {
    const result = await callAuthEndpoint('session', { token })
    return result.success ? result : null
  } catch {
    return null
  }
}
