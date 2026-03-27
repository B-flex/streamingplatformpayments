"use client"

import { useEffect, useState, type ReactNode } from "react"
import { ArrowDownToLine, Landmark, Wallet } from "lucide-react"
import { adminRequest } from "@/lib/admin-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type PlatformWithdrawal = {
  _id?: string
  amount: number
  status: string
  bankName: string
  accountNumber: string
  accountName: string
  note?: string
  createdAt?: string
}

type PlatformWithdrawalsResponse = {
  withdrawals: PlatformWithdrawal[]
  balance: {
    platformRevenue: number
    totalPlatformWithdrawn: number
    pendingPlatformRevenue: number
  }
}

function formatCurrency(amount: number) {
  return `NGN ${Number(amount || 0).toLocaleString()}`
}

function formatDate(value?: string) {
  if (!value) return "Just now"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "Just now"
  return new Intl.DateTimeFormat("en-NG", { dateStyle: "medium", timeStyle: "short" }).format(date)
}

export default function PlatformWithdrawalsPage() {
  const [data, setData] = useState<PlatformWithdrawalsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [message, setMessage] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    amount: "",
    bankName: "",
    accountNumber: "",
    accountName: "",
    note: "",
  })

  const loadWithdrawals = async () => {
    setLoading(true)
    setError("")

    try {
      const response = await adminRequest("/admin/platform-withdrawals")
      const payload = await response.json().catch(() => null)

      if (!response.ok) {
        throw new Error(payload?.error || "Could not load platform withdrawals.")
      }

      setData({
        withdrawals: Array.isArray(payload?.withdrawals) ? payload.withdrawals : [],
        balance: {
          platformRevenue: payload?.balance?.platformRevenue || 0,
          totalPlatformWithdrawn: payload?.balance?.totalPlatformWithdrawn || 0,
          pendingPlatformRevenue: payload?.balance?.pendingPlatformRevenue || 0,
        },
      })
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Could not load platform withdrawals.",
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadWithdrawals()
  }, [])

  const submitWithdrawal = async () => {
    setSubmitting(true)
    setMessage("")
    setError("")

    try {
      const response = await adminRequest("/admin/platform-withdrawals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: Number(form.amount),
          bankName: form.bankName,
          accountNumber: form.accountNumber,
          accountName: form.accountName,
          note: form.note,
        }),
      })
      const payload = await response.json().catch(() => null)

      if (!response.ok) {
        throw new Error(payload?.error || "Could not withdraw platform revenue.")
      }

      setForm({
        amount: "",
        bankName: "",
        accountNumber: "",
        accountName: "",
        note: "",
      })
      setMessage("Platform withdrawal recorded successfully.")
      await loadWithdrawals()
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Could not withdraw platform revenue.",
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6 p-6 lg:p-8">
      <div className="space-y-1">
        <h1 className="text-3xl font-black text-white">Platform Withdrawals</h1>
        <p className="text-zinc-400">
          Withdraw from the platform 20% balance and keep a dedicated admin ledger for it.
        </p>
      </div>

      {message ? (
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
          {message}
        </div>
      ) : null}
      {error ? (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      ) : null}

      <section className="grid gap-6 xl:grid-cols-[0.72fr_1.28fr]">
        <div className="rounded-[28px] border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <ArrowDownToLine className="h-5 w-5 text-cyan-200" />
            <h2 className="text-xl font-bold text-white">Withdraw Platform Earnings</h2>
          </div>

          <div className="mt-5 space-y-4">
            <FormField label="Amount (NGN)">
              <Input
                type="number"
                min={1}
                value={form.amount}
                onChange={(event) => setForm((current) => ({ ...current, amount: event.target.value }))}
                className="border-zinc-700 bg-zinc-950/70 text-white"
              />
            </FormField>
            <FormField label="Bank name">
              <Input
                value={form.bankName}
                onChange={(event) =>
                  setForm((current) => ({ ...current, bankName: event.target.value }))
                }
                className="border-zinc-700 bg-zinc-950/70 text-white"
              />
            </FormField>
            <FormField label="Account number">
              <Input
                value={form.accountNumber}
                onChange={(event) =>
                  setForm((current) => ({ ...current, accountNumber: event.target.value }))
                }
                className="border-zinc-700 bg-zinc-950/70 text-white"
              />
            </FormField>
            <FormField label="Account name">
              <Input
                value={form.accountName}
                onChange={(event) =>
                  setForm((current) => ({ ...current, accountName: event.target.value }))
                }
                className="border-zinc-700 bg-zinc-950/70 text-white"
              />
            </FormField>
            <FormField label="Note">
              <Input
                value={form.note}
                onChange={(event) => setForm((current) => ({ ...current, note: event.target.value }))}
                placeholder="Optional internal note"
                className="border-zinc-700 bg-zinc-950/70 text-white placeholder:text-zinc-600"
              />
            </FormField>

            <Button
              onClick={submitWithdrawal}
              disabled={submitting || loading}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:opacity-90"
            >
              Record Platform Withdrawal
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <MetricCard
              icon={Wallet}
              label="Platform revenue"
              value={formatCurrency(data?.balance.platformRevenue || 0)}
            />
            <MetricCard
              icon={ArrowDownToLine}
              label="Already withdrawn"
              value={formatCurrency(data?.balance.totalPlatformWithdrawn || 0)}
            />
            <MetricCard
              icon={Landmark}
              label="Available now"
              value={formatCurrency(data?.balance.pendingPlatformRevenue || 0)}
            />
          </div>

          <div className="rounded-[28px] border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
            <h2 className="text-xl font-bold text-white">Withdrawal Ledger</h2>
            <div className="mt-5 space-y-3">
              {loading ? (
                <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-5 text-sm text-zinc-400">
                  Loading withdrawals...
                </div>
              ) : data?.withdrawals.length ? (
                data.withdrawals.map((withdrawal, index) => (
                  <div
                    key={withdrawal._id || `${withdrawal.bankName}-${index}`}
                    className="rounded-2xl border border-white/10 bg-black/20 px-4 py-4"
                  >
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                      <div>
                        <p className="font-semibold text-white">{withdrawal.bankName}</p>
                        <p className="text-sm text-zinc-500">
                          {withdrawal.accountName} • **** {String(withdrawal.accountNumber).slice(-4)}
                        </p>
                      </div>
                      <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-200">
                        {withdrawal.status}
                      </span>
                    </div>
                    <div className="mt-3 flex flex-col gap-2 text-sm text-zinc-300 lg:flex-row lg:items-center lg:justify-between">
                      <p>{formatCurrency(withdrawal.amount)}</p>
                      <p>{formatDate(withdrawal.createdAt)}</p>
                    </div>
                    {withdrawal.note ? (
                      <p className="mt-3 text-sm text-zinc-500">{withdrawal.note}</p>
                    ) : null}
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-5 text-sm text-zinc-400">
                  No platform withdrawals recorded yet.
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

function FormField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium text-zinc-300">{label}</Label>
      {children}
    </div>
  )
}

function MetricCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Wallet
  label: string
  value: string
}) {
  return (
    <div className="rounded-[28px] border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm text-white/65">{label}</p>
          <p className="mt-2 break-words text-xl font-black leading-tight text-white">{value}</p>
        </div>
        <div className="rounded-2xl bg-black/15 p-3">
          <Icon className="h-5 w-5 text-white" />
        </div>
      </div>
    </div>
  )
}
