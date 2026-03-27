"use client"

import Link from "next/link"
import { useEffect, useMemo, useState, type ElementType } from "react"
import {
  Bell,
  Check,
  CreditCard,
  Eye,
  Mail,
  Save,
  Sparkles,
  User,
  Volume2,
  Wallet,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { useAppPreferences } from "@/app/context/AppPreferencesContext"
import { useAuth } from "@/app/context/AuthContext"
import { useOverlayCustomization } from "@/app/context/OverlayCustomizationContext"
import { useOverlaySettings } from "@/app/context/OverlaySettingsContext"
import { OverlayShowcaseSettings } from "@/components/dashboard/overlay-showcase-settings"
import { giftPackThemes } from "@/lib/gifts"
import { authRequest } from "@/lib/auth-client"
import { cn } from "@/lib/utils"
import type { AppPreferences } from "@/lib/app-preferences"
import type { OverlaySettingId } from "@/lib/overlay-settings"
import type { AppUser } from "@/lib/user"

type ProfileForm = {
  name: string
  email: string
}

type SaveState = "idle" | "saving" | "saved" | "error"

const NOTIFICATION_SETTINGS: Array<{
  id: keyof Pick<
    AppPreferences,
    "desktopNotifications" | "donationNotifications" | "payoutNotifications" | "notificationSounds"
  >
  label: string
  description: string
  icon: ElementType
}> = [
  {
    id: "desktopNotifications",
    label: "Desktop Notifications",
    description: "Show browser alerts for supported donation and payout events.",
    icon: Bell,
  },
  {
    id: "donationNotifications",
    label: "Donation Alerts",
    description: "Trigger notifications whenever a new donation arrives.",
    icon: Sparkles,
  },
  {
    id: "payoutNotifications",
    label: "Payout Alerts",
    description: "Keep payout status and withdrawal completion alerts turned on.",
    icon: Wallet,
  },
  {
    id: "notificationSounds",
    label: "Notification Sounds",
    description: "Play the configured browser sound for donations and payouts.",
    icon: Volume2,
  },
]

const OVERLAY_SETTINGS: Array<{
  id: OverlaySettingId
  label: string
  description: string
  icon: ElementType
}> = [
  {
    id: "animations",
    label: "Donation Animations",
    description: "Show animated overlay alerts for incoming donations.",
    icon: Sparkles,
  },
  {
    id: "sounds",
    label: "Overlay Sounds",
    description: "Play overlay audio whenever donation alerts appear on stream.",
    icon: Volume2,
  },
  {
    id: "notifications",
    label: "Overlay Desktop Alerts",
    description: "Mirror overlay events to your desktop for extra visibility.",
    icon: Bell,
  },
  {
    id: "preview",
    label: "Preview Mode",
    description: "Run sample donation events in the overlay so you can test it safely.",
    icon: Eye,
  },
]

function formatMemberDate(value?: string) {
  if (!value) return "Not available yet"

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return "Not available yet"
  }

  return new Intl.DateTimeFormat("en-NG", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date)
}

