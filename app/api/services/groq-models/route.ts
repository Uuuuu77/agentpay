import { NextResponse } from "next/server"
import { AI_CONFIG } from "../../../../lib/ai-services"

export async function GET() {
  try {
    // Return available Groq models and their capabilities
    const models = {
      available: AI_CONFIG.groq.models,
      capabilities: {
        [AI_CONFIG.groq.models.llama]: {
          name: "Llama 3.1 70B",
          description: "Excellent for creative writing, content generation, and complex reasoning",
          bestFor: ["scripts", "marketing copy", "creative content", "analysis"],
        },
        [AI_CONFIG.groq.models.mixtral]: {
          name: "Mixtral 8x7B",
          description: "Great for code generation, structured tasks, and technical content",
          bestFor: ["code generation", "prompts", "technical writing", "structured data"],
        },
        [AI_CONFIG.groq.models.gemma]: {
          name: "Gemma2 9B",
          description: "Fast and efficient for general tasks and quick responses",
          bestFor: ["quick responses", "simple tasks", "chat", "summaries"],
        },
      },
      performance: {
        speed: "Ultra-fast inference (up to 750 tokens/second)",
        cost: "Cost-effective open-source models",
        reliability: "High availability with automatic fallbacks",
      },
    }

    return NextResponse.json(models)
  } catch (error) {
    console.error("Failed to fetch Groq models:", error)
    return NextResponse.json({ error: "Failed to fetch model information" }, { status: 500 })
  }
}
