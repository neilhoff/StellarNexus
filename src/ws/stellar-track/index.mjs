import arc from '@architect/functions'

// async function saveTrack (trackType, trackData) {
//   const db = await arc.tables()
//   const table = db.StellarTrack

//   const currentDate = new Date('2025-10-21T08:21:00-05:00') // Current date: October 21, 2025, 08:21 AM CDT
//   const month = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`
//   const date = currentDate.toISOString().split('T')[0]

//   const item = {
//     pk: month,
//     sk: `${date}#${trackType}`,
//     trackData: getDefaultTrackingData(trackData)
//   }

//   try {
//     await table.put(item)
//     return { success: true, item }
//   } catch (error) {
//     console.error('Failed to save track:', error)
//     throw new Error('Failed to save track')
//   }
// }

export async function handler (event) {
  const body = JSON.parse(event.body)
  const trackData = body.data
  console.log(trackData)
  const tables = await arc.tables()
  const stellarTracksTable = tables.stellarTracks

  const currentDate = new Date()
  const month = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`
  // TODO: Should we take the client's date of track instead to allow for offline saving of tracking data that can sync up?
  const timeStamp = currentDate.toISOString()

  const item = {
    pk: month,
    sk: `${timeStamp}#${trackData.type}`,
    trackData: trackData.data
  }
  console.log(item)

  try {
    await stellarTracksTable.put(item)
    return { success: true, item }
  } catch (error) {
    console.error('Failed to save track:', error)
    // throw new Error('Failed to save track')
  }
}