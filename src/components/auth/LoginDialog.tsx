import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { usePrivy } from '@privy-io/react-auth';

interface LoginDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LoginDialog({ open, onOpenChange }: LoginDialogProps) {
  const { login } = usePrivy();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gaming-card border-gaming-accent text-gaming-text-primary">
        <DialogHeader>
          <DialogTitle className="text-gaming-text-primary">Login Required</DialogTitle>
          <DialogDescription className="text-gaming-text-secondary">
            You need to be logged in to play a move.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end mt-4">
          <Button 
            onClick={() => {
              onOpenChange(false);
              login();
            }}
            className="bg-gaming-accent hover:bg-gaming-accent/80 text-gaming-text-primary"
          >
            Login
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 