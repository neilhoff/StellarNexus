@app
stellar_nexus

@aws
profile default
region us-west-2

@http
get /api/call-api
get /api/stellar-tracks

options /api/*

@ws
connect
disconnect
broadcast-update
stellar-track
chat

@tables
stellarTracks
  pk *String
  sk **String
  expires TTL
connections
  connectionId *String
  expires TTL
chat
  pk *String
  sk **String

@tables-streams
connections

@shared

@static
folder public