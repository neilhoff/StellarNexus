import arc from '@architect/functions'
import { getIdentityFromConnectEvent } from '@architect/shared/authIdentity.mjs'

export async function handler (event) {
  const connectionId = event.requestContext.connectionId
  const tables = await arc.tables()
  const connectionsTable = tables.connections

  try {
    const identity = await getIdentityFromConnectEvent(event)
    const email = identity.email
    const nowEpoch = Math.floor(Date.now() / 1000)
    const expires = Number.isFinite(identity.tokenExp) ? identity.tokenExp : nowEpoch + (24 * 60 * 60)

    await connectionsTable.put({
      connectionId,
      userName: email,
      email,
      connectedAt: new Date().toISOString(),
      tokenExpiresAt: identity.tokenExp || null,
      expires
    })
    console.log(`WS Connected for ${connectionId}`)
  } catch (error) {
    console.error('Error storing connection:', error)
  }

  return { statusCode: 200 }
}