const arc = require('@architect/functions')

function returnObj (session, bodyObj, statusCode) {
  return {
    session,
    body: JSON.stringify(bodyObj),
    headers: {
      'Access-Control-Allow-Origin': process.env.CORS_ORIGIN,
      'Access-Control-Allow-Credentials': 'true',
    },
    statusCode
  }
}

async function authCheck (req, context) {
  let { session } = req
  console.log(session)

  if (session.user) {
    console.log(session.user)
    return returnObj(session, { message: 'The user is signed in.', signedIn: true }, 200)
  } else {
    return returnObj(session, { message: 'Not Signed in', signedIn: false }, 401)
  }

}

exports.handler = arc.http(authCheck)
