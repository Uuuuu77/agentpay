// AI Models Configuration
export const AI_MODELS = {
  openai: {
    "gpt-4": { 
      name: "GPT-4", 
      provider: "OpenAI", 
      cost: 0.03, 
      description: "Most capable model for complex tasks",
      strengths: ["Reasoning", "Complex analysis", "Creative writing"]
    },
    "gpt-4-turbo": { 
      name: "GPT-4 Turbo", 
      provider: "OpenAI", 
      cost: 0.01, 
      description: "Faster GPT-4 with latest knowledge",
      strengths: ["Speed", "Recent information", "Cost effective"]
    },
    "gpt-3.5-turbo": { 
      name: "GPT-3.5 Turbo", 
      provider: "OpenAI", 
      cost: 0.002,
      description: "Fast and efficient for standard tasks",
      strengths: ["Speed", "Cost effective", "General tasks"]
    }
  },
  google: {
    "gemini-pro": { 
      name: "Gemini Pro", 
      provider: "Google", 
      cost: 0.025,
      description: "Google's advanced AI model",
      strengths: ["Multimodal", "Code generation", "Analysis"]
    },
    "gemini-pro-vision": { 
      name: "Gemini Pro Vision", 
      provider: "Google", 
      cost: 0.025,
      description: "Advanced model with vision capabilities",
      strengths: ["Image analysis", "Visual content", "Multimodal tasks"]
    }
  },
  groq: {
    "llama-2-70b": { 
      name: "Llama 2 70B", 
      provider: "Groq", 
      cost: 0.0008,
      description: "Open-source model optimized for speed",
      strengths: ["Ultra-fast inference", "Cost effective", "Privacy focused"]
    },
    "mixtral-8x7b": { 
      name: "Mixtral 8x7B", 
      provider: "Groq", 
      cost: 0.0006,
      description: "Mixture of experts model for efficiency",
      strengths: ["Fast inference", "Multilingual", "Technical tasks"]
    }
  }
} as const

