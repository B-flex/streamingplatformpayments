"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { ArrowRight, CheckCircle2, Lock, Mail, Sparkles, User, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/app/context/AuthContext"

export default function RegisterPage() {
  const router = useRouter()
  const { register, isAuthenticated, isLoading } = useAuth()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace("/dashboard")
    }
  }, [isAuthenticated, isLoading, router])

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError("Name, email, and password are required.")
      return
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.")
      return
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.")
      return
    }

    setLoading(true)
    setError("")

    try {
      await register({
        name: name.trim(),
        email: email.trim(),
        password,
      })

      setSuccess("Account created successfully. Redirecting to your dashboard...")
      window.setTimeout(() => {
        router.push("/dashboard")
      }, 900)
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Registration failed. Please try again.",
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(168,85,247,0.18),transparent_32%),linear-gradient(180deg,#09090f,#11111a)] px-6 py-12">
      <div className="mx-auto max-w-5xl grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-[32px] border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
          <p className="text-sm uppercase tracking-[0.28em] text-purple-300/80">Join StreamTip</p>
          <h1 className="mt-5 text-4xl font-black leading-tight text-white">
            Register your creator account and unlock your live donation setup.
          </h1>
          <p className="mt-4 leading-7 text-zinc-400">
            Signing up creates your creator profile, provisions your Monnify reserved account, and prepares your dashboard for overlay controls, notifications, donation tracking, and payouts.
          </p>

          <div className="mt-8 space-y-4">
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="font-medium text-white">What happens at registration</p>
              <p className="mt-2 text-sm text-zinc-400">
                We create your account, securely save your profile in the database, and request your reserved account for live donation collection.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="font-medium text-white">Commercial note</p>
              <p className="mt-2 text-sm text-zinc-400">
                StreamTip retains 20% of creator earnings as the platform fee. This is also stated in our terms and conditions.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-[32px] border border-zinc-800 bg-zinc-950/90 p-8 shadow-[0_30px_80px_rgba(0,0,0,0.45)]">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-white">Create account</h2>
            <p className="text-zinc-500">
              Use a real email and a secure password so you can log back into your dashboard later.
            </p>
          </div>

          <div className="mt-8 space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">Full name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                <Input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Oluwa Creator"
                  className="h-12 border-zinc-800 bg-zinc-900 pl-11 text-white placeholder:text-zinc-600"
                />
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

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-300">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                  <Input
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Minimum 8 characters"
                    className="h-12 border-zinc-800 bg-zinc-900 pl-11 text-white placeholder:text-zinc-600"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-300">Confirm password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                  <Input
                    type="password"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    placeholder="Repeat password"
                    className="h-12 border-zinc-800 bg-zinc-900 pl-11 text-white placeholder:text-zinc-600"
                  />
                </div>
              </div>
            </div>

            <p className="text-sm leading-6 text-zinc-500">
              By creating an account, you agree to the 20% platform fee and the full{" "}
              <Link href="/terms" className="text-purple-300 hover:text-purple-200">
                terms and conditions
              </Link>
              .
            </p>

            {error ? (
              <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200">
                <div className="flex items-start gap-3">
                  <XCircle className="mt-0.5 h-4 w-4 text-red-400" />
                  <span>{error}</span>
                </div>
              </div>
            ) : null}

            {success ? (
              <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-200">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-400" />
                  <span>{success}</span>
                </div>
              </div>
            ) : null}

            <Button
              onClick={handleRegister}
              disabled={loading}
              className="h-12 w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:opacity-90"
            >
              {loading ? "Creating account..." : "Create account"}
            </Button>

            <div className="flex items-center justify-between rounded-2xl border border-zinc-800 bg-zinc-900/70 px-4 py-3 text-sm">
              <span className="text-zinc-400">Already have an account?</span>
              <Link href="/login" className="inline-flex items-center gap-2 font-medium text-white">
                Log in
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
