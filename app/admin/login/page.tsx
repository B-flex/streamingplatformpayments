"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { Lock, Mail, Shield, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAdminAuth } from "@/app/context/AdminAuthContext"

export default function AdminLoginPage() {
  const router = useRouter()
  const { login } = useAdminAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError("Admin email and password are required.")
      return
    }

    setLoading(true)
    setError("")

    try {
      await login(email.trim(), password)
      router.push("/admin")
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Could not log into the admin panel.",
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,rgba(14,165,233,0.14),transparent_28%),linear-gradient(180deg,#09090f,#11111a)] px-6 py-10">
      <div className="w-full max-w-xl rounded-[32px] border border-zinc-800 bg-zinc-950/92 p-8 shadow-[0_30px_80px_rgba(0,0,0,0.45)]">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm text-cyan-100">
            <Shield className="h-4 w-4" />
            Private admin access
          </div>
          <h1 className="text-3xl font-black text-white">Admin Login</h1>
          <p className="text-zinc-500">
            This area is separate from creator accounts and is intended for platform oversight only.
          </p>
        </div>

        <div className="mt-8 space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300">Admin email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
              <Input
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="admin@streamtip.local"
                className="h-12 border-zinc-800 bg-zinc-900 pl-11 text-white placeholder:text-zinc-600"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300">Admin password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
              <Input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Admin password"
                className="h-12 border-zinc-800 bg-zinc-900 pl-11 text-white placeholder:text-zinc-600"
              />
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
            className="h-12 w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:opacity-90"
          >
            {loading ? "Signing in..." : "Enter Admin Panel"}
          </Button>
        </div>
      </div>
    </div>
  )
}
