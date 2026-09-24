# Connections Data Model

## Overview

The `connections` table tracks active WebSocket connections for real-time features. It stores connection metadata including user identity, connection timestamps, and token expiration information.

## Table Structure

**Table Name:** `connections`

**Primary Key:**
- `connectionId` (String) - Unique WebSocket connection identifier

**Global Secondary Index:**
- `email` (String) - Allows querying connections by user email

**TTL:** `expires` (Number) - Epoch timestamp for automatic item expiration

## Schema

```arc
@tables
connections
  connectionId *String
  expires TTL

@indexes
connections
  email *String
```

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| `connectionId` | String | Unique WebSocket connection ID (partition key) |
| `email` | String | User's email address (GSI partition key) |
| `userName` | String | User's display name or email |
| `connectedAt` | String | ISO timestamp when connection was established |
| `tokenExpiresAt` | Number/null | Epoch timestamp when auth token expires |
| `expires` | Number | Epoch timestamp for DynamoDB TTL (auto-cleanup) |

## Usage Patterns

### Connection Lifecycle

1. **WebSocket Connect** (`src/ws/connect/index.mjs`)
   - Extracts user identity from connection event
   - Stores connection metadata in DynamoDB
   - Sets expiration based on token expiration or 24-hour default

2. **WebSocket Disconnect** (`src/ws/disconnect/index.mjs`)
   - Removes connection record from DynamoDB
   - Cleans up stale connection data

3. **Broadcast Updates** (`src/ws/broadcast-update/index.mjs`)
   - Queries connections table to get all active connections
   - Sends real-time updates to connected clients

### Query Patterns

**Get connection by ID:**
```javascript
const connection = await connectionsTable.get({ connectionId })
```

**Get all connections for a user:**
```javascript
const userConnections = await connectionsTable.query({
  IndexName: 'email-index',
  KeyConditionExpression: 'email = :email',
  ExpressionAttributeValues: { ':email': userEmail }
})
```

**Get all active connections:**
```javascript
const allConnections = await connectionsTable.scan({})
```

## Data Flow

```
Client WebSocket Connect
    ↓
ws/connect handler
    ↓
Extract identity from token
    ↓
Store in connections table
    ↓
Real-time features can now target this connection
```

## Expiration Strategy

- **Default TTL:** 24 hours from connection time
- **Token-based TTL:** Uses auth token expiration if available
- **Automatic cleanup:** DynamoDB TTL feature removes expired items
- **Manual cleanup:** Disconnect handler removes items immediately

## Use Cases

1. **Real-time Notifications** - Push updates to specific users
2. **Live Dashboard Updates** - Broadcast data changes to connected clients
3. **Presence Tracking** - Show which users are currently online
4. **Targeted Messaging** - Send messages to specific connections

## Related Code

- `src/ws/connect/index.mjs` - Connection handler
- `src/ws/disconnect/index.mjs` - Disconnection handler
- `src/ws/broadcast-update/index.mjs` - Broadcast handler
- `src/shared/authIdentity.mjs` - Identity extraction from WebSocket events

## Security Considerations

- Connection records include user identity - ensure proper access controls
- Token expiration is tracked but not enforced at connection level
- Consider validating token status before sending sensitive data
- Connection IDs are sensitive - don't expose to clients
