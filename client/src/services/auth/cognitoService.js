import {
  CognitoUserPool,
  CognitoUser,
  AuthenticationDetails,
  CognitoUserAttribute,
  // CognitoUserSession,
} from 'amazon-cognito-identity-js'

// Replace with your Cognito User Pool details
const poolData = {
  UserPoolId: process.env.COGNITO_USER_POOL_ID, // Your User Pool ID
  ClientId: process.env.COGNITO_CLIENT_ID, // Your App Client ID
}

const userPool = new CognitoUserPool(poolData)

// Sign-in function
export const cognitoSignIn = async (email, password) => {
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
export const isAuthenticated = async () => {
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
export const cognitoSignOut = () => {
  const cognitoUser = userPool.getCurrentUser()
  if (cognitoUser) {
    cognitoUser.signOut()
  }
}

// Get current user attributes
export const getUserAttributes = async () => {
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

export const refreshSession = async () => {
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
export const forgotPassword = async (email) => {
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
export const confirmNewPassword = async (email, verificationCode, newPassword) => {
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
export const signUp = async (email, password, attributes = {}) => {
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
export const confirmSignUp = async (email, confirmationCode) => {
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

export const resendConfirmationCode = async (email) => {
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









// import { UserManager } from "oidc-client-ts"

// const cognitoAuthConfig = {
//   authority: "https://cognito-idp.us-east-1.amazonaws.com/us-east-1_VmIicVsbD",
//   client_id: "59vrm1gtbtllpjvkcp6llo3eot",
//   // redirect_uri: "https://d84l1y8p4kdic.cloudfront.net",
//   redirect_uri: 'http://localhost:9000',
//   response_type: "code",
//   scope: "email openid phone",
//   loadUserInfo: true
// }

// // create a UserManager instance
// export const userManager = new UserManager({
//   ...cognitoAuthConfig,
// })

// export async function signOutRedirect () {
//   const cognitoDomain = "https://us-east-1vmiicvsbd.auth.us-east-1.amazoncognito.com"
//   window.location.href = `${cognitoDomain}/logout?client_id=${cognitoAuthConfig.clientId}`
// }

// import { Amplify } from '@aws-amplify/core'
// // import { Auth } from '@aws-amplify/auth'
// import { Auth } from '@aws-amplify/auth'


// Amplify.configure({
//   Auth: {
//     // Your Auth-specific configuration here (e.g., Cognito user pool details)
//     identityPoolId: 'us-east-1:83c7cadd-c9f6-47c1-a12a-f0cf4f2f0b43',
//     region: 'us-east-1',
//     userPoolId: 'us-east-1_VmIicVsbD',
//     userPoolWebClientId: '59vrm1gtbtllpjvkcp6llo3eot',
//     oauth: {
//       domain: 'https://us-east-1vmiicvsbd.auth.us-east-1.amazoncognito.com', // e.g., "auth.yourapp.com.auth.us-east-1.amazoncognito.com"
//       scope: ['openid', 'profile', 'email', 'phone'],
//       redirectSignIn: 'http://localhost:9000', // Your redirect URI
//       redirectSignOut: 'http://localhost:9000',
//       responseType: 'code' // Required for redirect flow
//     }
//   },
// })

// // Now use Auth features like signIn, signUp, etc.
// // Auth.signIn('username', 'password')
// //   .then(user => console.log(user))
// //   .catch(err => console.log(err))

// export default Auth
