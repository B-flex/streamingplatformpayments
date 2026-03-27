"use client"

import { AnimatePresence, motion } from "framer-motion"
import { Crown, Sparkles } from "lucide-react"
import { getGiftForAmount, getGiftPackTheme } from "@/lib/gifts"
import type { CustomGiftDefinition, GiftAnimationType } from "@/lib/custom-gifts"
import type { GiftPackId, OverlayGradientConfig } from "@/lib/overlay-customization"

interface DonationAlertProps {
  senderName: string
  amount: number
  comboCount: number
  isVisible: boolean
  giftPack: GiftPackId
  gradient: OverlayGradientConfig
  customGifts?: CustomGiftDefinition[]
}

type PremiumScene = "lion" | "airplane" | "universe" | "vip"

function getSweepInitial(edge: "left" | "right" | "top" | "bottom") {
  if (edge === "left") return { x: -360, y: 0, rotate: -10 }
  if (edge === "right") return { x: 360, y: 0, rotate: 10 }
  if (edge === "top") return { x: 0, y: -260, rotate: -6 }
  return { x: 0, y: 260, rotate: 6 }
}

function getPremiumScene(
  giftName: string,
  amount: number,
  animationType?: GiftAnimationType,
): PremiumScene | null {
  if (giftName === "Universe" || animationType === "universe-rift") return "universe"
  if (giftName === "Lion" || animationType === "lion-roar") return "lion"
  if (giftName === "Airplane" || animationType === "airplane-flyover") return "airplane"
  if (animationType === "vip-spotlight") return "vip"
  if (amount > 20000) return "vip"
  return null
}

function getAnimationPreset(animationType?: GiftAnimationType) {
  switch (animationType) {
    case "heart-pulse":
      return { edge: "bottom" as const, particle: "heart", label: "Heart Pulse", fast: false }
    case "confetti-burst":
      return { edge: "top" as const, particle: "confetti", label: "Confetti Burst", fast: true }
    case "money-cannon":
      return { edge: "right" as const, particle: "money", label: "Money Cannon", fast: true }
    case "disco-spin":
      return { edge: "left" as const, particle: "disc", label: "Disco Spin", fast: false }
    case "mermaid-wave":
      return { edge: "left" as const, particle: "wave", label: "Mermaid Wave", fast: false }
    case "planet-orbit":
      return { edge: "right" as const, particle: "planet", label: "Planet Orbit", fast: false }
    case "diamond-storm":
      return { edge: "top" as const, particle: "diamond", label: "Diamond Storm", fast: true }
    case "starfall":
      return { edge: "top" as const, particle: "star", label: "Starfall", fast: true }
    case "neon-comet":
      return { edge: "left" as const, particle: "comet", label: "Neon Comet", fast: true }
    case "aurora-glow":
      return { edge: "bottom" as const, particle: "glow", label: "Aurora Glow", fast: false }
    case "thunder-drop":
      return { edge: "top" as const, particle: "thunder", label: "Thunder Drop", fast: true }
    case "bubble-pop":
      return { edge: "bottom" as const, particle: "bubble", label: "Bubble Pop", fast: false }
    case "pixel-party":
      return { edge: "left" as const, particle: "pixel", label: "Pixel Party", fast: true }
    case "meteor-rush":
      return { edge: "right" as const, particle: "meteor", label: "Meteor Rush", fast: true }
    case "laser-sweep":
      return { edge: "left" as const, particle: "laser", label: "Laser Sweep", fast: true }
    case "angel-wings":
      return { edge: "bottom" as const, particle: "wing", label: "Angel Wings", fast: false }
    case "petal-rain":
      return { edge: "top" as const, particle: "petal", label: "Petal Rain", fast: false }
    case "fire-crown":
      return { edge: "top" as const, particle: "flame", label: "Fire Crown", fast: true }
    case "ice-shards":
      return { edge: "right" as const, particle: "shard", label: "Ice Shards", fast: true }
    case "cosmic-ribbon":
      return { edge: "left" as const, particle: "ribbon", label: "Cosmic Ribbon", fast: false }
    case "golden-ring":
      return { edge: "top" as const, particle: "ring", label: "Golden Ring", fast: false }
    case "rocket-burst":
      return { edge: "bottom" as const, particle: "rocket", label: "Rocket Burst", fast: true }
    case "candy-pop":
      return { edge: "bottom" as const, particle: "candy", label: "Candy Pop", fast: false }
    case "halo-rise":
      return { edge: "bottom" as const, particle: "halo", label: "Halo Rise", fast: false }
    case "crown-wave":
      return { edge: "top" as const, particle: "crown", label: "Crown Wave", fast: false }
    case "rose-bloom":
    default:
      return { edge: "right" as const, particle: "petal", label: "Rose Bloom", fast: false }
  }
}

