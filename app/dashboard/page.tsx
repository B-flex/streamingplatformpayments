"use client"

import { Wallet, Users, TrendingUp, Gift } from "lucide-react"
import { useDonations } from "@/app/context/DonationsContext"
import { useAuth } from "@/app/context/AuthContext"
import { StatsCard } from "@/components/dashboard/stats-card"
import { DonationsTable } from "@/components/dashboard/donations-table"
import { VirtualAccountCard } from "@/components/dashboard/virtual-account-card"

const fallbackVirtualAccount = {
  accountName: "No virtual account yet",
  accountNumber: "Register a user first",
  bankName: "Monnify",
}

const formatCurrency = (num: number) => {
  if (num >= 1_000_000_000) return "NGN " + (num / 1_000_000_000).toFixed(1) + "B"
  if (num >= 1_000_000) return "NGN " + (num / 1_000_000).toFixed(1) + "M"
  if (num >= 1_000) return "NGN " + (num / 1_000).toFixed(1) + "K"
  return "NGN " + num
}

export default function DashboardPage() {
  const { donations } = useDonations()
  const { user } = useAuth()

  const totalEarnings = donations.reduce((sum, donation) => sum + Number(donation.amount || 0), 0)
  const totalDonations = donations.length
  const uniqueDonors = new Set(donations.map((donation) => donation.senderName)).size
  const avgDonation = totalDonations > 0 ? Math.round(totalEarnings / totalDonations) : 0

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-zinc-500">Welcome back! Here{"'"}s your streaming overview.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatsCard
          title="Total Earnings"
          value={formatCurrency(totalEarnings)}
          subtitle="All time"
          icon={Wallet}
          variant="purple"
          trend={{ value: 12, isPositive: true }}
        />
        <StatsCard
          title="Total Donations"
          value={totalDonations}
          subtitle="This month"
          icon={Gift}
          variant="green"
          trend={{ value: 8, isPositive: true }}
        />
        <StatsCard
          title="Unique Donors"
          value={uniqueDonors}
          subtitle="All time"
          icon={Users}
          variant="amber"
        />
        <StatsCard
          title="Average Donation"
          value={formatCurrency(avgDonation)}
          subtitle="Per transaction"
          icon={TrendingUp}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <DonationsTable donations={donations} />
        </div>

        <div className="space-y-6">
          <VirtualAccountCard account={user?.virtualAccount || fallbackVirtualAccount} />
        </div>
      </div>
    </div>
  )
}
