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
  {
    type: ServiceType.WEBSITE,
    name: "Landing Page Design",
    description: "Custom responsive landing page with modern design and optimized conversion",
    basePrice: 85,
    options: {
      sections: {
        type: "number",
        label: "Number of sections",
        default: 5,
        priceModifier: 15,
      },
      animations: {
        type: "boolean",
        label: "Include animations & interactions",
        default: true,
        priceModifier: 20,
      },
      mobileOptimization: {
        type: "boolean",
        label: "Mobile-first design",
        default: true,
        priceModifier: 0,
      },
      industry: {
        type: "select",
        label: "Industry focus",
        default: "Tech",
        options: ["Tech", "E-commerce", "SaaS", "Healthcare", "Finance", "Creative"],
        priceModifier: 0,
      },
    },
    deliverables: [
      "Complete HTML/CSS/JS files",
      "Responsive design (mobile/tablet/desktop)",
      "Source files and assets",
      "SEO-optimized structure",
      "Performance optimized code",
    ],
    slaHours: 120,
  },
  {
    type: ServiceType.EMAIL,
    name: "Email Marketing Series",
    description: "Complete email marketing campaign with templates and automation sequences",
    basePrice: 55,
    options: {
      emailCount: {
        type: "number",
        label: "Number of emails",
        default: 5,
        priceModifier: 12,
      },
      templates: {
        type: "boolean",
        label: "Include HTML templates",
        default: true,
        priceModifier: 25,
      },
      automation: {
        type: "select",
        label: "Campaign type",
        default: "Welcome Series",
        options: ["Welcome Series", "Nurture Campaign", "Product Launch", "Re-engagement", "Sales Funnel"],
        priceModifier: 10,
      },
      personalization: {
        type: "boolean",
        label: "Advanced personalization",
        default: false,
        priceModifier: 20,
      },
    },
    deliverables: [
      "Email sequence strategy",
      "Copywritten email content",
      "HTML email templates",
      "Subject line variations",
      "A/B testing recommendations",
    ],
    slaHours: 72,
  },
  {
    type: ServiceType.LINKEDIN,
    name: "LinkedIn Profile Makeover",
    description: "Complete LinkedIn profile optimization for professional networking and opportunities",
    basePrice: 65,
    options: {
      industry: {
        type: "select",
        label: "Target industry",
        default: "Technology",
        options: ["Technology", "Finance", "Marketing", "Sales", "Consulting", "Healthcare", "Creative"],
        priceModifier: 0,
      },
      contentStrategy: {
        type: "boolean",
        label: "Include content strategy plan",
        default: true,
        priceModifier: 25,
      },
      postTemplates: {
        type: "number",
        label: "LinkedIn post templates",
        default: 10,
        priceModifier: 3,
      },
      networking: {
        type: "boolean",
        label: "Networking message templates",
        default: true,
        priceModifier: 15,
      },
    },
    deliverables: [
      "Optimized profile headline",
      "Professional summary rewrite",
      "Experience section optimization",
      "Skills & endorsements strategy",
      "Content calendar with post ideas",
      "Connection request templates",
    ],
    slaHours: 48,
  },
  {
    type: ServiceType.DATA,
    name: "Data Analysis Report",
    description: "Professional data analysis with insights, visualizations, and actionable recommendations",
    basePrice: 95,
    options: {
      dataSize: {
        type: "select",
        label: "Dataset size",
        default: "Medium (1K-10K rows)",
        options: ["Small (<1K rows)", "Medium (1K-10K rows)", "Large (10K-100K rows)", "XL (100K+ rows)"],
        priceModifier: 30,
      },
      visualizations: {
        type: "number",
        label: "Number of charts/graphs",
        default: 8,
        priceModifier: 8,
      },
      insights: {
        type: "boolean",
        label: "AI-powered insights & recommendations",
        default: true,
        priceModifier: 25,
      },
      dashboard: {
        type: "boolean",
        label: "Interactive dashboard",
        default: false,
        priceModifier: 50,
      },
    },
    deliverables: [
      "Clean, processed dataset",
      "Statistical analysis report",
      "Professional visualizations",
      "Key insights & recommendations",
      "Executive summary",
      "Raw analysis files (Python/R)",
    ],
    slaHours: 96,
  },
  {
    type: ServiceType.BUGFIX,
    name: "Bug Fix & Code Review",
    description: "Professional debugging, code review, and optimization for web applications",
    basePrice: 75,
    options: {
      complexity: {
        type: "select",
        label: "Issue complexity",
        default: "Medium",
        options: ["Simple", "Medium", "Complex", "Critical"],
        priceModifier: 25,
      },
      codeReview: {
        type: "boolean",
        label: "Include full code review",
        default: true,
        priceModifier: 30,
      },
      testing: {
        type: "boolean",
        label: "Add test cases",
        default: true,
        priceModifier: 20,
      },
      documentation: {
        type: "boolean",
        label: "Update documentation",
        default: false,
        priceModifier: 15,
      },
      technology: {
        type: "select",
        label: "Technology stack",
        default: "JavaScript/Node.js",
        options: ["JavaScript/Node.js", "Python", "React/Next.js", "PHP", "Java", "C#/.NET"],
        priceModifier: 0,
      },
    },
    deliverables: [
      "Fixed code with explanations",
      "Code review report",
      "Test cases and validation",
      "Performance optimization notes",
      "Best practices recommendations",
    ],
    slaHours: 72,
  },
  {
    type: ServiceType.SAAS,
    name: "SaaS Startup Launch Kit",
    description: "Complete startup package with MVP planning, pitch deck, and go-to-market strategy",
    basePrice: 150,
    options: {
      pitchDeck: {
        type: "boolean",
        label: "Include investor pitch deck",
        default: true,
        priceModifier: 40,
      },
      businessPlan: {
        type: "boolean",
        label: "Detailed business plan",
        default: true,
        priceModifier: 35,
      },
      mvpSpecs: {
        type: "boolean",
        label: "MVP technical specifications",
        default: true,
        priceModifier: 30,
      },
      marketingStrategy: {
        type: "boolean",
        label: "Go-to-market strategy",
        default: true,
        priceModifier: 25,
      },
      financialModel: {
        type: "boolean",
        label: "Financial projections model",
        default: false,
        priceModifier: 45,
      },
      industry: {
        type: "select",
        label: "Industry focus",
        default: "B2B SaaS",
        options: ["B2B SaaS", "B2C App", "E-commerce", "FinTech", "HealthTech", "EdTech"],
        priceModifier: 0,
      },
    },
    deliverables: [
      "Professional pitch deck (15-20 slides)",
      "Executive summary & business plan",
      "MVP feature specifications",
      "Market analysis & competitor research",
      "Financial projections spreadsheet",
      "Go-to-market strategy document",
      "Brand identity guidelines",
    ],
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
      } else if (optionDef.type === "select" && optionDef.priceModifier > 0) {
        const selectedIndex = optionDef.options?.indexOf(value as string) || 0
        if (selectedIndex > 0) {
          price += optionDef.priceModifier
        }
      }
    }
  })

  return price
}
