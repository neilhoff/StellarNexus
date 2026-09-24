import { getTursoClient } from './tursoClient.mjs'
import { getBetterAuth } from './betterAuth.mjs'

function normalizeEmail (email) {
  if (!email || typeof email !== 'string') return null
  return email.trim().toLowerCase()
}

async function handleSignIn (params) {
  const { email, password } = params
  if (!email || !password) {
    throw new Error('Email and password are required')
  }

  const auth = getBetterAuth()
  const result = await auth.api.signInEmail({
    body: { email: normalizeEmail(email), password }
  })

  return {
    success: true,
    user: {
      id: result.user.id,
      email: result.user.email,
      name: result.user.name,
      roles: JSON.parse(result.user.roles || '["user"]'),
      disabled: Boolean(result.user.disabled)
    },
    session: {
      token: result.token,
      expiresAt: result.session.expiresAt
    }
  }
}

async function handleSignUp (params) {
  const { email, password, name } = params
  if (!email || !password) {
    throw new Error('Email and password are required')
  }

  const auth = getBetterAuth()
  const result = await auth.api.signUpEmail({
    body: {
      email: normalizeEmail(email),
      password,
      name: name || normalizeEmail(email),
      roles: '["user"]',
      disabled: false
    }
  })

  return {
    success: true,
    user: {
      id: result.user.id,
      email: result.user.email,
      name: result.user.name,
      roles: ['user'],
      disabled: false
    },
    session: {
      token: result.token,
      expiresAt: result.session.expiresAt
    }
  }
}

async function handleSignOut (params) {
  const { token } = params
  if (!token) {
    throw new Error('Session token is required')
  }

  const auth = getBetterAuth()
  await auth.api.signOut({
    headers: new Headers({ cookie: `stellar-nexus.session_token=${token}` })
  })

  return { success: true }
}

async function handleRefresh (params) {
  const { token } = params
  if (!token) {
    throw new Error('Session token is required')
  }

  const auth = getBetterAuth()
  const result = await auth.api.getSession({
    headers: new Headers({ cookie: `stellar-nexus.session_token=${token}` })
  })

  if (!result || !result.session) {
    throw new Error('Invalid or expired session')
  }

  return {
    success: true,
    user: {
      id: result.user.id,
      email: result.user.email,
      name: result.user.name,
      roles: JSON.parse(result.user.roles || '["user"]'),
      disabled: Boolean(result.user.disabled)
    },
    session: {
      expiresAt: result.session.expiresAt
    }
  }
}

async function handleForgotPassword (params) {
  const { email } = params
  if (!email) {
    throw new Error('Email is required')
  }

  const auth = getBetterAuth()
  await auth.api.forgetPassword({
    body: { email: normalizeEmail(email), redirectTo: '/auth/reset-password' }
  })

  return { success: true, message: 'Password reset email sent' }
}

async function handleResetPassword (params) {
  const { token, newPassword } = params
  if (!token || !newPassword) {
    throw new Error('Reset token and new password are required')
  }

  const auth = getBetterAuth()
  await auth.api.resetPassword({
    body: { token, newPassword }
  })

  return { success: true, message: 'Password has been reset' }
}

async function handleVerifyEmail (params) {
  const { token } = params
  if (!token) {
    throw new Error('Verification token is required')
  }

  const auth = getBetterAuth()
  await auth.api.verifyEmail({
    query: { token }
  })

  return { success: true, message: 'Email verified' }
}

async function handleGetSession (params) {
  const { token } = params
  if (!token) {
    throw new Error('Session token is required')
  }

  const auth = getBetterAuth()
  const result = await auth.api.getSession({
    headers: new Headers({ cookie: `stellar-nexus.session_token=${token}` })
  })

  if (!result || !result.session) {
    throw new Error('Invalid or expired session')
  }

  return {
    success: true,
    user: {
      id: result.user.id,
      email: result.user.email,
      name: result.user.name,
      roles: JSON.parse(result.user.roles || '["user"]'),
      disabled: Boolean(result.user.disabled)
    },
    session: {
      expiresAt: result.session.expiresAt
    }
  }
}

async function getUserByToken (token) {
  if (!token) return null

  try {
    const auth = getBetterAuth()
    const result = await auth.api.getSession({
      headers: new Headers({ cookie: `stellar-nexus.session_token=${token}` })
    })

    if (!result || !result.user) return null

    return {
      id: result.user.id,
      email: result.user.email,
      name: result.user.name,
      roles: JSON.parse(result.user.roles || '["user"]'),
      disabled: Boolean(result.user.disabled)
    }
  } catch {
    return null
  }
}

export {
  handleSignIn,
  handleSignUp,
  handleSignOut,
  handleRefresh,
  handleForgotPassword,
  handleResetPassword,
  handleVerifyEmail,
  handleGetSession,
  getUserByToken
}
