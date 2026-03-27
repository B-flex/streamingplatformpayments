"use client"

import { useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { useAdminAuth } from "@/app/context/AdminAuthContext"
import { AdminSidebar } from "@/components/admin/admin-sidebar"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const { isAuthenticated, isLoading } = useAdminAuth()

  useEffect(() => {
    const onLoginPage = pathname === "/admin/login"

    if (!isLoading && !isAuthenticated && !onLoginPage) {
      router.replace("/admin/login")
    }

    if (!isLoading && isAuthenticated && onLoginPage) {
      router.replace("/admin")
    }
  }, [isAuthenticated, isLoading, pathname, router])

  if (isLoading && pathname !== "/admin/login") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-white">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 px-6 py-5">
          Loading admin panel...
        </div>
      </div>
    )
  }

  if (pathname === "/admin/login") {
    return children
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(14,165,233,0.08),transparent_30%),linear-gradient(180deg,#09090f,#11111a)] text-white">
      <div className="flex min-h-screen">
        <AdminSidebar />
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  )
}
