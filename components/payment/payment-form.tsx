"use client"

import { useState } from "react"
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi"
import { formatUnits } from "viem"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, CheckCircle, ExternalLink } from "lucide-react"
import { AGENTPAY_ABI, ERC20_ABI } from "@/lib/contract-utils"
import { getContractAddress, getChainById } from "@/lib/chains"
import type { Invoice } from "@/types"

interface PaymentFormProps {
  invoice: Invoice
  onPaymentSuccess?: (txHash: string) => void
}

export function PaymentForm({ invoice, onPaymentSuccess }: PaymentFormProps) {
  const { address, chain } = useAccount()
  const [step, setStep] = useState<"approve" | "pay" | "confirming" | "success">("approve")
  const [approvalTxHash, setApprovalTxHash] = useState<string>()
  const [paymentTxHash, setPaymentTxHash] = useState<string>()

  const { writeContract: writeApproval, isPending: isApprovePending } = useWriteContract()
  const { writeContract: writePayment, isPending: isPaymentPending } = useWriteContract()

  const { isLoading: isApprovalConfirming } = useWaitForTransactionReceipt({
    hash: approvalTxHash as `0x${string}`,
    onSuccess: () => {
      setStep("pay")
    },
  })

  const { isLoading: isPaymentConfirming } = useWaitForTransactionReceipt({
    hash: paymentTxHash as `0x${string}`,
    onSuccess: (receipt) => {
      setStep("success")
      onPaymentSuccess?.(receipt.transactionHash)
    },
  })

  const chainConfig = getChainById(Number.parseInt(invoice.chain))
  const contractAddress = getContractAddress(Number.parseInt(invoice.chain))
  const displayAmount = formatUnits(BigInt(invoice.amount), 6)

  const handleApprove = async () => {
    if (!address || !chain || !contractAddress) return

    try {
      const hash = await writeApproval({
        address: invoice.token as `0x${string}`,
        abi: ERC20_ABI,
        functionName: "approve",
        args: [contractAddress, BigInt(invoice.amount)],
      })
      setApprovalTxHash(hash)
    } catch (error) {
      console.error("Approval failed:", error)
    }
  }

  const handlePayment = async () => {
    if (!address || !chain || !contractAddress) return

    try {
      const hash = await writePayment({
        address: contractAddress as `0x${string}`,
        abi: AGENTPAY_ABI,
        functionName: "payInvoice",
        args: [invoice.invoiceId as `0x${string}`],
      })
      setPaymentTxHash(hash)
      setStep("confirming")
    } catch (error) {
      console.error("Payment failed:", error)
    }
  }

  const getStepStatus = (stepName: string) => {
    switch (stepName) {
      case "approve":
        return step === "approve"
          ? "current"
          : step === "pay" || step === "confirming" || step === "success"
            ? "completed"
            : "pending"
      case "pay":
        return step === "pay" ? "current" : step === "confirming" || step === "success" ? "completed" : "pending"
      case "confirming":
        return step === "confirming" ? "current" : step === "success" ? "completed" : "pending"
      case "success":
        return step === "success" ? "completed" : "pending"
      default:
        return "pending"
    }
  }

  const getBlockExplorerUrl = (txHash: string) => {
    return `${chainConfig?.blockExplorer}/tx/${txHash}`
  }

  if (step === "success") {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-600">
            <CheckCircle className="h-5 w-5" />
            Payment Successful!
          </CardTitle>
          <CardDescription>Your payment has been submitted and is being processed.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between">
            <span>Amount Paid:</span>
            <span className="font-medium">{displayAmount} USDC</span>
          </div>
          <div className="flex justify-between">
            <span>Transaction:</span>
            <a
              href={getBlockExplorerUrl(paymentTxHash!)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-blue-600 hover:underline"
            >
              View on Explorer
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              Your service will be delivered once the payment is confirmed on the blockchain. You'll receive an email
              notification when it's ready.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Complete Payment</CardTitle>
        <CardDescription>Pay {displayAmount} USDC to complete your order</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Payment Steps */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                getStepStatus("approve") === "completed"
                  ? "bg-green-500 text-white"
                  : getStepStatus("approve") === "current"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-gray-600"
              }`}
            >
              {getStepStatus("approve") === "completed" ? "✓" : "1"}
            </div>
            <span className={getStepStatus("approve") === "current" ? "font-medium" : ""}>Approve Token Spending</span>
            {isApprovePending && <Loader2 className="h-4 w-4 animate-spin" />}
          </div>

          <div className="flex items-center gap-3">
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                getStepStatus("pay") === "completed"
                  ? "bg-green-500 text-white"
                  : getStepStatus("pay") === "current"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-gray-600"
              }`}
            >
              {getStepStatus("pay") === "completed" ? "✓" : "2"}
            </div>
            <span className={getStepStatus("pay") === "current" ? "font-medium" : ""}>Send Payment</span>
            {isPaymentPending && <Loader2 className="h-4 w-4 animate-spin" />}
          </div>

          <div className="flex items-center gap-3">
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                getStepStatus("confirming") === "completed"
                  ? "bg-green-500 text-white"
                  : getStepStatus("confirming") === "current"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-gray-600"
              }`}
            >
              {getStepStatus("confirming") === "completed" ? "✓" : "3"}
            </div>
            <span className={getStepStatus("confirming") === "current" ? "font-medium" : ""}>
              Confirming Transaction
            </span>
            {isPaymentConfirming && <Loader2 className="h-4 w-4 animate-spin" />}
          </div>
        </div>

        {/* Action Button */}
        <div className="space-y-3">
          {step === "approve" && (
            <Button onClick={handleApprove} disabled={isApprovePending || isApprovalConfirming} className="w-full">
              {isApprovePending || isApprovalConfirming ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  {isApprovePending ? "Approving..." : "Confirming..."}
                </>
              ) : (
                "Approve USDC Spending"
              )}
            </Button>
          )}

          {step === "pay" && (
            <Button onClick={handlePayment} disabled={isPaymentPending} className="w-full">
              {isPaymentPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Sending Payment...
                </>
              ) : (
                `Pay ${displayAmount} USDC`
              )}
            </Button>
          )}

          {step === "confirming" && (
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-blue-600" />
              <p className="text-sm text-blue-800">Transaction submitted. Waiting for confirmation...</p>
            </div>
          )}
        </div>

        {/* Transaction Links */}
        {approvalTxHash && (
          <div className="text-sm text-muted-foreground">
            Approval transaction:{" "}
            <a
              href={getBlockExplorerUrl(approvalTxHash)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              View on Explorer
            </a>
          </div>
        )}

        {paymentTxHash && (
          <div className="text-sm text-muted-foreground">
            Payment transaction:{" "}
            <a
              href={getBlockExplorerUrl(paymentTxHash)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              View on Explorer
            </a>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
