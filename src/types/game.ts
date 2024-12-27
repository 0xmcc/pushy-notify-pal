export interface Game {
  id: string;
  creator_did: string;
  stake_amount: number;
  created_at: string;
  selected_move: string;
  creator_rating?: number;
  creator_name?: string;
}