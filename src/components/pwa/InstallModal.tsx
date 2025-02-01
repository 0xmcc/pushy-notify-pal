import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { HandHoldingPhone } from "@/components/icons/HandHoldingPhone";
import { Share } from "lucide-react";

interface InstallPWAModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InstallPWAModal({ open, onOpenChange }: InstallPWAModalProps) {
  // Prevent closing by intercepting the onOpenChange
  const handleOpenChange = (newOpen: boolean) => {
    // Only allow opening, prevent closing
    if (newOpen) {
      onOpenChange(true);
    }
    // Ignore close attempts
  };

  return (
    <Dialog 
      open={open} 
      onOpenChange={handleOpenChange}
      // Prevent closing on escape key and clicking outside
      onEscapeKeyDown={(e) => e.preventDefault()}
      onPointerDownOutside={(e) => e.preventDefault()}
    >
      <DialogContent 
        className="bg-black border-black max-w-md mx-auto [&>button]:hidden"
        hideCloseButton
      >
        <div className="space-y-8 p-6">
          {/* Icon */}
          <div className="flex justify-center">
            <HandHoldingPhone className="opacity-90" width={132} height={132} />
          </div>

          {/* Title */}
          <div className="text-center space-y-6">
            <h2 className="text-4xl font-bold text-gaming-text-primary">
              Add To Home Screen
            </h2>
            
            <p className="text-gaming-text-secondary text-lg leading-relaxed">
              To install the app, you need to add this website to your home screen.
            </p>

            <p className="text-gaming-text-secondary text-lg leading-relaxed">
              In your Safari browser menu, tap the <Share className="w-5 h-5 inline-block align-middle mx-1" /> Share icon  and choose <span className="font-semibold text-gaming-text-primary">Add to Home Screen</span> in the options. Then open the ROI app on your home screen.
            </p>
          </div>

          Close Button
          <div className="flex justify-end pt-4">
            <Button
              onClick={() => onOpenChange(false)}
              className="bg-gradient-to-r from-gaming-primary to-gaming-secondary hover:opacity-90"
            >
              Need help?
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 
