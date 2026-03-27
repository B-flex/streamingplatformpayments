"use client"

import { useEffect, useMemo, useState, type ReactNode } from "react"
import {
  AlertTriangle,
  Check,
  CopyPlus,
  Paintbrush,
  RefreshCcw,
  Save,
  Sparkles,
  Trash2,
  Wand2,
} from "lucide-react"
import { useCustomGifts } from "@/app/context/CustomGiftsContext"
import { useOverlayCustomization } from "@/app/context/OverlayCustomizationContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  createEmptyCustomGift,
  defaultCustomGifts,
  giftAnimationOptions,
  type CustomGiftDefinition,
} from "@/lib/custom-gifts"
import { getGiftPackTheme } from "@/lib/gifts"
import { cn } from "@/lib/utils"

type SaveState = "idle" | "saving" | "saved"

function sortGiftsByRange(gifts: CustomGiftDefinition[]) {
  return [...gifts].sort((a, b) => a.minAmount - b.minAmount)
}

function validateCustomGifts(gifts: CustomGiftDefinition[]) {
  const issues: string[] = []

  gifts.forEach((gift, index) => {
    if (!gift.name.trim()) {
      issues.push(`Gift ${index + 1} needs a name.`)
    }

    if (!gift.icon.trim()) {
      issues.push(`${gift.name || `Gift ${index + 1}`} needs an icon or symbol.`)
    }

    if (gift.minAmount < 1) {
      issues.push(`${gift.name || `Gift ${index + 1}`} must start at NGN 1 or more.`)
    }

    if (gift.maxAmount < gift.minAmount) {
      issues.push(`${gift.name || `Gift ${index + 1}`} has a max amount lower than its min.`)
    }

    const previous = gifts[index - 1]
    if (previous && gift.minAmount <= previous.maxAmount) {
      issues.push(
        `${gift.name || `Gift ${index + 1}`} overlaps with ${previous.name || `Gift ${index}`}.`,
      )
    }
  })

  return issues
}

