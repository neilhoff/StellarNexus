const arc = require('@architect/functions')

async function handler (req) {
  return {
    statusCode: 200,
    headers: {
      'access-control-allow-origin': '*',
      'access-control-request-method': '*',
      'access-control-allow-methods': 'OPTIONS, GET',
      'access-control-allow-headers': '*'
    }
  }
}


exports.handler = arc.http(handler)