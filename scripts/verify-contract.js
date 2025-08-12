const { run } = require("hardhat")

async function main() {
  const contractAddress = process.argv[2]

  if (!contractAddress) {
    console.error("Please provide contract address as argument")
    process.exit(1)
  }

  console.log("Verifying contract at:", contractAddress)

  try {
    await run("verify:verify", {
      address: contractAddress,
      constructorArguments: [],
    })
    console.log("Contract verified successfully!")
  } catch (error) {
    if (error.message.toLowerCase().includes("already verified")) {
      console.log("Contract is already verified!")
    } else {
      console.error("Verification failed:", error.message)
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
