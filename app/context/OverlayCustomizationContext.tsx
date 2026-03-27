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
  defaultOverlayCustomization,
  sanitizeOverlayCustomization,
  type GiftPackId,
  type OverlayCustomization,
} from "@/lib/overlay-customization"
import { useAuth } from "@/app/context/AuthContext"

type OverlayCustomizationContextValue = {
  customization: OverlayCustomization
  updateCustomization: <K extends keyof OverlayCustomization>(
    key: K,
    value: OverlayCustomization[K],
  ) => void
}

const OverlayCustomizationContext = createContext<OverlayCustomizationContextValue | null>(null)

export function OverlayCustomizationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [customization, setCustomization] = useState<OverlayCustomization>(
    defaultOverlayCustomization,
  )
  const storageKey = user
    ? `streamtip.overlay.customization.${user.id}`
    : "streamtip.overlay.customization.guest"

  useEffect(() => {
    if (typeof window === "undefined") return

    try {
      const raw = window.localStorage.getItem(storageKey)
      setCustomization(raw ? sanitizeOverlayCustomization(JSON.parse(raw)) : defaultOverlayCustomization)
    } catch {
      setCustomization(defaultOverlayCustomization)
    }
  }, [storageKey])

  useEffect(() => {
    const syncFromStorage = (event: StorageEvent) => {
      if (event.key && event.key !== storageKey) {
        return
      }

      try {
        const raw = window.localStorage.getItem(storageKey)
        setCustomization(raw ? sanitizeOverlayCustomization(JSON.parse(raw)) : defaultOverlayCustomization)
      } catch {
        setCustomization(defaultOverlayCustomization)
      }
    }

    window.addEventListener("storage", syncFromStorage)
    return () => window.removeEventListener("storage", syncFromStorage)
  }, [storageKey])

  const updateCustomization = useCallback(
    <K extends keyof OverlayCustomization>(key: K, value: OverlayCustomization[K]) => {
      const nextValue =
        key === "giftPack"
          ? ((value as GiftPackId) || defaultOverlayCustomization.giftPack)
          : value

      const nextCustomization = {
        ...customization,
        [key]: nextValue,
      }

      setCustomization(nextCustomization)
      if (typeof window !== "undefined") {
        window.localStorage.setItem(storageKey, JSON.stringify(nextCustomization))
      }
    },
    [customization, storageKey],
  )

  const value = useMemo(
    () => ({
      customization,
      updateCustomization,
    }),
    [customization, updateCustomization],
  )

  return (
    <OverlayCustomizationContext.Provider value={value}>
      {children}
    </OverlayCustomizationContext.Provider>
  )
}

export function useOverlayCustomization() {
  const context = useContext(OverlayCustomizationContext)

  if (!context) {
    throw new Error("useOverlayCustomization must be used inside OverlayCustomizationProvider")
  }

  return context
}
