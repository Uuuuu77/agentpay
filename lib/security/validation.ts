import { z } from "zod"

// Common validation schemas
export const addressSchema = z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum address")
export const txHashSchema = z.string().regex(/^0x[a-fA-F0-9]{64}$/, "Invalid transaction hash")
export const chainSchema = z.enum(["ethereum", "polygon", "bsc", "avalanche", "base"])
export const tokenSchema = z.enum(["USDC", "USDT"])

// Invoice validation schemas
export const createInvoiceSchema = z.object({
  serviceType: z.enum(["LOGO", "GRAPHIC", "SCRIPT", "PROMPT", "RESUME", "CONSULT"]),
  description: z.string().min(10, "Description must be at least 10 characters").max(500, "Description too long"),
  amount: z.number().positive("Amount must be positive").max(10000, "Amount too large"),
  chain: chainSchema,
  token: tokenSchema,
  options: z.record(z.any()).optional(),
  buyerContact: z.string().email("Invalid email").optional(),
  deadline: z.number().int().positive("Invalid deadline"),
})

export const paymentWebhookSchema = z.object({
  type: z.literal("payment_confirmed"),
  data: z.object({
    invoiceId: z.string().min(1, "Invoice ID required"),
    txHash: txHashSchema,
    payer: addressSchema,
    amount: z.string().regex(/^\d+$/, "Invalid amount format"),
    token: tokenSchema,
    chain: chainSchema,
    serviceType: z.string().min(1, "Service type required"),
    description: z.string().min(1, "Description required"),
  }),
})

// User validation schemas
export const signUpSchema = z.object({
  firstName: z.string().min(1, "First name required").max(50, "First name too long"),
  lastName: z.string().min(1, "Last name required").max(50, "Last name too long"),
  email: z.string().email("Invalid email address").max(255, "Email too long"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password too long")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "Password must contain uppercase, lowercase, and number"),
})

export const updateProfileSchema = z.object({
  firstName: z.string().min(1, "First name required").max(50, "First name too long").optional(),
  lastName: z.string().min(1, "Last name required").max(50, "Last name too long").optional(),
  email: z.string().email("Invalid email address").max(255, "Email too long").optional(),
})

// File validation
export const fileUploadSchema = z.object({
  filename: z.string().min(1, "Filename required").max(255, "Filename too long"),
  size: z
    .number()
    .positive("File size must be positive")
    .max(50 * 1024 * 1024, "File too large (50MB max)"),
  mimeType: z
    .string()
    .regex(/^[a-zA-Z0-9][a-zA-Z0-9!#$&\-^_]*\/[a-zA-Z0-9][a-zA-Z0-9!#$&\-^_.]*$/, "Invalid MIME type"),
})

// Sanitization functions
export function sanitizeString(input: string): string {
  return input
    .replace(/[<>]/g, "") // Remove potential HTML tags
    .replace(/javascript:/gi, "") // Remove javascript: protocol
    .replace(/on\w+=/gi, "") // Remove event handlers
    .trim()
}

export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, "_") // Replace special chars with underscore
    .replace(/_{2,}/g, "_") // Replace multiple underscores with single
    .substring(0, 255) // Limit length
}

// Rate limiting helpers
export function createRateLimitKey(identifier: string, endpoint: string): string {
  return `rate_limit:${identifier}:${endpoint}`
}

export function isValidOrigin(origin: string, allowedOrigins: string[]): boolean {
  if (!origin) return false
  return allowedOrigins.includes(origin) || allowedOrigins.includes("*")
}
