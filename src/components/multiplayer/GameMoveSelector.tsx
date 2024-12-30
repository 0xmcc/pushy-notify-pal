import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

type Move = '0' | '1' | '2';

interface GameMoveSelectorProps {
  selectedMove: Move | '';
  onMoveSelect: (move: Move) => void;
}

export const GameMoveSelector = ({ selectedMove, onMoveSelect }: GameMoveSelectorProps) => {
  const moves = [
    { value: '0', label: '🪨 Rock' },
    { value: '1', label: '📄 Paper' },
    { value: '2', label: '✂️ Scissors' }
  ];

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
        {moves.map(({ value, label }) => (
          <div key={value} className="flex items-center space-x-2">
            <RadioGroupItem value={value} id={value} className="border-gaming-accent text-gaming-primary" />
            <Label htmlFor={value} className="text-gaming-text-primary">{label}</Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  );
};