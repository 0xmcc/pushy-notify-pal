import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

type Move = 'rock' | 'paper' | 'scissors';

interface GameMoveSelectorProps {
  selectedMove: Move | '';
  onMoveSelect: (move: Move) => void;
}

export const GameMoveSelector = ({ selectedMove, onMoveSelect }: GameMoveSelectorProps) => {
  return (
    <div className="space-y-2">
      <Label className="block text-sm font-medium text-gaming-text-secondary">
        Select Your Move
      </Label>
      <RadioGroup
        value={selectedMove}
        onValueChange={(value) => onMoveSelect(value as Move)}
        className="flex gap-4"
      >
        {['rock', 'paper', 'scissors'].map((move) => (
          <div key={move} className="flex items-center space-x-2">
            <RadioGroupItem value={move} id={move} className="border-gaming-accent text-gaming-primary" />
            <Label htmlFor={move} className="capitalize text-gaming-text-primary">{move}</Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  );
};