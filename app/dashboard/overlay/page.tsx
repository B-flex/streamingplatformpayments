"use client"

import { useEffect, useMemo, useState } from "react"
import { AnimationToggle, defaultOverlaySettings } from "@/components/dashboard/animation-toggle"
import { ObsConnectCard } from "@/components/dashboard/obs-connect-card"
import { OverlaySceneEditor } from "@/components/dashboard/overlay-scene-editor"
import { OverlayShowcaseSettings } from "@/components/dashboard/overlay-showcase-settings"
import { useOverlayCustomization } from "@/app/context/OverlayCustomizationContext"
import { useOverlaySettings } from "@/app/context/OverlaySettingsContext"
import type { OverlaySettingId } from "@/lib/overlay-settings"
import { giftPackThemes } from "@/lib/gifts"

export default function OverlaySettingsPage() {
  const { settings, updateSetting } = useOverlaySettings()
  const { customization, updateCustomization } = useOverlayCustomization()
  const [draftCustomization, setDraftCustomization] = useState(customization)
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">("idle")

  useEffect(() => {
    setDraftCustomization(customization)
  }, [customization])

  const overlaySettings = defaultOverlaySettings.map((item) => ({
    ...item,
    enabled: settings[item.id],
  }))

  const handleToggle = async (id: OverlaySettingId, enabled: boolean) => {
    await updateSetting(id, enabled)
  }

  const customizationChanged = useMemo(
    () =>
      JSON.stringify(draftCustomization) !== JSON.stringify(customization),
    [customization, draftCustomization],
  )

  const handleSaveExperience = () => {
    setSaveState("saving")

    updateCustomization("giftPack", draftCustomization.giftPack)
    updateCustomization("goalTitle", draftCustomization.goalTitle.trim() || "Tonight's Gift Goal")
    updateCustomization("goalAmount", Math.max(1000, draftCustomization.goalAmount))

    setSaveState("saved")
    window.setTimeout(() => {
      setSaveState("idle")
    }, 2200)
  }

  return (
    <div className="max-w-7xl space-y-6 p-6 lg:p-8">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-white">Overlay Settings</h1>
        <p className="text-zinc-500">
          Control alert animations, sounds, desktop notifications, and preview mode across your dashboard and overlay tabs.
        </p>
      </div>

      <AnimationToggle settings={overlaySettings} onToggle={handleToggle} />
      <OverlayShowcaseSettings
        customization={draftCustomization}
        giftPacks={giftPackThemes}
        onGiftPackChange={(giftPack) =>
          setDraftCustomization((current) => ({ ...current, giftPack }))
        }
        onGoalTitleChange={(title) =>
          setDraftCustomization((current) => ({ ...current, goalTitle: title }))
        }
        onGoalAmountChange={(amount) =>
          setDraftCustomization((current) => ({
            ...current,
            goalAmount: Number.isFinite(amount) ? Math.max(1000, amount) : 1000,
          }))
        }
        saveState={saveState}
        onSave={handleSaveExperience}
        disableSave={!customizationChanged}
      />
      <OverlaySceneEditor
        customization={customization}
        updateCustomization={updateCustomization}
      />
      <ObsConnectCard />
    </div>
  )
}
