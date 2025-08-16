import { http, createConfig } from "wagmi"
import { mainnet, polygon, bsc, avalanche, base, arbitrum, optimism } from "wagmi/chains"
import { walletConnect, injected, coinbaseWallet, safe } from "wagmi/connectors"

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "bf2e795f-c0ef-4c3d-8136-1371dd9725d3"

export const config = createConfig({
  chains: [mainnet, polygon, bsc, avalanche, base, arbitrum, optimism],
  connectors: [
    injected(), // MetaMask, Brave, etc.
    walletConnect({ 
      projectId,
      metadata: {
        name: "AgentPay",
        description: "Autonomous freelancer agent platform with crypto payments",
        url: process.env.NEXTAUTH_URL || "https://v0-agent-pay.vercel.app",
        icons: ["/placeholder-logo.png"],
      },
    }),
    coinbaseWallet({ 
      appName: "AgentPay",
      appLogoUrl: "/placeholder-logo.png",
    }),
    safe(),
  ],
  transports: {
    [mainnet.id]: http(),
    [polygon.id]: http(),
    [bsc.id]: http(),
    [avalanche.id]: http(),
    [base.id]: http(),
    [arbitrum.id]: http(),
    [optimism.id]: http(),
  },
})

// Backward compatibility
export const wagmiConfig = config
