import { ethers } from "ethers"
import type { DatabaseManager } from "./database"
import type { WebhookManager } from "./webhook-manager"
import { supportedChains, getContractAddress } from "../lib/chains"
import { AGENTPAY_ABI } from "../lib/contract-utils"
import { InvoiceStatus } from "../types"

interface ChainWatcher {
  provider: ethers.JsonRpcProvider
  contract: ethers.Contract
  chainId: number
  isRunning: boolean
}

export class PaymentWatcher {
  private watchers: Map<number, ChainWatcher> = new Map()
  private db: DatabaseManager
  private webhookManager: WebhookManager
  private isInitialized = false

  constructor(db: DatabaseManager, webhookManager: WebhookManager) {
    this.db = db
    this.webhookManager = webhookManager
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return

    console.log("Initializing payment watchers for all chains...")

    for (const chain of supportedChains) {
      try {
        await this.initializeChainWatcher(chain.id)
        console.log(`Payment watcher initialized for ${chain.name}`)
      } catch (error) {
        console.error(`Failed to initialize watcher for ${chain.name}:`, error)
      }
    }

    this.isInitialized = true
    console.log("All payment watchers initialized")
  }

  private async initializeChainWatcher(chainId: number): Promise<void> {
    const chain = supportedChains.find((c) => c.id === chainId)
    if (!chain) {
      throw new Error(`Unsupported chain: ${chainId}`)
    }

    const contractAddress = getContractAddress(chainId)
    if (!contractAddress) {
      console.warn(`No contract address for chain ${chainId}, skipping watcher`)
      return
    }

    const provider = new ethers.JsonRpcProvider(chain.rpcUrl)
    const contract = new ethers.Contract(contractAddress, AGENTPAY_ABI, provider)

    const watcher: ChainWatcher = {
      provider,
      contract,
      chainId,
      isRunning: false,
    }

    this.watchers.set(chainId, watcher)
    await this.startWatcher(watcher)
  }

  private async startWatcher(watcher: ChainWatcher): Promise<void> {
    if (watcher.isRunning) return

    watcher.isRunning = true

    // Listen for InvoicePaid events
    watcher.contract.on("InvoicePaid", async (invoiceId, payer, token, amount, timestamp, event) => {
      try {
        console.log(`Payment detected on chain ${watcher.chainId}:`, {
          invoiceId,
          payer,
          token,
          amount: amount.toString(),
          txHash: event.transactionHash,
        })

        await this.handlePaymentEvent({
          invoiceId,
          payer,
          token,
          amount: amount.toString(),
          txHash: event.transactionHash,
          chainId: watcher.chainId,
          blockNumber: event.blockNumber,
        })
      } catch (error) {
        console.error("Error handling payment event:", error)
      }
    })

    // Listen for InvoiceCreated events
    watcher.contract.on("InvoiceCreated", async (invoiceId, payee, token, amount, expiryTimestamp, event) => {
      console.log(`Invoice created on chain ${watcher.chainId}:`, {
        invoiceId,
        payee,
        token,
        amount: amount.toString(),
        txHash: event.transactionHash,
      })
    })

    console.log(`Started event listener for chain ${watcher.chainId}`)
  }

