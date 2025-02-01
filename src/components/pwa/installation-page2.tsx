import { ChevronDown, ArrowUpFromLine, Plus, Share, SquareStack } from "lucide-react"
import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"
import { IPhoneMock } from "@/components/pwa/iphoneMocks/iphone-mock-step-one"
import { HandHoldingPhone } from "@/components/icons/HandHoldingPhone"
import { VideoBackground } from "./components/VideoBackground"
import { FireBar } from "./components/FireBar"
import { InstallHeader } from "./components/InstallHeader"
export function InstallationPage() {
  const [showArrow, setShowArrow] = useState(true)

  return (
    <div className="fixed inset-0 bg-black text-white">
      <VideoBackground />

      {/* Content Layer */}
      <div className="relative z-20 flex flex-col justify-center h-full">
        {/* Top Content */}
        <div className="w-full">
          <InstallHeader />
        </div>

        {/* Bottom Fire Bar */}
        <div className="w-full">
          {/* <FireBar /> */}
        </div>
      </div>
    </div>
  )
}

