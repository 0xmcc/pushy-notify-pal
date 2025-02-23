# Game Module Documentation

## Overview
The Game Module implements a Rock-Paper-Scissors game with stake-based gameplay and push notifications. It handles game creation, move validation, stake management, and player notifications.

## Core Components

### Types
```typescript
// Game stake representation
interface GameStake {
  userId: string;
  stakeAmount: string;
}

// Game move representation
interface GameMove {
  userId: string;
  selectedMove: string;
}

// Push notification options
interface NotificationOptions {
  title: string;
  body: string;
}

// Database types
type GameMatch = Database['public']['Tables']['matches']['Row'];
type UserData = Database['public']['Tables']['users']['Row'];
```

### Hooks

#### useCreateGame
A React hook that manages game creation state and logic:
```typescript
const {
  stakeAmount,          // Current stake amount
  setStakeAmount,       // Stake amount setter
  selectedMove,         // Selected move (rock/paper/scissors)
  setSelectedMove,      // Move setter
  isCreating,          // Loading state
  handleCreateGame,     // Game creation handler
} = useCreateGame();
```

### Utilities

#### Game Creation
- `moveToNumber(move: string): string` - Converts move text to numeric representation
  - rock/0 → '0'
  - paper/1 → '1'
  - scissors/2 → '2'

- `validateAndDeductStake({ userId, stakeAmount }: GameStake)` 
  - Validates user has sufficient balance
  - Deducts stake from user's off-chain balance
  - Returns validated stake value

- `validateAndDeductMove({ userId, selectedMove }: GameMove)`
  - Validates user has the selected move in inventory
  - Deducts move from user's inventory
  - Returns validated move

- `createMatch(userId: string, selectedMove: string, stakeValue: number)`
  - Creates a new match in database with:
    - Player 1 ID and move
    - Stake amount
    - Status: 'pending'

#### Notifications
- `sendGameNotification(recipientDid: string)`
  - Sends push notification when game is created
  - Supports both web push and Safari push notifications
  - Checks user's notification subscriptions
  - Sends via /api/notifications/send endpoint

## Game Creation Flow

1. User inputs:
   - Stake amount
   - Selected move (rock/paper/scissors)

2. Validation:
   - User must be signed in
   - Stake amount must be valid number
   - Move must be selected

3. Processing:
   - Validate and deduct stake from balance
   - Validate and deduct move from inventory
   - Create match record
   - Send notification to player

4. Error Handling:
   - Insufficient balance
   - Insufficient move inventory
   - Database errors
   - Notification errors

## Database Schema

### Matches Table
- player1_did: string
- player1_move: string
- player1_move_timestamp: timestamp
- stake_amount: number
- status: 'pending' | string

### Users Table
- did: string
- off_chain_balance: number
- rock_count: number
- paper_count: number
- scissors_count: number
- web_push_subscription: string
- safari_push_subscription: string
## Error Messages
- "Please sign in to create a game"
- "Please enter a valid stake amount"
- "Please select your move"
- "Insufficient balance. You have {balance} credits"
- "You don't have any more of this move available!"
- "Invalid move"

## Success Messages
- "Game created successfully!"

