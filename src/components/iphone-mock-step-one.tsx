import type React from "react"
import { Share } from "lucide-react"

interface IPhoneMockProps {
  className?: string
}

export const IPhoneMock: React.FC<IPhoneMockProps> = ({ className = "" }) => {
  return (
    <div
      className={`relative w-[300px] h-[450px] rounded-t-[50px] border-[7px] border-gray-700 overflow-hidden shadow-xl pointer-events-none ${className}`}
    >
      {/* Fully Transparent Content Area */}
      <div className="bg-transparent w-full h-full">
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
                {index === 2 ? (
                  <>
                    <Share className="w-6 h-6 text-blue-500" />
                    <div className="absolute w-12 h-12 rounded-full border-2 border-blue-500 animate-ping"></div>
                    <div className="absolute w-12 h-12 rounded-full border-2 border-blue-500"></div>
                  </>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

