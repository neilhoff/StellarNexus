import arc from '@architect/functions'

export const handler = async (event) => {
  const connectionId = event.requestContext.connectionId
  const tables = await arc.tables()
  const connectionsTable = tables.connections

  try {
    await connectionsTable.put({
      connectionId
    })
    console.log(`WS Connected for ${connectionId}`)
  } catch (error) {
    console.error('Error storing connection:', error)
  }

  return { statusCode: 200 }
}