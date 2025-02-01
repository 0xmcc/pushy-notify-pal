import { ChevronDown, Share } from "lucide-react"
import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"
import { HandHoldingPhone } from "@/components/icons/HandHoldingPhone"

export function FireBar() {
  const [showArrow, setShowArrow] = useState(true)
  const phoneSize = 66

  useEffect(() => {
    const toggleArrow = () => setShowArrow(prev => !prev)
    const arrowTimer = setInterval(toggleArrow, 1000)
    return () => clearInterval(arrowTimer)
  }, [])

  return (
    <div className="w-full bg-black/90 pb-2 pt-2 px-6 relative">
      <div className="absolute inset-0 bg-gradient-to-t from-orange-500/20 to-yellow-400/10" />
      
      <div className="relative text-center flex items-center justify-between">
        <HandHoldingPhone width={phoneSize} height={phoneSize} color="#f97316" />
        
        <div className="flex flex-col items-center">
          <p className="text-lg font-medium mb-2 bg-gradient-to-r from-orange-500 to-yellow-400 text-transparent bg-clip-text mr-6">
            Please tap <Share className="w-6 h-6 inline mx-1 text-orange-400" /> to start
          </p>
          <div className="relative inline-block">
            <ChevronDown
              className={cn(
                "w-8 h-8 inline-block animate-bounce transition-opacity duration-500 text-yellow-400",
                !showArrow && "opacity-50",
              )}
            />
            <ChevronDown
              className={cn(
                "w-8 h-8 inline-block animate-bounce absolute top-2 left-0 transition-opacity duration-500 text-orange-500",
                showArrow && "opacity-50",
              )}
            />
          </div>
        </div>
        
        <HandHoldingPhone width={phoneSize} height={phoneSize} color="#f97316" />
      </div>
    </div>
  )
} 