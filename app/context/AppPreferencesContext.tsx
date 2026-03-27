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
  APP_PREFERENCES_STORAGE_KEY,
  defaultAppPreferences,
  readStoredAppPreferences,
  writeStoredAppPreferences,
  type AppPreferences,
  type NotificationSoundProfile,
} from "@/lib/app-preferences"
import { requestDesktopNotificationPermission, unlockNotificationAudio } from "@/lib/notification-runtime"

type AppPreferencesContextValue = {
  preferences: AppPreferences
  updatePreference: <K extends keyof AppPreferences>(
    key: K,
    value: AppPreferences[K],
  ) => Promise<AppPreferences>
}

const AppPreferencesContext = createContext<AppPreferencesContextValue | null>(null)

export function AppPreferencesProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState<AppPreferences>(defaultAppPreferences)

  useEffect(() => {
    setPreferences(readStoredAppPreferences())
  }, [])

  useEffect(() => {
    const syncFromStorage = (event: StorageEvent) => {
      if (event.key && event.key !== APP_PREFERENCES_STORAGE_KEY) {
        return
      }

      setPreferences(readStoredAppPreferences())
    }

    window.addEventListener("storage", syncFromStorage)
    return () => window.removeEventListener("storage", syncFromStorage)
  }, [])

  useEffect(() => {
    const unlock = () => {
      void unlockNotificationAudio()
    }

    window.addEventListener("pointerdown", unlock)
    window.addEventListener("keydown", unlock)

    return () => {
      window.removeEventListener("pointerdown", unlock)
      window.removeEventListener("keydown", unlock)
    }
  }, [])

  const updatePreference = useCallback(
    async <K extends keyof AppPreferences>(key: K, value: AppPreferences[K]) => {
      let nextValue = value

      if (key === "desktopNotifications" && value === true) {
        const permission = await requestDesktopNotificationPermission()
        nextValue = (permission === "granted") as AppPreferences[K]
      }

      if (key === "notificationSounds" && value === true) {
        await unlockNotificationAudio()
      }

      if (key === "soundProfile") {
        nextValue = (value as NotificationSoundProfile) as AppPreferences[K]
      }

      const nextPreferences = {
        ...preferences,
        [key]: nextValue,
      }

      setPreferences(nextPreferences)
      writeStoredAppPreferences(nextPreferences)
      return nextPreferences
    },
    [preferences],
  )

  const value = useMemo(
    () => ({
      preferences,
      updatePreference,
    }),
    [preferences, updatePreference],
  )

  return <AppPreferencesContext.Provider value={value}>{children}</AppPreferencesContext.Provider>
}

export function useAppPreferences() {
  const context = useContext(AppPreferencesContext)

  if (!context) {
    throw new Error("useAppPreferences must be used inside AppPreferencesProvider")
  }

  return context
}
