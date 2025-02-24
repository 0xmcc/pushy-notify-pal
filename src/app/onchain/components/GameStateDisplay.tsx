import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { Button } from '@/components/ui/button';
import { getExplorerUrl } from '../utils';

interface GameState {
  state: { active: boolean };
  betAmount: number;
  playerOne: { toString: () => string };
  playerTwo?: { toString: () => string };
  playerOneMove?: { rock?: boolean; paper?: boolean; scissors?: boolean };
  playerTwoMove?: { rock?: boolean; paper?: boolean; scissors?: boolean };
  playerOneCommitment?: boolean;
  playerTwoCommitment?: boolean;
  vaultBalance?: number;
  winner?: string;
}

interface GameStateDisplayProps {
  gameState: GameState;
  gamePublicKey: string;
  handleClaimWinnings: () => Promise<void>;
  isLoading: boolean;
  program: any; // Replace with proper program type
}

export const GameStateDisplay = ({
  gameState,
  gamePublicKey,
  handleClaimWinnings,
  isLoading,
  program
}: GameStateDisplayProps) => {
  const getMoveString = (move: { rock?: boolean; paper?: boolean; scissors?: boolean }) => {
    if (move.rock) return 'Rock';
    if (move.paper) return 'Paper';
    if (move.scissors) return 'Scissors';
    return 'Unknown';
  };

  return (
    <div className="mt-6 p-4 border border-gray-700 rounded-lg">
      <h4 className="text-xl font-semibold mb-4">Current Game Status</h4>
      <div className="space-y-2">
        <div className="flex justify-between items-center p-2 bg-gray-700 rounded">
          <span>Game Account:</span>
          <a 
            href={getExplorerUrl('address', gamePublicKey)}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300"
          >
            {gamePublicKey.slice(0, 4)}...{gamePublicKey.slice(-4)}
          </a>
        </div>

        <div className="flex justify-between p-2 bg-gray-700 rounded">
          <span>Game State:</span>
          <span className="font-medium">{gameState.state.active ? 'Active' : 'Finished'}</span>
        </div>

        <div className="flex justify-between p-2 bg-gray-700 rounded">
          <span>Bet Amount:</span>
          <span className="font-medium">{(Number(gameState.betAmount) / LAMPORTS_PER_SOL).toFixed(2)} SOL</span>
        </div>

        <div className="flex justify-between p-2 bg-gray-700 rounded">
          <span>Player One:</span>
          <a 
            href={getExplorerUrl('address', gameState.playerOne.toString())}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300"
          >
            {gameState.playerOne.toString().slice(0, 4)}...{gameState.playerOne.toString().slice(-4)}
          </a>
        </div>

        {gameState.playerTwo && (
          <div className="flex justify-between p-2 bg-gray-700 rounded">
            <span>Player Two:</span>
            <a 
              href={getExplorerUrl('address', gameState.playerTwo.toString())}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300"
            >
              {gameState.playerTwo.toString().slice(0, 4)}...{gameState.playerTwo.toString().slice(-4)}
            </a>
          </div>
        )}

        <div className="flex justify-between p-2 bg-gray-700 rounded">
          <span>Move Status:</span>
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-2">
              <span className="text-sm">Player 1:</span>
              <span className={`px-2 py-0.5 text-sm rounded ${
                gameState.playerOneMove ? 'bg-green-600' : 
                gameState.playerOneCommitment ? 'bg-yellow-600' : 
                'bg-red-600'
              }`}>
                {gameState.playerOneMove ? 
                  getMoveString(gameState.playerOneMove) :
                  gameState.playerOneCommitment ? 'Move Encrypted' :
                  'No Move'}
              </span>
            </div>
            {gameState.playerTwo && (
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm">Player 2:</span>
                <span className={`px-2 py-0.5 text-sm rounded ${
                  gameState.playerTwoMove ? 'bg-green-600' : 
                  gameState.playerTwoCommitment ? 'bg-yellow-600' : 
                  'bg-red-600'
                }`}>
                  {gameState.playerTwoMove ? 
                    getMoveString(gameState.playerTwoMove) :
                    gameState.playerTwoCommitment ? 'Move Encrypted' :
                    'No Move'}
                </span>
              </div>
            )}
          </div>
        </div>

        {!gameState.state.active && (
          <div className="mt-4">
            <div className="mb-2 text-center">
              <span className="text-lg font-medium">
                Winner: {gameState.winner ? 
                  `${gameState.winner.slice(0, 4)}...${gameState.winner.slice(-4)}` : 
                  'No winner yet'}
              </span>
            </div>
            <Button 
              onClick={handleClaimWinnings}
              disabled={isLoading || !program || gameState.vaultBalance === 0}
              className={`w-full ${gameState.vaultBalance === 0 ? 'bg-gray-600 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}
            >
              {gameState.vaultBalance === 0 ? 'Winnings Already Claimed' : 'Claim Winnings'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}; 