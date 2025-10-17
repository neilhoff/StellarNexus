import {
  CognitoUserPool,
  CognitoUser,
  AuthenticationDetails,
  CognitoUserAttribute,
} from 'amazon-cognito-identity-js'

// Replace with your Cognito User Pool details
const poolData = {
  UserPoolId: process.env.COGNITO_USER_POOL_ID, // Your User Pool ID
  ClientId: process.env.COGNITO_CLIENT_ID, // Your App Client ID
}

const userPool = new CognitoUserPool(poolData)

// Sign-in function
export async function cognitoSignIn (email, password) {
  const authenticationDetails = new AuthenticationDetails({
    Username: email,
    Password: password,
  })

  const cognitoUser = new CognitoUser({
    Username: email,
    Pool: userPool,
  })

  return new Promise((resolve, reject) => {
    cognitoUser.authenticateUser(authenticationDetails, {
      onSuccess: (result) => {
        // Authentication successful, return tokens
        const accessToken = result.getAccessToken().getJwtToken()
        const idToken = result.getIdToken().getJwtToken()
        resolve({ accessToken, idToken })
      },
      onFailure: (err) => {
        reject(err)
      },
    })
  })
}

// Check if user is authenticated
export async function isAuthenticated () {
  const cognitoUser = userPool.getCurrentUser()
  if (!cognitoUser) return false

  return new Promise((resolve, reject) => {
    cognitoUser.getSession((err, session) => {
      if (err || !session) {
        reject(err || new Error('No valid session'))
        return
      }
      resolve(session.isValid())
    })
  })
}

// Sign-out function
export function cognitoSignOut () {
  const cognitoUser = userPool.getCurrentUser()
  if (cognitoUser) {
    cognitoUser.signOut()
  }
}

// Get current user attributes
export async function getUserAttributes () {
  const cognitoUser = userPool.getCurrentUser()
  if (!cognitoUser) throw new Error('No user logged in')

  return new Promise((resolve, reject) => {
    cognitoUser.getSession((err, session) => {
      if (err || !session) {
        reject(err || new Error('No valid session'))
        return
      }
      cognitoUser.getUserAttributes((err, attributes) => {
        if (err) {
          reject(err)
        } else {
          resolve(attributes)
        }
      })
    })
  })
}

// Refresh session
export async function refreshSession () {
  const cognitoUser = userPool.getCurrentUser()
  if (!cognitoUser) throw new Error('No user signed in')

  return new Promise((resolve, reject) => {
    cognitoUser.getSession((err, session) => {
      if (err || !session) {
        reject(err || new Error('No valid session'))
        return
      }
      const refreshToken = session.getRefreshToken()
      cognitoUser.refreshSession(refreshToken, (err, newSession) => {
        if (err) {
          reject(err)
        } else {
          const accessToken = newSession.getAccessToken().getJwtToken()
          const idToken = newSession.getIdToken().getJwtToken()
          resolve({ accessToken, idToken })
        }
      })
    })
  })
}

// Initiate password reset (sends verification code)
export async function forgotPassword (email) {
  const cognitoUser = new CognitoUser({
    Username: email,
    Pool: userPool,
  })

  return new Promise((resolve, reject) => {
    cognitoUser.forgotPassword({
      onSuccess: (data) => {
        // data contains delivery details (e.g., where the code was sent)
        resolve({ message: 'Verification code sent', delivery: data })
      },
      onFailure: (err) => reject(err),
    })
  })
}

// Confirm new password with verification code
export async function confirmNewPassword (email, verificationCode, newPassword) {
  const cognitoUser = new CognitoUser({
    Username: email,
    Pool: userPool,
  })

  return new Promise((resolve, reject) => {
    cognitoUser.confirmPassword(verificationCode, newPassword, {
      onSuccess: () => {
        resolve({ message: 'Password reset successfully' })
      },
      onFailure: (err) => reject(err),
    })
  })
}

// Sign-up function (register new user)
export async function signUp (email, password, attributes = {}) {
  const attributeList = Object.entries(attributes).map(([name, value]) => {
    return new CognitoUserAttribute({
      Name: name,
      Value: value
    })
  })

  return new Promise((resolve, reject) => {
    userPool.signUp(email, password, attributeList, null, (err, result) => {
      if (err) {
        reject(err)
        return
      }
      resolve({
        user: result.user,
        userConfirmed: result.userConfirmed,
        codeDeliveryDetails: result.codeDeliveryDetails
      })
    })
  })
}

// Confirm sign-up (verify email with code)
export async function confirmSignUp (email, confirmationCode) {
  const cognitoUser = new CognitoUser({
    Username: email,
    Pool: userPool
  })

  return new Promise((resolve, reject) => {
    cognitoUser.confirmRegistration(confirmationCode, true, (err, result) => {
      if (err) {
        reject(err)
        return
      }
      resolve({ message: 'User confirmed successfully', result })
    })
  })
}

// Resend confirmation code
export async function resendConfirmationCode (email) {
  const cognitoUser = new CognitoUser({
    Username: email,
    Pool: userPool
  })

  return new Promise((resolve, reject) => {
    cognitoUser.resendConfirmationCode((err, result) => {
      if (err) {
        reject(err)
        return
      }
      resolve({
        message: 'Confirmation code resent successfully',
        delivery: result?.CodeDeliveryDetails
      })
    })
  })
}
