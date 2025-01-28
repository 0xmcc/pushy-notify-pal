import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Share, Copy, Check } from "lucide-react";
import { IPhoneMock } from "@/components/iphone-mock-step-one";
import { IPhoneMockStepTwo } from "@/components/iphone-mock-step-two";
import { IPhoneMockStepThree } from "@/components/iphone-mock-step-three";
import { useState, useEffect } from 'react';
import AnimatedNextButton from "@/components/animated-next-button"
import { isIOSSafari } from '@/utils/browser';

interface InstallPWAModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const STEPS = {
  0: {
    content: 'Please open this website in Safari. Tap COPY URL below, switch to Safari, and paste the link.',    
    Component: (props: any) => (
      <IPhoneMock 
        {...props}
        showCautionTape={true}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-white text-center p-4">
            <h2 className="text-xl font-bold mb-2">Oops! Wrong browser</h2>
            <p>This app is currently only supported on Safari.</p>
          </div>
        </div>
      </IPhoneMock>
    )
  },
  1: {
    content: <>Tap the <Share className="w-5 h-5 inline-block align-middle mx-1" /> Share icon</>,
    Component: (props: any) => (
      <IPhoneMock {...props} />
    )
  },
  2: {
    content: 'Select "Add to Home Screen"',
    Component: IPhoneMockStepTwo
  },
  3: {
    content: 'Tap "Add"',
    Component: IPhoneMockStepThree
  },
  4: {
    content: '',
    Component: () => (
      <div className="text-center space-y-6">
        <p className="text-4xl font-impact text-white">
          Click the <Share className="w-10 h-10 inline-block align-middle mx-1" />Share Icon button below
        </p>
        <div className="animate-bounce text-white text-6xl">↓</div>
      </div>
    )
  }
} as const;

export function InstallPWAModal({ open, onOpenChange }: InstallPWAModalProps) {
  const [step, setStep] = useState(1);
  const [isSafari, setIsSafari] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setIsSafari(isIOSSafari());
    // Set step to 0 if not Safari
    if (!isIOSSafari()) {
      setStep(0);
    }
  }, []);

  const currentStep = STEPS[step as keyof typeof STEPS];

  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen) {
      onOpenChange(true);
    }
  };

  const handleNext = () => {
    console.log('next');
    if (step === 4) {
        setStep(1);
    } else {
        setStep(prev => prev + 1);
    }
  };

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
    } catch (err) {
      console.error('Failed to copy:', err);
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
        className="bg-black border-0 max-w-md mx-auto [&>button]:hidden overflow-hidden"
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
            
            {/* Step Indicator - Only show for Safari */}
            {step !== 4 && (
              <p className="text-gaming-text-secondary text-lg font-medium text-center">
                Step {step} of 3
              </p>
            )}
            <p className="text-gaming-text-primary text-lg leading-relaxed font-bold text-center">
              {STEPS[step as keyof typeof STEPS].content}
            </p>
          </div>

          {/* iPhone Mock with adjusted margin */}
          <div className={`flex justify-center ${step === 4 ? 'mt-[60%]' : 'mt-[30%]'}`}>
            <currentStep.Component 
              className="scale-90" 
              isLastStep={step === 4}
            />
          </div>

          {/* Button Area */}
          {step === 0 ? (
            <div className="absolute bottom-3 inset-x-12">
              <Button 
                onClick={handleCopyUrl}
                className={`w-full py-8 text-lg font-bold border-0 rounded-full group animate-wiggle transition-colors
                  ${copied 
                    ? 'bg-gaming-success hover:bg-gaming-success text-white !opacity-100' 
                    : 'bg-white hover:bg-white text-black !opacity-100'
                  }`}
                disabled={copied}
              >
                {copied ? (
                  <>
                    <Check className="w-5 h-5 mr-2 inline-block animate-in zoom-in-0" />
                    COPIED!
                  </>
                ) : (
                  <>
                    <Copy className="w-5 h-5 mr-2 inline-block" />
                    COPY URL
                  </>
                )}
              </Button>
            </div>
          ) : step !== 4 && (
            <div className="absolute bottom-3 inset-x-12">
              <AnimatedNextButton 
                onClick={handleNext}
                disabled={!isSafari}
                className="w-full py-8 text-lg font-bold border-0 rounded-full focus-visible:ring-offset-0 hover:opacity-90"
              />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
} 