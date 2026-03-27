"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import {
  defaultOverlaySettingsMap,
  sanitizeOverlaySettings,
  type OverlaySettingId,
  type OverlaySettings,
} from "@/lib/overlay-settings"
import { useAuth } from "@/app/context/AuthContext"

type OverlaySettingsContextValue = {
  settings: OverlaySettings
  updateSetting: (id: OverlaySettingId, enabled: boolean) => Promise<boolean>
}

const OverlaySettingsContext = createContext<OverlaySettingsContextValue | null>(null)

export function OverlaySettingsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [settings, setSettings] = useState<OverlaySettings>(defaultOverlaySettingsMap)
  const storageKey = user ? `streamtip.overlay.settings.${user.id}` : "streamtip.overlay.settings.guest"

  useEffect(() => {
    if (typeof window === "undefined") return

    try {
      const raw = window.localStorage.getItem(storageKey)
      setSettings(raw ? sanitizeOverlaySettings(JSON.parse(raw)) : defaultOverlaySettingsMap)
    } catch {
      setSettings(defaultOverlaySettingsMap)
    }
  }, [storageKey])

  useEffect(() => {
    const syncFromStorage = (event: StorageEvent) => {
      if (event.key && event.key !== storageKey) {
        return
      }

      try {
        const raw = window.localStorage.getItem(storageKey)
        setSettings(raw ? sanitizeOverlaySettings(JSON.parse(raw)) : defaultOverlaySettingsMap)
      } catch {
        setSettings(defaultOverlaySettingsMap)
      }
    }

    window.addEventListener("storage", syncFromStorage)
    return () => window.removeEventListener("storage", syncFromStorage)
  }, [storageKey])

  const updateSetting = useCallback(
    async (id: OverlaySettingId, enabled: boolean) => {
      let nextEnabled = enabled

      if (
        id === "notifications" &&
        enabled &&
        typeof window !== "undefined" &&
        "Notification" in window
      ) {
        const permission =
          window.Notification.permission === "default"
            ? await window.Notification.requestPermission()
            : window.Notification.permission

        if (permission !== "granted") {
          nextEnabled = false
        }
      }

      const nextSettings = {
        ...settings,
        [id]: nextEnabled,
      }

      setSettings(nextSettings)
      if (typeof window !== "undefined") {
        window.localStorage.setItem(storageKey, JSON.stringify(nextSettings))
      }
      return nextEnabled
    },
    [settings, storageKey],
  )

  const value = useMemo(
    () => ({
      settings,
      updateSetting,
    }),
    [settings, updateSetting],
  )

  return (
    <OverlaySettingsContext.Provider value={value}>
      {children}
    </OverlaySettingsContext.Provider>
  )
}

export function useOverlaySettings() {
  const context = useContext(OverlaySettingsContext)

  if (!context) {
    throw new Error("useOverlaySettings must be used inside OverlaySettingsProvider")
  }

  return context
}
