export interface Game {
  id: string;
  player1_did: string;
  player2_did: string | null;
  stake_amount: number;
  status: string;
  expiration_date: string;
  player1_move: string | null;
  player2_move: string | null;
  creator_rating?: number;
  creator_name?: string;
  winner_did?: string | null;
  player1_claimed_at?: string | null;
  player2_claimed_at?: string | null;
  winner_rating_change?: number;
  loser_rating_change?: number;
  is_ranked?: boolean;
}

export enum Move {
  Rock = 0,
  Paper = 1,
  Scissors = 2,
}