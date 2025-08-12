const { ethers } = require("hardhat")

async function main() {
  console.log("Deploying AgentPayInvoice contract...")

  // Get the contract factory
  const AgentPayInvoice = await ethers.getContractFactory("AgentPayInvoice")

  // Deploy the contract
  const agentPayInvoice = await AgentPayInvoice.deploy()
  await agentPayInvoice.waitForDeployment()

  const contractAddress = await agentPayInvoice.getAddress()
  console.log("AgentPayInvoice deployed to:", contractAddress)

  // Get network information
  const network = await ethers.provider.getNetwork()
  console.log("Network:", network.name, "Chain ID:", network.chainId)

  // Add supported tokens based on network
  const supportedTokens = getSupportedTokens(network.chainId)

  console.log("Adding supported tokens...")
  for (const [symbol, address] of Object.entries(supportedTokens)) {
    try {
      const tx = await agentPayInvoice.addSupportedToken(address)
      await tx.wait()
      console.log(`Added ${symbol} token: ${address}`)
    } catch (error) {
      console.error(`Failed to add ${symbol} token:`, error.message)
    }
  }

  console.log("\nDeployment completed!")
  console.log("Contract address:", contractAddress)
  console.log("Remember to:")
  console.log("1. Verify the contract on the block explorer")
  console.log("2. Update your environment variables with the contract address")
  console.log("3. Set up a multisig wallet for contract ownership")

  // Save deployment info
  const deploymentInfo = {
    network: network.name,
    chainId: network.chainId.toString(),
    contractAddress: contractAddress,
    deployedAt: new Date().toISOString(),
    supportedTokens: supportedTokens,
  }

  console.log("\nDeployment Info:")
  console.log(JSON.stringify(deploymentInfo, null, 2))
}

function getSupportedTokens(chainId) {
  switch (chainId.toString()) {
    case "1": // Ethereum Mainnet
      return {
        USDC: "0xA0b86a33E6441b8C4505B8C4505B8C4505B8C4505",
        USDT: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
      }
    case "137": // Polygon
      return {
        USDC: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
        USDT: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
      }
    case "56": // BSC
      return {
        USDC: "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d",
        USDT: "0x55d398326f99059fF775485246999027B3197955",
      }
    case "43114": // Avalanche
      return {
        USDC: "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E",
        USDT: "0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7",
      }
    default:
      return {}
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
