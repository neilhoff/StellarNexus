const arc = require('@architect/functions')
const axios = require('axios')
const qs = require('qs')

async function callApi (req, context) {
  const queryParams = qs.parse(req.query)

  const result = await axios({
    method: 'get',
    url: queryParams.params.url
  })
  return {
    body: JSON.stringify(result.data),
    cors: true,
    statusCode: 200
  }
}

exports.handler = arc.http(callApi)