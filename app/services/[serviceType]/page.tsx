import { notFound } from "next/navigation"
import { ServiceOrderForm } from "@/components/services/service-order-form"
import { getServiceByType } from "@/lib/services"
import type { ServiceType } from "@/types"

interface ServicePageProps {
  params: {
    serviceType: string
  }
}

export default function ServicePage({ params }: ServicePageProps) {
  const serviceType = params.serviceType.toUpperCase() as ServiceType
  const service = getServiceByType(serviceType)

  if (!service) {
    notFound()
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">{service.name}</h1>
          <p className="text-xl text-muted-foreground">{service.description}</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-4">What You'll Get</h2>
              <ul className="space-y-2">
                {service.deliverables.map((deliverable, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-green-600 mt-1">✓</span>
                    <span>{deliverable}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-4">Service Details</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="font-medium">Base Price:</span>
                  <span>${service.basePrice}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Delivery Time:</span>
                  <span>{service.slaHours} hours</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Revisions:</span>
                  <span>{service.options.revisions?.default || 2} included</span>
                </div>
              </div>
            </div>

            {Object.keys(service.options).length > 0 && (
              <div>
                <h2 className="text-2xl font-bold mb-4">Customization Options</h2>
                <div className="space-y-3">
                  {Object.entries(service.options).map(([key, option]) => (
                    <div key={key} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-medium">{option.label}</span>
                        {option.priceModifier && option.priceModifier > 0 && (
                          <span className="text-sm text-muted-foreground">+${option.priceModifier}</span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {option.type === "number" && `Default: ${option.default}`}
                        {option.type === "boolean" && `Optional add-on`}
                        {option.type === "select" && `Options: ${option.options?.join(", ")}`}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div>
            <ServiceOrderForm service={service} />
          </div>
        </div>
      </div>
    </div>
  )
}

export async function generateStaticParams() {
  return [
    { serviceType: "logo" },
    { serviceType: "graphic" },
    { serviceType: "script" },
    { serviceType: "prompt" },
    { serviceType: "resume" },
    { serviceType: "consult" },
  ]
}
