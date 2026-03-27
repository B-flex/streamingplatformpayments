export type OverlaySettingId = "animations" | "sounds" | "notifications" | "preview"

export type OverlaySettings = Record<OverlaySettingId, boolean>

export const OVERLAY_SETTINGS_STORAGE_KEY = "streamtip.overlay.settings"

export const defaultOverlaySettingsMap: OverlaySettings = {
  animations: true,
  sounds: true,
  notifications: false,
  preview: false,
}

export function sanitizeOverlaySettings(value: unknown): OverlaySettings {
  if (!value || typeof value !== "object") {
    return defaultOverlaySettingsMap
  }

  const candidate = value as Partial<Record<OverlaySettingId, unknown>>

  return {
    animations:
      typeof candidate.animations === "boolean"
        ? candidate.animations
        : defaultOverlaySettingsMap.animations,
    sounds:
      typeof candidate.sounds === "boolean"
        ? candidate.sounds
        : defaultOverlaySettingsMap.sounds,
    notifications:
      typeof candidate.notifications === "boolean"
        ? candidate.notifications
        : defaultOverlaySettingsMap.notifications,
    preview:
      typeof candidate.preview === "boolean"
        ? candidate.preview
        : defaultOverlaySettingsMap.preview,
  }
}

export function readStoredOverlaySettings(): OverlaySettings {
  if (typeof window === "undefined") {
    return defaultOverlaySettingsMap
  }

  try {
    const raw = window.localStorage.getItem(OVERLAY_SETTINGS_STORAGE_KEY)
    if (!raw) {
      return defaultOverlaySettingsMap
    }

    return sanitizeOverlaySettings(JSON.parse(raw))
  } catch {
    return defaultOverlaySettingsMap
  }
}

export function writeStoredOverlaySettings(settings: OverlaySettings) {
  if (typeof window === "undefined") {
    return
  }

  window.localStorage.setItem(
    OVERLAY_SETTINGS_STORAGE_KEY,
    JSON.stringify(settings),
  )
}
