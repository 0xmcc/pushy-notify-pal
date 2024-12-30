import { Game } from "@/types/game";

export const mockGames: Game[] = [
  {
    id: 'mock-1',
    player1_did: 'CryptoNinja',
    player2_did: null,
    stake_amount: 50,
    status: 'pending',
    expiration_date: new Date(Date.now() + 86400000).toISOString(),
    player1_move: '0', // rock
    player2_move: null,
    creator_name: 'CryptoNinja',
    creator_rating: 1850
  },
  {
    id: 'mock-2',
    player1_did: 'Web3Warrior',
    player2_did: 'BlockMaster',
    stake_amount: 100,
    status: 'in_progress',
    expiration_date: new Date(Date.now() + 86400000).toISOString(),
    player1_move: '1', // paper
    player2_move: '2', // scissors
    creator_name: 'Web3Warrior',
    creator_rating: 1650,
    winner_did: 'BlockMaster'
  },
  {
    id: 'mock-3',
    player1_did: 'ChainChampion',
    player2_did: null,
    stake_amount: 250,
    status: 'pending',
    expiration_date: new Date(Date.now() + 86400000).toISOString(),
    player1_move: '2', // scissors
    player2_move: null,
    creator_name: 'ChainChampion',
    creator_rating: 2100
  },
  {
    id: 'mock-4',
    player1_did: 'TokenTitan',
    player2_did: 'CryptoKing',
    stake_amount: 500,
    status: 'completed',
    expiration_date: new Date(Date.now() + 86400000).toISOString(),
    player1_move: '0', // rock
    player2_move: '2', // scissors
    creator_name: 'TokenTitan',
    creator_rating: 1920,
    winner_did: 'TokenTitan'
  },
  {
    id: 'mock-5',
    player1_did: 'MetaMaster',
    player2_did: null,
    stake_amount: 1000,
    status: 'pending',
    expiration_date: new Date(Date.now() + 86400000).toISOString(),
    player1_move: '1', // paper
    player2_move: null,
    creator_name: 'MetaMaster',
    creator_rating: 2250
  },
  {
    id: 'mock-6',
    player1_did: 'ByteBoss',
    player2_did: 'HashHero',
    stake_amount: 750,
    status: 'in_progress',
    expiration_date: new Date(Date.now() + 86400000).toISOString(),
    player1_move: '2', // scissors
    player2_move: '1', // paper
    creator_name: 'ByteBoss',
    creator_rating: 1750,
    winner_did: 'ByteBoss'
  }
];
