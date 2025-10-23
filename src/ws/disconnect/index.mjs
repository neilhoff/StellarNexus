import arc from '@architect/functions'

export const handler = async (event) => {
  const connectionId = event.requestContext.connectionId
  const tables = await arc.tables()
  const connectionsTable = tables.connections

  try {
    await connectionsTable.delete({
      connectionId,
    })
    console.log('Client disconnected:', connectionId)
  } catch (error) {
    console.error('Error removing connection:', error)
  }

  return { statusCode: 200 }
}