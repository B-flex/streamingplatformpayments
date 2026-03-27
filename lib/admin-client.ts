export const ADMIN_SESSION_STORAGE_KEY = "streamtip.admin.session"

export function getStoredAdminToken() {
  if (typeof window === "undefined") {
    return ""
  }

  return window.localStorage.getItem(ADMIN_SESSION_STORAGE_KEY) || ""
}

export function setStoredAdminToken(token: string) {
  if (typeof window === "undefined") {
    return
  }

  if (!token) {
    window.localStorage.removeItem(ADMIN_SESSION_STORAGE_KEY)
    return
  }

  window.localStorage.setItem(ADMIN_SESSION_STORAGE_KEY, token)
}

export async function adminRequest(path: string, init: RequestInit = {}) {
  const token = getStoredAdminToken()
  const headers = new Headers(init.headers || {})

  if (token) {
    headers.set("x-admin-token", token)
  }

  return fetch(`http://localhost:5000${path}`, {
    ...init,
    headers,
  })
}
