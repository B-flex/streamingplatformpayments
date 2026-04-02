"use client"

import { useState } from "react"
import {
  Building2,
  Check,
  Copy,
  CreditCard,
  Download,
  Info,
  QrCode,
  Shield,
  Clock,
  Zap,
  User,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/app/context/AuthContext"
import { authRequest } from "@/lib/auth-client"

const fallbackAccount = {
  accountName: "No virtual account yet",
  accountNumber: "Register a user first",
  bankName: "Monnify",
  accountReference: "Pending registration",
}

export default function VirtualAccountPage() {
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const [testSender, setTestSender] = useState("Monnify Sandbox Tester")
  const [testAmount, setTestAmount] = useState("1500")
  const [isTestingDonation, setIsTestingDonation] = useState(false)
  const [testFeedback, setTestFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null)
  const { user } = useAuth()
  const isSandboxAccount = user?.virtualAccount?.provider === "monnify"

  const runSandboxDonationTest = async () => {
    setIsTestingDonation(true)
    setTestFeedback(null)

    try {
      const response = await authRequest("/monnify/test-donation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sender: testSender.trim() || "Monnify Sandbox Tester",
          amount: Number(testAmount) || 0,
        }),
      })

      const payload = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(payload.error || "Could not create a Monnify sandbox donation.")
      }

      setTestFeedback({
        type: "success",
        message: "Test donation sent. Check your donations page and overlay now.",
      })
    } catch (error) {
      setTestFeedback({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Could not create a Monnify sandbox donation.",
      })
    } finally {
      setIsTestingDonation(false)
    }
  }

  const accountData = user?.virtualAccount || fallbackAccount

  const copyToClipboard = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text)
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 2000)
  }

  const accountFields = [
    {
      label: "Bank Name",
      value: accountData.bankName,
      field: "bank",
      icon: Building2,
      highlight: false,
    },
    {
      label: "Account Number",
      value: accountData.accountNumber,
      field: "number",
      icon: CreditCard,
      highlight: true,
    },
    {
      label: "Account Name",
      value: accountData.accountName,
      field: "name",
      icon: User,
      highlight: false,
    },
  ]

  return (
    <div className="p-6 space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold text-white">Virtual Account</h1>
        <p className="text-zinc-400 mt-1">
          Your Monnify reserved account for receiving donations
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 rounded-xl overflow-hidden">
          <div className="px-6 py-5 border-b border-zinc-800 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-purple-500/10">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg shadow-purple-500/25">
                <CreditCard className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Account Details</h2>
                <p className="text-sm text-zinc-500">Share with your viewers</p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-4">
            {accountFields.map(({ label, value, field, icon: Icon, highlight }) => (
              <div
                key={field}
                className={cn(
                  "relative flex items-center justify-between p-4 rounded-xl transition-all duration-300",
                  "group hover:scale-[1.02]",
                  highlight
                    ? "bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/40 shadow-lg shadow-purple-500/10"
                    : "bg-zinc-800/50 border border-zinc-700/50 hover:border-zinc-600",
                )}
              >
                {highlight && (
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 blur-xl opacity-50" />
                )}

                <div className="relative flex items-center gap-4">
                  <div
                    className={cn(
                      "p-2.5 rounded-lg",
                      highlight ? "bg-gradient-to-br from-purple-500 to-pink-500" : "bg-zinc-700/50",
                    )}
                  >
                    <Icon
                      className={cn("h-5 w-5", highlight ? "text-white" : "text-zinc-400")}
                    />
                  </div>
                  <div>
                    <p className="text-xs text-zinc-500 uppercase tracking-wider">{label}</p>
                    <p
                      className={cn(
                        "text-lg font-semibold mt-0.5",
                        highlight
                          ? "text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400"
                          : "text-white",
                      )}
                    >
                      {value}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => copyToClipboard(value, field)}
                  className={cn(
                    "relative p-2.5 rounded-lg transition-all duration-200",
                    highlight
                      ? "text-purple-400 hover:text-white hover:bg-purple-500/20"
                      : "text-zinc-500 hover:text-white hover:bg-zinc-700",
                  )}
                  title={`Copy ${label}`}
                >
                  {copiedField === field ? (
                    <Check className="h-5 w-5 text-emerald-400" />
                  ) : (
                    <Copy className="h-5 w-5" />
                  )}
                </button>
              </div>
            ))}
          </div>

          <div className="px-6 pb-6">
            <button
              onClick={() =>
                copyToClipboard(
                  `Bank: ${accountData.bankName}\nAccount Number: ${accountData.accountNumber}\nAccount Name: ${accountData.accountName}`,
                  "all",
                )
              }
              className={cn(
                "w-full py-3.5 rounded-xl text-sm font-semibold transition-all duration-300",
                "bg-gradient-to-r from-purple-500 to-pink-500 text-white",
                "hover:from-purple-600 hover:to-pink-600 hover:shadow-lg hover:shadow-purple-500/25",
                "active:scale-[0.98]",
              )}
            >
              {copiedField === "all" ? (
                <span className="flex items-center justify-center gap-2">
                  <Check className="h-4 w-4" />
                  Copied All Details!
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <Copy className="h-4 w-4" />
                  Copy All Details
                </span>
              )}
            </button>
          </div>
        </div>

        <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 rounded-xl overflow-hidden">
          <div className="px-6 py-5 border-b border-zinc-800">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-zinc-800">
                <QrCode className="h-5 w-5 text-zinc-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Account Reference</h2>
                <p className="text-sm text-zinc-500">Monnify reservation details</p>
              </div>
            </div>
          </div>

          <div className="p-6 flex flex-col items-center">
            <div className="w-full rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 space-y-4">
              <div>
                <p className="text-xs uppercase tracking-wide text-zinc-500">Reference</p>
                <p className="mt-1 text-lg font-semibold text-white">
                  {accountData.accountReference || "Not available"}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-zinc-500">Provider</p>
                <p className="mt-1 text-sm text-zinc-300">Monnify Reserved Account</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-zinc-500">Status</p>
                <p className="mt-1 text-sm text-emerald-400">
                  {user?.virtualAccount?.status || "Awaiting registration"}
                </p>
              </div>
            </div>

            <p className="text-sm text-zinc-500 mt-4 text-center">
              This account is provisioned per registered user and can be reused across streams.
            </p>

            <button className="mt-4 flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-zinc-400 hover:text-white bg-zinc-800/50 hover:bg-zinc-800 transition-colors">
              <Download className="h-4 w-4" />
              Download Account Details
            </button>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 rounded-xl overflow-hidden">
        <div className="px-6 py-5 border-b border-zinc-800 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
            <Info className="h-5 w-5 text-cyan-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">How Donations Work</h2>
            <p className="text-sm text-zinc-500">Instructions for your viewers</p>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold shadow-lg shadow-purple-500/25">
                1
              </div>
              <div>
                <h3 className="font-semibold text-white">Open Banking App</h3>
                <p className="text-sm text-zinc-400 mt-1">
                  Open your mobile banking app or USSD and choose transfer to bank.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold shadow-lg shadow-purple-500/25">
                2
              </div>
              <div>
                <h3 className="font-semibold text-white">Enter Details</h3>
                <p className="text-sm text-zinc-400 mt-1">
                  Enter the account number and select {accountData.bankName} as the bank.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold shadow-lg shadow-purple-500/25">
                3
              </div>
              <div>
                <h3 className="font-semibold text-white">Send & Appear on Stream</h3>
                <p className="text-sm text-zinc-400 mt-1">
                  Complete the transfer and your donation can be verified through Monnify webhooks.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="flex items-center gap-3 p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl">
          <div className="p-2 rounded-lg bg-emerald-500/10">
            <Shield className="h-5 w-5 text-emerald-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-white">Secure Payments</p>
            <p className="text-xs text-zinc-500">Backed by Monnify</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl">
          <div className="p-2 rounded-lg bg-cyan-500/10">
            <Clock className="h-5 w-5 text-cyan-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-white">Reserved Account</p>
            <p className="text-xs text-zinc-500">Created per registered user</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl">
          <div className="p-2 rounded-lg bg-purple-500/10">
            <Zap className="h-5 w-5 text-purple-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-white">Webhook Ready</p>
            <p className="text-xs text-zinc-500">Donation alerts can sync live</p>
          </div>
        </div>
      </div>

      {isSandboxAccount ? (
        <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 rounded-xl overflow-hidden">
          <div className="px-6 py-5 border-b border-zinc-800 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20">
              <Zap className="h-5 w-5 text-purple-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Monnify Sandbox Donation Test</h2>
              <p className="text-sm text-zinc-500">Create a safe test donation for this creator account.</p>
            </div>
          </div>

          <div className="p-6 space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-300">Test sender name</label>
                <input
                  value={testSender}
                  onChange={(event) => setTestSender(event.target.value)}
                  className="w-full h-11 rounded-xl border border-zinc-800 bg-zinc-900 px-4 text-white outline-none transition-colors focus:border-purple-500"
                  placeholder="Monnify Sandbox Tester"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-300">Test amount (NGN)</label>
                <input
                  value={testAmount}
                  onChange={(event) => setTestAmount(event.target.value)}
                  type="number"
                  min="1"
                  className="w-full h-11 rounded-xl border border-zinc-800 bg-zinc-900 px-4 text-white outline-none transition-colors focus:border-purple-500"
                  placeholder="1500"
                />
              </div>
            </div>

            <p className="text-sm text-zinc-500">
              This uses StreamTip&apos;s sandbox donation endpoint so you can verify dashboard totals, donations, alerts, and OBS overlay behavior while your Monnify account is still in test mode.
            </p>

            {testFeedback ? (
              <div
                className={cn(
                  "rounded-xl border px-4 py-3 text-sm",
                  testFeedback.type === "success"
                    ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-200"
                    : "border-red-500/20 bg-red-500/10 text-red-200",
                )}
              >
                {testFeedback.message}
              </div>
            ) : null}

            <button
              onClick={runSandboxDonationTest}
              disabled={isTestingDonation}
              className="inline-flex h-11 items-center justify-center rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 px-5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isTestingDonation ? "Sending test donation..." : "Run Monnify test donation"}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
