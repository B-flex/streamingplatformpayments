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
  authRequest,
  AUTH_SESSION_STORAGE_KEY,
  setStoredSessionToken,
  type AuthResponse,
} from "@/lib/auth-client"
import type { AppUser } from "@/lib/user"

type RegisterInput = {
  name: string
  email: string
  password: string
}

type LoginInput = {
  email: string
  password: string
}

type AuthContextValue = {
  user: AppUser | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (input: LoginInput) => Promise<AuthResponse>
  register: (input: RegisterInput) => Promise<AuthResponse>
  socialLogin: (provider: "google" | "apple", payload: { credential?: string; identityToken?: string }) => Promise<AuthResponse>
  logout: () => Promise<void>
  refreshUser: () => Promise<AppUser | null>
  setUser: (user: AppUser | null) => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const refreshUser = useCallback(async () => {
    try {
      const response = await authRequest("/auth/me")

      if (!response.ok) {
        setStoredSessionToken("")
        setUser(null)
        return null
      }

      const data = (await response.json()) as { user: AppUser }
      setUser(data.user)
      return data.user
    } catch {
      setUser(null)
      return null
    }
  }, [])

  useEffect(() => {
    void refreshUser().finally(() => setIsLoading(false))
  }, [refreshUser])

  useEffect(() => {
    const syncAuth = (event: StorageEvent) => {
      if (event.key !== AUTH_SESSION_STORAGE_KEY) {
        return
      }

      void refreshUser()
    }

    window.addEventListener("storage", syncAuth)
    return () => window.removeEventListener("storage", syncAuth)
  }, [refreshUser])

  const handleAuthSuccess = useCallback((payload: AuthResponse) => {
    setStoredSessionToken(payload.sessionToken)
    setUser(payload.user)
    return payload
  }, [])

  const register = useCallback(
    async (input: RegisterInput) => {
      const response = await fetch("http://localhost:5000/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(input),
      })

      const data = await response.json().catch(() => null)

      if (!response.ok) {
        throw new Error(data?.error || "Registration failed.")
      }

      return handleAuthSuccess(data as AuthResponse)
    },
    [handleAuthSuccess],
  )

  const login = useCallback(
    async (input: LoginInput) => {
      const response = await fetch("http://localhost:5000/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(input),
      })

      const data = await response.json().catch(() => null)

      if (!response.ok) {
        throw new Error(data?.error || "Login failed.")
      }

      return handleAuthSuccess(data as AuthResponse)
    },
    [handleAuthSuccess],
  )

  const socialLogin = useCallback(
    async (
      provider: "google" | "apple",
      payload: { credential?: string; identityToken?: string },
    ) => {
      const response = await fetch(`http://localhost:5000/auth/oauth/${provider}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      const data = await response.json().catch(() => null)

      if (!response.ok) {
        throw new Error(data?.error || `${provider} sign-in failed.`)
      }

      return handleAuthSuccess(data as AuthResponse)
    },
    [handleAuthSuccess],
  )

  const logout = useCallback(async () => {
    try {
      await authRequest("/auth/logout", { method: "POST" })
    } finally {
      setStoredSessionToken("")
      setUser(null)
    }
  }, [])

  const value = useMemo(
    () => ({
      user,
      isLoading,
      isAuthenticated: Boolean(user),
      login,
      register,
      socialLogin,
      logout,
      refreshUser,
      setUser,
    }),
    [isLoading, login, logout, refreshUser, register, socialLogin, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider")
  }

  return context
}
