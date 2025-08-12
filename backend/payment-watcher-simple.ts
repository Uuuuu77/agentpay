// Simplified payment watcher for direct wallet payments
import { ethers } from "ethers"
import { TOKEN_ADDRESSES, TOKEN_DECIMALS } from "../lib/token-config.js"

const PAYEE_ADDRESS = process.env.PAYEE_ADDRESS!
const CONFIRMATIONS = Number.parseInt(process.env.CONFIRMATIONS_REQUIRED || "3")
const DELIVERY_URL = process.env.AGENT_DELIVERY_URL!

// Minimal ERC-20 ABI
const ERC20_ABI = [
  "event Transfer(address indexed from, address indexed to, uint256 value)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
]

interface PaymentEvent {
  txHash: string
  from: string
  to: string
  amount: string
  token: string
  chain: string
  timestamp: number
}

class SimplePaymentWatcher {
  private providers: Map<string, ethers.JsonRpcProvider> = new Map()

  constructor() {
    this.initializeProviders()
  }

  private initializeProviders() {
    const rpcUrls = {
      ethereum: process.env.ETHEREUM_RPC_URL,
      polygon: process.env.POLYGON_RPC_URL,
      bsc: process.env.BSC_RPC_URL,
      avalanche: process.env.AVALANCHE_RPC_URL,
    }

    for (const [chain, rpcUrl] of Object.entries(rpcUrls)) {
      if (rpcUrl) {
        this.providers.set(chain, new ethers.JsonRpcProvider(rpcUrl))
        console.log(`✅ Connected to ${chain}`)
      }
    }
  }

  async startWatching() {
    console.log(`🔍 Watching payments to: ${PAYEE_ADDRESS}`)

    for (const [chainName, provider] of this.providers) {
      const tokens = TOKEN_ADDRESSES[chainName as keyof typeof TOKEN_ADDRESSES]

      for (const [tokenSymbol, tokenAddress] of Object.entries(tokens)) {
        await this.watchToken(chainName, provider, tokenAddress, tokenSymbol)
      }
    }
  }

  private async watchToken(
    chainName: string,
    provider: ethers.JsonRpcProvider,
    tokenAddress: string,
    tokenSymbol: string,
  ) {
    try {
      const contract = new ethers.Contract(tokenAddress, ERC20_ABI, provider)
      const filter = contract.filters.Transfer(null, PAYEE_ADDRESS)

      console.log(`👀 Watching ${tokenSymbol} on ${chainName}: ${tokenAddress}`)

      contract.on(filter, async (from: string, to: string, value: bigint, event: any) => {
        await this.handlePayment(
          {
            txHash: event.transactionHash,
            from,
            to,
            amount: ethers.formatUnits(value, TOKEN_DECIMALS[tokenSymbol as keyof typeof TOKEN_DECIMALS]),
            token: tokenSymbol,
            chain: chainName,
            timestamp: Date.now(),
          },
          provider,
        )
      })
    } catch (error) {
      console.error(`❌ Error watching ${tokenSymbol} on ${chainName}:`, error)
    }
  }

  private async handlePayment(payment: PaymentEvent, provider: ethers.JsonRpcProvider) {
    console.log(`💰 Payment detected: ${payment.amount} ${payment.token} on ${payment.chain}`)
    console.log(`   From: ${payment.from}`)
    console.log(`   Tx: ${payment.txHash}`)

    try {
      // Wait for confirmations
      console.log(`⏳ Waiting for ${CONFIRMATIONS} confirmations...`)
      await provider.waitForTransaction(payment.txHash, CONFIRMATIONS)

      console.log(`✅ Payment confirmed! Triggering delivery...`)

      // Trigger service delivery
      await this.triggerDelivery(payment)
    } catch (error) {
      console.error(`❌ Error processing payment:`, error)
    }
  }

  private async triggerDelivery(payment: PaymentEvent) {
    try {
      const response = await fetch(DELIVERY_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payment),
      })

      if (response.ok) {
        console.log(`🚀 Delivery triggered successfully for tx: ${payment.txHash}`)
      } else {
        console.error(`❌ Delivery webhook failed: ${response.status}`)
      }
    } catch (error) {
      console.error(`❌ Error calling delivery webhook:`, error)
    }
  }
}

// Start the watcher
if (import.meta.url === `file://${process.argv[1]}`) {
  const watcher = new SimplePaymentWatcher()
  watcher.startWatching().catch(console.error)
}

export { SimplePaymentWatcher }
