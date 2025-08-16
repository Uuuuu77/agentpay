"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ServiceGrid, FeaturedServiceGrid } from "@/components/services/service-grid"
import { serviceDefinitions } from "@/lib/services"
import { ServiceFilters } from "@/components/services/service-filters"
import { Clock, ArrowRight, Star, TrendingUp, Zap, Filter } from "lucide-react"

export default function ServicesPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All Categories")
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 200])
  const [deliveryFilter, setDeliveryFilter] = useState("All Delivery Times")
  const [sortBy, setSortBy] = useState("popularity")
  const [viewMode, setViewMode] = useState<"enhanced" | "legacy">("enhanced")

  const serviceCategories = {
    "Free Services": ["CONSULT", "CONSULTATION"],
    "AI & Development": ["PROMPT"],
    "Design & Creative": ["LOGO", "GRAPHIC"],
    "Analytics & Insights": ["DATA"],
    "Development & Tech": ["WEBSITE", "SCRIPT", "BUGFIX"],
    "Marketing & Growth": ["EMAIL", "LINKEDIN", "SAAS"],
    "Professional Services": ["RESUME"],
  }

  const getServiceBadge = (serviceType: string) => {
    if (["CONSULT", "CONSULTATION"].includes(serviceType)) 
      return { label: "FREE", variant: "default" as const, icon: Star, color: "bg-green-100 text-green-800" }
    if (serviceType === "SAAS") return { label: "Best Value", variant: "default" as const, icon: TrendingUp }
    if (["DATA", "WEBSITE", "BUGFIX"].includes(serviceType))
      return { label: "Most Popular", variant: "secondary" as const, icon: Star }
    if (["PROMPT", "LINKEDIN"].includes(serviceType))
      return { label: "Fast Delivery", variant: "outline" as const, icon: Zap }
    return null
  }

  // Handle service selection from enhanced grid
  const handleServiceSelect = (serviceType: string, options: Record<string, any>) => {
    // Navigate to service page with options as query params
    const searchParams = new URLSearchParams()
    Object.entries(options).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        searchParams.append(key, value.join(','))
      } else {
        searchParams.append(key, value.toString())
      }
    })
    
    const queryString = searchParams.toString()
    const url = `/services/${serviceType.toLowerCase()}${queryString ? `?${queryString}` : ''}`
    router.push(url)
  }

  // Filter and sort legacy services for comparison
  const filteredAndSortedServices = useMemo(() => {
    const filtered = serviceDefinitions.filter((service) => {
      const matchesSearch =
        searchQuery === "" ||
        service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.deliverables.some((d) => d.toLowerCase().includes(searchQuery.toLowerCase()))

      const matchesCategory =
        selectedCategory === "All Categories" ||
        Object.entries(serviceCategories).some(
          ([category, types]) => category === selectedCategory && types.includes(service.type),
        )

      const matchesPrice = service.basePrice >= priceRange[0] && service.basePrice <= priceRange[1]

      const deliveryDays = Math.round(service.slaHours / 24)
      const matchesDelivery =
        deliveryFilter === "All Delivery Times" ||
        (deliveryFilter === "Same Day (24h)" && deliveryDays <= 1) ||
        (deliveryFilter === "Fast (2-3 days)" && deliveryDays >= 2 && deliveryDays <= 3) ||
        (deliveryFilter === "Standard (4-7 days)" && deliveryDays >= 4 && deliveryDays <= 7)

      return matchesSearch && matchesCategory && matchesPrice && matchesDelivery
    })

    filtered.sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return a.basePrice - b.basePrice
        case "price-high":
          return b.basePrice - a.basePrice
        case "delivery-fast":
          return a.slaHours - b.slaHours
        case "newest":
          return ["WEBSITE", "EMAIL", "LINKEDIN", "DATA", "BUGFIX", "SAAS"].includes(a.type) ? -1 : 1
        case "popularity":
        default:
          const popularServices = ["CONSULTATION", "PROMPT", "LOGO", "DATA", "WEBSITE"]
          return popularServices.indexOf(a.type) - popularServices.indexOf(b.type)
      }
    })

    return filtered
  }, [searchQuery, selectedCategory, priceRange, deliveryFilter, sortBy])

  const activeFiltersCount = useMemo(() => {
    let count = 0
    if (searchQuery) count++
    if (selectedCategory !== "All Categories") count++
    if (priceRange[0] !== 0 || priceRange[1] !== 200) count++
    if (deliveryFilter !== "All Delivery Times") count++
    return count
  }, [searchQuery, selectedCategory, priceRange, deliveryFilter])

  const clearFilters = () => {
    setSearchQuery("")
    setSelectedCategory("All Categories")
    setPriceRange([0, 200])
    setDeliveryFilter("All Delivery Times")
    setSortBy("popularity")
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">Professional AI Services</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Choose from our comprehensive catalog of AI-powered professional services. Pay with crypto, get instant
          delivery.
        </p>
        
        {/* View Mode Toggle */}
        <div className="flex items-center justify-center mt-6 gap-2">
          <Button
            variant={viewMode === "enhanced" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("enhanced")}
            className="bg-orange-500 hover:bg-orange-600"
          >
            Enhanced Services
          </Button>
          <Button
            variant={viewMode === "legacy" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("legacy")}
          >
            Legacy View
          </Button>
        </div>
      </div>

      {viewMode === "enhanced" ? (
        <>
          {/* Featured Services Section */}
          <div className="mb-12">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2">Featured Services</h2>
              <p className="text-muted-foreground">
                Our most popular services with enhanced AI capabilities
              </p>
            </div>
            <FeaturedServiceGrid onServiceSelect={handleServiceSelect} />
          </div>

          {/* All Services Section */}
          <div className="mb-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2">All Services</h2>
              <p className="text-muted-foreground">
                Complete catalog with AI model selection and dynamic pricing
              </p>
            </div>
            <ServiceGrid onServiceSelect={handleServiceSelect} />
          </div>
        </>
      ) : (
        <>
          {/* Legacy Service Filters */}
          <div className="mb-8">
            <ServiceFilters
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
              priceRange={priceRange}
              onPriceRangeChange={setPriceRange}
              deliveryFilter={deliveryFilter}
              onDeliveryFilterChange={setDeliveryFilter}
              sortBy={sortBy}
              onSortChange={setSortBy}
              onClearFilters={clearFilters}
              activeFiltersCount={activeFiltersCount}
            />
          </div>

          {/* Results Summary */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-muted-foreground">
              Showing {filteredAndSortedServices.length} of {serviceDefinitions.length} legacy services
              {searchQuery && (
                <span className="ml-1">
                  for "<span className="font-medium">{searchQuery}</span>"
                </span>
              )}
            </p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Sorted by:</span>
              <Badge variant="outline">
                {sortBy === "popularity" && "Most Popular"}
                {sortBy === "price-low" && "Price: Low to High"}
                {sortBy === "price-high" && "Price: High to Low"}
                {sortBy === "delivery-fast" && "Fastest Delivery"}
                {sortBy === "newest" && "Newest Services"}
              </Badge>
            </div>
          </div>

          {/* Legacy Services Grid */}
          {filteredAndSortedServices.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-lg text-muted-foreground mb-4">No services match your current filters</p>
              <Button onClick={clearFilters} variant="outline">
                Clear All Filters
              </Button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
              {filteredAndSortedServices.map((service) => {
                const badge = getServiceBadge(service.type)
                const deliveryDays = Math.round(service.slaHours / 24)

                return (
                  <Card key={service.type} className="hover:shadow-lg transition-all duration-300 relative group">
                    {badge && (
                      <div className="absolute -top-2 -right-2 z-10">
                        <Badge 
                          variant={badge.variant} 
                          className={`shadow-sm gap-1 ${badge.color || ''}`}
                        >
                          <badge.icon className="h-3 w-3" />
                          {badge.label}
                        </Badge>
                      </div>
                    )}
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="group-hover:text-primary transition-colors">{service.name}</CardTitle>
                        <Badge variant="secondary">
                          {service.basePrice === 0 ? 'FREE' : `$${service.basePrice}+`}
                        </Badge>
                      </div>
                      <CardDescription>{service.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <h4 className="font-medium text-sm">Deliverables:</h4>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          {service.deliverables.slice(0, 3).map((deliverable, index) => (
                            <li key={index}>• {deliverable}</li>
                          ))}
                          {service.deliverables.length > 3 && (
                            <li className="text-xs">+ {service.deliverables.length - 3} more...</li>
                          )}
                        </ul>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>
                          {deliveryDays} day{deliveryDays !== 1 ? "s" : ""} delivery
                        </span>
                      </div>

                      <Button
                        onClick={() => router.push(`/services/${service.type.toLowerCase()}`)}
                        className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                      >
                        Order Now
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </>
      )}

      {/* How It Works Section */}
      <div className="mt-16 text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-4">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8 mt-8 mb-12">
            <div className="space-y-2">
              <div className="w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center font-bold mx-auto">
                1
              </div>
              <h3 className="font-medium">Choose & Configure</h3>
              <p className="text-sm text-muted-foreground">
                Select service, choose AI model, and customize options with dynamic pricing
              </p>
            </div>
            <div className="space-y-2">
              <div className="w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center font-bold mx-auto">
                2
              </div>
              <h3 className="font-medium">Pay with Crypto</h3>
              <p className="text-sm text-muted-foreground">Connect wallet and pay with USDC/USDT on 7 chains</p>
            </div>
            <div className="space-y-2">
              <div className="w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center font-bold mx-auto">
                3
              </div>
              <h3 className="font-medium">Get Delivery</h3>
              <p className="text-sm text-muted-foreground">Receive your completed service automatically via email</p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mt-12">
            <Card className="text-center">
              <CardHeader>
                <CardTitle className="text-lg">Free & Entry Level</CardTitle>
                <CardDescription>$0 - $45</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Research, Prompts, Graphics, Resume</p>
              </CardContent>
            </Card>
            <Card className="text-center border-orange-200">
              <CardHeader>
                <CardTitle className="text-lg">Professional</CardTitle>
                <CardDescription>$55 - $85</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Logo, Data Analysis, Website Planning</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardHeader>
                <CardTitle className="text-lg">Enterprise</CardTitle>
                <CardDescription>$100 - $200+</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Complex Analysis, Custom Solutions</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
