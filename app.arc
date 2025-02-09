@app
stellar_nexus

@http
get /

options /api/*

@aws
profile default
region us-west-2

@shared

@static
folder public