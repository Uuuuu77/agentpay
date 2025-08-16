"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import Link from "next/link"

interface ServiceDefinition {
  type: string
  name: string
  description: string
  basePrice: number
  deliverables: string[]
}

interface ServiceCardProps {
  service: ServiceDefinition
  className?: string
}

export function ServiceCard({ service, className }: ServiceCardProps) {
  return (
    <Card className={cn(
      "group hover:shadow-orange transition-all duration-300",
      "w-full max-w-sm mx-auto sm:max-w-none",
      "h-full flex flex-col",
      "border-2 border-transparent hover:border-primary/20",
      className
    )}>
      <CardHeader className="flex-shrink-0 pb-4">
        <div className="flex items-start justify-between mb-2">
          <CardTitle className="text-responsive-lg line-clamp-2 leading-tight">
            {service.name}
          </CardTitle>
          <Badge 
            variant="secondary" 
            className="ml-2 flex-shrink-0 bg-gradient-orange text-white"
          >
            ${service.basePrice}+
          </Badge>
        </div>
        <CardDescription className="text-responsive-sm line-clamp-3 leading-relaxed">
          {service.description}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="flex-grow flex flex-col justify-between pt-0">
        <div className="space-y-2 mb-6">
          <h4 className="text-responsive-sm font-semibold text-muted-foreground mb-3">
            What you get:
          </h4>
          {service.deliverables.slice(0, 4).map((deliverable, index) => (
            <div key={index} className="flex items-start text-responsive-sm text-muted-foreground">
              <span className="w-1.5 h-1.5 bg-primary rounded-full mr-3 mt-2 flex-shrink-0" />
              <span className="line-clamp-2 leading-relaxed">{deliverable}</span>
            </div>
          ))}
          {service.deliverables.length > 4 && (
            <div className="flex items-center text-responsive-sm text-muted-foreground">
              <span className="w-1.5 h-1.5 bg-primary rounded-full mr-3 mt-2 flex-shrink-0" />
              <span>+ {service.deliverables.length - 4} more deliverables</span>
            </div>
          )}
        </div>
        
        <Button 
          asChild 
          className="w-full mt-auto bg-gradient-orange hover:shadow-orange-lg touch-button"
          size="sm"
        >
          <Link href={`/services/${service.type.toLowerCase()}`}>
            Order Now
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}

export function ServiceCardSkeleton() {
  return (
    <Card className="w-full max-w-sm mx-auto sm:max-w-none h-full flex flex-col">
      <CardHeader className="flex-shrink-0 pb-4">
        <div className="flex items-start justify-between mb-2">
          <div className="h-6 bg-muted rounded w-3/4 animate-pulse" />
          <div className="h-6 bg-muted rounded w-16 animate-pulse ml-2" />
        </div>
        <div className="space-y-2">
          <div className="h-4 bg-muted rounded w-full animate-pulse" />
          <div className="h-4 bg-muted rounded w-5/6 animate-pulse" />
        </div>
      </CardHeader>
      
      <CardContent className="flex-grow flex flex-col justify-between pt-0">
        <div className="space-y-3 mb-6">
          <div className="h-4 bg-muted rounded w-1/2 animate-pulse" />
          {[...Array(3)].map((_, index) => (
            <div key={index} className="flex items-center">
              <div className="w-1.5 h-1.5 bg-muted rounded-full mr-3" />
              <div className="h-3 bg-muted rounded w-full animate-pulse" />
            </div>
          ))}
        </div>
        
        <div className="h-10 bg-muted rounded w-full animate-pulse" />
      </CardContent>
    </Card>
  )
}