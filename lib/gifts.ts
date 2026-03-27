import type { GiftPackId } from "@/lib/overlay-customization"
import {
  defaultCustomGifts,
  sanitizeCustomGifts,
  type CustomGiftDefinition,
  type GiftAnimationType,
} from "@/lib/custom-gifts"

export type GiftDefinition = {
  name: string
  icon: string
  coins: number
  naira: number
  animationType?: GiftAnimationType
  accentStart?: string
  accentMiddle?: string
  accentEnd?: string
}

export const gifts: GiftDefinition[] = [
  { name: "Rose", icon: "🌹", coins: 1, naira: 15 },
  { name: "Panda", icon: "🐼", coins: 5, naira: 75 },
  { name: "Perfume", icon: "💐", coins: 20, naira: 300 },
  { name: "I Love You", icon: "❤️", coins: 49, naira: 750 },
  { name: "Confetti", icon: "🎉", coins: 100, naira: 1500 },
  { name: "Sunglasses", icon: "😎", coins: 199, naira: 3000 },
  { name: "Money Rain", icon: "💸", coins: 500, naira: 7500 },
  { name: "Disco Ball", icon: "🪩", coins: 1000, naira: 15000 },
  { name: "Mermaid", icon: "🧜‍♀️", coins: 2988, naira: 45000 },
  { name: "Airplane", icon: "✈️", coins: 6000, naira: 90000 },
  { name: "Planet", icon: "🌍", coins: 15000, naira: 220000 },
  { name: "Diamond Flight", icon: "💎", coins: 18000, naira: 270000 },
  { name: "Lion", icon: "🦁", coins: 29999, naira: 450000 },
  { name: "Universe", icon: "🌌", coins: 44999, naira: 700000 },
]

export type GiftPackTheme = {
  id: GiftPackId
  label: string
  description: string
  accents: string[]
  edge: "left" | "right" | "top" | "bottom"
}

export const giftPackThemes: GiftPackTheme[] = [
  {
    id: "tiktok",
    label: "Live Gifts",
    description: "Closer to classic TikTok-style colorful gift energy.",
    accents: ["#f472b6", "#818cf8", "#38bdf8"],
    edge: "right",
  },
  {
    id: "cosmic",
    label: "Cosmic Stage",
    description: "Galaxy-heavy scenes with cool space tones and orbit trails.",
    accents: ["#22d3ee", "#a78bfa", "#f9a8d4"],
    edge: "left",
  },
  {
    id: "luxury",
    label: "Luxury VIP",
    description: "Premium gold, emerald, and jewel-toned gift presentation.",
    accents: ["#f59e0b", "#facc15", "#34d399"],
    edge: "top",
  },
]

export function getGiftForAmount(amount: number, customGiftDefinitions?: CustomGiftDefinition[]) {
  const numericAmount = Number(amount) || 0
  const customGifts = sanitizeCustomGifts(
    customGiftDefinitions && customGiftDefinitions.length > 0
      ? customGiftDefinitions
      : defaultCustomGifts,
  )

  const customGiftMatch = customGifts.find(
    (gift) => numericAmount >= gift.minAmount && numericAmount <= gift.maxAmount,
  )

  if (customGiftMatch) {
    return {
      name: customGiftMatch.name,
      icon: customGiftMatch.icon,
      coins: Math.max(1, Math.round(customGiftMatch.minAmount / 15)),
      naira: customGiftMatch.minAmount,
      animationType: customGiftMatch.animationType,
      accentStart: customGiftMatch.accentStart,
      accentMiddle: customGiftMatch.accentMiddle,
      accentEnd: customGiftMatch.accentEnd,
    }
  }

  let currentGift = gifts[0]

  for (const gift of gifts) {
    if (numericAmount >= gift.naira) {
      currentGift = gift
    } else {
      break
    }
  }

  return currentGift
}

export function getGiftPackTheme(giftPack: GiftPackId) {
  return giftPackThemes.find((theme) => theme.id === giftPack) || giftPackThemes[0]
}
