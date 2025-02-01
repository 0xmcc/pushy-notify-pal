"use client"

import { ArrowDownToDot, ArrowUpFromLine, Plus, Share, SquareStack } from "lucide-react"
import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"

export default function InstallationPage() {
  const [showArrow, setShowArrow] = useState(true)
  const [currentStep, setCurrentStep] = useState(1)

  useEffect(() => {
    const arrowTimer = setTimeout(() => {
      setShowArrow(false)
    }, 3000)

    const stepTimer = setInterval(() => {
      setCurrentStep((prevStep) => (prevStep === 3 ? 1 : prevStep + 1));
    }, 3000)

    return () => {
      clearTimeout(arrowTimer)
      clearInterval(stepTimer)
    }
  }, [])

  return (
    <div className="fixed inset-0 bg-black text-white flex flex-col">
  
      {/* Main Content */}
      <div className="flex-1 flex flex-col px-6 pt-12">
        <h1 className="text-2xl font-semibold mb-2 text-center">Add ROI to Home Screen</h1>
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
              <Plus className="w-5 h-5" />
            </div>
            <h2 className="font-medium text-sm mb-1">Add to Home</h2>
            <p className="text-xs text-gray-400">Select from menu</p>
          </div>

          <div  className={cn(
              "flex flex-col items-center text-center transition-opacity duration-500",
              currentStep === 3 ? "opacity-100" : "opacity-50",
            )}>
            <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center mb-2">
              <SquareStack className="w-5 h-5" />
            </div>
            <h2 className="font-medium text-sm mb-1">Install</h2>
            <p className="text-xs text-gray-400">Tap "Add"</p>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="pb-20 pt-8 px-6">
        {/* Safari Icon and Add ROI Label */}
        <div className="flex items-center justify-center mb-6">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mr-3">
            <svg viewBox="0 0 24 24" className="w-5 h-5 text-white fill-current">
              <path d="M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8zM13 7h-2v5.414l3.293 3.293 1.414-1.414L13 11.586z" />
            </svg>
          </div>
          <span className="text-base font-medium">Add ROI to Home Screen</span>
        </div>

        {/* Share Icon Hint */}
        <div className="relative text-center">
          <p className="text-lg font-medium mb-2">
            Tap the <Share className="w-6 h-6 inline mx-1" /> Share icon
          </p>
          <ArrowDownToDot
            className={cn(
              "w-8 h-8 absolute left-1/2 -translate-x-1/2 animate-bounce",
              !showArrow && "opacity-0 transition-opacity duration-500",
            )}
          />
        </div>
      </div>
    </div>
  )
}

