import arc from '@architect/functions'
import { getRandomShard } from '@architect/shared/tableHelper.mjs'
import { getYearMonth } from '@architect/shared/format.mjs'

export async function handler (event) {
  const startTime = Date.now()


  const body = JSON.parse(event.body)
  const trackData = body.data
  console.log(trackData)
  const tables = await arc.tables()
  const stellarTracksTable = tables.stellarTracks

  // const currentDate = new Date()
  // const month = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`
  // // TODO: Should we take the client's date of track instead to allow for offline saving of tracking data that can sync up?
  // // Or we could setup an option to say this is the offline tracking so use the date from the client.
  // const timeStamp = currentDate.toISOString()

  // const item = {
  //   pk: month,
  //   sk: `${timeStamp}#${trackData.type}`,
  //   trackData: trackData.data
  // }
  // console.log(item)

  // Decide which timestamp to use
  // Prefer client-provided timestamp (supports offline sync)
  // Fallback to server time
  const clientTime = trackData?.timeStamp
  const useTime = clientTime ? new Date(clientTime) : new Date()
  const timeStamp = useTime.toISOString()           // ISO string for SK
  const month = getYearMonth(useTime)               // "2025-11"

  // Setup the item with the sharded pk
  const type = trackData.type || 'track'
  const shard = getRandomShard()

  const item = {
    pk: `${type}#${shard}#${month}`,
    sk: `${timeStamp}`,
    // Store the whole payload under the correct key
    ...(type === 'error' ? { errorData: trackData.data } : { trackData: trackData.data })
  }

  console.log('Saving item:', item)
  console.log(`It took ${Date.now() - startTime} ms to save a track`)
  try {
    await stellarTracksTable.put(item)
    return { success: true, item }
  } catch (error) {
    console.error('Failed to save track:', error)
    return { success: false, error: error.message }
  }
}