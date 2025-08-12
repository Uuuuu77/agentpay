import { type ServiceDefinition, ServiceType } from "@/types"

export const serviceDefinitions: ServiceDefinition[] = [
  {
    type: ServiceType.LOGO,
    name: "Logo Design",
    description: "Professional logo design with multiple concepts and brand guidelines",
    basePrice: 45,
    options: {
      concepts: {
        type: "number",
        label: "Number of concepts",
        default: 2,
        priceModifier: 15,
      },
      revisions: {
        type: "number",
        label: "Revisions included",
        default: 2,
        priceModifier: 10,
      },
      vectorFiles: {
        type: "boolean",
        label: "Include vector files",
        default: true,
        priceModifier: 0,
      },
    },
    deliverables: ["Logo concepts (PNG)", "Vector files (SVG)", "Brand guidelines (PDF)", "Color palette"],
    slaHours: 72,
  },
  {
    type: ServiceType.GRAPHIC,
    name: "Social Graphics",
    description: "Social media graphics, thumbnails, and promotional materials",
    basePrice: 25,
    options: {
      quantity: {
        type: "number",
        label: "Number of graphics",
        default: 3,
        priceModifier: 8,
      },
      platform: {
        type: "select",
        label: "Platform",
        default: "Instagram",
        options: ["Instagram", "YouTube", "Twitter", "LinkedIn", "Facebook"],
        priceModifier: 0,
      },
    },
    deliverables: ["High-res graphics (PNG)", "Source files", "Multiple sizes"],
    slaHours: 48,
  },
  {
    type: ServiceType.SCRIPT,
    name: "Automation Script",
    description: "Custom automation scripts and small tools",
    basePrice: 60,
    options: {
      runtime: {
        type: "select",
        label: "Runtime",
        default: "Python",
        options: ["Python", "Node.js", "Bash"],
        priceModifier: 0,
      },
      complexity: {
        type: "select",
        label: "Complexity",
        default: "Simple",
        options: ["Simple", "Medium", "Complex"],
        priceModifier: 30,
      },
    },
    deliverables: ["Script file", "Documentation", "Usage examples", "Requirements file"],
    slaHours: 96,
  },
  {
    type: ServiceType.PROMPT,
    name: "Prompt Engineering",
    description: "Optimized prompts for AI models with examples and tuning",
    basePrice: 35,
    options: {
      targetModel: {
        type: "select",
        label: "Target model",
        default: "GPT-4",
        options: ["GPT-4", "Claude", "Gemini", "Custom"],
        priceModifier: 0,
      },
      iterations: {
        type: "number",
        label: "Optimization iterations",
        default: 3,
        priceModifier: 10,
      },
    },
    deliverables: ["Optimized prompts", "Example outputs", "Usage guide", "Parameter recommendations"],
    slaHours: 24,
  },
  {
    type: ServiceType.RESUME,
    name: "Resume Rewrite",
    description: "ATS-optimized resume with professional formatting",
    basePrice: 40,
    options: {
      industry: {
        type: "select",
        label: "Industry focus",
        default: "Tech",
        options: ["Tech", "Finance", "Healthcare", "Marketing", "General"],
        priceModifier: 0,
      },
      coverLetter: {
        type: "boolean",
        label: "Include cover letter",
        default: false,
        priceModifier: 20,
      },
    },
    deliverables: ["ATS-optimized PDF", "Editable DOCX", "LinkedIn summary", "Keywords list"],
    slaHours: 48,
  },
  {
    type: ServiceType.CONSULT,
    name: "Consultation",
    description: "Expert consultation with recorded session and notes",
    basePrice: 80,
    options: {
      duration: {
        type: "select",
        label: "Session duration",
        default: "60 minutes",
        options: ["30 minutes", "60 minutes", "90 minutes"],
        priceModifier: 40,
      },
      followUp: {
        type: "boolean",
        label: "Include follow-up session",
        default: false,
        priceModifier: 50,
      },
    },
    deliverables: ["Recorded session", "Session notes", "Action items", "Resource links"],
    slaHours: 168,
  },
]

export const getServiceByType = (type: ServiceType): ServiceDefinition | undefined => {
  return serviceDefinitions.find((service) => service.type === type)
}

export const calculateServicePrice = (service: ServiceDefinition, options: any): number => {
  let price = service.basePrice

  Object.entries(options).forEach(([key, value]) => {
    const optionDef = service.options[key]
    if (optionDef && optionDef.priceModifier) {
      if (optionDef.type === "number") {
        const defaultValue = optionDef.default || 1
        const additionalUnits = Math.max(0, (value as number) - defaultValue)
        price += additionalUnits * optionDef.priceModifier
      } else if (optionDef.type === "boolean" && value) {
        price += optionDef.priceModifier
      }
    }
  })

  return price
}
