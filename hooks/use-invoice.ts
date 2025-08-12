"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import type { Invoice } from "@/types"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"

export function useInvoice(invoiceId: string) {
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!invoiceId) return

    const fetchInvoice = async () => {
      try {
        setLoading(true)
        const response = await axios.get(`${API_BASE_URL}/invoices/${invoiceId}`)
        setInvoice(response.data.invoice)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch invoice")
        setInvoice(null)
      } finally {
        setLoading(false)
      }
    }

    fetchInvoice()
  }, [invoiceId])

  const refetch = () => {
    if (invoiceId) {
      const fetchInvoice = async () => {
        try {
          const response = await axios.get(`${API_BASE_URL}/invoices/${invoiceId}`)
          setInvoice(response.data.invoice)
          setError(null)
        } catch (err) {
          setError(err instanceof Error ? err.message : "Failed to fetch invoice")
        }
      }
      fetchInvoice()
    }
  }

  return { invoice, loading, error, refetch }
}

export function useCreateInvoice() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createInvoice = async (invoiceData: {
    serviceType: string
    payee: string
    token: string
    chain: string
    description: string
    options?: any
    buyerContact?: string
    customAmount?: number
  }) => {
    try {
      setLoading(true)
      setError(null)

      const response = await axios.post(`${API_BASE_URL}/invoices`, invoiceData)
      return response.data.invoice
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create invoice"
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return { createInvoice, loading, error }
}

export function useInvoiceStatus(invoiceId: string, pollInterval = 5000) {
  const [status, setStatus] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!invoiceId) return

    const fetchStatus = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/invoices/${invoiceId}/status`)
        setStatus(response.data)
        setLoading(false)
      } catch (err) {
        console.error("Failed to fetch invoice status:", err)
        setLoading(false)
      }
    }

    // Initial fetch
    fetchStatus()

    // Set up polling
    const interval = setInterval(fetchStatus, pollInterval)

    return () => clearInterval(interval)
  }, [invoiceId, pollInterval])

  return { status, loading }
}
