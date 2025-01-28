"use client"

import { Button } from "@/components/ui/button"
import { ChevronRight } from "lucide-react"
import { motion } from "framer-motion"
interface AnimatedNextButtonProps {
    onClick?: () => void;
    className?: string;
    disabled?: boolean;
}

export default function AnimatedNextButton({ onClick, className, disabled = false }: AnimatedNextButtonProps) {
    const chevronVariants = (invert: boolean) => ({
        animate: {
            opacity: disabled ? 0.5 : [0.5, 1, 0.5],
            transition: {
                repeat: disabled ? 0 : Number.POSITIVE_INFINITY,
                duration: 1,
                ease: "easeInOut",
            },
        },
    })

    const containerVariants = {
        animate: {
            x: disabled ? 0 : [0, 5, 0],
            transition: {
                repeat: disabled ? 0 : Number.POSITIVE_INFINITY,
                duration: 1,
                ease: "easeInOut",
            },
        },
    }

    return (
        <Button 
            className={`${className} ${
                disabled 
                    ? 'bg-gray-600 hover:bg-gray-600 bg-none' 
                    : 'bg-gradient-to-r from-gaming-primary to-gaming-secondary'
            }`} 
            onClick={onClick} 
            disabled={disabled}
        >
            NEXT
            <motion.div className="inline-flex ml-2 space-x-[-0.5em]" variants={containerVariants} animate="animate">
                <motion.div variants={chevronVariants(false)} animate="animate">
                    <ChevronRight className="w-6 h-6" />
                </motion.div>
                <motion.div variants={chevronVariants(true)} animate="animate">
                    <ChevronRight className="w-6 h-6" />
                </motion.div>
            </motion.div>
        </Button>
    )
}

