const arc = require('@architect/functions')
const axios = require('axios')

async function callApi (req, context) {
  const queryParams = req.queryStringParameters

  try {
    const result = await axios({
      method: 'get',
      url: queryParams.url,
      headers: {
        ...queryParams.headers
      }
    })
    return {
      body: JSON.stringify(result.data),
      cors: true,
      statusCode: 200
    }
  } catch (error) {
    console.log(error.response)
    console.log('THERE WAS AN ERROR!!!')
    return {
      json: {
        ...error.response.data
      },
      cors: true,
      statusCode: error.response?.status || 500
    }
  }

}

exports.handler = arc.http(callApi)