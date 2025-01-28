import type React from "react"
import { useState, useEffect } from "react"
import { User, Copy, Plus } from "lucide-react"
import { S } from "node_modules/@privy-io/react-auth/dist/dts/types-C5QcnhuT"

interface IPhoneMockStepTwoProps {
  className?: string
}

export const IPhoneMockStepTwo: React.FC<IPhoneMockStepTwoProps> = ({ className = "" }) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [showPulse, setShowPulse] = useState(false)

  useEffect(() => {
    setTimeout(() => {
      setIsExpanded(true)
      setTimeout(() => {
        setShowPulse(true)
      }, 1000) // 1 second delay after expansion
    }, 1000)
  }, [])

  useEffect(() => {

    const expandTimer = setInterval(() => {
      setShowPulse(false)
      setIsExpanded((prev) => !prev)
      if (!isExpanded) {
        setTimeout(() => {
          setShowPulse(true)
        }, 1000) // 1 second delay after expansion
      } else {
        setShowPulse(false)
      }
    }, 5000) // Toggle every 5 seconds

    return () => clearInterval(expandTimer)
  }, [isExpanded])

  return (
    <div
      className={`relative w-[300px] h-[450px] rounded-t-[50px] border-[7px] border-gray-700 overflow-hidden shadow-xl pointer-events-none ${className}`}
      style={{ borderBottom: "none" }}
    >
      {/* Fully Transparent Content Area */}
      <div className="bg-transparent w-full h-full">
        {/* Bottom Bar with Share Sheet */}
        <div
          className={`absolute bottom-0 inset-x-0 bg-gray-900 rounded-t-[30px] flex flex-col transition-all duration-700 ease-in-out ${isExpanded ? "h-[500px]" : "h-[300px]"}`}
          style={{ borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }}
        >
          {/* Swipe Indicator */}
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div
              className={`w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center ${isExpanded ? "animate-swipe-up" : "animate-pulse"}`}
            >
              <div className="w-1.5 h-3 bg-gray-400 rounded-full"></div>
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="overflow-y-auto h-full">
            {/* Website Metadata */}
            <div className="h-[60px] px-4 py-2 flex items-center border-b border-gray-700">
              <div className="w-10 h-10 bg-gray-700 rounded-md mr-3"></div>
              <div className="flex-1">
                <div className="h-4 w-3/4 bg-gray-700 rounded mb-2"></div>
                <div className="h-3 w-1/2 bg-gray-600 rounded"></div>
              </div>
            </div>

            {/* User's Contacts */}
            <div className="h-[80px] px-4 py-2 flex items-center space-x-4 overflow-x-auto">
              {[...Array(5)].map((_, index) => (
                <div key={index} className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-gray-500" />
                  </div>
                  <div className="h-2 w-10 bg-gray-600 rounded mt-2"></div>
                </div>
              ))}
            </div>

            {/* Row of Apps */}
            <div className="h-[100px] px-4 py-2 flex items-center space-x-4 overflow-x-auto">
              {[...Array(6)].map((_, index) => (
                <div key={index} className="flex flex-col items-center">
                  <div className="w-14 h-14 bg-gray-700 rounded-xl"></div>
                  <div className="h-2 w-12 bg-gray-600 rounded mt-2"></div>
                </div>
              ))}
            </div>

            {/* Menu Items */}
            <div className="px-4 py-2 space-y-2">
              {/* Copy Menu Item */}
              <div className="h-[50px] bg-gray-800 rounded-md flex items-center px-4">
                {/* <Copy className="w-5 h-5 text-gray-300 mr-3" />
                <div className="h-3 w-1/4 bg-gray-700 rounded"></div> */}
              </div>

              {/* Two gray box menu items before Add to Home Screen */}
              {[...Array(2)].map((_, index) => (
                <div key={index} className="h-[50px] bg-gray-800 rounded-md"></div>
              ))}

              {/* Add to Home Screen (fourth item) */}
              <div className="h-[50px] bg-gray-800 rounded-md flex items-center px-4 relative">
                <div className="w-5 h-5 bg-gray-700 rounded mr-3 flex items-center justify-center relative">
                  <Plus className="w-4 h-4 text-gray-300" />
                  {showPulse && (
                    <div className="absolute inset-0 rounded-full animate-ping-slow border-2 border-blue-500"></div>
                  )}
                </div>
                <div className="text-sm text-gray-300">Add to Home Screen</div>
              </div>

              {/* Additional menu items (gray boxes) */}
              {[...Array(6)].map((_, index) => (
                <div key={index} className="h-[50px] bg-gray-800 rounded-md"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

