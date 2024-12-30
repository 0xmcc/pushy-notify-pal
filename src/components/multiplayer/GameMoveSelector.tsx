import { useInventory } from "@/hooks/useInventory";
import { MoveButton } from "./MoveButton";

interface GameMoveSelectorProps {
  selectedMove: string;
  onMoveSelect: (move: string) => void;
}

export const GameMoveSelector = ({ selectedMove, onMoveSelect }: GameMoveSelectorProps) => {
  const inventory = useInventory();

  const moves = [
    { id: 'rock', emoji: '🪨', count: inventory.rock_count },
    { id: 'paper', emoji: '📄', count: inventory.paper_count },
    { id: 'scissors', emoji: '✂️', count: inventory.scissors_count }
  ];

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gaming-text-primary">
        Select your move
      </label>
      <div className="flex gap-2">
        {moves.map((move) => (
          <MoveButton
            key={move.id}
            move={move.id}
            emoji={move.emoji}
            count={move.count}
            isSelected={selectedMove === move.id}
            onSelect={onMoveSelect}
          />
        ))}
      </div>
    </div>
  );
};