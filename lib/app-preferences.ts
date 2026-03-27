export const notificationSoundOptions = [
  { id: "soft-chime", label: "Soft Chime", category: "Tone" },
  { id: "bright-pop", label: "Bright Pop", category: "Tone" },
  { id: "glass-bell", label: "Glass Bell", category: "Tone" },
  { id: "warm-pluck", label: "Warm Pluck", category: "Tone" },
  { id: "neon-ping", label: "Neon Ping", category: "Tone" },
  { id: "star-drop", label: "Star Drop", category: "Tone" },
  { id: "velvet-note", label: "Velvet Note", category: "Tone" },
  { id: "pulse-hit", label: "Pulse Hit", category: "Tone" },
  { id: "crystal-rise", label: "Crystal Rise", category: "Tone" },
  { id: "club-flash", label: "Club Flash", category: "Tone" },
  { id: "sunburst", label: "Sunburst", category: "Tone" },
  { id: "arcade-win", label: "Arcade Win", category: "Tone" },
  { id: "money-drop", label: "Money Drop", category: "Tone" },
  { id: "royal-fanfare", label: "Royal Fanfare", category: "Tone" },
  { id: "cosmic-rise", label: "Cosmic Rise", category: "Tone" },
  { id: "meteor-hit", label: "Meteor Hit", category: "Tone" },
  { id: "halo-bloom", label: "Halo Bloom", category: "Tone" },
  { id: "spark-rush", label: "Spark Rush", category: "Tone" },
  { id: "disco-tap", label: "Disco Tap", category: "Tone" },
  { id: "angel-wave", label: "Angel Wave", category: "Tone" },
  { id: "applause-room", label: "Applause Room", category: "Applause" },
  { id: "applause-stage", label: "Applause Stage", category: "Applause" },
  { id: "applause-crowd", label: "Applause Crowd", category: "Applause" },
  { id: "applause-victory", label: "Applause Victory", category: "Applause" },
  { id: "applause-ovation", label: "Applause Ovation", category: "Applause" },
] as const

export type NotificationSoundId = (typeof notificationSoundOptions)[number]["id"]

export interface AppPreferences {
  desktopNotifications: boolean
  donationNotifications: boolean
  payoutNotifications: boolean
  notificationSounds: boolean
  desktopSound: NotificationSoundId
  donationSound: NotificationSoundId
  payoutSound: NotificationSoundId
}

export const APP_PREFERENCES_STORAGE_KEY = "streamtip.app.preferences"

export const defaultAppPreferences: AppPreferences = {
  desktopNotifications: false,
  donationNotifications: true,
  payoutNotifications: true,
  notificationSounds: true,
  desktopSound: "glass-bell",
  donationSound: "bright-pop",
  payoutSound: "royal-fanfare",
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
    desktopSound:
      notificationSoundOptions.some((option) => option.id === candidate.desktopSound)
        ? (candidate.desktopSound as NotificationSoundId)
        : defaultAppPreferences.desktopSound,
    donationSound:
      notificationSoundOptions.some((option) => option.id === candidate.donationSound)
        ? (candidate.donationSound as NotificationSoundId)
        : defaultAppPreferences.donationSound,
    payoutSound:
      notificationSoundOptions.some((option) => option.id === candidate.payoutSound)
        ? (candidate.payoutSound as NotificationSoundId)
        : defaultAppPreferences.payoutSound,
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
