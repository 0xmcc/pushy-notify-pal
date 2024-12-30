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

  return (
    <div className={`text-center ${isWinner ? 'text-green-500' : ''}`}>
      <div className="text-4xl">{getMoveEmoji(move)}</div>
    </div>
  );
};