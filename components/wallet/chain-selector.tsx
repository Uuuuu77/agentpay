"use client"

import { useAccount, useSwitchChain } from "wagmi"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ChevronDown, AlertCircle } from "lucide-react"
import { supportedChains } from "@/lib/chains"

export function ChainSelector() {
  const { chain } = useAccount()
  const { switchChain, isPending } = useSwitchChain()

  const currentChain = supportedChains.find((c) => c.id === chain?.id)
  const isUnsupportedChain = chain && !currentChain

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={isUnsupportedChain ? "destructive" : "outline"} className="gap-2" disabled={isPending}>
          {isUnsupportedChain && <AlertCircle className="h-4 w-4" />}
          {currentChain?.name || chain?.name || "Select Network"}
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {supportedChains.map((supportedChain) => (
          <DropdownMenuItem
            key={supportedChain.id}
            onClick={() => switchChain({ chainId: supportedChain.id })}
            disabled={isPending || chain?.id === supportedChain.id}
          >
            <div className="flex items-center justify-between w-full">
              <span>{supportedChain.name}</span>
              {chain?.id === supportedChain.id && <span className="text-xs text-green-600">Connected</span>}
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
