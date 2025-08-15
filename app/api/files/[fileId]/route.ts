import { type NextRequest, NextResponse } from "next/server"
import { promises as fs } from "fs"
import path from "path"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/config"

const STORAGE_DIR = process.env.STORAGE_DIR || "./storage/deliverables"

export async function GET(request: NextRequest, { params }: { params: { fileId: string } }) {
  try {
    const session = await getServerSession(authOptions)

    // For now, allow access to files (in production, add proper access control)
    // TODO: Verify user has access to this file based on invoice ownership

    const { fileId } = params

    // Security: Prevent directory traversal
    if (fileId.includes("..") || fileId.includes("/") || fileId.includes("\\")) {
      return NextResponse.json({ error: "Invalid file ID" }, { status: 400 })
    }

    const filePath = path.join(STORAGE_DIR, fileId)

    try {
      const stats = await fs.stat(filePath)

      if (stats.isDirectory()) {
        // Return directory listing for multi-file deliverables
        const files = await fs.readdir(filePath)
        const fileList = await Promise.all(
          files.map(async (filename) => {
            const fileStats = await fs.stat(path.join(filePath, filename))
            return {
              name: filename,
              size: fileStats.size,
              modified: fileStats.mtime,
            }
          }),
        )

        return NextResponse.json({
          type: "directory",
          files: fileList,
          downloadUrl: `/api/files/${fileId}/download`,
        })
      } else {
        // Return single file
        const fileBuffer = await fs.readFile(filePath)
        const filename = path.basename(filePath)

        // Determine content type based on file extension
        const ext = path.extname(filename).toLowerCase()
        const contentType = getContentType(ext)

        return new NextResponse(fileBuffer, {
          headers: {
            "Content-Type": contentType,
            "Content-Disposition": `attachment; filename="${filename}"`,
            "Content-Length": fileBuffer.length.toString(),
          },
        })
      }
    } catch (fileError) {
      return NextResponse.json({ error: "File not found" }, { status: 404 })
    }
  } catch (error) {
    console.error("[v0] File serving error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

function getContentType(extension: string): string {
  const contentTypes: Record<string, string> = {
    ".pdf": "application/pdf",
    ".zip": "application/zip",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".gif": "image/gif",
    ".svg": "image/svg+xml",
    ".txt": "text/plain",
    ".md": "text/markdown",
    ".py": "text/x-python",
    ".js": "text/javascript",
    ".ts": "text/typescript",
    ".json": "application/json",
    ".html": "text/html",
    ".css": "text/css",
  }

  return contentTypes[extension] || "application/octet-stream"
}
