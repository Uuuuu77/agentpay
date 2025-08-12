"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAccount } from "wagmi"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { WalletConnectButton } from "@/components/wallet/wallet-connect-button"
import { ChainSelector } from "@/components/wallet/chain-selector"
import { useCreateInvoice } from "@/hooks/use-invoice"
import { calculateServicePrice } from "@/lib/services"
import { supportedChains } from "@/lib/chains"
import type { ServiceDefinition } from "@/types"
import { Loader2 } from "lucide-react"

interface ServiceOrderFormProps {
  service: ServiceDefinition
}

export function ServiceOrderForm({ service }: ServiceOrderFormProps) {
  const router = useRouter()
  const { address, chain, isConnected } = useAccount()
  const { createInvoice, loading, error } = useCreateInvoice()

  const [formData, setFormData] = useState({
    description: "",
    buyerContact: "",
    options: {} as any,
  })

  const [selectedChain, setSelectedChain] = useState<string>("")
  const [selectedToken, setSelectedToken] = useState<string>("USDC")

  const handleOptionChange = (key: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      options: {
        ...prev.options,
        [key]: value,
      },
    }))
  }

  const calculateTotalPrice = () => {
    return calculateServicePrice(service, formData.options)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isConnected || !address) {
      return
    }

    const chainConfig = supportedChains.find((c) => c.id.toString() === selectedChain)
    if (!chainConfig) {
      return
    }

    const tokenAddress = chainConfig.tokens[selectedToken as keyof typeof chainConfig.tokens]

    try {
      const invoice = await createInvoice({
        serviceType: service.type,
        payee: address, // For now, user pays to themselves (in production, this would be the service provider)
        token: tokenAddress,
        chain: selectedChain,
        description: formData.description,
        options: formData.options,
        buyerContact: formData.buyerContact,
        customAmount: calculateTotalPrice(),
      })

      // Redirect to invoice page
      router.push(`/invoices/${invoice.invoiceId}`)
    } catch (err) {
      console.error("Failed to create invoice:", err)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Order {service.name}</CardTitle>
        <CardDescription>Configure your service and create an invoice</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Service Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Project Description *</Label>
            <Textarea
              id="description"
              placeholder={`Describe your ${service.name.toLowerCase()} requirements...`}
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              required
              rows={4}
            />
          </div>

          {/* Contact Information */}
          <div className="space-y-2">
            <Label htmlFor="contact">Email (optional)</Label>
            <Input
              id="contact"
              type="email"
              placeholder="your@email.com"
              value={formData.buyerContact}
              onChange={(e) => setFormData((prev) => ({ ...prev, buyerContact: e.target.value }))}
            />
            <p className="text-xs text-muted-foreground">We'll notify you when your service is ready</p>
          </div>

          {/* Service Options */}
          {Object.entries(service.options).map(([key, option]) => (
            <div key={key} className="space-y-2">
              <Label>{option.label}</Label>
              {option.type === "number" && (
                <Input
                  type="number"
                  min={1}
                  value={formData.options[key] || option.default || 1}
                  onChange={(e) => handleOptionChange(key, Number.parseInt(e.target.value))}
                />
              )}
              {option.type === "boolean" && (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={key}
                    checked={formData.options[key] || false}
                    onCheckedChange={(checked) => handleOptionChange(key, checked)}
                  />
                  <Label htmlFor={key} className="text-sm font-normal">
                    {option.label}
                    {option.priceModifier && option.priceModifier > 0 && (
                      <span className="text-muted-foreground"> (+${option.priceModifier})</span>
                    )}
                  </Label>
                </div>
              )}
              {option.type === "select" && (
                <Select
                  value={formData.options[key] || option.default}
                  onValueChange={(value) => handleOptionChange(key, value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {option.options?.map((opt) => (
                      <SelectItem key={opt} value={opt}>
                        {opt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          ))}

          {/* Payment Configuration */}
          <div className="space-y-4 border-t pt-4">
            <h3 className="font-medium">Payment Details</h3>

            <div className="space-y-2">
              <Label>Blockchain Network</Label>
              <Select value={selectedChain} onValueChange={setSelectedChain} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select network" />
                </SelectTrigger>
                <SelectContent>
                  {supportedChains.map((chain) => (
                    <SelectItem key={chain.id} value={chain.id.toString()}>
                      {chain.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Payment Token</Label>
              <Select value={selectedToken} onValueChange={setSelectedToken}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USDC">USDC</SelectItem>
                  <SelectItem value="USDT">USDT</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
              <span className="font-medium">Total Price:</span>
              <span className="text-xl font-bold">${calculateTotalPrice()}</span>
            </div>
          </div>

          {/* Wallet Connection */}
          {!isConnected ? (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">Connect your wallet to create an invoice</p>
              <WalletConnectButton />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Connected:</span>
                <code className="text-xs bg-muted px-2 py-1 rounded">
                  {address?.slice(0, 6)}...{address?.slice(-4)}
                </code>
              </div>

              {chain?.id.toString() !== selectedChain && selectedChain && (
                <div className="space-y-2">
                  <p className="text-sm text-orange-600">Please switch to the selected network</p>
                  <ChainSelector />
                </div>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={loading || !selectedChain || chain?.id.toString() !== selectedChain}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Creating Invoice...
                  </>
                ) : (
                  `Create Invoice - $${calculateTotalPrice()}`
                )}
              </Button>
            </div>
          )}

          {error && <p className="text-sm text-red-600">{error}</p>}
        </form>
      </CardContent>
    </Card>
  )
}
