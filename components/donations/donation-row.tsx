"use client"

import { TableCell, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { DonorAvatar } from "@/components/donor-avatar"

export interface DonationRecord {
  id: string
  donorName: string
  amount: number
  date: Date
  status: "completed" | "pending" | "failed"
}

interface DonationRowProps {
  donation: DonationRecord
  isLargeDonation?: boolean
}

const statusConfig = {
  completed: {
    label: "Completed",
    className: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  },
  pending: {
    label: "Pending",
    className: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  },
  failed: {
    label: "Failed",
    className: "bg-red-500/20 text-red-400 border-red-500/30",
  },
}

export function DonationRow({ donation, isLargeDonation = false }: DonationRowProps) {
  const status = statusConfig[donation.status]

  return (
    <TableRow
      className={cn(
        "border-zinc-800 transition-colors",
        isLargeDonation && "bg-gradient-to-r from-purple-500/10 via-pink-500/5 to-transparent"
      )}
    >
      {/* Donor Name */}
      <TableCell className="font-medium text-white">
        <div className="flex items-center gap-3">
          <DonorAvatar
            name={donation.donorName || "Anonymous"}
            className={cn(
              "w-9 h-9 shrink-0",
              isLargeDonation && "shadow-lg shadow-amber-500/30"
            )}
          />
          <div className="flex flex-col">
            <span className={cn(isLargeDonation && "text-amber-300")}>
              {donation.donorName}
            </span>
            {isLargeDonation && (
              <span className="text-xs text-amber-500/70">Top Supporter</span>
            )}
          </div>
        </div>
      </TableCell>

      {/* Amount */}
      <TableCell>
        <span
          className={cn(
            "font-semibold",
            isLargeDonation
              ? "text-amber-400 text-lg"
              : "text-emerald-400"
          )}
        >
          ₦{(Number(donation.amount) || 0).toLocaleString()}
        </span>
      </TableCell>

      {/* Date */}
      <TableCell className="text-zinc-400">
        {format(donation.date, "MMM d, yyyy")}
        <span className="text-zinc-600 ml-2 text-xs">
          {format(donation.date, "HH:mm")}
        </span>
      </TableCell>

      {/* Status */}
      <TableCell>
        <Badge variant="outline" className={status.className}>
          {status.label}
        </Badge>
      </TableCell>
    </TableRow>
  )
}