function PremiumBackdrop({
  accentA,
  accentB,
  accentC,
  isHugeGift,
}: {
  accentA: string
  accentB: string
  accentC: string
  isHugeGift: boolean
}) {
  return (
    <>
      <motion.div
        className="absolute h-[420px] w-[420px] rounded-full blur-3xl"
        style={{
          background: `radial-gradient(circle, ${accentA}40 0%, ${accentB}20 32%, transparent 72%)`,
        }}
        animate={{
          scale: [0.92, 1.12, 0.96],
          opacity: [0.4, 0.72, 0.4],
        }}
        transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        className="absolute h-[360px] w-[360px] rounded-full border border-white/12"
        style={{
          background: `conic-gradient(from 180deg, ${accentA}1c, ${accentB}40, ${accentC}1a, ${accentA}1c)`,
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: isHugeGift ? 5.2 : 8, repeat: Infinity, ease: "linear" }}
      />

      <motion.div
        className="absolute h-[300px] w-[300px] rounded-full border border-white/18"
        animate={{ rotate: -360, scale: [1, 1.06, 1] }}
        transition={{
          rotate: { duration: 10, repeat: Infinity, ease: "linear" },
          scale: { duration: 2.4, repeat: Infinity, ease: "easeInOut" },
        }}
      />
    </>
  )
}

function NamePlate({ displayName }: { displayName: string }) {
  return (
    <motion.p
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.12 }}
      className="mx-auto max-w-[520px] rounded-full border border-white/16 bg-black/28 px-6 py-3 text-3xl font-black text-white shadow-[0_0_30px_rgba(255,255,255,0.08)] backdrop-blur-md sm:text-4xl"
    >
      {displayName}
    </motion.p>
  )
}

function AmountLine({
  amount,
  accent,
}: {
  amount: number
  accent: string
}) {
  return (
    <motion.p
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.24 }}
      className="text-6xl font-black text-white"
      style={{ textShadow: `0 0 34px ${accent}` }}
    >
      NGN {amount.toLocaleString()}
    </motion.p>
  )
}

function ComboBadge({ comboCount }: { comboCount: number }) {
  if (comboCount <= 1) return null

  return (
    <motion.div
      initial={{ scale: 0.6, opacity: 0 }}
      animate={{ scale: [0.94, 1.1, 1], opacity: 1 }}
      transition={{ duration: 0.45, delay: 0.28 }}
      className="inline-flex items-center gap-3 rounded-full border border-yellow-300/25 bg-yellow-300/12 px-6 py-3 text-white shadow-[0_0_30px_rgba(250,204,21,0.18)] backdrop-blur-md"
    >
      <Crown className="h-5 w-5 text-yellow-200" />
      <span className="text-xl font-black">Combo x{comboCount}</span>
    </motion.div>
  )
}

