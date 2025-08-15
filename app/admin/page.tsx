"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ProtectedRoute } from "@/components/auth/protected-route"
import {
  Activity,
  Users,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  Server,
  Database,
  Zap,
} from "lucide-react"
import axios from "axios"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api"

interface AdminStats {
  totalUsers: number
  totalOrders: number
  totalRevenue: number
  activeOrders: number
  completedOrders: number
  failedOrders: number
  systemHealth: {
    database: string
    deliveryEngine: string
    paymentWatcher: string
  }
}

export default function AdminDashboard() {
  const { data: session } = useSession()
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    activeOrders: 0,
    completedOrders: 0,
    failedOrders: 0,
    systemHealth: {
      database: "unknown",
      deliveryEngine: "unknown",
      paymentWatcher: "unknown",
    },
  })
  const [loading, setLoading] = useState(true)
  const [deliveryEngineStatus, setDeliveryEngineStatus] = useState<any>(null)

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const [statsResponse, healthResponse, deliveryResponse] = await Promise.all([
          axios.get(`${API_BASE_URL}/admin/stats`),
          axios.get(`${API_BASE_URL}/health`),
          axios.get(`${API_BASE_URL}/delivery/start`),
        ])

        setStats({
          ...statsResponse.data,
          systemHealth: {
            database: healthResponse.data.database || "unknown",
            deliveryEngine: deliveryResponse.data.status?.running ? "running" : "stopped",
            paymentWatcher: healthResponse.data.services?.paymentWatcher || "unknown",
          },
        })

        setDeliveryEngineStatus(deliveryResponse.data.status)
      } catch (error) {
        console.error("[v0] Failed to fetch admin data:", error)
      } finally {
        setLoading(false)
      }
    }

    if (session?.user?.role === "admin") {
      fetchAdminData()
    }
  }, [session])

  const startDeliveryEngine = async () => {
    try {
      await axios.post(`${API_BASE_URL}/delivery/start`)
      // Refresh status
      const response = await axios.get(`${API_BASE_URL}/delivery/start`)
      setDeliveryEngineStatus(response.data.status)
    } catch (error) {
      console.error("[v0] Failed to start delivery engine:", error)
    }
  }

  const getHealthBadge = (status: string) => {
    switch (status) {
      case "healthy":
      case "connected":
      case "running":
        return <Badge className="bg-green-100 text-green-800">Healthy</Badge>
      case "degraded":
      case "stopped":
        return <Badge className="bg-yellow-100 text-yellow-800">Warning</Badge>
      case "unhealthy":
      case "disconnected":
        return <Badge className="bg-red-100 text-red-800">Error</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">Unknown</Badge>
    }
  }

  if (loading) {
    return (
      <ProtectedRoute requiredRole="admin">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading admin dashboard...</p>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute requiredRole="admin">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">Monitor and manage AgentPay platform operations</p>
        </div>

        {/* System Health */}
        <div className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                System Health
              </CardTitle>
              <CardDescription>Real-time status of core system components</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Database className="h-5 w-5 text-blue-600" />
                    <span className="font-medium">Database</span>
                  </div>
                  {getHealthBadge(stats.systemHealth.database)}
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Zap className="h-5 w-5 text-orange-600" />
                    <span className="font-medium">Delivery Engine</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {getHealthBadge(stats.systemHealth.deliveryEngine)}
                    {stats.systemHealth.deliveryEngine === "stopped" && (
                      <Button size="sm" onClick={startDeliveryEngine}>
                        Start
                      </Button>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Server className="h-5 w-5 text-green-600" />
                    <span className="font-medium">Payment Watcher</span>
                  </div>
                  {getHealthBadge(stats.systemHealth.paymentWatcher)}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground">Registered users</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalOrders}</div>
              <p className="text-xs text-muted-foreground">All time orders</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.totalRevenue}</div>
              <p className="text-xs text-muted-foreground">Platform revenue</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Orders</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeOrders}</div>
              <p className="text-xs text-muted-foreground">In progress</p>
            </CardContent>
          </Card>
        </div>

        {/* Order Status Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Order Status Distribution</CardTitle>
              <CardDescription>Current order status breakdown</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Completed</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{stats.completedOrders}</span>
                    <Badge variant="outline" className="text-green-600">
                      {stats.totalOrders > 0 ? Math.round((stats.completedOrders / stats.totalOrders) * 100) : 0}%
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-blue-600" />
                    <span>Active</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{stats.activeOrders}</span>
                    <Badge variant="outline" className="text-blue-600">
                      {stats.totalOrders > 0 ? Math.round((stats.activeOrders / stats.totalOrders) * 100) : 0}%
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <span>Failed</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{stats.failedOrders}</span>
                    <Badge variant="outline" className="text-red-600">
                      {stats.totalOrders > 0 ? Math.round((stats.failedOrders / stats.totalOrders) * 100) : 0}%
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common administrative tasks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button asChild className="w-full justify-start bg-transparent" variant="outline">
                <a href="/admin/orders">
                  <Activity className="mr-2 h-4 w-4" />
                  Monitor Orders
                </a>
              </Button>
              <Button asChild className="w-full justify-start bg-transparent" variant="outline">
                <a href="/admin/users">
                  <Users className="mr-2 h-4 w-4" />
                  Manage Users
                </a>
              </Button>
              <Button asChild className="w-full justify-start bg-transparent" variant="outline">
                <a href="/admin/quality">
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Quality Control
                </a>
              </Button>
              <Button asChild className="w-full justify-start bg-transparent" variant="outline">
                <a href="/admin/analytics">
                  <TrendingUp className="mr-2 h-4 w-4" />
                  View Analytics
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Delivery Engine Status */}
        {deliveryEngineStatus && (
          <Card>
            <CardHeader>
              <CardTitle>Delivery Engine Status</CardTitle>
              <CardDescription>Current status of the automated service delivery system</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold mb-2">{deliveryEngineStatus.running ? "Running" : "Stopped"}</div>
                  <p className="text-sm text-muted-foreground">Engine Status</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold mb-2">
                    {deliveryEngineStatus.uptime ? Math.floor(deliveryEngineStatus.uptime / 1000 / 60) : 0}m
                  </div>
                  <p className="text-sm text-muted-foreground">Uptime</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold mb-2">Auto</div>
                  <p className="text-sm text-muted-foreground">Processing Mode</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </ProtectedRoute>
  )
}
