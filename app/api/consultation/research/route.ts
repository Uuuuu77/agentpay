import { NextRequest, NextResponse } from "next/server"
import { ResearchEngine } from "@/lib/services/research-engine"
import { ResearchDeliveryService } from "@/lib/email/research-delivery"

// Simple rate limiting store (in production, use Redis or database)
const requestStore = new Map<string, { count: number; resetTime: number }>()

function getRateLimit(ip: string): { allowed: boolean; remaining: number } {
  const now = Date.now()
  const windowMs = 24 * 60 * 60 * 1000 // 24 hours
  const maxRequests = 3

  const clientData = requestStore.get(ip) || { count: 0, resetTime: now + windowMs }
  
  // Reset if window has passed
  if (now > clientData.resetTime) {
    clientData.count = 0
    clientData.resetTime = now + windowMs
  }

  const allowed = clientData.count < maxRequests
  if (allowed) {
    clientData.count++
  }

  requestStore.set(ip, clientData)
  
  return {
    allowed,
    remaining: Math.max(0, maxRequests - clientData.count)
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get client IP for rate limiting
    const forwarded = request.headers.get('x-forwarded-for')
    const ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'unknown'
    
    // Check rate limit
    const rateLimit = getRateLimit(ip)
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { 
          error: "Research limit reached. You can request 3 free research reports per day. Please try again tomorrow.",
          remaining: rateLimit.remaining
        },
        { status: 429 }
      )
    }

    const body = await request.json()
    const {
      name,
      email,
      researchTopic,
      specificQuestions,
      industry,
      targetAudience,
      researchDepth,
      preferredSources,
      deliverableFormat,
      context
    } = body

    // Validate required fields
    if (!name || !email || !researchTopic) {
      return NextResponse.json(
        { error: "Name, email, and research topic are required" },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Please provide a valid email address" },
        { status: 400 }
      )
    }

    // Create research request object
    const researchRequest = {
      researchTopic: researchTopic.trim(),
      specificQuestions: specificQuestions?.trim() || "",
      industry: industry || "general",
      targetAudience: targetAudience?.trim() || "general audience",
      researchDepth: researchDepth || "intermediate",
      preferredSources: preferredSources || [],
      deliverableFormat: deliverableFormat || "report",
      context: context?.trim() || ""
    }

    // Log the research request
    console.log(`Research request received for: ${researchRequest.researchTopic} (${email})`)

    // Start research generation (async - don't wait)
    generateAndDeliverResearch(researchRequest, email.trim(), name.trim())
      .catch(error => {
        console.error(`Background research failed for ${email}:`, error)
      })

    // Return immediate response to user
    return NextResponse.json({
      success: true,
      message: "Research request received! We'll deliver your personalized research to your inbox within 2-4 hours.",
      estimatedDelivery: "2-4 hours",
      email: email,
      topic: researchRequest.researchTopic,
      remaining: rateLimit.remaining - 1
    })

  } catch (error) {
    console.error("Research request error:", error)
    return NextResponse.json(
      { error: "Failed to process research request. Please try again." },
      { status: 500 }
    )
  }
}

// Async function to handle research generation and delivery
async function generateAndDeliverResearch(
  request: any,
  email: string,
  name: string
) {
  const researchEngine = new ResearchEngine()
  const deliveryService = new ResearchDeliveryService()

  try {
    console.log(`Starting research generation for: ${request.researchTopic}`)
    
    // Test email connection first
    const emailConnected = await deliveryService.testConnection()
    if (!emailConnected) {
      console.error("Email service not available")
      await sendErrorNotification(email, name, request.researchTopic, "Email service temporarily unavailable")
      return
    }
    
    // Generate research report
    const report = await researchEngine.conductResearch(request)
    
    console.log(`Research completed, delivering to: ${email}`)
    
    // Deliver via email
    await deliveryService.deliverResearch(email, name, report)
    
    console.log(`Research successfully delivered to: ${email}`)
    
    // Log successful delivery
    await logResearchDelivery(email, request.researchTopic, "delivered")
    
  } catch (error) {
    console.error(`Research generation failed for ${email}:`, error)
    
    // Send error email to user
    await sendErrorNotification(email, name, request.researchTopic, error instanceof Error ? error.message : String(error))
    
    // Log failed delivery
    await logResearchDelivery(email, request.researchTopic, "failed", error instanceof Error ? error.message : String(error))
  }
}

async function logResearchDelivery(
  email: string,
  topic: string,
  status: "delivered" | "failed",
  error?: string
) {
  try {
    // Log entry for analytics and monitoring
    const logEntry = {
      email,
      topic,
      status,
      error,
      timestamp: new Date().toISOString(),
    }
    
    // In production, store this in database
    console.log("Research delivery log:", logEntry)
  } catch (logError) {
    console.error("Failed to log research delivery:", logError)
  }
}

async function sendErrorNotification(
  email: string,
  name: string,
  topic: string,
  errorMessage: string
) {
  try {
    const deliveryService = new ResearchDeliveryService()
    await deliveryService.sendErrorNotification(email, name, topic, errorMessage)
  } catch (error) {
    console.error("Failed to send error email:", error)
  }
}