export const SOCIAL_MEDIA_CONFIG = {
  type: "SOCIAL_MEDIA",
  name: "AI Social Media Manager",
  description: "Complete social media management package with content calendar, posts, and engagement strategy",
  basePrice: 95,
  icon: "📱",
  category: "Marketing & Content",
  deliveryTime: "4-5 days",
  slaHours: 96,
  
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
      required: true,
      options: [
        { value: "instagram", label: "Instagram", priceModifier: 0 },
        { value: "twitter", label: "Twitter/X", priceModifier: 15 },
        { value: "linkedin", label: "LinkedIn", priceModifier: 20 },
        { value: "facebook", label: "Facebook", priceModifier: 15 },
        { value: "tiktok", label: "TikTok", priceModifier: 25 },
        { value: "youtube", label: "YouTube Shorts", priceModifier: 30 }
      ],
      default: ["instagram"]
    },

    industry: {
      type: "select" as const,
      label: "Business Industry",
      required: true,
      options: [
        "Technology", "Healthcare", "Finance", "E-commerce", "Food & Beverage",
        "Fashion", "Travel", "Education", "Real Estate", "Fitness", "Other"
      ],
      priceModifier: 0
    },

    contentStyle: {
      type: "select" as const, 
      label: "Content Style",
      required: true,
      options: [
        { value: "professional", label: "Professional & Corporate", priceModifier: 0 },
        { value: "casual", label: "Casual & Friendly", priceModifier: 0 },
        { value: "trendy", label: "Trendy & Modern", priceModifier: 10 },
        { value: "educational", label: "Educational & Informative", priceModifier: 5 },
        { value: "inspirational", label: "Inspirational & Motivational", priceModifier: 5 }
      ],
      default: "professional"
    },

    targetAudience: {
      type: "text" as const,
      label: "Target Audience",
      placeholder: "e.g., Small business owners, Tech professionals, Young parents",
      required: true,
      priceModifier: 0
    },

    contentTypes: {
      type: "multiselect" as const,
      label: "Content Types to Include",
      options: [
        { value: "posts", label: "Regular Posts", priceModifier: 0 },
        { value: "stories", label: "Stories Content", priceModifier: 10 },
        { value: "reels", label: "Reels/Short Videos", priceModifier: 20 },
        { value: "carousels", label: "Carousel Posts", priceModifier: 15 },
        { value: "polls", label: "Interactive Polls", priceModifier: 8 },
        { value: "quotes", label: "Quote Graphics", priceModifier: 5 }
      ],
      default: ["posts", "stories"]
    },

    brandAssets: {
      type: "boolean" as const,
      label: "Include Brand Asset Creation",
      description: "Create custom graphics, templates, and visual elements",
      priceModifier: 25,
      default: false
    },

    competitorAnalysis: {
      type: "boolean" as const,
      label: "Competitor Analysis",
      description: "Analyze top 5 competitors and include insights",
      priceModifier: 20,
      default: false
    },

    hashtagResearch: {
      type: "select" as const,
      label: "Hashtag Research Depth",
      options: [
        { value: "basic", label: "Basic (50 hashtags)", priceModifier: 0 },
        { value: "advanced", label: "Advanced (150+ hashtags)", priceModifier: 15 },
        { value: "premium", label: "Premium (300+ hashtags + trending)", priceModifier: 30 }
      ],
      default: "basic"
    },

    postingSchedule: {
      type: "select" as const,
      label: "Posting Frequency",
      options: [
        { value: "daily", label: "Daily (30+ posts)", priceModifier: 0 },
        { value: "twice-daily", label: "Twice Daily (60+ posts)", priceModifier: 20 },
        { value: "custom", label: "Custom Schedule", priceModifier: 10 }
      ],
      default: "daily"
    },

    analytics: {
      type: "boolean" as const,
      label: "Analytics & Tracking Setup",
      description: "Set up tracking and provide performance metrics template",
      priceModifier: 15,
      default: true
    },

    urgentDelivery: {
      type: "boolean" as const,
      label: "Rush Delivery (2-3 days)",
      priceModifier: 40,
      default: false
    }
  },

  requirements: [
    "Business name and description",
    "Website/social media links",
    "Brand colors and style preferences",
    "Key messages or values",
    "Competitor names (if analysis requested)"
  ],

  sampleWork: [
    "Content calendar template preview",
    "Sample post examples",
    "Hashtag strategy sample"
  ]
}