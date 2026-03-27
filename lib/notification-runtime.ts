"use client"

import type { AppPreferences, NotificationSoundProfile } from "@/lib/app-preferences"

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
  eventType: NotificationEventType,
  profile: NotificationSoundProfile,
) {
  const context = await ensureAudioContext()
  if (!context || context.state !== "running") return

  const oscillator = context.createOscillator()
  const gainNode = context.createGain()
  const now = context.currentTime

  const profileFrequencies =
    profile === "bright"
      ? {
          donation: [740, 988],
          payout: [587, 784],
        }
      : {
          donation: [523.25, 659.25],
          payout: [440, 587.33],
        }

  const [startFrequency, endFrequency] = profileFrequencies[eventType]

  oscillator.type = profile === "bright" ? "triangle" : "sine"
  oscillator.frequency.setValueAtTime(startFrequency, now)
  oscillator.frequency.linearRampToValueAtTime(endFrequency, now + 0.22)

  gainNode.gain.setValueAtTime(0.0001, now)
  gainNode.gain.exponentialRampToValueAtTime(0.12, now + 0.03)
  gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.5)

  oscillator.connect(gainNode)
  gainNode.connect(context.destination)
  oscillator.start(now)
  oscillator.stop(now + 0.52)
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
    await playNotificationSound(eventType, preferences.soundProfile)
  }

  if (preferences.desktopNotifications && notificationDetails) {
    sendDesktopNotification(
      notificationDetails.title,
      notificationDetails.body,
      notificationDetails.tag,
    )
  }
}
