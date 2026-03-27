"use client"

import { useEffect, useMemo, useState } from "react"
import { io } from "socket.io-client"
import {
  ArrowDownToLine,
  ArrowRight,
  Building2,
  Calendar,
  CalendarDays,
  CheckCircle2,
  Landmark,
  ShieldCheck,
  TrendingUp,
  Wallet,
  XCircle,
} from "lucide-react"
import { EarningsSummaryCard } from "@/components/dashboard/earnings-summary-card"
import { EarningsChart } from "@/components/dashboard/earnings-chart"
import { PayoutsTable, type Payout } from "@/components/dashboard/payouts-table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { readStoredAppPreferences } from "@/lib/app-preferences"
import { emitNotificationFeedback } from "@/lib/notification-runtime"

type Donation = {
  sender?: string
  senderName?: string
  amount: number
  date?: string
  createdAt?: string
}

type WithdrawResult =
  | {
      status: "success"
      title: string
      description: string
    }
  | {
      status: "error"
      title: string
      description: string
    }
  | null

const MIN_WITHDRAWAL = 5000
const PLATFORM_FEE_RATE = 0.2
const CREATOR_SHARE_RATE = 0.8

function normalizePayoutStatus(status: unknown): Payout["status"] {
  if (status === "completed" || status === "failed" || status === "pending") {
    return status
  }

  return "pending"
}

function mergePayouts(existing: Payout[], incoming: Payout) {
  const incomingId = incoming._id || ""
  const incomingFingerprint = `${incoming.amount}-${incoming.bankName}-${incoming.accountNumber}-${new Date(
    incoming.createdAt,
  ).getTime()}`

  const withoutDuplicate = existing.filter((item) => {
    const itemFingerprint = `${item.amount}-${item.bankName}-${item.accountNumber}-${new Date(
      item.createdAt,
    ).getTime()}`

    return item._id !== incomingId && itemFingerprint !== incomingFingerprint
  })

  return [incoming, ...withoutDuplicate]
}

function formatCurrency(amount: number) {
  return `NGN ${amount.toLocaleString()}`
}

function normalizeDate(value?: string) {
  return new Date(value || Date.now())
}

