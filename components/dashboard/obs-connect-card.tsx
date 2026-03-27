"use client"

import { Copy, MonitorPlay, RadioTower, Video } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const overlayUrl = "http://localhost:3000/overlay"

const steps = [
  "Open OBS and select the scene where you want StreamTip to appear.",
  "Under Sources, click the + button and choose Browser.",
  "Name it something like StreamTip Overlay and click OK.",
  "Paste the overlay URL below into the Browser Source URL field.",
  "Set Width to 1920 and Height to 1080, then keep the background transparent.",
  "Leave the source active in your scene so live gifts, goals, and leaderboard stay visible.",
]

export function ObsConnectCard() {
  return (
    <section className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/80">
      <div className="border-b border-zinc-800 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500">
            <MonitorPlay className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Connect to OBS</h3>
            <p className="mt-1 text-sm text-zinc-500">
              Exact browser-source setup for your live overlay.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-5 p-5">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4">
          <p className="text-sm font-medium text-white">Browser Source URL</p>
          <div className="mt-3 flex flex-col gap-3 lg:flex-row">
            <Input
              readOnly
              value={overlayUrl}
              className="border-zinc-700 bg-zinc-900 text-white"
            />
            <Button
              type="button"
              variant="outline"
              className="border-zinc-700 bg-zinc-950 text-white hover:bg-zinc-900"
              onClick={() => {
                void navigator.clipboard.writeText(overlayUrl)
              }}
            >
              <Copy className="h-4 w-4" />
              Copy URL
            </Button>
          </div>
        </div>

        <div className="grid gap-3">
          {steps.map((step, index) => (
            <div
              key={step}
              className="flex gap-4 rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-sm font-bold text-white">
                {index + 1}
              </div>
              <p className="pt-1 text-sm leading-6 text-zinc-300">{step}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4">
            <div className="flex items-center gap-2 text-sm font-medium text-white">
              <Video className="h-4 w-4 text-cyan-300" />
              Recommended OBS size
            </div>
            <p className="mt-2 text-sm text-zinc-400">
              Use `1920 x 1080` for full HD scenes. Match your canvas size if you stream at another resolution.
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4">
            <div className="flex items-center gap-2 text-sm font-medium text-white">
              <RadioTower className="h-4 w-4 text-emerald-300" />
              Same-machine note
            </div>
            <p className="mt-2 text-sm text-zinc-400">
              `localhost` works when OBS and StreamTip are on the same computer. If OBS is elsewhere, replace it with your PC&apos;s local IP.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
