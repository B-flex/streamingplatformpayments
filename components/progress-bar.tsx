"use client"

import { motion } from "framer-motion"
import { Sparkles, Target } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"

interface ProgressBarProps {
  currentAmount: number
  goalAmount: number
  title?: string
  showPercentage?: boolean
  showAmount?: boolean
  className?: string
}

export function ProgressBar({
  currentAmount,
  goalAmount,
  title = "Donation Goal",
  showPercentage = true,
  showAmount = true,
  className,
}: ProgressBarProps) {
  const safeGoalAmount = Math.max(goalAmount, 1)
  const percentage = Math.min((currentAmount / safeGoalAmount) * 100, 100)
  const prevAmountRef = useRef(currentAmount)
  const [isGlowing, setIsGlowing] = useState(false)
  const [animatedPercentage, setAnimatedPercentage] = useState(0)

  useEffect(() => {
    let animationFrame = 0
    const startTime = performance.now()
    const startValue = animatedPercentage
    const duration = 800

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      const nextValue = startValue + (percentage - startValue) * eased

      setAnimatedPercentage(Math.round(nextValue))

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate)
      }
    }

    animationFrame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animationFrame)
  }, [animatedPercentage, percentage])

  useEffect(() => {
    if (currentAmount > prevAmountRef.current) {
      setIsGlowing(true)
      const timer = window.setTimeout(() => setIsGlowing(false), 1400)
      prevAmountRef.current = currentAmount
      return () => window.clearTimeout(timer)
    }

    prevAmountRef.current = currentAmount
  }, [currentAmount])

  return (
    <div className={cn("w-full", className)}>
      <div className="mb-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-white">
          <Target className="h-5 w-5 text-cyan-300" />
          <span className="font-semibold">{title}</span>
          {isGlowing ? (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
              <Sparkles className="h-4 w-4 text-yellow-300" />
            </motion.div>
          ) : null}
        </div>

        {showAmount ? (
          <div className="flex items-center gap-2 text-white">
            <motion.span
              key={currentAmount}
              initial={{ scale: 1.12, color: "#67e8f9" }}
              animate={{ scale: 1, color: "#67e8f9" }}
              className="text-xl font-black"
            >
              NGN {currentAmount.toLocaleString()}
            </motion.span>
            <span className="text-white/45">/</span>
            <span className="text-sm font-medium text-white/70">
              NGN {safeGoalAmount.toLocaleString()}
            </span>
          </div>
        ) : null}
      </div>

      <div className="relative h-6 overflow-hidden rounded-full border border-white/16 bg-black/25 backdrop-blur-md">
        <motion.div
          animate={{
            opacity: isGlowing ? [0.45, 0.9, 0.45] : 0.35,
          }}
          transition={{
            duration: isGlowing ? 0.55 : 2,
            repeat: isGlowing ? 2 : Infinity,
            ease: "easeInOut",
          }}
          className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-400/20 via-fuchsia-400/20 to-amber-300/20"
        />

        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ type: "spring", stiffness: 55, damping: 15 }}
          className="absolute inset-y-0 left-0 overflow-hidden rounded-full"
          style={{
            boxShadow: isGlowing
              ? "0 0 20px rgba(34,211,238,0.5), 0 0 40px rgba(168,85,247,0.35)"
              : "0 0 12px rgba(34,211,238,0.24)",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-violet-500 to-pink-500" />
          <motion.div
            animate={{ x: ["-100%", "160%"] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12"
          />
        </motion.div>

        {showPercentage ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-black tracking-[0.22em] text-white">
              {animatedPercentage}%
            </span>
          </div>
        ) : null}
      </div>
    </div>
  )
}
