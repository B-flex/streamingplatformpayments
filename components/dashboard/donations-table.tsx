"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatDistanceToNow } from "date-fns"
import { DonorAvatar } from "@/components/donor-avatar"

export interface Donation {
  _id: string
  sender?: string
  senderName?: string
  amount: number | string
  message?: string
  createdAt?: string | Date
}

interface DonationsTableProps {
  donations: Donation[]
  title?: string
  maxItems?: number
}

export function DonationsTable({
  donations,
  title = "Recent Donations",
  maxItems = 10,
}: DonationsTableProps) {
  const displayDonations = donations.slice(0, maxItems)

  const getTimeAgo = (createdAt: Donation["createdAt"]) => {
    if (!createdAt) return "Just now"

    const date = new Date(createdAt)
    if (Number.isNaN(date.getTime())) return "Just now"

    return formatDistanceToNow(date, { addSuffix: true })
  }

  return (
    <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-zinc-800">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
      </div>

      <div className="overflow-x-auto dashboard-scrollbar">
        <Table>
          <TableHeader>
            <TableRow className="border-zinc-800 hover:bg-transparent">
              <TableHead className="text-zinc-500">Donor</TableHead>
              <TableHead className="text-zinc-500">Amount</TableHead>
              <TableHead className="text-zinc-500 hidden sm:table-cell">Message</TableHead>
              <TableHead className="text-zinc-500 text-right">Time</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayDonations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-zinc-500 py-8">
                  No donations yet
                </TableCell>
              </TableRow>
            ) : (
              displayDonations.map((donation) => {
                const donorName = donation.senderName || donation.sender || "Anonymous"
                const amount = Number(donation.amount) || 0

                return (
                  <TableRow key={donation._id} className="border-zinc-800">
                    <TableCell className="font-medium text-white">
                      <div className="flex items-center gap-3">
                        <DonorAvatar name={donorName} className="h-9 w-9 shrink-0" />
                        <span>{donorName}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-emerald-400 font-semibold">
                        NGN {amount.toLocaleString()}
                      </span>
                    </TableCell>
                    <TableCell className="text-zinc-400 hidden sm:table-cell max-w-[200px] truncate">
                      {donation.message || "-"}
                    </TableCell>
                    <TableCell className="text-zinc-500 text-right">
                      {getTimeAgo(donation.createdAt)}
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
