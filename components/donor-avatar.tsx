"use client"

import { cn } from "@/lib/utils"

const avatarThemes = [
  {
    bg: "from-pink-400 via-rose-400 to-orange-300",
    ring: "ring-pink-300/40",
    emoji: "bunny",
  },
  {
    bg: "from-sky-400 via-cyan-300 to-teal-300",
    ring: "ring-cyan-300/40",
    emoji: "cat",
  },
  {
    bg: "from-violet-400 via-fuchsia-400 to-pink-300",
    ring: "ring-fuchsia-300/40",
    emoji: "bear",
  },
  {
    bg: "from-amber-300 via-yellow-300 to-orange-300",
    ring: "ring-amber-300/40",
    emoji: "fox",
  },
  {
    bg: "from-emerald-400 via-lime-300 to-yellow-200",
    ring: "ring-emerald-300/40",
    emoji: "frog",
  },
  {
    bg: "from-indigo-400 via-blue-400 to-sky-300",
    ring: "ring-blue-300/40",
    emoji: "panda",
  },
] as const

const emojiMap = {
  bunny: `
    <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="22" cy="16" rx="8" ry="16" fill="#fff4fb"/>
      <ellipse cx="42" cy="16" rx="8" ry="16" fill="#fff4fb"/>
      <ellipse cx="22" cy="18" rx="4" ry="11" fill="#ffb3d7"/>
      <ellipse cx="42" cy="18" rx="4" ry="11" fill="#ffb3d7"/>
      <circle cx="32" cy="37" r="18" fill="#fff9fd"/>
      <circle cx="25" cy="35" r="2.5" fill="#2d1b3d"/>
      <circle cx="39" cy="35" r="2.5" fill="#2d1b3d"/>
      <circle cx="32" cy="40" r="3" fill="#ff7eb6"/>
      <path d="M28 45c2 2 6 2 8 0" stroke="#2d1b3d" stroke-width="2.5" stroke-linecap="round" fill="none"/>
    </svg>
  `,
  cat: `
    <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <path d="M18 26 10 14l2 18" fill="#fff1d6"/>
      <path d="M46 26 54 14l-2 18" fill="#fff1d6"/>
      <circle cx="32" cy="36" r="18" fill="#fff8eb"/>
      <circle cx="25" cy="35" r="2.5" fill="#2a2340"/>
      <circle cx="39" cy="35" r="2.5" fill="#2a2340"/>
      <path d="M29 41h6l-3 4z" fill="#ff9aa2"/>
      <path d="M24 42h-8m8 4h-9m16-4h2m-2 4h3m6-4h8m-8 4h9m-16-4h-2m2 4h-3" stroke="#2a2340" stroke-width="2" stroke-linecap="round"/>
    </svg>
  `,
  bear: `
    <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <circle cx="18" cy="20" r="8" fill="#7b4b94"/>
      <circle cx="46" cy="20" r="8" fill="#7b4b94"/>
      <circle cx="32" cy="36" r="20" fill="#9f6cc2"/>
      <circle cx="32" cy="42" r="8" fill="#f9d9ec"/>
      <circle cx="25" cy="35" r="2.5" fill="#2b193d"/>
      <circle cx="39" cy="35" r="2.5" fill="#2b193d"/>
      <circle cx="32" cy="41" r="2.5" fill="#2b193d"/>
    </svg>
  `,
  fox: `
    <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <path d="M16 24 8 14l2 20" fill="#ffb14a"/>
      <path d="M48 24l8-10-2 20" fill="#ffb14a"/>
      <path d="M32 16c13 0 22 9 22 20S45 56 32 56 10 47 10 36s9-20 22-20Z" fill="#ff9f43"/>
      <path d="M20 42c3 6 21 6 24 0-4-4-8-6-12-6s-8 2-12 6Z" fill="#fff4e6"/>
      <circle cx="25" cy="34" r="2.5" fill="#2f1d12"/>
      <circle cx="39" cy="34" r="2.5" fill="#2f1d12"/>
      <circle cx="32" cy="40" r="2.5" fill="#2f1d12"/>
    </svg>
  `,
  frog: `
    <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <circle cx="22" cy="21" r="8" fill="#c7ff83"/>
      <circle cx="42" cy="21" r="8" fill="#c7ff83"/>
      <circle cx="32" cy="38" r="18" fill="#9be15d"/>
      <circle cx="22" cy="21" r="3" fill="#26331f"/>
      <circle cx="42" cy="21" r="3" fill="#26331f"/>
      <path d="M23 42c3 4 15 4 18 0" stroke="#26331f" stroke-width="2.5" stroke-linecap="round" fill="none"/>
      <circle cx="26" cy="35" r="2" fill="#26331f"/>
      <circle cx="38" cy="35" r="2" fill="#26331f"/>
    </svg>
  `,
  panda: `
    <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <circle cx="18" cy="18" r="8" fill="#1f2937"/>
      <circle cx="46" cy="18" r="8" fill="#1f2937"/>
      <circle cx="32" cy="36" r="20" fill="#f8fafc"/>
      <ellipse cx="24" cy="34" rx="6" ry="8" fill="#1f2937"/>
      <ellipse cx="40" cy="34" rx="6" ry="8" fill="#1f2937"/>
      <circle cx="25" cy="35" r="2.5" fill="#f8fafc"/>
      <circle cx="39" cy="35" r="2.5" fill="#f8fafc"/>
      <circle cx="32" cy="42" r="3" fill="#1f2937"/>
    </svg>
  `,
} as const

function hashName(name: string) {
  return Array.from(name).reduce((total, char) => total + char.charCodeAt(0), 0)
}

function svgToDataUri(svg: string) {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg.trim())}`
}

interface DonorAvatarProps {
  name: string
  className?: string
  imageClassName?: string
}

export function DonorAvatar({
  name,
  className,
  imageClassName,
}: DonorAvatarProps) {
  const safeName = name || "Anonymous"
  const theme = avatarThemes[hashName(safeName) % avatarThemes.length]
  const src = svgToDataUri(emojiMap[theme.emoji])

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-full bg-gradient-to-br p-[2px] shadow-[0_8px_20px_rgba(0,0,0,0.25)] ring-2",
        theme.bg,
        theme.ring,
        className,
      )}
      aria-hidden="true"
    >
      <div className="h-full w-full rounded-full bg-white/90 p-1 backdrop-blur-sm">
        <img
          src={src}
          alt=""
          className={cn("h-full w-full rounded-full object-cover", imageClassName)}
        />
      </div>
    </div>
  )
}
