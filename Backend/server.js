require("dotenv").config()

const express = require("express")
const http = require("http")
const mongoose = require("mongoose")
const cors = require("cors")
const axios = require("axios")
const crypto = require("crypto")
const { Server } = require("socket.io")

const app = express()
app.use(cors())
app.use(express.json())

const server = http.createServer(app)
const io = new Server(server, {
  cors: { origin: "*" },
})

const {
  MONGODB_URI = "mongodb://127.0.0.1:27017/streamtip",
  MONNIFY_API_KEY = "",
  MONNIFY_SECRET_KEY = "",
  MONNIFY_CONTRACT_CODE = "",
  MONNIFY_BASE_URL = "https://sandbox.monnify.com",
  ADMIN_EMAIL = "admin@streamtip.local",
  ADMIN_PASSWORD = "ChangeMeAdmin123!",
} = process.env

const PLATFORM_FEE_RATE = 0.2
const CREATOR_SHARE_RATE = 0.8

mongoose
  .connect(MONGODB_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((error) => console.log(error))

const donationSchema = new mongoose.Schema({
  sender: String,
  amount: Number,
  platformFee: Number,
  creatorShare: Number,
  date: { type: Date, default: Date.now },
})

const Donation = mongoose.model("Donation", donationSchema)

const payoutSchema = new mongoose.Schema({
  amount: Number,
  status: String,
  bankName: String,
  accountNumber: String,
  createdAt: { type: Date, default: Date.now },
  completedAt: Date,
})

const Payout = mongoose.model("Payout", payoutSchema)

const platformWithdrawalSchema = new mongoose.Schema({
  amount: Number,
  status: String,
  bankName: String,
  accountNumber: String,
  accountName: String,
  note: String,
  createdAt: { type: Date, default: Date.now },
  completedAt: Date,
})

const PlatformWithdrawal = mongoose.model("PlatformWithdrawal", platformWithdrawalSchema)

const adminSessionSchema = new mongoose.Schema(
  {
    token: { type: String, required: true, unique: true },
    createdAt: { type: Date, default: Date.now },
    lastSeenAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
)

const auditLogSchema = new mongoose.Schema(
  {
    actorType: { type: String, required: true },
    actorId: { type: String, default: "" },
    eventType: { type: String, required: true },
    message: { type: String, required: true },
    metadata: { type: Object, default: {} },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: false },
)

const AdminSession = mongoose.model("AdminSession", adminSessionSchema)
const AuditLog = mongoose.model("AuditLog", auditLogSchema)

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    sessionToken: { type: String, default: null },
    role: { type: String, enum: ["creator", "admin"], default: "creator" },
    status: { type: String, enum: ["active", "suspended", "banned"], default: "active" },
    virtualAccount: {
      accountReference: String,
      accountName: String,
      accountNumber: String,
      bankName: String,
      bankCode: String,
      reservationReference: String,
      status: { type: String, default: "inactive" },
      provider: { type: String, default: "monnify" },
      createdAt: Date,
    },
  },
  {
    timestamps: true,
  },
)

const User = mongoose.model("User", userSchema)

function isMonnifyConfigured() {
  return Boolean(MONNIFY_API_KEY && MONNIFY_SECRET_KEY && MONNIFY_CONTRACT_CODE)
}

function sanitizeUser(user) {
  if (!user) return null

  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role || "creator",
    status: user.status || "active",
    virtualAccount: user.virtualAccount || null,
    createdAt: user.createdAt,
  }
}

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex")
  const hash = crypto.scryptSync(password, salt, 64).toString("hex")
  return `${salt}:${hash}`
}

function verifyPassword(password, passwordHash) {
  if (!passwordHash || !passwordHash.includes(":")) {
    return false
  }

  const [salt, storedHash] = passwordHash.split(":")
  const computedHash = crypto.scryptSync(password, salt, 64).toString("hex")
  return crypto.timingSafeEqual(
    Buffer.from(storedHash, "hex"),
    Buffer.from(computedHash, "hex"),
  )
}

