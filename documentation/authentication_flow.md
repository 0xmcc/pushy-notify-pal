# Authentication Flow for Game Actions

## Overview
This document outlines the standard authentication and authorization flow that should be followed when a user attempts to perform any game-related action (creating a game, playing a move, claiming rewards, etc.).

## Authentication Layers

### 1. Primary Authentication Check
We use the `useUserCheck` hook from `@/features/auth/hooks/useUserCheck.ts` which handles Privy authentication and database validation:

```typescript
const { isChecking, exists, user, ready } = useUserCheck();

// Wait for auth check to complete
if (!ready || isChecking) {
  return;
}

// Check if user exists and is authenticated
if (!user || !exists) {
  toast.error("Please sign in to play");
  navigate('/signup');
  return;
}
```

### 2. Game-Specific Validation
After authentication, perform game-specific checks:
```typescript
// Check inventory/balance/etc
const { data: userData, error } = await supabase
  .from('users')
  .select('inventory_column, balance')
  .eq('did', user.id)
  .single();

if (error || !userData) {
  toast.error("Failed to validate user data");
  return;
}
```

## Standard Game Action Flow

1. **Authentication Check**
   - Use `useUserCheck` hook to verify authentication
   - Handle loading states with `isChecking`
   - Validate user exists in database with `exists`

2. **Game-Specific Validation**
   - Check if user has required inventory
   - Verify user has sufficient balance for stake
   - Confirm user is eligible to perform the action

3. **Action Execution**
   - Perform the game action
   - Update relevant game state
   - Update user's inventory/balance

## Example Implementation

Here's a standard pattern for implementing game actions:

```typescript
const MyGameComponent = () => {
  const { isChecking, exists, user } = useUserCheck();

  const handleGameAction = async (gameId: string, actionType: string) => {
    // 1. Wait for auth check
    if (!ready || isChecking) {
      return;
    }

    // 2. Verify authentication
    if (!user || !exists) {
      toast.error("Please sign in to play");
      return;
    }

    try {
      // 3. Game-specific validation
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('inventory_column, balance')
        .eq('did', user.id)
        .single();

      if (userError || !userData) {
        toast.error("Failed to validate user data");
        return;
      }

      // 4. Execute action
      // ... perform the specific game action ...

      toast.success("Action completed successfully");
    } catch (error) {
      console.error('Error performing action:', error);
      toast.error("Failed to perform action");
    }
  };

  if (isChecking) {
    return <div>Loading...</div>;
  }

  return <button onClick={() => handleGameAction("123", "move")}>Make Move</button>;
};
```

## Error Handling

Always provide clear error messages to users:
- Authentication errors: "Please sign in to play"
- Inventory errors: "Insufficient inventory"
- Balance errors: "Insufficient balance"
- General errors: "Failed to perform action"

## Security Considerations

1. **Never Trust Client-Side Data**
   - Always validate user permissions server-side
   - Double-check inventory and balance server-side

2. **Rate Limiting**
   - Implement rate limiting for game actions
   - Prevent spam and abuse

3. **Transaction Safety**
   - Use database transactions for atomic operations
   - Ensure inventory/balance updates are atomic

## Implementation Locations

The authentication checks should be implemented in:
1. Component Level (`GameCard.tsx`, `CreateGame.tsx`)
2. Hook Level (`usePlayMove.ts`, `useCreateGame.ts`)
3. API Level (server-side validation) 