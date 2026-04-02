"use client"

import { cn } from "@/lib/utils"
import { 
  LayoutDashboard, 
  Wallet, 
  History, 
  Settings, 
  CreditCard,
  Bell,
  Sparkles,
  Wand2,
  LogOut,
  ChevronLeft,
  ChevronRight
} from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useState } from "react"
import { useAuth } from "@/app/context/AuthContext"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface NavItem {
  label: string
  href: string
  icon: React.ElementType
}

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Donations", href: "/dashboard/donations", icon: History },
  { label: "Earnings", href: "/dashboard/earnings", icon: Wallet },
  { label: "Virtual Account", href: "/dashboard/account", icon: CreditCard },
  { label: "Overlay Settings", href: "/dashboard/overlay", icon: Sparkles },
  { label: "Create Custom Gift", href: "/dashboard/custom-gifts", icon: Wand2 },
  { label: "Notifications", href: "/dashboard/notifications", icon: Bell },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
]

export function DashboardSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)
  const { logout, user } = useAuth()

  return (
    <aside className={cn(
      "h-screen sticky top-0 flex flex-col bg-zinc-950 border-r border-zinc-800 transition-all duration-300",
      collapsed ? "w-[72px]" : "w-64"
    )}>
      {/* Logo */}
      <div className="flex items-center gap-3 p-4 border-b border-zinc-800">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500">
          <Sparkles className="h-5 w-5 text-white" />
        </div>
        {!collapsed && (
          <span className="text-lg font-bold text-white">StreamTip</span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto dashboard-scrollbar">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                "hover:bg-zinc-800/80",
                isActive 
                  ? "bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-white border border-purple-500/30" 
                  : "text-zinc-400 hover:text-white"
              )}
            >
              <item.icon className={cn(
                "h-5 w-5 shrink-0",
                isActive && "text-purple-400"
              )} />
              {!collapsed && (
                <span className="text-sm font-medium">{item.label}</span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Bottom section */}
      <div className="p-3 border-t border-zinc-800 space-y-1">
        {!collapsed && user ? (
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/80 px-3 py-3 text-sm text-zinc-400">
            <div className="flex items-center gap-3">
              <Avatar className="h-11 w-11 border border-zinc-700">
                <AvatarImage src={user.profileImage || ""} alt={user.name} className="object-cover" />
                <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                  {user.name.slice(0, 1).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="font-medium text-white truncate">{user.name}</p>
                <p className="truncate text-xs text-zinc-500">{user.email}</p>
              </div>
            </div>
          </div>
        ) : null}

        <button
          onClick={() => {
            void logout().then(() => router.replace("/login"))
          }}
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-lg w-full transition-all duration-200",
            "text-zinc-400 hover:text-red-400 hover:bg-red-500/10"
          )}
        >
          <LogOut className="h-5 w-5 shrink-0" />
          {!collapsed && <span className="text-sm font-medium">Logout</span>}
        </button>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center justify-center gap-3 px-3 py-2 rounded-lg w-full transition-all duration-200 text-zinc-500 hover:text-white hover:bg-zinc-800"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <>
              <ChevronLeft className="h-4 w-4" />
              <span className="text-xs">Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  )
}
