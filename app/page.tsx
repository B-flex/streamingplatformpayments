"use client"

import Link from "next/link"
import {
  ArrowRight,
  BellRing,
  CreditCard,
  Globe2,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Wallet,
} from "lucide-react"
import { Button } from "@/components/ui/button"

const featureCards = [
  {
    title: "OBS-ready live gift overlays",
    description:
      "Run transparent browser-source overlays with premium gift scenes, goals, top gifters, sound, and scene customization.",
    icon: Sparkles,
  },
  {
    title: "Virtual account donations",
    description:
      "Provision Monnify reserved accounts for creators so supporters can transfer directly and still appear on stream.",
    icon: CreditCard,
  },
  {
    title: "Creator dashboard and payouts",
    description:
      "Track earnings, donation history, payout status, overlay settings, notifications, and stream goals in one place.",
    icon: Wallet,
  },
]

const steps = [
  "Create your creator account and get a reserved virtual account.",
  "Share your donation details and connect the overlay to OBS or your streaming setup.",
  "Receive donations live while StreamTip handles the alert experience, tracking, and payout dashboard.",
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(168,85,247,0.2),transparent_30%),linear-gradient(180deg,#09090f,#11111a_45%,#09090f)] text-white">
      <header className="border-b border-white/10 bg-black/10 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-lg font-black">StreamTip</p>
              <p className="text-xs uppercase tracking-[0.24em] text-white/45">
                Creator monetization
              </p>
            </div>
          </Link>

          <nav className="hidden items-center gap-6 text-sm text-white/70 md:flex">
            <Link href="/terms" className="transition-colors hover:text-white">
              Terms
            </Link>
            <Link href="/privacy" className="transition-colors hover:text-white">
              Privacy
            </Link>
            <Link href="/overlay" className="transition-colors hover:text-white">
              Overlay Demo
            </Link>
            <Link href="/login" className="transition-colors hover:text-white">
              Login
            </Link>
            <Link href="/register">
              <Button className="bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:opacity-90">
                Get Started
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      <main>
        <section className="mx-auto grid max-w-7xl gap-10 px-6 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:py-24">
          <div className="space-y-7">
            <div className="inline-flex items-center gap-2 rounded-full border border-purple-400/20 bg-purple-400/10 px-4 py-2 text-sm text-purple-100">
              <Globe2 className="h-4 w-4" />
              Designed for browser-source livestream workflows used by creators across TikTok LIVE, Twitch, YouTube, and similar platforms
            </div>

            <div className="space-y-5">
              <h1 className="max-w-3xl text-5xl font-black leading-[1.02] tracking-tight sm:text-6xl">
                Turn live support into a polished gift experience creators can actually monetize.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-white/70">
                StreamTip gives creators donation infrastructure, transparent live overlays, notification controls, goals, gifter leaderboards, and payout tracking in one professional workflow. Supporters send money, your stream reacts instantly, and your dashboard keeps the business side organized.
              </p>
              <p className="max-w-2xl text-sm leading-7 text-white/50">
                StreamTip is an independent creator tool and is not affiliated with, endorsed by, or sponsored by TikTok or ByteDance. Creators remain responsible for following the rules of any platform they stream on.
              </p>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row">
              <Link href="/register">
                <Button className="h-12 px-6 text-base bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:opacity-90">
                  Create creator account
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/login">
                <Button
                  variant="outline"
                  className="h-12 px-6 text-base border-zinc-700 bg-zinc-900/80 text-white hover:bg-zinc-800"
                >
                  Log in to dashboard
                </Button>
              </Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm uppercase tracking-[0.22em] text-white/45">Overlay</p>
                <p className="mt-2 text-xl font-bold">Gift-ready</p>
                <p className="mt-2 text-sm text-white/60">Premium animations, combos, placement tools, and OBS browser-source support.</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm uppercase tracking-[0.22em] text-white/45">Payments</p>
                <p className="mt-2 text-xl font-bold">Virtual account flow</p>
                <p className="mt-2 text-sm text-white/60">Creator registration provisions a reserved Monnify account for direct supporter transfers.</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm uppercase tracking-[0.22em] text-white/45">Revenue share</p>
                <p className="mt-2 text-xl font-bold">20% platform fee</p>
                <p className="mt-2 text-sm text-white/60">StreamTip retains 20% of creator earnings as the service fee for payment tooling and product access.</p>
              </div>
            </div>
          </div>

          <div className="rounded-[32px] border border-white/10 bg-white/5 p-6 shadow-[0_40px_100px_rgba(0,0,0,0.35)] backdrop-blur-xl">
            <div className="rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_top_right,rgba(244,114,182,0.18),transparent_40%),linear-gradient(180deg,rgba(15,23,42,0.95),rgba(17,24,39,0.95))] p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-white/45">Creator snapshot</p>
                  <p className="mt-2 text-3xl font-black">Live gift economy</p>
                </div>
                <div className="rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 p-3">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <p className="text-sm text-white/55">Average overlay reaction time</p>
                  <p className="mt-2 text-2xl font-black">Instant</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <p className="text-sm text-white/55">Creator tooling</p>
                  <p className="mt-2 text-2xl font-black">Dashboard + alerts</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <p className="text-sm text-white/55">Notification support</p>
                  <p className="mt-2 text-2xl font-black">Desktop + sound</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <p className="text-sm text-white/55">Platform fee</p>
                  <p className="mt-2 text-2xl font-black">20% of earnings</p>
                </div>
              </div>

              <div className="mt-6 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-4 text-sm leading-7 text-cyan-50/85">
                StreamTip is designed for creators who want more than a static tip jar. We combine donation collection, animated gift presentation, payout history, account details, overlay controls, and creator notifications into one workflow.
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 pb-10">
          <div className="grid gap-6 lg:grid-cols-3">
            {featureCards.map((feature) => (
              <div
                key={feature.title}
                className="rounded-[28px] border border-white/10 bg-white/5 p-6 backdrop-blur-xl"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500/80 to-pink-500/80">
                  <feature.icon className="h-5 w-5 text-white" />
                </div>
                <h2 className="mt-5 text-2xl font-bold">{feature.title}</h2>
                <p className="mt-3 text-white/65 leading-7">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto grid max-w-7xl gap-6 px-6 py-10 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-[28px] border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-white/10 p-3">
                <BellRing className="h-5 w-5 text-purple-200" />
              </div>
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-white/45">How it works</p>
                <h2 className="text-2xl font-bold">From registration to live donations</h2>
              </div>
            </div>

            <div className="mt-8 space-y-5">
              {steps.map((step, index) => (
                <div key={step} className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500 font-bold">
                    {index + 1}
                  </div>
                  <p className="pt-1 text-white/70 leading-7">{step}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-white/10 p-3">
                <ShieldCheck className="h-5 w-5 text-emerald-200" />
              </div>
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-white/45">Commercial terms</p>
                <h2 className="text-2xl font-bold">Clear creator economics</h2>
              </div>
            </div>

            <div className="mt-8 space-y-4 text-white/70 leading-7">
              <p>
                StreamTip retains a 20% fee from creator earnings generated through the platform. That fee supports the donation infrastructure, dashboard tooling, alert systems, product maintenance, and payout operations.
              </p>
              <p>
                You should review the full terms before signing up. The same 20% revenue share is stated again in our terms and conditions so creators understand the commercial model before using the service.
              </p>
              <p>
                StreamTip does not replace the platform rules of TikTok or any other livestreaming service. Creators must comply with community guidelines, branded content disclosure rules, intellectual property rules, and any platform-specific monetization requirements that apply to their content.
              </p>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link href="/terms">
                <Button
                  variant="outline"
                  className="border-zinc-700 bg-zinc-900/80 text-white hover:bg-zinc-800"
                >
                  Read terms and conditions
                </Button>
              </Link>
              <Link href="/privacy">
                <Button
                  variant="outline"
                  className="border-zinc-700 bg-zinc-900/80 text-white hover:bg-zinc-800"
                >
                  Read privacy policy
                </Button>
              </Link>
              <Link href="/register">
                <Button className="bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:opacity-90">
                  Start as creator
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 pb-16">
          <div className="rounded-[28px] border border-amber-400/15 bg-amber-400/10 p-6 text-sm leading-7 text-amber-50/90">
            Compliance note: StreamTip is built as an independent donation and overlay utility. It does not grant users permission to violate platform rules, impersonate TikTok or any other service, use protected logos without authorization, scrape platform data, or mislead supporters into believing StreamTip is an official platform feature.
          </div>
        </section>
      </main>
    </div>
  )
}
