"use client"

import { BellRing, Layers3, Palette, SlidersHorizontal, Trophy } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import type {
  OverlayAnchor,
  OverlayCustomization,
  OverlayGradientConfig,
  PositionedOverlayObject,
  StreamPlatformId,
} from "@/lib/overlay-customization"

const platformPreviews: Array<{
  id: StreamPlatformId
  label: string
  chrome: string
  description: string
}> = [
  {
    id: "tiktok",
    label: "Vertical Live Layout",
    chrome: "from-pink-500/20 via-black to-cyan-500/20",
    description: "Vertical-first preview with compact safe zones and stacked stream elements.",
  },
  {
    id: "twitch",
    label: "Wide Chat Layout",
    chrome: "from-violet-500/20 via-black to-indigo-500/20",
    description: "Wide preview with space for side content and community panels.",
  },
  {
    id: "youtube",
    label: "Video Platform Layout",
    chrome: "from-rose-500/20 via-black to-orange-400/20",
    description: "Balanced widescreen preview for long-form livestream viewing.",
  },
  {
    id: "kick",
    label: "High Contrast Layout",
    chrome: "from-emerald-500/20 via-black to-lime-500/20",
    description: "Bold, high-contrast preview with room for gifts, goals, and ranking panels.",
  },
]

const overlayAnchors: Array<{ id: OverlayAnchor; label: string }> = [
  { id: "top-left", label: "Top Left" },
  { id: "top-center", label: "Top Center" },
  { id: "top-right", label: "Top Right" },
  { id: "center", label: "Center" },
  { id: "bottom-left", label: "Bottom Left" },
  { id: "bottom-center", label: "Bottom Center" },
  { id: "bottom-right", label: "Bottom Right" },
]

function getAnchorClass(anchor: OverlayAnchor) {
  if (anchor === "top-left") return "left-6 top-6"
  if (anchor === "top-center") return "left-1/2 top-6 -translate-x-1/2"
  if (anchor === "top-right") return "right-6 top-6"
  if (anchor === "center") return "left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
  if (anchor === "bottom-left") return "bottom-6 left-6"
  if (anchor === "bottom-center") return "bottom-6 left-1/2 -translate-x-1/2"
  return "bottom-6 right-6"
}

function gradientStyle(gradient: OverlayGradientConfig) {
  return {
    background: `linear-gradient(135deg, ${gradient.start}, ${gradient.middle}, ${gradient.end})`,
  }
}

function PlacementCard({
  title,
  position,
  onAnchorChange,
  onOffsetChange,
}: {
  title: string
  position: PositionedOverlayObject
  onAnchorChange: (anchor: OverlayAnchor) => void
  onOffsetChange: (axis: "offsetX" | "offsetY", value: number) => void
}) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4">
      <p className="text-sm font-semibold text-white">{title}</p>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {overlayAnchors.map((anchor) => (
          <button
            key={anchor.id}
            type="button"
            onClick={() => onAnchorChange(anchor.id)}
            className={cn(
              "rounded-xl border px-3 py-2 text-sm transition-colors",
              position.anchor === anchor.id
                ? "border-purple-500/40 bg-purple-500/10 text-white"
                : "border-zinc-800 bg-zinc-900 text-zinc-400 hover:bg-zinc-800",
            )}
          >
            {anchor.label}
          </button>
        ))}
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-xs uppercase tracking-[0.2em] text-zinc-500">Horizontal Offset</label>
          <input
            type="range"
            min={-180}
            max={180}
            step={2}
            value={position.offsetX}
            onChange={(event) => onOffsetChange("offsetX", Number(event.target.value))}
            className="w-full"
          />
          <p className="text-sm text-zinc-400">{position.offsetX}px</p>
        </div>
        <div className="space-y-2">
          <label className="text-xs uppercase tracking-[0.2em] text-zinc-500">Vertical Offset</label>
          <input
            type="range"
            min={-180}
            max={180}
            step={2}
            value={position.offsetY}
            onChange={(event) => onOffsetChange("offsetY", Number(event.target.value))}
            className="w-full"
          />
          <p className="text-sm text-zinc-400">{position.offsetY}px</p>
        </div>
      </div>
    </div>
  )
}

