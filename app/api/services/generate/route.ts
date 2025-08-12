import { type NextRequest, NextResponse } from "next/server"
import { generateText, generateImage, validateAIKeys } from "@/lib/ai-services"

export async function POST(request: NextRequest) {
  try {
    const { type, prompt, service = "openai" } = await request.json()

    // Validate API keys
    const validation = validateAIKeys()
    if (!validation.valid) {
      return NextResponse.json(
        {
          error: "Missing required API keys",
          missing: validation.missing,
        },
        { status: 400 },
      )
    }

    let result

    switch (type) {
      case "text":
        result = await generateText(prompt, service)
        break
      case "image":
        result = await generateImage(prompt)
        break
      default:
        return NextResponse.json({ error: "Invalid generation type" }, { status: 400 })
    }

    return NextResponse.json({ result })
  } catch (error) {
    console.error("Generation error:", error)
    return NextResponse.json(
      {
        error: "Generation failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function GET() {
  const validation = validateAIKeys()

  return NextResponse.json({
    status: validation.valid ? "ready" : "missing_keys",
    missing: validation.missing,
    available_services: {
      openai: !!process.env.OPENAI_API_KEY,
      google: !!process.env.GOOGLE_AI_STUDIO_API_KEY,
      replicate: !!process.env.REPLICATE_API_TOKEN,
      stability: !!process.env.STABILITY_API_KEY,
    },
  })
}
