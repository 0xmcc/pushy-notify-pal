import { API_BASE_URL } from '@/config';

export interface ReplenishmentTimers {
  next_replenish: {
    rock: number | null;
    paper: number | null;
    scissors: number | null;
    off_chain_balance: number | null;
  }
}

export const updateReplenishTimers = async (did: string): Promise<ReplenishmentTimers> => {
  const response = await fetch(`${API_BASE_URL}/api/inventory/${did}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' }
  });

  if (!response.ok) {
    throw new Error('Failed to update replenishment timers');
  }

  const data = await response.json();
  return data; // The API already returns the correct shape we need
}; 