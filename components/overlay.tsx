"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import io from "socket.io-client"
import { motion } from "framer-motion"
import { Crown, Sparkles } from "lucide-react"
import { DonationAlert } from "./donation-alert"
import { Leaderboard, type Contributor } from "./leaderboard"
import { ProgressBar } from "./progress-bar"
import { useAuth } from "@/app/context/AuthContext"
import { useOverlaySettings } from "@/app/context/OverlaySettingsContext"
import { useOverlayCustomization } from "@/app/context/OverlayCustomizationContext"
import { useCustomGifts } from "@/app/context/CustomGiftsContext"
import { getGiftForAmount } from "@/lib/gifts"
import { getStoredSessionToken } from "@/lib/auth-client"
import type { OverlayAnchor, OverlayGradientConfig, PositionedOverlayObject } from "@/lib/overlay-customization"
import { cn } from "@/lib/utils"

interface Donation {
  id: string
  senderName: string
  amount: number
  timestamp: number
}

const previewDonations = [
  { senderName: "RoseStorm", amount: 15 },
  { senderName: "MoneyRainHQ", amount: 7500 },
  { senderName: "UniverseDrop", amount: 700000 },
]

type BrowserWindow = Window &
  typeof globalThis & {
    webkitAudioContext?: typeof AudioContext
  }

function getAudioContextClass() {
  if (typeof window === "undefined") {
    return null
  }

  const browserWindow = window as BrowserWindow
  return browserWindow.AudioContext || browserWindow.webkitAudioContext || null
}

function buildGiftChord(amount: number) {
  if (amount >= 700000) return [392, 523.25, 783.99]
  if (amount >= 220000) return [329.63, 493.88, 659.25]
  if (amount >= 15000) return [293.66, 440, 587.33]
  if (amount >= 1500) return [261.63, 392, 523.25]
  return [220, 329.63, 440]
}

function playApplauseNoise(context: AudioContext, startTime: number, duration: number) {
  const sampleRate = context.sampleRate
  const frameCount = Math.floor(sampleRate * duration)
  const buffer = context.createBuffer(1, frameCount, sampleRate)
  const channel = buffer.getChannelData(0)

  for (let i = 0; i < frameCount; i += 1) {
    const decay = 1 - i / frameCount
    channel[i] = (Math.random() * 2 - 1) * decay
  }

  const source = context.createBufferSource()
  const filter = context.createBiquadFilter()
  const gainNode = context.createGain()
  const tremolo = context.createOscillator()
  const tremoloDepth = context.createGain()

  source.buffer = buffer
  filter.type = "bandpass"
  filter.frequency.setValueAtTime(1800, startTime)
  filter.Q.setValueAtTime(0.8, startTime)

  tremolo.type = "square"
  tremolo.frequency.setValueAtTime(11, startTime)
  tremoloDepth.gain.setValueAtTime(0.035, startTime)

  gainNode.gain.setValueAtTime(0.0001, startTime)
  gainNode.gain.exponentialRampToValueAtTime(0.075, startTime + 0.04)
  gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + duration)

  tremolo.connect(tremoloDepth)
  tremoloDepth.connect(gainNode.gain)

  source.connect(filter)
  filter.connect(gainNode)
  gainNode.connect(context.destination)

  source.start(startTime)
  source.stop(startTime + duration)
  tremolo.start(startTime)
  tremolo.stop(startTime + duration)
}

function playImpactSweep(context: AudioContext, startTime: number, amount: number) {
  const oscillator = context.createOscillator()
  const gainNode = context.createGain()

  oscillator.type = amount >= 90000 ? "sawtooth" : "triangle"
  oscillator.frequency.setValueAtTime(amount >= 90000 ? 160 : 120, startTime)
  oscillator.frequency.exponentialRampToValueAtTime(amount >= 90000 ? 48 : 60, startTime + 0.7)

  gainNode.gain.setValueAtTime(0.0001, startTime)
  gainNode.gain.exponentialRampToValueAtTime(0.11, startTime + 0.03)
  gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.72)

  oscillator.connect(gainNode)
  gainNode.connect(context.destination)
  oscillator.start(startTime)
  oscillator.stop(startTime + 0.75)
}

function getAnchorClass(anchor: OverlayAnchor) {
  if (anchor === "top-left") return "left-6 top-6"
  if (anchor === "top-center") return "left-1/2 top-6 -translate-x-1/2"
  if (anchor === "top-right") return "right-6 top-6"
  if (anchor === "center") return "left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
  if (anchor === "bottom-left") return "bottom-6 left-6"
  if (anchor === "bottom-center") return "bottom-6 left-1/2 -translate-x-1/2"
  return "bottom-6 right-6"
}

