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
  const queue = []      // tasks waiting to run
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

export { getRandomShard, allShards, pLimit }