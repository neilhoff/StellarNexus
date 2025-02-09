const arc = require('@architect/functions')

function createErrorInstance (errorCode, message, statusCode) {
  const customError = new Error(message)
  customError.statusCode = statusCode
  customError.code = errorCode
  return customError
}
function createReturnError (err) {
  console.log('TESTING', err)
  return {
    statusCode: err instanceof Error && err.statusCode || 500,
    headers: {
      'content-type': 'application/json; charset=utf8',
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Allow-Origin': process.env.CORS_ORIGIN
    },
    body: JSON.stringify({
      error: {
        message: err instanceof Error ? err.message : 'An unexpected error occurred',
        code: err instanceof Error && err.code ? err.code : 'INTERNAL_SERVER_ERROR'
      }
    }),
    cors: true
  }
}

module.exports = {
  createErrorInstance,
  createReturnError
}