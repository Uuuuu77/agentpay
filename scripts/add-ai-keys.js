console.log("🤖 Setting up AI Service Keys for AgentPay...\n")

const requiredKeys = {
  // AI Service Keys
  OPENAI_API_KEY: "Your OpenAI API key from https://platform.openai.com/api-keys",
  GOOGLE_AI_STUDIO_API_KEY: "Your Google AI Studio API key from https://aistudio.google.com/app/apikey",
  ANTHROPIC_API_KEY: "Your Anthropic API key from https://console.anthropic.com/",

  // Image Generation
  REPLICATE_API_TOKEN: "Your Replicate API token from https://replicate.com/account/api-tokens",
  STABILITY_API_KEY: "Your Stability AI API key from https://platform.stability.ai/account/keys",

  // Additional Services
  ELEVENLABS_API_KEY: "Your ElevenLabs API key for voice generation",
  RESEND_API_KEY: "Your Resend API key for email notifications",
  WEBHOOK_SECRET: "Random secret for webhook validation (generate: openssl rand -hex 32)",

  // Service Configuration
  MAX_FILE_SIZE: "10485760", // 10MB in bytes
  SERVICE_TIMEOUT: "300000", // 5 minutes in milliseconds
  DELIVERY_WEBHOOK_URL: "https://your-domain.com/api/webhooks/delivery",

  // Development
  NODE_ENV: "development",
  LOG_LEVEL: "info",
}

console.log("📋 Required Environment Variables:\n")

Object.entries(requiredKeys).forEach(([key, description]) => {
  console.log(`${key}=${description}`)
})

console.log("\n🔧 Add these to your Vercel project environment variables:")
console.log("1. Go to your Vercel dashboard")
console.log("2. Select your project")
console.log("3. Go to Settings > Environment Variables")
console.log("4. Add each key with its corresponding value\n")

console.log("🚀 Once added, redeploy your application to use the new keys!")
