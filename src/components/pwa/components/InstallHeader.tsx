import { cn } from "@/lib/utils"
import { ChevronDown } from "lucide-react"
import { useEffect, useState } from "react"
import { Share } from "lucide-react"

const INSTALL_STEPS: Record<number, { content: JSX.Element }> = {
    1: {
        content: (
            <>
                Please tap <Share className="w-6 h-6 inline mx-1 text-orange-400" /> to start
            </>
        )
    },
    2: {
        content: (
            <>
                Scroll down. find "Add to Home Screen" 
            </>
        )
    },
    3: {
        content: (
            <>
                Tap Add in top right corner
            </>
        )
    }
}

export function InstallHeader() {
    const [showArrow, setShowArrow] = useState(true)
    const [currentStep, setCurrentStep] = useState(1)

    // Arrow animation effect
    useEffect(() => {
        const toggleArrow = () => setShowArrow(prev => !prev)
        const arrowTimer = setInterval(toggleArrow, 1000)
        return () => clearInterval(arrowTimer)
    }, [])

    // Step transition effect
    useEffect(() => {
        const nextStep = () => setCurrentStep(prev => prev === 3 ? 1 : prev + 1)
        const stepTimer = setInterval(nextStep, 5000)
        return () => clearInterval(stepTimer)
    }, [])

    return (
        <div className="flex-1 flex items-center justify-center pt-3 pb-3 mb-2 bg-black/70 rounded-2xl max-w-[90%] mx-auto bg-gradient-to-t from-orange-500/40 to-yellow-400/10">
            <div className="flex items-center gap-3">
                {/* <HandHoldingPhone width={36} height={36}  /> */}
                <h1 className="texttext-2xl font-semibold bg-gradient-to-r from-orange-500 to-yellow-400 text-transparent bg-clip-text text-black">
                    {INSTALL_STEPS[currentStep].content}
                </h1>
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
        </div>
    )
} 