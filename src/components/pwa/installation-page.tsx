import { ChevronDown, ArrowUpFromLine, Plus, Share, SquareStack } from "lucide-react"
import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"
import { IPhoneMock } from "@/components/pwa/iphoneMocks/iphone-mock-step-one"
import { HandHoldingPhone } from "@/components/icons/HandHoldingPhone"


export function InstallationPage() {
  const [showArrow, setShowArrow] = useState(true)
  const [currentStep, setCurrentStep] = useState(1)

  // Arrow animation effect
  useEffect(() => {
    const toggleArrow = () => setShowArrow(prev => !prev)
    const arrowTimer = setInterval(toggleArrow, 1000)
    return () => clearInterval(arrowTimer)
  }, []) // No dependencies needed as it's a self-contained animation

  // Step transition effect
  useEffect(() => {
    const nextStep = () => setCurrentStep(prev => prev === 3 ? 1 : prev + 1)
    const stepTimer = setInterval(nextStep, 2000)
    return () => clearInterval(stepTimer)
  }, []) // No dependencies needed as it's a self-contained cycle

  return (
    <div className="fixed inset-0 bg-black text-white flex flex-col">
  
      {/* Main Content */}
      <div className="flex-1 flex flex-col px-6 pt-12">
        <div className="flex flex-col items-center mb-2">
          <HandHoldingPhone width={48} height={48} className="mb-2" />
          <h1 className="text-2xl font-semibold text-center">Add ROI to Home Screen</h1>
        </div>
        <p className="text-gray-400 mb-8 text-center">Step {currentStep} of 3</p>

        {/* Installation Steps */}
        <div className="grid grid-cols-3 gap-4 w-full max-w-md mx-auto mb-8">
          <div
            className={cn(
              "flex flex-col items-center text-center transition-opacity duration-500",
              currentStep === 1 ? "opacity-100" : "opacity-50",
            )}
          >
            <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center mb-2">
              <ArrowUpFromLine className="w-5 h-5" />
            </div>
            <h2 className="font-medium text-sm mb-1">Tap Share</h2>
            <p className="text-xs text-gray-400">Tap the share icon</p>
          </div>

          <div
            className={cn(
              "flex flex-col items-center text-center transition-opacity duration-500",
              currentStep === 2 ? "opacity-100" : "opacity-50",
            )}
          >
            <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center mb-2">
              <ChevronDown className="w-5 h-5" />
            </div>
            <h2 className="font-medium text-sm mb-1">Find Menu</h2>
            <p className="text-xs text-gray-400">Scroll to "Add to Home Screen"</p>
          </div>

          <div
            className={cn(
              "flex flex-col items-center text-center transition-opacity duration-500",
              currentStep === 3 ? "opacity-100" : "opacity-50",
            )}
          >
            <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center mb-2">
              <Plus className="w-5 h-5" />
            </div>
            <h2 className="font-medium text-sm mb-1">Add to Home Screen</h2>
            {/* <p className="text-xs text-gray-400">Select from menu</p> */}
          </div>
        </div>

        {/* iPhone Mock */}
        <div className="flex justify-center -mt-4">
          <IPhoneMock showCautionTape={false} height={250} />
        </div>
      </div>

      {/* Bottom Section */}
      <div className="pb-20 pt-4 px-6">
        {/* Safari Icon and Add ROI Label */}

        {/* Share Icon Hint */}

   
        <div className="relative text-center">
          <p className="text-lg font-medium mb-2">
            Tap the <Share className="w-6 h-6 inline mx-1" /> Share icon
          </p>
          <div className="relative inline-block">
            <ChevronDown
              className={cn(
                "w-8 h-8 inline-block animate-bounce transition-opacity duration-500",
                !showArrow && "opacity-50",
              )}
            />
            <ChevronDown
              className={cn(
                "w-8 h-8 inline-block animate-bounce absolute top-2 left-0 transition-opacity duration-500",
                showArrow && "opacity-50",
              )}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

