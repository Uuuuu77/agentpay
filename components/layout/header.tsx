"use client"

import Link from "next/link"
import { WalletConnectButton } from "@/components/wallet/wallet-connect-button"
import { ChainSelector } from "@/components/wallet/chain-selector"
import { useAccount } from "wagmi"

export function Header() {
  const { isConnected } = useAccount()

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-orange rounded-lg flex items-center justify-center shadow-orange">
              <span className="text-white font-bold text-sm">AP</span>
            </div>
            <span className="font-bold text-xl">AgentPay</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link href="/services" className="text-sm font-medium hover:text-primary transition-colors">
              Services
            </Link>
            <Link href="/invoices" className="text-sm font-medium hover:text-primary transition-colors">
              Invoices
            </Link>
            <Link href="/about" className="text-sm font-medium hover:text-primary transition-colors">
              About
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {isConnected && <ChainSelector />}
          <WalletConnectButton />
        </div>
      </div>
    </header>
  )
}
