"use client"

import { useEffect, useMemo, useState, type ReactNode } from "react"
import { ArrowDownToLine, Landmark, LoaderCircle, Wallet } from "lucide-react"
import { adminRequest } from "@/lib/admin-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type PlatformWithdrawal = {
  _id?: string
  amount: number
  status: string
  bankName: string
  bankCode?: string
  accountNumber: string
  accountName: string
  note?: string
  transferReference?: string
  providerReference?: string
  providerMessage?: string
  createdAt?: string
}

type GroupedHistory = {
  year: string
  months: Array<{
    month: string
    items: PlatformWithdrawal[]
  }>
}

type BankOption = {
  name: string
  code: string
}

type PlatformWithdrawalsResponse = {
  withdrawals: PlatformWithdrawal[]
  history?: GroupedHistory[]
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

function buildHistory(withdrawals: PlatformWithdrawal[]) {
  const grouped = new Map<string, Map<string, PlatformWithdrawal[]>>()

  withdrawals.forEach((withdrawal) => {
    const date = withdrawal.createdAt ? new Date(withdrawal.createdAt) : new Date()
    const year = String(date.getFullYear())
    const month = new Intl.DateTimeFormat("en-NG", { month: "long", year: "numeric" }).format(date)

    if (!grouped.has(year)) {
      grouped.set(year, new Map())
    }

    const monthMap = grouped.get(year)!
    if (!monthMap.has(month)) {
      monthMap.set(month, [])
    }

    monthMap.get(month)!.push(withdrawal)
  })

  return Array.from(grouped.entries())
    .sort((a, b) => Number(b[0]) - Number(a[0]))
    .map(([year, months]) => ({
      year,
      months: Array.from(months.entries()).map(([month, items]) => ({ month, items })),
    }))
}

export default function PlatformWithdrawalsPage() {
  const [data, setData] = useState<PlatformWithdrawalsResponse | null>(null)
  const [banks, setBanks] = useState<BankOption[]>([])
  const [loading, setLoading] = useState(true)
  const [banksLoading, setBanksLoading] = useState(true)
  const [error, setError] = useState("")
  const [message, setMessage] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [resolvingName, setResolvingName] = useState(false)
  const [form, setForm] = useState({
    amount: "",
    bankName: "",
    bankCode: "",
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

      const withdrawals = Array.isArray(payload?.withdrawals) ? payload.withdrawals : []

      setData({
        withdrawals,
        history: Array.isArray(payload?.history) ? payload.history : buildHistory(withdrawals),
        balance: {
          platformRevenue: payload?.balance?.platformRevenue || 0,
          totalPlatformWithdrawn: payload?.balance?.totalPlatformWithdrawn || 0,
          pendingPlatformRevenue: payload?.balance?.pendingPlatformRevenue || 0,
        },
      })
    } catch (requestError) {
      setError(
        requestError instanceof Error ? requestError.message : "Could not load platform withdrawals.",
      )
    } finally {
      setLoading(false)
    }
  }

  const loadBanks = async () => {
    setBanksLoading(true)

    try {
      const response = await adminRequest("/admin/banks")
      const payload = await response.json().catch(() => null)

      if (!response.ok) {
        throw new Error(payload?.error || "Could not load supported banks.")
      }

      setBanks(Array.isArray(payload?.banks) ? payload.banks : [])
    } catch (requestError) {
      setError(
        requestError instanceof Error ? requestError.message : "Could not load supported banks.",
      )
    } finally {
      setBanksLoading(false)
    }
  }

  useEffect(() => {
    void loadWithdrawals()
    void loadBanks()
  }, [])

  useEffect(() => {
    const shouldResolve = form.bankCode && form.accountNumber.length === 10

    if (!shouldResolve) {
      return
    }

    const controller = new AbortController()
    const timer = window.setTimeout(async () => {
      setResolvingName(true)
      setError("")

      try {
        const response = await adminRequest("/admin/bank-account-name-enquiry", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            bankCode: form.bankCode,
            accountNumber: form.accountNumber,
          }),
          signal: controller.signal,
        })
        const payload = await response.json().catch(() => null)

        if (!response.ok) {
          throw new Error(payload?.error || "Could not resolve account name.")
        }

        setForm((current) => ({
          ...current,
          accountName: String(payload?.accountName || current.accountName || ""),
        }))
      } catch (requestError) {
        if (!controller.signal.aborted) {
          setError(
            requestError instanceof Error ? requestError.message : "Could not resolve account name.",
          )
        }
      } finally {
        if (!controller.signal.aborted) {
          setResolvingName(false)
        }
      }
    }, 450)

    return () => {
      controller.abort()
      window.clearTimeout(timer)
    }
  }, [form.bankCode, form.accountNumber])

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
          bankCode: form.bankCode,
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
        bankCode: "",
        accountNumber: "",
        accountName: "",
        note: "",
      })
      setMessage("Platform withdrawal recorded and deducted successfully.")
      await loadWithdrawals()
    } catch (requestError) {
      setError(
        requestError instanceof Error ? requestError.message : "Could not withdraw platform revenue.",
      )
    } finally {
      setSubmitting(false)
    }
  }

  const history = useMemo(() => data?.history || [], [data?.history])

  return (
    <div className="space-y-6 p-6 lg:p-8">
      <div className="space-y-1">
        <h1 className="text-3xl font-black text-white">Platform Withdrawals</h1>
        <p className="text-zinc-400">
          Withdraw from the platform 20% balance, validate payout details first, and review account history by month and year.
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

      <section className="grid gap-6 xl:grid-cols-[0.78fr_1.22fr]">
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
                max={Math.max(0, data?.balance.pendingPlatformRevenue || 0)}
                value={form.amount}
                onChange={(event) => setForm((current) => ({ ...current, amount: event.target.value }))}
                className="border-zinc-700 bg-zinc-950/70 text-white"
              />
            </FormField>

            <FormField label="Bank name">
              <Select
                value={form.bankCode}
                onValueChange={(value) => {
                  const selectedBank = banks.find((bank) => bank.code === value)
                  setForm((current) => ({
                    ...current,
                    bankCode: value,
                    bankName: selectedBank?.name || "",
                    accountName: current.accountNumber.length === 10 ? current.accountName : "",
                  }))
                }}
              >
                <SelectTrigger className="border-zinc-700 bg-zinc-950/70 text-white">
                  <SelectValue placeholder={banksLoading ? "Loading banks..." : "Select bank"} />
                </SelectTrigger>
                <SelectContent className="border-zinc-800 bg-zinc-900">
                  {banks.map((bank) => (
                    <SelectItem
                      key={bank.code}
                      value={bank.code}
                      className="text-white focus:bg-zinc-800 focus:text-white"
                    >
                      {bank.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>

            <FormField label="Account number">
              <Input
                value={form.accountNumber}
                maxLength={10}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    accountNumber: event.target.value.replace(/\D/g, "").slice(0, 10),
                    accountName: event.target.value.replace(/\D/g, "").slice(0, 10).length < 10 ? "" : current.accountName,
                  }))
                }
                className="border-zinc-700 bg-zinc-950/70 text-white"
              />
            </FormField>

            <FormField label="Account name">
              <div className="relative">
                <Input
                  value={form.accountName}
                  readOnly
                  placeholder={resolvingName ? "Resolving account name..." : "Account name will appear automatically"}
                  className="border-zinc-700 bg-zinc-950/70 pr-10 text-white placeholder:text-zinc-600"
                />
                {resolvingName ? (
                  <LoaderCircle className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-zinc-500" />
                ) : null}
              </div>
            </FormField>

            <FormField label="Note">
              <Input
                value={form.note}
                onChange={(event) => setForm((current) => ({ ...current, note: event.target.value }))}
                placeholder="Optional internal note"
                className="border-zinc-700 bg-zinc-950/70 text-white placeholder:text-zinc-600"
              />
            </FormField>

            <div className="rounded-2xl border border-cyan-400/15 bg-cyan-400/10 px-4 py-3 text-sm text-cyan-100">
              Available to withdraw right now: {formatCurrency(data?.balance.pendingPlatformRevenue || 0)}
            </div>

            <Button
              onClick={submitWithdrawal}
              disabled={
                submitting ||
                loading ||
                resolvingName ||
                !form.bankCode ||
                form.accountNumber.length !== 10 ||
                !form.accountName
              }
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
            <h2 className="text-xl font-bold text-white">Latest Withdrawal Ledger</h2>
            <div className="mt-5 space-y-3">
              {loading ? (
                <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-5 text-sm text-zinc-400">
                  Loading withdrawals...
                </div>
              ) : data?.withdrawals.length ? (
                data.withdrawals.map((withdrawal, index) => (
                  <WithdrawalCard key={withdrawal._id || `${withdrawal.bankName}-${index}`} withdrawal={withdrawal} />
                ))
              ) : (
                <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-5 text-sm text-zinc-400">
                  No platform withdrawals recorded yet.
                </div>
              )}
            </div>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
            <h2 className="text-xl font-bold text-white">Account History</h2>
            <p className="mt-1 text-sm text-zinc-500">
              History is grouped into years first, then broken down by months when transactions exist.
            </p>

            <div className="mt-5 space-y-5">
              {history.length ? (
                history.map((yearGroup) => (
                  <div key={yearGroup.year} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <h3 className="text-lg font-semibold text-white">{yearGroup.year}</h3>
                    <div className="mt-4 space-y-4">
                      {yearGroup.months.map((monthGroup) => (
                        <div key={monthGroup.month}>
                          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-500">
                            {monthGroup.month}
                          </p>
                          <div className="mt-3 space-y-3">
                            {monthGroup.items.map((withdrawal, index) => (
                              <WithdrawalCard
                                key={withdrawal._id || `${monthGroup.month}-${withdrawal.bankName}-${index}`}
                                withdrawal={withdrawal}
                              />
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-5 text-sm text-zinc-400">
                  No account history yet.
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

function WithdrawalCard({ withdrawal }: { withdrawal: PlatformWithdrawal }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-4">
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
      {withdrawal.note ? <p className="mt-3 text-sm text-zinc-500">{withdrawal.note}</p> : null}
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
