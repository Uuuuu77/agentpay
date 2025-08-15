import { type NextRequest, NextResponse } from "next/server"
import { ethers } from "ethers"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

const CHAINS = {
  ethereum: {
    rpc: `https://eth-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
    confirmations: 12,
    tokens: {
      USDC: "0xA0b86a33E6441b8C4505E2c52C6b6046d4c8C6b8",
      USDT: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
    },
  },
  polygon: {
    rpc: `https://polygon-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
    confirmations: 20,
    tokens: {
      USDC: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
      USDT: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
    },
  },
  bsc: {
    rpc: `https://bnb-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
    confirmations: 15,
    tokens: {
      USDC: "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d",
      USDT: "0x55d398326f99059fF775485246999027B3197955",
    },
  },
  avalanche: {
    rpc: `https://avax-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
    confirmations: 10,
    tokens: {
      USDC: "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E",
      USDT: "0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7",
    },
  },
  base: {
    rpc: `https://base-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
    confirmations: 10,
    tokens: {
      USDC: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
      USDT: "0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2",
    },
  },
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { chain = "polygon" } = body

    const chainConfig = CHAINS[chain as keyof typeof CHAINS]
    if (!chainConfig) {
      return NextResponse.json({ error: "Unsupported chain" }, { status: 400 })
    }

    const provider = new ethers.JsonRpcProvider(chainConfig.rpc)
    const payeeAddress = process.env.PAYEE_ADDRESS!

    // Start monitoring for payments
    const startWatcher = async () => {
      console.log(`Starting payment watcher for ${chain}...`)

      // Monitor USDC transfers
      const usdcContract = new ethers.Contract(
        chainConfig.tokens.USDC,
        ["event Transfer(address indexed from, address indexed to, uint256 value)"],
        provider,
      )

      usdcContract.on("Transfer", async (from, to, value, event) => {
        if (to.toLowerCase() === payeeAddress.toLowerCase()) {
          await handlePayment({
            txHash: event.transactionHash,
            from: from,
            to: to,
            amount: ethers.formatUnits(value, 6), // USDC has 6 decimals
            token: "USDC",
            chain: chain,
            blockNumber: event.blockNumber,
          })
        }
      })

      // Monitor USDT transfers
      const usdtContract = new ethers.Contract(
        chainConfig.tokens.USDT,
        ["event Transfer(address indexed from, address indexed to, uint256 value)"],
        provider,
      )

      usdtContract.on("Transfer", async (from, to, value, event) => {
        if (to.toLowerCase() === payeeAddress.toLowerCase()) {
          await handlePayment({
            txHash: event.transactionHash,
            from: from,
            to: to,
            amount: ethers.formatUnits(value, 6), // Both USDT contracts use 6 decimals
            token: "USDT",
            chain: chain,
            blockNumber: event.blockNumber,
          })
        }
      })
    }

    // Start the watcher
    startWatcher()

    return NextResponse.json({
      message: `Payment watcher started for ${chain}`,
      payee_address: payeeAddress,
      monitoring_tokens: Object.keys(chainConfig.tokens),
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to start payment watcher" }, { status: 500 })
  }
}

async function handlePayment(paymentData: any) {
  try {
    // Find matching invoice by amount and check if payment already exists
    const existingPayment = await sql`
      SELECT * FROM payments WHERE tx_hash = ${paymentData.txHash}
    `

    if (existingPayment.length > 0) {
      console.log("Payment already processed:", paymentData.txHash)
      return
    }

    // Find invoice by amount (simplified matching)
    const matchingInvoices = await sql`
      SELECT * FROM invoices 
      WHERE amount = ${paymentData.amount} 
      AND token = ${paymentData.token}
      AND chain = ${paymentData.chain}
      AND status = 'pending'
      ORDER BY created_at ASC
      LIMIT 1
    `

    if (matchingInvoices.length === 0) {
      console.log("No matching invoice found for payment:", paymentData)
      return
    }

    const invoice = matchingInvoices[0]

    // Record the payment
    await sql`
      INSERT INTO payments (
        invoice_id, tx_hash, amount, token, chain, from_address,
        block_number, status, created_at
      ) VALUES (
        ${invoice.invoice_id}, ${paymentData.txHash}, ${paymentData.amount},
        ${paymentData.token}, ${paymentData.chain}, ${paymentData.from},
        ${paymentData.blockNumber}, 'confirmed', NOW()
      )
    `

    // Update invoice status
    await sql`
      UPDATE invoices 
      SET status = 'paid', updated_at = NOW()
      WHERE invoice_id = ${invoice.invoice_id}
    `

    console.log(`Payment confirmed for invoice ${invoice.invoice_id}`)

    // Trigger service delivery (webhook or direct processing)
    if (process.env.AGENT_DELIVERY_URL) {
      await fetch(process.env.AGENT_DELIVERY_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invoice_id: invoice.invoice_id,
          service_type: invoice.service_type,
          service_config: invoice.service_config,
          payment_confirmed: true,
        }),
      })
    }
  } catch (error) {
    console.error("Error handling payment:", error)
  }
}
