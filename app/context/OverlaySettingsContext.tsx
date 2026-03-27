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
  OVERLAY_SETTINGS_STORAGE_KEY,
  readStoredOverlaySettings,
  writeStoredOverlaySettings,
  type OverlaySettingId,
  type OverlaySettings,
} from "@/lib/overlay-settings"

type OverlaySettingsContextValue = {
  settings: OverlaySettings
  updateSetting: (id: OverlaySettingId, enabled: boolean) => Promise<boolean>
}

const OverlaySettingsContext = createContext<OverlaySettingsContextValue | null>(null)

export function OverlaySettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<OverlaySettings>(defaultOverlaySettingsMap)

  useEffect(() => {
    setSettings(readStoredOverlaySettings())
  }, [])

  useEffect(() => {
    const syncFromStorage = (event: StorageEvent) => {
      if (event.key && event.key !== OVERLAY_SETTINGS_STORAGE_KEY) {
        return
      }

      setSettings(readStoredOverlaySettings())
    }

    window.addEventListener("storage", syncFromStorage)
    return () => window.removeEventListener("storage", syncFromStorage)
  }, [])

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
      writeStoredOverlaySettings(nextSettings)
      return nextEnabled
    },
    [settings],
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
