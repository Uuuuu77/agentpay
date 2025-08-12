// Token addresses for USDC/USDT on each supported chain
export const TOKEN_ADDRESSES = {
  ethereum: {
    USDC: "0xA0b86991c6cC5aA6dB127030C4C1C18C5e9C8bE8",
    USDT: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
  },
  polygon: {
    USDC: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
    USDT: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
  },
  bsc: {
    USDC: "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d",
    USDT: "0x55d398326f99059fF775485246999027B3197955",
  },
  avalanche: {
    USDC: "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E",
    USDT: "0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7",
  },
} as const

export const TOKEN_DECIMALS = {
  USDC: 6,
  USDT: 6,
} as const

export const SUPPORTED_CHAINS = ["ethereum", "polygon", "bsc", "avalanche"] as const
export type SupportedChain = (typeof SUPPORTED_CHAINS)[number]
export type SupportedToken = "USDC" | "USDT"
