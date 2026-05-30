import AWS from 'aws-sdk'

function getCognitoClient () {
  return new AWS.CognitoIdentityServiceProvider()
}

function getUserPoolId () {
  const userPoolId = process.env.COGNITO_USER_POOL_ID
  if (!userPoolId) {
    const error = new Error('Missing COGNITO_USER_POOL_ID environment variable')
    error.statusCode = 500
    throw error
  }
  return userPoolId
}

async function setCognitoUserDisabled (email, disabled) {
  const cognito = getCognitoClient()
  const UserPoolId = getUserPoolId()
  const Username = email

  if (disabled) {
    await cognito.adminDisableUser({ UserPoolId, Username }).promise()
    return
  }

  await cognito.adminEnableUser({ UserPoolId, Username }).promise()
}

export {
  setCognitoUserDisabled
}
