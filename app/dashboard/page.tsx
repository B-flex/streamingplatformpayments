"use client"

import { useEffect, useMemo, useState } from "react"
import { Wallet, Users, TrendingUp, Gift } from "lucide-react"
import { useDonations } from "@/app/context/DonationsContext"
import { useOverlaySettings } from "@/app/context/OverlaySettingsContext"
import { useOverlayCustomization } from "@/app/context/OverlayCustomizationContext"
import { useAuth } from "@/app/context/AuthContext"
import { StatsCard } from "@/components/dashboard/stats-card"
import { DonationsTable } from "@/components/dashboard/donations-table"
import { VirtualAccountCard } from "@/components/dashboard/virtual-account-card"
import { AnimationToggle, defaultOverlaySettings } from "@/components/dashboard/animation-toggle"
import { ObsConnectCard } from "@/components/dashboard/obs-connect-card"
import { OverlayShowcaseSettings } from "@/components/dashboard/overlay-showcase-settings"
import type { OverlaySettingId } from "@/lib/overlay-settings"
import { giftPackThemes } from "@/lib/gifts"
import type { OverlayCustomization } from "@/lib/overlay-customization"

const fallbackVirtualAccount = {
  accountName: "No virtual account yet",
  accountNumber: "Register a user first",
  bankName: "Monnify",
}

const formatCurrency = (num: number) => {
  if (num >= 1_000_000_000) return "NGN " + (num / 1_000_000_000).toFixed(1) + "B"
  if (num >= 1_000_000) return "NGN " + (num / 1_000_000).toFixed(1) + "M"
  if (num >= 1_000) return "NGN " + (num / 1_000).toFixed(1) + "K"
  return "NGN " + num
}

export default function DashboardPage() {
  const { donations } = useDonations()
  const { settings, updateSetting } = useOverlaySettings()
  const { customization, updateCustomization } = useOverlayCustomization()
  const { user } = useAuth()
  const [draftCustomization, setDraftCustomization] = useState<OverlayCustomization>(customization)
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
      draftCustomization.giftPack !== customization.giftPack ||
      draftCustomization.goalAmount !== customization.goalAmount ||
      draftCustomization.goalTitle !== customization.goalTitle,
    [customization, draftCustomization],
  )

  const handleSaveExperience = async () => {
    setSaveState("saving")

    updateCustomization("giftPack", draftCustomization.giftPack)
    updateCustomization("goalTitle", draftCustomization.goalTitle.trim() || "Tonight's Gift Goal")
    updateCustomization("goalAmount", Math.max(1000, draftCustomization.goalAmount))

    setSaveState("saved")
    window.setTimeout(() => {
      setSaveState("idle")
    }, 2200)
  }

  const totalEarnings = donations.reduce((sum, donation) => sum + Number(donation.amount || 0), 0)
  const totalDonations = donations.length
  const uniqueDonors = new Set(donations.map((donation) => donation.senderName)).size
  const avgDonation = totalDonations > 0 ? Math.round(totalEarnings / totalDonations) : 0

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-zinc-500">Welcome back! Here{"'"}s your streaming overview.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatsCard
          title="Total Earnings"
          value={formatCurrency(totalEarnings)}
          subtitle="All time"
          icon={Wallet}
          variant="purple"
          trend={{ value: 12, isPositive: true }}
        />
        <StatsCard
          title="Total Donations"
          value={totalDonations}
          subtitle="This month"
          icon={Gift}
          variant="green"
          trend={{ value: 8, isPositive: true }}
        />
        <StatsCard
          title="Unique Donors"
          value={uniqueDonors}
          subtitle="All time"
          icon={Users}
          variant="amber"
        />
        <StatsCard
          title="Average Donation"
          value={formatCurrency(avgDonation)}
          subtitle="Per transaction"
          icon={TrendingUp}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <DonationsTable donations={donations} />
        </div>

        <div className="space-y-6">
          <VirtualAccountCard account={user?.virtualAccount || fallbackVirtualAccount} />
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
          <ObsConnectCard />
        </div>
      </div>
    </div>
  )
}
