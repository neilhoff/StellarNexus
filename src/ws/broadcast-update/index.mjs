import arc from '@architect/functions'

export const handler = async (event) => {
  const body = JSON.parse(event.body)
  const dataToBroadcast = body.data
  const includeMe = body.includeMe
  const tables = await arc.tables()
  const connectionsTable = tables.connections
  try {
    // Fetch all active connection IDs
    const connections = await connectionsTable.scan({})
    const connectionIds = connections.Items.map((item) => item.connectionId)

    // Broadcast to all connected clients
    const broadcastPromises = connectionIds.map((id) => {
      if (!includeMe && event.requestContext.connectionId == id) {
        return
      } else {
        return arc.ws.send({
          id,
          payload: { ...dataToBroadcast },
        }).catch((err) => {
          console.error(`Failed to send to ${id}:`, err)
          return connectionsTable.delete({ connectionId: id }) // Clean up stale connection
        })
      }
    })
    await Promise.all(broadcastPromises)
  } catch (error) {
    console.error('Error processing message:', error)
    await arc.ws.send({
      id: event.requestContext.connectionId,
      payload: { message: 'Error saving message', error: error.message },
    })
  }

  return { statusCode: 200 }
}