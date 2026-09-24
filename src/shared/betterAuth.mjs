import { betterAuth } from 'better-auth'
import { turso } from 'better-auth/adapters'
import { getTursoClient } from './tursoClient.mjs'
import { createClient } from '@libsql/client'

function getBetterAuth () {
  const tursoClient = getTursoClient()

  return betterAuth({
    database: turso({
      client: tursoClient,
      schema: {
        user: 'user',
        session: 'session',
        account: 'account',
        verification: 'verification'
      }
    }),
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: false
    },
    user: {
      additionalFields: {
        roles: {
          type: 'string',
          required: false,
          defaultValue: '["user"]',
          returned: true
        },
        disabled: {
          type: 'boolean',
          required: false,
          defaultValue: false,
          returned: true
        }
      }
    },
    session: {
      expiresIn: 60 * 60 * 24 * 7,
      updateAge: 60 * 60 * 24
    },
    advanced: {
      cookiePrefix: 'stellar-nexus',
      crossSubDomainCookies: {
        enabled: false
      }
    }
  })
}

export { getBetterAuth }
