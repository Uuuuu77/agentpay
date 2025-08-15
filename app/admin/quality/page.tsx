"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { ClientOnlyWrapper } from "@/components/auth/client-only-wrapper"
import { CheckCircle, XCircle, AlertTriangle, Eye, Download } from "lucide-react"
import axios from "axios"
import type { Invoice } from "@/types"

// Force dynamic rendering
export const dynamic = 'force-dynamic'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api"

interface QualityReview {
  id: string
  invoiceId: string
  status: "pending" | "approved" | "rejected"
  reviewNotes: string
  reviewedBy?: string
  reviewedAt?: string
}

function AdminQualityPageContent() {
  const { data: session, status } = useSession()

  // Handle loading and authentication states
  if (status === "loading" || !session) {
    return null
  }

  const [pendingOrders, setPendingOrders] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [reviewNotes, setReviewNotes] = useState<Record<string, string>>({})

  useEffect(() => {
    const fetchPendingOrders = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/admin/quality/pending`)
        setPendingOrders(response.data.orders || [])
      } catch (error) {
        console.error("[v0] Failed to fetch pending orders:", error)
      } finally {
        setLoading(false)
      }
    }

    if (session?.user?.role === "admin") {
      fetchPendingOrders()
    }
  }, [session])

  const handleReview = async (invoiceId: string, action: "approve" | "reject") => {
    try {
      await axios.post(`${API_BASE_URL}/admin/quality/review`, {
        invoiceId,
        action,
        notes: reviewNotes[invoiceId] || "",
      })

      // Remove from pending list
      setPendingOrders((prev) => prev.filter((order) => order.invoiceId !== invoiceId))

      // Clear notes
      setReviewNotes((prev) => {
        const updated = { ...prev }
        delete updated[invoiceId]
        return updated
      })
    } catch (error) {
      console.error("[v0] Failed to submit review:", error)
    }
  }

  const updateNotes = (invoiceId: string, notes: string) => {
    setReviewNotes((prev) => ({ ...prev, [invoiceId]: notes }))
  }

  if (loading) {
    return (
      <ProtectedRoute requiredRole="admin">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading quality control queue...</p>
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
          <h1 className="text-3xl font-bold mb-2">Quality Control</h1>
          <p className="text-muted-foreground">Review and approve completed service deliverables</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingOrders.length}</div>
              <p className="text-xs text-muted-foreground">Orders awaiting review</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approved Today</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">Orders approved today</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rejected Today</CardTitle>
              <XCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">Orders rejected today</p>
            </CardContent>
          </Card>
        </div>

        {/* Pending Orders */}
        {pendingOrders.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
              <h3 className="text-lg font-semibold mb-2">All Caught Up!</h3>
              <p className="text-muted-foreground">No orders pending quality review at this time.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {pendingOrders.map((order) => (
              <Card key={order.id} className="border-l-4 border-l-yellow-500">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{order.serviceType}</CardTitle>
                      <CardDescription className="mt-1">{order.description}</CardDescription>
                    </div>
                    <Badge className="bg-yellow-100 text-yellow-800">Pending Review</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Order Details */}
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-muted-foreground">Amount:</span>
                      <p className="font-semibold">${order.amount}</p>
                    </div>
                    <div>
                      <span className="font-medium text-muted-foreground">Service Type:</span>
                      <p className="capitalize">{order.serviceType}</p>
                    </div>
                    <div>
                      <span className="font-medium text-muted-foreground">Completed:</span>
                      <p>{order.status === "DELIVERED" && order.paidAt ? new Date(order.paidAt * 1000).toLocaleDateString() : "N/A"}</p>
                    </div>
                    <div>
                      <span className="font-medium text-muted-foreground">Order ID:</span>
                      <p className="font-mono text-xs">{order.invoiceId.slice(0, 10)}...</p>
                    </div>
                  </div>

                  {/* Deliverable Preview */}
                  {order.deliverableURL && (
                    <div className="p-4 bg-muted rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">Deliverable Files</span>
                        <Button size="sm" variant="outline" asChild>
                          <a href={order.deliverableURL} target="_blank" rel="noopener noreferrer">
                            <Download className="mr-2 h-3 w-3" />
                            Download
                          </a>
                        </Button>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Review the completed work before approving or rejecting this order.
                      </p>
                    </div>
                  )}

                  {/* Review Notes */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Review Notes</label>
                    <Textarea
                      placeholder="Add notes about the quality, completeness, or any issues..."
                      value={reviewNotes[order.invoiceId] || ""}
                      onChange={(e) => updateNotes(order.invoiceId, e.target.value)}
                      rows={3}
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between pt-4 border-t">
                    <Button variant="outline" size="sm" asChild>
                      <a href={`/admin/orders/${order.invoiceId}`}>
                        <Eye className="mr-2 h-3 w-3" />
                        View Details
                      </a>
                    </Button>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleReview(order.invoiceId, "reject")}
                        className="text-red-600 hover:text-red-700"
                      >
                        <XCircle className="mr-2 h-3 w-3" />
                        Reject
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleReview(order.invoiceId, "approve")}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="mr-2 h-3 w-3" />
                        Approve
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

export default function AdminQualityPage() {
  return (
    <ClientOnlyWrapper>
      <AdminQualityPageContent />
    </ClientOnlyWrapper>
  )
}
