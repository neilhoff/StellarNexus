# StellarTracks Data Model

## Overview

The `stellarTracks` table stores analytics and tracking events from both client and server. It uses a time-based partitioning strategy with monthly shards for efficient querying and automatic data lifecycle management.

## Table Structure

**Table Name:** `stellarTracks`

**Primary Key:**
- `pk` (String) - Partition key in format `{type}#{shard}#{month}`
- `sk` (String) - Sort key as ISO timestamp

**TTL:** `expires` (Number) - Epoch timestamp for automatic item expiration

## Schema

```arc
@tables
stellarTracks
  pk *String
  sk **String
  expires TTL
```

## Key Structure

### Partition Key (pk)

Format: `{type}#{shard}#{month}`

- **type** - Event type (e.g., `track`, `error`, `pageview`, `click`)
- **shard** - Random shard (0-F) for write distribution
- **month** - Year-month in format `YYYY-MM`

Examples:
- `track#3#2026-06`
- `error#A#2026-06`
- `pageview#7#2026-06`

### Sort Key (sk)

ISO 8601 timestamp for chronological ordering:
- `2026-06-07T14:30:45.123Z`

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| `pk` | String | Partition key (type#shard#month) |
| `sk` | String | ISO timestamp (sort key) |
| `trackData` | Map | Event payload (varies by type) |
| `expires` | Number | Epoch timestamp for TTL (optional) |

### trackData Structure

The `trackData` attribute contains the event payload. Structure varies by event type:

**Track Event:**
```javascript
{
  event: 'button_click',
  side: 'client',
  page: '/dashboard',
  userId: 'user-123',
  properties: {
    buttonId: 'submit-form',
    label: 'Submit'
  }
}
```

**Error Event:**
```javascript
{
  type: 'error',
  side: 'client',
  message: 'Failed to load data',
  stack: 'Error: ...',
  correlationId: 'abc-123',
  context: {
    page: '/dashboard',
    action: 'loadData'
  }
}
```

**Page View:**
```javascript
{
  event: 'pageview',
  side: 'client',
  page: '/dashboard',
  title: 'Dashboard',
  referrer: '/login',
  userId: 'user-123'
}
```

## Usage Patterns

### Writing Events

**WebSocket Handler** (`src/ws/stellar-track/index.mjs`):
```javascript
const item = {
  pk: `${type}#${shard}#${month}`,
  sk: timeStamp,
  trackData: trackData.data
}
await stellarTracksTable.put(item)
```

**Error Logging** (`src/shared/stellarErrorLogger.mjs`):
```javascript
const item = {
  pk: `error#${shard}#${month}`,
  sk: timestamp,
  trackData: errorData,
  expires: epochExpires
}
```

### Querying Events

**Get all events for a month:**
```javascript
const events = await stellarTracksTable.query({
  KeyConditionExpression: 'pk = :pk',
  ExpressionAttributeValues: {
    ':pk': 'track#3#2026-06'
  }
})
```

**Get events in time range:**
```javascript
const events = await stellarTracksTable.query({
  KeyConditionExpression: 'pk = :pk AND sk BETWEEN :start AND :end',
  ExpressionAttributeValues: {
    ':pk': 'track#3#2026-06',
    ':start': '2026-06-01T00:00:00Z',
    ':end': '2026-06-07T23:59:59Z'
  }
})
```

**Query all shards for a month:**
```javascript
// Must query each shard separately (0-F)
const shards = '0123456789ABCDEF'.split('')
const queries = shards.map(shard => 
  stellarTracksTable.query({
    KeyConditionExpression: 'pk = :pk',
    ExpressionAttributeValues: {
      ':pk': `track#${shard}#2026-06`
    }
  })
)
const results = await Promise.all(queries)
```

## Data Flow

```
Client Event (click, pageview, error)
    ↓
WebSocket: stellar-track action
    ↓
ws/stellar-track handler
    ↓
Determine type (track/error)
    ↓
Generate pk: type#shard#month
    ↓
Generate sk: ISO timestamp
    ↓
Store in stellarTracks table
```

## Sharding Strategy

### Why Shard?

DynamoDB partitions data by partition key. Without sharding, all writes for a month would go to a single partition, creating a hot partition and limiting throughput.

### How It Works

1. **Random Shard Selection:** Each event gets a random shard (0-F = 16 shards)
2. **Distributed Writes:** Events spread across 16 partitions
3. **Query All Shards:** To get all events for a month, query all 16 shards and merge results

### Shard Distribution

```javascript
function getRandomShard() {
  return Math.floor(Math.random() * 16).toString(16).toUpperCase()
}
```

This gives 16 possible shards: 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, A, B, C, D, E, F

## Event Types

### track
General analytics events (clicks, page views, custom events)

### error
Client and server errors with stack traces and context

### pageview
Page navigation events

### click
UI element click events

### custom
Application-specific event types

## Expiration Strategy

- **Default:** No expiration (permanent storage)
- **Error logs:** Can set TTL for automatic cleanup (e.g., 90 days)
- **TTL attribute:** `expires` (epoch timestamp)
- **DynamoDB TTL:** Automatically deletes expired items

## Use Cases

1. **Analytics Dashboard** - Track user behavior and feature usage
2. **Error Monitoring** - Capture and analyze client/server errors
3. **Performance Tracking** - Monitor page load times and API latency
4. **A/B Testing** - Track experiment conversions
5. **Audit Trail** - Log important user actions

## Related Code

- `src/ws/stellar-track/index.mjs` - WebSocket handler for incoming events
- `src/shared/stellarErrorLogger.mjs` - Server-side error logging
- `src/http/get-api-stellar-tracks/index.mjs` - API endpoint for querying events
- `client/src/services/stellarTrack.js` - Client-side tracking service
- `src/shared/tableHelper.mjs` - Helper functions for shard generation

## Performance Considerations

### Write Performance
- **Sharding:** 16 shards distribute write load
- **Batch writes:** Use `BatchWriteItem` for bulk inserts
- **On-demand capacity:** Handles traffic spikes automatically

### Query Performance
- **Single shard query:** Fast (single partition)
- **Multi-shard query:** Slower (must query 16 partitions)
- **Time range queries:** Efficient with sort key
- **Pagination:** Use `Limit` and `ExclusiveStartKey` for large result sets

### Cost Optimization
- **TTL:** Automatically expire old data to reduce storage costs
- **Sparse indexes:** Only create indexes you actually query
- **Projection expressions:** Only retrieve needed attributes

## Security Considerations

- Track data may contain PII - ensure proper access controls
- Error logs may contain sensitive information - sanitize before logging
- Consider data retention policies for compliance (GDPR, CCPA)
- Don't log passwords, tokens, or other secrets in trackData
