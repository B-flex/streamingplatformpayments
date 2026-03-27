"use client"

import { AnimationToggle, defaultOverlaySettings } from "@/components/dashboard/animation-toggle"
import { OverlaySceneEditor } from "@/components/dashboard/overlay-scene-editor"
import { OverlayShowcaseSettings } from "@/components/dashboard/overlay-showcase-settings"
import { useOverlayCustomization } from "@/app/context/OverlayCustomizationContext"
import { useOverlaySettings } from "@/app/context/OverlaySettingsContext"
import type { OverlaySettingId } from "@/lib/overlay-settings"
import { giftPackThemes } from "@/lib/gifts"

export default function OverlaySettingsPage() {
  const { settings, updateSetting } = useOverlaySettings()
  const { customization, updateCustomization } = useOverlayCustomization()

  const overlaySettings = defaultOverlaySettings.map((item) => ({
    ...item,
    enabled: settings[item.id],
  }))

  const handleToggle = async (id: OverlaySettingId, enabled: boolean) => {
    await updateSetting(id, enabled)
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
        customization={customization}
        giftPacks={giftPackThemes}
        onGiftPackChange={(giftPack) => updateCustomization("giftPack", giftPack)}
        onGoalTitleChange={(title) => updateCustomization("goalTitle", title)}
        onGoalAmountChange={(amount) =>
          updateCustomization("goalAmount", Number.isFinite(amount) ? Math.max(1000, amount) : 1000)
        }
      />
      <OverlaySceneEditor
        customization={customization}
        updateCustomization={updateCustomization}
      />
    </div>
  )
}
