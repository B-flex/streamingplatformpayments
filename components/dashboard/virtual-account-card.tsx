"use client"

import { cn } from "@/lib/utils"
import { Copy, Check, Building2, CreditCard, User } from "lucide-react"
import { useState } from "react"

interface VirtualAccountDetails {
  accountName: string
  accountNumber: string
  bankName: string
  accountReference?: string
}

interface VirtualAccountCardProps {
  account: VirtualAccountDetails
  className?: string
}

export function VirtualAccountCard({ account, className }: VirtualAccountCardProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null)

  const copyToClipboard = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text)
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 2000)
  }

  const fields = [
    { 
      label: "Bank Name", 
      value: account.bankName, 
      field: "bank",
      icon: Building2 
    },
    { 
      label: "Account Number", 
      value: account.accountNumber, 
      field: "number",
      icon: CreditCard 
    },
    { 
      label: "Account Name", 
      value: account.accountName, 
      field: "name",
      icon: User 
    },
  ]

  return (
    <div className={cn(
      "bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 rounded-xl overflow-hidden",
      className
    )}>
      {/* Header with gradient accent */}
      <div className="px-5 py-4 border-b border-zinc-800 bg-gradient-to-r from-purple-500/10 to-pink-500/10">
        <h3 className="text-lg font-semibold text-white">Virtual Account</h3>
        <p className="text-sm text-zinc-500 mt-1">
          Share this account to receive donations
        </p>
      </div>
      
      {/* Account details */}
      <div className="p-5 space-y-4">
        {fields.map(({ label, value, field, icon: Icon }) => (
          <div 
            key={field}
            className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg group hover:bg-zinc-800 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-zinc-700/50">
                <Icon className="h-4 w-4 text-zinc-400" />
              </div>
              <div>
                <p className="text-xs text-zinc-500">{label}</p>
                <p className="text-sm font-medium text-white">{value}</p>
              </div>
            </div>
            <button
              onClick={() => copyToClipboard(value, field)}
              className="p-2 rounded-lg text-zinc-500 hover:text-white hover:bg-zinc-700 transition-all"
              title={`Copy ${label}`}
            >
              {copiedField === field ? (
                <Check className="h-4 w-4 text-emerald-400" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </button>
          </div>
        ))}
      </div>

      {/* Quick copy all button */}
      <div className="px-5 pb-5">
        <button
          onClick={() => copyToClipboard(
            `Bank: ${account.bankName}\nAccount Number: ${account.accountNumber}\nAccount Name: ${account.accountName}`,
            "all"
          )}
          className={cn(
            "w-full py-2.5 rounded-lg text-sm font-medium transition-all",
            "bg-gradient-to-r from-purple-500 to-pink-500 text-white",
            "hover:from-purple-600 hover:to-pink-600",
            "active:scale-[0.98]"
          )}
        >
          {copiedField === "all" ? (
            <span className="flex items-center justify-center gap-2">
              <Check className="h-4 w-4" />
              Copied!
            </span>
          ) : (
            "Copy All Details"
          )}
        </button>
      </div>
    </div>
  )
}
