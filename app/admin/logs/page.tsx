"use client"

import { useEffect, useState } from "react"
import { adminRequest } from "@/lib/admin-client"

type AuditLog = {
  _id?: string
  actorType: string
  eventType: string
  message: string
  createdAt?: string
}

function formatDate(value?: string) {
  if (!value) return "Just now"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "Just now"
  return new Intl.DateTimeFormat("en-NG", { dateStyle: "medium", timeStyle: "short" }).format(date)
}

export default function AdminLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const loadLogs = async () => {
      setLoading(true)
      setError("")

      try {
        const response = await adminRequest("/admin/logs")
        const payload = await response.json().catch(() => null)

        if (!response.ok) {
          throw new Error(payload?.error || "Could not load audit logs.")
        }

        setLogs(payload?.logs || [])
      } catch (requestError) {
        setError(requestError instanceof Error ? requestError.message : "Could not load audit logs.")
      } finally {
        setLoading(false)
      }
    }

    void loadLogs()
  }, [])

  return (
    <div className="space-y-6 p-6 lg:p-8">
      <div className="space-y-1">
        <h1 className="text-3xl font-black text-white">Audit Logs</h1>
        <p className="text-zinc-400">
          Review the latest admin, platform, donation, payout, and user activity events.
        </p>
      </div>

      {error ? (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      ) : null}

      <section className="rounded-[28px] border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
        <div className="space-y-3">
          {loading ? (
            <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-5 text-sm text-zinc-400">
              Loading audit logs...
            </div>
          ) : (
            logs.map((log, index) => (
              <div
                key={log._id || `${log.eventType}-${index}`}
                className="rounded-2xl border border-white/10 bg-black/20 px-4 py-4"
              >
                <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                  <p className="font-semibold text-white">{log.eventType}</p>
                  <p className="text-sm text-zinc-500">{formatDate(log.createdAt)}</p>
                </div>
                <p className="mt-2 text-sm text-zinc-300">{log.message}</p>
                <p className="mt-2 text-xs uppercase tracking-[0.18em] text-zinc-500">
                  Actor: {log.actorType}
                </p>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  )
}
