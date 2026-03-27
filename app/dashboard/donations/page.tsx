"use client"

import { useState, useEffect, useMemo } from "react"
import { DonationTable } from "@/components/donations/donation-table"
import type { DonationRecord } from "@/components/donations/donation-row"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Search, Filter, TrendingUp, Wallet } from "lucide-react"
import { authRequest } from "@/lib/auth-client"

type StatusFilter = "all" | "completed" | "pending" | "failed"

export default function DonationsPage() {
  const [donations, setDonations] = useState<DonationRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")
  const [minAmount, setMinAmount] = useState("")
  const [maxAmount, setMaxAmount] = useState("")

  useEffect(() => {
    const fetchDonations = async () => {
      setIsLoading(true)
      try {
        const response = await authRequest("/donations")
        const data = await response.json()
        const formatted = (Array.isArray(data) ? data : []).map((d: any) => ({
          id: d._id,
          donorName: d.senderName || d.sender || "Anonymous",
          amount: Number(d.amount) || 0,
          date: new Date(d.createdAt || d.date || Date.now()),
          status: "completed" as const,
        }))

        setDonations(formatted)
      } catch (error) {
        console.error("Failed to fetch donations:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDonations()
  }, [])

  const filteredDonations = useMemo(() => {
    let result = [...donations]
    const parsedMin = minAmount === "" ? null : Number(minAmount)
    const parsedMax = maxAmount === "" ? null : Number(maxAmount)

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter((d) => d.donorName.toLowerCase().includes(query))
    }

    if (statusFilter !== "all") {
      result = result.filter((d) => d.status === statusFilter)
    }

    if (parsedMin !== null && !Number.isNaN(parsedMin)) {
      result = result.filter((d) => d.amount >= parsedMin)
    }

    if (parsedMax !== null && !Number.isNaN(parsedMax)) {
      result = result.filter((d) => d.amount <= parsedMax)
    }

    result.sort((a, b) => b.date.getTime() - a.date.getTime())
    return result
  }, [donations, maxAmount, minAmount, searchQuery, statusFilter])

  const stats = useMemo(() => {
    const total = donations.reduce((sum, d) => sum + (Number(d.amount) || 0), 0)
    const completed = donations.filter((d) => d.status === "completed").length
    return { total, completed, count: donations.length }
  }, [donations])

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-white">Donations</h1>
        <p className="text-zinc-500">View and manage all your donation history.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
            <Wallet className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <p className="text-sm text-zinc-500">Total Received</p>
            <p className="text-xl font-bold text-white">
              NGN {(Number(stats.total) || 0).toLocaleString()}
            </p>
          </div>
        </div>
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <p className="text-sm text-zinc-500">Completed</p>
            <p className="text-xl font-bold text-white">{stats.completed} donations</p>
          </div>
        </div>
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center">
            <Filter className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <p className="text-sm text-zinc-500">Showing</p>
            <p className="text-xl font-bold text-white">
              {filteredDonations.length} of {stats.count}
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col xl:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <Input
            placeholder="Search by donor name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-zinc-900/80 border-zinc-800 text-white placeholder:text-zinc-600 focus-visible:border-purple-500 focus-visible:ring-purple-500/20"
          />
        </div>

        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
          <SelectTrigger className="w-full xl:w-[160px] bg-zinc-900/80 border-zinc-800 text-white">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent className="bg-zinc-900 border-zinc-800">
            <SelectItem value="all" className="text-white focus:bg-zinc-800 focus:text-white">
              All Status
            </SelectItem>
            <SelectItem value="completed" className="text-white focus:bg-zinc-800 focus:text-white">
              Completed
            </SelectItem>
            <SelectItem value="pending" className="text-white focus:bg-zinc-800 focus:text-white">
              Pending
            </SelectItem>
            <SelectItem value="failed" className="text-white focus:bg-zinc-800 focus:text-white">
              Failed
            </SelectItem>
          </SelectContent>
        </Select>

        <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto">
          <Input
            type="number"
            min="0"
            inputMode="numeric"
            placeholder="Min amount"
            value={minAmount}
            onChange={(e) => setMinAmount(e.target.value)}
            className="w-full sm:w-[160px] bg-zinc-900/80 border-zinc-800 text-white placeholder:text-zinc-600 focus-visible:border-purple-500 focus-visible:ring-purple-500/20"
          />
          <Input
            type="number"
            min="0"
            inputMode="numeric"
            placeholder="Max amount"
            value={maxAmount}
            onChange={(e) => setMaxAmount(e.target.value)}
            className="w-full sm:w-[160px] bg-zinc-900/80 border-zinc-800 text-white placeholder:text-zinc-600 focus-visible:border-purple-500 focus-visible:ring-purple-500/20"
          />
        </div>
      </div>

      <DonationTable
        donations={filteredDonations}
        isLoading={isLoading}
        largeDonationThreshold={20000}
      />
    </div>
  )
}
