import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Share } from "lucide-react";
import { IPhoneMock } from "@/components/iphone-mock-step-one";
import { IPhoneMockStepTwo } from "@/components/iphone-mock-step-two";
import { IPhoneMockStepThree } from "@/components/iphone-mock-step-three";
import { useState } from 'react';

interface InstallPWAModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const STEPS = {
  1: {
    content: <>Tap the <Share className="w-5 h-5 inline-block align-middle mx-1" /> Share icon</>,
    Component: IPhoneMock
  },
  2: {
    content: 'Select "Add to Home Screen"',
    Component: IPhoneMockStepTwo
  },
  3: {
    content: 'Tap "Add"',
    Component: IPhoneMockStepThree
  }
} as const;

export function InstallPWAModal({ open, onOpenChange }: InstallPWAModalProps) {
  const [step, setStep] = useState(1);
  const currentStep = STEPS[step as keyof typeof STEPS];

  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen) {
      onOpenChange(true);
    }
  };

  const handleNext = () => {
    console.log('next');
    setStep(prev => prev + 1);
    if (step === 3) {
        setStep(1);
    }
  };

  return (
    <Dialog 
      open={open} 
      onOpenChange={handleOpenChange}
      onEscapeKeyDown={(e) => e.preventDefault()}
      onPointerDownOutside={(e) => e.preventDefault()}
    >
      <DialogContent 
        className="bg-black border-gaming-accent max-w-md mx-auto [&>button]:hidden overflow-hidden"
        hideCloseButton
      >
        <div className="space-y-2 p-6">
          {/* Title */}
          <div className="space-y-1">
            <div className="flex justify-center mb-3">
              <div className="flex items-center gap-4 w-fit">
                <img 
                  src="/icons/safari-ios.svg"
                  alt="Safari"
                  width={60}
                  height={60}
                  className="rounded-xl"
                />
                <h2 className="text-3xl font-bold text-gaming-text-primary leading-tight max-w-[200px]">
                  Add ROI to Home Screen
                </h2>
              </div>
            </div>
            
            {/* Step Indicator */}
            <p className="text-gaming-text-secondary text-lg font-medium text-center">
              Step {step} of 3
            </p>
            <p className="text-gaming-text-primary text-lg leading-relaxed font-bold text-center">
              {currentStep.content}
            </p>
          </div>

          {/* iPhone Mock with adjusted margin */}
          <div className="flex justify-center mt-[30%]">
            <currentStep.Component className="scale-90" />
          </div>

          {/* Next Button */}
          <div className="absolute bottom-3 inset-x-12">
            <Button 
              onClick={handleNext}
              className="w-full py-8 text-lg font-bold rounded-full bg-gradient-to-r from-gaming-primary to-gaming-secondary hover:opacity-90"
            >
              NEXT
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 