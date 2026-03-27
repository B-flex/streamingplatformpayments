"use client"

import { useEffect, useMemo, useState } from "react"
import {
  ArrowUpRight,
  Coins,
  CreditCard,
  Receipt,
  ShieldCheck,
  Sparkles,
  Users,
  Wallet,
} from "lucide-react"
import { adminRequest } from "@/lib/admin-client"
import { cn } from "@/lib/utils"

type AdminOverviewResponse = {
  metrics: {
    totalUsers: number
    totalDonations: number
    totalPayouts: number
    grossRevenue: number
    platformRevenue: number
    creatorRevenue: number
    creatorAvailableBalance: number
    totalPaidOut: number
    pendingPlatformRevenue: number
    totalPlatformWithdrawn: number
  }
  recentUsers: Array<{
    id: string
    name: string
    email: string
    createdAt?: string
  }>
  recentDonations: Array<{
    _id?: string
    sender?: string
    amount: number
    platformFee?: number
    creatorShare?: number
    date?: string
  }>
  recentPayouts: Array<{
    _id?: string
    amount: number
    bankName: string
    accountNumber: string
    status: string
    createdAt?: string
  }>
  recentPlatformWithdrawals: Array<{
    _id?: string
    amount: number
    bankName: string
    accountNumber: string
    accountName?: string
    status: string
    createdAt?: string
  }>
  topGifters: Array<{
    name: string
    amount: number
  }>
  logs: Array<{
    _id?: string
    actorType: string
    eventType: string
    message: string
    metadata?: Record<string, unknown>
    createdAt?: string
  }>
}

function formatCurrency(amount: number) {
  return `NGN ${Number(amount || 0).toLocaleString()}`
}

