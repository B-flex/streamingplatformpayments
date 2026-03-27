"use client"

import { motion } from "framer-motion"
import { getGiftCatalogItem, type CustomGiftDefinition } from "@/lib/custom-gifts"

function floatingPieces(gift: CustomGiftDefinition) {
  const catalogGift = getGiftCatalogItem(gift.name)

  if (catalogGift.name === "Airplane") {
    return (
      <>
        <motion.div
          className="absolute inset-x-4 top-7 h-10 rounded-full blur-2xl"
          style={{
            background: "linear-gradient(90deg, transparent, rgba(125,211,252,0.55), transparent)",
          }}
          animate={{ x: ["-8%", "8%", "-8%"], opacity: [0.3, 0.9, 0.3] }}
          transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute text-5xl"
          animate={{ x: [-70, 70, -70], y: [20, -8, 20], rotate: [-8, 2, -8] }}
          transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
        >
          {catalogGift.icon}
        </motion.div>
      </>
    )
  }

  if (catalogGift.name === "Universe") {
    return (
      <>
        <motion.div
          className="absolute h-28 w-28 rounded-full border border-white/15"
          style={{
            background:
              "conic-gradient(from 180deg, rgba(192,132,252,0.18), rgba(56,189,248,0.42), rgba(244,114,182,0.22), rgba(192,132,252,0.18))",
          }}
          animate={{ rotate: 360, scale: [0.9, 1.08, 0.9] }}
          transition={{
            rotate: { duration: 4.5, repeat: Infinity, ease: "linear" },
            scale: { duration: 2.2, repeat: Infinity, ease: "easeInOut" },
          }}
        />
        <motion.div
          className="absolute text-5xl"
          animate={{ scale: [1, 1.12, 1], rotate: [0, 7, -7, 0] }}
          transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
        >
          {catalogGift.icon}
        </motion.div>
      </>
    )
  }

  if (catalogGift.name === "Lion") {
    return (
      <>
        {Array.from({ length: 8 }).map((_, index) => (
          <motion.div
            key={`${gift.id}-mane-${index}`}
            className="absolute h-12 w-2 rounded-full bg-gradient-to-b from-amber-200 via-orange-400 to-transparent"
            style={{ rotate: `${index * 45}deg`, transformOrigin: "center 56px" }}
            animate={{ opacity: [0.25, 0.9, 0.25], scaleY: [0.55, 1.15, 0.55] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: index * 0.04, ease: "easeInOut" }}
          />
        ))}
        <motion.div
          className="absolute text-5xl"
          animate={{ scale: [1, 1.1, 1], y: [0, -5, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        >
          {catalogGift.icon}
        </motion.div>
      </>
    )
  }

  return (
    <>
      {Array.from({ length: 6 }).map((_, index) => (
        <motion.div
          key={`${gift.id}-spark-${index}`}
          className="absolute h-3 w-3 rounded-full"
          style={{
            background: index % 2 === 0 ? gift.accentMiddle : gift.accentEnd,
            boxShadow: `0 0 18px ${index % 2 === 0 ? gift.accentMiddle : gift.accentEnd}`,
          }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0.5, 1.1, 0.4],
            x: [0, -36 + index * 14],
            y: [0, -26 + (index % 3) * 18],
          }}
          transition={{ duration: 1.7, repeat: Infinity, delay: index * 0.06, ease: "easeOut" }}
        />
      ))}
      <motion.div
        className="absolute text-5xl"
        animate={{ scale: [1, 1.1, 1], rotate: [0, -6, 6, 0] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
      >
        {catalogGift.icon}
      </motion.div>
    </>
  )
}

export function GiftAnimationPreview({ gift }: { gift: CustomGiftDefinition }) {
  const catalogGift = getGiftCatalogItem(gift.name)

  return (
    <div className="relative flex h-28 w-full min-w-[160px] items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-zinc-950/80">
      <div
        className="absolute inset-0 opacity-80"
        style={{
          background: `radial-gradient(circle at center, ${gift.accentStart}33 0%, ${gift.accentMiddle}18 38%, transparent 72%)`,
        }}
      />
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.08),transparent_35%,rgba(255,255,255,0.04))]" />
      {floatingPieces(gift)}
      <div className="absolute bottom-2 left-2 right-2 rounded-xl border border-white/10 bg-black/35 px-2 py-1 backdrop-blur-md">
        <p className="truncate text-[10px] font-semibold uppercase tracking-[0.25em] text-white/65">
          {catalogGift.previewLabel}
        </p>
      </div>
    </div>
  )
}
