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
  OVERLAY_CUSTOMIZATION_STORAGE_KEY,
  defaultOverlayCustomization,
  readStoredOverlayCustomization,
  writeStoredOverlayCustomization,
  type GiftPackId,
  type OverlayCustomization,
} from "@/lib/overlay-customization"

type OverlayCustomizationContextValue = {
  customization: OverlayCustomization
  updateCustomization: <K extends keyof OverlayCustomization>(
    key: K,
    value: OverlayCustomization[K],
  ) => void
}

const OverlayCustomizationContext = createContext<OverlayCustomizationContextValue | null>(null)

export function OverlayCustomizationProvider({ children }: { children: ReactNode }) {
  const [customization, setCustomization] = useState<OverlayCustomization>(
    defaultOverlayCustomization,
  )

  useEffect(() => {
    setCustomization(readStoredOverlayCustomization())
  }, [])

  useEffect(() => {
    const syncFromStorage = (event: StorageEvent) => {
      if (event.key && event.key !== OVERLAY_CUSTOMIZATION_STORAGE_KEY) {
        return
      }

      setCustomization(readStoredOverlayCustomization())
    }

    window.addEventListener("storage", syncFromStorage)
    return () => window.removeEventListener("storage", syncFromStorage)
  }, [])

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
      writeStoredOverlayCustomization(nextCustomization)
    },
    [customization],
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
