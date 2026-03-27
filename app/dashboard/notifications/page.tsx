"use client"

import { useEffect, useMemo, useState } from "react"
import {
  Bell,
  CheckCircle2,
  MonitorSmartphone,
  Sparkles,
  Volume2,
  Wallet,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"
import { useAppPreferences } from "@/app/context/AppPreferencesContext"
import {
  emitNotificationFeedback,
  playNotificationSound,
  requestDesktopNotificationPermission,
} from "@/lib/notification-runtime"
import { notificationSoundOptions, type NotificationSoundId } from "@/lib/app-preferences"

export default function NotificationsPage() {
  const { preferences, updatePreference } = useAppPreferences()
  const [statusMessage, setStatusMessage] = useState("")
  const [permissionState, setPermissionState] = useState<NotificationPermission | "unsupported">(
    "unsupported",
  )

  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      setPermissionState("unsupported")
      return
    }

    setPermissionState(window.Notification.permission)
  }, [])

  const summaryCards = useMemo(
    () => [
      {
        label: "Desktop alerts",
        value:
          permissionState === "unsupported"
            ? "Unsupported"
            : permissionState === "granted"
              ? "Enabled"
              : "Needs permission",
        icon: MonitorSmartphone,
      },
      {
        label: "Donation updates",
        value: preferences.donationNotifications ? "On" : "Off",
        icon: Sparkles,
      },
      {
        label: "Payout updates",
        value: preferences.payoutNotifications ? "On" : "Off",
        icon: Wallet,
      },
      {
        label: "Notification sounds",
        value: preferences.notificationSounds ? "Custom mix" : "Muted",
        icon: Volume2,
      },
    ],
    [permissionState, preferences],
  )

  const handleToggle = async (
    key:
      | "desktopNotifications"
      | "donationNotifications"
      | "payoutNotifications"
      | "notificationSounds",
    enabled: boolean,
  ) => {
    const nextPreferences = await updatePreference(key, enabled)

    if (key === "desktopNotifications") {
      if (typeof window !== "undefined" && "Notification" in window) {
        setPermissionState(window.Notification.permission)
      }

      setStatusMessage(
        nextPreferences.desktopNotifications
          ? "Desktop notifications are enabled for supported browsers."
          : enabled
            ? "Desktop notifications were blocked or not supported by this browser."
            : "Desktop notifications are turned off.",
      )
      return
    }

    setStatusMessage("")
  }

  const handleEnableDesktop = async () => {
    const permission = await requestDesktopNotificationPermission()
    setPermissionState(permission)
    await updatePreference("desktopNotifications", permission === "granted")
    setStatusMessage(
      permission === "granted"
        ? "Browser permission granted. Desktop notifications are ready."
        : "Browser permission was not granted, so desktop notifications stayed off.",
    )
  }

  const handleTestDonation = async () => {
    await emitNotificationFeedback("donation", preferences, {
      title: "Test donation notification",
      body: "CuteViewer sent NGN 15,000",
      tag: "test-donation",
    })
    setStatusMessage("Sent a donation test using your current notification settings.")
  }

  const handleTestPayout = async () => {
    await emitNotificationFeedback("payout", preferences, {
      title: "Test payout notification",
      body: "Your NGN 25,000 payout has been completed.",
      tag: "test-payout",
    })
    setStatusMessage("Sent a payout test using your current notification settings.")
  }

  const toneSounds = notificationSoundOptions.filter((option) => option.category === "Tone")
  const applauseSounds = notificationSoundOptions.filter((option) => option.category === "Applause")

  const notificationToggles = [
    {
      id: "desktopNotifications" as const,
      label: "Desktop Notifications",
      description: "Show browser alerts when donations or payouts happen.",
      icon: Bell,
    },
    {
      id: "donationNotifications" as const,
      label: "Donation Alerts",
      description: "Allow incoming donation events to trigger your notification flow.",
      icon: Sparkles,
    },
    {
      id: "payoutNotifications" as const,
      label: "Payout Alerts",
      description: "Notify you when a withdrawal succeeds or a payout update arrives.",
      icon: Wallet,
    },
    {
      id: "notificationSounds" as const,
      label: "Notification Sounds",
      description: "Play browser audio for donation and payout notifications.",
      icon: Volume2,
    },
  ]

  return (
    <div className="max-w-6xl space-y-6 p-6 lg:p-8">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-white">Notifications</h1>
        <p className="text-zinc-500">
          Control browser alerts, event-specific notifications, and the sounds tied to them.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {summaryCards.map(({ label, value, icon: Icon }) => (
          <div key={label} className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm text-zinc-500">{label}</p>
              <div className="rounded-lg bg-zinc-800 p-2">
                <Icon className="h-4 w-4 text-zinc-300" />
              </div>
            </div>
            <p className="mt-4 text-lg font-semibold capitalize text-white">{value}</p>
          </div>
        ))}
      </div>

      {statusMessage ? (
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-200">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-400" />
            <span>{statusMessage}</span>
          </div>
        </div>
      ) : null}

      <section className="rounded-2xl border border-zinc-800 bg-zinc-900/80 overflow-hidden">
        <div className="border-b border-zinc-800 px-6 py-4">
          <h2 className="text-lg font-semibold text-white">Alert Channels</h2>
          <p className="mt-1 text-sm text-zinc-500">
            These settings save instantly and are used by live donation and payout events.
          </p>
        </div>

        <div className="space-y-3 p-6">
          {notificationToggles.map(({ id, label, description, icon: Icon }) => {
            const enabled = preferences[id]

            return (
              <div
                key={id}
                className={cn(
                  "flex items-center justify-between gap-4 rounded-2xl p-4 transition-all",
                  enabled
                    ? "border border-purple-500/30 bg-purple-500/10"
                    : "border border-zinc-800 bg-zinc-950/60",
                )}
              >
                <div className="flex items-center gap-4">
                  <div className={cn("rounded-xl p-2.5", enabled ? "bg-purple-500/20" : "bg-zinc-800")}>
                    <Icon className={cn("h-5 w-5", enabled ? "text-purple-300" : "text-zinc-500")} />
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
                  onCheckedChange={(checked) => {
                    void handleToggle(id, checked)
                  }}
                  className="data-[state=checked]:bg-purple-500"
                />
              </div>
            )
          })}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 overflow-hidden">
          <div className="border-b border-zinc-800 px-6 py-4">
            <h2 className="text-lg font-semibold text-white">Sound Design</h2>
            <p className="mt-1 text-sm text-zinc-500">
              Choose from 20 tonal sounds and 5 louder applause reactions for each type of alert.
            </p>
          </div>

          <div className="grid gap-4 p-6">
            <SoundSelectCard
              title="Donation alert sound"
              description="Pick the sound that should fire when a donation arrives."
              value={preferences.donationSound}
              options={notificationSoundOptions}
              onChange={(value) => {
                void updatePreference("donationSound", value)
                setStatusMessage("Donation alert sound updated.")
              }}
              onPreview={() => {
                void playNotificationSound(preferences.donationSound)
                setStatusMessage("Played the donation sound preview.")
              }}
            />

            <SoundSelectCard
              title="Payout alert sound"
              description="Use a different sound for payout completion and payout updates."
              value={preferences.payoutSound}
              options={notificationSoundOptions}
              onChange={(value) => {
                void updatePreference("payoutSound", value)
                setStatusMessage("Payout alert sound updated.")
              }}
              onPreview={() => {
                void playNotificationSound(preferences.payoutSound)
                setStatusMessage("Played the payout sound preview.")
              }}
            />

            <SoundSelectCard
              title="Desktop notification sound"
              description="Set the sound you want tied to your browser-style notification feel."
              value={preferences.desktopSound}
              options={notificationSoundOptions}
              onChange={(value) => {
                void updatePreference("desktopSound", value)
                setStatusMessage("Desktop notification sound updated.")
              }}
              onPreview={() => {
                void playNotificationSound(preferences.desktopSound)
                setStatusMessage("Played the desktop notification sound preview.")
              }}
            />

            <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-5">
              <p className="font-semibold text-white">Library Overview</p>
              <p className="mt-1 text-sm text-zinc-500">
                Tonal sounds first, then the louder applause reactions.
              </p>
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                {toneSounds.map((sound) => (
                  <div key={sound.id} className="rounded-xl border border-zinc-800 bg-zinc-900/70 px-3 py-2 text-sm text-zinc-300">
                    {sound.label}
                  </div>
                ))}
              </div>
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                {applauseSounds.map((sound) => (
                  <div key={sound.id} className="rounded-xl border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-sm text-amber-200">
                    {sound.label}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 overflow-hidden">
          <div className="border-b border-zinc-800 px-6 py-4">
            <h2 className="text-lg font-semibold text-white">Live Tests</h2>
            <p className="mt-1 text-sm text-zinc-500">
              Confirm browser permissions and test the exact donation and payout feedback flow.
            </p>
          </div>

          <div className="space-y-4 p-6">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4">
              <p className="text-sm font-medium text-white">Browser Permission</p>
              <p className="mt-1 text-sm text-zinc-500">
                {permissionState === "unsupported"
                  ? "This browser does not support desktop notifications."
                  : permissionState === "granted"
                    ? "Permission granted. Browser alerts can appear when the setting is enabled."
                    : permissionState === "denied"
                      ? "Permission has been denied in this browser."
                      : "Permission has not been granted yet."}
              </p>
            </div>

            <Button
              onClick={handleEnableDesktop}
              variant="outline"
              className="w-full justify-between border-zinc-700 bg-zinc-950 text-white hover:bg-zinc-900"
            >
              Enable Desktop Notifications
              <Bell className="h-4 w-4" />
            </Button>
            <Button
              onClick={handleTestDonation}
              className="w-full justify-between bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:opacity-90"
            >
              Send Test Donation Alert
              <Sparkles className="h-4 w-4" />
            </Button>
            <Button
              onClick={handleTestPayout}
              variant="outline"
              className="w-full justify-between border-zinc-700 bg-zinc-950 text-white hover:bg-zinc-900"
            >
              Send Test Payout Alert
              <Wallet className="h-4 w-4" />
            </Button>
            <p className="text-xs leading-6 text-zinc-500">
              Some browsers require one click or key press in the app before they allow audio playback.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}

function SoundSelectCard({
  title,
  description,
  value,
  options,
  onChange,
  onPreview,
}: {
  title: string
  description: string
  value: NotificationSoundId
  options: typeof notificationSoundOptions
  onChange: (value: NotificationSoundId) => void
  onPreview: () => void
}) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="font-semibold text-white">{title}</p>
          <p className="mt-1 text-sm text-zinc-500">{description}</p>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={onPreview}
          className="border-zinc-700 bg-zinc-950 text-white hover:bg-zinc-900"
        >
          Preview
        </Button>
      </div>

      <div className="mt-4">
        <Select value={value} onValueChange={(nextValue) => onChange(nextValue as NotificationSoundId)}>
          <SelectTrigger className="border-zinc-700 bg-zinc-900 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="border-zinc-800 bg-zinc-900">
            {options.map((option) => (
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
      </div>
    </div>
  )
}
