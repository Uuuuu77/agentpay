import { createConfig, http } from "wagmi"
import { mainnet, polygon, bsc, avalanche } from "wagmi/chains"
import { coinbaseWallet, metaMask, walletConnect } from "wagmi/connectors"

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "demo-project-id"

export const wagmiConfig = createConfig({
  chains: [mainnet, polygon, bsc, avalanche],
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
        url: "https://agentpay.app",
        icons: ["/logo.png"],
      },
    }),
  ],
  transports: {
    [mainnet.id]: http(process.env.ETHEREUM_RPC_URL),
    [polygon.id]: http(process.env.POLYGON_RPC_URL),
    [bsc.id]: http(process.env.BSC_RPC_URL),
    [avalanche.id]: http(process.env.AVALANCHE_RPC_URL),
  },
})