function generateSessionToken() {
  return crypto.randomBytes(32).toString("hex")
}

function calculateRevenueSplit(amount) {
  const gross = Number(amount) || 0
  const platformFee = Math.round(gross * PLATFORM_FEE_RATE)
  const creatorShare = Math.max(0, gross - platformFee)

  return {
    gross,
    platformFee,
    creatorShare,
  }
}

async function createAuditLog({ actorType, actorId = "", eventType, message, metadata = {} }) {
  try {
    await AuditLog.create({
      actorType,
      actorId,
      eventType,
      message,
      metadata,
      createdAt: new Date(),
    })
  } catch (error) {
    console.error("Failed to create audit log", error)
  }
}

async function getMonnifyAccessToken() {
  const credentials = Buffer.from(`${MONNIFY_API_KEY}:${MONNIFY_SECRET_KEY}`).toString("base64")

  const response = await axios.post(
    `${MONNIFY_BASE_URL}/api/v1/auth/login`,
    {},
    {
      headers: {
        Authorization: `Basic ${credentials}`,
      },
    },
  )

  return response.data?.responseBody?.accessToken
}

async function createReservedAccountForUser(user) {
  if (!isMonnifyConfigured()) {
    throw new Error(
      "Monnify is not configured yet. Add MONNIFY_API_KEY, MONNIFY_SECRET_KEY, and MONNIFY_CONTRACT_CODE to Backend/.env.",
    )
  }

  if (user.virtualAccount?.accountNumber) {
    return user.virtualAccount
  }

  const accessToken = await getMonnifyAccessToken()
  const accountReference = `STIP-${user._id}-${Date.now()}`

  const response = await axios.post(
    `${MONNIFY_BASE_URL}/api/v2/bank-transfer/reserved-accounts`,
    {
      accountReference,
      accountName: `StreamTip/${user.name}`,
      currencyCode: "NGN",
      contractCode: MONNIFY_CONTRACT_CODE,
      customerEmail: user.email,
      customerName: user.name,
      getAllAvailableBanks: false,
    },
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    },
  )

  const responseBody = response.data?.responseBody || {}
  const account =
    Array.isArray(responseBody.accounts) && responseBody.accounts.length > 0
      ? responseBody.accounts[0]
      : responseBody

  if (!account?.accountNumber) {
    throw new Error("Monnify did not return a reserved account.")
  }

  const virtualAccount = {
    accountReference,
    accountName: account.accountName || responseBody.accountName || `StreamTip/${user.name}`,
    accountNumber: account.accountNumber,
    bankName: account.bankName || "Monnify",
    bankCode: account.bankCode || "",
    reservationReference: responseBody.reservationReference || "",
    status: "active",
    provider: "monnify",
    createdAt: new Date(),
  }

  user.virtualAccount = virtualAccount
  await user.save()

  return virtualAccount
}

async function getCurrentUser() {
  return User.findOne().sort({ createdAt: -1 })
}

async function getRevenueTotals() {
  const [donations, payouts, platformWithdrawals] = await Promise.all([
    Donation.find(),
    Payout.find({ status: { $ne: "failed" } }),
    PlatformWithdrawal.find({ status: { $ne: "failed" } }),
  ])

  const grossRevenue = donations.reduce((sum, donation) => sum + (Number(donation.amount) || 0), 0)
  const platformRevenue = donations.reduce((sum, donation) => {
    if (typeof donation.platformFee === "number") {
      return sum + donation.platformFee
    }

    return sum + calculateRevenueSplit(donation.amount).platformFee
  }, 0)
  const creatorRevenue = donations.reduce((sum, donation) => {
    if (typeof donation.creatorShare === "number") {
      return sum + donation.creatorShare
    }

    return sum + calculateRevenueSplit(donation.amount).creatorShare
  }, 0)
  const totalPaidOut = payouts.reduce((sum, payout) => sum + (Number(payout.amount) || 0), 0)
  const totalPlatformWithdrawn = platformWithdrawals.reduce(
    (sum, withdrawal) => sum + (Number(withdrawal.amount) || 0),
    0,
  )

  return {
    grossRevenue,
    platformRevenue,
    creatorRevenue,
    totalPaidOut,
    totalPlatformWithdrawn,
    creatorAvailableBalance: Math.max(0, creatorRevenue - totalPaidOut),
    pendingPlatformRevenue: Math.max(0, platformRevenue - totalPlatformWithdrawn),
  }
}

