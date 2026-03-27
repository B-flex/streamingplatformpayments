"use client"

import { useEffect, useState } from "react"
import { Chrome, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

declare global {
  interface Window {
    google?: any
    AppleID?: any
  }
}

function loadScript(src: string, id: string) {
  return new Promise<void>((resolve, reject) => {
    if (document.getElementById(id)) {
      resolve()
      return
    }

    const script = document.createElement("script")
    script.src = src
    script.id = id
    script.async = true
    script.defer = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error(`Failed to load script: ${src}`))
    document.head.appendChild(script)
  })
}

export function SocialAuthButtons({
  onGoogleCredential,
  onAppleToken,
  disabled = false,
}: {
  onGoogleCredential: (credential: string) => Promise<void>
  onAppleToken: (identityToken: string) => Promise<void>
  disabled?: boolean
}) {
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ""
  const appleClientId = process.env.NEXT_PUBLIC_APPLE_CLIENT_ID || ""
  const appleRedirectUri = process.env.NEXT_PUBLIC_APPLE_REDIRECT_URI || ""
  const [loadingProvider, setLoadingProvider] = useState<"" | "google" | "apple">("")
  const [providerError, setProviderError] = useState("")
  const [googleReady, setGoogleReady] = useState(false)
  const [appleReady, setAppleReady] = useState(false)
  const googleConfigured = Boolean(googleClientId)
  const appleConfigured = Boolean(appleClientId && appleRedirectUri)

  useEffect(() => {
    if (!googleConfigured) return

    loadScript("https://accounts.google.com/gsi/client", "google-identity-services")
      .then(() => {
        if (!window.google?.accounts?.id) return
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: async (response: { credential?: string }) => {
            if (!response?.credential) return
            setLoadingProvider("google")
            setProviderError("")
            try {
              await onGoogleCredential(response.credential)
            } catch (error) {
              setProviderError(error instanceof Error ? error.message : "Google sign-in failed.")
            } finally {
              setLoadingProvider("")
            }
          },
        })
        setGoogleReady(true)
      })
      .catch((error) => {
        setProviderError(error instanceof Error ? error.message : "Could not load Google sign-in.")
      })
  }, [googleClientId, googleConfigured, onGoogleCredential])

  useEffect(() => {
    if (!appleConfigured) return

    loadScript(
      "https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js",
      "apple-signin-sdk",
    )
      .then(() => {
        if (!window.AppleID?.auth) return
        window.AppleID.auth.init({
          clientId: appleClientId,
          scope: "name email",
          redirectURI: appleRedirectUri,
          usePopup: true,
        })
        setAppleReady(true)
      })
      .catch((error) => {
        setProviderError(error instanceof Error ? error.message : "Could not load Apple sign-in.")
      })
  }, [appleClientId, appleConfigured, appleRedirectUri])

  const handleGoogleClick = () => {
    if (!googleConfigured) {
      setProviderError("Google sign-in is not configured yet. Add NEXT_PUBLIC_GOOGLE_CLIENT_ID and GOOGLE_CLIENT_ID first.")
      return
    }

    if (!googleReady || !window.google?.accounts?.id) {
      setProviderError("Google sign-in is not configured yet.")
      return
    }

    setProviderError("")
    window.google.accounts.id.prompt()
  }

  const handleAppleClick = async () => {
    if (!appleConfigured) {
      setProviderError("Apple sign-in is not configured yet. Add NEXT_PUBLIC_APPLE_CLIENT_ID, NEXT_PUBLIC_APPLE_REDIRECT_URI, and APPLE_CLIENT_ID first.")
      return
    }

    if (!appleReady || !window.AppleID?.auth) {
      setProviderError("Apple sign-in is not configured yet.")
      return
    }

    setLoadingProvider("apple")
    setProviderError("")

    try {
      const response = await window.AppleID.auth.signIn()
      const identityToken = response?.authorization?.id_token

      if (!identityToken) {
        throw new Error("Apple did not return an identity token.")
      }

      await onAppleToken(identityToken)
    } catch (error) {
      setProviderError(error instanceof Error ? error.message : "Apple sign-in failed.")
    } finally {
      setLoadingProvider("")
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <Button
          type="button"
          variant="outline"
          disabled={disabled || loadingProvider !== "" || !googleConfigured}
          onClick={handleGoogleClick}
          className="h-12 border-zinc-700 bg-zinc-900 text-white hover:bg-zinc-800"
        >
          {loadingProvider === "google" ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Chrome className="mr-2 h-4 w-4" />
          )}
          Continue with Google
        </Button>

        <Button
          type="button"
          variant="outline"
          disabled={disabled || loadingProvider !== "" || !appleConfigured}
          onClick={() => {
            void handleAppleClick()
          }}
          className="h-12 border-zinc-700 bg-zinc-900 text-white hover:bg-zinc-800"
        >
          {loadingProvider === "apple" ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <span className="mr-2 text-base font-semibold"></span>
          )}
          Continue with Apple
        </Button>
      </div>

      {providerError ? (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200">
          {providerError}
        </div>
      ) : null}
    </div>
  )
}
