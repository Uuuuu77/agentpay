import express from "express"
import type { DatabaseManager } from "../database"

const router = express.Router()

router.get("/", async (req, res) => {
  try {
    const db: DatabaseManager = req.app.locals.db

    // Basic health check
    const health = {
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: "1.0.0",
      services: {
        database: "unknown",
        paymentWatcher: "unknown",
      },
    }

    // Check database connection
    try {
      // Simple query to test database
      await db.getInvoicesByStatus("CREATED" as any)
      health.services.database = "healthy"
    } catch (error) {
      health.services.database = "unhealthy"
      health.status = "degraded"
    }

    // Check payment watcher
    const paymentWatcher = req.app.locals.paymentWatcher
    if (paymentWatcher) {
      health.services.paymentWatcher = "healthy"
    } else {
      health.services.paymentWatcher = "unhealthy"
      health.status = "degraded"
    }

    const statusCode = health.status === "healthy" ? 200 : 503
    res.status(statusCode).json(health)
  } catch (error) {
    console.error("Health check error:", error)
    res.status(503).json({
      status: "unhealthy",
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : "Unknown error",
    })
  }
})

// Detailed system info (for debugging)
router.get("/system", (req, res) => {
  res.json({
    node: process.version,
    platform: process.platform,
    arch: process.arch,
    memory: process.memoryUsage(),
    uptime: process.uptime(),
    env: process.env.NODE_ENV || "development",
  })
})

export { router as healthRoutes }
