// AI service configuration and clients
import OpenAI from "openai"
import { GoogleGenerativeAI } from "@google/generative-ai"
import { groq } from "@ai-sdk/groq"
import { generateText as aiGenerateText } from "ai"

// Initialize AI clients
export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export const googleAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_STUDIO_API_KEY || "")

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
  groq: {
    models: {
      llama: "llama-3.1-70b-versatile",
      mixtral: "mixtral-8x7b-32768",
      gemma: "gemma2-9b-it",
    },
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

export function validateAIKeys(): { valid: boolean; missing: string[] } {
  const required = ["OPENAI_API_KEY", "GOOGLE_AI_STUDIO_API_KEY", "GROQ_API_KEY"]

  const missing = required.filter((key) => !process.env[key])

  return {
    valid: missing.length === 0,
    missing,
  }
}

export async function generateText(
  prompt: string,
  service: "openai" | "google" | "groq" = "groq",
  model?: string,
): Promise<string> {
  try {
    // Try Groq first for fast open-source models
    if (service === "groq" && process.env.GROQ_API_KEY) {
      const selectedModel = model || AI_CONFIG.groq.models.llama
      const { text } = await aiGenerateText({
        model: groq(selectedModel),
        prompt,
        maxTokens: AI_CONFIG.groq.maxTokens,
        temperature: AI_CONFIG.groq.temperature,
      })
      return text
    }

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

    if (service === "groq") {
      console.log("Falling back to OpenAI...")
      return generateText(prompt, "openai")
    } else if (service === "openai") {
      console.log("Falling back to Google AI...")
      return generateText(prompt, "google")
    }

    throw error
  }
}

export async function generateWithGroq(
  prompt: string,
  modelType: "llama" | "mixtral" | "gemma" = "llama",
): Promise<string> {
  const model = AI_CONFIG.groq.models[modelType]
  return generateText(prompt, "groq", model)
}

export async function generateCode(prompt: string, language = "typescript"): Promise<string> {
  const codePrompt = `Generate ${language} code for: ${prompt}

Requirements:
- Clean, production-ready code
- Include proper error handling
- Add TypeScript types where applicable
- Follow best practices

Code:`

  // Use Mixtral for code generation (good at coding tasks)
  return generateWithGroq(codePrompt, "mixtral")
}

export async function generateCreativeContent(prompt: string, type = "marketing"): Promise<string> {
  const creativePrompt = `Create ${type} content for: ${prompt}

Requirements:
- Engaging and professional tone
- Clear and compelling messaging
- Appropriate for business use
- Creative but not overly casual

Content:`

  // Use Llama for creative tasks
  return generateWithGroq(creativePrompt, "llama")
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
