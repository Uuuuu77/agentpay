import { promises as fs } from "fs"
import path from "path"
import crypto from "crypto"

interface FileValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
  metadata: {
    size: number
    mimeType: string
    hash: string
  }
}

const ALLOWED_MIME_TYPES = [
  // Images
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/svg+xml",
  "image/webp",
  // Documents
  "application/pdf",
  "text/plain",
  "text/markdown",
  // Code files
  "text/javascript",
  "text/typescript",
  "text/x-python",
  "application/json",
  // Archives
  "application/zip",
  "application/x-zip-compressed",
  // Office documents
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
]

const DANGEROUS_EXTENSIONS = [
  ".exe",
  ".bat",
  ".cmd",
  ".com",
  ".pif",
  ".scr",
  ".vbs",
  ".js",
  ".jar",
  ".app",
  ".deb",
  ".pkg",
  ".dmg",
  ".rpm",
  ".msi",
  ".dll",
  ".so",
  ".dylib",
]

const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB

export async function validateFile(
  filePath: string,
  originalName: string,
  declaredMimeType?: string,
): Promise<FileValidationResult> {
  const errors: string[] = []
  const warnings: string[] = []

  try {
    // Check if file exists
    const stats = await fs.stat(filePath)

    // Size validation
    if (stats.size > MAX_FILE_SIZE) {
      errors.push(`File size ${stats.size} exceeds maximum allowed size of ${MAX_FILE_SIZE} bytes`)
    }

    if (stats.size === 0) {
      errors.push("File is empty")
    }

    // Extension validation
    const extension = path.extname(originalName).toLowerCase()
    if (DANGEROUS_EXTENSIONS.includes(extension)) {
      errors.push(`File extension ${extension} is not allowed`)
    }

    // Read file content for analysis
    const buffer = await fs.readFile(filePath)

    // Generate file hash
    const hash = crypto.createHash("sha256").update(buffer).digest("hex")

    // MIME type detection (basic)
    const detectedMimeType = detectMimeType(buffer, extension)

    // MIME type validation
    if (!ALLOWED_MIME_TYPES.includes(detectedMimeType)) {
      errors.push(`MIME type ${detectedMimeType} is not allowed`)
    }

    // Check for MIME type mismatch
    if (declaredMimeType && declaredMimeType !== detectedMimeType) {
      warnings.push(`Declared MIME type ${declaredMimeType} doesn't match detected type ${detectedMimeType}`)
    }

    // Basic malware signature detection
    const malwareCheck = await scanForMalware(buffer)
    if (!malwareCheck.isClean) {
      errors.push(...malwareCheck.threats)
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      metadata: {
        size: stats.size,
        mimeType: detectedMimeType,
        hash,
      },
    }
  } catch (error) {
    errors.push(`File validation failed: ${error instanceof Error ? error.message : "Unknown error"}`)

    return {
      isValid: false,
      errors,
      warnings,
      metadata: {
        size: 0,
        mimeType: "unknown",
        hash: "",
      },
    }
  }
}

function detectMimeType(buffer: Buffer, extension: string): string {
  // Check magic bytes for common file types
  const magicBytes = buffer.subarray(0, 16)

  // PNG
  if (magicBytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) {
    return "image/png"
  }

  // JPEG
  if (magicBytes.subarray(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff]))) {
    return "image/jpeg"
  }

  // PDF
  if (magicBytes.subarray(0, 4).equals(Buffer.from([0x25, 0x50, 0x44, 0x46]))) {
    return "application/pdf"
  }

  // ZIP
  if (magicBytes.subarray(0, 4).equals(Buffer.from([0x50, 0x4b, 0x03, 0x04]))) {
    return "application/zip"
  }

  // GIF
  if (
    magicBytes.subarray(0, 6).equals(Buffer.from("GIF87a")) ||
    magicBytes.subarray(0, 6).equals(Buffer.from("GIF89a"))
  ) {
    return "image/gif"
  }

  // Fallback to extension-based detection
  const extensionMimeMap: Record<string, string> = {
    ".txt": "text/plain",
    ".md": "text/markdown",
    ".js": "text/javascript",
    ".ts": "text/typescript",
    ".py": "text/x-python",
    ".json": "application/json",
    ".svg": "image/svg+xml",
    ".webp": "image/webp",
  }

  return extensionMimeMap[extension] || "application/octet-stream"
}

async function scanForMalware(buffer: Buffer): Promise<{ isClean: boolean; threats: string[] }> {
  const threats: string[] = []

  // Basic signature-based detection for common malware patterns
  const content = buffer.toString("binary")

  // Check for suspicious patterns
  const suspiciousPatterns = [
    /eval\s*\(/gi, // JavaScript eval
    /<script[^>]*>/gi, // Script tags
    /javascript:/gi, // JavaScript protocol
    /vbscript:/gi, // VBScript protocol
    /on\w+\s*=/gi, // Event handlers
    /%3Cscript/gi, // URL encoded script tags
    /\x00/g, // Null bytes (often used in exploits)
  ]

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(content)) {
      threats.push(`Suspicious pattern detected: ${pattern.source}`)
    }
  }

  // Check for executable signatures
  if (buffer.subarray(0, 2).equals(Buffer.from([0x4d, 0x5a]))) {
    // MZ header (Windows executable)
    threats.push("Windows executable detected")
  }

  if (buffer.subarray(0, 4).equals(Buffer.from([0x7f, 0x45, 0x4c, 0x46]))) {
    // ELF header (Linux executable)
    threats.push("Linux executable detected")
  }

  return {
    isClean: threats.length === 0,
    threats,
  }
}

export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, "_") // Replace special chars
    .replace(/_{2,}/g, "_") // Replace multiple underscores
    .replace(/^[._-]+|[._-]+$/g, "") // Remove leading/trailing special chars
    .substring(0, 255) // Limit length
}

export function generateSecureFilename(originalName: string): string {
  const extension = path.extname(originalName)
  const timestamp = Date.now()
  const random = crypto.randomBytes(8).toString("hex")

  return `${timestamp}_${random}${extension}`
}
