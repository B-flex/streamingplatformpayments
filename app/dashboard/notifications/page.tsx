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
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"
import { useAppPreferences } from "@/app/context/AppPreferencesContext"
import {
  emitNotificationFeedback,
  playNotificationSound,
  requestDesktopNotificationPermission,
} from "@/lib/notification-runtime"

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
        label: "Sound profile",
        value: preferences.notificationSounds ? preferences.soundProfile : "Muted",
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

  const handlePreviewSound = async (eventType: "donation" | "payout") => {
    await playNotificationSound(eventType, preferences.soundProfile)
    setStatusMessage(
      eventType === "donation"
        ? "Played the donation sound preview."
        : "Played the payout sound preview.",
    )
  }

  const soundProfiles = [
    {
      id: "soft" as const,
      label: "Soft",
      description: "Gentle chime for calm creator dashboards and softer overlays.",
    },
    {
      id: "bright" as const,
      label: "Bright",
      description: "Sharper tone that stays audible while you are multitasking live.",
    },
  ]

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
          <div
            key={label}
            className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-4"
          >
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

      {statusMessage && (
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-200">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-400" />
            <span>{statusMessage}</span>
          </div>
        </div>
      )}

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
                  <div
                    className={cn(
                      "rounded-xl p-2.5",
                      enabled ? "bg-purple-500/20" : "bg-zinc-800",
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-5 w-5",
                        enabled ? "text-purple-300" : "text-zinc-500",
                      )}
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
              Choose the tone profile and preview each event before you go live.
            </p>
          </div>

          <div className="grid gap-3 p-6">
            {soundProfiles.map((profile) => {
              const active = preferences.soundProfile === profile.id

              return (
                <button
                  key={profile.id}
                  type="button"
                  onClick={() => {
                    void updatePreference("soundProfile", profile.id)
                    setStatusMessage(`Switched notification sounds to the ${profile.label} profile.`)
                  }}
                  className={cn(
                    "rounded-2xl border p-5 text-left transition-all",
                    active
                      ? "border-purple-500/40 bg-purple-500/10 shadow-[0_0_30px_rgba(168,85,247,0.12)]"
                      : "border-zinc-800 bg-zinc-950/60 hover:border-zinc-700",
                  )}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className={cn("font-semibold", active ? "text-white" : "text-zinc-300")}>
                        {profile.label}
                      </p>
                      <p className="mt-1 text-sm text-zinc-500">{profile.description}</p>
                    </div>
                    {active ? <CheckCircle2 className="h-5 w-5 text-purple-400" /> : null}
                  </div>
                </button>
              )
            })}

            <div className="grid gap-3 pt-2 sm:grid-cols-2">
              <Button
                onClick={() => {
                  void handlePreviewSound("donation")
                }}
                variant="outline"
                className="justify-between border-zinc-700 bg-zinc-950 text-white hover:bg-zinc-900"
              >
                Preview Donation Sound
                <Sparkles className="h-4 w-4" />
              </Button>
              <Button
                onClick={() => {
                  void handlePreviewSound("payout")
                }}
                variant="outline"
                className="justify-between border-zinc-700 bg-zinc-950 text-white hover:bg-zinc-900"
              >
                Preview Payout Sound
                <Wallet className="h-4 w-4" />
              </Button>
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