export default function SettingsPage() {
  const { user, refreshUser } = useAuth()
  const { preferences, updatePreference } = useAppPreferences()
  const { customization, updateCustomization } = useOverlayCustomization()
  const { settings: overlaySettings, updateSetting } = useOverlaySettings()
  const [profile, setProfile] = useState<ProfileForm>({ name: "", email: "" })
  const [saveState, setSaveState] = useState<SaveState>("idle")
  const [profileMessage, setProfileMessage] = useState("")
  const [isLoadingUser, setIsLoadingUser] = useState(true)

  useEffect(() => {
    setProfile({
      name: user?.name || "",
      email: user?.email || "",
    })
    setIsLoadingUser(false)
  }, [user])

  const profileDirty = useMemo(() => {
    return profile.name !== (user?.name || "") || profile.email !== (user?.email || "")
  }, [profile, user])

  const handleProfileChange = (field: keyof ProfileForm, value: string) => {
    setProfile((current) => ({
      ...current,
      [field]: value,
    }))
    setSaveState("idle")
    setProfileMessage("")
  }

  const handleProfileSave = async () => {
    if (!profile.name.trim() || !profile.email.trim()) {
      setSaveState("error")
      setProfileMessage("Name and email are required before you can save profile changes.")
      return
    }

    setSaveState("saving")
    setProfileMessage("")

    try {
        const response = await authRequest("/user", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: profile.name.trim(),
          email: profile.email.trim(),
        }),
      })

      const payload = await response.json().catch(() => null)

      if (!response.ok) {
        throw new Error(payload?.error || "Could not save your profile.")
      }

      const nextUser = payload as AppUser
      await refreshUser()
      setProfile({
        name: nextUser.name,
        email: nextUser.email,
      })
      setSaveState("saved")
      setProfileMessage("Profile settings saved successfully.")
      window.setTimeout(() => {
        setSaveState("idle")
      }, 2500)
    } catch (error) {
      setSaveState("error")
      setProfileMessage(
        error instanceof Error ? error.message : "Could not save your profile.",
      )
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6 lg:p-8">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-white">Settings</h1>
          <p className="text-zinc-500">
            Manage your profile, live notifications, and overlay behavior from one place.
          </p>
        </div>
        <Link
          href="/dashboard/notifications"
          className="inline-flex h-10 items-center justify-center rounded-lg border border-zinc-700 bg-zinc-900 px-4 text-sm font-medium text-white transition-colors hover:bg-zinc-800"
        >
          Open Notifications Page
        </Link>
      </div>

      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/80">
          <div className="border-b border-zinc-800 px-6 py-4">
            <h2 className="text-lg font-semibold text-white">Profile</h2>
            <p className="mt-1 text-sm text-zinc-500">
              This information is loaded from your backend user record and saved back there.
            </p>
          </div>

          <div className="space-y-5 p-6">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-zinc-300">
                <User className="h-4 w-4 text-zinc-500" />
                Display Name
              </label>
              <Input
                value={profile.name}
                onChange={(event) => handleProfileChange("name", event.target.value)}
                placeholder="Your display name"
                className="border-zinc-700 bg-zinc-950/70 text-white placeholder:text-zinc-500"
              />
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-zinc-300">
                <Mail className="h-4 w-4 text-zinc-500" />
                Email Address
              </label>
              <Input
                type="email"
                value={profile.email}
                onChange={(event) => handleProfileChange("email", event.target.value)}
                placeholder="you@example.com"
                className="border-zinc-700 bg-zinc-950/70 text-white placeholder:text-zinc-500"
              />
            </div>

            {profileMessage ? (
              <div
                className={cn(
                  "rounded-xl border px-4 py-3 text-sm",
                  saveState === "error"
                    ? "border-rose-500/20 bg-rose-500/10 text-rose-200"
                    : "border-emerald-500/20 bg-emerald-500/10 text-emerald-200",
                )}
              >
                {profileMessage}
              </div>
            ) : null}

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-zinc-500">
                {isLoadingUser
                  ? "Loading current account details..."
                  : user
                    ? `Current creator record: ${user.name}`
                    : "No registered creator was found yet. Use the register page first."}
              </p>
              <Button
                onClick={handleProfileSave}
                disabled={saveState === "saving" || !profileDirty || !user}
                className={cn(
                  "min-w-[148px]",
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
                    Save Profile
                  </span>
                )}
              </Button>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/80">
          <div className="border-b border-zinc-800 px-6 py-4">
            <h2 className="text-lg font-semibold text-white">Account Overview</h2>
            <p className="mt-1 text-sm text-zinc-500">
              Quick reference for the creator account connected to this dashboard.
            </p>
          </div>

          <div className="space-y-4 p-6">
            <SummaryRow label="Creator name" value={user?.name || "Not registered yet"} />
            <SummaryRow label="Email" value={user?.email || "Not registered yet"} />
            <SummaryRow
              label="Virtual account"
              value={user?.virtualAccount?.accountNumber || "No virtual account yet"}
            />
            <SummaryRow
              label="Bank"
              value={user?.virtualAccount?.bankName || "Monnify account not created yet"}
            />
            <SummaryRow
              label="Provider"
              value={user?.virtualAccount?.provider || "Monnify"}
              icon={CreditCard}
            />
            <SummaryRow label="Member since" value={formatMemberDate(user?.createdAt)} />
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/80">
          <div className="border-b border-zinc-800 px-6 py-4">
            <h2 className="text-lg font-semibold text-white">Notification Settings</h2>
            <p className="mt-1 text-sm text-zinc-500">
              These update instantly and are shared with the dedicated notifications page.
            </p>
          </div>

          <div className="space-y-3 p-6">
            {NOTIFICATION_SETTINGS.map(({ id, label, description, icon: Icon }) => (
              <SettingToggle
                key={id}
                icon={Icon}
                label={label}
                description={description}
                enabled={preferences[id]}
                onToggle={(checked) => {
                  void updatePreference(id, checked)
                }}
              />
            ))}

            <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-medium text-white">Sound Profile</p>
                  <p className="mt-1 text-sm text-zinc-500">
                    Current tone style for browser notification sounds.
                  </p>
                </div>
                <div className="rounded-full bg-purple-500/15 px-3 py-1 text-sm font-medium capitalize text-purple-200">
                  {preferences.soundProfile}
                </div>
              </div>
              <div className="mt-4 flex gap-3">
                <Button
                  type="button"
                  variant={preferences.soundProfile === "soft" ? "default" : "outline"}
                  className={cn(
                    "flex-1",
                    preferences.soundProfile === "soft"
                      ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:opacity-90"
                      : "border-zinc-700 bg-zinc-950 text-white hover:bg-zinc-900",
                  )}
                  onClick={() => {
                    void updatePreference("soundProfile", "soft")
                  }}
                >
                  Soft
                </Button>
                <Button
                  type="button"
                  variant={preferences.soundProfile === "bright" ? "default" : "outline"}
                  className={cn(
                    "flex-1",
                    preferences.soundProfile === "bright"
                      ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:opacity-90"
                      : "border-zinc-700 bg-zinc-950 text-white hover:bg-zinc-900",
                  )}
                  onClick={() => {
                    void updatePreference("soundProfile", "bright")
                  }}
                >
                  Bright
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/80">
          <div className="border-b border-zinc-800 px-6 py-4">
            <h2 className="text-lg font-semibold text-white">Overlay Settings</h2>
            <p className="mt-1 text-sm text-zinc-500">
              These are the live overlay controls used by the dashboard widget and overlay page.
            </p>
          </div>

          <div className="space-y-3 p-6">
            {OVERLAY_SETTINGS.map(({ id, label, description, icon: Icon }) => (
              <SettingToggle
                key={id}
                icon={Icon}
                label={label}
                description={description}
                enabled={overlaySettings[id]}
                onToggle={(checked) => {
                  void updateSetting(id, checked)
                }}
              />
            ))}

            <Link
              href="/dashboard/overlay"
              className="inline-flex h-11 w-full items-center justify-center rounded-xl border border-zinc-700 bg-zinc-950 px-4 text-sm font-medium text-white transition-colors hover:bg-zinc-900"
            >
              Open Overlay Controls
            </Link>
          </div>
        </div>
      </section>

      <OverlayShowcaseSettings
        customization={customization}
        giftPacks={giftPackThemes}
        onGiftPackChange={(giftPack) => updateCustomization("giftPack", giftPack)}
        onGoalTitleChange={(title) => updateCustomization("goalTitle", title)}
        onGoalAmountChange={(amount) =>
          updateCustomization("goalAmount", Number.isFinite(amount) ? Math.max(1000, amount) : 1000)
        }
      />
    </div>
  )
}

