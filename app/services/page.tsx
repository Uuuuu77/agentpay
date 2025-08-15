"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { serviceDefinitions } from "@/lib/services"
import { ServiceFilters } from "@/components/services/service-filters"
import { Clock, ArrowRight, Star, TrendingUp, Zap } from "lucide-react"

export default function ServicesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All Categories")
  const [priceRange, setPriceRange] = useState<[number, number]>([20, 200])
  const [deliveryFilter, setDeliveryFilter] = useState("All Delivery Times")
  const [sortBy, setSortBy] = useState("popularity")

  const serviceCategories = {
    "Design & Creative": ["LOGO", "GRAPHIC", "WEBSITE"],
    "Development & Technical": ["SCRIPT", "BUGFIX", "DATA"],
    "Marketing & Growth": ["EMAIL", "LINKEDIN", "SAAS"],
    "Professional Services": ["RESUME", "CONSULT", "PROMPT"],
  }

  const getServiceBadge = (serviceType: string) => {
    if (serviceType === "SAAS") return { label: "Best Value", variant: "default" as const, icon: TrendingUp }
    if (["DATA", "WEBSITE", "BUGFIX"].includes(serviceType))
      return { label: "Most Popular", variant: "secondary" as const, icon: Star }
    if (["PROMPT", "LINKEDIN"].includes(serviceType))
      return { label: "Fast Delivery", variant: "outline" as const, icon: Zap }
    return null
  }

  // Filter and sort services
  const filteredAndSortedServices = useMemo(() => {
    const filtered = serviceDefinitions.filter((service) => {
      // Search filter
      const matchesSearch =
        searchQuery === "" ||
        service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.deliverables.some((d) => d.toLowerCase().includes(searchQuery.toLowerCase()))

      // Category filter
      const matchesCategory =
        selectedCategory === "All Categories" ||
        Object.entries(serviceCategories).some(
          ([category, types]) => category === selectedCategory && types.includes(service.type),
        )

      // Price filter
      const matchesPrice = service.basePrice >= priceRange[0] && service.basePrice <= priceRange[1]

      // Delivery filter
      const deliveryDays = Math.round(service.slaHours / 24)
      const matchesDelivery =
        deliveryFilter === "All Delivery Times" ||
        (deliveryFilter === "Same Day (24h)" && deliveryDays <= 1) ||
        (deliveryFilter === "Fast (2-3 days)" && deliveryDays >= 2 && deliveryDays <= 3) ||
        (deliveryFilter === "Standard (4-7 days)" && deliveryDays >= 4 && deliveryDays <= 7)

      return matchesSearch && matchesCategory && matchesPrice && matchesDelivery
    })

    // Sort services
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
          const popularServices = ["SAAS", "DATA", "WEBSITE", "BUGFIX", "LOGO", "SCRIPT"]
          return popularServices.indexOf(a.type) - popularServices.indexOf(b.type)
      }
    })

    return filtered
  }, [searchQuery, selectedCategory, priceRange, deliveryFilter, sortBy])

  // Count active filters
  const activeFiltersCount = useMemo(() => {
    let count = 0
    if (searchQuery) count++
    if (selectedCategory !== "All Categories") count++
    if (priceRange[0] !== 20 || priceRange[1] !== 200) count++
    if (deliveryFilter !== "All Delivery Times") count++
    return count
  }, [searchQuery, selectedCategory, priceRange, deliveryFilter])

  const clearFilters = () => {
    setSearchQuery("")
    setSelectedCategory("All Categories")
    setPriceRange([20, 200])
    setDeliveryFilter("All Delivery Times")
    setSortBy("popularity")
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">12 Professional Services</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Choose from our comprehensive catalog of AI-powered professional services. Pay with crypto, get instant
          delivery.
        </p>
      </div>

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
          Showing {filteredAndSortedServices.length} of {serviceDefinitions.length} services
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

      {/* Services Grid */}
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
                    <Badge variant={badge.variant} className="shadow-sm gap-1">
                      <badge.icon className="h-3 w-3" />
                      {badge.label}
                    </Badge>
                  </div>
                )}
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="group-hover:text-primary transition-colors">{service.name}</CardTitle>
                    <Badge variant="secondary">${service.basePrice}+</Badge>
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
                    asChild
                    className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                  >
                    <Link href={`/services/${service.type.toLowerCase()}`}>
                      Order Now
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <div className="mt-16 text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-4">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8 mt-8 mb-12">
            <div className="space-y-2">
              <div className="w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center font-bold mx-auto">
                1
              </div>
              <h3 className="font-medium">Choose Service</h3>
              <p className="text-sm text-muted-foreground">Select and configure your desired service from 12 options</p>
            </div>
            <div className="space-y-2">
              <div className="w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center font-bold mx-auto">
                2
              </div>
              <h3 className="font-medium">Pay with Crypto</h3>
              <p className="text-sm text-muted-foreground">Connect wallet and pay with USDC/USDT on 5 chains</p>
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
                <CardTitle className="text-lg">Entry Level</CardTitle>
                <CardDescription>$25 - $45</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Graphics, Prompts, Resume, LinkedIn</p>
              </CardContent>
            </Card>
            <Card className="text-center border-orange-200">
              <CardHeader>
                <CardTitle className="text-lg">Professional</CardTitle>
                <CardDescription>$55 - $85</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Logo, Email, Website, Bug Fix</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardHeader>
                <CardTitle className="text-lg">Premium</CardTitle>
                <CardDescription>$95 - $150</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Data Analysis, Consultation, SaaS Kit</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