function GradientEditor({
  label,
  gradient,
  onChange,
}: {
  label: string
  gradient: OverlayGradientConfig
  onChange: (key: keyof OverlayGradientConfig, value: string) => void
}) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4">
      <p className="text-sm font-semibold text-white">{label}</p>
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        {(["start", "middle", "end"] as Array<keyof OverlayGradientConfig>).map((stop) => (
          <label key={stop} className="space-y-2">
            <span className="text-xs uppercase tracking-[0.18em] text-zinc-500">{stop}</span>
            <div className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2">
              <input
                type="color"
                value={gradient[stop]}
                onChange={(event) => onChange(stop, event.target.value)}
                className="h-10 w-10 rounded border-none bg-transparent"
              />
              <Input
                value={gradient[stop]}
                onChange={(event) => onChange(stop, event.target.value)}
                className="border-none bg-transparent p-0 text-white shadow-none"
              />
            </div>
          </label>
        ))}
      </div>
    </div>
  )
}

function OpacityCard({
  title,
  value,
  onChange,
}: {
  title: string
  value: number
  onChange: (value: number) => void
}) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-white">{title}</p>
        <span className="text-sm text-zinc-400">{Math.round(value * 100)}%</span>
      </div>
      <div className="mt-4 space-y-2">
        <input
          type="range"
          min={15}
          max={100}
          step={1}
          value={Math.round(value * 100)}
          onChange={(event) => onChange(Number(event.target.value) / 100)}
          className="w-full"
        />
        <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
          Lower values make the panel more transparent on stream.
        </p>
      </div>
    </div>
  )
}