function SummaryRow({
  label,
  value,
  icon: Icon,
}: {
  label: string
  value: string
  icon?: ElementType
}) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4">
      <div className="flex items-center gap-3">
        {Icon ? (
          <div className="rounded-lg bg-zinc-800 p-2">
            <Icon className="h-4 w-4 text-zinc-300" />
          </div>
        ) : null}
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">{label}</p>
          <p className="mt-1 text-sm font-medium text-white">{value}</p>
        </div>
      </div>
    </div>
  )
}

function SettingToggle({
  icon: Icon,
  label,
  description,
  enabled,
  onToggle,
}: {
  icon: ElementType
  label: string
  description: string
  enabled: boolean
  onToggle: (checked: boolean) => void
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-4 rounded-2xl p-4 transition-all",
        enabled
          ? "border border-purple-500/30 bg-purple-500/10"
          : "border border-zinc-800 bg-zinc-950/60",
      )}
    >
      <div className="flex items-center gap-4">
        <div
          className={cn(
            "rounded-xl p-2.5",
            enabled ? "bg-purple-500/20" : "bg-zinc-800",
          )}
        >
          <Icon
            className={cn("h-5 w-5", enabled ? "text-purple-300" : "text-zinc-500")}
          />
        </div>
        <div>
          <p className={cn("font-medium", enabled ? "text-white" : "text-zinc-300")}>
            {label}
          </p>
          <p className="text-sm text-zinc-500">{description}</p>
        </div>
      </div>
      <Switch
        checked={enabled}
        onCheckedChange={onToggle}
        className="data-[state=checked]:bg-purple-500"
      />
    </div>
  )
}
