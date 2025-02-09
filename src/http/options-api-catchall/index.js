const arc = require('@architect/functions')

async function handler (req) {
  console.log('OPTIONS TEST!!')
  return {
    statusCode: 200,
    headers: {
      'access-control-allow-credentials': 'true',
      'access-control-allow-origin': 'http://localhost:8080',
      'access-control-request-method': '*',
      'access-control-allow-methods': 'OPTIONS, GET, POST',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      // 'access-control-allow-headers': '*',
      // 'Access-Control-Allow-Headers': 'Content-Type'
    }
  }
}


exports.handler = arc.http(handler)