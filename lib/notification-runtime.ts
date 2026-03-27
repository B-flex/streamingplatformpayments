"use client"

import type { AppPreferences, NotificationSoundId } from "@/lib/app-preferences"

type NotificationEventType = "donation" | "payout"

type BrowserWindow = Window &
  typeof globalThis & {
    webkitAudioContext?: typeof AudioContext
  }

let sharedAudioContext: AudioContext | null = null

function getAudioContextClass() {
  if (typeof window === "undefined") {
    return null
  }

  const browserWindow = window as BrowserWindow
  return browserWindow.AudioContext || browserWindow.webkitAudioContext || null
}

async function ensureAudioContext() {
  const AudioContextClass = getAudioContextClass()
  if (!AudioContextClass) return null

  if (!sharedAudioContext) {
    sharedAudioContext = new AudioContextClass()
  }

  if (sharedAudioContext.state === "suspended") {
    try {
      await sharedAudioContext.resume()
    } catch {
      return sharedAudioContext
    }
  }

  return sharedAudioContext
}

export async function unlockNotificationAudio() {
  await ensureAudioContext()
}

export async function playNotificationSound(
  soundId: NotificationSoundId,
) {
  const context = await ensureAudioContext()
  if (!context || context.state !== "running") return

  const now = context.currentTime
  const soundProfiles: Record<
    NotificationSoundId,
    { type: OscillatorType; frequencies: number[]; duration: number; applause?: boolean }
  > = {
    "soft-chime": { type: "sine", frequencies: [523.25, 659.25], duration: 0.52 },
    "bright-pop": { type: "triangle", frequencies: [740, 988], duration: 0.44 },
    "glass-bell": { type: "sine", frequencies: [880, 1174.66], duration: 0.56 },
    "warm-pluck": { type: "triangle", frequencies: [392, 523.25], duration: 0.42 },
    "neon-ping": { type: "square", frequencies: [660, 990], duration: 0.36 },
    "star-drop": { type: "sine", frequencies: [784, 659.25, 523.25], duration: 0.62 },
    "velvet-note": { type: "sine", frequencies: [349.23, 440], duration: 0.5 },
    "pulse-hit": { type: "sawtooth", frequencies: [523.25, 698.46], duration: 0.32 },
    "crystal-rise": { type: "triangle", frequencies: [587.33, 783.99, 1046.5], duration: 0.64 },
    "club-flash": { type: "square", frequencies: [659.25, 830.61], duration: 0.34 },
    "sunburst": { type: "triangle", frequencies: [493.88, 659.25, 987.77], duration: 0.58 },
    "arcade-win": { type: "square", frequencies: [523.25, 659.25, 783.99], duration: 0.54 },
    "money-drop": { type: "sawtooth", frequencies: [392, 587.33], duration: 0.48 },
    "royal-fanfare": { type: "triangle", frequencies: [392, 523.25, 783.99], duration: 0.68 },
    "cosmic-rise": { type: "sine", frequencies: [329.63, 493.88, 659.25], duration: 0.74 },
    "meteor-hit": { type: "sawtooth", frequencies: [698.46, 466.16], duration: 0.38 },
    "halo-bloom": { type: "sine", frequencies: [440, 659.25, 880], duration: 0.66 },
    "spark-rush": { type: "square", frequencies: [784, 1046.5], duration: 0.3 },
    "disco-tap": { type: "triangle", frequencies: [587.33, 880], duration: 0.4 },
    "angel-wave": { type: "sine", frequencies: [392, 523.25, 659.25], duration: 0.7 },
    "applause-room": { type: "triangle", frequencies: [440, 523.25], duration: 0.9, applause: true },
    "applause-stage": { type: "triangle", frequencies: [523.25, 659.25], duration: 1, applause: true },
    "applause-crowd": { type: "sawtooth", frequencies: [587.33, 739.99], duration: 1.05, applause: true },
    "applause-victory": { type: "triangle", frequencies: [659.25, 880, 1174.66], duration: 1.1, applause: true },
    "applause-ovation": { type: "sawtooth", frequencies: [523.25, 783.99, 1046.5], duration: 1.2, applause: true },
  }

  const selected = soundProfiles[soundId]

  selected.frequencies.forEach((frequency, index) => {
    const oscillator = context.createOscillator()
    const gainNode = context.createGain()
    const startTime = now + index * 0.08

    oscillator.type = selected.type
    oscillator.frequency.setValueAtTime(frequency, startTime)
    oscillator.frequency.linearRampToValueAtTime(frequency * 1.16, startTime + 0.18)

    gainNode.gain.setValueAtTime(0.0001, startTime)
    gainNode.gain.exponentialRampToValueAtTime(selected.applause ? 0.18 : 0.12, startTime + 0.03)
    gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + selected.duration)

    oscillator.connect(gainNode)
    gainNode.connect(context.destination)
    oscillator.start(startTime)
    oscillator.stop(startTime + selected.duration)
  })

  if (selected.applause) {
    const frameCount = Math.floor(context.sampleRate * 0.9)
    const buffer = context.createBuffer(1, frameCount, context.sampleRate)
    const channel = buffer.getChannelData(0)

    for (let i = 0; i < frameCount; i += 1) {
      const decay = 1 - i / frameCount
      channel[i] = (Math.random() * 2 - 1) * decay * 0.55
    }

    const source = context.createBufferSource()
    const gainNode = context.createGain()
    const filter = context.createBiquadFilter()

    source.buffer = buffer
    filter.type = "bandpass"
    filter.frequency.setValueAtTime(1800, now)
    gainNode.gain.setValueAtTime(0.0001, now)
    gainNode.gain.exponentialRampToValueAtTime(0.14, now + 0.04)
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.92)

    source.connect(filter)
    filter.connect(gainNode)
    gainNode.connect(context.destination)
    source.start(now + 0.06)
    source.stop(now + 0.98)
  }
}

export async function requestDesktopNotificationPermission() {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "denied" as NotificationPermission
  }

  if (window.Notification.permission === "default") {
    return window.Notification.requestPermission()
  }

  return window.Notification.permission
}

export function sendDesktopNotification(title: string, body: string, tag: string) {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return false
  }

  if (window.Notification.permission !== "granted") {
    return false
  }

  new window.Notification(title, {
    body,
    tag,
  })

  return true
}

export async function emitNotificationFeedback(
  eventType: NotificationEventType,
  preferences: AppPreferences,
  notificationDetails?: {
    title: string
    body: string
    tag: string
  },
) {
  if (preferences.notificationSounds) {
    const soundId =
      eventType === "donation" ? preferences.donationSound : preferences.payoutSound
    await playNotificationSound(soundId)
  }

  if (preferences.desktopNotifications && notificationDetails) {
    sendDesktopNotification(
      notificationDetails.title,
      notificationDetails.body,
      notificationDetails.tag,
    )
  }
}
