import type React from "react"
import { useState, useEffect } from "react"
import { Globe } from "lucide-react"

interface IPhoneMockStepThreeProps {
  className?: string
}

export const IPhoneMockStepThree: React.FC<IPhoneMockStepThreeProps> = ({ className = "" }) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [showAnimation, setShowAnimation] = useState(false)

  useEffect(() => {
    const expandTimer = setTimeout(() => {
      setIsExpanded(true)
    }, 100)

    const animationTimer = setTimeout(() => {
      setShowAnimation(true)
    }, 2000)

    return () => {
      clearTimeout(expandTimer)
      clearTimeout(animationTimer)
    }
  }, [])

  return (
    <div
      className={`relative w-[300px] h-[450px] rounded-t-[50px] border-[7px] border-gray-700 overflow-hidden shadow-xl pointer-events-none ${className}`}
      style={{ borderBottom: "none" }}
    >
      {/* Fully Transparent Content Area */}
      <div className="bg-transparent w-full h-full">
        {/* Bottom Bar with Add to Home Screen Sheet */}
        <div
          className={`absolute inset-x-0 bg-gray-900 flex flex-col transition-all duration-700 ease-in-out ${
            isExpanded ? "bottom-0 h-[425px] opacity-100" : "bottom-[-480px] h-[580px] opacity-0"
          }`}
          style={{ borderTopLeftRadius: "30px", borderTopRightRadius: "30px" }}
        >
          {/* Header with Cancel, Title, and Add buttons */}
          <div className="flex justify-between items-center px-4 h-12 relative">
            <button className="text-blue-400 text-xs font-semibold">Cancel</button>
            <h2 className="text-center text-sm font-semibold text-gray-300">Add to Home Screen</h2>
            <div className="relative">
              <button className="text-blue-400 text-xs font-semibold">Add</button>
              {showAnimation && (
                <div className="absolute inset-0 w-full h-full rounded-full bg-blue-400 animate-ping"></div>
              )}
            </div>
          </div>

          {/* Add to Home Screen Content */}
          <div className="p-0 flex-1">
            <div className="flex items-center mb-3 bg-gray-800 p-3 ">
              <div className="w-10 h-10 bg-blue-500 rounded-lg mr-3 flex items-center justify-center flex-shrink-0">
                <Globe className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 overflow-hidden">
                <h3 className="text-sm font-semibold mb-0.5 text-white truncate">
                  ROI Rock Paper Scissors on Internet
                </h3>
                <p className="text-xs text-gray-400 truncate">https://getroi.fun</p>
              </div>
            </div>
            <p className="text-[10px] text-gray-400 mb-4 leading-relaxed mx-2">
              An icon will be added to your Home Screen for quick access to this website.
            </p>
          </div>

          {/* Spacer */}
          <div className="flex-1"></div>

          {/* iOS Keyboard Skeleton */}
          <div className="bg-gray-800 p-2">
            <div className="flex justify-between mb-2">
              {[...Array(10)].map((_, index) => (
                <div key={index} className="w-7 h-9 bg-gray-700 rounded-md"></div>
              ))}
            </div>
            <div className="flex justify-between mb-2 px-1">
              {[...Array(9)].map((_, index) => (
                <div key={index} className="w-7 h-9 bg-gray-700 rounded-md"></div>
              ))}
            </div>
            <div className="flex justify-between mb-2">
              <div className="w-11 h-9 bg-gray-600 rounded-md"></div>
              {[...Array(7)].map((_, index) => (
                <div key={index} className="w-7 h-9 bg-gray-700 rounded-md"></div>
              ))}
              <div className="w-11 h-9 bg-gray-600 rounded-md"></div>
            </div>
            <div className="flex justify-between">
              <div className="w-14 h-9 bg-gray-600 rounded-md"></div>
              <div className="w-36 h-9 bg-gray-700 rounded-md"></div>
              <div className="w-14 h-9 bg-gray-600 rounded-md"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

