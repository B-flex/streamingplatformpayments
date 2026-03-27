"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useState } from "react"
import {
  ArrowDownToLine,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  LogOut,
  ScrollText,
  ShieldCheck,
  Users,
} from "lucide-react"
import { useAdminAuth } from "@/app/context/AdminAuthContext"
import { cn } from "@/lib/utils"

const navItems = [
  { label: "Overview", href: "/admin", icon: LayoutDashboard },
  { label: "Manage Users", href: "/admin/users", icon: Users },
  { label: "Platform Withdrawals", href: "/admin/platform-withdrawals", icon: ArrowDownToLine },
  { label: "Audit Logs", href: "/admin/logs", icon: ScrollText },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { admin, logout } = useAdminAuth()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside
      className={cn(
        "sticky top-0 flex h-screen flex-col border-r border-white/10 bg-black/25 backdrop-blur-xl transition-all duration-300",
        collapsed ? "w-[78px]" : "w-[290px]",
      )}
    >
      <div className="border-b border-white/10 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-500">
            <ShieldCheck className="h-5 w-5 text-white" />
          </div>
          {!collapsed ? (
            <div>
              <p className="text-lg font-black text-white">StreamTip Admin</p>
              <p className="text-xs uppercase tracking-[0.24em] text-cyan-100/70">
                Private controls
              </p>
            </div>
          ) : null}
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {navItems.map((item) => {
          const isActive = pathname === item.href

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-3 text-sm transition-all",
                isActive
                  ? "border border-cyan-400/20 bg-cyan-400/12 text-white"
                  : "text-zinc-400 hover:bg-white/5 hover:text-white",
              )}
            >
              <item.icon className={cn("h-5 w-5 shrink-0", isActive && "text-cyan-200")} />
              {!collapsed ? <span className="font-medium">{item.label}</span> : null}
            </Link>
          )
        })}
      </nav>

      <div className="space-y-2 border-t border-white/10 p-3">
        {!collapsed && admin ? (
          <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-sm">
            <p className="text-zinc-500">Signed in as</p>
            <p className="truncate font-medium text-white">{admin.email}</p>
          </div>
        ) : null}

        <button
          onClick={() => {
            void logout().then(() => router.replace("/admin/login"))
          }}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-zinc-400 transition-all hover:bg-red-500/10 hover:text-red-200"
        >
          <LogOut className="h-5 w-5 shrink-0" />
          {!collapsed ? <span className="font-medium">Logout</span> : null}
        </button>

        <button
          onClick={() => setCollapsed((current) => !current)}
          className="flex w-full items-center justify-center gap-2 rounded-xl px-3 py-2 text-zinc-500 transition-all hover:bg-white/5 hover:text-white"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          {!collapsed ? <span className="text-xs">Collapse</span> : null}
        </button>
      </div>
    </aside>
  )
}
