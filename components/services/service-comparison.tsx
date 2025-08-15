"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Clock, ArrowRight, X, ContrastIcon as Compare } from "lucide-react"
import type { ServiceDefinition } from "@/types"
import Link from "next/link"

interface ServiceComparisonProps {
  services: ServiceDefinition[]
}

export function ServiceComparison({ services }: ServiceComparisonProps) {
  const [selectedServices, setSelectedServices] = useState<string[]>([])
  const [isComparisonOpen, setIsComparisonOpen] = useState(false)

  const toggleServiceSelection = (serviceType: string) => {
    setSelectedServices((prev) => {
      if (prev.includes(serviceType)) {
        return prev.filter((type) => type !== serviceType)
      } else if (prev.length < 3) {
        return [...prev, serviceType]
      }
      return prev
    })
  }

  const selectedServiceData = services.filter((service) => selectedServices.includes(service.type))

  const clearSelection = () => {
    setSelectedServices([])
  }

  return (
    <>
      {/* Comparison Selection UI */}
      {selectedServices.length > 0 && (
        <div className="fixed bottom-4 right-4 z-50">
          <Card className="shadow-lg border-orange-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Compare className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    {selectedServices.length} service{selectedServices.length !== 1 ? "s" : ""} selected
                  </span>
                </div>
                <Dialog open={isComparisonOpen} onOpenChange={setIsComparisonOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" disabled={selectedServices.length < 2}>
                      Compare
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Service Comparison</DialogTitle>
                      <DialogDescription>
                        Compare features, pricing, and deliverables across selected services
                      </DialogDescription>
                    </DialogHeader>

                    <div
                      className="grid gap-4"
                      style={{ gridTemplateColumns: `repeat(${selectedServiceData.length}, 1fr)` }}
                    >
                      {selectedServiceData.map((service) => (
                        <Card key={service.type} className="relative">
                          <CardHeader>
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-lg">{service.name}</CardTitle>
                              <Button variant="ghost" size="sm" onClick={() => toggleServiceSelection(service.type)}>
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                            <CardDescription>{service.description}</CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                              <span className="font-medium">Base Price:</span>
                              <Badge variant="secondary">${service.basePrice}</Badge>
                            </div>

                            <div className="flex items-center justify-between">
                              <span className="font-medium">Delivery:</span>
                              <div className="flex items-center gap-1 text-sm">
                                <Clock className="h-3 w-3" />
                                {Math.round(service.slaHours / 24)} days
                              </div>
                            </div>

                            <div>
                              <span className="font-medium text-sm">Deliverables:</span>
                              <ul className="text-sm text-muted-foreground mt-1 space-y-1">
                                {service.deliverables.map((deliverable, index) => (
                                  <li key={index}>• {deliverable}</li>
                                ))}
                              </ul>
                            </div>

                            <div>
                              <span className="font-medium text-sm">Options:</span>
                              <div className="text-sm text-muted-foreground mt-1 space-y-1">
                                {Object.entries(service.options).map(([key, option]) => (
                                  <div key={key} className="flex justify-between">
                                    <span>{option.label}</span>
                                    {option.priceModifier && option.priceModifier > 0 && (
                                      <span>+${option.priceModifier}</span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>

                            <Button asChild className="w-full">
                              <Link href={`/services/${service.type.toLowerCase()}`}>
                                Order Now
                                <ArrowRight className="ml-2 h-4 w-4" />
                              </Link>
                            </Button>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </DialogContent>
                </Dialog>
                <Button variant="ghost" size="sm" onClick={clearSelection}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Service Selection Checkboxes */}
      <div className="hidden">
        {services.map((service) => (
          <div key={service.type} className="flex items-center space-x-2">
            <Checkbox
              id={`compare-${service.type}`}
              checked={selectedServices.includes(service.type)}
              onCheckedChange={() => toggleServiceSelection(service.type)}
              disabled={!selectedServices.includes(service.type) && selectedServices.length >= 3}
            />
            <label htmlFor={`compare-${service.type}`} className="text-sm">
              Compare
            </label>
          </div>
        ))}
      </div>
    </>
  )
}
