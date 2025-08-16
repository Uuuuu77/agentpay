export const AI_MODELS = {
  openai: {
    "gpt-4": { name: "GPT-4", provider: "OpenAI", cost: 0.03 },
    "gpt-4-turbo": { name: "GPT-4 Turbo", provider: "OpenAI", cost: 0.01 },
    "gpt-3.5-turbo": { name: "GPT-3.5 Turbo", provider: "OpenAI", cost: 0.002 }
  },
  google: {
    "gemini-pro": { name: "Gemini Pro", provider: "Google", cost: 0.025 },
    "gemini-pro-vision": { name: "Gemini Pro Vision", provider: "Google", cost: 0.025 }
  },
  groq: {
    "llama-2-70b-4096": { name: "Llama 2 70B", provider: "Groq", cost: 0.0008 },
    "mixtral-8x7b-32768": { name: "Mixtral 8x7B", provider: "Groq", cost: 0.0006 }
  }
}

export const SERVICE_CONFIGS = {
  PROMPT: {
    name: "AI Prompt Engineering",
    basePrice: 25,
    models: AI_MODELS,
    deliverables: ["Optimized prompt", "Testing results", "Usage guidelines", "Performance metrics"],
    options: {
      targetModel: {
        type: "select",
        label: "Target AI Model",
        options: Object.keys(AI_MODELS).flatMap(provider => 
          Object.keys(AI_MODELS[provider as keyof typeof AI_MODELS])
        ),
        priceModifier: 0
      },
      complexity: {
        type: "select", 
        label: "Complexity Level",
        options: ["Basic", "Advanced", "Expert"],
        priceModifier: { Basic: 0, Advanced: 10, Expert: 25 }
      },
      iterations: {
        type: "select",
        label: "Optimization Rounds",
        options: ["1", "3", "5"],
        priceModifier: { "1": 0, "3": 15, "5": 30 }
      }
    }
  },
  LOGO: {
    name: "Logo & Brand Design",
    basePrice: 50,
    deliverables: ["High-res PNG files", "Vector SVG files", "Brand guidelines", "Color variations"],
    options: {
      style: {
        type: "select",
        label: "Design Style",
        options: ["Modern", "Classic", "Minimalist", "Creative"],
        priceModifier: 0
      },
      variations: {
        type: "select",
        label: "Logo Variations",
        options: ["3", "5", "10"],
        priceModifier: { "3": 0, "5": 20, "10": 40 }
      },
      formats: {
        type: "multi-select",
        label: "Additional Formats",
        options: ["PDF", "EPS", "AI", "Favicon"],
        priceModifier: 5 // per format
      }
    }
  },
  WEBSITE: {
    name: "Website Development",
    basePrice: 150,
    deliverables: ["Responsive website", "Source code", "Deployment guide", "Basic SEO"],
    options: {
      type: {
        type: "select",
        label: "Website Type",
        options: ["Landing Page", "Portfolio", "Business", "E-commerce"],
        priceModifier: { "Landing Page": 0, "Portfolio": 50, "Business": 100, "E-commerce": 200 }
      },
      framework: {
        type: "select",
        label: "Framework",
        options: ["React", "Next.js", "Vue", "HTML/CSS"],
        priceModifier: { "HTML/CSS": -25, "React": 0, "Next.js": 25, "Vue": 0 }
      },
      pages: {
        type: "select",
        label: "Number of Pages",
        options: ["1-3", "4-7", "8-15"],
        priceModifier: { "1-3": 0, "4-7": 75, "8-15": 150 }
      }
    }
  },
  DATA: {
    name: "Data Analysis & Visualization",
    basePrice: 75,
    deliverables: ["Analysis report", "Interactive charts", "Data insights", "Recommendations"],
    options: {
      dataSize: {
        type: "select",
        label: "Data Size",
        options: ["Small (<1MB)", "Medium (1-10MB)", "Large (10-100MB)"],
        priceModifier: { "Small (<1MB)": 0, "Medium (1-10MB)": 25, "Large (10-100MB)": 50 }
      },
      complexity: {
        type: "select",
        label: "Analysis Complexity",
        options: ["Basic", "Advanced", "Statistical"],
        priceModifier: { "Basic": 0, "Advanced": 30, "Statistical": 60 }
      }
    }
  },
  RESUME: {
    name: "Resume & CV Writing",
    basePrice: 40,
    deliverables: ["ATS-optimized resume", "Cover letter template", "LinkedIn optimization", "Format variations"],
    options: {
      level: {
        type: "select",
        label: "Experience Level",
        options: ["Entry Level", "Mid Level", "Senior Level", "Executive"],
        priceModifier: { "Entry Level": 0, "Mid Level": 15, "Senior Level": 25, "Executive": 40 }
      },
      industry: {
        type: "select",
        label: "Industry Focus",
        options: ["Tech", "Healthcare", "Finance", "Education", "General"],
        priceModifier: 0
      }
    }
  }
}

export type ServiceType = keyof typeof SERVICE_CONFIGS
export type ServiceConfig = typeof SERVICE_CONFIGS[ServiceType]