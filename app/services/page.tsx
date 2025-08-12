import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { serviceDefinitions } from "@/lib/services"
import { Clock, ArrowRight } from "lucide-react"

export default function ServicesPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Professional Services</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Choose from our catalog of automated professional services. Pay with crypto, get instant delivery.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {serviceDefinitions.map((service) => (
          <Card key={service.type} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{service.name}</CardTitle>
                <Badge variant="secondary">${service.basePrice}+</Badge>
              </div>
              <CardDescription>{service.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Deliverables:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {service.deliverables.map((deliverable, index) => (
                    <li key={index}>• {deliverable}</li>
                  ))}
                </ul>
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>{service.slaHours} hour delivery</span>
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

      <div className="mt-16 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold mb-4">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8 mt-8">
            <div className="space-y-2">
              <div className="w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center font-bold mx-auto">
                1
              </div>
              <h3 className="font-medium">Choose Service</h3>
              <p className="text-sm text-muted-foreground">Select and configure your desired service</p>
            </div>
            <div className="space-y-2">
              <div className="w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center font-bold mx-auto">
                2
              </div>
              <h3 className="font-medium">Pay with Crypto</h3>
              <p className="text-sm text-muted-foreground">Connect wallet and pay with USDC/USDT</p>
            </div>
            <div className="space-y-2">
              <div className="w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center font-bold mx-auto">
                3
              </div>
              <h3 className="font-medium">Get Delivery</h3>
              <p className="text-sm text-muted-foreground">Receive your completed service automatically</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