export default function CustomGiftsPage() {
  const { customGifts, saveCustomGifts, resetCustomGifts } = useCustomGifts()
  const { customization } = useOverlayCustomization()
  const [draftGifts, setDraftGifts] = useState<CustomGiftDefinition[]>(customGifts)
  const [saveState, setSaveState] = useState<SaveState>("idle")

  useEffect(() => {
    setDraftGifts(customGifts)
  }, [customGifts])

  const sortedDraftGifts = useMemo(() => sortGiftsByRange(draftGifts), [draftGifts])
  const validationIssues = useMemo(
    () => validateCustomGifts(sortedDraftGifts),
    [sortedDraftGifts],
  )
  const selectedTheme = getGiftPackTheme(customization.giftPack)
  const isDirty =
    JSON.stringify(sortedDraftGifts) !== JSON.stringify(sortGiftsByRange(customGifts))

  const rangeCoverage = useMemo(() => {
    if (sortedDraftGifts.length === 0) {
      return "No gift ranges yet."
    }

    const firstGift = sortedDraftGifts[0]
    const lastGift = sortedDraftGifts[sortedDraftGifts.length - 1]
    return `Coverage: NGN ${firstGift.minAmount.toLocaleString()} to NGN ${lastGift.maxAmount.toLocaleString()}`
  }, [sortedDraftGifts])

  const updateGift = (giftId: string, key: keyof CustomGiftDefinition, value: string | number) => {
    setDraftGifts((current) =>
      current.map((gift) => (gift.id === giftId ? { ...gift, [key]: value } : gift)),
    )
    setSaveState("idle")
  }

  const handleAddGift = () => {
    const nextGift = createEmptyCustomGift()
    const lastGift = sortedDraftGifts[sortedDraftGifts.length - 1]

    if (lastGift) {
      nextGift.minAmount = lastGift.maxAmount + 1
      nextGift.maxAmount = lastGift.maxAmount + 10000
      nextGift.accentStart = lastGift.accentStart
      nextGift.accentMiddle = lastGift.accentMiddle
      nextGift.accentEnd = lastGift.accentEnd
    }

    setDraftGifts((current) => [...current, nextGift])
    setSaveState("idle")
  }

  const handleDuplicateGift = (gift: CustomGiftDefinition) => {
    const clone = {
      ...gift,
      id: createEmptyCustomGift().id,
      name: `${gift.name} Copy`,
      minAmount: gift.maxAmount + 1,
      maxAmount: gift.maxAmount + Math.max(1000, gift.maxAmount - gift.minAmount + 1),
    }

    setDraftGifts((current) => [...current, clone])
    setSaveState("idle")
  }

  const handleRemoveGift = (giftId: string) => {
    setDraftGifts((current) => current.filter((gift) => gift.id !== giftId))
    setSaveState("idle")
  }

  const handleSave = () => {
    if (validationIssues.length > 0) {
      return
    }

    setSaveState("saving")
    saveCustomGifts(sortedDraftGifts)
    setDraftGifts(sortedDraftGifts)
    setSaveState("saved")

    window.setTimeout(() => {
      setSaveState("idle")
    }, 2200)
  }

  const handleReset = () => {
    resetCustomGifts()
    setDraftGifts(defaultCustomGifts)
    setSaveState("idle")
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6 lg:p-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-white">Create Custom Gift</h1>
          <p className="max-w-3xl text-zinc-500">
            Customize your own gift ladder, swap price ranges, and choose from 30 animation styles
            if you want something more personal than the default gift setup.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={handleReset}
            className="border-zinc-700 bg-zinc-950 text-white hover:bg-zinc-900"
          >
            <RefreshCcw className="mr-2 h-4 w-4" />
            Reset Defaults
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={!isDirty || validationIssues.length > 0 || sortedDraftGifts.length === 0}
            className={cn(
              "min-w-[160px]",
              saveState === "saved"
                ? "bg-emerald-600 hover:bg-emerald-600"
                : "bg-gradient-to-r from-fuchsia-600 via-pink-600 to-sky-500 text-white hover:opacity-90",
            )}
          >
            {saveState === "saving" ? (
              <>
                <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Saving...
              </>
            ) : saveState === "saved" ? (
              <>
                <Check className="mr-2 h-4 w-4" />
                Saved
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Custom Gifts
              </>
            )}
          </Button>
        </div>
      </div>

      <section className="grid gap-6 xl:grid-cols-[1.45fr_0.55fr]">
        <div className="space-y-4">
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900/80 p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.28em] text-zinc-500">
                  Gift Experience Builder
                </p>
                <p className="mt-2 text-sm text-zinc-400">
                  {rangeCoverage} Every saved range is used by the overlay, preview mode, and live
                  gift scenes.
                </p>
              </div>
              <Button
                type="button"
                onClick={handleAddGift}
                className="bg-white text-zinc-950 hover:bg-zinc-200"
              >
                <CopyPlus className="mr-2 h-4 w-4" />
                Add New Gift Range
              </Button>
            </div>
          </div>

          {sortedDraftGifts.map((gift, index) => {
            const animation = giftAnimationOptions.find((option) => option.id === gift.animationType)

            return (
              <article
                key={gift.id}
                className="rounded-3xl border border-zinc-800 bg-zinc-900/80 p-5 shadow-[0_24px_80px_rgba(0,0,0,0.24)]"
              >
                <div className="flex flex-col gap-5">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="flex items-center gap-4">
                      <div
                        className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/12 text-3xl shadow-[0_0_40px_rgba(255,255,255,0.08)]"
                        style={{
                          background: `linear-gradient(135deg, ${gift.accentStart}, ${gift.accentMiddle}, ${gift.accentEnd})`,
                        }}
                      >
                        {gift.icon}
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-[0.28em] text-zinc-500">
                          Gift #{index + 1}
                        </p>
                        <h2 className="text-lg font-semibold text-white">{gift.name}</h2>
                        <p className="text-sm text-zinc-400">
                          {animation?.label || "Custom animation"} for NGN{" "}
                          {gift.minAmount.toLocaleString()} to {gift.maxAmount.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => handleDuplicateGift(gift)}
                        className="border-zinc-700 bg-zinc-950 text-white hover:bg-zinc-900"
                      >
                        <CopyPlus className="mr-2 h-4 w-4" />
                        Duplicate
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => handleRemoveGift(gift.id)}
                        disabled={sortedDraftGifts.length === 1}
                        className="border-rose-500/30 bg-rose-500/10 text-rose-200 hover:bg-rose-500/20"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Remove
                      </Button>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <Field label="Gift name">
                      <Input
                        value={gift.name}
                        onChange={(event) => updateGift(gift.id, "name", event.target.value)}
                        className="border-zinc-700 bg-zinc-950/70 text-white"
                      />
                    </Field>
                    <Field label="Gift icon or symbol">
                      <Input
                        value={gift.icon}
                        onChange={(event) => updateGift(gift.id, "icon", event.target.value)}
                        className="border-zinc-700 bg-zinc-950/70 text-white"
                      />
                    </Field>
                    <Field label="Minimum amount (NGN)">
                      <Input
                        type="number"
                        min={1}
                        value={gift.minAmount}
                        onChange={(event) =>
                          updateGift(gift.id, "minAmount", Math.max(1, Number(event.target.value) || 1))
                        }
                        className="border-zinc-700 bg-zinc-950/70 text-white"
                      />
                    </Field>
                    <Field label="Maximum amount (NGN)">
                      <Input
                        type="number"
                        min={gift.minAmount}
                        value={gift.maxAmount}
                        onChange={(event) =>
                          updateGift(
                            gift.id,
                            "maxAmount",
                            Math.max(gift.minAmount, Number(event.target.value) || gift.minAmount),
                          )
                        }
                        className="border-zinc-700 bg-zinc-950/70 text-white"
                      />
                    </Field>
                  </div>

                  <div className="grid gap-4 xl:grid-cols-[1.08fr_0.92fr]">
                    <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4">
                      <div className="mb-4 flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-fuchsia-300" />
                        <p className="text-sm font-semibold text-white">Animation Style</p>
                      </div>

                      <Select
                        value={gift.animationType}
                        onValueChange={(value) => updateGift(gift.id, "animationType", value)}
                      >
                        <SelectTrigger className="border-zinc-700 bg-zinc-900 text-white">
                          <SelectValue placeholder="Select animation type" />
                        </SelectTrigger>
                        <SelectContent className="border-zinc-800 bg-zinc-900">
                          {giftAnimationOptions.map((option) => (
                            <SelectItem
                              key={option.id}
                              value={option.id}
                              className="text-white focus:bg-zinc-800 focus:text-white"
                            >
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <div className="mt-4 grid gap-2 sm:grid-cols-2">
                        {giftAnimationOptions.map((option) => {
                          const active = option.id === gift.animationType
                          return (
                            <button
                              key={option.id}
                              type="button"
                              onClick={() => updateGift(gift.id, "animationType", option.id)}
                              className={cn(
                                "rounded-2xl border px-3 py-3 text-left transition-all",
                                active
                                  ? "border-fuchsia-400/40 bg-fuchsia-500/10 text-white"
                                  : "border-zinc-800 bg-zinc-900/70 text-zinc-300 hover:border-zinc-700 hover:bg-zinc-900",
                              )}
                            >
                              <p className="text-sm font-medium">{option.label}</p>
                              <p className="mt-1 text-xs text-zinc-500">{option.description}</p>
                            </button>
                          )
                        })}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4">
                        <div className="mb-4 flex items-center gap-2">
                          <Paintbrush className="h-4 w-4 text-sky-300" />
                          <p className="text-sm font-semibold text-white">Gift Gradient</p>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-3">
                          <Field label="Start">
                            <Input
                              type="color"
                              value={gift.accentStart}
                              onChange={(event) => updateGift(gift.id, "accentStart", event.target.value)}
                              className="h-12 border-zinc-700 bg-zinc-950/70 p-1"
                            />
                          </Field>
                          <Field label="Middle">
                            <Input
                              type="color"
                              value={gift.accentMiddle}
                              onChange={(event) => updateGift(gift.id, "accentMiddle", event.target.value)}
                              className="h-12 border-zinc-700 bg-zinc-950/70 p-1"
                            />
                          </Field>
                          <Field label="End">
                            <Input
                              type="color"
                              value={gift.accentEnd}
                              onChange={(event) => updateGift(gift.id, "accentEnd", event.target.value)}
                              className="h-12 border-zinc-700 bg-zinc-950/70 p-1"
                            />
                          </Field>
                        </div>
                      </div>

                      <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4">
                        <div className="mb-4 flex items-center gap-2">
                          <Wand2 className="h-4 w-4 text-amber-300" />
                          <p className="text-sm font-semibold text-white">Overlay Preview Notes</p>
                        </div>

                        <div
                          className="rounded-[24px] border border-white/12 p-4"
                          style={{
                            background: `linear-gradient(135deg, ${gift.accentStart}, ${gift.accentMiddle}, ${gift.accentEnd})`,
                          }}
                        >
                          <p className="text-xs uppercase tracking-[0.28em] text-white/70">
                            {selectedTheme.label}
                          </p>
                          <div className="mt-3 flex items-center gap-3">
                            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-black/15 text-3xl backdrop-blur-md">
                              {gift.icon}
                            </div>
                            <div>
                              <p className="text-lg font-semibold text-white">{gift.name}</p>
                              <p className="text-sm text-white/80">{animation?.label}</p>
                            </div>
                          </div>
                          <p className="mt-4 text-sm text-white/85">
                            Viewers will see this gift whenever a donation lands inside this amount
                            range, using your selected colors and animation mood.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            )
          })}
        </div>

        <aside className="space-y-4">
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900/80 p-5">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-zinc-500">
              Setup Summary
            </p>
            <div className="mt-4 space-y-3 text-sm text-zinc-300">
              <p>{sortedDraftGifts.length} custom gift ranges configured.</p>
              <p>30 animation choices are available for every range.</p>
              <p>The saved ladder feeds your live overlay, preview mode, and premium gift scenes.</p>
            </div>
          </div>

          <div
            className={cn(
              "rounded-3xl border p-5",
              validationIssues.length > 0
                ? "border-amber-500/25 bg-amber-500/10"
                : "border-emerald-500/25 bg-emerald-500/10",
            )}
          >
            <div className="flex items-center gap-2">
              {validationIssues.length > 0 ? (
                <AlertTriangle className="h-4 w-4 text-amber-300" />
              ) : (
                <Check className="h-4 w-4 text-emerald-300" />
              )}
              <p className="font-medium text-white">
                {validationIssues.length > 0 ? "Validation needed" : "Ready to save"}
              </p>
            </div>
            <div className="mt-3 space-y-2 text-sm text-zinc-200">
              {validationIssues.length > 0 ? (
                validationIssues.map((issue) => <p key={issue}>{issue}</p>)
              ) : (
                <p>Your custom gift ladder is valid and ready to publish to the overlay.</p>
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-zinc-800 bg-zinc-900/80 p-5">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-zinc-500">
              What This Changes
            </p>
            <div className="mt-4 space-y-3 text-sm text-zinc-300">
              <p>Saved custom ranges override the default gift mapping by donation amount.</p>
              <p>Custom gradients feed the alert glow, badge presentation, and gift styling.</p>
              <p>Premium picks like Lion, Airplane, Universe, and VIP still get special scenes.</p>
            </div>
          </div>
        </aside>
      </section>
    </div>
  )
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium text-zinc-300">{label}</Label>
      {children}
    </div>
  )
}
