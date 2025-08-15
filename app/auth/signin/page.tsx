"use client"

import type React from "react"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useAccount, useSignMessage } from "wagmi"
import { SiweMessage } from "siwe"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { WalletConnectButton } from "@/components/wallet/wallet-connect-button"
import { Loader2, Wallet, Mail } from "lucide-react"
import Link from "next/link"

export default function SignInPage() {
  const router = useRouter()
  const { address, isConnected } = useAccount()
  const { signMessageAsync } = useSignMessage()

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [emailForm, setEmailForm] = useState({
    email: "",
    password: "",
  })

  const handleWeb3SignIn = async () => {
    if (!address || !isConnected) {
      setError("Please connect your wallet first")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      // Create SIWE message
      const message = new SiweMessage({
        domain: window.location.host,
        address: address,
        statement: "Sign in to AgentPay with your wallet.",
        uri: window.location.origin,
        version: "1",
        chainId: 1,
        nonce: Math.random().toString(36).substring(7),
        issuedAt: new Date().toISOString(),
      })

      const signature = await signMessageAsync({
        message: message.prepareMessage(),
      })

      const result = await signIn("web3", {
        message: JSON.stringify(message),
        signature,
        address,
        redirect: false,
      })

      if (result?.error) {
        setError("Authentication failed. Please try again.")
      } else {
        router.push("/dashboard")
      }
    } catch (error) {
      console.error("Web3 sign in error:", error)
      setError("Failed to sign message. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const result = await signIn("credentials", {
        email: emailForm.email,
        password: emailForm.password,
        redirect: false,
      })

      if (result?.error) {
        setError("Invalid email or password")
      } else {
        router.push("/dashboard")
      }
    } catch (error) {
      setError("Sign in failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-amber-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-orange-600">Welcome to AgentPay</CardTitle>
          <CardDescription>Sign in to access your autonomous freelancer services</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="web3" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="web3" className="flex items-center gap-2">
                <Wallet className="h-4 w-4" />
                Web3 Wallet
              </TabsTrigger>
              <TabsTrigger value="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email
              </TabsTrigger>
            </TabsList>

            <TabsContent value="web3" className="space-y-4">
              <div className="space-y-4">
                <WalletConnectButton />

                {isConnected && address && (
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">
                      Connected: {address.slice(0, 6)}...{address.slice(-4)}
                    </p>
                    <Button
                      onClick={handleWeb3SignIn}
                      disabled={isLoading}
                      className="w-full bg-orange-600 hover:bg-orange-700"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Signing In...
                        </>
                      ) : (
                        "Sign In with Wallet"
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="email" className="space-y-4">
              <form onSubmit={handleEmailSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={emailForm.email}
                    onChange={(e) => setEmailForm((prev) => ({ ...prev, email: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={emailForm.password}
                    onChange={(e) => setEmailForm((prev) => ({ ...prev, password: e.target.value }))}
                    required
                  />
                </div>
                <Button type="submit" disabled={isLoading} className="w-full bg-orange-600 hover:bg-orange-700">
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing In...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{" "}
              <Link href="/auth/signup" className="text-orange-600 hover:underline">
                Sign up
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
