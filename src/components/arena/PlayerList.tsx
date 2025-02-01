import { PlayerCard } from './PlayerCard';

interface PlayerListProps {
  players: any[];
  onSelectPlayer: (player: any) => void;
  selectedPlayer: any;
}

export const PlayerList = ({ players, onSelectPlayer, selectedPlayer }: PlayerListProps) => {
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
        />
      ))}
    </div>
  );
}; 