export const CONSULTATION_CONFIG = {
  name: "AI Research Buddy",
  type: "CONSULTATION",
  price: 0, // Free service
  description: "Get personalized research and insights on any topic from our AI research assistant",
  icon: "🤖",
  badge: "FREE",
  deliveryMethod: "email",
  turnaroundTime: "2-4 hours",
  maxRequestsPerUser: 3, // Limit to prevent abuse
  maxTopicsPerRequest: 2,
  
  capabilities: [
    "Market research and analysis",
    "Technical topic deep-dives", 
    "Industry trend reports",
    "Competitive analysis",
    "Academic research summaries",
    "Business strategy insights",
    "Technology recommendations",
    "Educational content creation"
  ],

  limitations: [
    "No real-time discussion",
    "No voice/video calls", 
    "No file uploads",
    "Email-only delivery",
    "2-4 hour response time"
  ]
}

export const RESEARCH_INDUSTRIES = [
  "Technology", "Healthcare", "Finance", "E-commerce", "Education",
  "Marketing", "Real Estate", "Manufacturing", "Entertainment", "Other"
]

export const RESEARCH_SOURCES = [
  { id: "academic", label: "Academic Papers" },
  { id: "industry", label: "Industry Reports" }, 
  { id: "news", label: "Recent News & Trends" },
  { id: "market", label: "Market Data" },
  { id: "competitor", label: "Competitor Analysis" },
  { id: "social", label: "Social Media Insights" }
]

export const DELIVERABLE_FORMATS = [
  { id: "report", label: "Detailed Report", icon: "📄", description: "Comprehensive analysis with sections and subsections" },
  { id: "summary", label: "Executive Summary", icon: "📋", description: "Concise overview focusing on key insights" },
  { id: "bullets", label: "Key Points List", icon: "📝", description: "Organized bullet points with actionable items" },
  { id: "comparison", label: "Comparison Table", icon: "📊", description: "Side-by-side analysis and comparisons" },
  { id: "roadmap", label: "Strategy Roadmap", icon: "🗺️", description: "Strategic plan with timeline and milestones" }
]