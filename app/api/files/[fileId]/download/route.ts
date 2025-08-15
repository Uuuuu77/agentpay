import { type NextRequest, NextResponse } from "next/server"
import { promises as fs } from "fs"
import path from "path"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/config"
import archiver from "archiver"

const STORAGE_DIR = process.env.STORAGE_DIR || "./storage/deliverables"

export async function GET(request: NextRequest, { params }: { params: { fileId: string } }) {
  try {
    const session = await getServerSession(authOptions)

    const { fileId } = params

    // Security: Prevent directory traversal
    if (fileId.includes("..") || fileId.includes("/") || fileId.includes("\\")) {
      return NextResponse.json({ error: "Invalid file ID" }, { status: 400 })
    }

    const dirPath = path.join(STORAGE_DIR, fileId)

    try {
      const stats = await fs.stat(dirPath)

      if (!stats.isDirectory()) {
        return NextResponse.json({ error: "Not a directory" }, { status: 400 })
      }

      // Create ZIP archive of directory contents
      const archive = archiver("zip", { zlib: { level: 9 } })

      // Set up response headers for ZIP download
      const headers = new Headers({
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${fileId}.zip"`,
      })

      // Create readable stream from archive
      const stream = new ReadableStream({
        start(controller) {
          archive.on("data", (chunk) => {
            controller.enqueue(new Uint8Array(chunk))
          })

          archive.on("end", () => {
            controller.close()
          })

          archive.on("error", (err) => {
            controller.error(err)
          })

          // Add directory contents to archive
          archive.directory(dirPath, false)
          archive.finalize()
        },
      })

      return new NextResponse(stream, { headers })
    } catch (fileError) {
      return NextResponse.json({ error: "Directory not found" }, { status: 404 })
    }
  } catch (error) {
    console.error("[v0] Directory download error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