function overlayPositionStyle(position: PositionedOverlayObject) {
  return {
    transform: `translate(${position.offsetX}px, ${position.offsetY}px)`,
  }
}

function overlayGradientStyle(gradient: OverlayGradientConfig) {
  return {
    background: `linear-gradient(135deg, ${gradient.start}, ${gradient.middle}, ${gradient.end})`,
  }
}

export default function Overlay() {
  type AlertDonation = {
    senderName: string
    amount: number
  }

  const { user } = useAuth()
  const { settings } = useOverlaySettings()
  const { customization } = useOverlayCustomization()
  const { customGifts } = useCustomGifts()
  const previewIndexRef = useRef(0)
  const previewStartedRef = useRef(false)
  const audioContextRef = useRef<AudioContext | null>(null)

  const [combo, setCombo] = useState({
    senderName: "",
    count: 0,
    lastTime: 0,
  })
  const [queue, setQueue] = useState<Donation[]>([])
  const [currentAlert, setCurrentAlert] = useState<AlertDonation | null>(null)
  const [showAlert, setShowAlert] = useState(false)
  const [contributors, setContributors] = useState<Contributor[]>([])
  const [totalDonations, setTotalDonations] = useState(0)

  const topSupporter = useMemo(
    () => [...contributors].sort((a, b) => b.amount - a.amount)[0] || null,
    [contributors],
  )

  const ensureAudioContext = useCallback(async () => {
    const AudioContextClass = getAudioContextClass()
    if (!AudioContextClass) {
      return null
    }

    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContextClass()
    }

    if (audioContextRef.current.state === "suspended") {
      try {
        await audioContextRef.current.resume()
      } catch {
        return audioContextRef.current
      }
    }

    return audioContextRef.current
  }, [])

  const playGiftSound = useCallback(
    async (amount: number) => {
      const context = await ensureAudioContext()
      if (!context || context.state !== "running") {
        return
      }

      const now = context.currentTime
      const notes = buildGiftChord(amount)

      notes.forEach((frequency, index) => {
        const oscillator = context.createOscillator()
        const gainNode = context.createGain()

        oscillator.type = amount >= 90000 ? "triangle" : "sine"
        oscillator.frequency.setValueAtTime(frequency, now + index * 0.08)

        gainNode.gain.setValueAtTime(0.0001, now + index * 0.08)
        gainNode.gain.exponentialRampToValueAtTime(0.12, now + index * 0.08 + 0.03)
        gainNode.gain.exponentialRampToValueAtTime(0.0001, now + index * 0.08 + 0.55)

        oscillator.connect(gainNode)
        gainNode.connect(context.destination)
        oscillator.start(now + index * 0.08)
        oscillator.stop(now + index * 0.08 + 0.58)
      })

      if (amount >= 5000) {
        playImpactSweep(context, now, amount)
        playApplauseNoise(context, now + 0.12, amount >= 90000 ? 1.8 : 1.2)
      }

      if (amount >= 15000) {
        const shimmer = context.createOscillator()
        const shimmerGain = context.createGain()

        shimmer.type = "triangle"
        shimmer.frequency.setValueAtTime(880, now + 0.18)
        shimmer.frequency.linearRampToValueAtTime(1320, now + 0.65)

        shimmerGain.gain.setValueAtTime(0.0001, now + 0.18)
        shimmerGain.gain.exponentialRampToValueAtTime(0.045, now + 0.24)
        shimmerGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.9)

        shimmer.connect(shimmerGain)
        shimmerGain.connect(context.destination)
        shimmer.start(now + 0.18)
        shimmer.stop(now + 0.92)
      }
    },
    [ensureAudioContext],
  )

  useEffect(() => {
    const unlock = () => {
      void ensureAudioContext()
    }

    window.addEventListener("pointerdown", unlock)
    window.addEventListener("keydown", unlock)

    return () => {
      window.removeEventListener("pointerdown", unlock)
      window.removeEventListener("keydown", unlock)
    }
  }, [ensureAudioContext])

  useEffect(() => {
    const previousBodyBackground = document.body.style.background
    const previousBodyOverflow = document.body.style.overflow
    const previousHtmlBackground = document.documentElement.style.background

    document.body.style.background = "transparent"
    document.body.style.overflow = "hidden"
    document.documentElement.style.background = "transparent"

    return () => {
      document.body.style.background = previousBodyBackground
      document.body.style.overflow = previousBodyOverflow
      document.documentElement.style.background = previousHtmlBackground
    }
  }, [])

  useEffect(() => {
    return () => {
      if (audioContextRef.current) {
        void audioContextRef.current.close()
      }
    }
  }, [])

  const processDonation = useCallback(
    (incoming: Omit<Donation, "id" | "timestamp">) => {
      const donation = {
        senderName: incoming.senderName || "Anonymous",
        amount: Number(incoming.amount) || 0,
      }

      const fullDonation: Donation = {
        ...donation,
        id: crypto.randomUUID(),
        timestamp: Date.now(),
      }

      if (settings.sounds) {
        void playGiftSound(fullDonation.amount)
      }

      setTotalDonations((current) => current + fullDonation.amount)
      setContributors((current) => {
        const match = current.find((contributor) => contributor.name === fullDonation.senderName)
        if (match) {
          return current.map((contributor) =>
            contributor.name === fullDonation.senderName
              ? { ...contributor, amount: contributor.amount + fullDonation.amount }
              : contributor,
          )
        }

        return [
          ...current,
          {
            id: crypto.randomUUID(),
            name: fullDonation.senderName,
            amount: fullDonation.amount,
          },
        ]
      })

      const now = Date.now()
      setCombo((current) => {
        if (current.senderName === fullDonation.senderName && now - current.lastTime < 5000) {
          return {
            senderName: current.senderName,
            count: current.count + 1,
            lastTime: now,
          }
        }

        return {
          senderName: fullDonation.senderName,
          count: 1,
          lastTime: now,
        }
      })

      if (settings.animations) {
        setQueue((current) => {
          if (fullDonation.amount >= 15000) {
            return [fullDonation, ...current]
          }

          return [...current, fullDonation]
        })
      }
    },
    [playGiftSound, settings.animations, settings.sounds],
  )

  useEffect(() => {
    const socket = io("http://localhost:5000", {
      auth: {
        sessionToken: getStoredSessionToken(),
      },
    })

    socket.on("newDonation", (data) => {
      processDonation({
        senderName: data.senderName || data.sender,
        amount: data.amount,
      })
    })

    return () => {
      socket.disconnect()
    }
  }, [processDonation])

  useEffect(() => {
    if (!settings.animations) {
      setQueue([])
      setCurrentAlert(null)
      setShowAlert(false)
    }
  }, [settings.animations])

  useEffect(() => {
    if (queue.length === 0 || showAlert) {
      return
    }

    const [nextDonation, ...rest] = queue
    setQueue(rest)
    setCurrentAlert(nextDonation)
    setShowAlert(true)
  }, [queue, showAlert])

  useEffect(() => {
    if (!showAlert || !currentAlert) {
      return
    }

    const gift = getGiftForAmount(currentAlert.amount, customGifts)
    const duration =
      gift.name === "Universe"
        ? 7600
        : gift.name === "Lion" || gift.name === "Planet" || gift.name === "Diamond Flight"
          ? 6200
          : currentAlert.amount >= 15000
            ? 5200
            : 3800

    const timer = window.setTimeout(() => {
      setShowAlert(false)
    }, duration)

    return () => window.clearTimeout(timer)
  }, [currentAlert, customGifts, showAlert])

  useEffect(() => {
    if (!settings.preview) {
      previewStartedRef.current = false
      return
    }

    const sendPreviewDonation = () => {
      const donation = previewDonations[previewIndexRef.current % previewDonations.length]
      previewIndexRef.current += 1
      processDonation(donation)
    }

    if (!previewStartedRef.current) {
      sendPreviewDonation()
      previewStartedRef.current = true
    }

    const timer = window.setInterval(sendPreviewDonation, 12000)
    return () => window.clearInterval(timer)
  }, [processDonation, settings.preview])

  return (
    <div className="fixed inset-0 overflow-hidden bg-transparent text-white">
      {customization.showAmbientScene ? (
        <div className="absolute inset-0">
          <div className="absolute left-[8%] top-[15%] h-40 w-40 rounded-full bg-fuchsia-400/12 blur-3xl" />
          <div className="absolute right-[10%] top-[10%] h-48 w-48 rounded-full bg-sky-400/12 blur-3xl" />
          <div className="absolute bottom-[12%] left-[16%] h-44 w-44 rounded-full bg-amber-300/10 blur-3xl" />

          {Array.from({ length: 16 }).map((_, index) => (
            <motion.div
              key={`ambient-orb-${index}`}
              className="absolute rounded-full bg-white/22"
              style={{
                height: index % 3 === 0 ? 5 : 3,
                width: index % 3 === 0 ? 5 : 3,
                left: `${6 + ((index * 11) % 86)}%`,
                top: `${8 + ((index * 7) % 76)}%`,
                boxShadow: "0 0 18px rgba(255,255,255,0.18)",
              }}
              animate={{ opacity: [0.18, 0.8, 0.18], y: [0, -10, 0] }}
              transition={{ duration: 3 + index * 0.18, repeat: Infinity, ease: "easeInOut" }}
            />
          ))}
        </div>
      ) : null}

      <div className="relative h-full p-6 lg:p-8">
        {customization.showGoal ? (
          <div
            className={cn(
              "absolute z-20 w-full max-w-3xl rounded-[28px] border border-white/14 px-5 py-4 shadow-[0_0_40px_rgba(34,211,238,0.08)] backdrop-blur-xl",
              getAnchorClass(customization.goalPosition.anchor),
            )}
            style={{
              ...overlayGradientStyle(customization.goalGradient),
              opacity: customization.goalOpacity,
              ...overlayPositionStyle(customization.goalPosition),
            }}
          >
            <div className="mb-3 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/65">
                  Stream Goal
                </p>
                <p className="text-lg font-bold text-white">{customization.goalTitle}</p>
              </div>
              {customization.showTopSupporter && topSupporter ? (
                <div className="inline-flex items-center gap-2 rounded-full border border-white/14 bg-black/15 px-4 py-2 text-sm text-white/88">
                  <Crown className="h-4 w-4 text-yellow-300" />
                  <span className="font-semibold">{topSupporter.name}</span>
                  <span className="text-white/60">leading</span>
                </div>
              ) : null}
            </div>

            <ProgressBar
              currentAmount={totalDonations}
              goalAmount={customization.goalAmount}
              title={customization.goalTitle}
            />
          </div>
        ) : null}

        {customization.showLeaderboard ? (
          <div
            className={cn(
              "absolute z-20 w-[320px]",
              getAnchorClass(customization.leaderboardPosition.anchor),
            )}
            style={overlayPositionStyle(customization.leaderboardPosition)}
          >
            <div
              className="rounded-[30px] p-[1px]"
              style={{
                ...overlayGradientStyle(customization.leaderboardGradient),
                opacity: customization.leaderboardOpacity,
              }}
            >
              <div className="rounded-[30px] bg-black/28 p-1 backdrop-blur-xl">
                <Leaderboard contributors={contributors} />
              </div>
            </div>
          </div>
        ) : null}

        {customization.showAccountDetails && user?.virtualAccount?.accountNumber ? (
          <div
            className={cn(
              "absolute z-20 w-[340px] rounded-[28px] border border-white/14 px-5 py-4 text-white shadow-[0_0_40px_rgba(0,0,0,0.12)] backdrop-blur-xl",
              getAnchorClass(customization.accountPosition.anchor),
            )}
            style={{
              ...overlayGradientStyle(customization.accountGradient),
              opacity: customization.accountOpacity,
              ...overlayPositionStyle(customization.accountPosition),
            }}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/65">
              Virtual Account
            </p>
            <p className="mt-2 text-lg font-bold text-white">
              {user.virtualAccount.accountName || user.name}
            </p>
            <p className="mt-2 font-mono text-2xl font-black tracking-[0.12em] text-white">
              {user.virtualAccount.accountNumber}
            </p>
            <div className="mt-2 flex items-center justify-between gap-3 text-sm text-white/85">
              <span>{user.virtualAccount.bankName || "Monnify"}</span>
              <span>{user.virtualAccount.provider || "Monnify"}</span>
            </div>
          </div>
        ) : null}

        <div className="relative flex h-full items-center justify-center">
          {currentAlert ? (
            <div
              className={cn(
                "absolute z-10",
                getAnchorClass(customization.alertPosition.anchor),
              )}
              style={overlayPositionStyle(customization.alertPosition)}
            >
              <DonationAlert
                senderName={currentAlert.senderName}
                amount={currentAlert.amount}
                comboCount={combo.count}
                isVisible={showAlert}
                giftPack={customization.giftPack}
                gradient={customization.alertGradient}
                customGifts={customGifts}
              />
            </div>
          ) : (
            <div className="pointer-events-none text-center">
              <motion.div
                animate={{ scale: [1, 1.06, 1], opacity: [0.5, 0.9, 0.5] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                className="mx-auto mb-5 flex h-28 w-28 items-center justify-center rounded-full border border-white/16 bg-white/8 backdrop-blur-md"
              >
                <Sparkles className="h-10 w-10 text-fuchsia-200" />
              </motion.div>
              <p className="text-sm font-semibold uppercase tracking-[0.36em] text-white/45">
                Live Gift Overlay
              </p>
              <p className="mt-2 text-2xl font-black text-white/85">
                Waiting for the next gift drop
              </p>
              <p className="mt-2 text-sm text-white/55">
                The stage stays live for OBS, combos, leaderboard, and goal tracking.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