async function getSessionUser(req) {
  const sessionToken = String(req.headers["x-session-token"] || "").trim()

  if (!sessionToken) {
    return null
  }

  return User.findOne({ sessionToken })
}

async function requireAdminSession(req, res, next) {
  try {
    const adminToken = String(req.headers["x-admin-token"] || "").trim()

    if (!adminToken) {
      return res.status(401).json({ error: "Admin authentication required." })
    }

    const adminSession = await AdminSession.findOne({ token: adminToken })

    if (!adminSession) {
      return res.status(401).json({ error: "Invalid admin session." })
    }

    adminSession.lastSeenAt = new Date()
    await adminSession.save()

    req.adminSession = adminSession
    return next()
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: "Failed to validate admin session." })
  }
}

app.post("/auth/register", async (req, res) => {
  try {
    const { name, email, password } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({ error: "Name, email, and password are required." })
    }

    const normalizedEmail = String(email).toLowerCase().trim()
    const trimmedName = String(name).trim()
    const rawPassword = String(password)

    if (rawPassword.length < 8) {
      return res.status(400).json({ error: "Password must be at least 8 characters long." })
    }

    let user = await User.findOne({ email: normalizedEmail })

    if (user) {
      return res.status(409).json({ error: "An account with that email already exists." })
    }

    user = await User.create({
      name: trimmedName,
      email: normalizedEmail,
      passwordHash: hashPassword(rawPassword),
      sessionToken: generateSessionToken(),
      role: "creator",
      status: "active",
    })

    await createAuditLog({
      actorType: "user",
      actorId: user._id.toString(),
      eventType: "user.registered",
      message: `${normalizedEmail} registered.`,
      metadata: {
        name: trimmedName,
        email: normalizedEmail,
      },
    })

    try {
      await createReservedAccountForUser(user)
    } catch (error) {
      await User.findByIdAndDelete(user._id)
      return res.status(502).json({
        error:
          error instanceof Error
            ? error.message
            : "Could not provision a Monnify reserved account.",
      })
    }

    return res.json({
      user: sanitizeUser(user),
      sessionToken: user.sessionToken,
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: "Failed to register user." })
  }
})

app.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required." })
    }

    const user = await User.findOne({ email: String(email).toLowerCase().trim() })

    if (!user || !verifyPassword(String(password), user.passwordHash)) {
      return res.status(401).json({ error: "Invalid email or password." })
    }

    if (user.status === "banned") {
      return res.status(403).json({ error: "This account has been banned." })
    }

    if (user.status === "suspended") {
      return res.status(403).json({ error: "This account is currently suspended." })
    }

    user.sessionToken = generateSessionToken()
    await user.save()

    await createAuditLog({
      actorType: "user",
      actorId: user._id.toString(),
      eventType: "user.login",
      message: `${user.email} logged in.`,
      metadata: { email: user.email },
    })

    return res.json({
      user: sanitizeUser(user),
      sessionToken: user.sessionToken,
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: "Failed to log in." })
  }
})

app.get("/auth/me", async (req, res) => {
  try {
    const user = await getSessionUser(req)

    if (!user) {
      return res.status(401).json({ error: "Not authenticated." })
    }

    if (user.status && user.status !== "active") {
      user.sessionToken = null
      await user.save()
      return res.status(403).json({ error: "This account is not active anymore." })
    }

    return res.json({ user: sanitizeUser(user) })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: "Failed to load current user." })
  }
})