export default function EarningsPage() {
  const [donations, setDonations] = useState<Donation[]>([])
  const [totalEarnings, setTotalEarnings] = useState(0)
  const [payouts, setPayouts] = useState<Payout[]>([])
  const [showWithdraw, setShowWithdraw] = useState(false)
  const [withdrawAmount, setWithdrawAmount] = useState("")
  const [bankName, setBankName] = useState("")
  const [accountNumber, setAccountNumber] = useState("")
  const [loading, setLoading] = useState(false)
  const [withdrawResult, setWithdrawResult] = useState<WithdrawResult>(null)

  useEffect(() => {
    fetch("http://localhost:5000/donations")
      .then((res) => res.json())
      .then((data) => {
        setDonations(data)

        const total = data.reduce((sum: number, donation: Donation) => {
          return sum + (Number(donation.amount) || 0)
        }, 0)

        setTotalEarnings(total)
      })
  }, [])

  useEffect(() => {
    fetch("http://localhost:5000/payouts")
      .then((res) => res.json())
      .then((data) => {
        const formatted = data.map((payout: any) => ({
          ...payout,
          _id: payout._id || payout.id,
          status: normalizePayoutStatus(payout.status),
          createdAt: new Date(payout.createdAt),
          completedAt: payout.completedAt ? new Date(payout.completedAt) : undefined,
        }))

        setPayouts(formatted)
      })
  }, [])

  useEffect(() => {
    const socket = io("http://localhost:5000")

    socket.on("newDonation", (data) => {
      const amount = Number(data.amount) || 0

      setDonations((prev) => [data, ...prev])
      setTotalEarnings((prev) => prev + amount)
    })

    socket.on("newPayout", (data) => {
      const payout = {
        ...data,
        _id: data._id || data.id,
        status: normalizePayoutStatus(data.status),
        createdAt: new Date(data.createdAt || Date.now()),
        completedAt: data.completedAt ? new Date(data.completedAt) : undefined,
      }

      setPayouts((prev) => {
        return mergePayouts(prev, payout)
      })

      const preferences = readStoredAppPreferences()
      if (preferences.payoutNotifications) {
        void emitNotificationFeedback("payout", preferences, {
          title: "Payout update",
          body: `${formatCurrency(Number(data.amount) || 0)} payout marked ${payout.status}.`,
          tag: `payout-${payout._id}`,
        })
      }
    })

    return () => {
      socket.disconnect()
    }
  }, [])

  const weeklyData = useMemo(() => {
    const grouped = donations.reduce((acc: { label: string; amount: number }[], donation) => {
      const date = normalizeDate(donation.date || donation.createdAt)
      const day = date.toLocaleDateString("en-US", { weekday: "short" })
      const existing = acc.find((item) => item.label === day)

      if (existing) {
        existing.amount += Number(donation.amount) || 0
      } else {
        acc.push({ label: day, amount: Number(donation.amount) || 0 })
      }

      return acc
    }, [])

    const order = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
    grouped.sort((a, b) => order.indexOf(a.label) - order.indexOf(b.label))
    return grouped
  }, [donations])

  const monthlyData = useMemo(() => {
    return donations.reduce((acc: { label: string; amount: number }[], donation) => {
      const date = normalizeDate(donation.date || donation.createdAt)
      const month = date.toLocaleDateString("en-US", { month: "short" })
      const existing = acc.find((item) => item.label === month)

      if (existing) {
        existing.amount += Number(donation.amount) || 0
      } else {
        acc.push({ label: month, amount: Number(donation.amount) || 0 })
      }

      return acc
    }, [])
  }, [donations])

  const todayEarnings = useMemo(() => {
    const now = new Date()

    return donations.reduce((sum, donation) => {
      const date = normalizeDate(donation.date || donation.createdAt)
      const isToday =
        date.getDate() === now.getDate() &&
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear()

      return isToday ? sum + (Number(donation.amount) || 0) : sum
    }, 0)
  }, [donations])

  const cleanWithdrawAmount = withdrawAmount.replace(/,/g, "")
  const parsedWithdrawAmount = Number(cleanWithdrawAmount) || 0
  const sanitizedAccountNumber = accountNumber.replace(/\D/g, "").slice(0, 10)
  const deductedPayoutTotal = useMemo(
    () =>
      payouts.reduce((sum, payout) => {
        if (payout.status === "failed") {
          return sum
        }

        return sum + (Number(payout.amount) || 0)
      }, 0),
    [payouts],
  )
  const platformFeeReserved = Math.round(totalEarnings * PLATFORM_FEE_RATE)
  const creatorShareBalance = Math.round(totalEarnings * CREATOR_SHARE_RATE)
  const availableBalance = Math.max(0, creatorShareBalance - deductedPayoutTotal)

  const validationMessage = useMemo(() => {
    if (!withdrawAmount) return "Enter the amount you want to withdraw."
    if (!parsedWithdrawAmount || parsedWithdrawAmount <= 0) return "Enter a valid withdrawal amount."
    if (parsedWithdrawAmount < MIN_WITHDRAWAL) {
      return `Minimum withdrawal is ${formatCurrency(MIN_WITHDRAWAL)}.`
    }
    if (!bankName.trim()) return "Add the destination bank."
    if (sanitizedAccountNumber.length !== 10) return "Account number must be 10 digits."
    if (parsedWithdrawAmount > availableBalance) return "This amount is above your available balance."
    return ""
  }, [
    availableBalance,
    bankName,
    parsedWithdrawAmount,
    sanitizedAccountNumber.length,
    withdrawAmount,
  ])

  const canSubmitWithdrawal = validationMessage === ""

  const resetWithdrawForm = () => {
    setWithdrawAmount("")
    setBankName("")
    setAccountNumber("")
    setLoading(false)
  }

  const closeWithdrawModal = () => {
    setShowWithdraw(false)
    resetWithdrawForm()
  }

  const handleWithdraw = async () => {
    if (!canSubmitWithdrawal) return

    setLoading(true)
    setWithdrawResult(null)

    try {
      const response = await fetch("http://localhost:5000/payouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: parsedWithdrawAmount,
          bankName: bankName.trim(),
          accountNumber: sanitizedAccountNumber,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data?.message || "Something went wrong while creating the payout.")
      }

      setPayouts((prev) =>
        mergePayouts(prev, {
          _id: data._id || data.id || crypto.randomUUID(),
          amount: parsedWithdrawAmount,
          status: normalizePayoutStatus(data.status),
          bankName: bankName.trim(),
          accountNumber: sanitizedAccountNumber,
          createdAt: new Date(data.createdAt || Date.now()),
          completedAt: data.completedAt ? new Date(data.completedAt) : undefined,
        }),
      )

      setWithdrawResult({
        status: "success",
        title: "Withdrawal request submitted",
        description: `${formatCurrency(parsedWithdrawAmount)} has been sent to ${bankName.trim()} - ${sanitizedAccountNumber.slice(-4)}.`,
      })

      const preferences = readStoredAppPreferences()
      if (preferences.payoutNotifications) {
        void emitNotificationFeedback("payout", preferences, {
          title: "Withdrawal successful",
          body: `${formatCurrency(parsedWithdrawAmount)} sent to ${bankName.trim()} - ${sanitizedAccountNumber.slice(-4)}.`,
          tag: `withdrawal-${data._id || data.id || "local"}`,
        })
      }
      resetWithdrawForm()
    } catch (error) {
      const description =
        error instanceof Error
          ? error.message
          : "We could not process your withdrawal right now. Please try again."

      setWithdrawResult({
        status: "error",
        title: "Withdrawal could not be completed",
        description,
      })
      setLoading(false)
    }
  }

  const yesterdayEarnings = 48000
  const weeklyEarnings = weeklyData.reduce((sum, item) => sum + item.amount, 0)
  const previousWeekEarnings = 285000
  const monthlyEarnings = monthlyData.reduce((sum, item) => sum + item.amount, 0)
  const previousMonthEarnings = 720000
  const netEarnings = Math.max(
    0,
    creatorShareBalance - payouts.reduce((sum, payout) => sum + (Number(payout.amount) || 0), 0),
  )

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-white">Earnings</h1>
          <p className="text-zinc-500">Track your income and manage payouts.</p>
        </div>

        <Button
          onClick={() => {
            setWithdrawResult(null)
            setShowWithdraw(true)
          }}
          className="h-11 px-5 bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90 text-white"
        >
          <ArrowDownToLine className="h-4 w-4" />
          Withdraw Funds
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <EarningsSummaryCard
          title="Creator Earnings"
          amount={netEarnings}
          icon={Wallet}
          accentColor="purple"
          glowing
        />
        <EarningsSummaryCard
          title="Today"
          amount={todayEarnings}
          previousAmount={yesterdayEarnings}
          icon={Calendar}
          accentColor="green"
        />
        <EarningsSummaryCard
          title="This Week"
          amount={weeklyEarnings}
          previousAmount={previousWeekEarnings}
          icon={CalendarDays}
          accentColor="cyan"
        />
        <EarningsSummaryCard
          title="This Month"
          amount={monthlyEarnings}
          previousAmount={previousMonthEarnings}
          icon={TrendingUp}
          accentColor="amber"
        />
      </div>

      <div className="relative overflow-hidden rounded-2xl border border-purple-500/30 bg-[radial-gradient(circle_at_top_right,rgba(217,70,239,0.25),transparent_35%),linear-gradient(135deg,rgba(91,33,182,0.22),rgba(24,24,27,0.95))] p-6">
        <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2">
            <p className="text-sm uppercase tracking-[0.25em] text-purple-200/70">
              Available Balance
            </p>
            <p className="text-4xl font-black text-white">
              {formatCurrency(Number(availableBalance) || 0)}
            </p>
            <p className="text-sm text-zinc-300">
              Creators can withdraw up to 80% of earnings. The platform automatically reserves 20%.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 lg:w-[480px]">
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
              <p className="text-xs uppercase tracking-wide text-zinc-400">Minimum</p>
              <p className="mt-1 text-base font-semibold text-white">
                {formatCurrency(MIN_WITHDRAWAL)}
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
              <p className="text-xs uppercase tracking-wide text-zinc-400">Speed</p>
              <p className="mt-1 text-base font-semibold text-white">Instant - 24hrs</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
              <p className="text-xs uppercase tracking-wide text-zinc-400">Platform 20%</p>
              <p className="mt-1 text-base font-semibold text-cyan-300">
                {formatCurrency(platformFeeReserved)}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {weeklyData.length > 0 && <EarningsChart data={weeklyData} title="Weekly Earnings" />}
        <EarningsChart data={monthlyData} title="Monthly Breakdown" />
      </div>

      <PayoutsTable payouts={payouts} />

      <Dialog
        open={showWithdraw}
        onOpenChange={(open) => {
          if (!open && !loading) {
            closeWithdrawModal()
            setWithdrawResult(null)
          } else {
            setShowWithdraw(open)
          }
        }}
      >
        <DialogContent
          showCloseButton={!loading}
          className="!w-[min(1120px,calc(100vw-1.5rem))] !max-w-[1120px] border-zinc-800 bg-zinc-950 p-0 text-white overflow-hidden"
        >
          {withdrawResult ? (
            <div className="relative">
              <div
                className={`absolute inset-0 ${
                  withdrawResult.status === "success"
                    ? "bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.18),transparent_40%)]"
                    : "bg-[radial-gradient(circle_at_top,rgba(239,68,68,0.18),transparent_40%)]"
                }`}
              />
              <div className="relative p-8 sm:p-10 lg:p-12">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-white/5">
                  {withdrawResult.status === "success" ? (
                    <CheckCircle2 className="h-8 w-8 text-emerald-400" />
                  ) : (
                    <XCircle className="h-8 w-8 text-red-400" />
                  )}
                </div>

                <div className="mt-6 text-center space-y-3">
                  <h2 className="text-2xl font-bold">{withdrawResult.title}</h2>
                  <p className="text-sm leading-6 text-zinc-400">{withdrawResult.description}</p>
                </div>

                <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-zinc-300">
                  {withdrawResult.status === "success"
                    ? "You can close this window and keep streaming. We also added the request to your payout history."
                    : "Your balance is untouched. Review the details and try again when you're ready."}
                </div>

                <div className="mt-8 flex flex-col sm:flex-row gap-3 sm:justify-center">
                  {withdrawResult.status === "error" && (
                    <Button
                      onClick={() => setWithdrawResult(null)}
                      className="bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:opacity-90"
                    >
                      Try Again
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    onClick={() => {
                      setWithdrawResult(null)
                      closeWithdrawModal()
                    }}
                    className="border-zinc-700 bg-zinc-900 text-white hover:bg-zinc-800"
                  >
                    Close
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <div className="border-b border-zinc-800 bg-[radial-gradient(circle_at_top_right,rgba(168,85,247,0.18),transparent_40%)] p-8 lg:p-10">
                <DialogHeader className="text-left">
                  <DialogTitle className="text-2xl text-white">Withdraw Funds</DialogTitle>
                  <DialogDescription className="text-zinc-400">
                    Send part of your available balance to your bank account with a quick review before submission.
                  </DialogDescription>
                </DialogHeader>
              </div>

              <div className="grid gap-0 lg:grid-cols-[1.2fr_0.8fr]">
                <div className="p-8 lg:p-10 space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-300">Withdrawal amount</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500">
                        NGN
                      </span>
                      <Input
                        type="text"
                        placeholder="0"
                        value={withdrawAmount}
                        onChange={(event) => {
                          const raw = event.target.value.replace(/,/g, "")
                          if (raw && Number.isNaN(Number(raw))) return
                          setWithdrawAmount(raw ? Number(raw).toLocaleString() : "")
                        }}
                        className="h-12 border-zinc-800 bg-zinc-900 pl-16 text-white placeholder:text-zinc-600 focus-visible:border-purple-500 focus-visible:ring-purple-500/20"
                      />
                    </div>
                    <p className="text-xs text-zinc-500">
                      Minimum withdrawal is {formatCurrency(MIN_WITHDRAWAL)}.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-300">Bank name</label>
                    <div className="relative">
                      <Building2 className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                      <Input
                        placeholder="e.g. GTBank"
                        value={bankName}
                        onChange={(event) => setBankName(event.target.value)}
                        className="h-12 border-zinc-800 bg-zinc-900 pl-11 text-white placeholder:text-zinc-600 focus-visible:border-purple-500 focus-visible:ring-purple-500/20"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-300">Account number</label>
                    <div className="relative">
                      <Landmark className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                      <Input
                        inputMode="numeric"
                        placeholder="10-digit account number"
                        value={accountNumber}
                        onChange={(event) =>
                          setAccountNumber(event.target.value.replace(/\D/g, "").slice(0, 10))
                        }
                        className="h-12 border-zinc-800 bg-zinc-900 pl-11 text-white placeholder:text-zinc-600 focus-visible:border-purple-500 focus-visible:ring-purple-500/20"
                      />
                    </div>
                  </div>

                  <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-4">
                    <div className="flex items-start gap-3">
                      <ShieldCheck className="mt-0.5 h-5 w-5 text-emerald-400" />
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-white">Before you submit</p>
                        <p className="text-sm text-zinc-400">
                          Double-check the bank details. Completed withdrawals cannot be reversed once processing begins.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t lg:border-t-0 lg:border-l border-zinc-800 bg-zinc-900/40 p-8 lg:p-10">
                  <h3 className="text-sm font-semibold uppercase tracking-[0.22em] text-zinc-500">
                    Review
                  </h3>

                  <div className="mt-5 space-y-4">
                    <div className="rounded-2xl border border-purple-500/20 bg-gradient-to-br from-purple-500/10 to-transparent p-5">
                      <p className="text-xs uppercase tracking-wide text-zinc-400">You will receive</p>
                      <p className="mt-2 text-3xl font-black text-white">
                        {formatCurrency(parsedWithdrawAmount)}
                      </p>
                      <div className="mt-4 flex items-center gap-2 text-xs text-zinc-400">
                        <ArrowRight className="h-3.5 w-3.5" />
                        Transfer fee is free
                      </div>
                    </div>

                    <div className="space-y-3 rounded-2xl border border-zinc-800 bg-zinc-950/70 p-5">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-zinc-500">Available now</span>
                        <span className="font-medium text-white">
                          {formatCurrency(Number(availableBalance) || 0)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-zinc-500">Creator share (80%)</span>
                        <span className="font-medium text-emerald-300">
                          {formatCurrency(creatorShareBalance)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-zinc-500">Platform reserve (20%)</span>
                        <span className="font-medium text-cyan-300">
                          {formatCurrency(platformFeeReserved)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-zinc-500">Destination</span>
                        <span className="font-medium text-white text-right">
                          {bankName.trim() || "Your selected bank"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-zinc-500">Account</span>
                        <span className="font-mono text-white">
                          {sanitizedAccountNumber
                            ? `**** ${sanitizedAccountNumber.slice(-4)}`
                            : "****"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-zinc-500">Settlement time</span>
                        <span className="font-medium text-emerald-400">Instant - 24hrs</span>
                      </div>
                    </div>

                    <div
                      className={`rounded-2xl border p-4 text-sm ${
                        canSubmitWithdrawal
                          ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
                          : "border-amber-500/20 bg-amber-500/10 text-amber-200"
                      }`}
                    >
                      {canSubmitWithdrawal
                        ? "Everything looks good. You can submit the withdrawal now."
                        : validationMessage}
                    </div>

                    <div className="flex flex-col gap-3 pt-2">
                      <Button
                        onClick={handleWithdraw}
                        disabled={!canSubmitWithdrawal || loading}
                        className="h-11 bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:opacity-90 disabled:opacity-50"
                      >
                        {loading ? "Processing withdrawal..." : "Confirm Withdrawal"}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={closeWithdrawModal}
                        disabled={loading}
                        className="h-11 border-zinc-700 bg-zinc-950 text-white hover:bg-zinc-900"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
