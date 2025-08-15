"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { ArrowLeft, Download, ExternalLink, Clock, CheckCircle, AlertCircle, Copy } from "lucide-react"
import axios from "axios"
import type { Invoice } from "@/types"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api"

export default function OrderDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const [order, setOrder] = useState<Invoice | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/invoices/${params.id}`)
        setOrder(response.data.invoice)
      } catch (error) {
        console.error("Failed to fetch order:", error)
        setError("Order not found")
      } finally {
        setLoading(false)
      }
    }

    if (params.id && session?.user) {
      fetchOrder()
    }
  }, [params.id, session])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "CREATED":
        return "bg-yellow-100 text-yellow-800"
      case "PAID":
      case "IN_PROGRESS":
        return "bg-blue-100 text-blue-800"
      case "DELIVERED":
        return "bg-green-100 text-green-800"
      case "CANCELLED":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PAID":
      case "IN_PROGRESS":
        return <Clock className="h-4 w-4 text-blue-600" />
      case "DELIVERED":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "CREATED":
        return <AlertCircle className="h-4 w-4 text-yellow-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading order details...</p>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  if (error || !order) {
    return (
      <ProtectedRoute>
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
            <h2 className="text-2xl font-bold mb-2">Order Not Found</h2>
            <p className="text-muted-foreground mb-4">
              The order you're looking for doesn't exist or you don't have access to it.
            </p>
            <Button onClick={() => router.back()}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Button>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Order Details</h1>
            <p className="text-muted-foreground">Order ID: {order.invoiceId}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Order Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Service Details */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl">{order.service?.name || order.serviceType}</CardTitle>
                    <CardDescription className="mt-2">{order.description}</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(order.status)}
                    <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-muted-foreground">Service Type:</span>
                    <p className="capitalize">{order.serviceType}</p>
                  </div>
                  <div>
                    <span className="font-medium text-muted-foreground">Amount:</span>
                    <p className="font-semibold text-lg">${order.displayAmount}</p>
                  </div>
                  <div>
                    <span className="font-medium text-muted-foreground">Chain:</span>
                    <p className="capitalize">{order.chain}</p>
                  </div>
                  <div>
                    <span className="font-medium text-muted-foreground">Created:</span>
                    <p>{new Date(order.createdAt * 1000).toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Information */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-muted-foreground">Payment Address:</span>
                    <div className="flex items-center gap-2 mt-1">
                      <code className="bg-muted px-2 py-1 rounded text-xs">
                        {order.paymentAddress?.slice(0, 20)}...
                      </code>
                      <Button size="sm" variant="ghost" onClick={() => copyToClipboard(order.paymentAddress || "")}>
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  {order.txHash && (
                    <div>
                      <span className="font-medium text-muted-foreground">Transaction Hash:</span>
                      <div className="flex items-center gap-2 mt-1">
                        <code className="bg-muted px-2 py-1 rounded text-xs">{order.txHash.slice(0, 20)}...</code>
                        <Button size="sm" variant="ghost" onClick={() => copyToClipboard(order.txHash || "")}>
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Deliverables */}
            {order.deliverableURL && (
              <Card>
                <CardHeader>
                  <CardTitle>Deliverables</CardTitle>
                  <CardDescription>Your completed service files are ready for download</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="font-medium">Service Completed</p>
                        <p className="text-sm text-muted-foreground">Files are ready for download</p>
                      </div>
                    </div>
                    <Button asChild>
                      <a href={order.deliverableURL} target="_blank" rel="noopener noreferrer">
                        <Download className="mr-2 h-4 w-4" />
                        Download Files
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Order Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>Order Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                    <div>
                      <p className="font-medium">Order Created</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(order.createdAt * 1000).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {order.txHash && (
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                      <div>
                        <p className="font-medium">Payment Confirmed</p>
                        <p className="text-sm text-muted-foreground">Blockchain transaction verified</p>
                      </div>
                    </div>
                  )}

                  {order.status === "IN_PROGRESS" && (
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                      <div>
                        <p className="font-medium">In Progress</p>
                        <p className="text-sm text-muted-foreground">AI agents are working on your order</p>
                      </div>
                    </div>
                  )}

                  {order.deliverableURL && (
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                      <div>
                        <p className="font-medium">Delivered</p>
                        <p className="text-sm text-muted-foreground">Files are ready for download</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button asChild className="w-full justify-start bg-transparent" variant="outline">
                  <a href={`/invoices/${order.invoiceId}`}>
                    <ExternalLink className="mr-2 h-4 w-4" />
                    View Invoice
                  </a>
                </Button>
                {order.txHash && (
                  <Button asChild className="w-full justify-start bg-transparent" variant="outline">
                    <a href={`https://etherscan.io/tx/${order.txHash}`} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      View on Explorer
                    </a>
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
