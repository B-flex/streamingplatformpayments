"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Heart } from "lucide-react"
import { DonorAvatar } from "@/components/donor-avatar"

interface TopBarProps {
  latestDonor: { name: string; amount: number } | null
}

export function TopBar({ latestDonor }: TopBarProps) {
  return (
    <div className="flex items-center justify-center">
      <div className="relative px-8 py-3 rounded-full bg-black/60 backdrop-blur-xl border border-purple-500/30">
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-purple-500/20 blur-xl" />

        <div className="relative flex items-center gap-4">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <Heart className="h-5 w-5 text-pink-500 fill-pink-500" />
          </motion.div>

          <AnimatePresence mode="wait">
            {latestDonor ? (
              <motion.div
                key={`${latestDonor.name}-${latestDonor.amount}`}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                className="flex items-center gap-3"
              >
                <DonorAvatar name={latestDonor.name} className="h-10 w-10 shrink-0" />
                <span className="text-white font-medium">Latest:</span>
                <span className="text-purple-400 font-bold">{latestDonor.name}</span>
                <span className="text-white/50">donated</span>
                <span className="text-pink-400 font-bold">
                  NGN {latestDonor.amount.toLocaleString()}
                </span>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-white/60"
              >
                Waiting for donations...
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
