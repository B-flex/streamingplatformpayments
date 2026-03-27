import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import { AdminAuthProvider } from './context/AdminAuthContext'
import { AuthProvider } from './context/AuthContext'
import { DonationsProvider } from './context/DonationsContext'
import { OverlaySettingsProvider } from './context/OverlaySettingsContext'
import { AppPreferencesProvider } from './context/AppPreferencesContext'
import { OverlayCustomizationProvider } from './context/OverlayCustomizationContext'
import { CustomGiftsProvider } from './context/CustomGiftsContext'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'StreamTip - Donation Overlay & Dashboard',
  description: 'Live stream donation overlay and creator dashboard',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <AdminAuthProvider>
          <AuthProvider>
            <AppPreferencesProvider>
              <CustomGiftsProvider>
                <OverlayCustomizationProvider>
                  <OverlaySettingsProvider>
                    <DonationsProvider>
                      {children}
                    </DonationsProvider>
                  </OverlaySettingsProvider>
                </OverlayCustomizationProvider>
              </CustomGiftsProvider>
            </AppPreferencesProvider>
          </AuthProvider>
        </AdminAuthProvider>
        <Analytics />
      </body>
    </html>
  )
}