  private async handlePaymentEvent(eventData: {
    invoiceId: string
    payer: string
    token: string
    amount: string
    txHash: string
    chainId: number
    blockNumber: number
  }): Promise<void> {
    const { invoiceId, payer, token, amount, txHash, chainId } = eventData

    try {
      // Get invoice from database
      const invoice = await this.db.getInvoice(invoiceId)
      if (!invoice) {
        console.warn(`Invoice not found in database: ${invoiceId}`)
        return
      }

      // Check if payment already processed
      const existingPayment = await this.db.getPaymentByTxHash(txHash)
      if (existingPayment) {
        console.log(`Payment already processed: ${txHash}`)
        return
      }

      // Get current block number for confirmation calculation
      const watcher = this.watchers.get(chainId)
      if (!watcher) {
        console.error(`No watcher found for chain ${chainId}`)
        return
      }

      const currentBlock = await watcher.provider.getBlockNumber()
      const confirmations = Math.max(0, currentBlock - eventData.blockNumber)

      // Create payment record
      await this.db.createPayment({
        invoiceId,
        txHash,
        payer,
        amount,
        token,
        chain: chainId.toString(),
        confirmations,
      })

      // Check if we have enough confirmations
      const requiredConfirmations = this.getRequiredConfirmations(chainId)

      if (confirmations >= requiredConfirmations) {
        await this.processConfirmedPayment(invoice, txHash, payer)
      } else {
        console.log(`Payment needs more confirmations: ${confirmations}/${requiredConfirmations}`)
        // Set up confirmation monitoring
        this.monitorConfirmations(txHash, chainId, requiredConfirmations)
      }
    } catch (error) {
      console.error("Error processing payment event:", error)
    }
  }

  private async processConfirmedPayment(invoice: any, txHash: string, payer: string): Promise<void> {
    try {
      // Update invoice status to paid
      await this.db.updateInvoiceStatus(invoice.invoiceId, InvoiceStatus.PAID, {
        txHash,
        payer,
        paidAt: Math.floor(Date.now() / 1000),
      })

      console.log(`Invoice ${invoice.invoiceId} marked as paid`)

      // Send webhook notification
      await this.webhookManager.sendPaymentWebhook({
        invoiceId: invoice.invoiceId,
        txHash,
        payer,
        amount: invoice.amount,
        token: invoice.token,
        chain: invoice.chain,
        serviceType: invoice.serviceType,
        description: invoice.description,
      })

      // Update invoice status to in progress (ready for delivery)
      await this.db.updateInvoiceStatus(invoice.invoiceId, InvoiceStatus.IN_PROGRESS)
    } catch (error) {
      console.error("Error processing confirmed payment:", error)
    }
  }

  private async monitorConfirmations(txHash: string, chainId: number, requiredConfirmations: number): Promise<void> {
    const watcher = this.watchers.get(chainId)
    if (!watcher) return

    const checkConfirmations = async () => {
      try {
        const receipt = await watcher.provider.getTransactionReceipt(txHash)
        if (!receipt) return

        const currentBlock = await watcher.provider.getBlockNumber()
        const confirmations = currentBlock - receipt.blockNumber

        // Update payment confirmations
        await this.db.updatePaymentConfirmations(txHash, confirmations)

        if (confirmations >= requiredConfirmations) {
          const payment = await this.db.getPaymentByTxHash(txHash)
          if (payment) {
            const invoice = await this.db.getInvoice(payment.invoiceId)
            if (invoice && invoice.status === InvoiceStatus.CREATED) {
              await this.processConfirmedPayment(invoice, txHash, payment.payer)
            }
          }
        } else {
          // Check again in 30 seconds
          setTimeout(checkConfirmations, 30000)
        }
      } catch (error) {
        console.error("Error checking confirmations:", error)
        // Retry in 60 seconds
        setTimeout(checkConfirmations, 60000)
      }
    }

    // Start monitoring
    setTimeout(checkConfirmations, 10000) // Initial delay
  }

  private getRequiredConfirmations(chainId: number): number {
    switch (chainId) {
      case 1: // Ethereum
        return 3
      case 137: // Polygon
        return 10
      case 56: // BSC
        return 5
      case 43114: // Avalanche
        return 3
      default:
        return 3
    }
  }

  async stop(): Promise<void> {
    console.log("Stopping payment watchers...")

    for (const [chainId, watcher] of this.watchers) {
      try {
        watcher.contract.removeAllListeners()
        watcher.isRunning = false
        console.log(`Stopped watcher for chain ${chainId}`)
      } catch (error) {
        console.error(`Error stopping watcher for chain ${chainId}:`, error)
      }
    }

    this.watchers.clear()
    this.isInitialized = false
    console.log("All payment watchers stopped")
  }
}