app.post("/auth/logout", async (req, res) => {
  try {
    const user = await getSessionUser(req)

    if (user) {
      user.sessionToken = null
      await user.save()
      await createAuditLog({
        actorType: "user",
        actorId: user._id.toString(),
        eventType: "user.logout",
        message: `${user.email} logged out.`,
        metadata: { email: user.email },
      })
    }

    return res.json({ success: true })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: "Failed to log out." })
  }
})

app.post("/admin/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required." })
    }

    const normalizedEmail = String(email).toLowerCase().trim()

    if (
      normalizedEmail !== String(ADMIN_EMAIL).toLowerCase().trim() ||
      String(password) !== String(ADMIN_PASSWORD)
    ) {
      await createAuditLog({
        actorType: "admin",
        eventType: "admin.login.failed",
        message: "Failed admin login attempt.",
        metadata: { email: normalizedEmail },
      })
      return res.status(401).json({ error: "Invalid admin credentials." })
    }

    const token = generateSessionToken()
    const session = await AdminSession.create({
      token,
      createdAt: new Date(),
      lastSeenAt: new Date(),
    })

    await createAuditLog({
      actorType: "admin",
      actorId: session._id.toString(),
      eventType: "admin.login.success",
      message: "Admin logged in.",
      metadata: { email: normalizedEmail },
    })

    return res.json({
      token,
      admin: {
        email: normalizedEmail,
      },
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: "Failed to log in as admin." })
  }
})

app.get("/admin/auth/me", requireAdminSession, async (req, res) => {
  return res.json({
    admin: {
      email: String(ADMIN_EMAIL).toLowerCase().trim(),
    },
  })
})

app.post("/admin/auth/logout", requireAdminSession, async (req, res) => {
  try {
    await AdminSession.deleteOne({ _id: req.adminSession._id })
    await createAuditLog({
      actorType: "admin",
      actorId: req.adminSession._id.toString(),
      eventType: "admin.logout",
      message: "Admin logged out.",
    })
    return res.json({ success: true })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: "Failed to log out admin." })
  }
})

app.post("/users/:id/virtual-account", async (req, res) => {
  try {
    const user = await User.findById(req.params.id)

    if (!user) {
      return res.status(404).json({ error: "User not found." })
    }

    const virtualAccount = await createReservedAccountForUser(user)
    return res.json({ virtualAccount })
  } catch (error) {
    console.error(error)
    return res.status(502).json({
      error:
        error instanceof Error
          ? error.message
          : "Could not provision a Monnify reserved account.",
    })
  }
})

app.post("/webhook/monnify", async (req, res) => {
  const data = req.body
  const sender = data.sender || data.payerName || "Anonymous"
  const split = calculateRevenueSplit(data.amount || data.amountPaid || 0)

  const donation = await Donation.create({
    sender,
    amount: split.gross,
    platformFee: split.platformFee,
    creatorShare: split.creatorShare,
  })

  io.emit("newDonation", donation)

  await createAuditLog({
    actorType: "system",
    eventType: "donation.received",
    message: `Donation received from ${sender}.`,
    metadata: {
      sender,
      amount: split.gross,
      platformFee: split.platformFee,
      creatorShare: split.creatorShare,
    },
  })

  res.sendStatus(200)
})

app.get("/payouts", async (req, res) => {
  try {
    const payouts = await Payout.find().sort({ createdAt: -1 })
    res.json(payouts)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: "Server error" })
  }
})

