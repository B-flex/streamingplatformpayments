"use client"

import { cn } from "@/lib/utils"
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react"

interface EarningsSummaryCardProps {
  title: string
  amount: number
  previousAmount?: number
  icon: LucideIcon
  accentColor?: "purple" | "green" | "amber" | "cyan"
  glowing?: boolean
}

const accentStyles = {
  purple: {
    bg: "bg-purple-500/10",
    border: "border-purple-500/30",
    glow: "shadow-[0_0_30px_rgba(168,85,247,0.3)]",
    iconBg: "bg-purple-500/20",
    iconColor: "text-purple-400",
    gradient: "from-purple-500 to-pink-500",
  },
  green: {
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/30",
    glow: "shadow-[0_0_30px_rgba(16,185,129,0.3)]",
    iconBg: "bg-emerald-500/20",
    iconColor: "text-emerald-400",
    gradient: "from-emerald-500 to-teal-500",
  },
  amber: {
    bg: "bg-amber-500/10",
    border: "border-amber-500/30",
    glow: "shadow-[0_0_30px_rgba(245,158,11,0.3)]",
    iconBg: "bg-amber-500/20",
    iconColor: "text-amber-400",
    gradient: "from-amber-500 to-orange-500",
  },
  cyan: {
    bg: "bg-cyan-500/10",
    border: "border-cyan-500/30",
    glow: "shadow-[0_0_30px_rgba(6,182,212,0.3)]",
    iconBg: "bg-cyan-500/20",
    iconColor: "text-cyan-400",
    gradient: "from-cyan-500 to-blue-500",
  },
}

export function EarningsSummaryCard({
  title,
  amount,
  previousAmount,
  icon: Icon,
  accentColor = "purple",
  glowing = false,
}: EarningsSummaryCardProps) {
  const styles = accentStyles[accentColor]
  
  const percentageChange = previousAmount 
    ? ((amount - previousAmount) / previousAmount) * 100 
    : null
  
  const isPositive = percentageChange !== null && percentageChange >= 0

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border p-6 transition-all duration-300 hover:scale-[1.02]",
        "bg-zinc-900/80",
        styles.border,
        glowing && styles.glow
      )}
    >
      {/* Gradient accent line at top */}
      <div className={cn("absolute top-0 left-0 right-0 h-1 bg-gradient-to-r", styles.gradient)} />
      
      <div className="flex items-start justify-between">
        <div className="space-y-3">
          <p className="text-sm text-zinc-400 font-medium">{title}</p>
          <p className="text-3xl font-bold text-white">
            ₦{amount.toLocaleString()}
          </p>
          {percentageChange !== null && (
            <div className="flex items-center gap-1.5">
              {isPositive ? (
                <TrendingUp className="h-4 w-4 text-emerald-400" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-400" />
              )}
              <span className={cn(
                "text-sm font-medium",
                isPositive ? "text-emerald-400" : "text-red-400"
              )}>
                {isPositive ? "+" : ""}{percentageChange.toFixed(1)}%
              </span>
              <span className="text-zinc-500 text-sm">vs previous</span>
            </div>
          )}
        </div>
        <div className={cn("p-3 rounded-xl", styles.iconBg)}>
          <Icon className={cn("h-6 w-6", styles.iconColor)} />
        </div>
      </div>
    </div>
  )
}
