"use client"

import type { ElementType } from "react"
import { cn } from "@/lib/utils"
import { Switch } from "@/components/ui/switch"
import { Sparkles, Volume2, Bell, Eye } from "lucide-react"
import type { OverlaySettingId } from "@/lib/overlay-settings"

export interface ToggleItem {
  id: OverlaySettingId
  label: string
  description: string
  icon: ElementType
  enabled: boolean
}

interface AnimationToggleProps {
  settings: ToggleItem[]
  onToggle: (id: OverlaySettingId, enabled: boolean) => void
  className?: string
}

export function AnimationToggle({ settings, onToggle, className }: AnimationToggleProps) {
  return (
    <div className={cn(
      "bg-zinc-900/80 border border-zinc-800 rounded-xl overflow-hidden",
      className
    )}>
      <div className="px-5 py-4 border-b border-zinc-800">
        <h3 className="text-lg font-semibold text-white">Overlay Settings</h3>
        <p className="text-sm text-zinc-500 mt-1">
          Customize how donations appear on your stream
        </p>
      </div>
      
      <div className="p-5 space-y-3">
        {settings.map((item) => (
          <div
            key={item.id}
            className={cn(
              "flex items-center justify-between p-4 rounded-lg transition-all",
              item.enabled 
                ? "bg-purple-500/10 border border-purple-500/30" 
                : "bg-zinc-800/50 border border-transparent"
            )}
          >
            <div className="flex items-center gap-4">
              <div className={cn(
                "p-2.5 rounded-lg",
                item.enabled ? "bg-purple-500/20" : "bg-zinc-700/50"
              )}>
                <item.icon className={cn(
                  "h-5 w-5",
                  item.enabled ? "text-purple-400" : "text-zinc-500"
                )} />
              </div>
              <div>
                <p className={cn(
                  "font-medium",
                  item.enabled ? "text-white" : "text-zinc-400"
                )}>
                  {item.label}
                </p>
                <p className="text-sm text-zinc-500">{item.description}</p>
              </div>
            </div>
            <Switch
              checked={item.enabled}
              onCheckedChange={(checked) => onToggle(item.id, checked)}
              className="data-[state=checked]:bg-purple-500"
            />
          </div>
        ))}
      </div>
    </div>
  )
}

// Default settings configuration
export const defaultOverlaySettings: ToggleItem[] = [
  {
    id: "animations",
    label: "Donation Animations",
    description: "Show animated alerts for new donations",
    icon: Sparkles,
    enabled: true,
  },
  {
    id: "sounds",
    label: "Sound Effects",
    description: "Play sound when donations arrive",
    icon: Volume2,
    enabled: true,
  },
  {
    id: "notifications",
    label: "Desktop Notifications",
    description: "Get notified even when tab is inactive",
    icon: Bell,
    enabled: false,
  },
  {
    id: "preview",
    label: "Preview Mode",
    description: "Show test donations on your overlay",
    icon: Eye,
    enabled: false,
  },
]
