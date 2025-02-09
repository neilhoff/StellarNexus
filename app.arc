@app
stellar_nexus

@aws
profile default
region us-west-1
runtime nodejs18.x

@http
  post /api/sign-up
  post /api/sign-in
  post /api/sign-out
  get /api/auth-check

  get /api/skylogs
  post /api/skylogs
  get /api/call-api

  options /api/*

@shared

@tables
sessions # https://arc.codes/docs/en/guides/frontend/sessions
  _idx *
  ttl ttl

skylogs
  pk *String
  sk **Number
  expires TTL

users
  username *String
  encrypt true
  PointInTimeRecovery true

roles
  ruleID *String

@static
folder public

@cdn
  