app.post("/payouts", async (req, res) => {
  try {
    const { amount, bankName, accountNumber } = req.body
    const payoutAmount = Number(amount) || 0

    const donations = await Donation.find()
    const creatorRevenue = donations.reduce((sum, donation) => {
      if (typeof donation.creatorShare === "number") {
        return sum + donation.creatorShare
      }

      return sum + calculateRevenueSplit(donation.amount).creatorShare
    }, 0)

    const existingPayouts = await Payout.find({
      status: { $ne: "failed" },
    })
    const withdrawnTotal = existingPayouts.reduce(
      (sum, payout) => sum + (Number(payout.amount) || 0),
      0,
    )
    const availableCreatorBalance = Math.max(0, creatorRevenue - withdrawnTotal)

    if (!payoutAmount || payoutAmount <= 0) {
      return res.status(400).json({ error: "Enter a valid payout amount." })
    }

    if (payoutAmount > availableCreatorBalance) {
      return res.status(400).json({
        error: "Creators can only withdraw up to their 80% share of earnings.",
        availableCreatorBalance,
        creatorRevenue,
        platformRevenue: donations.reduce((sum, donation) => {
          if (typeof donation.platformFee === "number") {
            return sum + donation.platformFee
          }

          return sum + calculateRevenueSplit(donation.amount).platformFee
        }, 0),
      })
    }

    const payout = await Payout.create({
      amount: payoutAmount,
      bankName,
      accountNumber,
      status: "completed",
      createdAt: new Date(),
      completedAt: new Date(),
    })

    io.emit("newPayout", payout)

    await createAuditLog({
      actorType: "system",
      eventType: "payout.created",
      message: `Payout created for ${bankName}.`,
      metadata: {
        amount: payoutAmount,
        bankName,
        accountNumber: String(accountNumber).slice(-4),
      },
    })

    res.json(payout)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: "Failed payout" })
  }
})

app.get("/donations", async (req, res) => {
  const donations = await Donation.find().sort({ date: -1 })
  res.json(donations)
})

app.get("/user", async (req, res) => {
  try {
    const user = (await getSessionUser(req)) || (await getCurrentUser())

    if (!user) {
      return res.status(404).json({ error: "No registered user found." })
    }

    res.json(sanitizeUser(user))
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: "Failed to fetch user." })
  }
})

app.put("/user", async (req, res) => {
  try {
    const user = (await getSessionUser(req)) || (await getCurrentUser())

    if (!user) {
      return res.status(404).json({ error: "No registered user found." })
    }

    const nextName = String(req.body?.name || "").trim()
    const nextEmail = String(req.body?.email || "").toLowerCase().trim()

    if (!nextName || !nextEmail) {
      return res.status(400).json({ error: "Name and email are required." })
    }

    const existingUser = await User.findOne({
      email: nextEmail,
      _id: { $ne: user._id },
    })

    if (existingUser) {
      return res.status(409).json({ error: "That email is already in use." })
    }

    user.name = nextName
    user.email = nextEmail

    if (user.virtualAccount) {
      user.virtualAccount.accountName = user.virtualAccount.accountName || `StreamTip/${nextName}`
    }

    await user.save()

    await createAuditLog({
      actorType: "user",
      actorId: user._id.toString(),
      eventType: "user.updated",
      message: `${user.email} updated profile details.`,
      metadata: {
        name: user.name,
        email: user.email,
      },
    })

    res.json(sanitizeUser(user))
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: "Failed to update user." })
  }
})

