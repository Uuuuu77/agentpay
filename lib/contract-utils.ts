import { ethers } from "ethers"
import { getChainById, getContractAddress } from "./chains"

// Contract ABI (essential functions only)
export const AGENTPAY_ABI = [
  "function createInvoice(bytes32 invoiceId, address token, uint256 amount, address payee, uint256 expiryTimestamp) external",
  "function payInvoice(bytes32 invoiceId) external",
  "function cancelInvoice(bytes32 invoiceId) external",
  "function getInvoice(bytes32 invoiceId) external view returns (tuple(bytes32 invoiceId, address payee, address token, uint256 amount, uint256 expiryTimestamp, bool isPaid, bool isCancelled, address payer, uint256 paidAt))",
  "function isInvoicePayable(bytes32 invoiceId) external view returns (bool)",
  "function supportedTokens(address token) external view returns (bool)",
  "function withdrawFunds(address token, uint256 amount, address to) external",
  "function getTokenBalance(address token) external view returns (uint256)",
  "event InvoiceCreated(bytes32 indexed invoiceId, address indexed payee, address indexed token, uint256 amount, uint256 expiryTimestamp)",
  "event InvoicePaid(bytes32 indexed invoiceId, address indexed payer, address indexed token, uint256 amount, uint256 timestamp)",
  "event InvoiceCancelled(bytes32 indexed invoiceId, address indexed payee)",
]

// ERC20 ABI for token operations
export const ERC20_ABI = [
  "function balanceOf(address owner) external view returns (uint256)",
  "function allowance(address owner, address spender) external view returns (uint256)",
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function transfer(address to, uint256 amount) external returns (bool)",
  "function transferFrom(address from, address to, uint256 amount) external returns (bool)",
  "function decimals() external view returns (uint8)",
  "function symbol() external view returns (string)",
  "function name() external view returns (string)",
  "event Transfer(address indexed from, address indexed to, uint256 value)",
  "event Approval(address indexed owner, address indexed spender, uint256 value)",
]

/**
 * Get contract instance for a specific chain
 */
export function getContractInstance(chainId: number, signerOrProvider: any) {
  const contractAddress = getContractAddress(chainId)
  if (!contractAddress) {
    throw new Error(`Contract not deployed on chain ${chainId}`)
  }

  return new ethers.Contract(contractAddress, AGENTPAY_ABI, signerOrProvider)
}

/**
 * Get token contract instance
 */
export function getTokenContract(tokenAddress: string, signerOrProvider: any) {
  return new ethers.Contract(tokenAddress, ERC20_ABI, signerOrProvider)
}

/**
 * Generate invoice ID from invoice data
 */
export function generateInvoiceId(data: {
  serviceType: string
  amount: string
  payee: string
  timestamp: number
}): string {
  const combined = `${data.serviceType}-${data.amount}-${data.payee}-${data.timestamp}`
  return ethers.keccak256(ethers.toUtf8Bytes(combined))
}

/**
 * Format token amount for display
 */
export function formatTokenAmount(amount: string, decimals: number): string {
  return ethers.formatUnits(amount, decimals)
}

/**
 * Parse token amount from user input
 */
export function parseTokenAmount(amount: string, decimals: number): string {
  return ethers.parseUnits(amount, decimals).toString()
}

/**
 * Get provider for a specific chain
 */
export function getProvider(chainId: number): ethers.JsonRpcProvider {
  const chain = getChainById(chainId)
  if (!chain) {
    throw new Error(`Unsupported chain: ${chainId}`)
  }

  return new ethers.JsonRpcProvider(chain.rpcUrl)
}

/**
 * Check if address is valid Ethereum address
 */
export function isValidAddress(address: string): boolean {
  try {
    return ethers.isAddress(address)
  } catch {
    return false
  }
}

/**
 * Get transaction receipt with retries
 */
export async function getTransactionReceipt(
  provider: ethers.Provider,
  txHash: string,
  maxRetries = 10,
): Promise<ethers.TransactionReceipt | null> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const receipt = await provider.getTransactionReceipt(txHash)
      if (receipt) {
        return receipt
      }
    } catch (error) {
      console.warn(`Attempt ${i + 1} failed to get receipt:`, error)
    }

    // Wait before retry
    await new Promise((resolve) => setTimeout(resolve, 2000))
  }

  return null
}

/**
 * Wait for transaction confirmation
 */
export async function waitForConfirmations(
  provider: ethers.Provider,
  txHash: string,
  confirmations = 3,
): Promise<ethers.TransactionReceipt> {
  const receipt = await provider.waitForTransaction(txHash, confirmations)
  if (!receipt) {
    throw new Error(`Transaction ${txHash} was not mined`)
  }
  return receipt
}
