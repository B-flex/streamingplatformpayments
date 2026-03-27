"use client"

import { useEffect, useMemo, useState } from "react"
import { format } from "date-fns"
import { ArrowUpRight, CheckCircle2, ChevronDown, ChevronUp, Clock, XCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export interface Payout {
  _id: string
  amount: number
  status: "completed" | "pending" | "failed"
  bankName: string
  accountNumber: string
  createdAt: Date
  completedAt?: Date
}

interface PayoutsTableProps {
  payouts: Payout[]
  title?: string
  initialVisibleCount?: number
}

const statusConfig = {
  completed: {
    label: "Completed",
    icon: CheckCircle2,
    className: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  },
  pending: {
    label: "Pending",
    icon: Clock,
    className: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  },
  failed: {
    label: "Failed",
    icon: XCircle,
    className: "bg-red-500/20 text-red-400 border-red-500/30",
  },
} as const

function getPayoutStatus(status: Payout["status"] | string | undefined) {
  if (status === "completed" || status === "failed" || status === "pending") {
    return statusConfig[status]
  }

  return statusConfig.pending
}

export function PayoutsTable({
  payouts,
  title = "Recent Payouts",
  initialVisibleCount = 5,
}: PayoutsTableProps) {
  const [mounted, setMounted] = useState(false)
  const [showAll, setShowAll] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const sortedPayouts = useMemo(
    () =>
      [...payouts].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
    [payouts],
  )

  const visiblePayouts = showAll
    ? sortedPayouts
    : sortedPayouts.slice(0, initialVisibleCount)

  const hasOverflow = sortedPayouts.length > initialVisibleCount

  return (
    <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl overflow-hidden">
      <div className="flex items-center justify-between gap-3 p-6 border-b border-zinc-800">
        <div>
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <p className="mt-1 text-sm text-zinc-500">
            {sortedPayouts.length} payout{sortedPayouts.length === 1 ? "" : "s"} recorded
          </p>
        </div>

        {hasOverflow && (
          <button
            type="button"
            onClick={() => setShowAll((prev) => !prev)}
            className="inline-flex items-center gap-1 text-sm text-purple-400 hover:text-purple-300 transition-colors"
          >
            {showAll ? "Show less" : "View all"}
            {showAll ? <ChevronUp className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
          </button>
        )}
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-zinc-800 hover:bg-transparent">
              <TableHead className="text-zinc-400 font-medium">Amount</TableHead>
              <TableHead className="text-zinc-400 font-medium">Bank</TableHead>
              <TableHead className="text-zinc-400 font-medium">Account</TableHead>
              <TableHead className="text-zinc-400 font-medium">Date</TableHead>
              <TableHead className="text-zinc-400 font-medium">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visiblePayouts.length === 0 ? (
              <TableRow className="border-zinc-800">
                <TableCell colSpan={5} className="py-10 text-center text-zinc-500">
                  No payouts yet
                </TableCell>
              </TableRow>
            ) : (
              visiblePayouts.map((payout) => {
                const status = getPayoutStatus(payout.status)
                const StatusIcon = status.icon

                return (
                  <TableRow
                    key={payout._id}
                    className="border-zinc-800 hover:bg-zinc-800/50 transition-colors"
                  >
                    <TableCell className="font-semibold text-white">
                      NGN {(Number(payout.amount) || 0).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-zinc-300">{payout.bankName || "N/A"}</TableCell>
                    <TableCell className="text-zinc-400 font-mono text-sm">
                      ****{payout.accountNumber?.slice(-4) || "0000"}
                    </TableCell>
                    <TableCell className="text-zinc-400">
                      {mounted ? format(new Date(payout.createdAt), "MMM d, yyyy") : ""}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={status.className}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {status.label}
                      </Badge>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      {hasOverflow && showAll && (
        <div className="border-t border-zinc-800 px-6 py-4">
          <button
            type="button"
            onClick={() => setShowAll(false)}
            className="inline-flex items-center gap-1 text-sm text-zinc-400 hover:text-white transition-colors"
          >
            Show less
            <ChevronDown className="h-4 w-4 rotate-180" />
          </button>
        </div>
      )}
    </div>
  )
}