export function OverlaySceneEditor({
  customization,
  updateCustomization,
}: {
  customization: OverlayCustomization
  updateCustomization: <K extends keyof OverlayCustomization>(
    key: K,
    value: OverlayCustomization[K],
  ) => void
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/80">
      <div className="border-b border-zinc-800 px-6 py-4">
        <h2 className="text-lg font-semibold text-white">Scene Builder</h2>
        <p className="mt-1 text-sm text-zinc-500">
          Preview your overlay on different platforms, choose where each object sits, and style it with your own gradients.
        </p>
      </div>

      <div className="space-y-6 p-6">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-zinc-300">
            <Layers3 className="h-4 w-4 text-zinc-500" />
            Stream Preview Presets
          </div>
          <div className="grid gap-3 lg:grid-cols-4">
            {platformPreviews.map((platform) => (
              <button
                key={platform.id}
                type="button"
                onClick={() => updateCustomization("previewPlatform", platform.id)}
                className={cn(
                  "rounded-2xl border p-4 text-left transition-all",
                  customization.previewPlatform === platform.id
                    ? "border-purple-500/40 bg-purple-500/10"
                    : "border-zinc-800 bg-zinc-950/70 hover:border-zinc-700",
                )}
              >
                <div className={cn("mb-3 h-14 rounded-xl bg-gradient-to-br", platform.chrome)} />
                <p className="font-semibold text-white">{platform.label}</p>
                <p className="mt-1 text-sm text-zinc-500">{platform.description}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-[28px] border border-zinc-800 bg-zinc-950/70 p-4">
          <div className={cn("relative aspect-video overflow-hidden rounded-[24px] border border-white/10 bg-gradient-to-br", platformPreviews.find((platform) => platform.id === customization.previewPlatform)?.chrome)}>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.18),transparent_38%),linear-gradient(180deg,rgba(255,255,255,0.02),rgba(0,0,0,0.45))]" />

            {customization.showGoal ? (
              <div
                className={cn("absolute w-[42%] rounded-2xl border border-white/14 px-4 py-3 text-white shadow-[0_0_30px_rgba(0,0,0,0.18)]", getAnchorClass(customization.goalPosition.anchor))}
                style={{
                  ...gradientStyle(customization.goalGradient),
                  opacity: customization.goalOpacity,
                  transform: `translate(${customization.goalPosition.offsetX}px, ${customization.goalPosition.offsetY}px)`,
                }}
              >
                <p className="text-xs uppercase tracking-[0.24em] text-white/70">Live Goal</p>
                <p className="text-lg font-bold">{customization.goalTitle}</p>
              </div>
            ) : null}

            {customization.showLeaderboard ? (
              <div
                className={cn("absolute w-[28%] rounded-2xl border border-white/14 px-4 py-4 text-white shadow-[0_0_30px_rgba(0,0,0,0.18)]", getAnchorClass(customization.leaderboardPosition.anchor))}
                style={{
                  ...gradientStyle(customization.leaderboardGradient),
                  opacity: customization.leaderboardOpacity,
                  transform: `translate(${customization.leaderboardPosition.offsetX}px, ${customization.leaderboardPosition.offsetY}px)`,
                }}
              >
                <div className="mb-3 flex items-center gap-2">
                  <Trophy className="h-4 w-4" />
                  <span className="text-sm font-semibold">Leaderboard</span>
                </div>
                <div className="space-y-2 text-sm text-white/85">
                  <div className="rounded-lg bg-black/18 px-3 py-2">1. RoseStorm</div>
                  <div className="rounded-lg bg-black/12 px-3 py-2">2. MoneyRainHQ</div>
                  <div className="rounded-lg bg-black/12 px-3 py-2">3. UniverseDrop</div>
                </div>
              </div>
            ) : null}

            {customization.showAccountDetails ? (
              <div
                className={cn("absolute w-[30%] rounded-2xl border border-white/14 px-4 py-4 text-white shadow-[0_0_30px_rgba(0,0,0,0.18)]", getAnchorClass(customization.accountPosition.anchor))}
                style={{
                  ...gradientStyle(customization.accountGradient),
                  opacity: customization.accountOpacity,
                  transform: `translate(${customization.accountPosition.offsetX}px, ${customization.accountPosition.offsetY}px)`,
                }}
              >
                <p className="text-xs uppercase tracking-[0.24em] text-white/70">Virtual Account</p>
                <p className="mt-2 text-lg font-bold">StreamTip Creator</p>
                <p className="mt-1 font-mono text-xl">1023456789</p>
                <p className="mt-1 text-sm text-white/85">Moniepoint MFB</p>
              </div>
            ) : null}

            <div
              className={cn("absolute w-[34%] rounded-[28px] border border-white/16 px-5 py-6 text-center text-white shadow-[0_0_40px_rgba(0,0,0,0.18)]", getAnchorClass(customization.alertPosition.anchor))}
              style={{
                ...gradientStyle(customization.alertGradient),
                transform: `translate(${customization.alertPosition.offsetX}px, ${customization.alertPosition.offsetY}px)`,
              }}
            >
              <p className="text-5xl">🌌</p>
              <p className="mt-3 text-sm uppercase tracking-[0.32em] text-white/70">Gift Alert</p>
              <p className="mt-2 text-2xl font-black">UniverseDrop</p>
              <p className="mt-1 text-sm text-white/80">sent a Universe gift</p>
            </div>

            {customization.showAmbientScene ? (
              <>
                <div className="absolute left-[8%] top-[16%] h-24 w-24 rounded-full bg-white/14 blur-3xl" />
                <div className="absolute bottom-[14%] right-[10%] h-28 w-28 rounded-full bg-white/10 blur-3xl" />
              </>
            ) : null}
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4">
            <div className="flex items-center gap-2 text-sm font-medium text-zinc-300">
              <SlidersHorizontal className="h-4 w-4 text-zinc-500" />
              Feature Toggles
            </div>
            <div className="mt-4 space-y-4">
              {[
                {
                  key: "showGoal" as const,
                  label: "Show Live Goal",
                  description: "Keep the goal block visible on the overlay.",
                },
                {
                  key: "showLeaderboard" as const,
                  label: "Show Leaderboard",
                  description: "Display the top gifters panel live on stream.",
                },
                {
                  key: "showTopSupporter" as const,
                  label: "Show Top Supporter Badge",
                  description: "Show the leading gifter beside the goal area.",
                },
                {
                  key: "showAmbientScene" as const,
                  label: "Ambient Stage Effects",
                  description: "Keep soft background glows and motion even before alerts appear.",
                },
                {
                  key: "showAccountDetails" as const,
                  label: "Show Account Details",
                  description: "Display your virtual account details on stream when you want viewers to fund directly.",
                },
              ].map((item) => (
                <div
                  key={item.key}
                  className="flex items-center justify-between gap-4 rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3"
                >
                  <div>
                    <p className="font-medium text-white">{item.label}</p>
                    <p className="text-sm text-zinc-500">{item.description}</p>
                  </div>
                  <Switch
                    checked={customization[item.key]}
                    onCheckedChange={(checked) => updateCustomization(item.key, checked)}
                    className="data-[state=checked]:bg-purple-500"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4">
            <div className="flex items-center gap-2 text-sm font-medium text-zinc-300">
              <Palette className="h-4 w-4 text-zinc-500" />
              Extra Notes
            </div>
            <div className="mt-4 space-y-3 text-sm text-zinc-400">
              <p>Goal and leaderboard positions update the real overlay immediately, so you can keep one browser source in OBS and fine-tune from dashboard.</p>
              <p>Use the preview preset to see how your layout reads on different platform styles before you go live.</p>
              <p>Gradient controls accept direct color picker updates, so you can build your own brand colors instead of being locked into one theme.</p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <PlacementCard
            title="Gift Alert Position"
            position={customization.alertPosition}
            onAnchorChange={(anchor) =>
              updateCustomization("alertPosition", { ...customization.alertPosition, anchor })
            }
            onOffsetChange={(axis, value) =>
              updateCustomization("alertPosition", {
                ...customization.alertPosition,
                [axis]: value,
              })
            }
          />
          <PlacementCard
            title="Goal Position"
            position={customization.goalPosition}
            onAnchorChange={(anchor) =>
              updateCustomization("goalPosition", { ...customization.goalPosition, anchor })
            }
            onOffsetChange={(axis, value) =>
              updateCustomization("goalPosition", {
                ...customization.goalPosition,
                [axis]: value,
              })
            }
          />
          <PlacementCard
            title="Leaderboard Position"
            position={customization.leaderboardPosition}
            onAnchorChange={(anchor) =>
              updateCustomization("leaderboardPosition", {
                ...customization.leaderboardPosition,
                anchor,
              })
            }
            onOffsetChange={(axis, value) =>
              updateCustomization("leaderboardPosition", {
                ...customization.leaderboardPosition,
                [axis]: value,
              })
            }
          />
          <PlacementCard
            title="Account Panel Position"
            position={customization.accountPosition}
            onAnchorChange={(anchor) =>
              updateCustomization("accountPosition", {
                ...customization.accountPosition,
                anchor,
              })
            }
            onOffsetChange={(axis, value) =>
              updateCustomization("accountPosition", {
                ...customization.accountPosition,
                [axis]: value,
              })
            }
          />
        </div>

        <div className="grid gap-4 lg:grid-cols-4">
          <GradientEditor
            label="Goal Gradient"
            gradient={customization.goalGradient}
            onChange={(key, value) =>
              updateCustomization("goalGradient", {
                ...customization.goalGradient,
                [key]: value,
              })
            }
          />
          <GradientEditor
            label="Leaderboard Gradient"
            gradient={customization.leaderboardGradient}
            onChange={(key, value) =>
              updateCustomization("leaderboardGradient", {
                ...customization.leaderboardGradient,
                [key]: value,
              })
            }
          />
          <GradientEditor
            label="Account Panel Gradient"
            gradient={customization.accountGradient}
            onChange={(key, value) =>
              updateCustomization("accountGradient", {
                ...customization.accountGradient,
                [key]: value,
              })
            }
          />
          <GradientEditor
            label="Gift Alert Gradient"
            gradient={customization.alertGradient}
            onChange={(key, value) =>
              updateCustomization("alertGradient", {
                ...customization.alertGradient,
                [key]: value,
              })
            }
          />
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <OpacityCard
            title="Live Goal Opacity"
            value={customization.goalOpacity}
            onChange={(value) => updateCustomization("goalOpacity", value)}
          />
          <OpacityCard
            title="Leaderboard Opacity"
            value={customization.leaderboardOpacity}
            onChange={(value) => updateCustomization("leaderboardOpacity", value)}
          />
          <OpacityCard
            title="Account Panel Opacity"
            value={customization.accountOpacity}
            onChange={(value) => updateCustomization("accountOpacity", value)}
          />
        </div>
      </div>
    </section>
  )
}
