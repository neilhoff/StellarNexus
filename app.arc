@app
stellar_nexus

@aws
profile default
region us-west-2

@http
get /api/call-api
get /api/stellar-tracks
get /api/admin/users

post /api/admin/users/update
post /api/admin/users/disable
post /api/auth

options /api/*

@ws
connect
disconnect
broadcast-update
stellar-track

@tables
stellarTracks
  pk *String
  sk **String
  expires TTL
connections
  connectionId *String
  expires TTL

@indexes
connections
  email *String

@shared

@static
folder public