export type NotificationSoundProfile = "soft" | "bright"

export interface AppPreferences {
  desktopNotifications: boolean
  donationNotifications: boolean
  payoutNotifications: boolean
  notificationSounds: boolean
  soundProfile: NotificationSoundProfile
}

export const APP_PREFERENCES_STORAGE_KEY = "streamtip.app.preferences"

export const defaultAppPreferences: AppPreferences = {
  desktopNotifications: false,
  donationNotifications: true,
  payoutNotifications: true,
  notificationSounds: true,
  soundProfile: "soft",
}

export function sanitizeAppPreferences(value: unknown): AppPreferences {
  if (!value || typeof value !== "object") {
    return defaultAppPreferences
  }

  const candidate = value as Partial<Record<keyof AppPreferences, unknown>>

  return {
    desktopNotifications:
      typeof candidate.desktopNotifications === "boolean"
        ? candidate.desktopNotifications
        : defaultAppPreferences.desktopNotifications,
    donationNotifications:
      typeof candidate.donationNotifications === "boolean"
        ? candidate.donationNotifications
        : defaultAppPreferences.donationNotifications,
    payoutNotifications:
      typeof candidate.payoutNotifications === "boolean"
        ? candidate.payoutNotifications
        : defaultAppPreferences.payoutNotifications,
    notificationSounds:
      typeof candidate.notificationSounds === "boolean"
        ? candidate.notificationSounds
        : defaultAppPreferences.notificationSounds,
    soundProfile:
      candidate.soundProfile === "soft" || candidate.soundProfile === "bright"
        ? candidate.soundProfile
        : defaultAppPreferences.soundProfile,
  }
}

export function readStoredAppPreferences(): AppPreferences {
  if (typeof window === "undefined") {
    return defaultAppPreferences
  }

  try {
    const raw = window.localStorage.getItem(APP_PREFERENCES_STORAGE_KEY)
    if (!raw) {
      return defaultAppPreferences
    }

    return sanitizeAppPreferences(JSON.parse(raw))
  } catch {
    return defaultAppPreferences
  }
}

export function writeStoredAppPreferences(preferences: AppPreferences) {
  if (typeof window === "undefined") {
    return
  }

  window.localStorage.setItem(APP_PREFERENCES_STORAGE_KEY, JSON.stringify(preferences))
}
