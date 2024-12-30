interface GameMoveDisplayProps {
  move: string | null;
  isWinner?: boolean;
}

export const GameMoveDisplay = ({ move, isWinner }: GameMoveDisplayProps) => {
  const getMoveEmoji = (move: string | null) => {
    switch (move) {
      case '0': return '🪨';
      case '1': return '📄';
      case '2': return '✂️';
      default: return '❓';
    }
  };

  const getMoveLabel = (move: string | null) => {
    switch (move) {
      case '0': return 'Rock';
      case '1': return 'Paper';
      case '2': return 'Scissors';
      default: return 'Unknown';
    }
  };

  return (
    <div className={`text-center ${isWinner ? 'text-green-500' : ''}`}>
      <div className="text-4xl mb-1">{getMoveEmoji(move)}</div>
      <div className="text-sm text-gaming-text-secondary">{getMoveLabel(move)}</div>
    </div>
  );
};