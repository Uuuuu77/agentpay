"use client"

import React from 'react'
import { EnhancedServiceCard } from './service-card'
import { SERVICE_CONFIGS } from '@/lib/services/service-config'

// Service configurations using the new system
const ENHANCED_SERVICES = {
  CONSULTATION: {
    name: "Free AI Research Buddy",
    basePrice: 0,
    description: "Get personalized research reports on any topic, delivered instantly",
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
        priceModifier: 0
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
  },

  PROMPT: {
    name: "AI Prompt Engineering",
    basePrice: 25,
    description: "Optimize prompts for maximum AI model performance",
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
        options: ["GPT-4", "GPT-4 Turbo", "GPT-3.5 Turbo", "Gemini Pro", "Llama 2 70B", "Mixtral 8x7B"],
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
        priceModifier: 2
      }
    },
    estimatedDelivery: "2-4 hours",
    category: "AI & Development"
  },

  LOGO: {
    name: "Logo & Brand Design",
    basePrice: 45,
    description: "Professional logo design with brand guidelines",
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
        priceModifier: 8
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
        priceModifier: 12
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

  SOCIAL_MEDIA: {
    name: "AI Social Media Manager",
    basePrice: 95,
    description: "Complete social media management package with content calendar, posts, and engagement strategy",
    deliverables: [
      "30-day content calendar",
      "60 ready-to-post content pieces",
      "Custom hashtag strategy",
      "Engagement optimization guide",
      "Brand voice guidelines",
      "Analytics tracking setup"
    ],
    options: {
      platforms: {
        type: "multiselect" as const,
        label: "Social Media Platforms",
        options: ["Instagram", "Twitter/X", "LinkedIn", "Facebook", "TikTok", "YouTube Shorts"],
        priceModifier: 15 // Additional platform cost
      },
      contentStyle: {
        type: "select" as const,
        label: "Content Style",
        options: ["Professional & Corporate", "Casual & Friendly", "Trendy & Modern", "Educational", "Inspirational"],
        priceModifier: { "Professional & Corporate": 0, "Casual & Friendly": 0, "Trendy & Modern": 10, "Educational": 5, "Inspirational": 5 }
      },
      contentTypes: {
        type: "multiselect" as const,
        label: "Content Types",
        options: ["Regular Posts", "Stories Content", "Reels/Videos", "Carousel Posts", "Interactive Polls", "Quote Graphics"],
        priceModifier: 8 // Per content type
      },
      brandAssets: {
        type: "boolean" as const,
        label: "Brand Asset Creation",
        description: "Custom graphics, templates, and visual elements",
        priceModifier: 25
      },
      competitorAnalysis: {
        type: "boolean" as const,
        label: "Competitor Analysis",
        description: "Analyze top 5 competitors with insights",
        priceModifier: 20
      },
      hashtagResearch: {
        type: "select" as const,
        label: "Hashtag Research",
        options: ["Basic (50 hashtags)", "Advanced (150+ hashtags)", "Premium (300+ hashtags)"],
        priceModifier: { "Basic (50 hashtags)": 0, "Advanced (150+ hashtags)": 15, "Premium (300+ hashtags)": 30 }
      },
      urgentDelivery: {
        type: "boolean" as const,
        label: "Rush Delivery (2-3 days)",
        priceModifier: 40
      }
    },
    estimatedDelivery: "4-5 days",
    category: "Marketing & Content"
  }
}

interface ServiceGridProps {
  onServiceSelect?: (serviceType: string, options: Record<string, any>) => void
  compact?: boolean
  featuredServices?: string[]
  className?: string
}

export function ServiceGrid({ 
  onServiceSelect, 
  compact = false, 
  featuredServices = ['CONSULTATION', 'PROMPT', 'LOGO', 'DATA', 'WEBSITE', 'SOCIAL_MEDIA'],
  className = ""
}: ServiceGridProps) {
  return (
    <div className={`grid gap-6 ${compact 
      ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
      : 'grid-cols-1 lg:grid-cols-2 xl:grid-cols-3'
    } ${className}`}>
      {Object.entries(ENHANCED_SERVICES).map(([serviceType, serviceConfig]) => (
        <EnhancedServiceCard
          key={serviceType}
          serviceType={serviceType}
          serviceConfig={serviceConfig}
          onSelect={onServiceSelect}
          featured={featuredServices.includes(serviceType)}
          compact={compact}
        />
      ))}
    </div>
  )
}

export function FeaturedServiceGrid({ 
  onServiceSelect,
  className = ""
}: {
  onServiceSelect?: (serviceType: string, options: Record<string, any>) => void
  className?: string
}) {
  const featuredServices = ['CONSULTATION', 'PROMPT', 'LOGO', 'DATA', 'WEBSITE', 'SOCIAL_MEDIA']
  
  return (
    <div className={`grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 ${className}`}>
      {featuredServices.map((serviceType) => (
        <EnhancedServiceCard
          key={serviceType}
          serviceType={serviceType}
          serviceConfig={ENHANCED_SERVICES[serviceType as keyof typeof ENHANCED_SERVICES]}
          onSelect={onServiceSelect}
          featured={true}
          compact={true}
        />
      ))}
    </div>
  )
}