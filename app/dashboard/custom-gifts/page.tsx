"use client"

import { useEffect, useMemo, useState, type ReactNode } from "react"
import {
  AlertTriangle,
  Check,
  CopyPlus,
  PlayCircle,
  RefreshCcw,
  Save,
  Sparkles,
  Trash2,
} from "lucide-react"
import { useCustomGifts } from "@/app/context/CustomGiftsContext"
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
import { GiftAnimationPreview } from "@/components/dashboard/gift-animation-preview"
import {
  buildGiftDefinition,
  createEmptyCustomGift,
  defaultCustomGifts,
  getGiftCatalogItem,
  giftAnimationOptions,
  giftNameOptions,
  type CustomGiftDefinition,
} from "@/lib/custom-gifts"
import { cn } from "@/lib/utils"

type SaveState = "idle" | "saving" | "saved"

function sortGiftsByRange(gifts: CustomGiftDefinition[]) {
  return [...gifts].sort((a, b) => a.minAmount - b.minAmount)
}

function validateCustomGifts(gifts: CustomGiftDefinition[]) {
  const issues: string[] = []

  gifts.forEach((gift, index) => {
    if (!gift.name.trim()) {
      issues.push(`Gift ${index + 1} needs a selected gift animation.`)
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

  const updateGift = (giftId: string, updater: (gift: CustomGiftDefinition) => CustomGiftDefinition) => {
    setDraftGifts((current) => current.map((gift) => (gift.id === giftId ? updater(gift) : gift)))
    setSaveState("idle")
  }

  const handleGiftNameChange = (giftId: string, name: string) => {
    updateGift(giftId, (gift) =>
      buildGiftDefinition(name, {
        id: gift.id,
        minAmount: gift.minAmount,
        maxAmount: gift.maxAmount,
      }),
    )
  }

  const handleAddGift = () => {
    const nextGift = createEmptyCustomGift()
    const lastGift = sortedDraftGifts[sortedDraftGifts.length - 1]

    if (lastGift) {
      nextGift.minAmount = lastGift.maxAmount + 1
      nextGift.maxAmount = lastGift.maxAmount + 10000
    }

    setDraftGifts((current) => [...current, nextGift])
    setSaveState("idle")
  }

  const handleDuplicateGift = (gift: CustomGiftDefinition) => {
    const clone = {
      ...gift,
      id: createEmptyCustomGift().id,
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
            Build your own gift ladder with compact preview scenes. Pick a gift name, the matching
            animation look updates automatically, then set the amount range and save it for your
            live overlay.
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
                  Gift Animation Builder
                </p>
                <p className="mt-2 text-sm text-zinc-400">
                  {rangeCoverage} Each gift row stays compact, and the preview auto-changes as soon
                  as you choose a different gift name.
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
            const catalogGift = getGiftCatalogItem(gift.name)

            return (
              <article
                key={gift.id}
                className="rounded-3xl border border-zinc-800 bg-zinc-900/80 p-4 shadow-[0_24px_80px_rgba(0,0,0,0.24)]"
              >
                <div className="grid gap-4 xl:grid-cols-[220px_minmax(0,1fr)]">
                  <div className="space-y-3">
                    <GiftAnimationPreview gift={gift} />
                    <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 px-3 py-3">
                      <p className="text-[10px] uppercase tracking-[0.28em] text-zinc-500">
                        Preview Scene
                      </p>
                      <p className="mt-1 text-sm font-semibold text-white">{catalogGift.previewLabel}</p>
                      <p className="mt-1 text-xs text-zinc-400">
                        {animation?.label || "Custom animation"} preview for stream alerts
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                      <div>
                        <p className="text-xs uppercase tracking-[0.28em] text-zinc-500">
                          Gift #{index + 1}
                        </p>
                        <h2 className="text-lg font-semibold text-white">{gift.name}</h2>
                        <p className="text-sm text-zinc-400">
                          NGN {gift.minAmount.toLocaleString()} to {gift.maxAmount.toLocaleString()}
                        </p>
                      </div>

                      <div className="flex gap-2">
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
                      <Field label="Gift animation name">
                        <Select value={gift.name} onValueChange={(value) => handleGiftNameChange(gift.id, value)}>
                          <SelectTrigger className="border-zinc-700 bg-zinc-950/70 text-white">
                            <SelectValue placeholder="Choose a gift" />
                          </SelectTrigger>
                          <SelectContent className="border-zinc-800 bg-zinc-900">
                            {giftNameOptions.map((option) => (
                              <SelectItem
                                key={option}
                                value={option}
                                className="text-white focus:bg-zinc-800 focus:text-white"
                              >
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </Field>

                      <Field label="Minimum amount (NGN)">
                        <Input
                          type="number"
                          min={1}
                          value={gift.minAmount}
                          onChange={(event) =>
                            updateGift(gift.id, (current) => ({
                              ...current,
                              minAmount: Math.max(1, Number(event.target.value) || 1),
                            }))
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
                            updateGift(gift.id, (current) => ({
                              ...current,
                              maxAmount: Math.max(
                                current.minAmount,
                                Number(event.target.value) || current.minAmount,
                              ),
                            }))
                          }
                          className="border-zinc-700 bg-zinc-950/70 text-white"
                        />
                      </Field>

                      <Field label="Animation style">
                        <Select
                          value={gift.animationType}
                          onValueChange={(value) =>
                            updateGift(gift.id, (current) => ({ ...current, animationType: value as CustomGiftDefinition["animationType"] }))
                          }
                        >
                          <SelectTrigger className="border-zinc-700 bg-zinc-950/70 text-white">
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
                      </Field>
                    </div>

                    <div className="grid gap-2 md:grid-cols-3">
                      <MiniInfoCard
                        icon={<Sparkles className="h-4 w-4 text-fuchsia-300" />}
                        title="Auto visual"
                        body={`Switching to ${gift.name} updates the live scene look automatically.`}
                      />
                      <MiniInfoCard
                        icon={<PlayCircle className="h-4 w-4 text-sky-300" />}
                        title="Preview ready"
                        body="The compact preview tile shows the animation mood without taking over the row."
                      />
                      <MiniInfoCard
                        icon={<Check className="h-4 w-4 text-emerald-300" />}
                        title="Overlay sync"
                        body="Saved ranges feed the actual overlay gift mapping by donation amount."
                      />
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
              <p>30 animation styles are still available for each gift range.</p>
              <p>Gift names now auto-drive the matching visual instead of using manual icons.</p>
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
              What Changed
            </p>
            <div className="mt-4 space-y-3 text-sm text-zinc-300">
              <p>Manual icon editing is gone. Gift visuals now follow the selected gift name.</p>
              <p>Gradient controls were removed to keep each gift row tighter and faster to use.</p>
              <p>The preview tile acts like a mini looping gift animation so creators can judge the vibe quickly.</p>
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

function MiniInfoCard({
  icon,
  title,
  body,
}: {
  icon: ReactNode
  title: string
  body: string
}) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950/65 px-3 py-3">
      <div className="flex items-center gap-2">
        {icon}
        <p className="text-sm font-semibold text-white">{title}</p>
      </div>
      <p className="mt-2 text-xs leading-5 text-zinc-400">{body}</p>
    </div>
  )
}
