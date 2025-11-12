import arc from '@architect/functions'
import { allShards, pLimit } from '@architect/shared/tableHelper.mjs'
import { getYearMonth } from '@architect/shared/format.mjs'

const pluralMap = {
  userName: 'userNames',
  fromUrl: 'fromUrls',
  url: 'urls',
  browser: 'browsers',
  deviceType: 'deviceTypes',
  os: 'oses',
  mobileDeviceType: 'mobileDeviceTypes',
  leftDrawerState: 'leftDrawerStates',
  darkMode: 'darkMode',
  dataCy: 'clickedItems'
}
const propertiesToSummarize = new Set(Object.keys(pluralMap))

function endOfDayUTC (date = new Date()) {
  const d = new Date(Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate() + 1
  ))
  return new Date(d.getTime() - 1)
}

async function getTracks (trackType, startDate, endDate) {
  const db = await arc.tables()
  const table = db.stellarTracks
  console.log(startDate)
  const start = new Date(startDate)
  const end = endOfDayUTC(new Date(endDate))

  // Collect months
  const months = new Set()
  let cur = new Date(start)
  while (cur <= end) {
    months.add(getYearMonth(cur))
    cur.setUTCDate(cur.getUTCDate() + 1)
  }

  const tracks = []
  const limit = pLimit(25)  // 25 parallel queries max (DynamoDB + Lambda safe)

  const promises = []

  for (const month of months) {
    const monthStart = new Date(`${month}-01T00:00:00.000Z`)
    const monthEnd = endOfDayUTC(new Date(monthStart.getUTCFullYear(), monthStart.getUTCMonth() + 1, 0))
    const queryStart = start > monthStart ? start : monthStart
    const queryEnd = end < monthEnd ? end : monthEnd

    console.log(queryStart.toISOString())
    console.log(queryEnd.toISOString())

    for (const shard of allShards()) {
      const pk = `${trackType}#${shard}#${month}`
      // console.log(pk)

      promises.push(
        limit(async () => {
          try {
            const result = await table.query({
              KeyConditionExpression: 'pk = :pk AND sk BETWEEN :start AND :end',
              ExpressionAttributeValues: {
                ':pk': pk,
                ':start': queryStart.toISOString(),
                ':end': queryEnd.toISOString()
              }
            })
            // console.log(result)
            if (result.Items) {
              tracks.push(...result.Items)
            }
          } catch (err) {
            console.error(`Query failed for ${pk}:`, err)
          }
        })
      )
    }
  }

  await Promise.all(promises)
  // console.log('tracks', tracks)
  // Sort once
  tracks.sort((a, b) => {
    const aTime = a.trackData?.timeStamp || a.errorData?.timeStamp
    const bTime = b.trackData?.timeStamp || b.errorData?.timeStamp
    return new Date(aTime) - new Date(bTime)
  })

  return tracks
}

function getSummaryMap (summaryItem, value) {
  let sMap = summaryItem.get(value)
  if (!sMap) {
    sMap = new Map()
    summaryItem.set(value, sMap)
    sMap.set('total', 0)
  }
  sMap.set('total', (sMap.get('total') || 0) + 1)
  return sMap
}

function updateSummaryCounts (sMap, pluralKey, value) {
  let sKeyMap = sMap.get(pluralKey)
  if (!sKeyMap) {
    sKeyMap = new Map()
    sMap.set(pluralKey, sKeyMap);
  }
  sKeyMap.set(value, (sKeyMap.get(value) || 0) + 1)
}

function convertMapToObject (sMap) {
  const sObj = {}
  for (const [day, map] of sMap) {
    sObj[day] = Object.fromEntries(
      Array.from(map, ([key, value]) => [
        key,
        value instanceof Map ? Object.fromEntries(value) : value
      ])
    )
  }
  return sObj
}

function getSummary (tracks) {
  const totalViews = tracks.length
  const viewTotals = {
    totalViews,
    summaryByDay: new Map()
  }
  const propertyCounts = new Map()
  const summaryBy = {}
  propertiesToSummarize.forEach(key => {
    summaryBy[key] = new Map()
  })

  for (const { trackData: td } of tracks) {
    // Setup daily summary
    const day = td.timeStamp.slice(0, 10).replace(/-/g, '/') // Optimize: yyyy/M/dd
    const dayMap = getSummaryMap(viewTotals.summaryByDay, day)

    // Setup summary counts for each item in the propertiesToSummarize
    const summaryMap = {}
    for (const key of Object.keys(summaryBy)) {
      summaryMap[key] = getSummaryMap(summaryBy[key], td[key])
    }

    // Iterate through each track
    for (const [key, value] of Object.entries(td)) {
      if (!propertiesToSummarize.has(key)) continue
      const pluralKey = pluralMap[key]

      // Update overall counts
      let keyMap = propertyCounts.get(pluralKey)
      if (!keyMap) {
        keyMap = new Map()
        propertyCounts.set(pluralKey, keyMap)
      }
      keyMap.set(value, (keyMap.get(value) || 0) + 1)

      // Update daily counts
      updateSummaryCounts(dayMap, pluralKey, value)

      // Update all other summary counts
      for (const key of Object.keys(summaryBy)) {
        updateSummaryCounts(summaryMap[key], pluralKey, value)
      }
    }
  }

  // Convert Maps to objects for return
  const result = { totalViews, summary: {}, summaryByDay: {}, summaryBy: {} }
  // overall summary
  for (const [key, map] of propertyCounts) {
    result.summary[key] = Object.fromEntries(map)
  }
  // Summary by day
  result.summaryByDay = convertMapToObject(viewTotals.summaryByDay)

  // All other summaries
  for (const key of Object.keys(summaryBy)) {
    result.summaryBy[key] = convertMapToObject(summaryBy[key])
  }

  return result
}

async function getStellarTracks (req) {
  const { trackType, dateStart, dateEnd } = req.queryStringParameters || {}
  // console.log('end', dateEnd, dateStart, trackType)
  if (!trackType) {
    return {
      cors: true,
      statusCode: 400,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ error: 'trackType query parameter is required' })
    }
  }

  const endDate = dateEnd || new Date().toISOString()
  const startDate = dateStart || new Date(new Date(endDate).setDate(new Date(endDate).getDate() - 6)).toISOString()

  try {
    // const startTime = Date.now()
    const tracks = await getTracks(trackType, startDate, endDate)

    const summary = getSummary(tracks)

    const returnObj = {
      tracks,
      ...summary
    }
    // console.log(returnObj)
    // console.log(`Processed ${tracks.length} tracks in ${Date.now() - startTime} ms`)
    return {
      cors: true,
      statusCode: 200,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(returnObj)
    }
  } catch (error) {
    console.error('Query failed:', error)
    return {
      cors: true,
      statusCode: 500,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ error: 'Failed to retrieve tracks' })
    }
  }
}

export const handler = arc.http(getStellarTracks)