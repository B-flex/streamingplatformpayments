"use client"

import { Check, Gift, Save, Target } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { GiftPackTheme } from "@/lib/gifts"
import type { OverlayCustomization } from "@/lib/overlay-customization"

interface OverlayShowcaseSettingsProps {
  customization: OverlayCustomization
  giftPacks: GiftPackTheme[]
  onGoalTitleChange: (value: string) => void
  onGoalAmountChange: (value: number) => void
  onGiftPackChange: (giftPackId: OverlayCustomization["giftPack"]) => void
  saveState?: "idle" | "saving" | "saved"
  onSave?: () => void
  disableSave?: boolean
}

export function OverlayShowcaseSettings({
  customization,
  giftPacks,
  onGoalTitleChange,
  onGoalAmountChange,
  onGiftPackChange,
  saveState = "idle",
  onSave,
  disableSave = false,
}: OverlayShowcaseSettingsProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/80">
      <div className="border-b border-zinc-800 px-5 py-4">
        <h3 className="text-lg font-semibold text-white">Gift Experience</h3>
        <p className="mt-1 text-sm text-zinc-500">
          Control the creator-facing goal and the gift pack your overlay uses live.
        </p>
      </div>

      <div className="space-y-5 p-5">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-zinc-300">
            <Gift className="h-4 w-4 text-zinc-500" />
            Creator Gift Pack
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {giftPacks.map((pack) => {
              const selected = customization.giftPack === pack.id

              return (
                <button
                  key={pack.id}
                  type="button"
                  onClick={() => onGiftPackChange(pack.id)}
                  className={cn(
                    "rounded-2xl border p-4 text-left transition-all",
                    selected
                      ? "border-purple-500/40 bg-purple-500/10 shadow-[0_0_28px_rgba(168,85,247,0.12)]"
                      : "border-zinc-800 bg-zinc-950/70 hover:border-zinc-700",
                  )}
                >
                  <div className="mb-3 flex gap-2">
                    {pack.accents.map((accent) => (
                      <span
                        key={accent}
                        className="h-3 w-8 rounded-full"
                        style={{ background: accent }}
                      />
                    ))}
                  </div>
                  <p className={cn("font-semibold", selected ? "text-white" : "text-zinc-300")}>
                    {pack.label}
                  </p>
                  <p className="mt-1 text-sm text-zinc-500">{pack.description}</p>
                </button>
              )
            })}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-zinc-300">
              <Target className="h-4 w-4 text-zinc-500" />
              Goal Title
            </label>
            <Input
              value={customization.goalTitle}
              onChange={(event) => onGoalTitleChange(event.target.value)}
              placeholder="Tonight's Gift Goal"
              className="border-zinc-700 bg-zinc-950/70 text-white placeholder:text-zinc-500"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300">Goal Amount (NGN)</label>
            <Input
              type="number"
              min={1000}
              step={500}
              value={customization.goalAmount}
              onChange={(event) => onGoalAmountChange(Number(event.target.value))}
              className="border-zinc-700 bg-zinc-950/70 text-white placeholder:text-zinc-500"
            />
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4">
          <p className="text-sm font-medium text-white">OBS-ready overlay URL</p>
          <div className="mt-3 flex flex-col gap-3 lg:flex-row">
            <Input
              readOnly
              value="http://localhost:3000/overlay"
              className="border-zinc-700 bg-zinc-900 text-white"
            />
            <Button
              type="button"
              variant="outline"
              className="border-zinc-700 bg-zinc-950 text-white hover:bg-zinc-900"
              onClick={() => {
                void navigator.clipboard.writeText("http://localhost:3000/overlay")
              }}
            >
              Copy URL
            </Button>
          </div>
        </div>

        {onSave ? (
          <div className="flex justify-end">
            <Button
              type="button"
              onClick={onSave}
              disabled={disableSave || saveState === "saving"}
              className={cn(
                "min-w-[152px]",
                saveState === "saved"
                  ? "bg-emerald-600 hover:bg-emerald-600"
                  : "bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:opacity-90",
              )}
            >
              {saveState === "saving" ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Saving...
                </span>
              ) : saveState === "saved" ? (
                <span className="flex items-center gap-2">
                  <Check className="h-4 w-4" />
                  Saved
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  Save Experience
                </span>
              )}
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  )
}
