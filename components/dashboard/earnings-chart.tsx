"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"

export interface EarningsDataPoint {
  label: string
  amount: number
}

interface EarningsChartProps {
  data: EarningsDataPoint[]
  title?: string
}

export function EarningsChart({ data, title = "Earnings Over Time" }: EarningsChartProps) {
  return (
    <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-6">
      <h3 className="text-lg font-semibold text-white mb-6">{title}</h3>
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <XAxis
              dataKey="label"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#71717a", fontSize: 12 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#71717a", fontSize: 12 }}
              tickFormatter={(value) => `₦${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip
              cursor={{ fill: "rgba(168, 85, 247, 0.1)" }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 shadow-xl">
                      <p className="text-white font-semibold">
                        ₦{payload[0].value?.toLocaleString()}
                      </p>
                      <p className="text-zinc-400 text-sm">
                        {payload[0].payload.label}
                      </p>
                    </div>
                  )
                }
                return null
              }}
            />
            <defs>
              <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#a855f7" />
                <stop offset="100%" stopColor="#ec4899" />
              </linearGradient>
            </defs>
            <Bar
              dataKey="amount"
              fill="url(#barGradient)"
              radius={[6, 6, 0, 0]}
              maxBarSize={50}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
