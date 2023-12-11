const returnError = require('./returnError')
const axios = require('axios')

// Microsoft automatically verifies the user is in the tenant
async function authenticate (req, authCheck) {
  let accessToken
  accessToken = req.headers.authorization
  if (!accessToken) {
    // Case for key "authorization" can be different between local dev and staging
    accessToken = req.headers.Authorization
  }
  const graphUrl = 'https://graph.microsoft.com/beta/me'

  // TODO: Move this to an environment variable
  // Admin Active Directory Groups
  const globalAdminAccessGroup = 'Stellar Nexus Admin'
  const adminAccessGroup = ''

  req.skyAuth = {
    adminAccess: false
  }

  // Check if the user has the AD groups
  try {
    let groups = await axios.get(graphUrl + '/memberOf?$select=displayName&top=999', {
      headers: {
        'Authorization': accessToken
      }
    })
    // If the user has the required group then this will return true
    req.skyAuth.adminAccess = groups.data.value.some(group => group.displayName === adminAccessGroup || group.displayName === globalAdminAccessGroup)

    // authCheck is used to secure individual apis.
    // Example call from a HTTP function:
    // exports.handler = arc.http.async((req) => authenticate(req, { exampleAccess: 'Example AD Group' }), httpFunction)

    if (authCheck) {
      for (const auth in authCheck) {
        req.skyAuth[auth] = groups.data.value.some(group => group.displayName === authCheck[auth])
      }
    }
  } catch (error) {
    console.log('There was an error authenticating', error)
    return returnError(error)
  }
  return req
}

module.exports = authenticate