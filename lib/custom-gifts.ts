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

export type GiftCatalogItem = {
  name: string
  icon: string
  animationType: GiftAnimationType
  accentStart: string
  accentMiddle: string
  accentEnd: string
  previewLabel: string
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

export const giftCatalog: GiftCatalogItem[] = [
  {
    name: "Rose",
    icon: "🌹",
    animationType: "rose-bloom",
    accentStart: "#fb7185",
    accentMiddle: "#f472b6",
    accentEnd: "#fda4af",
    previewLabel: "Soft petal bloom",
  },
  {
    name: "Panda",
    icon: "🐼",
    animationType: "bubble-pop",
    accentStart: "#60a5fa",
    accentMiddle: "#22d3ee",
    accentEnd: "#a5f3fc",
    previewLabel: "Cute mascot bounce",
  },
  {
    name: "Perfume",
    icon: "💐",
    animationType: "petal-rain",
    accentStart: "#f9a8d4",
    accentMiddle: "#c084fc",
    accentEnd: "#fbcfe8",
    previewLabel: "Luxury bloom spray",
  },
  {
    name: "I Love You",
    icon: "❤️",
    animationType: "heart-pulse",
    accentStart: "#fb7185",
    accentMiddle: "#ef4444",
    accentEnd: "#fda4af",
    previewLabel: "Heart pulse scene",
  },
  {
    name: "Confetti",
    icon: "🎉",
    animationType: "confetti-burst",
    accentStart: "#f59e0b",
    accentMiddle: "#ec4899",
    accentEnd: "#38bdf8",
    previewLabel: "Celebration burst",
  },
  {
    name: "Sunglasses",
    icon: "😎",
    animationType: "laser-sweep",
    accentStart: "#facc15",
    accentMiddle: "#fb7185",
    accentEnd: "#38bdf8",
    previewLabel: "Cool neon sweep",
  },
  {
    name: "Money Rain",
    icon: "💸",
    animationType: "money-cannon",
    accentStart: "#4ade80",
    accentMiddle: "#22c55e",
    accentEnd: "#86efac",
    previewLabel: "Cash shower moment",
  },
  {
    name: "Disco Ball",
    icon: "🪩",
    animationType: "disco-spin",
    accentStart: "#818cf8",
    accentMiddle: "#c084fc",
    accentEnd: "#f472b6",
    previewLabel: "Club light spin",
  },
  {
    name: "Mermaid",
    icon: "🧜‍♀️",
    animationType: "mermaid-wave",
    accentStart: "#38bdf8",
    accentMiddle: "#2dd4bf",
    accentEnd: "#c084fc",
    previewLabel: "Ocean ribbon wave",
  },
  {
    name: "Airplane",
    icon: "✈️",
    animationType: "airplane-flyover",
    accentStart: "#38bdf8",
    accentMiddle: "#60a5fa",
    accentEnd: "#a78bfa",
    previewLabel: "Full flyover scene",
  },
  {
    name: "Planet",
    icon: "🌍",
    animationType: "planet-orbit",
    accentStart: "#34d399",
    accentMiddle: "#22d3ee",
    accentEnd: "#60a5fa",
    previewLabel: "Orbit ring stage",
  },
  {
    name: "Diamond Flight",
    icon: "💎",
    animationType: "diamond-storm",
    accentStart: "#93c5fd",
    accentMiddle: "#c084fc",
    accentEnd: "#e0f2fe",
    previewLabel: "Luxury crystal storm",
  },
  {
    name: "Lion",
    icon: "🦁",
    animationType: "lion-roar",
    accentStart: "#fbbf24",
    accentMiddle: "#f97316",
    accentEnd: "#fde68a",
    previewLabel: "Royal entrance scene",
  },
  {
    name: "Universe",
    icon: "🌌",
    animationType: "universe-rift",
    accentStart: "#c084fc",
    accentMiddle: "#38bdf8",
    accentEnd: "#f472b6",
    previewLabel: "Cosmic finale scene",
  },
  {
    name: "Starfall",
    icon: "🌠",
    animationType: "starfall",
    accentStart: "#fef08a",
    accentMiddle: "#60a5fa",
    accentEnd: "#c084fc",
    previewLabel: "Falling star shimmer",
  },
  {
    name: "Neon Comet",
    icon: "☄️",
    animationType: "neon-comet",
    accentStart: "#22d3ee",
    accentMiddle: "#818cf8",
    accentEnd: "#f472b6",
    previewLabel: "Neon trail rush",
  },
  {
    name: "Aurora",
    icon: "🌈",
    animationType: "aurora-glow",
    accentStart: "#22d3ee",
    accentMiddle: "#34d399",
    accentEnd: "#c084fc",
    previewLabel: "Smooth aurora wave",
  },
  {
    name: "Thunder Drop",
    icon: "⚡",
    animationType: "thunder-drop",
    accentStart: "#fde047",
    accentMiddle: "#60a5fa",
    accentEnd: "#a78bfa",
    previewLabel: "Electric impact scene",
  },
  {
    name: "Pixel Party",
    icon: "🕹️",
    animationType: "pixel-party",
    accentStart: "#f472b6",
    accentMiddle: "#60a5fa",
    accentEnd: "#4ade80",
    previewLabel: "Arcade burst vibe",
  },
  {
    name: "Meteor Rush",
    icon: "🪐",
    animationType: "meteor-rush",
    accentStart: "#fb7185",
    accentMiddle: "#f59e0b",
    accentEnd: "#fef08a",
    previewLabel: "Fast meteor streak",
  },
  {
    name: "Angel Wings",
    icon: "🪽",
    animationType: "angel-wings",
    accentStart: "#f8fafc",
    accentMiddle: "#cbd5e1",
    accentEnd: "#a5b4fc",
    previewLabel: "Soft wing reveal",
  },
  {
    name: "Fire Crown",
    icon: "👑",
    animationType: "fire-crown",
    accentStart: "#fb7185",
    accentMiddle: "#f97316",
    accentEnd: "#facc15",
    previewLabel: "Flaming crown flare",
  },
  {
    name: "Ice Shards",
    icon: "❄️",
    animationType: "ice-shards",
    accentStart: "#e0f2fe",
    accentMiddle: "#7dd3fc",
    accentEnd: "#93c5fd",
    previewLabel: "Crystal freeze burst",
  },
  {
    name: "Cosmic Ribbon",
    icon: "🛸",
    animationType: "cosmic-ribbon",
    accentStart: "#38bdf8",
    accentMiddle: "#a78bfa",
    accentEnd: "#f472b6",
    previewLabel: "Orbit ribbon flow",
  },
  {
    name: "Golden Ring",
    icon: "💍",
    animationType: "golden-ring",
    accentStart: "#fde68a",
    accentMiddle: "#fbbf24",
    accentEnd: "#f59e0b",
    previewLabel: "Gold halo moment",
  },
  {
    name: "Rocket Burst",
    icon: "🚀",
    animationType: "rocket-burst",
    accentStart: "#38bdf8",
    accentMiddle: "#818cf8",
    accentEnd: "#f472b6",
    previewLabel: "Vertical launch burst",
  },
  {
    name: "Candy Pop",
    icon: "🍭",
    animationType: "candy-pop",
    accentStart: "#fb7185",
    accentMiddle: "#f472b6",
    accentEnd: "#facc15",
    previewLabel: "Playful candy burst",
  },
  {
    name: "Halo Rise",
    icon: "😇",
    animationType: "halo-rise",
    accentStart: "#fef3c7",
    accentMiddle: "#fde68a",
    accentEnd: "#f8fafc",
    previewLabel: "Halo lift scene",
  },
  {
    name: "Crown Wave",
    icon: "👑",
    animationType: "crown-wave",
    accentStart: "#fbbf24",
    accentMiddle: "#f59e0b",
    accentEnd: "#f97316",
    previewLabel: "Royal crest wave",
  },
]

export const giftNameOptions = giftCatalog.map((gift) => gift.name)

export const defaultCustomGifts: CustomGiftDefinition[] = [
  { ...buildGiftDefinition("Rose"), id: "gift-rose", minAmount: 1, maxAmount: 49 },
  { ...buildGiftDefinition("Panda"), id: "gift-panda", minAmount: 50, maxAmount: 299 },
  { ...buildGiftDefinition("Perfume"), id: "gift-perfume", minAmount: 300, maxAmount: 999 },
  { ...buildGiftDefinition("Confetti"), id: "gift-confetti", minAmount: 1000, maxAmount: 4999 },
  { ...buildGiftDefinition("Money Rain"), id: "gift-money-rain", minAmount: 5000, maxAmount: 14999 },
  { ...buildGiftDefinition("Disco Ball"), id: "gift-disco-ball", minAmount: 15000, maxAmount: 44999 },
  { ...buildGiftDefinition("Airplane"), id: "gift-airplane", minAmount: 45000, maxAmount: 149999 },
  { ...buildGiftDefinition("Lion"), id: "gift-lion", minAmount: 150000, maxAmount: 449999 },
  { ...buildGiftDefinition("Universe"), id: "gift-universe", minAmount: 450000, maxAmount: 2000000 },
]

export function getGiftCatalogItem(name: string) {
  return giftCatalog.find((gift) => gift.name === name) || giftCatalog[0]
}

export function buildGiftDefinition(name: string, overrides?: Partial<CustomGiftDefinition>) {
  const catalogGift = getGiftCatalogItem(name)

  return {
    id: overrides?.id ?? `gift-${catalogGift.name.toLowerCase().replace(/\s+/g, "-")}`,
    name: catalogGift.name,
    icon: catalogGift.icon,
    minAmount: overrides?.minAmount ?? 1,
    maxAmount: overrides?.maxAmount ?? 5000,
    animationType: overrides?.animationType ?? catalogGift.animationType,
    accentStart: overrides?.accentStart ?? catalogGift.accentStart,
    accentMiddle: overrides?.accentMiddle ?? catalogGift.accentMiddle,
    accentEnd: overrides?.accentEnd ?? catalogGift.accentEnd,
  }
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
  const name =
    typeof candidate.name === "string" && candidate.name.trim() ? candidate.name.trim() : fallback.name
  const base = buildGiftDefinition(name, {
    id: typeof candidate.id === "string" && candidate.id.trim() ? candidate.id : `${fallback.id}-${index}`,
  })
  const minAmount =
    typeof candidate.minAmount === "number" && Number.isFinite(candidate.minAmount)
      ? Math.max(1, Math.round(candidate.minAmount))
      : fallback.minAmount
  const maxAmount =
    typeof candidate.maxAmount === "number" && Number.isFinite(candidate.maxAmount)
      ? Math.max(minAmount, Math.round(candidate.maxAmount))
      : fallback.maxAmount

  return {
    ...base,
    minAmount,
    maxAmount,
    animationType: sanitizeAnimationType(candidate.animationType, base.animationType),
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
  return buildGiftDefinition("Rose", {
    id: `gift-${createGiftId()}`,
    minAmount: 1000,
    maxAmount: 5000,
  })
}