app.get("/admin/overview", requireAdminSession, async (req, res) => {
  try {
    const [users, donations, payouts, logs, platformWithdrawals, revenueTotals] = await Promise.all([
      User.find().sort({ createdAt: -1 }),
      Donation.find().sort({ date: -1 }),
      Payout.find().sort({ createdAt: -1 }),
      AuditLog.find().sort({ createdAt: -1 }).limit(100),
      PlatformWithdrawal.find().sort({ createdAt: -1 }),
      getRevenueTotals(),
    ])

    const topGiftersMap = new Map()
    for (const donation of donations) {
      const sender = donation.sender || "Anonymous"
      topGiftersMap.set(sender, (topGiftersMap.get(sender) || 0) + (Number(donation.amount) || 0))
    }

    res.json({
      metrics: {
        totalUsers: users.length,
        totalDonations: donations.length,
        totalPayouts: payouts.length,
        grossRevenue: revenueTotals.grossRevenue,
        platformRevenue: revenueTotals.platformRevenue,
        creatorRevenue: revenueTotals.creatorRevenue,
        creatorAvailableBalance: revenueTotals.creatorAvailableBalance,
        totalPaidOut: revenueTotals.totalPaidOut,
        pendingPlatformRevenue: revenueTotals.pendingPlatformRevenue,
        totalPlatformWithdrawn: revenueTotals.totalPlatformWithdrawn,
      },
      recentUsers: users.slice(0, 10).map(sanitizeUser),
      recentDonations: donations.slice(0, 15),
      recentPayouts: payouts.slice(0, 15),
      recentPlatformWithdrawals: platformWithdrawals.slice(0, 15),
      topGifters: Array.from(topGiftersMap.entries())
        .map(([name, amount]) => ({ name, amount }))
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 8),
      logs,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: "Failed to load admin overview." })
  }
})

app.get("/admin/logs", requireAdminSession, async (req, res) => {
  try {
    const logs = await AuditLog.find().sort({ createdAt: -1 }).limit(200)
    res.json({ logs })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: "Failed to load admin logs." })
  }
})

app.get("/admin/users", requireAdminSession, async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 })
    res.json({ users: users.map(sanitizeUser) })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: "Failed to load users." })
  }
})

app.post("/admin/users", requireAdminSession, async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role = "creator",
      status = "active",
      provisionVirtualAccount = false,
    } = req.body || {}

    const normalizedEmail = String(email || "").toLowerCase().trim()
    const trimmedName = String(name || "").trim()
    const rawPassword = String(password || "")
    const nextRole = role === "admin" ? "admin" : "creator"
    const nextStatus = ["active", "suspended", "banned"].includes(String(status))
      ? String(status)
      : "active"

    if (!trimmedName || !normalizedEmail || rawPassword.length < 8) {
      return res.status(400).json({
        error: "Name, email, and a password of at least 8 characters are required.",
      })
    }

    const existingUser = await User.findOne({ email: normalizedEmail })
    if (existingUser) {
      return res.status(409).json({ error: "A user with that email already exists." })
    }

    const user = await User.create({
      name: trimmedName,
      email: normalizedEmail,
      passwordHash: hashPassword(rawPassword),
      sessionToken: null,
      role: nextRole,
      status: nextStatus,
    })

    if (provisionVirtualAccount && isMonnifyConfigured()) {
      try {
        await createReservedAccountForUser(user)
      } catch (error) {
        console.error(error)
      }
    }

    await createAuditLog({
      actorType: "admin",
      actorId: req.adminSession._id.toString(),
      eventType: "admin.user.created",
      message: `Admin created user ${normalizedEmail}.`,
      metadata: {
        userId: user._id.toString(),
        email: normalizedEmail,
        role: nextRole,
        status: nextStatus,
      },
    })

    res.status(201).json({ user: sanitizeUser(user) })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: "Failed to create user." })
  }
})