// Service Type Definitions
export const SERVICE_CONFIGS = {
  PROMPT: {
    name: "AI Prompt Engineering",
    basePrice: 25,
    description: "Optimize prompts for maximum AI model performance",
    models: AI_MODELS,
    deliverables: [
      "Optimized prompt templates",
      "Performance testing results", 
      "Usage guidelines and best practices",
      "Variation examples for different use cases"
    ],
    options: {
      targetModel: {
        type: "select" as const,
        label: "Target AI Model",
        description: "Which AI model will use this prompt?",
        options: Object.keys(AI_MODELS).flatMap(providerKey => 
          Object.keys(AI_MODELS[providerKey as keyof typeof AI_MODELS])
        ),
        priceModifier: 0
      },
      complexity: {
        type: "select" as const,
        label: "Complexity Level", 
        description: "How complex is your prompt requirement?",
        options: ["Basic", "Advanced", "Expert"],
        priceModifier: { Basic: 0, Advanced: 10, Expert: 25 }
      },
      useCase: {
        type: "select" as const,
        label: "Primary Use Case",
        description: "What will this prompt be used for?",
        options: [
          "Content Creation",
          "Code Generation", 
          "Data Analysis",
          "Creative Writing",
          "Technical Documentation",
          "Customer Support",
          "Marketing Copy",
          "Educational Content"
        ],
        priceModifier: 0
      },
      optimization: {
        type: "multiselect" as const,
        label: "Optimization Goals",
        description: "What aspects should we optimize for?",
        options: [
          "Output Quality",
          "Response Speed",
          "Token Efficiency", 
          "Consistency",
          "Safety & Bias Reduction",
          "Creativity Enhancement"
        ],
        priceModifier: 2 // $2 per additional optimization goal
      }
    },
    estimatedDelivery: "2-4 hours",
    category: "AI & Development"
  },

  LOGO: {
    name: "Logo & Brand Design",
    basePrice: 45,
    description: "Professional logo design with brand guidelines",
    models: {
      primary: AI_MODELS.openai["gpt-4"],
      creative: AI_MODELS.google["gemini-pro-vision"]
    },
    deliverables: [
      "3-5 logo concept variations",
      "High-resolution files (PNG, SVG, PDF)",
      "Brand color palette",
      "Typography recommendations",
      "Logo usage guidelines",
      "Business card mockup"
    ],
    options: {
      style: {
        type: "select" as const,
        label: "Design Style",
        options: ["Modern", "Minimalist", "Classic", "Playful", "Professional", "Creative"],
        priceModifier: 0
      },
      industry: {
        type: "select" as const,
        label: "Industry",
        options: [
          "Technology", "Healthcare", "Finance", "Education", "Retail", 
          "Restaurant", "Real Estate", "Consulting", "Creative", "Other"
        ],
        priceModifier: 0
      },
      variations: {
        type: "select" as const,
        label: "Number of Variations",
        options: ["3 concepts", "5 concepts", "7 concepts"],
        priceModifier: { "3 concepts": 0, "5 concepts": 15, "7 concepts": 30 }
      },
      brandPackage: {
        type: "boolean" as const,
        label: "Include Brand Package",
        description: "Business cards, letterhead, and brand guidelines",
        priceModifier: 25
      }
    },
    estimatedDelivery: "3-6 hours",
    category: "Design & Creative"
  },

  DATA: {
    name: "Data Analysis & Visualization",
    basePrice: 55,
    description: "Transform raw data into actionable insights",
    models: {
      primary: AI_MODELS.openai["gpt-4"],
      analysis: AI_MODELS.google["gemini-pro"]
    },
    deliverables: [
      "Executive summary report",
      "Interactive data visualizations", 
      "Statistical analysis results",
      "Key insights and recommendations",
      "Data cleaning documentation",
      "Raw and processed datasets"
    ],
    options: {
      dataSource: {
        type: "select" as const,
        label: "Data Source",
        options: ["CSV/Excel", "Database", "API", "Web Scraping", "Multiple Sources"],
        priceModifier: { "CSV/Excel": 0, "Database": 10, "API": 15, "Web Scraping": 25, "Multiple Sources": 35 }
      },
      analysisType: {
        type: "multiselect" as const,
        label: "Analysis Type",
        options: [
          "Descriptive Statistics",
          "Trend Analysis", 
          "Correlation Analysis",
          "Predictive Modeling",
          "A/B Testing",
          "Cohort Analysis",
          "Sentiment Analysis"
        ],
        priceModifier: 8 // $8 per analysis type
      },
      visualizations: {
        type: "select" as const,
        label: "Visualization Complexity",
        options: ["Basic Charts", "Interactive Dashboards", "Custom Visualizations"],
        priceModifier: { "Basic Charts": 0, "Interactive Dashboards": 20, "Custom Visualizations": 40 }
      },
      dataSize: {
        type: "select" as const,
        label: "Dataset Size",
        options: ["Small (<1K rows)", "Medium (1K-10K rows)", "Large (10K-100K rows)", "Enterprise (100K+ rows)"],
        priceModifier: { "Small (<1K rows)": 0, "Medium (1K-10K rows)": 15, "Large (10K-100K rows)": 35, "Enterprise (100K+ rows)": 75 }
      }
    },
    estimatedDelivery: "4-8 hours",
    category: "Analytics & Insights"
  },

  WEBSITE: {
    name: "Website Development Plan",
    basePrice: 65,
    description: "Complete website development strategy and implementation plan",
    models: {
      primary: AI_MODELS.openai["gpt-4"],
      technical: AI_MODELS.groq["mixtral-8x7b"]
    },
    deliverables: [
      "Website architecture plan",
      "Technology stack recommendations",
      "Design mockups and wireframes",
      "Development timeline",
      "SEO optimization strategy",
      "Deployment and hosting plan",
      "Security and performance guidelines"
    ],
    options: {
      websiteType: {
        type: "select" as const,
        label: "Website Type",
        options: [
          "Business Website",
          "E-commerce Store", 
          "Portfolio Site",
          "Blog/Content Site",
          "SaaS Application",
          "Educational Platform",
          "Community/Forum"
        ],
        priceModifier: { 
          "Business Website": 0, 
          "E-commerce Store": 25, 
          "Portfolio Site": -10,
          "Blog/Content Site": 0,
          "SaaS Application": 50,
          "Educational Platform": 35,
          "Community/Forum": 40
        }
      },
      complexity: {
        type: "select" as const,
        label: "Complexity Level",
        options: ["Simple (1-5 pages)", "Medium (6-15 pages)", "Complex (16+ pages)", "Enterprise"],
        priceModifier: { "Simple (1-5 pages)": 0, "Medium (6-15 pages)": 20, "Complex (16+ pages)": 45, "Enterprise": 85 }
      },
      features: {
        type: "multiselect" as const,
        label: "Required Features",
        options: [
          "User Authentication",
          "Payment Processing",
          "Content Management",
          "Search Functionality",
          "Multi-language Support",
          "Mobile App Integration",
          "Third-party API Integration",
          "Advanced Analytics"
        ],
        priceModifier: 12 // $12 per feature
      },
      technology: {
        type: "select" as const,
        label: "Technology Preference",
        options: ["WordPress", "React/Next.js", "Vue.js", "No Preference", "Custom Recommendation"],
        priceModifier: 0
      }
    },
    estimatedDelivery: "6-12 hours",
    category: "Development & Tech"
  },

  CONSULTATION: {
    name: "Free AI Research Buddy",
    basePrice: 0,
    description: "Get personalized research reports on any topic, delivered instantly",
    models: {
      primary: AI_MODELS.openai["gpt-4-turbo"],
      fallback: AI_MODELS.google["gemini-pro"]
    },
    deliverables: [
      "Comprehensive research report",
      "Key findings and insights",
      "Actionable recommendations", 
      "Source references and citations",
      "Executive summary",
      "Downloadable PDF report"
    ],
    options: {
      researchDepth: {
        type: "select" as const,
        label: "Research Depth",
        options: ["Quick Overview", "Standard Analysis", "Deep Dive"],
        priceModifier: 0 // Free service
      },
      deliveryFormat: {
        type: "select" as const,
        label: "Delivery Format",
        options: ["Email Report", "Detailed PDF", "Executive Summary"],
        priceModifier: 0
      },
      industry: {
        type: "select" as const,
        label: "Industry Focus",
        options: [
          "Technology", "Healthcare", "Finance", "Education", "Marketing",
          "Business Strategy", "AI & ML", "Blockchain", "Startups", "General"
        ],
        priceModifier: 0
      }
    },
    estimatedDelivery: "5-15 minutes",
    category: "Research & Analysis",
    rateLimits: {
      daily: 3,
      message: "Free service limited to 3 requests per day"
    }
  }
} as const