function StandardGiftScene({
  gift,
  displayName,
  amount,
  comboCount,
  packLabel,
  accentA,
  accentB,
  accentC,
  isHugeGift,
}: {
  gift: ReturnType<typeof getGiftForAmount>
  displayName: string
  amount: number
  comboCount: number
  packLabel: string
  accentA: string
  accentB: string
  accentC: string
  isHugeGift: boolean
}) {
  const preset = getAnimationPreset(gift.animationType)
  const particleGlyph =
    preset.particle === "heart"
      ? "❤"
      : preset.particle === "diamond"
        ? "◆"
        : preset.particle === "star"
          ? "✦"
          : preset.particle === "thunder"
            ? "⚡"
            : preset.particle === "pixel"
              ? "■"
              : preset.particle === "laser"
                ? "▰"
                : preset.particle === "ring"
                  ? "◌"
                  : preset.particle === "rocket"
                    ? "⬆"
                    : preset.particle === "bubble"
                      ? "○"
                      : preset.particle === "crown"
                        ? "✦"
                        : gift.icon

  return (
    <>
      <PremiumBackdrop
        accentA={accentA}
        accentB={accentB}
        accentC={accentC}
        isHugeGift={isHugeGift}
      />

      {Array.from({ length: 18 }).map((_, index) => {
        const angle = (index / 18) * Math.PI * 2
        const radius = isHugeGift ? 190 : 150
        const x = Math.cos(angle) * radius
        const y = Math.sin(angle) * radius
        const accent = [accentA, accentB, accentC][index % 3]

        return (
          <motion.div
            key={`${gift.name}-trail-${index}`}
            className="absolute rounded-full"
            style={{
              width: index % 2 === 0 ? 12 : 8,
              height: index % 2 === 0 ? 12 : 8,
              background: accent,
              boxShadow: `0 0 24px ${accent}`,
            }}
            initial={{ opacity: 0, scale: 0.3, x: 0, y: 0 }}
            animate={{
              opacity: [0, 1, 0],
              scale: [0.3, 1, 0.35],
              x: [0, x, x * 1.15],
              y: [0, y, y * 1.15],
            }}
            transition={{
              duration: preset.fast ? 1.6 : isHugeGift ? 2.3 : 1.9,
              delay: index * 0.035,
              repeat: Infinity,
              ease: "easeOut",
            }}
          />
        )
      })}

      {gift.name === "Money Rain" ||
      gift.name === "Disco Ball" ||
      gift.name === "Diamond Flight" ||
      preset.fast
        ? Array.from({ length: 12 }).map((_, index) => (
            <motion.div
              key={`${gift.name}-shower-${index}`}
              className="absolute rounded-xl border border-white/20 bg-white/10 px-3 py-1 text-xs font-bold tracking-[0.2em] text-white/90 backdrop-blur-sm"
              initial={{
                opacity: 0,
                x: -140 + index * 16,
                y: -180,
                rotate: -18 + index * 4,
              }}
              animate={{
                opacity: [0, 1, 0],
                x: [-140 + index * 16, -60 + index * 14, 20 + index * 10],
                y: [-180, -20, 170],
                rotate: [-18 + index * 4, 10 + index * 2],
              }}
              transition={{
                duration: 2.3,
                delay: index * 0.06,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              {particleGlyph}
            </motion.div>
          ))
        : null}

      {isHugeGift
        ? Array.from({ length: 7 }).map((_, index) => (
            <motion.div
              key={`${gift.name}-wow-${index}`}
              className="absolute text-5xl"
              initial={{
                opacity: 0,
                scale: 0.2,
                x: 0,
                y: 0,
                rotate: -30 + index * 10,
              }}
              animate={{
                opacity: [0, 0.95, 0],
                scale: [0.2, 1.15, 0.55],
                x: [0, -220 + index * 70],
                y: [0, -180 + (index % 2) * 120],
                rotate: [-30 + index * 10, 20 + index * 6],
              }}
              transition={{
                duration: 1.9,
                delay: index * 0.08,
                repeat: Infinity,
                ease: "easeOut",
              }}
            >
              {particleGlyph}
            </motion.div>
          ))
        : null}

      <div className="relative flex max-w-[560px] flex-col items-center gap-5 text-center">
        <motion.div
          className="relative flex h-44 w-44 items-center justify-center rounded-full border border-white/20 bg-white/8 backdrop-blur-md"
          animate={{
            y: [0, -10, 0],
            scale: [1, 1.09, 1],
            boxShadow: [
              `0 0 28px ${accentA}44`,
              `0 0 78px ${accentB}80`,
              `0 0 28px ${accentA}44`,
            ],
          }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <motion.span
            className="relative z-10 text-8xl leading-none"
            animate={{
              rotate: [0, -8, 8, 0],
              scale: [1, 1.08, 1],
            }}
            transition={{ duration: 2.3, repeat: Infinity, ease: "easeInOut" }}
          >
            {gift.icon}
          </motion.span>
          <motion.div
            className="absolute inset-4 rounded-full"
            style={{
              background: `conic-gradient(from 180deg, ${accentA}33, ${accentB}55, ${accentC}33, ${accentA}33)`,
            }}
            animate={{ rotate: 360 }}
            transition={{ duration: 4.5, repeat: Infinity, ease: "linear" }}
          />
          <motion.div
            className="absolute -right-2 -top-2 flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-black/25 text-white shadow-[0_0_24px_rgba(255,255,255,0.18)] backdrop-blur-md"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          >
            <Sparkles className="h-5 w-5" />
          </motion.div>
        </motion.div>

        <div className="space-y-2">
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="text-sm font-semibold uppercase tracking-[0.38em] text-white/70"
          >
            {packLabel} • {preset.label}
          </motion.p>
          <NamePlate displayName={displayName} />
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.16 }}
            className="inline-flex items-center gap-3 rounded-full border border-white/18 bg-black/18 px-5 py-2 text-white/92 backdrop-blur-md"
          >
            <span className="text-3xl leading-none">{gift.icon}</span>
            <span className="text-xl font-bold">{gift.name}</span>
          </motion.div>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-white/82"
          >
            sent a gift worth
          </motion.p>
          <AmountLine amount={amount} accent={accentB} />
        </div>

        <ComboBadge comboCount={comboCount} />
      </div>
    </>
  )
}

function LionScene({
  displayName,
  amount,
  comboCount,
}: {
  displayName: string
  amount: number
  comboCount: number
}) {
  return (
    <>
      <motion.div
        className="absolute h-[520px] w-[520px] rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(251,191,36,0.35) 0%, rgba(249,115,22,0.14) 42%, transparent 72%)",
        }}
        animate={{ scale: [0.9, 1.16, 0.96], opacity: [0.42, 0.78, 0.42] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
      />

      {Array.from({ length: 16 }).map((_, index) => {
        const angle = (index / 16) * Math.PI * 2
        const x = Math.cos(angle) * 180
        const y = Math.sin(angle) * 180

        return (
          <motion.div
            key={`lion-flare-${index}`}
            className="absolute h-24 w-4 rounded-full bg-gradient-to-b from-yellow-200 via-amber-400 to-transparent"
            style={{ transformOrigin: "center 180px", rotate: `${(angle * 180) / Math.PI}deg` }}
            animate={{ opacity: [0.18, 0.92, 0.18], scaleY: [0.55, 1.25, 0.55], x, y }}
            transition={{ duration: 1.4, delay: index * 0.04, repeat: Infinity, ease: "easeInOut" }}
          />
        )
      })}

      {Array.from({ length: 10 }).map((_, index) => (
        <motion.div
          key={`lion-crown-${index}`}
          className="absolute text-5xl"
          initial={{ opacity: 0, x: 0, y: 0, scale: 0.3 }}
          animate={{
            opacity: [0, 1, 0],
            x: [0, -220 + index * 42],
            y: [0, -180 + (index % 2) * 90],
            scale: [0.3, 1.05, 0.45],
            rotate: [-12, 14],
          }}
          transition={{ duration: 1.8, delay: index * 0.06, repeat: Infinity, ease: "easeOut" }}
        >
          ✨
        </motion.div>
      ))}

      <div className="relative flex max-w-[620px] flex-col items-center gap-5 text-center">
        <motion.div
          className="relative flex h-52 w-52 items-center justify-center rounded-full border border-amber-200/22 bg-amber-200/8"
          animate={{
            scale: [1, 1.08, 1],
            rotate: [0, -3, 3, 0],
            boxShadow: [
              "0 0 40px rgba(251,191,36,0.28)",
              "0 0 110px rgba(249,115,22,0.65)",
              "0 0 40px rgba(251,191,36,0.28)",
            ],
          }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <motion.span
            className="text-[8rem] leading-none"
            animate={{ scale: [1, 1.06, 1], y: [0, -8, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          >
            🦁
          </motion.span>
          <motion.div
            className="absolute inset-3 rounded-full border border-amber-100/25"
            animate={{ rotate: 360 }}
            transition={{ duration: 7, repeat: Infinity, ease: "linear" }}
          />
        </motion.div>

        <div className="space-y-2">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="text-sm font-semibold uppercase tracking-[0.42em] text-amber-100/70"
          >
            Royal Entrance
          </motion.p>
          <NamePlate displayName={displayName} />
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.16 }}
            className="inline-flex items-center gap-3 rounded-full border border-amber-200/18 bg-amber-100/10 px-6 py-3 text-white backdrop-blur-md"
          >
            <span className="text-3xl">🦁</span>
            <span className="text-2xl font-black">Lion</span>
          </motion.div>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-amber-50/88"
          >
            unleashed a royal gift on the stream
          </motion.p>
          <AmountLine amount={amount} accent="rgba(251,191,36,0.85)" />
        </div>

        <ComboBadge comboCount={comboCount} />
      </div>
    </>
  )
}

function AirplaneScene({
  displayName,
  amount,
  comboCount,
}: {
  displayName: string
  amount: number
  comboCount: number
}) {
  return (
    <>
      <motion.div
        className="absolute inset-x-[-8%] top-[24%] h-32 rounded-full blur-3xl"
        style={{
          background:
            "linear-gradient(90deg, rgba(34,211,238,0.05), rgba(125,211,252,0.35), rgba(167,139,250,0.08))",
        }}
        animate={{ x: ["-10%", "10%", "-10%"], opacity: [0.28, 0.66, 0.28] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />

      {Array.from({ length: 7 }).map((_, index) => (
        <motion.div
          key={`airplane-cloud-${index}`}
          className="absolute rounded-full bg-white/16 blur-xl"
          style={{
            width: 110 - index * 8,
            height: 34 - index * 2,
            left: `${8 + index * 11}%`,
            top: `${18 + (index % 3) * 8}%`,
          }}
          animate={{ x: [0, 60, 0], opacity: [0.2, 0.45, 0.2] }}
          transition={{ duration: 5 + index * 0.4, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}

      <motion.div
        className="absolute text-[8rem]"
        initial={{ x: -520, y: 120, rotate: -8, scale: 0.8 }}
        animate={{ x: [520, 40, -140], y: [120, -60, -140], rotate: [-8, 0, 7], scale: [0.8, 1.1, 0.95] }}
        transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
      >
        ✈️
      </motion.div>

      {Array.from({ length: 14 }).map((_, index) => (
        <motion.div
          key={`airplane-trail-${index}`}
          className="absolute h-2 rounded-full bg-gradient-to-r from-white/0 via-cyan-200/70 to-white/0"
          style={{ width: 150, top: `${42 + index * 1.8}%`, left: `${16 + index * 2}%` }}
          animate={{ opacity: [0, 0.85, 0], x: [-120, 40, 120] }}
          transition={{ duration: 1.6, delay: index * 0.05, repeat: Infinity, ease: "easeOut" }}
        />
      ))}

      <div className="relative flex max-w-[620px] flex-col items-center gap-5 text-center">
        <motion.div
          className="rounded-full border border-sky-200/20 bg-sky-100/8 px-8 py-4 backdrop-blur-md"
          animate={{ scale: [1, 1.05, 1], boxShadow: ["0 0 25px rgba(56,189,248,0.18)", "0 0 60px rgba(56,189,248,0.45)", "0 0 25px rgba(56,189,248,0.18)"] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
        >
          <span className="text-sm font-semibold uppercase tracking-[0.42em] text-sky-100/78">
            Takeoff Scene
          </span>
        </motion.div>

        <NamePlate displayName={displayName} />

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.16 }}
          className="inline-flex items-center gap-3 rounded-full border border-sky-200/18 bg-sky-100/10 px-6 py-3 text-white backdrop-blur-md"
        >
          <span className="text-3xl">✈️</span>
          <span className="text-2xl font-black">Airplane</span>
        </motion.div>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-xl text-sky-50/88"
        >
          just flew a premium gift across your stream
        </motion.p>
        <AmountLine amount={amount} accent="rgba(56,189,248,0.85)" />

        <ComboBadge comboCount={comboCount} />
      </div>
    </>
  )
}

function UniverseScene({
  displayName,
  amount,
  comboCount,
}: {
  displayName: string
  amount: number
  comboCount: number
}) {
  return (
    <>
      <motion.div
        className="absolute h-[620px] w-[620px] rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(192,132,252,0.28) 0%, rgba(56,189,248,0.16) 28%, rgba(244,114,182,0.12) 46%, transparent 72%)",
        }}
        animate={{ scale: [0.88, 1.1, 0.94], opacity: [0.34, 0.8, 0.34] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        className="absolute h-[500px] w-[500px] rounded-full"
        style={{
          background:
            "conic-gradient(from 180deg, rgba(192,132,252,0.05), rgba(56,189,248,0.28), rgba(244,114,182,0.14), rgba(192,132,252,0.05))",
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 7, repeat: Infinity, ease: "linear" }}
      />

      <motion.div
        className="absolute h-[360px] w-[360px] rounded-full border border-fuchsia-200/18"
        animate={{ rotate: -360, scale: [1, 1.08, 1] }}
        transition={{
          rotate: { duration: 10, repeat: Infinity, ease: "linear" },
          scale: { duration: 2.6, repeat: Infinity, ease: "easeInOut" },
        }}
      />

      {Array.from({ length: 24 }).map((_, index) => {
        const angle = (index / 24) * Math.PI * 2
        const radius = 220
        const x = Math.cos(angle) * radius
        const y = Math.sin(angle) * radius

        return (
          <motion.div
            key={`universe-star-${index}`}
            className="absolute rounded-full"
            style={{
              width: index % 4 === 0 ? 14 : 8,
              height: index % 4 === 0 ? 14 : 8,
              background: index % 3 === 0 ? "#c084fc" : index % 3 === 1 ? "#7dd3fc" : "#f9a8d4",
              boxShadow:
                index % 3 === 0
                  ? "0 0 22px #c084fc"
                  : index % 3 === 1
                    ? "0 0 22px #7dd3fc"
                    : "0 0 22px #f9a8d4",
            }}
            initial={{ opacity: 0, scale: 0.25, x: 0, y: 0 }}
            animate={{
              opacity: [0, 1, 0],
              scale: [0.25, 1.1, 0.35],
              x: [0, x, x * 1.18],
              y: [0, y, y * 1.18],
            }}
            transition={{ duration: 2.5, delay: index * 0.03, repeat: Infinity, ease: "easeOut" }}
          />
        )
      })}

      <div className="relative flex max-w-[680px] flex-col items-center gap-5 text-center">
        <motion.div
          className="relative flex h-56 w-56 items-center justify-center rounded-full border border-fuchsia-200/18 bg-black/18 backdrop-blur-md"
          animate={{
            scale: [1, 1.08, 1],
            boxShadow: [
              "0 0 40px rgba(192,132,252,0.22)",
              "0 0 130px rgba(56,189,248,0.45)",
              "0 0 40px rgba(192,132,252,0.22)",
            ],
          }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <motion.span
            className="text-[8.5rem] leading-none"
            animate={{ rotate: [0, 6, -6, 0], scale: [1, 1.06, 1] }}
            transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
          >
            🌌
          </motion.span>
        </motion.div>

        <div className="space-y-2">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="text-sm font-semibold uppercase tracking-[0.5em] text-fuchsia-100/72"
          >
            Universe Drop
          </motion.p>
          <NamePlate displayName={displayName} />
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.16 }}
            className="inline-flex items-center gap-3 rounded-full border border-fuchsia-200/18 bg-fuchsia-100/10 px-6 py-3 text-white backdrop-blur-md"
          >
            <span className="text-3xl">🌌</span>
            <span className="text-2xl font-black">Universe</span>
          </motion.div>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-fuchsia-50/88"
          >
            opened a full-screen cosmic finale on your stream
          </motion.p>
          <AmountLine amount={amount} accent="rgba(192,132,252,0.9)" />
        </div>

        <ComboBadge comboCount={comboCount} />
      </div>
    </>
  )
}

function VipScene({
  gift,
  displayName,
  amount,
  comboCount,
}: {
  gift: ReturnType<typeof getGiftForAmount>
  displayName: string
  amount: number
  comboCount: number
}) {
  return (
    <>
      <motion.div
        className="absolute h-[560px] w-[560px] rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(250,204,21,0.22) 0%, rgba(16,185,129,0.14) 34%, rgba(255,255,255,0.04) 58%, transparent 74%)",
        }}
        animate={{ scale: [0.9, 1.12, 0.96], opacity: [0.28, 0.75, 0.28] }}
        transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
      />

      {Array.from({ length: 18 }).map((_, index) => (
        <motion.div
          key={`vip-shard-${index}`}
          className="absolute h-16 w-4 rounded-full bg-gradient-to-b from-yellow-200 via-emerald-300 to-transparent"
          style={{ rotate: `${index * 20}deg` }}
          initial={{ opacity: 0.2, scaleY: 0.4 }}
          animate={{ opacity: [0.2, 0.9, 0.2], scaleY: [0.4, 1.2, 0.4] }}
          transition={{ duration: 1.6, delay: index * 0.03, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}

      {Array.from({ length: 10 }).map((_, index) => (
        <motion.div
          key={`vip-diamond-${index}`}
          className="absolute text-4xl"
          initial={{ opacity: 0, scale: 0.2, x: 0, y: 0 }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0.2, 1, 0.5],
            x: [0, -220 + index * 46],
            y: [0, -180 + (index % 2) * 130],
            rotate: [-18, 18],
          }}
          transition={{ duration: 1.9, delay: index * 0.05, repeat: Infinity, ease: "easeOut" }}
        >
          💎
        </motion.div>
      ))}

      <div className="relative flex max-w-[640px] flex-col items-center gap-5 text-center">
        <motion.div
          className="relative flex h-52 w-52 items-center justify-center rounded-full border border-yellow-100/22 bg-yellow-100/8 backdrop-blur-md"
          animate={{
            scale: [1, 1.07, 1],
            boxShadow: [
              "0 0 30px rgba(250,204,21,0.2)",
              "0 0 100px rgba(16,185,129,0.45)",
              "0 0 30px rgba(250,204,21,0.2)",
            ],
          }}
          transition={{ duration: 2.1, repeat: Infinity, ease: "easeInOut" }}
        >
          <motion.span
            className="text-[8rem] leading-none"
            animate={{ scale: [1, 1.08, 1], rotate: [0, -6, 6, 0] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
          >
            {gift.icon}
          </motion.span>
        </motion.div>

        <div className="space-y-2">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="text-sm font-semibold uppercase tracking-[0.44em] text-yellow-100/75"
          >
            VIP Gift Drop
          </motion.p>
          <NamePlate displayName={displayName} />
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.16 }}
            className="inline-flex items-center gap-3 rounded-full border border-yellow-100/18 bg-yellow-100/10 px-6 py-3 text-white backdrop-blur-md"
          >
            <span className="text-3xl">{gift.icon}</span>
            <span className="text-2xl font-black">{gift.name}</span>
          </motion.div>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-yellow-50/88"
          >
            just triggered a premium spotlight moment
          </motion.p>
          <AmountLine amount={amount} accent="rgba(250,204,21,0.88)" />
        </div>

        <ComboBadge comboCount={comboCount} />
      </div>
    </>
  )
}

export function DonationAlert({
  senderName,
  amount,
  comboCount,
  isVisible,
  giftPack,
  gradient,
  customGifts,
}: DonationAlertProps) {
  const gift = getGiftForAmount(amount, customGifts)
  const packTheme = getGiftPackTheme(giftPack)
  const isHugeGift = amount >= 90000
  const initial = getSweepInitial(packTheme.edge)
  const accentA = gift.accentStart || gradient.start || packTheme.accents[0]
  const accentB = gift.accentMiddle || gradient.middle || packTheme.accents[1]
  const accentC = gift.accentEnd || gradient.end || packTheme.accents[2]
  const displayName = senderName.length > 20 ? `${senderName.slice(0, 20)}...` : senderName
  const premiumScene = getPremiumScene(gift.name, amount, gift.animationType)

  return (
    <AnimatePresence mode="wait">
      {isVisible ? (
        <motion.div
          key={`${giftPack}-${gift.name}-${senderName}-${amount}-${comboCount}`}
          initial={{ opacity: 0, ...initial, scale: 0.8 }}
          animate={{ opacity: 1, x: 0, y: 0, rotate: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 1.05, y: -20 }}
          transition={{ duration: 0.72, ease: [0.16, 1, 0.3, 1] }}
          className="pointer-events-none relative flex min-h-[540px] min-w-[540px] items-center justify-center"
        >
          {premiumScene === "lion" ? (
            <LionScene displayName={displayName} amount={amount} comboCount={comboCount} />
          ) : premiumScene === "airplane" ? (
            <AirplaneScene displayName={displayName} amount={amount} comboCount={comboCount} />
          ) : premiumScene === "universe" ? (
            <UniverseScene displayName={displayName} amount={amount} comboCount={comboCount} />
          ) : premiumScene === "vip" ? (
            <VipScene
              gift={gift}
              displayName={displayName}
              amount={amount}
              comboCount={comboCount}
            />
          ) : (
            <StandardGiftScene
              gift={gift}
              displayName={displayName}
              amount={amount}
              comboCount={comboCount}
              packLabel={packTheme.label}
              accentA={accentA}
              accentB={accentB}
              accentC={accentC}
              isHugeGift={isHugeGift}
            />
          )}
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
