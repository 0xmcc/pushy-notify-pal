import type React from "react"
import { Share, AlertTriangle } from "lucide-react"

interface IPhoneMockProps {
  className?: string
  isLastStep?: boolean
  showCautionTape?: boolean
  height?: number
  children?: React.ReactNode
}

export const IPhoneMock: React.FC<IPhoneMockProps> = ({ 
  className = "", 
  isLastStep = false, 
  showCautionTape = false, 
  height = 450,
  children 
}) => {
  return (
    <div
      className={`relative w-[300px] rounded-t-[50px] border-[7px] border-gray-700 overflow-hidden shadow-xl pointer-events-none ${className}`}
      style={{ 
        height: `${height}px`,
        borderBottom: "none",
        bottom: isLastStep ? 0 : undefined 
      }}
    >
      {/* Fully Transparent Content Area */}
      <div className="bg-transparent w-full h-full">
        {children}
        {showCautionTape && (
          <div className="absolute inset-0 overflow-hidden z-20">
            <div className="absolute top-1/2 left-1/2 w-[200%] h-12 bg-yellow-400 rotate-45 transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
              <div className="flex items-center space-x-2 text-black font-bold text-sm px-4 py-1 whitespace-nowrap">
                <AlertTriangle className="w-5 h-5" />
                <span>CAUTION: SAFARI ONLY</span>
                <AlertTriangle className="w-5 h-5" />
              </div>
            </div>
          </div>
        )}
        {/* Bottom Bar with Address Bar and Icons */}
        <div className="absolute bottom-[0%] inset-x-0 h-[100px] bg-gray-800 bg-opacity-90 backdrop-blur-md flex flex-col">
          {/* Address Bar */}
          <div className="h-1/2 px-4 flex items-center">
            <div className="w-full h-[35px] bg-gray-700 rounded-full"></div>
          </div>

          {/* Icon Boxes */}
          <div className="h-1/2 flex justify-between items-center px-4">
            {[...Array(5)].map((_, index) => (
              <div
                key={index}
                className={`w-[40px] h-[40px] rounded-lg flex items-center justify-center ${index === 2 ? "relative" : "bg-gray-600"}`}
              >
                {index === 2 && !showCautionTape ? (
                  <>
                    <Share className="w-6 h-6 text-blue-500" />
                    <div className="absolute w-12 h-12 rounded-full border-2 border-blue-500 animate-ping"></div>
                    <div className="absolute w-12 h-12 rounded-full border-2 border-blue-500"></div>
                  </>
                ) : index === 2 ? (
                  <Share className="w-6 h-6 text-gray-400" />
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

