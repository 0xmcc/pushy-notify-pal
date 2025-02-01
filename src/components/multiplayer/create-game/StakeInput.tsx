import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface StakeInputProps {
  value: string;
  onChange: (value: string) => void;
}

export const StakeInput = ({ value, onChange }: StakeInputProps) => {
  return (
    <div>
      <Label htmlFor="stakeAmount" className="block text-sm font-medium text-gaming-text-secondary mb-1">
        Stake Amount (SOL)
      </Label>
      <Input
        id="stakeAmount"
        type="number"
        min="0"
        step="0.01"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Enter stake amount"
        className="w-full bg-gaming-card border-gaming-accent text-gaming-text-primary placeholder:text-gaming-text-secondary"
      />
    </div>
  );
};