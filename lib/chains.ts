import type { ChainConfig } from "@/types"

export const supportedChains: ChainConfig[] = [
  {
    id: 1,
    name: "Ethereum",
    rpcUrl: "https://ethereum.publicnode.com",
    blockExplorer: "https://etherscan.io",
    nativeCurrency: {
      name: "Ethereum",
      symbol: "ETH",
      decimals: 18,
    },
    tokens: {
      USDC: process.env.NEXT_PUBLIC_ETHEREUM_USDC || "0xA0b86a33E6441b8C4505B8C4505B8C4505B8C4505",
      USDT: process.env.NEXT_PUBLIC_ETHEREUM_USDT || "0xdAC17F958D2ee523a2206206994597C13D831ec7",
    },
  },
  {
    id: 137,
    name: "Polygon",
    rpcUrl: "https://polygon-rpc.com",
    blockExplorer: "https://polygonscan.com",
    nativeCurrency: {
      name: "Polygon",
      symbol: "MATIC",
      decimals: 18,
    },
    tokens: {
      USDC: process.env.NEXT_PUBLIC_POLYGON_USDC || "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
      USDT: process.env.NEXT_PUBLIC_POLYGON_USDT || "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
    },
  },
  {
    id: 56,
    name: "BSC",
    rpcUrl: "https://bsc-dataseed1.binance.org",
    blockExplorer: "https://bscscan.com",
    nativeCurrency: {
      name: "BNB",
      symbol: "BNB",
      decimals: 18,
    },
    tokens: {
      USDC: "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d",
      USDT: "0x55d398326f99059fF775485246999027B3197955",
    },
  },
  {
    id: 43114,
    name: "Avalanche",
    rpcUrl: "https://api.avax.network/ext/bc/C/rpc",
    blockExplorer: "https://snowtrace.io",
    nativeCurrency: {
      name: "Avalanche",
      symbol: "AVAX",
      decimals: 18,
    },
    tokens: {
      USDC: "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E",
      USDT: "0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7",
    },
  },
  {
    id: 8453,
    name: "Base",
    rpcUrl: "https://mainnet.base.org",
    blockExplorer: "https://basescan.org",
    nativeCurrency: {
      name: "Ethereum",
      symbol: "ETH",
      decimals: 18,
    },
    tokens: {
      USDC: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
      USDT: "0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2",
    },
  },
]

export const getChainById = (chainId: number): ChainConfig | undefined => {
  return supportedChains.find((chain) => chain.id === chainId)
}

export const getContractAddress = (chainId: number): string => {
  switch (chainId) {
    case 1:
      return process.env.NEXT_PUBLIC_ETHEREUM_CONTRACT || ""
    case 137:
      return process.env.NEXT_PUBLIC_POLYGON_CONTRACT || ""
    case 56:
      return process.env.NEXT_PUBLIC_BSC_CONTRACT || ""
    case 43114:
      return process.env.NEXT_PUBLIC_AVALANCHE_CONTRACT || ""
    case 8453:
      return process.env.NEXT_PUBLIC_BASE_CONTRACT || ""
    default:
      return ""
  }
}
