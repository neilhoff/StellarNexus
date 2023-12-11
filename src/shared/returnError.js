function returnError (error) {
  return {
    statusCode: 500,
    headers: { 'content-type': 'text/html; charset=utf-8;' },
    body: error.message
  }
}

module.exports = returnError