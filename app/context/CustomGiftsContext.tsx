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
  CUSTOM_GIFTS_STORAGE_KEY,
  defaultCustomGifts,
  readStoredCustomGifts,
  sanitizeCustomGifts,
  writeStoredCustomGifts,
  type CustomGiftDefinition,
} from "@/lib/custom-gifts"

type CustomGiftsContextValue = {
  customGifts: CustomGiftDefinition[]
  saveCustomGifts: (value: CustomGiftDefinition[]) => void
  resetCustomGifts: () => void
}

const CustomGiftsContext = createContext<CustomGiftsContextValue | null>(null)

export function CustomGiftsProvider({ children }: { children: ReactNode }) {
  const [customGifts, setCustomGifts] = useState<CustomGiftDefinition[]>(defaultCustomGifts)

  useEffect(() => {
    setCustomGifts(readStoredCustomGifts())
  }, [])

  useEffect(() => {
    const syncFromStorage = (event: StorageEvent) => {
      if (event.key && event.key !== CUSTOM_GIFTS_STORAGE_KEY) {
        return
      }

      setCustomGifts(readStoredCustomGifts())
    }

    window.addEventListener("storage", syncFromStorage)
    return () => window.removeEventListener("storage", syncFromStorage)
  }, [])

  const saveCustomGifts = useCallback((value: CustomGiftDefinition[]) => {
    const nextValue = sanitizeCustomGifts(value)
    setCustomGifts(nextValue)
    writeStoredCustomGifts(nextValue)
  }, [])

  const resetCustomGifts = useCallback(() => {
    setCustomGifts(defaultCustomGifts)
    writeStoredCustomGifts(defaultCustomGifts)
  }, [])

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