app.patch("/admin/users/:id", requireAdminSession, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)

    if (!user) {
      return res.status(404).json({ error: "User not found." })
    }

    const nextName = typeof req.body?.name === "string" ? req.body.name.trim() : user.name
    const nextEmail =
      typeof req.body?.email === "string" ? req.body.email.toLowerCase().trim() : user.email
    const nextRole = req.body?.role === "admin" ? "admin" : req.body?.role === "creator" ? "creator" : user.role
    const nextStatus = ["active", "suspended", "banned"].includes(String(req.body?.status))
      ? String(req.body.status)
      : user.status

    if (!nextName || !nextEmail) {
      return res.status(400).json({ error: "Name and email are required." })
    }

    const existingUser = await User.findOne({
      email: nextEmail,
      _id: { $ne: user._id },
    })

    if (existingUser) {
      return res.status(409).json({ error: "Another user already uses that email." })
    }

    user.name = nextName
    user.email = nextEmail
    user.role = nextRole
    user.status = nextStatus

    if (typeof req.body?.password === "string" && req.body.password.trim().length >= 8) {
      user.passwordHash = hashPassword(req.body.password.trim())
      user.sessionToken = null
    }

    await user.save()

    await createAuditLog({
      actorType: "admin",
      actorId: req.adminSession._id.toString(),
      eventType: "admin.user.updated",
      message: `Admin updated user ${user.email}.`,
      metadata: {
        userId: user._id.toString(),
        role: user.role,
        status: user.status,
      },
    })

    res.json({ user: sanitizeUser(user) })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: "Failed to update user." })
  }
})

app.post("/admin/users/:id/virtual-account", requireAdminSession, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)

    if (!user) {
      return res.status(404).json({ error: "User not found." })
    }

    const virtualAccount = await createReservedAccountForUser(user)

    await createAuditLog({
      actorType: "admin",
      actorId: req.adminSession._id.toString(),
      eventType: "admin.user.virtual_account.created",
      message: `Admin provisioned a virtual account for ${user.email}.`,
      metadata: {
        userId: user._id.toString(),
        email: user.email,
      },
    })

    res.json({ user: sanitizeUser(user), virtualAccount })
  } catch (error) {
    console.error(error)
    res.status(502).json({
      error:
        error instanceof Error
          ? error.message
          : "Could not provision a Monnify reserved account.",
    })
  }
})

app.get("/admin/platform-withdrawals", requireAdminSession, async (req, res) => {
  try {
    const [withdrawals, totals] = await Promise.all([
      PlatformWithdrawal.find().sort({ createdAt: -1 }),
      getRevenueTotals(),
    ])

    res.json({
      withdrawals,
      balance: {
        platformRevenue: totals.platformRevenue,
        totalPlatformWithdrawn: totals.totalPlatformWithdrawn,
        pendingPlatformRevenue: totals.pendingPlatformRevenue,
      },
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: "Failed to load platform withdrawals." })
  }
})

app.post("/admin/platform-withdrawals", requireAdminSession, async (req, res) => {
  try {
    const { amount, bankName, accountNumber, accountName, note = "" } = req.body || {}
    const withdrawalAmount = Number(amount) || 0
    const totals = await getRevenueTotals()

    if (!withdrawalAmount || withdrawalAmount <= 0) {
      return res.status(400).json({ error: "Enter a valid withdrawal amount." })
    }

    if (!bankName || !accountNumber || !accountName) {
      return res.status(400).json({
        error: "Bank name, account number, and account name are required.",
      })
    }

    if (withdrawalAmount > totals.pendingPlatformRevenue) {
      return res.status(400).json({
        error: "You can only withdraw from the available platform 20% balance.",
        pendingPlatformRevenue: totals.pendingPlatformRevenue,
      })
    }

    const withdrawal = await PlatformWithdrawal.create({
      amount: withdrawalAmount,
      bankName: String(bankName).trim(),
      accountNumber: String(accountNumber).trim(),
      accountName: String(accountName).trim(),
      note: String(note || "").trim(),
      status: "completed",
      createdAt: new Date(),
      completedAt: new Date(),
    })

    await createAuditLog({
      actorType: "admin",
      actorId: req.adminSession._id.toString(),
      eventType: "admin.platform_withdrawal.created",
      message: `Admin withdrew platform revenue to ${withdrawal.bankName}.`,
      metadata: {
        amount: withdrawalAmount,
        bankName: withdrawal.bankName,
        accountNumber: withdrawal.accountNumber.slice(-4),
      },
    })

    res.status(201).json({ withdrawal })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: "Failed to create platform withdrawal." })
  }
})

server.listen(5000, () => {
  console.log("Server running on http://localhost:5000")
})
