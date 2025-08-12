"use client"

import { useState, useEffect } from "react"
import QRCode from "qrcode"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Copy, Check } from "lucide-react"
import type { Invoice } from "@/types"

interface QRCodePaymentProps {
  invoice: Invoice
}

export function QRCodePayment({ invoice }: QRCodePaymentProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("")
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const generateQRCode = async () => {
      try {
        // Create payment URL for WalletConnect
        const paymentData = {
          to: invoice.payee,
          value: "0", // ERC20 transfer, so ETH value is 0
          data: `0xa9059cbb${invoice.payee.slice(2).padStart(64, "0")}${BigInt(invoice.amount).toString(16).padStart(64, "0")}`, // ERC20 transfer data
        }

        const walletConnectUrl = `ethereum:${invoice.token}@${invoice.chain}/transfer?address=${invoice.payee}&uint256=${invoice.amount}`

        const qrUrl = await QRCode.toDataURL(walletConnectUrl, {
          width: 256,
          margin: 2,
          color: {
            dark: "#000000",
            light: "#FFFFFF",
          },
        })

        setQrCodeUrl(qrUrl)
      } catch (error) {
        console.error("Failed to generate QR code:", error)
      }
    }

    generateQRCode()
  }, [invoice])

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error("Failed to copy:", error)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pay with Mobile Wallet</CardTitle>
        <CardDescription>Scan this QR code with your mobile wallet to pay</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {qrCodeUrl && (
          <div className="flex justify-center">
            <img src={qrCodeUrl || "/placeholder.svg"} alt="Payment QR Code" className="border rounded-lg" />
          </div>
        )}

        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium text-muted-foreground">Contract Address</label>
            <div className="flex items-center gap-2 mt-1">
              <code className="flex-1 p-2 bg-muted rounded text-sm font-mono">{invoice.token}</code>
              <Button variant="outline" size="sm" onClick={() => copyToClipboard(invoice.token)}>
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground">Recipient Address</label>
            <div className="flex items-center gap-2 mt-1">
              <code className="flex-1 p-2 bg-muted rounded text-sm font-mono">{invoice.payee}</code>
              <Button variant="outline" size="sm" onClick={() => copyToClipboard(invoice.payee)}>
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground">Amount (Raw)</label>
            <div className="flex items-center gap-2 mt-1">
              <code className="flex-1 p-2 bg-muted rounded text-sm font-mono">{invoice.amount}</code>
              <Button variant="outline" size="sm" onClick={() => copyToClipboard(invoice.amount)}>
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>

        <div className="p-4 bg-yellow-50 rounded-lg">
          <p className="text-sm text-yellow-800">
            <strong>Important:</strong> Make sure you're sending the exact amount to the correct address on the right
            network. Double-check all details before confirming the transaction.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
