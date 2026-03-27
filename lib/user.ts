export interface VirtualAccount {
  accountReference?: string
  accountName: string
  accountNumber: string
  bankName: string
  bankCode?: string
  reservationReference?: string
  status?: string
  provider?: string
  createdAt?: string
}

export interface AppUser {
  id: string
  name: string
  email: string
  role?: "creator" | "admin"
  status?: "active" | "suspended" | "banned"
  virtualAccount: VirtualAccount | null
  createdAt?: string
}
