const { expect } = require("chai")
const { ethers } = require("hardhat")
const { time } = require("@nomicfoundation/hardhat-network-helpers")

describe("AgentPayInvoice", () => {
  let agentPayInvoice
  let mockToken
  let owner
  let payee
  let payer
  let otherAccount

  const INVOICE_ID = ethers.keccak256(ethers.toUtf8Bytes("test-invoice-1"))
  const AMOUNT = ethers.parseUnits("100", 6) // 100 USDC (6 decimals)

  beforeEach(async () => {
    ;[owner, payee, payer, otherAccount] = await ethers.getSigners()

    // Deploy mock ERC20 token
    const MockToken = await ethers.getContractFactory("MockERC20")
    mockToken = await MockToken.deploy("Mock USDC", "USDC", 6)
    await mockToken.waitForDeployment()

    // Deploy AgentPayInvoice contract
    const AgentPayInvoice = await ethers.getContractFactory("AgentPayInvoice")
    agentPayInvoice = await AgentPayInvoice.deploy()
    await agentPayInvoice.waitForDeployment()

    // Add mock token as supported
    await agentPayInvoice.addSupportedToken(await mockToken.getAddress())

    // Mint tokens to payer
    await mockToken.mint(payer.address, ethers.parseUnits("1000", 6))
  })

  describe("Deployment", () => {
    it("Should set the right owner", async () => {
      expect(await agentPayInvoice.owner()).to.equal(owner.address)
    })

    it("Should support added tokens", async () => {
      const tokenAddress = await mockToken.getAddress()
      expect(await agentPayInvoice.supportedTokens(tokenAddress)).to.be.true
    })
  })

  describe("Invoice Creation", () => {
    it("Should create an invoice successfully", async () => {
      const expiryTimestamp = Math.floor(Date.now() / 1000) + 3600 // 1 hour from now
      const tokenAddress = await mockToken.getAddress()

      await expect(agentPayInvoice.createInvoice(INVOICE_ID, tokenAddress, AMOUNT, payee.address, expiryTimestamp))
        .to.emit(agentPayInvoice, "InvoiceCreated")
        .withArgs(INVOICE_ID, payee.address, tokenAddress, AMOUNT, expiryTimestamp)

      const invoice = await agentPayInvoice.getInvoice(INVOICE_ID)
      expect(invoice.invoiceId).to.equal(INVOICE_ID)
      expect(invoice.payee).to.equal(payee.address)
      expect(invoice.amount).to.equal(AMOUNT)
      expect(invoice.isPaid).to.be.false
    })

    it("Should reject duplicate invoice IDs", async () => {
      const expiryTimestamp = Math.floor(Date.now() / 1000) + 3600
      const tokenAddress = await mockToken.getAddress()

      await agentPayInvoice.createInvoice(INVOICE_ID, tokenAddress, AMOUNT, payee.address, expiryTimestamp)

      await expect(
        agentPayInvoice.createInvoice(INVOICE_ID, tokenAddress, AMOUNT, payee.address, expiryTimestamp),
      ).to.be.revertedWith("Invoice already exists")
    })

    it("Should reject unsupported tokens", async () => {
      const expiryTimestamp = Math.floor(Date.now() / 1000) + 3600
      const unsupportedToken = ethers.ZeroAddress

      await expect(
        agentPayInvoice.createInvoice(INVOICE_ID, unsupportedToken, AMOUNT, payee.address, expiryTimestamp),
      ).to.be.revertedWith("Token not supported")
    })

    it("Should reject expired timestamps", async () => {
      const expiredTimestamp = Math.floor(Date.now() / 1000) - 3600 // 1 hour ago
      const tokenAddress = await mockToken.getAddress()

      await expect(
        agentPayInvoice.createInvoice(INVOICE_ID, tokenAddress, AMOUNT, payee.address, expiredTimestamp),
      ).to.be.revertedWith("Expiry must be in the future")
    })
  })

  describe("Invoice Payment", () => {
    beforeEach(async () => {
      const expiryTimestamp = Math.floor(Date.now() / 1000) + 3600
      const tokenAddress = await mockToken.getAddress()

      await agentPayInvoice.createInvoice(INVOICE_ID, tokenAddress, AMOUNT, payee.address, expiryTimestamp)

      // Approve contract to spend payer's tokens
      await mockToken.connect(payer).approve(await agentPayInvoice.getAddress(), AMOUNT)
    })

    it("Should pay an invoice successfully", async () => {
      const tokenAddress = await mockToken.getAddress()

      await expect(agentPayInvoice.connect(payer).payInvoice(INVOICE_ID))
        .to.emit(agentPayInvoice, "InvoicePaid")
        .withArgs(INVOICE_ID, payer.address, tokenAddress, AMOUNT, await time.latest())

      const invoice = await agentPayInvoice.getInvoice(INVOICE_ID)
      expect(invoice.isPaid).to.be.true
      expect(invoice.payer).to.equal(payer.address)
    })

    it("Should transfer tokens to contract", async () => {
      const contractAddress = await agentPayInvoice.getAddress()
      const tokenAddress = await mockToken.getAddress()

      const initialBalance = await mockToken.balanceOf(contractAddress)
      await agentPayInvoice.connect(payer).payInvoice(INVOICE_ID)
      const finalBalance = await mockToken.balanceOf(contractAddress)

      expect(finalBalance - initialBalance).to.equal(AMOUNT)
    })

    it("Should reject payment for non-existent invoice", async () => {
      const nonExistentId = ethers.keccak256(ethers.toUtf8Bytes("non-existent"))

      await expect(agentPayInvoice.connect(payer).payInvoice(nonExistentId)).to.be.revertedWith(
        "Invoice does not exist",
      )
    })

    it("Should reject double payment", async () => {
      await agentPayInvoice.connect(payer).payInvoice(INVOICE_ID)

      await expect(agentPayInvoice.connect(payer).payInvoice(INVOICE_ID)).to.be.revertedWith("Invoice already paid")
    })
  })

  describe("Fund Withdrawal", () => {
    beforeEach(async () => {
      const expiryTimestamp = Math.floor(Date.now() / 1000) + 3600
      const tokenAddress = await mockToken.getAddress()

      await agentPayInvoice.createInvoice(INVOICE_ID, tokenAddress, AMOUNT, payee.address, expiryTimestamp)

      await mockToken.connect(payer).approve(await agentPayInvoice.getAddress(), AMOUNT)
      await agentPayInvoice.connect(payer).payInvoice(INVOICE_ID)
    })

    it("Should allow owner to withdraw funds", async () => {
      const tokenAddress = await mockToken.getAddress()
      const withdrawAmount = ethers.parseUnits("50", 6)

      await expect(agentPayInvoice.withdrawFunds(tokenAddress, withdrawAmount, payee.address))
        .to.emit(agentPayInvoice, "FundsWithdrawn")
        .withArgs(tokenAddress, withdrawAmount, payee.address)

      const payeeBalance = await mockToken.balanceOf(payee.address)
      expect(payeeBalance).to.equal(withdrawAmount)
    })

    it("Should reject withdrawal by non-owner", async () => {
      const tokenAddress = await mockToken.getAddress()
      const withdrawAmount = ethers.parseUnits("50", 6)

      await expect(
        agentPayInvoice.connect(otherAccount).withdrawFunds(tokenAddress, withdrawAmount, payee.address),
      ).to.be.revertedWith("Ownable: caller is not the owner")
    })
  })

  describe("Access Control", () => {
    it("Should only allow owner to create invoices", async () => {
      const expiryTimestamp = Math.floor(Date.now() / 1000) + 3600
      const tokenAddress = await mockToken.getAddress()

      await expect(
        agentPayInvoice
          .connect(otherAccount)
          .createInvoice(INVOICE_ID, tokenAddress, AMOUNT, payee.address, expiryTimestamp),
      ).to.be.revertedWith("Ownable: caller is not the owner")
    })

    it("Should only allow owner to add supported tokens", async () => {
      await expect(agentPayInvoice.connect(otherAccount).addSupportedToken(ethers.ZeroAddress)).to.be.revertedWith(
        "Ownable: caller is not the owner",
      )
    })
  })
})
