"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { ArrowRight, Eye, EyeOff, Lock, Mail, ShieldCheck, Sparkles, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SocialAuthButtons } from "@/components/auth/social-auth-buttons"
import { useAuth } from "@/app/context/AuthContext"

export default function LoginPage() {
  const router = useRouter()
  const { login, socialLogin, isAuthenticated, isLoading } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace("/dashboard")
    }
  }, [isAuthenticated, isLoading, router])

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError("Email and password are required.")
      return
    }

    setLoading(true)
    setError("")

    try {
      await login({
        email: email.trim(),
        password,
      })

      router.push("/dashboard")
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Could not log in. Please try again.",
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.15),transparent_28%),linear-gradient(180deg,#09090f,#11111a)] px-6 py-12">
      <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[0.92fr_1.08fr]">
        <div className="rounded-[32px] border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm text-cyan-100">
            <ShieldCheck className="h-4 w-4" />
            Secure creator login
          </div>
          <h1 className="mt-6 text-4xl font-black leading-tight text-white">
            Welcome back to your creator dashboard.
          </h1>
          <p className="mt-4 leading-7 text-zinc-400">
            Log in to manage your virtual account, live gift overlay, donations, notifications, payout history, and stream goal settings from one workspace.
          </p>

          <div className="mt-8 rounded-2xl border border-white/10 bg-black/20 p-5">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 p-3">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-white">What you are logging into</p>
                <p className="text-sm text-zinc-400">
                  A creator account stored in the database with live dashboard access and reserved account details.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-[32px] border border-zinc-800 bg-zinc-950/90 p-8 shadow-[0_30px_80px_rgba(0,0,0,0.45)]">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-white">Log in</h2>
            <p className="text-zinc-500">
              Use the email and password you chose during creator registration.
            </p>
          </div>

          <div className="mt-8 space-y-5">
            <SocialAuthButtons
              disabled={loading}
              onGoogleCredential={async (credential) => {
                await socialLogin("google", { credential })
                router.push("/dashboard")
              }}
              onAppleToken={async (identityToken) => {
                await socialLogin("apple", { identityToken })
                router.push("/dashboard")
              }}
            />

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-zinc-800" />
              </div>
              <div className="relative flex justify-center text-xs uppercase tracking-[0.24em]">
                <span className="bg-zinc-950 px-3 text-zinc-500">or use email</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">Email address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                <Input
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="creator@example.com"
                  className="h-12 border-zinc-800 bg-zinc-900 pl-11 text-white placeholder:text-zinc-600"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Your password"
                  className="h-12 border-zinc-800 bg-zinc-900 pl-11 pr-11 text-white placeholder:text-zinc-600"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error ? (
              <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200">
                <div className="flex items-start gap-3">
                  <XCircle className="mt-0.5 h-4 w-4 text-red-400" />
                  <span>{error}</span>
                </div>
              </div>
            ) : null}

            <Button
              onClick={handleLogin}
              disabled={loading}
              className="h-12 w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:opacity-90"
            >
              {loading ? "Logging in..." : "Log in"}
            </Button>

            <div className="flex items-center justify-between rounded-2xl border border-zinc-800 bg-zinc-900/70 px-4 py-3 text-sm">
              <span className="text-zinc-400">Need a creator account?</span>
              <Link href="/register" className="inline-flex items-center gap-2 font-medium text-white">
                Register
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-8 max-w-5xl rounded-[24px] border border-white/10 bg-white/5 px-6 py-4 text-sm text-white/55 backdrop-blur-xl">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p>
            StreamTip is an independent creator tool and is not affiliated with TikTok or ByteDance.
          </p>
          <div className="flex items-center gap-4">
            <Link href="/terms" className="transition-colors hover:text-white">
              Terms
            </Link>
            <Link href="/privacy" className="transition-colors hover:text-white">
              Privacy
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
