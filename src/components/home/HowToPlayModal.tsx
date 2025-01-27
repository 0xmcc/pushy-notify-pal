import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sword, Shield, Trophy, Sparkles } from "lucide-react";

interface HowToPlayModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const steps = [
  {
    icon: <Sword className="w-6 h-6 text-gaming-primary" />,
    title: "Choose Your Move",
    description: "Pick Rock, Paper, or Scissors",
    bgColor: "bg-gaming-primary/20",
    iconColor: "text-gaming-primary",
  },
  {
    icon: <Shield className="w-6 h-6 text-gaming-secondary" />,
    title: "Place Your Bet",
    description: "Set your stake to challenge others",
    bgColor: "bg-gaming-secondary/20",
    iconColor: "text-gaming-secondary",
  },
  {
    icon: <Trophy className="w-6 h-6 text-gaming-success" />,
    title: "Win Battles",
    description: "Rock beats Scissors, Scissors beats Paper, Paper beats Rock",
    bgColor: "bg-gaming-success/20",
    iconColor: "text-gaming-success",
  },
  {
    icon: <Sparkles className="w-6 h-6 text-gaming-warning" />,
    title: "Climb the Ranks",
    description: "Win matches to rise on the leaderboard",
    bgColor: "bg-gaming-warning/20",
    iconColor: "text-gaming-warning",
  },
];

export function HowToPlayModal({ open, onOpenChange }: HowToPlayModalProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onOpenChange(false);
      setCurrentStep(0); // Reset for next time
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setCurrentStep(0); // Reset for next time
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-gaming-card border-gaming-accent max-w-md mx-auto">
        <div className="space-y-6 p-2">
          {/* Title with gaming flair */}
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold text-gradient-gaming">
              How to Play
            </h2>
            <p className="text-gaming-text-secondary">
              Step {currentStep + 1} of {steps.length}
            </p>
          </div>

          {/* Current Step */}
          <div className="gaming-card bg-gaming-background/50 hover:bg-gaming-background/70 transition-all p-6">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-lg ${steps[currentStep].bgColor}`}>
                {steps[currentStep].icon}
              </div>
              <div>
                <h3 className="font-bold text-gaming-text-primary">
                  {steps[currentStep].title}
                </h3>
                <p className="text-sm text-gaming-text-secondary">
                  {steps[currentStep].description}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between gap-4 pt-4">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="flex-1"
            >
              Previous
            </Button>
            <Button
              onClick={handleNext}
              className="flex-1 bg-gradient-to-r from-gaming-primary to-gaming-secondary hover:opacity-90"
            >
              {currentStep === steps.length - 1 ? "Got it!" : "Next"}
            </Button>
          </div>

          {/* Progress Dots */}
          <div className="flex justify-center gap-2">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-colors duration-200 ${
                  index === currentStep
                    ? "bg-gaming-primary"
                    : "bg-gaming-accent/30"
                }`}
              />
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}