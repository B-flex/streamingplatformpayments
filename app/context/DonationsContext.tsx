"use client"

import { createContext, useContext, useEffect, useState, type Dispatch, type ReactNode, type SetStateAction } from "react"
import { io } from "socket.io-client"
import { readStoredAppPreferences } from "@/lib/app-preferences"
import { emitNotificationFeedback } from "@/lib/notification-runtime"

type Donation = {
  _id: string
  amount: number | string
  sender?: string
  senderName?: string
  createdAt?: string | Date
}

type DonationsContextType = {
  donations: Donation[]
  setDonations: Dispatch<SetStateAction<Donation[]>>
}

const DonationsContext = createContext<DonationsContextType | null>(null)

const normalizeDonation = (donation: any): Donation => ({
  ...donation,
  senderName: donation.senderName || donation.sender || "Anonymous",
  sender: donation.sender || donation.senderName || "Anonymous",
  createdAt: donation.createdAt ? new Date(donation.createdAt) : donation.createdAt,
})

export const DonationsProvider = ({ children }: { children: ReactNode }) => {
  const [donations, setDonations] = useState<Donation[]>([])

  const maybeShowDonationNotification = (donation: Donation) => {
    if (typeof window === "undefined") {
      return
    }

    const preferences = readStoredAppPreferences()
    if (!preferences.donationNotifications) {
      return
    }

    const senderName = donation.senderName || "Anonymous"
    const amount = Number(donation.amount) || 0

    void emitNotificationFeedback("donation", preferences, {
      title: "New donation received",
      body: `${senderName} sent NGN ${amount.toLocaleString()}`,
      tag: `donation-${donation._id ?? senderName}-${amount}`,
    })
  }

  useEffect(() => {
    // fetch initial data
    fetch("http://localhost:5000/donations")
  .then(res => res.json())
  .then(data => {
    const fixed = data.map((d: any) => normalizeDonation(d))
    setDonations(fixed)
  })

    // socket connection
    const socket = io("http://localhost:5000")

    socket.on("newDonation", (data) => {
      const fixed = normalizeDonation(data)

      setDonations(prev => [fixed, ...prev])
      maybeShowDonationNotification(fixed)
    })

    return () => {socket.disconnect()}
  }, [])

  return (
    <DonationsContext.Provider value={{ donations, setDonations }}>
      {children}
    </DonationsContext.Provider>
  )
}

export const useDonations = () => {
  const context = useContext(DonationsContext)
  if (!context) throw new Error("useDonations must be used inside provider")
  return context
}
