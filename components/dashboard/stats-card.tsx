"use client"

import { cn } from "@/lib/utils"
import { LucideIcon } from "lucide-react"

interface StatsCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: LucideIcon
  trend?: {
    value: number
    isPositive: boolean
  }
  variant?: "default" | "purple" | "green" | "amber"
}

const variantStyles = {
  default: {
    iconBg: "bg-zinc-800",
    iconColor: "text-zinc-400",
  },
  purple: {
    iconBg: "bg-purple-500/20",
    iconColor: "text-purple-400",
  },
  green: {
    iconBg: "bg-emerald-500/20",
    iconColor: "text-emerald-400",
  },
  amber: {
    iconBg: "bg-amber-500/20",
    iconColor: "text-amber-400",
  },
}

export function StatsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  variant = "default",
}: StatsCardProps) {
  const styles = variantStyles[variant]

  return (
    <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-5 hover:border-zinc-700 transition-colors">
      <div className="flex items-start justify-between">
        <div className="space-y-3">
          <p className="text-sm text-zinc-500 font-medium">{title}</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white">{value}</span>
            {trend && (
              <span className={cn(
                "text-sm font-medium",
                trend.isPositive ? "text-emerald-400" : "text-red-400"
              )}>
                {trend.isPositive ? "+" : "-"}{Math.abs(trend.value)}%
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-xs text-zinc-500">{subtitle}</p>
          )}
        </div>
        <div className={cn("p-3 rounded-xl", styles.iconBg)}>
          <Icon className={cn("h-6 w-6", styles.iconColor)} />
        </div>
      </div>
    </div>
  )
}
