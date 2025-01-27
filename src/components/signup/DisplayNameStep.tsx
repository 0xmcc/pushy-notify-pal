import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface DisplayNameStepProps {
  displayName: string;
  setDisplayName: (name: string) => void;
  onNext: () => void;
  isSubmitting: boolean;
}

export const DisplayNameStep = ({ 
  displayName, 
  setDisplayName, 
  onNext,
  isSubmitting 
}: DisplayNameStepProps) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium mb-2">
          Display Name
        </label>
        <Input
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          required
          minLength={3}
          maxLength={20}
          className="w-full bg-gaming-background/50 border-gaming-accent text-gaming-text-primary"
          placeholder="Enter your display name"
        />
      </div>

      <Button
        type="submit"
        disabled={isSubmitting || !displayName.trim()}
        className="w-full bg-gradient-to-r from-gaming-primary to-gaming-secondary hover:opacity-90 text-gaming-text-primary"
      >
        Next
      </Button>
    </form>
  );
}; 