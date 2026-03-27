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
  defaultCustomGifts,
  sanitizeCustomGifts,
  type CustomGiftDefinition,
} from "@/lib/custom-gifts"
import { useAuth } from "@/app/context/AuthContext"

type CustomGiftsContextValue = {
  customGifts: CustomGiftDefinition[]
  saveCustomGifts: (value: CustomGiftDefinition[]) => void
  resetCustomGifts: () => void
}

const CustomGiftsContext = createContext<CustomGiftsContextValue | null>(null)

export function CustomGiftsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [customGifts, setCustomGifts] = useState<CustomGiftDefinition[]>(defaultCustomGifts)
  const storageKey = user ? `streamtip.custom.gifts.${user.id}` : "streamtip.custom.gifts.guest"

  useEffect(() => {
    if (typeof window === "undefined") return

    try {
      const raw = window.localStorage.getItem(storageKey)
      setCustomGifts(raw ? sanitizeCustomGifts(JSON.parse(raw)) : defaultCustomGifts)
    } catch {
      setCustomGifts(defaultCustomGifts)
    }
  }, [storageKey])

  useEffect(() => {
    const syncFromStorage = (event: StorageEvent) => {
      if (event.key && event.key !== storageKey) {
        return
      }

      try {
        const raw = window.localStorage.getItem(storageKey)
        setCustomGifts(raw ? sanitizeCustomGifts(JSON.parse(raw)) : defaultCustomGifts)
      } catch {
        setCustomGifts(defaultCustomGifts)
      }
    }

    window.addEventListener("storage", syncFromStorage)
    return () => window.removeEventListener("storage", syncFromStorage)
  }, [storageKey])

  const saveCustomGifts = useCallback((value: CustomGiftDefinition[]) => {
    const nextValue = sanitizeCustomGifts(value)
    setCustomGifts(nextValue)
    if (typeof window !== "undefined") {
      window.localStorage.setItem(storageKey, JSON.stringify(nextValue))
    }
  }, [storageKey])

  const resetCustomGifts = useCallback(() => {
    setCustomGifts(defaultCustomGifts)
    if (typeof window !== "undefined") {
      window.localStorage.setItem(storageKey, JSON.stringify(defaultCustomGifts))
    }
  }, [storageKey])

  const contextValue = useMemo(
    () => ({
      customGifts,
      saveCustomGifts,
      resetCustomGifts,
    }),
    [customGifts, resetCustomGifts, saveCustomGifts],
  )

  return (
    <CustomGiftsContext.Provider value={contextValue}>
      {children}
    </CustomGiftsContext.Provider>
  )
}

export function useCustomGifts() {
  const context = useContext(CustomGiftsContext)

  if (!context) {
    throw new Error("useCustomGifts must be used inside CustomGiftsProvider")
  }

  return context
}
