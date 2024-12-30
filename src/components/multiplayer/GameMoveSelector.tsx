import { Button } from "@/components/ui/button";

interface GameMoveSelectorProps {
  selectedMove: string;
  onMoveSelect: (move: string) => void;
}

export const GameMoveSelector = ({ selectedMove, onMoveSelect }: GameMoveSelectorProps) => {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gaming-text-primary">
        Select your move
      </label>
      <div className="flex gap-2">
        <Button
          variant={selectedMove === 'rock' ? 'default' : 'outline'}
          onClick={() => onMoveSelect('rock')}
          className="flex-1"
        >
          🪨 Rock
        </Button>
        <Button
          variant={selectedMove === 'paper' ? 'default' : 'outline'}
          onClick={() => onMoveSelect('paper')}
          className="flex-1"
        >
          📄 Paper
        </Button>
        <Button
          variant={selectedMove === 'scissors' ? 'default' : 'outline'}
          onClick={() => onMoveSelect('scissors')}
          className="flex-1"
        >
          ✂️ Scissors
        </Button>
      </div>
    </div>
  );
};