// Service Categories
export const SERVICE_CATEGORIES = {
  "AI & Development": {
    name: "AI & Development",
    description: "AI-powered development and automation services",
    icon: "code",
    services: ["PROMPT"]
  },
  "Design & Creative": {
    name: "Design & Creative", 
    description: "Professional design and creative services",
    icon: "palette",
    services: ["LOGO"]
  },
  "Analytics & Insights": {
    name: "Analytics & Insights",
    description: "Data analysis and business intelligence",
    icon: "chart",
    services: ["DATA"]
  },
  "Development & Tech": {
    name: "Development & Tech",
    description: "Technical planning and development services", 
    icon: "monitor",
    services: ["WEBSITE"]
  },
  "Research & Analysis": {
    name: "Research & Analysis",
    description: "Research and consultation services",
    icon: "search",
    services: ["CONSULTATION"]
  }
} as const

// Utility functions
export function getServiceConfig(serviceType: keyof typeof SERVICE_CONFIGS) {
  return SERVICE_CONFIGS[serviceType]
}

export function calculateServicePrice(
  serviceType: keyof typeof SERVICE_CONFIGS,
  options: Record<string, any>
): number {
  const config = SERVICE_CONFIGS[serviceType]
  let totalPrice = config.basePrice

  Object.entries(options).forEach(([key, value]) => {
    const option = (config.options as any)[key]
    if (!option) return

    if (typeof option.priceModifier === 'number') {
      if (option.type === 'boolean' && value) {
        totalPrice += option.priceModifier
      } else if (option.type === 'multiselect' && Array.isArray(value)) {
        totalPrice += option.priceModifier * value.length
      }
    } else if (typeof option.priceModifier === 'object' && value in option.priceModifier) {
      totalPrice += (option.priceModifier as any)[value]
    }
  })

  return Math.max(totalPrice, 0) // Ensure price is never negative
}

export function getModelForService(
  serviceType: keyof typeof SERVICE_CONFIGS,
  modelPreference?: string
) {
  const config = SERVICE_CONFIGS[serviceType]
  
  // If specific model preference provided
  if (modelPreference) {
    for (const provider of Object.values(AI_MODELS)) {
      if (modelPreference in provider) {
        return (provider as any)[modelPreference]
      }
    }
  }

  // Return default model for service
  if ('primary' in config.models) {
    return config.models.primary
  }

  // Fallback to GPT-4
  return AI_MODELS.openai["gpt-4"]
}