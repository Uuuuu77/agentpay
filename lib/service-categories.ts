import type { ServiceDefinition } from "@/types"

export const serviceCategories = {
  "Design & Creative": ["LOGO", "GRAPHIC", "WEBSITE"],
  "Development & Technical": ["SCRIPT", "BUGFIX", "DATA"],
  "Marketing & Growth": ["EMAIL", "LINKEDIN", "SAAS"],
  "Professional Services": ["RESUME", "CONSULT", "PROMPT"],
}

export const getServiceCategory = (serviceType: string): string => {
  for (const [category, types] of Object.entries(serviceCategories)) {
    if (types.includes(serviceType)) {
      return category
    }
  }
  return "Other"
}

export const getServicesByCategory = (services: ServiceDefinition[], category: string): ServiceDefinition[] => {
  if (category === "All Categories") {
    return services
  }

  const categoryTypes = serviceCategories[category as keyof typeof serviceCategories] || []
  return services.filter((service) => categoryTypes.includes(service.type))
}

export const getPopularityScore = (serviceType: string): number => {
  const popularityMap: Record<string, number> = {
    SAAS: 10,
    DATA: 9,
    WEBSITE: 8,
    BUGFIX: 7,
    LOGO: 6,
    SCRIPT: 5,
    EMAIL: 4,
    LINKEDIN: 3,
    RESUME: 2,
    CONSULT: 1,
    GRAPHIC: 1,
    PROMPT: 1,
  }

  return popularityMap[serviceType] || 0
}

export const sortServices = (services: ServiceDefinition[], sortBy: string): ServiceDefinition[] => {
  const sorted = [...services]

  switch (sortBy) {
    case "price-low":
      return sorted.sort((a, b) => a.basePrice - b.basePrice)
    case "price-high":
      return sorted.sort((a, b) => b.basePrice - a.basePrice)
    case "delivery-fast":
      return sorted.sort((a, b) => a.slaHours - b.slaHours)
    case "newest":
      const newServices = ["WEBSITE", "EMAIL", "LINKEDIN", "DATA", "BUGFIX", "SAAS"]
      return sorted.sort((a, b) => {
        const aIsNew = newServices.includes(a.type) ? 1 : 0
        const bIsNew = newServices.includes(b.type) ? 1 : 0
        return bIsNew - aIsNew
      })
    case "popularity":
    default:
      return sorted.sort((a, b) => getPopularityScore(b.type) - getPopularityScore(a.type))
  }
}
