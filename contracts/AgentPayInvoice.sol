// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title AgentPayInvoice
 * @dev Smart contract for handling freelancer service payments with USDC/USDT
 * @author AgentPay Team
 */
contract AgentPayInvoice is Ownable, ReentrancyGuard, Pausable {
    using SafeERC20 for IERC20;

    struct Invoice {
        bytes32 invoiceId;
        address payee;
        address token;
        uint256 amount;
        uint256 expiryTimestamp;
        bool isPaid;
        bool isCancelled;
        address payer;
        uint256 paidAt;
    }

    // Mapping from invoiceId to Invoice
    mapping(bytes32 => Invoice) public invoices;
    
    // Mapping to track supported tokens
    mapping(address => bool) public supportedTokens;
    
    // Events
    event InvoiceCreated(
        bytes32 indexed invoiceId,
        address indexed payee,
        address indexed token,
        uint256 amount,
        uint256 expiryTimestamp
    );
    
    event InvoicePaid(
        bytes32 indexed invoiceId,
        address indexed payer,
        address indexed token,
        uint256 amount,
        uint256 timestamp
    );
    
    event InvoiceCancelled(
        bytes32 indexed invoiceId,
        address indexed payee
    );
    
    event TokenAdded(address indexed token);
    event TokenRemoved(address indexed token);
    event FundsWithdrawn(address indexed token, uint256 amount, address indexed to);

    constructor() {
        // Add common stablecoins as supported tokens
        // These will be updated with actual addresses during deployment
    }

    /**
     * @dev Add a supported token (only owner)
     * @param token Address of the ERC20 token to support
     */
    function addSupportedToken(address token) external onlyOwner {
        require(token != address(0), "Invalid token address");
        supportedTokens[token] = true;
        emit TokenAdded(token);
    }

    /**
     * @dev Remove a supported token (only owner)
     * @param token Address of the ERC20 token to remove
     */
    function removeSupportedToken(address token) external onlyOwner {
        supportedTokens[token] = false;
        emit TokenRemoved(token);
    }

    /**
     * @dev Create a new invoice
     * @param invoiceId Unique identifier for the invoice
     * @param token ERC20 token address for payment
     * @param amount Amount to be paid (in token decimals)
     * @param payee Address that will receive the payment
     * @param expiryTimestamp Timestamp when invoice expires
     */
    function createInvoice(
        bytes32 invoiceId,
        address token,
        uint256 amount,
        address payee,
        uint256 expiryTimestamp
    ) external onlyOwner whenNotPaused {
        require(invoiceId != bytes32(0), "Invalid invoice ID");
        require(invoices[invoiceId].invoiceId == bytes32(0), "Invoice already exists");
        require(supportedTokens[token], "Token not supported");
        require(amount > 0, "Amount must be greater than 0");
        require(payee != address(0), "Invalid payee address");
        require(expiryTimestamp > block.timestamp, "Expiry must be in the future");

        invoices[invoiceId] = Invoice({
            invoiceId: invoiceId,
            payee: payee,
            token: token,
            amount: amount,
            expiryTimestamp: expiryTimestamp,
            isPaid: false,
            isCancelled: false,
            payer: address(0),
            paidAt: 0
        });

        emit InvoiceCreated(invoiceId, payee, token, amount, expiryTimestamp);
    }

    /**
     * @dev Pay an invoice
     * @param invoiceId The invoice to pay
     */
    function payInvoice(bytes32 invoiceId) external nonReentrant whenNotPaused {
        Invoice storage invoice = invoices[invoiceId];
        
        require(invoice.invoiceId != bytes32(0), "Invoice does not exist");
        require(!invoice.isPaid, "Invoice already paid");
        require(!invoice.isCancelled, "Invoice is cancelled");
        require(block.timestamp <= invoice.expiryTimestamp, "Invoice has expired");

        // Transfer tokens from payer to contract
        IERC20(invoice.token).safeTransferFrom(msg.sender, address(this), invoice.amount);

        // Update invoice status
        invoice.isPaid = true;
        invoice.payer = msg.sender;
        invoice.paidAt = block.timestamp;

        emit InvoicePaid(invoiceId, msg.sender, invoice.token, invoice.amount, block.timestamp);
    }

    /**
     * @dev Cancel an invoice (only owner)
     * @param invoiceId The invoice to cancel
     */
    function cancelInvoice(bytes32 invoiceId) external onlyOwner {
        Invoice storage invoice = invoices[invoiceId];
        
        require(invoice.invoiceId != bytes32(0), "Invoice does not exist");
        require(!invoice.isPaid, "Cannot cancel paid invoice");
        require(!invoice.isCancelled, "Invoice already cancelled");

        invoice.isCancelled = true;
        emit InvoiceCancelled(invoiceId, invoice.payee);
    }

    /**
     * @dev Withdraw funds to a specified address (only owner)
     * @param token Token to withdraw
     * @param amount Amount to withdraw
     * @param to Address to send funds to
     */
    function withdrawFunds(
        address token,
        uint256 amount,
        address to
    ) external onlyOwner nonReentrant {
        require(to != address(0), "Invalid recipient address");
        require(amount > 0, "Amount must be greater than 0");
        
        uint256 balance = IERC20(token).balanceOf(address(this));
        require(balance >= amount, "Insufficient contract balance");

        IERC20(token).safeTransfer(to, amount);
        emit FundsWithdrawn(token, amount, to);
    }

    /**
     * @dev Emergency withdraw all funds of a token (only owner)
     * @param token Token to withdraw
     * @param to Address to send funds to
     */
    function emergencyWithdraw(address token, address to) external onlyOwner {
        require(to != address(0), "Invalid recipient address");
        
        uint256 balance = IERC20(token).balanceOf(address(this));
        if (balance > 0) {
            IERC20(token).safeTransfer(to, balance);
            emit FundsWithdrawn(token, balance, to);
        }
    }

    /**
     * @dev Get invoice details
     * @param invoiceId The invoice ID to query
     */
    function getInvoice(bytes32 invoiceId) external view returns (Invoice memory) {
        return invoices[invoiceId];
    }

    /**
     * @dev Check if an invoice exists and is payable
     * @param invoiceId The invoice ID to check
     */
    function isInvoicePayable(bytes32 invoiceId) external view returns (bool) {
        Invoice memory invoice = invoices[invoiceId];
        return invoice.invoiceId != bytes32(0) && 
               !invoice.isPaid && 
               !invoice.isCancelled && 
               block.timestamp <= invoice.expiryTimestamp;
    }

    /**
     * @dev Get contract balance for a specific token
     * @param token Token address to check balance
     */
    function getTokenBalance(address token) external view returns (uint256) {
        return IERC20(token).balanceOf(address(this));
    }

    /**
     * @dev Pause contract (only owner)
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @dev Unpause contract (only owner)
     */
    function unpause() external onlyOwner {
        _unpause();
    }
}
