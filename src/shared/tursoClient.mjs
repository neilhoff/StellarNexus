import { createClient } from '@libsql/client'

let dbClient = null

function getTursoClient () {
  if (dbClient) return dbClient

  const databaseUrl = process.env.TURSO_DATABASE_URL
  const authToken = process.env.TURSO_AUTH_TOKEN

  if (!databaseUrl) {
    throw new Error('TURSO_DATABASE_URL environment variable is required')
  }

  dbClient = createClient({
    url: databaseUrl,
    authToken: authToken || undefined
  })

  return dbClient
}

export { getTursoClient }
