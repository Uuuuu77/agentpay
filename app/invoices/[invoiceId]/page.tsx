"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PaymentForm } from "@/components/payment/payment-form"
import { QRCodePayment } from "@/components/payment/qr-code-payment"
import { useInvoice, useInvoiceStatus } from "@/hooks/use-invoice"
import { ArrowLeft, ExternalLink, Download, Clock, CheckCircle, AlertCircle } from "lucide-react"
import { getChainById } from "@/lib/chains"

interface InvoicePageProps {
  params: {
    invoiceId: string
  }
}

export default function InvoicePage({ params }: InvoicePageProps) {
  const { invoice, loading, error } = useInvoice(params.invoiceId)
  const { status } = useInvoiceStatus(params.invoiceId)
  const [paymentMethod, setPaymentMethod] = useState<"wallet" | "qr">("wallet")

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading invoice...</p>
        </div>
      </div>
    )
  }

  if (error || !invoice) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Card>
          <CardContent className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Invoice Not Found</h2>
            <p className="text-muted-foreground mb-4">{error || "The requested invoice could not be found."}</p>
            <Button asChild>
              <Link href="/services">Browse Services</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const chainConfig = getChainById(Number.parseInt(invoice.chain))
  const isExpired = invoice.expiryTimestamp < Math.floor(Date.now() / 1000)
  const isPaid = status?.isPaid || invoice.status === "PAID"
  const isDelivered = invoice.status === "DELIVERED"

  const getStatusIcon = () => {
    switch (invoice.status) {
      case "CREATED":
        return <Clock className="h-5 w-5 text-yellow-600" />
      case "PAID":
      case "IN_PROGRESS":
        return <CheckCircle className="h-5 w-5 text-blue-600" />
      case "DELIVERED":
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case "CANCELLED":
        return <AlertCircle className="h-5 w-5 text-red-600" />
      default:
        return <Clock className="h-5 w-5 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "CREATED":
        return "bg-yellow-100 text-yellow-800"
      case "PAID":
        return "bg-green-100 text-green-800"
      case "IN_PROGRESS":
        return "bg-blue-100 text-blue-800"
      case "DELIVERED":
        return "bg-purple-100 text-purple-800"
      case "CANCELLED":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Button asChild variant="ghost" className="mb-4">
            <Link href="/invoices">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Invoices
            </Link>
          </Button>

          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">{invoice.service?.name || invoice.serviceType}</h1>
              <p className="text-muted-foreground">{invoice.description}</p>
            </div>
            <div className="flex items-center gap-2">
              {getStatusIcon()}
              <Badge className={getStatusColor(invoice.status)}>{invoice.status}</Badge>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            {/* Invoice Details */}
            <Card>
              <CardHeader>
                <CardTitle>Invoice Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-muted-foreground">Amount:</span>
                    <p className="text-lg font-bold">${invoice.displayAmount}</p>
                  </div>
                  <div>
                    <span className="font-medium text-muted-foreground">Network:</span>
                    <p>{chainConfig?.name}</p>
                  </div>
                  <div>
                    <span className="font-medium text-muted-foreground">Created:</span>
                    <p>{new Date(invoice.createdAt * 1000).toLocaleString()}</p>
                  </div>
                  <div>
                    <span className="font-medium text-muted-foreground">Expires:</span>
                    <p className={isExpired ? "text-red-600" : ""}>
                      {new Date(invoice.expiryTimestamp * 1000).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div>
                  <span className="font-medium text-muted-foreground">Invoice ID:</span>
                  <p className="font-mono text-xs break-all mt-1">{invoice.invoiceId}</p>
                </div>

                {invoice.txHash && (
                  <div>
                    <span className="font-medium text-muted-foreground">Transaction:</span>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="font-mono text-xs">{invoice.txHash.slice(0, 20)}...</p>
                      <Button asChild variant="outline" size="sm">
                        <a
                          href={`${chainConfig?.blockExplorer}/tx/${invoice.txHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Service Options */}
            {Object.keys(invoice.options).length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Service Configuration</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {Object.entries(invoice.options).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="capitalize">{key.replace(/([A-Z])/g, " $1").toLowerCase()}:</span>
                        <span>{typeof value === "boolean" ? (value ? "Yes" : "No") : String(value)}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Deliverable */}
            {isDelivered && invoice.deliverableURL && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    Service Delivered
                  </CardTitle>
                  <CardDescription>Your service has been completed and is ready for download</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild className="w-full">
                    <a href={invoice.deliverableURL} target="_blank" rel="noopener noreferrer">
                      <Download className="mr-2 h-4 w-4" />
                      Download Deliverable
                    </a>
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          <div>
            {!isPaid && !isExpired ? (
              <Tabs value={paymentMethod} onValueChange={(value) => setPaymentMethod(value as "wallet" | "qr")}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="wallet">Wallet Payment</TabsTrigger>
                  <TabsTrigger value="qr">QR Code</TabsTrigger>
                </TabsList>
                <TabsContent value="wallet">
                  <PaymentForm invoice={invoice} />
                </TabsContent>
                <TabsContent value="qr">
                  <QRCodePayment invoice={invoice} />
                </TabsContent>
              </Tabs>
            ) : isPaid ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="h-5 w-5" />
                    Payment Received
                  </CardTitle>
                  <CardDescription>
                    {isDelivered
                      ? "Your service has been delivered!"
                      : "Your service is being processed and will be delivered soon."}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Paid Amount:</span>
                      <span className="font-medium">${invoice.displayAmount}</span>
                    </div>
                    {invoice.paidAt && (
                      <div className="flex justify-between">
                        <span>Paid At:</span>
                        <span>{new Date(invoice.paidAt * 1000).toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-red-600">
                    <AlertCircle className="h-5 w-5" />
                    Invoice Expired
                  </CardTitle>
                  <CardDescription>This invoice has expired and can no longer be paid.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild className="w-full">
                    <Link href="/services">Create New Order</Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
