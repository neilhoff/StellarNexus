import arc from '@architect/functions'
import { allShards, pLimit } from '@architect/shared/tableHelper.mjs'
import { getYearMonth } from '@architect/shared/format.mjs'
import { logError } from '@architect/shared/stellarErrorLogger.mjs'

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
  const start = new Date(startDate)
  const end = endOfDayUTC(new Date(endDate))

  // Collect months
  const months = new Set()
  let cur = new Date(start)
  while (cur <= end) {
    months.add(getYearMonth(cur))
    cur.setUTCDate(cur.getUTCDate() + 1)
  }

  let tracks = []
  const limit = pLimit(25)  // 25 parallel queries max (DynamoDB + Lambda safe)

  const promises = []

  for (const month of months) {
    const monthStart = new Date(`${month}-01T00:00:00.000Z`)
    const monthEnd = endOfDayUTC(new Date(monthStart.getUTCFullYear(), monthStart.getUTCMonth() + 1, 0))
    const queryStart = start > monthStart ? start : monthStart
    const queryEnd = end < monthEnd ? end : monthEnd

    for (const shard of allShards()) {
      const pk = `${trackType}#${shard}#${month}`
      promises.push(
        limit(async () => {
          const result = await table.query({
            KeyConditionExpression: 'pk = :pk AND sk BETWEEN :start AND :end',
            ExpressionAttributeValues: {
              ':pk': pk,
              ':start': queryStart.toISOString(),
              ':end': queryEnd.toISOString()
            }
          })
          if (result.Items) {
            tracks.push(...result.Items)
          }
        })
      )
    }
  }

  await Promise.all(promises)
  // Sort once
  tracks.sort((a, b) => {
    const aTime = a.trackData?.timeStamp || a.errorData?.timeStamp
    const bTime = b.trackData?.timeStamp || b.errorData?.timeStamp
    return new Date(bTime) - new Date(aTime)
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
  const tracksCopy = [...tracks]
  const total = tracksCopy.length
  const viewTotals = {
    total,
    summaryByDay: new Map()
  }
  const propertyCounts = new Map()
  const summaryBy = {}
  propertiesToSummarize.forEach(key => {
    summaryBy[key] = new Map()
  })

  for (const item of tracksCopy) {
    const td = item.trackData ?? item.errorData
    if (!td) {
      continue
    }
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
  const result = { total, summary: {}, summaryByDay: {}, summaryBy: {} }
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

async function getStellarTracks (req, context) {
  try {
    const { trackType, dateStart, dateEnd } = req.queryStringParameters || {}
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
    const tracks = await getTracks(trackType, startDate, endDate)
    let summary = {}
    summary = getSummary(tracks)

    const returnObj = {
      tracks,
      ...summary
    }
    return {
      cors: true,
      statusCode: 200,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(returnObj)
    }
  } catch (error) {
    const correlationId = await logError(error, 'server', null, { req, context })
    return {
      body: JSON.stringify({ correlationId, error: `Server Error: Failed to retrieve the log. Please try again later.` }),
      cors: true,
      statusCode: 500
    }
  }
}

export const handler = arc.http(getStellarTracks)