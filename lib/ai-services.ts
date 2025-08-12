// AI service configuration and clients
import OpenAI from "openai"
import { GoogleGenerativeAI } from "@google/generative-ai"

// Initialize AI clients
export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export const googleAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_STUDIO_API_KEY || "")

// Service configuration
export const AI_CONFIG = {
  openai: {
    model: "gpt-4o-mini",
    maxTokens: 4000,
    temperature: 0.7,
  },
  google: {
    model: "gemini-1.5-flash",
    maxTokens: 4000,
    temperature: 0.7,
  },
  image: {
    model: "dall-e-3",
    size: "1024x1024" as const,
    quality: "standard" as const,
  },
  timeouts: {
    generation: Number.parseInt(process.env.SERVICE_TIMEOUT || "300000"),
    upload: 60000,
  },
}

// Validate API keys
export function validateAIKeys(): { valid: boolean; missing: string[] } {
  const required = ["OPENAI_API_KEY", "GOOGLE_AI_STUDIO_API_KEY"]

  const missing = required.filter((key) => !process.env[key])

  return {
    valid: missing.length === 0,
    missing,
  }
}

// Generate text with fallback between services
export async function generateText(prompt: string, service: "openai" | "google" = "openai"): Promise<string> {
  try {
    if (service === "openai" && process.env.OPENAI_API_KEY) {
      const response = await openai.chat.completions.create({
        model: AI_CONFIG.openai.model,
        messages: [{ role: "user", content: prompt }],
        max_tokens: AI_CONFIG.openai.maxTokens,
        temperature: AI_CONFIG.openai.temperature,
      })

      return response.choices[0]?.message?.content || ""
    }

    if (service === "google" && process.env.GOOGLE_AI_STUDIO_API_KEY) {
      const model = googleAI.getGenerativeModel({ model: AI_CONFIG.google.model })
      const result = await model.generateContent(prompt)
      return result.response.text()
    }

    throw new Error(`No API key available for ${service}`)
  } catch (error) {
    console.error(`AI generation failed for ${service}:`, error)
    throw error
  }
}

// Generate images
export async function generateImage(prompt: string): Promise<string> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OpenAI API key required for image generation")
  }

  try {
    const response = await openai.images.generate({
      model: AI_CONFIG.image.model,
      prompt,
      size: AI_CONFIG.image.size,
      quality: AI_CONFIG.image.quality,
      n: 1,
    })

    return response.data[0]?.url || ""
  } catch (error) {
    console.error("Image generation failed:", error)
    throw error
  }
}
