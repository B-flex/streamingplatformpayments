export type GiftAnimationType =
  | "rose-bloom"
  | "heart-pulse"
  | "confetti-burst"
  | "money-cannon"
  | "disco-spin"
  | "mermaid-wave"
  | "airplane-flyover"
  | "planet-orbit"
  | "diamond-storm"
  | "lion-roar"
  | "universe-rift"
  | "vip-spotlight"
  | "starfall"
  | "neon-comet"
  | "aurora-glow"
  | "thunder-drop"
  | "bubble-pop"
  | "pixel-party"
  | "meteor-rush"
  | "laser-sweep"
  | "angel-wings"
  | "petal-rain"
  | "fire-crown"
  | "ice-shards"
  | "cosmic-ribbon"
  | "golden-ring"
  | "rocket-burst"
  | "candy-pop"
  | "halo-rise"
  | "crown-wave"

export interface CustomGiftDefinition {
  id: string
  name: string
  icon: string
  minAmount: number
  maxAmount: number
  animationType: GiftAnimationType
  accentStart: string
  accentMiddle: string
  accentEnd: string
}

export const CUSTOM_GIFTS_STORAGE_KEY = "streamtip.custom.gifts"

export const giftAnimationOptions: Array<{
  id: GiftAnimationType
  label: string
  description: string
}> = [
  { id: "rose-bloom", label: "Rose Bloom", description: "Soft petals and floral glow." },
  { id: "heart-pulse", label: "Heart Pulse", description: "Romantic pulse with floating hearts." },
  { id: "confetti-burst", label: "Confetti Burst", description: "Color pop and celebration spray." },
  { id: "money-cannon", label: "Money Cannon", description: "Fast cash burst across screen." },
  { id: "disco-spin", label: "Disco Spin", description: "Club-like spin lights and sparkle." },
  { id: "mermaid-wave", label: "Mermaid Wave", description: "Ocean-like ribbons and glow." },
  { id: "airplane-flyover", label: "Airplane Flyover", description: "A full fly-in scene with trails." },
  { id: "planet-orbit", label: "Planet Orbit", description: "Orbiting particles and planetary motion." },
  { id: "diamond-storm", label: "Diamond Storm", description: "Luxury shard bursts and shine." },
  { id: "lion-roar", label: "Lion Roar", description: "Royal premium scene with dramatic energy." },
  { id: "universe-rift", label: "Universe Rift", description: "Cosmic finale with huge motion." },
  { id: "vip-spotlight", label: "VIP Spotlight", description: "High-value spotlight presentation." },
  { id: "starfall", label: "Starfall", description: "Falling stars and drifting sparkle." },
  { id: "neon-comet", label: "Neon Comet", description: "Comet streaks with neon trails." },
  { id: "aurora-glow", label: "Aurora Glow", description: "Smooth ribbon light waves." },
  { id: "thunder-drop", label: "Thunder Drop", description: "Electric impact and charge." },
  { id: "bubble-pop", label: "Bubble Pop", description: "Rounded popping bubbles." },
  { id: "pixel-party", label: "Pixel Party", description: "Retro blocks and arcade bursts." },
  { id: "meteor-rush", label: "Meteor Rush", description: "Fast diagonal meteor motion." },
  { id: "laser-sweep", label: "Laser Sweep", description: "Stage lasers and glowing lines." },
  { id: "angel-wings", label: "Angel Wings", description: "Soft wing-like reveal effect." },
  { id: "petal-rain", label: "Petal Rain", description: "Petals falling in layers." },
  { id: "fire-crown", label: "Fire Crown", description: "Hot flare ring and crown arcs." },
  { id: "ice-shards", label: "Ice Shards", description: "Cool crystalline shard burst." },
  { id: "cosmic-ribbon", label: "Cosmic Ribbon", description: "Ribbon-like orbit motion." },
  { id: "golden-ring", label: "Golden Ring", description: "Rich gold halo with glow." },
  { id: "rocket-burst", label: "Rocket Burst", description: "Lift-off style vertical punch." },
  { id: "candy-pop", label: "Candy Pop", description: "Playful bright bubble candy colors." },
  { id: "halo-rise", label: "Halo Rise", description: "Elevated halo reveal from below." },
  { id: "crown-wave", label: "Crown Wave", description: "Premium crest-like flowing wave." },
]

