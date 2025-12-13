import arc from '@architect/functions'
import { getRandomShard } from '@architect/shared/tableHelper.mjs'
import { getYearMonth } from '@architect/shared/format.mjs'
import { logError } from '@architect/shared/stellarErrorLogger.mjs'

export async function handler (event) {
  const body = JSON.parse(event.body)
  const trackData = body.data
  const type = trackData.type || 'track'
  trackData.data.side = 'client'

  try {
    if (type === 'error') {
      const errorItem = await logError(trackData.data, 'client', trackData.data.correlationId)
      return { success: true, errorItem }
    } else {
      const tables = await arc.tables()
      const stellarTracksTable = tables.stellarTracks
      // Decide which timestamp to use
      // Prefer client-provided timestamp (supports offline sync)
      // Fallback to server time
      const clientTime = trackData?.timeStamp
      const useTime = clientTime ? new Date(clientTime) : new Date()
      const timeStamp = useTime.toISOString()           // ISO string for SK
      const month = getYearMonth(useTime)               // "2025-11"
      const shard = getRandomShard()
      const item = {
        pk: `${type}#${shard}#${month}`,
        sk: `${timeStamp}`,
        ...{ trackData: trackData.data }
      }

      await stellarTracksTable.put(item)
      return { success: true, item }
    }


  } catch (error) {
    console.error('Failed to save track:', error)
    return { success: false, error: error.message }
  }
}