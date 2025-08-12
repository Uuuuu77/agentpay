import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import { createServer } from "http"
import { DatabaseManager } from "./database"
import { PaymentWatcher } from "./payment-watcher"
import { WebhookManager } from "./webhook-manager"
import { invoiceRoutes } from "./routes/invoices"
import { paymentRoutes } from "./routes/payments"
import { healthRoutes } from "./routes/health"

dotenv.config()

const app = express()
const server = createServer(app)
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`)
  next()
})

// Initialize services
let db: DatabaseManager
let paymentWatcher: PaymentWatcher
let webhookManager: WebhookManager

async function initializeServices() {
  try {
    // Initialize database
    db = new DatabaseManager()
    await db.initialize()
    console.log("Database initialized")

    // Initialize webhook manager
    webhookManager = new WebhookManager()

    // Initialize payment watcher
    paymentWatcher = new PaymentWatcher(db, webhookManager)
    await paymentWatcher.initialize()
    console.log("Payment watcher initialized")

    // Make services available to routes
    app.locals.db = db
    app.locals.paymentWatcher = paymentWatcher
    app.locals.webhookManager = webhookManager
  } catch (error) {
    console.error("Failed to initialize services:", error)
    process.exit(1)
  }
}

// Routes
app.use("/api/health", healthRoutes)
app.use("/api/invoices", invoiceRoutes)
app.use("/api/payments", paymentRoutes)

// Error handling middleware
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("API Error:", error)
  res.status(500).json({
    error: "Internal server error",
    message: process.env.NODE_ENV === "development" ? error.message : "Something went wrong",
  })
})

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ error: "Route not found" })
})

// Graceful shutdown
process.on("SIGTERM", async () => {
  console.log("SIGTERM received, shutting down gracefully")

  if (paymentWatcher) {
    await paymentWatcher.stop()
  }

  if (db) {
    await db.close()
  }

  server.close(() => {
    console.log("Server closed")
    process.exit(0)
  })
})

process.on("SIGINT", async () => {
  console.log("SIGINT received, shutting down gracefully")

  if (paymentWatcher) {
    await paymentWatcher.stop()
  }

  if (db) {
    await db.close()
  }

  server.close(() => {
    console.log("Server closed")
    process.exit(0)
  })
})

// Start server
async function startServer() {
  await initializeServices()

  server.listen(PORT, () => {
    console.log(`AgentPay Backend Server running on port ${PORT}`)
    console.log(`Health check: http://localhost:${PORT}/api/health`)
  })
}

startServer().catch((error) => {
  console.error("Failed to start server:", error)
  process.exit(1)
})
