"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Clock, Star, DollarSign, Zap, CheckCircle } from 'lucide-react'
import { cn } from "@/lib/utils"
import Link from "next/link"

// Legacy interface for backward compatibility
interface ServiceDefinition {
  type: string
  name: string
  description: string
  basePrice: number
  deliverables: string[]
}

// New service configuration interface
interface ServiceOption {
  type: 'select' | 'multiselect' | 'boolean'
  label: string
  description?: string
  options?: string[]
  priceModifier: number | Record<string, number>
}

interface ServiceConfig {
  name: string
  basePrice: number
  description: string
  deliverables: string[]
  options: Record<string, ServiceOption>
  estimatedDelivery: string
  category: string
  rateLimits?: {
    daily: number
    message: string
  }
}

// Enhanced service card props
interface EnhancedServiceCardProps {
  serviceConfig: ServiceConfig
  serviceType: string
  onSelect?: (serviceType: string, options: Record<string, any>) => void
  featured?: boolean
  compact?: boolean
  className?: string
}

// Legacy service card props
interface ServiceCardProps {
  service: ServiceDefinition
  className?: string
}

// Enhanced service card component
export function EnhancedServiceCard({ 
  serviceConfig, 
  serviceType, 
  onSelect, 
  featured = false, 
  compact = false,
  className 
}: EnhancedServiceCardProps) {
  const [selectedOptions, setSelectedOptions] = useState<Record<string, any>>({})
  const [currentPrice, setCurrentPrice] = useState(serviceConfig.basePrice)

  // Calculate price based on selected options
  const calculatePrice = (options: Record<string, any>) => {
    let totalPrice = serviceConfig.basePrice

    Object.entries(options).forEach(([key, value]) => {
      const option = serviceConfig.options[key]
      if (!option) return

      if (typeof option.priceModifier === 'number') {
        if (option.type === 'boolean' && value) {
          totalPrice += option.priceModifier
        } else if (option.type === 'multiselect' && Array.isArray(value)) {
          totalPrice += option.priceModifier * value.length
        }
      } else if (typeof option.priceModifier === 'object' && value in option.priceModifier) {
        totalPrice += option.priceModifier[value]
      }
    })

    return Math.max(totalPrice, 0)
  }

  const handleOptionChange = (optionKey: string, value: any) => {
    const newOptions = { ...selectedOptions, [optionKey]: value }
    setSelectedOptions(newOptions)
    setCurrentPrice(calculatePrice(newOptions))
  }

  const handleSelectService = () => {
    onSelect?.(serviceType, selectedOptions)
  }

  if (compact) {
    return (
      <Card className={cn(
        "h-full transition-all duration-300 hover:shadow-lg hover:shadow-orange-100",
        featured && "ring-2 ring-orange-500 shadow-lg shadow-orange-100",
        className
      )}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg font-semibold text-gray-900">{serviceConfig.name}</CardTitle>
              <CardDescription className="text-sm text-gray-600 mt-1 line-clamp-2">
                {serviceConfig.description}
              </CardDescription>
            </div>
            {featured && (
              <Badge variant="default" className="bg-orange-500 hover:bg-orange-600 ml-2">
                <Star className="h-3 w-3 mr-1" />
                Popular
              </Badge>
            )}
          </div>
          
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                {serviceConfig.estimatedDelivery}
              </div>
              <div className="flex items-center">
                <DollarSign className="h-4 w-4 mr-1" />
                {currentPrice === 0 ? 'Free' : `$${currentPrice}`}
              </div>
            </div>
            
            <Button 
              onClick={handleSelectService}
              size="sm"
              className="bg-orange-500 hover:bg-orange-600"
            >
              {currentPrice === 0 ? 'Start Free' : 'Select'}
            </Button>
          </div>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card className={cn(
      "h-full transition-all duration-300 hover:shadow-lg hover:shadow-orange-100",
      featured && "ring-2 ring-orange-500 shadow-lg shadow-orange-100",
      className
    )}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <Badge variant="outline" className="text-orange-600 border-orange-200">
                {serviceConfig.category}
              </Badge>
              {featured && (
                <Badge variant="default" className="bg-orange-500 hover:bg-orange-600">
                  <Star className="h-3 w-3 mr-1" />
                  Popular
                </Badge>
              )}
              {serviceConfig.basePrice === 0 && (
                <Badge variant="secondary" className="bg-green-100 text-green-700">
                  <Zap className="h-3 w-3 mr-1" />
                  Free
                </Badge>
              )}
            </div>
            
            <CardTitle className="text-xl font-bold text-gray-900">{serviceConfig.name}</CardTitle>
            <CardDescription className="text-gray-600 mt-2">
              {serviceConfig.description}
            </CardDescription>
          </div>
        </div>

        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-1 text-orange-500" />
              {serviceConfig.estimatedDelivery}
            </div>
            <div className="flex items-center font-semibold">
              <DollarSign className="h-4 w-4 mr-1 text-green-600" />
              {currentPrice === 0 ? (
                <span className="text-green-600">Free</span>
              ) : (
                <span className="text-gray-900">${currentPrice}</span>
              )}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Service Options */}
        {Object.keys(serviceConfig.options).length > 0 && (
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Customize Your Service</h4>
            
            {Object.entries(serviceConfig.options).map(([optionKey, option]) => (
              <div key={optionKey} className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                  {option.label}
                  {option.description && (
                    <span className="text-xs text-gray-500 font-normal block mt-1">
                      {option.description}
                    </span>
                  )}
                </Label>

                {option.type === 'select' && option.options && (
                  <Select 
                    onValueChange={(value) => handleOptionChange(optionKey, value)}
                    value={selectedOptions[optionKey] || ''}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={`Select ${option.label.toLowerCase()}`} />
                    </SelectTrigger>
                    <SelectContent>
                      {option.options.map((optionValue) => (
                        <SelectItem key={optionValue} value={optionValue}>
                          {optionValue}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}

                {option.type === 'multiselect' && option.options && (
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {option.options.map((optionValue) => (
                      <div key={optionValue} className="flex items-center space-x-2">
                        <Checkbox
                          id={`${optionKey}-${optionValue}`}
                          checked={selectedOptions[optionKey]?.includes(optionValue) || false}
                          onCheckedChange={(checked) => {
                            const currentValues = selectedOptions[optionKey] || []
                            const newValues = checked
                              ? [...currentValues, optionValue]
                              : currentValues.filter((v: string) => v !== optionValue)
                            handleOptionChange(optionKey, newValues)
                          }}
                        />
                        <Label 
                          htmlFor={`${optionKey}-${optionValue}`}
                          className="text-sm text-gray-700"
                        >
                          {optionValue}
                        </Label>
                      </div>
                    ))}
                  </div>
                )}

                {option.type === 'boolean' && (
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={optionKey}
                      checked={selectedOptions[optionKey] || false}
                      onCheckedChange={(checked) => handleOptionChange(optionKey, checked)}
                    />
                    <Label htmlFor={optionKey} className="text-sm text-gray-700">
                      {option.label}
                    </Label>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {Object.keys(serviceConfig.options).length > 0 && <Separator />}

        {/* Deliverables */}
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">What You'll Receive</h4>
          <div className="space-y-2">
            {serviceConfig.deliverables.map((deliverable, index) => (
              <div key={index} className="flex items-center space-x-2 text-sm text-gray-600">
                <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                <span>{deliverable}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Rate Limits for Free Services */}
        {serviceConfig.rateLimits && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-700">
              <Zap className="h-4 w-4 inline mr-1" />
              {serviceConfig.rateLimits.message}
            </p>
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-6">
        <Button 
          onClick={handleSelectService}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-2.5"
          size="lg"
        >
          {currentPrice === 0 ? 'Start Free Research' : `Get Started - $${currentPrice}`}
        </Button>
      </CardFooter>
    </Card>
  )
}

// Legacy service card for backward compatibility
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