function formatDate(value?: string) {
  if (!value) return "Just now"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "Just now"

  return new Intl.DateTimeFormat("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date)
}

export default function AdminPage() {
  const [overview, setOverview] = useState<AdminOverviewResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const loadOverview = async () => {
      try {
        const response = await adminRequest("/admin/overview")
        const data = await response.json().catch(() => null)

        if (!response.ok) {
          throw new Error(data?.error || "Could not load admin overview.")
        }

        const payload = (data || {}) as Partial<AdminOverviewResponse>

        setOverview({
          metrics: {
            totalUsers: payload.metrics?.totalUsers || 0,
            totalDonations: payload.metrics?.totalDonations || 0,
            totalPayouts: payload.metrics?.totalPayouts || 0,
            grossRevenue: payload.metrics?.grossRevenue || 0,
            platformRevenue: payload.metrics?.platformRevenue || 0,
            creatorRevenue: payload.metrics?.creatorRevenue || 0,
            creatorAvailableBalance: payload.metrics?.creatorAvailableBalance || 0,
            totalPaidOut: payload.metrics?.totalPaidOut || 0,
            pendingPlatformRevenue: payload.metrics?.pendingPlatformRevenue || 0,
            totalPlatformWithdrawn: payload.metrics?.totalPlatformWithdrawn || 0,
          },
          recentUsers: Array.isArray(payload.recentUsers) ? payload.recentUsers : [],
          recentDonations: Array.isArray(payload.recentDonations) ? payload.recentDonations : [],
          recentPayouts: Array.isArray(payload.recentPayouts) ? payload.recentPayouts : [],
          recentPlatformWithdrawals: Array.isArray(payload.recentPlatformWithdrawals)
            ? payload.recentPlatformWithdrawals
            : [],
          topGifters: Array.isArray(payload.topGifters) ? payload.topGifters : [],
          logs: Array.isArray(payload.logs) ? payload.logs : [],
        })
      } catch (requestError) {
        setError(
          requestError instanceof Error
            ? requestError.message
            : "Could not load admin overview.",
        )
      } finally {
        setLoading(false)
      }
    }

    void loadOverview()
  }, [])

  const headlineCards = useMemo(
    () =>
      overview
        ? [
            {
              label: "Platform revenue",
              value: formatCurrency(overview.metrics.platformRevenue),
              icon: Coins,
              tone: "cyan",
            },
            {
              label: "Gross revenue",
              value: formatCurrency(overview.metrics.grossRevenue),
              icon: Wallet,
              tone: "purple",
            },
            {
              label: "Creator revenue",
              value: formatCurrency(overview.metrics.creatorRevenue),
              icon: Receipt,
              tone: "emerald",
            },
            {
              label: "Users",
              value: overview.metrics.totalUsers.toLocaleString(),
              icon: Users,
              tone: "amber",
            },
          ]
        : [],
    [overview],
  )

  const recentUsers = overview?.recentUsers || []
  const recentDonations = overview?.recentDonations || []
  const recentPayouts = overview?.recentPayouts || []
  const recentPlatformWithdrawals = overview?.recentPlatformWithdrawals || []
  const topGifters = overview?.topGifters || []

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-white">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 px-6 py-5">
          Loading admin overview...
        </div>
      </div>
    )
  }

  if (error || !overview) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-6 text-white">
        <div className="max-w-lg rounded-2xl border border-red-500/20 bg-red-500/10 p-6 text-red-100">
          {error || "Could not load admin overview."}
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-6 py-8">
      <header className="flex flex-col gap-4 rounded-[32px] border border-white/10 bg-white/5 p-6 backdrop-blur-xl lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm text-cyan-100">
              <ShieldCheck className="h-4 w-4" />
              Admin oversight
            </div>
            <h1 className="text-3xl font-black">StreamTip Admin Panel</h1>
            <p className="text-zinc-400">
              Monitor creators, revenue, payouts, donations, and system activity from one private view.
            </p>
          </div>
      </header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {headlineCards.map((card) => (
            <div
              key={card.label}
              className={cn(
                "rounded-[28px] border p-5 backdrop-blur-xl",
                card.tone === "cyan" && "border-cyan-400/20 bg-cyan-400/10",
                card.tone === "purple" && "border-purple-400/20 bg-purple-400/10",
                card.tone === "emerald" && "border-emerald-400/20 bg-emerald-400/10",
                card.tone === "amber" && "border-amber-400/20 bg-amber-400/10",
              )}
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm text-white/65">{card.label}</p>
                <div className="rounded-2xl bg-black/15 p-3">
                  <card.icon className="h-5 w-5 text-white" />
                </div>
              </div>
              <p className="mt-5 break-words text-2xl font-black leading-tight text-white xl:text-[1.75rem]">
                {card.value}
              </p>
            </div>
          ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            <div className="rounded-[28px] border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.24em] text-white/45">Revenue split</p>
                  <h2 className="mt-2 text-2xl font-bold">Platform vs creator earnings</h2>
                </div>
                <Sparkles className="h-6 w-6 text-cyan-200" />
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-3">
                <MetricTile label="Platform 20%" value={formatCurrency(overview.metrics.platformRevenue)} />
                <MetricTile label="Creator 80%" value={formatCurrency(overview.metrics.creatorRevenue)} />
                <MetricTile label="Paid out" value={formatCurrency(overview.metrics.totalPaidOut)} />
              </div>

              <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4 text-sm leading-7 text-zinc-300">
                Creator withdrawals are now capped to the 80% creator share. The platform 20% is reserved automatically in system reporting and included in this admin view.
              </div>
            </div>

            <DataPanel title="Recent Users">
              <div className="space-y-3">
                {recentUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                    <div className="min-w-0">
                      <p className="truncate font-medium text-white">{user.name}</p>
                      <p className="truncate text-sm text-zinc-500">{user.email}</p>
                    </div>
                    <p className="text-xs text-zinc-500">{formatDate(user.createdAt)}</p>
                  </div>
                ))}
              </div>
            </DataPanel>

            <DataPanel title="Recent Donations">
              <div className="space-y-3">
                {recentDonations.map((donation, index) => (
                  <div key={donation._id || `${donation.sender}-${index}`} className="grid gap-2 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 md:grid-cols-[1.2fr_0.8fr_0.8fr_0.8fr]">
                    <div>
                      <p className="font-medium text-white">{donation.sender || "Anonymous"}</p>
                      <p className="text-xs text-zinc-500">{formatDate(donation.date)}</p>
                    </div>
                    <p className="text-sm text-white">{formatCurrency(donation.amount)}</p>
                    <p className="text-sm text-cyan-200">
                      {formatCurrency(
                        typeof donation.platformFee === "number"
                          ? donation.platformFee
                          : Math.round(donation.amount * 0.2),
                      )}
                    </p>
                    <p className="text-sm text-emerald-200">
                      {formatCurrency(
                        typeof donation.creatorShare === "number"
                          ? donation.creatorShare
                          : donation.amount - Math.round(donation.amount * 0.2),
                      )}
                    </p>
                  </div>
                ))}
              </div>
            </DataPanel>
          </div>

          <div className="space-y-6">
            <DataPanel title="Top Gifters">
              <div className="space-y-3">
                {topGifters.map((gifter, index) => (
                  <div key={`${gifter.name}-${index}`} className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-sm font-black">
                        {index + 1}
                      </div>
                      <p className="font-medium text-white">{gifter.name}</p>
                    </div>
                    <p className="text-sm font-semibold text-cyan-200">
                      {formatCurrency(gifter.amount)}
                    </p>
                  </div>
                ))}
              </div>
            </DataPanel>

            <DataPanel title="Recent Payouts">
              <div className="space-y-3">
                {recentPayouts.map((payout, index) => (
                  <div key={payout._id || `${payout.bankName}-${index}`} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-medium text-white">{payout.bankName}</p>
                        <p className="text-xs text-zinc-500">**** {String(payout.accountNumber).slice(-4)}</p>
                      </div>
                      <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-200">
                        {payout.status}
                      </span>
                    </div>
                    <div className="mt-3 flex items-center justify-between text-sm">
                      <p className="text-white">{formatCurrency(payout.amount)}</p>
                      <p className="text-zinc-500">{formatDate(payout.createdAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </DataPanel>

            <DataPanel title="Recent Platform Withdrawals">
              <div className="space-y-3">
                {recentPlatformWithdrawals.length ? (
                  recentPlatformWithdrawals.map((withdrawal, index) => (
                    <div key={withdrawal._id || `${withdrawal.bankName}-${index}`} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="font-medium text-white">{withdrawal.bankName}</p>
                          <p className="text-xs text-zinc-500">
                            {withdrawal.accountName || "Platform account"} • **** {String(withdrawal.accountNumber).slice(-4)}
                          </p>
                        </div>
                        <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200">
                          {withdrawal.status}
                        </span>
                      </div>
                      <div className="mt-3 flex items-center justify-between text-sm">
                        <p className="text-white">{formatCurrency(withdrawal.amount)}</p>
                        <p className="text-zinc-500">{formatDate(withdrawal.createdAt)}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-5 text-sm text-zinc-400">
                    No platform withdrawals yet.
                  </div>
                )}
              </div>
            </DataPanel>
          </div>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        <MetricBanner
          icon={CreditCard}
          label="Pending platform revenue"
          value={formatCurrency(overview.metrics.pendingPlatformRevenue)}
          tone="cyan"
        />
        <MetricBanner
          icon={Coins}
          label="Platform withdrawn"
          value={formatCurrency(overview.metrics.totalPlatformWithdrawn)}
          tone="cyan"
        />
        <MetricBanner
          icon={ArrowUpRight}
          label="Creator available balance"
          value={formatCurrency(overview.metrics.creatorAvailableBalance)}
          tone="emerald"
        />
        <MetricBanner
          icon={Users}
          label="Total donations"
          value={overview.metrics.totalDonations.toLocaleString()}
          tone="purple"
        />
      </section>
    </div>
  )
}

function DataPanel({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="rounded-[28px] border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
      <h2 className="text-xl font-bold text-white">{title}</h2>
      <div className="mt-5">{children}</div>
    </section>
  )
}

function MetricTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <p className="text-sm text-zinc-500">{label}</p>
      <p className="mt-2 break-words text-xl font-black leading-tight text-white 2xl:text-2xl">
        {value}
      </p>
    </div>
  )
}

function MetricBanner({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: typeof Coins
  label: string
  value: string
  tone: "cyan" | "emerald" | "purple"
}) {
  return (
    <div
      className={cn(
        "rounded-[28px] border p-5 backdrop-blur-xl",
        tone === "cyan" && "border-cyan-400/20 bg-cyan-400/10",
        tone === "emerald" && "border-emerald-400/20 bg-emerald-400/10",
        tone === "purple" && "border-purple-400/20 bg-purple-400/10",
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm text-white/65">{label}</p>
          <p className="mt-2 break-words text-xl font-black leading-tight text-white 2xl:text-2xl">
            {value}
          </p>
        </div>
        <div className="rounded-2xl bg-black/15 p-3">
          <Icon className="h-5 w-5 text-white" />
        </div>
      </div>
    </div>
  )
}
