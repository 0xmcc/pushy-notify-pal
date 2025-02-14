import { PlayerCard } from './PlayerCard';
import { Inventory } from '@/types/game';

interface PlayerListProps {
  players: any[];
  onSelectPlayer: (player: any) => void;
  selectedPlayer: any;
  inventory: Inventory;
  stakeAmount: number;
  showMoveSelector?: boolean;
  selectedMoves?: Record<string, string>; // Map of playerId to move
  // Callback to handle move selection for a specific player
  onMoveSelect?: (playerId: string, move: string) => void; 
}

export const PlayerList = ({ 
  players, 
  onSelectPlayer, 
  selectedPlayer,
  inventory,
  stakeAmount,
  showMoveSelector,
  selectedMoves, 
  onMoveSelect }: PlayerListProps) => {
  if (!players.length) {
    return (
      <div className="text-center py-8 text-gaming-text-secondary">
        No players found
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {players.map((player) => (
        <PlayerCard
          key={player.did}
          player={player}
          isSelected={selectedPlayer?.did === player.did}
          onClick={() => onSelectPlayer(player)}
          inventory={inventory}
          stakeAmount={stakeAmount}
          showMoveSelector={showMoveSelector}
          // Pass the move for the current player from the mapping
          selectedMove={selectedMoves[player.did] || ''}
          // Wrap the callback to include the player's id
          onMoveSelect={(move: string) => onMoveSelect(player.did, move)}
        />
      ))}
    </div>
  );
}; 