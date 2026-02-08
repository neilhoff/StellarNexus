// By using Shards to query you lower the risk of throttling while still keeping costs low
// You will need to query 256 items per month
// But each query is tiny (1 RCU), and parallelizable
const SHARD_CHARS = 1                // 0-F → 16 shards
const SHARD_COUNT = 16 ** SHARD_CHARS // 16^1 = 16 possible shards

function getRandomShard () {
  return Math.floor(Math.random() * SHARD_COUNT)
    .toString(16)
    .padStart(SHARD_CHARS, '0')
    .toUpperCase()
}

// All possible shard strings – generator (lazy)
function* allShards () {
  for (let i = 0; i < SHARD_COUNT; i++) {
    yield i.toString(16).padStart(SHARD_CHARS, '0').toUpperCase()
  }
}

// A Simple "Promise Concurrency Limiter"
function pLimit (concurrency) { // DynamoDB + Lambda safe at around concurrency <= 25
  const queue = []      // items waiting to run
  let active = 0        // how many are running right now

  const run = (fn) => {               // this is the function we return
    return new Promise((resolve, reject) => {
      const execute = async () => {   // the real work
        active++
        try {
          const result = await fn()   // user-supplied async work
          resolve(result)
        } catch (err) {
          reject(err)
        } finally {
          active--
          if (queue.length) queue.shift()()   // start next waiting task
        }
      }

      // start immediately if we have room, otherwise enqueue
      if (active < concurrency) execute()
      else queue.push(execute)
    })
  }

  return run   // caller does: limit(() => someAsync())
}

// AWS DynamoDB doesn't allow blank strings or undefined objects without the 'removeUndefinedValues' parameter
// Architect doesn't use the 'removeUndefinedValues' param

function blankToNull (value) {
  // Handle null/undefined first
  if (value === null || value === undefined) {
    return null
  }

  // Empty string → null
  if (value === '') {
    return null
  }

  // Empty array → null (or you can keep [] if preferred)
  if (Array.isArray(value) && value.length === 0) {
    return null
  }

  // Empty plain object {} → null
  if (value && typeof value === 'object' && !Array.isArray(value) && Object.keys(value).length === 0) {
    return null
  }

  // For non-empty objects: recurse into properties
  if (value && typeof value === 'object') {
    const cleaned = Array.isArray(value) ? [] : {}

    for (const key in value) {
      if (Object.prototype.hasOwnProperty.call(value, key)) {
        const cleanedValue = blankToNull(value[key])

        // Only keep the property if it's not null (optional: removes null keys entirely)
        if (cleanedValue !== null) {
          cleaned[key] = cleanedValue
        }
        // If you want to keep the key with null value, use:
        // cleaned[key] = cleanedValue
      }
    }

    // After cleaning, if object became empty → return null
    if (Object.keys(cleaned).length === 0) {
      return null
    }

    return cleaned
  }

  // For all other values (numbers, booleans, non-empty strings, etc.)
  return value
}

export { getRandomShard, allShards, pLimit, blankToNull }