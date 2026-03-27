"use client"

import Link from "next/link"
import { useEffect, useMemo, useState, type ElementType } from "react"
import {
  Bell,
  Check,
  CreditCard,
  Eye,
  EyeOff,
  ImagePlus,
  KeyRound,
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
  profileImage: string
}

type PasswordForm = {
  currentPassword: string
  newPassword: string
  confirmPassword: string
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
    description: "Play the configured browser sounds for donations and payouts.",
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
  const [profile, setProfile] = useState<ProfileForm>({ name: "", email: "", profileImage: "" })
  const [passwordForm, setPasswordForm] = useState<PasswordForm>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [showPasswords, setShowPasswords] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  })
  const [saveState, setSaveState] = useState<SaveState>("idle")
  const [passwordState, setPasswordState] = useState<SaveState>("idle")
  const [profileMessage, setProfileMessage] = useState("")
  const [passwordMessage, setPasswordMessage] = useState("")
  const [isLoadingUser, setIsLoadingUser] = useState(true)

  useEffect(() => {
    setProfile({
      name: user?.name || "",
      email: user?.email || "",
      profileImage: user?.profileImage || "",
    })
    setIsLoadingUser(false)
  }, [user])

  const profileDirty = useMemo(() => {
    return (
      profile.name !== (user?.name || "") ||
      profile.email !== (user?.email || "") ||
      profile.profileImage !== (user?.profileImage || "")
    )
  }, [profile, user])

  const passwordDirty = useMemo(
    () => Boolean(passwordForm.currentPassword || passwordForm.newPassword || passwordForm.confirmPassword),
    [passwordForm],
  )

  const handleProfileChange = (field: keyof ProfileForm, value: string) => {
    setProfile((current) => ({
      ...current,
      [field]: value,
    }))
    setSaveState("idle")
    setProfileMessage("")
  }

  const handleProfileImageChange = async (file: File | null) => {
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      handleProfileChange("profileImage", typeof reader.result === "string" ? reader.result : "")
    }
    reader.readAsDataURL(file)
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
          profileImage: profile.profileImage,
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
        profileImage: nextUser.profileImage || "",
      })
      setSaveState("saved")
      setProfileMessage("Profile settings saved successfully.")
      window.setTimeout(() => setSaveState("idle"), 2500)
    } catch (error) {
      setSaveState("error")
      setProfileMessage(error instanceof Error ? error.message : "Could not save your profile.")
    }
  }

  const handlePasswordSave = async () => {
    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      setPasswordState("error")
      setPasswordMessage("Current password and new password are required.")
      return
    }

    if (passwordForm.newPassword.length < 8) {
      setPasswordState("error")
      setPasswordMessage("New password must be at least 8 characters long.")
      return
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordState("error")
      setPasswordMessage("New password confirmation does not match.")
      return
    }

    setPasswordState("saving")
    setPasswordMessage("")

    try {
      const response = await authRequest("/user", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: profile.name.trim() || user?.name || "",
          email: profile.email.trim() || user?.email || "",
          profileImage: profile.profileImage,
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      })

      const payload = await response.json().catch(() => null)

      if (!response.ok) {
        throw new Error(payload?.error || "Could not update password.")
      }

      await refreshUser()
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" })
      setPasswordState("saved")
      setPasswordMessage("Password updated successfully.")
      window.setTimeout(() => setPasswordState("idle"), 2500)
    } catch (error) {
      setPasswordState("error")
      setPasswordMessage(error instanceof Error ? error.message : "Could not update password.")
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6 lg:p-8">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-white">Settings</h1>
          <p className="text-zinc-500">
            Manage your profile, account access, live notifications, and overlay behavior from one place.
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
            <div className="flex items-center gap-4">
              <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border border-zinc-700 bg-zinc-950/70">
                {profile.profileImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={profile.profileImage} alt="Profile" className="h-full w-full object-cover" />
                ) : (
                  <User className="h-8 w-8 text-zinc-500" />
                )}
              </div>
              <div className="space-y-2">
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-900">
                  <ImagePlus className="h-4 w-4" />
                  Upload Profile Photo
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(event) => {
                      void handleProfileImageChange(event.target.files?.[0] || null)
                    }}
                  />
                </label>
                {profile.profileImage ? (
                  <button
                    type="button"
                    onClick={() => handleProfileChange("profileImage", "")}
                    className="text-sm text-zinc-500 hover:text-white"
                  >
                    Remove current photo
                  </button>
                ) : null}
              </div>
            </div>

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

        <div className="space-y-6">
          <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/80">
            <div className="border-b border-zinc-800 px-6 py-4">
              <h2 className="text-lg font-semibold text-white">Reset Password</h2>
              <p className="mt-1 text-sm text-zinc-500">
                Change your password anytime with your current password for confirmation.
              </p>
            </div>

            <div className="space-y-4 p-6">
              <PasswordInput
                value={passwordForm.currentPassword}
                visible={showPasswords.currentPassword}
                placeholder="Current password"
                onChange={(value) =>
                  setPasswordForm((current) => ({ ...current, currentPassword: value }))
                }
                onToggleVisibility={() =>
                  setShowPasswords((current) => ({
                    ...current,
                    currentPassword: !current.currentPassword,
                  }))
                }
              />
              <PasswordInput
                value={passwordForm.newPassword}
                visible={showPasswords.newPassword}
                placeholder="New password"
                onChange={(value) =>
                  setPasswordForm((current) => ({ ...current, newPassword: value }))
                }
                onToggleVisibility={() =>
                  setShowPasswords((current) => ({
                    ...current,
                    newPassword: !current.newPassword,
                  }))
                }
              />
              <PasswordInput
                value={passwordForm.confirmPassword}
                visible={showPasswords.confirmPassword}
                placeholder="Confirm new password"
                onChange={(value) =>
                  setPasswordForm((current) => ({ ...current, confirmPassword: value }))
                }
                onToggleVisibility={() =>
                  setShowPasswords((current) => ({
                    ...current,
                    confirmPassword: !current.confirmPassword,
                  }))
                }
              />

              {passwordMessage ? (
                <div
                  className={cn(
                    "rounded-xl border px-4 py-3 text-sm",
                    passwordState === "error"
                      ? "border-rose-500/20 bg-rose-500/10 text-rose-200"
                      : "border-emerald-500/20 bg-emerald-500/10 text-emerald-200",
                  )}
                >
                  {passwordMessage}
                </div>
              ) : null}

              <Button
                onClick={handlePasswordSave}
                disabled={passwordState === "saving" || !passwordDirty}
                className={cn(
                  "w-full",
                  passwordState === "saved"
                    ? "bg-emerald-600 hover:bg-emerald-600"
                    : "bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:opacity-90",
                )}
              >
                {passwordState === "saving" ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Updating...
                  </span>
                ) : passwordState === "saved" ? (
                  <span className="flex items-center gap-2">
                    <Check className="h-4 w-4" />
                    Updated
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <KeyRound className="h-4 w-4" />
                    Update Password
                  </span>
                )}
              </Button>
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
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/80">
          <div className="border-b border-zinc-800 px-6 py-4">
            <h2 className="text-lg font-semibold text-white">Overlay Settings</h2>
            <p className="mt-1 text-sm text-zinc-500">
              These are the live overlay controls used by the overlay page.
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
        onCheckedChange={onToggle}
        className="data-[state=checked]:bg-purple-500"
      />
    </div>
  )
}

function PasswordInput({
  value,
  visible,
  placeholder,
  onChange,
  onToggleVisibility,
}: {
  value: string
  visible: boolean
  placeholder: string
  onChange: (value: string) => void
  onToggleVisibility: () => void
}) {
  return (
    <div className="relative">
      <Input
        type={visible ? "text" : "password"}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="border-zinc-700 bg-zinc-950/70 pr-12 text-white placeholder:text-zinc-500"
      />
      <button
        type="button"
        onClick={onToggleVisibility}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 transition-colors hover:text-white"
        aria-label={visible ? `Hide ${placeholder.toLowerCase()}` : `Show ${placeholder.toLowerCase()}`}
      >
        {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  )
}
