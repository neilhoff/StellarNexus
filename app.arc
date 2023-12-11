@app
stellar_nexus

@aws
profile default
region us-west-1
runtime nodejs18.x

@http
  get /api/skylogs
  post /api/skylogs
  get /api/call-api

  options /api/*

@shared

@tables
skylogs
  pk *String
  sk **Number
  expires TTL

@static
folder public

@cdn
  