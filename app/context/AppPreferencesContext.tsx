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
  defaultAppPreferences,
  sanitizeAppPreferences,
  type AppPreferences,
  type NotificationSoundId,
} from "@/lib/app-preferences"
import { useAuth } from "@/app/context/AuthContext"
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
  const { user } = useAuth()
  const [preferences, setPreferences] = useState<AppPreferences>(defaultAppPreferences)
  const storageKey = user ? `streamtip.app.preferences.${user.id}` : "streamtip.app.preferences.guest"

  useEffect(() => {
    if (typeof window === "undefined") return

    try {
      const raw = window.localStorage.getItem(storageKey)
      setPreferences(raw ? sanitizeAppPreferences(JSON.parse(raw)) : defaultAppPreferences)
    } catch {
      setPreferences(defaultAppPreferences)
    }
  }, [storageKey])

  useEffect(() => {
    const syncFromStorage = (event: StorageEvent) => {
      if (event.key && event.key !== storageKey) {
        return
      }

      try {
        const raw = window.localStorage.getItem(storageKey)
        setPreferences(raw ? sanitizeAppPreferences(JSON.parse(raw)) : defaultAppPreferences)
      } catch {
        setPreferences(defaultAppPreferences)
      }
    }

    window.addEventListener("storage", syncFromStorage)
    return () => window.removeEventListener("storage", syncFromStorage)
  }, [storageKey])

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

      if (key === "desktopSound" || key === "donationSound" || key === "payoutSound") {
        nextValue = (value as NotificationSoundId) as AppPreferences[K]
      }

      const nextPreferences = {
        ...preferences,
        [key]: nextValue,
      }

      setPreferences(nextPreferences)
      if (typeof window !== "undefined") {
        window.localStorage.setItem(storageKey, JSON.stringify(nextPreferences))
      }
      return nextPreferences
    },
    [preferences, storageKey],
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
