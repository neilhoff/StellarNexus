const arc = require('@architect/functions')
const axios = require('axios')

async function callApi (req, context) {
  const queryParams = req.queryStringParameters

  const result = await axios({
    method: 'get',
    url: queryParams.url
  })
  return {
    body: JSON.stringify(result.data),
    cors: true,
    statusCode: 200
  }
}

exports.handler = arc.http(callApi)