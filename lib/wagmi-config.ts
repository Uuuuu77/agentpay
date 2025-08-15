import { createConfig, http } from "wagmi"
import { mainnet, polygon, bsc, avalanche, base } from "wagmi/chains"
import { coinbaseWallet, metaMask, walletConnect, injected } from "wagmi/connectors"

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "demo-project-id"

export const wagmiConfig = createConfig({
  chains: [mainnet, polygon, bsc, avalanche, base],
  connectors: [
    metaMask(),
    coinbaseWallet({
      appName: "AgentPay",
      appLogoUrl: "/logo.png",
    }),
    walletConnect({
      projectId,
      metadata: {
        name: "AgentPay",
        description: "Autonomous freelancer agent platform",
        url: process.env.NEXT_PUBLIC_SITE_URL || "https://v0-agent-pay.vercel.app",
        icons: ["/logo.png"],
      },
    }),
    injected({
      target: () => ({
        id: "binance",
        name: "Binance Wallet",
        provider: typeof window !== "undefined" ? (window as any).BinanceChain : undefined,
      }),
    }),
    injected({
      target: () => ({
        id: "trust",
        name: "Trust Wallet",
        provider: typeof window !== "undefined" ? (window as any).trustWallet : undefined,
      }),
    }),
    injected({
      target: () => ({
        id: "okx",
        name: "OKX Wallet",
        provider: typeof window !== "undefined" ? (window as any).okxwallet : undefined,
      }),
    }),
  ],
  transports: {
    [mainnet.id]: http(process.env.ETHEREUM_RPC_URL),
    [polygon.id]: http(process.env.POLYGON_RPC_URL),
    [bsc.id]: http(process.env.BSC_RPC_URL),
    [avalanche.id]: http(process.env.AVALANCHE_RPC_URL),
    [base.id]: http(process.env.BASE_RPC_URL),
  },
})
