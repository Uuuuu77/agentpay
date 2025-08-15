"use client"

import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { WalletConnectButton } from "@/components/wallet/wallet-connect-button"
import { ChainSelector } from "@/components/wallet/chain-selector"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAccount } from "wagmi"
import { User, LogOut, Settings, FileText } from "lucide-react"

export function Header() {
  const { isConnected } = useAccount()
  const { data: session, status } = useSession()

  // Handle loading and error states gracefully
  const isLoading = status === "loading"
  const isAuthenticated = status === "authenticated" && session?.user

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
            {isAuthenticated && (
              <Link href="/dashboard" className="text-sm font-medium hover:text-primary transition-colors">
                Dashboard
              </Link>
            )}
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

          {isLoading ? (
            <div className="w-8 h-8 rounded bg-gray-200 animate-pulse" />
          ) : isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline">{session.user.name || session.user.email || "Account"}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem asChild>
                  <Link href="/dashboard" className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/settings" className="flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="flex items-center gap-2 text-red-600"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild variant="outline" size="sm">
              <Link href="/auth/signin">Sign In</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}
