"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { Search, Eye, CheckCircle, XCircle, Clock, AlertTriangle, RefreshCw } from "lucide-react"
import axios from "axios"
import Link from "next/link"
import type { Invoice } from "@/types"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api"

export default function AdminOrdersPage() {
  const { data: session } = useSession()
  const [orders, setOrders] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [serviceFilter, setServiceFilter] = useState("all")

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/admin/orders`)
        setOrders(response.data.orders || [])
      } catch (error) {
        console.error("[v0] Failed to fetch admin orders:", error)
      } finally {
        setLoading(false)
      }
    }

    if (session?.user?.role === "admin") {
      fetchOrders()
    }
  }, [session])

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.invoiceId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.serviceType.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || order.status === statusFilter
    const matchesService = serviceFilter === "all" || order.serviceType === serviceFilter

    return matchesSearch && matchesStatus && matchesService
  })

  const uniqueServices = [...new Set(orders.map((order) => order.serviceType))]

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "DELIVERED":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "PAID":
      case "IN_PROGRESS":
        return <Clock className="h-4 w-4 text-blue-600" />
      case "CREATED":
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      case "CANCELLED":
        return <XCircle className="h-4 w-4 text-red-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

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

  const refreshOrders = async () => {
    setLoading(true)
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/orders`)
      setOrders(response.data.orders || [])
    } catch (error) {
      console.error("[v0] Failed to refresh orders:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <ProtectedRoute requiredRole="admin">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading orders...</p>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute requiredRole="admin">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Order Monitoring</h1>
            <p className="text-muted-foreground">Monitor and manage all platform orders</p>
          </div>
          <Button onClick={refreshOrders} variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Filters & Search</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search orders..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="CREATED">Created</SelectItem>
                  <SelectItem value="PAID">Paid</SelectItem>
                  <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                  <SelectItem value="DELIVERED">Delivered</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                </SelectContent>
              </Select>

              <Select value={serviceFilter} onValueChange={setServiceFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by service" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Services</SelectItem>
                  {uniqueServices.map((service) => (
                    <SelectItem key={service} value={service}>
                      {service}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-muted-foreground mb-4">
                {searchTerm || statusFilter !== "all" || serviceFilter !== "all"
                  ? "No orders found matching your filters."
                  : "No orders found."}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <Card key={order.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        {getStatusIcon(order.status)}
                        {order.service?.name || order.serviceType}
                      </CardTitle>
                      <CardDescription className="mt-1">{order.description}</CardDescription>
                    </div>
                    <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4 text-sm mb-4">
                    <div>
                      <span className="font-medium text-muted-foreground">Amount:</span>
                      <p className="font-semibold">${order.displayAmount}</p>
                    </div>
                    <div>
                      <span className="font-medium text-muted-foreground">Chain:</span>
                      <p className="capitalize">{order.chain}</p>
                    </div>
                    <div>
                      <span className="font-medium text-muted-foreground">User:</span>
                      <p className="font-mono text-xs">{order.userId || "N/A"}</p>
                    </div>
                    <div>
                      <span className="font-medium text-muted-foreground">Created:</span>
                      <p>{new Date(order.createdAt * 1000).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <span className="font-medium text-muted-foreground">Order ID:</span>
                      <p className="font-mono text-xs">{order.invoiceId.slice(0, 10)}...</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center gap-2">
                      {order.txHash && (
                        <Badge variant="outline" className="text-xs">
                          Payment Confirmed
                        </Badge>
                      )}
                      {order.deliverableURL && (
                        <Badge variant="outline" className="text-xs">
                          Files Delivered
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/admin/orders/${order.invoiceId}`}>
                          <Eye className="mr-2 h-3 w-3" />
                          Review
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </ProtectedRoute>
  )
}
