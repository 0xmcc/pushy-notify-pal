interface GameMoveDisplayProps {
  move: string | null;
  isWinner: boolean;
}

export const GameMoveDisplay = ({ move, isWinner }: GameMoveDisplayProps) => {
  const getMoveEmoji = (move: string | null) => {
    if (!move) return null;
    switch (move.toLowerCase()) {
      case 'rock':
        return '🪨';
      case 'paper':
        return '📄';
      case 'scissors':
        return '✂️';
      default:
        return '❓';
    }
  };

  if (!move) return null;

  return (
    <div className={`relative p-4 rounded-full ${isWinner ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
      <span className="text-4xl">{getMoveEmoji(move)}</span>
      <span className="block text-center mt-2 text-sm text-gaming-text-secondary">
        {move.charAt(0).toUpperCase() + move.slice(1).toLowerCase()}
      </span>
    </div>
  );
};