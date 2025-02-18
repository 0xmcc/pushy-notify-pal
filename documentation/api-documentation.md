# ROI API Documentation

## Base URLs
- Local Development: `https://roi-backend-local.up.railway.app/`
- Production: `https://roi-backend-production.up.railway.app/`

## Authentication
Authentication details are not specified in the provided code. Contact the system administrator for authentication requirements.

## Inventory Management

### Update User Inventory
Updates a user's inventory of game resources (rock, paper, scissors) and off-chain balance.

```
PUT /api/inventory/:did
```

#### URL Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| did | string | Yes | Decentralized Identifier of the user |

#### Request Body
No request body is required. The endpoint calculates new values based on time elapsed.

#### Response
**Status Code: 200 OK**
```json
{
  "next_replenish": {
    "rock": 1708123456789,     // Timestamp in milliseconds since 1970 (Unix epoch) or null if at max
    "paper": 1708123456789,    // Timestamp in milliseconds since 1970 (Unix epoch) or null if at max
    "scissors": 1708123456789, // Timestamp in milliseconds since 1970 (Unix epoch) or null if at max
    "off_chain_balance": 1708123456789  // Timestamp in milliseconds since 1970 (Unix epoch) or null if positive balance
  }
}
```

#### Example curl command
```bash
curl -X PUT https://roi-backend-production.up.railway.app/api/inventory/did:example:123456789 \
  -H "Content-Type: application/json"
```

#### Error Responses

**Status Code: 400 Bad Request**
```json
{
  "error": "DID parameter is required"
}
```

**Status Code: 404 Not Found**
```json
{
  "error": "User not found"
}
```

**Status Code: 500 Internal Server Error**
```json
{
  "error": "Internal server error"
}
```

## Notifications

### Available Routes
```
GET /api/notifications/vapid-key
POST /api/notifications/send-notification
GET /test
```

Details for these endpoints are not fully specified in the provided code. Contact the system administrator for complete documentation.

## Game Configuration

The following game configuration parameters are used by the inventory management system:

> **Note:** All time-based values are in milliseconds since January 1, 1970 (Unix epoch timestamp)

| Parameter | Value | Description |
|-----------|-------|-------------|
| REPLENISH_INTERVAL | 5 minutes (300,000ms) | Time interval between resource replenishments |
| MAX_MOVES | 5 | Maximum number of moves (rock/paper/scissors) a user can have |
| OFF_CHAIN_BALANCE_INTERVAL | 30 minutes (1,800,000ms) | Time interval between off-chain balance replenishments |
| OFF_CHAIN_BALANCE_INCREMENT | 5 | Amount added to off-chain balance on replenishment |
| OFF_CHAIN_BALANCE_DEFAULT | 20 | Default off-chain balance for new users |

## Implementation Details

### Resource Replenishment Logic

Resources (rock, paper, scissors) are replenished automatically based on the following rules:
1. Each resource replenishes at a rate of 1 per `REPLENISH_INTERVAL` (5 minutes)
2. Resources cannot exceed `MAX_MOVES` (5)
3. Replenishment is calculated based on time elapsed since last update (in milliseconds since 1970)
4. All timestamp values in requests and responses use milliseconds since January 1, 1970 (Unix epoch)

### Off-Chain Balance Replenishment Logic

Off-chain balance is replenished automatically based on the following rules:
1. If balance is 0 or negative and the replenishment interval has passed, add `OFF_CHAIN_BALANCE_INCREMENT` (5)
2. If balance is positive, no replenishment occurs
3. For new users, the default balance is `OFF_CHAIN_BALANCE_DEFAULT` (20)

## Example API Requests

### Update User Inventory (curl)
```bash
# Update inventory for a specific user
curl -X PUT https://roi-backend-production.up.railway.app/api/inventory/did:example:123456789 \
  -H "Content-Type: application/json"

# Response (prettified):
# {
#   "rock_count": 5,
#   "paper_count": 3,
#   "scissors_count": 4,
#   "off_chain_balance": 20,
#   "next_replenish": {
#     "rock": 1708123456789,
#     "paper": 1708123456789,
#     "scissors": 1708123456789,
#     "off_chain_balance": null
#   }
# }
```

### Get VAPID Key (curl)
```bash
curl -X GET https://roi-backend-production.up.railway.app/api/notifications/vapid-key
```

### Send Notification (curl)
```bash
curl -X POST https://roi-backend-production.up.railway.app/api/notifications/send-notification \
  -H "Content-Type: application/json" \
  -d '{
    "subscription": {
      "endpoint": "https://fcm.googleapis.com/fcm/send/example-endpoint",
      "expirationTime": null,
      "keys": {
        "p256dh": "your-p256dh-key",
        "auth": "your-auth-key"
      }
    },
    "payload": {
      "title": "New Notification",
      "body": "Your resources have been replenished!",
      "icon": "/icon.png"
    }
  }'
```

## Using the API with React

### Example: Fetching User Inventory

```javascript
import React, { useState, useEffect } from 'react';

const UserInventory = ({ userDID }) => {
  const [inventory, setInventory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const response = await fetch(`https://roi-backend-production.up.railway.app/api/inventory/${userDID}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          }
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch inventory');
        }

        const data = await response.json();
        setInventory(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchInventory();
  }, [userDID]);

  if (loading) return <div>Loading inventory...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="user-inventory">
      <h2>Your Inventory</h2>
      <div className="resource-counts">
        <div>🪨 Rocks: {inventory.rock_count}</div>
        <div>📄 Papers: {inventory.paper_count}</div>
        <div>✂️ Scissors: {inventory.scissors_count}</div>
        <div>💰 Balance: {inventory.off_chain_balance}</div>
      </div>
      
      <h3>Next Replenishments</h3>
      <div className="replenish-times">
        {inventory.next_replenish.rock && (
          <div>Rocks: {new Date(inventory.next_replenish.rock).toLocaleTimeString()}</div>
        )}
        {inventory.next_replenish.paper && (
          <div>Papers: {new Date(inventory.next_replenish.paper).toLocaleTimeString()}</div>
        )}
        {inventory.next_replenish.scissors && (
          <div>Scissors: {new Date(inventory.next_replenish.scissors).toLocaleTimeString()}</div>
        )}
        {inventory.next_replenish.off_chain_balance && (
          <div>Balance: {new Date(inventory.next_replenish.off_chain_balance).toLocaleTimeString()}</div>
        )}
      </div>
    </div>
  );
};

export default UserInventory;
```

## Error Handling Best Practices

When working with this API, implement the following error handling strategies:

1. Always check for error responses
2. Implement retry logic for network failures
3. Handle 404 errors by redirecting to user registration if appropriate
4. Display user-friendly error messages
5. Log detailed errors on the client-side for debugging

## Rate Limiting

Rate limiting details are not specified in the provided code. Contact the system administrator for information about rate limits.
