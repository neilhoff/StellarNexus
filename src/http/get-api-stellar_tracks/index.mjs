import arc from '@architect/functions'

const pluralMap = {
  userName: 'userNames',
  fromUrl: 'fromUrls',
  url: 'urls',
  browser: 'browsers',
  deviceType: 'deviceTypes',
  os: 'oses',
  mobileDeviceType: 'mobileDeviceTypes',
  leftDrawerState: 'leftDrawerStates',
  darkMode: 'darkMode'
}
const propertiesToSummarize = new Set(Object.keys(pluralMap))

async function getTracks (trackType, startDate, endDate) {
  const db = await arc.tables()
  const table = db.stellarTracks

  const start = new Date(startDate)
  const end = new Date(endDate)

  const months = new Set()
  let current = new Date(start)
  while (current <= end) {
    const month = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}`
    months.add(month)
    current.setDate(current.getDate() + 1)
  }

  const tracks = []

  for (const month of months) {
    const monthStart = new Date(month + '-01')
    const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0)
    const queryStart = start > monthStart ? start : monthStart
    const queryEnd = end < monthEnd ? end : monthEnd

    try {
      const result = await table.query({
        KeyConditionExpression: 'pk = :month AND sk BETWEEN :start AND :end',
        ExpressionAttributeValues: {
          ':month': month,
          ':start': `${queryStart.toISOString()}#${trackType}`,
          ':end': `${queryEnd.toISOString()}#${trackType}`
        }
      })

      if (result.Items) tracks.push(...result.Items)
    } catch (error) {
      console.error(`Failed to query ${month}:`, error)
    }
  }

  tracks.sort((a, b) => new Date(a.trackData.timeStamp) - new Date(b.trackData.timeStamp))

  return tracks
}

function getSummary (tracks) {
  const totalViews = tracks.length
  const viewTotals = { totalViews, summaryByDay: new Map() }
  const propertyCounts = new Map()

  for (const { trackData: td } of tracks) {
    const day = td.timeStamp.slice(0, 10).replace(/-/g, '/') // Optimize: yyyy/M/dd
    let dayMap = viewTotals.summaryByDay.get(day)
    if (!dayMap) {
      dayMap = new Map()
      viewTotals.summaryByDay.set(day, dayMap)
      dayMap.set('total', 0)
    }
    dayMap.set('total', (dayMap.get('total') || 0) + 1)
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
      let dayKeyMap = dayMap.get(pluralKey)
      if (!dayKeyMap) {
        dayKeyMap = new Map()
        dayMap.set(pluralKey, dayKeyMap);
      }
      dayKeyMap.set(value, (dayKeyMap.get(value) || 0) + 1)
    }
  }

  // Convert Maps to objects for return
  const result = { totalViews, summaryByDay: {} }
  for (const [key, map] of propertyCounts) {
    result[key] = Object.fromEntries(map)
  }
  for (const [day, map] of viewTotals.summaryByDay) {
    result.summaryByDay[day] = Object.fromEntries(
      Array.from(map, ([key, value]) => [
        key,
        value instanceof Map ? Object.fromEntries(value) : value
      ])
    )
  }
  return result;
}

async function getStellarTracks (req) {
  const { trackType, start, end } = req.queryStringParameters || {}
  console.log(trackType, start, end)
  if (!trackType) {
    return {
      cors: true,
      statusCode: 400,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ error: 'trackType query parameter is required' })
    }
  }

  const endDate = end || new Date().toISOString()
  const startDate = start || new Date(new Date(endDate).setDate(new Date(endDate).getDate() - 6)).toISOString()

  try {
    const tracks = await getTracks(trackType, startDate, endDate)
    // const startTime = Date.now()
    const summary = getSummary(tracks)
    const summaryByDay = summary.summaryByDay
    delete summary.summaryByDay

    const returnObj = {
      tracks,
      summaryByDay,
      summary
    }
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