export const defaultCustomGifts: CustomGiftDefinition[] = [
  {
    id: "gift-rose",
    name: "Rose",
    icon: "🌹",
    minAmount: 1,
    maxAmount: 49,
    animationType: "rose-bloom",
    accentStart: "#fb7185",
    accentMiddle: "#f472b6",
    accentEnd: "#fda4af",
  },
  {
    id: "gift-panda",
    name: "Panda",
    icon: "🐼",
    minAmount: 50,
    maxAmount: 299,
    animationType: "bubble-pop",
    accentStart: "#60a5fa",
    accentMiddle: "#22d3ee",
    accentEnd: "#a5f3fc",
  },
  {
    id: "gift-perfume",
    name: "Perfume",
    icon: "💐",
    minAmount: 300,
    maxAmount: 999,
    animationType: "petal-rain",
    accentStart: "#f9a8d4",
    accentMiddle: "#c084fc",
    accentEnd: "#fbcfe8",
  },
  {
    id: "gift-confetti",
    name: "Confetti",
    icon: "🎉",
    minAmount: 1000,
    maxAmount: 4999,
    animationType: "confetti-burst",
    accentStart: "#f59e0b",
    accentMiddle: "#ec4899",
    accentEnd: "#38bdf8",
  },
  {
    id: "gift-money-rain",
    name: "Money Rain",
    icon: "💸",
    minAmount: 5000,
    maxAmount: 14999,
    animationType: "money-cannon",
    accentStart: "#4ade80",
    accentMiddle: "#22c55e",
    accentEnd: "#86efac",
  },
  {
    id: "gift-disco-ball",
    name: "Disco Ball",
    icon: "🪩",
    minAmount: 15000,
    maxAmount: 44999,
    animationType: "disco-spin",
    accentStart: "#818cf8",
    accentMiddle: "#c084fc",
    accentEnd: "#f472b6",
  },
  {
    id: "gift-airplane",
    name: "Airplane",
    icon: "✈️",
    minAmount: 45000,
    maxAmount: 149999,
    animationType: "airplane-flyover",
    accentStart: "#38bdf8",
    accentMiddle: "#60a5fa",
    accentEnd: "#a78bfa",
  },
  {
    id: "gift-lion",
    name: "Lion",
    icon: "🦁",
    minAmount: 150000,
    maxAmount: 449999,
    animationType: "lion-roar",
    accentStart: "#fbbf24",
    accentMiddle: "#f97316",
    accentEnd: "#fde68a",
  },
  {
    id: "gift-universe",
    name: "Universe",
    icon: "🌌",
    minAmount: 450000,
    maxAmount: 2000000,
    animationType: "universe-rift",
    accentStart: "#c084fc",
    accentMiddle: "#38bdf8",
    accentEnd: "#f472b6",
  },
]

function sanitizeHex(value: unknown, fallback: string) {
  return typeof value === "string" && /^#[0-9A-Fa-f]{6}$/.test(value) ? value : fallback
}

function sanitizeAnimationType(value: unknown, fallback: GiftAnimationType): GiftAnimationType {
  const found = giftAnimationOptions.find((option) => option.id === value)
  return found ? found.id : fallback
}

function sanitizeGift(value: unknown, fallback: CustomGiftDefinition, index: number): CustomGiftDefinition {
  if (!value || typeof value !== "object") {
    return {
      ...fallback,
      id: `${fallback.id}-${index}`,
    }
  }

  const candidate = value as Partial<Record<keyof CustomGiftDefinition, unknown>>
  const minAmount =
    typeof candidate.minAmount === "number" && Number.isFinite(candidate.minAmount)
      ? Math.max(1, Math.round(candidate.minAmount))
      : fallback.minAmount
  const maxAmount =
    typeof candidate.maxAmount === "number" && Number.isFinite(candidate.maxAmount)
      ? Math.max(minAmount, Math.round(candidate.maxAmount))
      : fallback.maxAmount

  return {
    id: typeof candidate.id === "string" && candidate.id.trim() ? candidate.id : `${fallback.id}-${index}`,
    name: typeof candidate.name === "string" && candidate.name.trim() ? candidate.name.trim() : fallback.name,
    icon: typeof candidate.icon === "string" && candidate.icon.trim() ? candidate.icon.trim() : fallback.icon,
    minAmount,
    maxAmount,
    animationType: sanitizeAnimationType(candidate.animationType, fallback.animationType),
    accentStart: sanitizeHex(candidate.accentStart, fallback.accentStart),
    accentMiddle: sanitizeHex(candidate.accentMiddle, fallback.accentMiddle),
    accentEnd: sanitizeHex(candidate.accentEnd, fallback.accentEnd),
  }
}

export function sanitizeCustomGifts(value: unknown): CustomGiftDefinition[] {
  if (!Array.isArray(value) || value.length === 0) {
    return defaultCustomGifts
  }

  return value
    .slice(0, 30)
    .map((gift, index) => sanitizeGift(gift, defaultCustomGifts[index % defaultCustomGifts.length], index))
    .sort((a, b) => a.minAmount - b.minAmount)
}

export function readStoredCustomGifts(): CustomGiftDefinition[] {
  if (typeof window === "undefined") {
    return defaultCustomGifts
  }

  try {
    const raw = window.localStorage.getItem(CUSTOM_GIFTS_STORAGE_KEY)
    if (!raw) {
      return defaultCustomGifts
    }

    return sanitizeCustomGifts(JSON.parse(raw))
  } catch {
    return defaultCustomGifts
  }
}

export function writeStoredCustomGifts(customGifts: CustomGiftDefinition[]) {
  if (typeof window === "undefined") {
    return
  }

  window.localStorage.setItem(CUSTOM_GIFTS_STORAGE_KEY, JSON.stringify(customGifts))
}

function createGiftId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID()
  }

  return `${Date.now()}-${Math.round(Math.random() * 1_000_000)}`
}

export function createEmptyCustomGift(): CustomGiftDefinition {
  return {
    id: `gift-${createGiftId()}`,
    name: "Custom Gift",
    icon: "✨",
    minAmount: 1000,
    maxAmount: 5000,
    animationType: "vip-spotlight",
    accentStart: "#8b5cf6",
    accentMiddle: "#ec4899",
    accentEnd: "#38bdf8",
  }
}
