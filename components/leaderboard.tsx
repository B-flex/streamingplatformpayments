"use client"

import { motion } from "framer-motion"
import { Crown, Trophy } from "lucide-react"
import { DonorAvatar } from "@/components/donor-avatar"

export interface Contributor {
  id: string
  name: string
  amount: number
}

interface LeaderboardProps {
  contributors: Contributor[]
  title?: string
  maxItems?: number
}

export function Leaderboard({
  contributors,
  title = "Gift Leaderboard",
  maxItems = 5,
}: LeaderboardProps) {
  const sortedContributors = [...contributors]
    .filter((contributor) => contributor.amount > 0)
    .sort((a, b) => b.amount - a.amount)
    .slice(0, maxItems)

  return (
    <div className="rounded-[28px] border border-white/14 bg-black/22 p-4 shadow-[0_0_40px_rgba(79,70,229,0.16)] backdrop-blur-xl">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-violet-400/18 text-violet-100">
          <Trophy className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-white/55">
            Top Gifters
          </p>
          <h2 className="text-lg font-bold text-white">{title}</h2>
        </div>
      </div>

      <div className="space-y-3">
        {sortedContributors.length > 0 ? (
          sortedContributors.map((contributor, index) => (
            <motion.div
              key={contributor.id}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.06 }}
              className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/8 px-3 py-3"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-sm font-black text-white">
                {index === 0 ? <Crown className="h-4 w-4 text-yellow-300" /> : index + 1}
              </div>
              <DonorAvatar name={contributor.name} className="h-11 w-11 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-white">{contributor.name}</p>
                <p className="text-xs uppercase tracking-[0.18em] text-white/45">gifter</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-black text-cyan-200">
                  NGN {contributor.amount.toLocaleString()}
                </p>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="rounded-2xl border border-white/10 bg-white/6 p-5 text-center text-sm text-white/55">
            Waiting for the first live gift...
          </div>
        )}
      </div>
    </div>
  )
}
