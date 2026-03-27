"use client"

import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { DonationRow, type DonationRecord } from "./donation-row"
import { Skeleton } from "@/components/ui/skeleton"
import { Inbox } from "lucide-react"

interface DonationTableProps {
  donations: DonationRecord[]
  isLoading?: boolean
  largeDonationThreshold?: number
}

function TableSkeleton() {
  return (
    <div className="space-y-3 p-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <Skeleton className="h-9 w-9 rounded-full bg-zinc-800" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-32 bg-zinc-800" />
            <Skeleton className="h-3 w-20 bg-zinc-800" />
          </div>
          <Skeleton className="h-4 w-24 bg-zinc-800" />
          <Skeleton className="h-4 w-24 bg-zinc-800" />
          <Skeleton className="h-6 w-20 rounded-full bg-zinc-800" />
        </div>
      ))}
    </div>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-16 h-16 rounded-full bg-zinc-800/50 flex items-center justify-center mb-4">
        <Inbox className="w-8 h-8 text-zinc-600" />
      </div>
      <h3 className="text-lg font-medium text-zinc-400 mb-2">No donations yet</h3>
      <p className="text-sm text-zinc-600 text-center max-w-sm">
        When you receive your first donation, it will appear here. Share your donation link to get started!
      </p>
    </div>
  )
}

export function DonationTable({
  donations,
  isLoading = false,
  largeDonationThreshold = 20000,
}: DonationTableProps) {
  if (isLoading) {
    return (
      <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl overflow-hidden">
        <TableSkeleton />
      </div>
    )
  }

  if (donations.length === 0) {
    return (
      <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl overflow-hidden">
        <EmptyState />
      </div>
    )
  }

  return (
    <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl overflow-hidden">
      <div className="overflow-x-auto dashboard-scrollbar">
        <Table>
          <TableHeader>
            <TableRow className="border-zinc-800 hover:bg-transparent">
              <TableHead className="text-zinc-500 w-[250px]">Donor Name</TableHead>
              <TableHead className="text-zinc-500 w-[150px]">Amount</TableHead>
              <TableHead className="text-zinc-500 w-[180px]">Date</TableHead>
              <TableHead className="text-zinc-500 w-[120px]">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {donations.map((donation, index) => (
              <DonationRow
                key={index}
                donation={donation}
                isLargeDonation={donation.amount >= largeDonationThreshold}
              />
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
