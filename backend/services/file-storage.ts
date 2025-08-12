import { promises as fs } from "fs"
import path from "path"
import { v4 as uuidv4 } from "uuid"

export class FileStorageService {
  private storageDir: string

  constructor() {
    this.storageDir = process.env.STORAGE_DIR || "./storage/deliverables"
    this.ensureStorageDir()
  }

  private async ensureStorageDir(): Promise<void> {
    try {
      await fs.mkdir(this.storageDir, { recursive: true })
    } catch (error) {
      console.error("Failed to create storage directory:", error)
    }
  }

  async saveFile(content: Buffer | string, filename: string, mimeType?: string): Promise<string> {
    const fileId = uuidv4()
    const extension = path.extname(filename) || ".txt"
    const savedFilename = `${fileId}${extension}`
    const filePath = path.join(this.storageDir, savedFilename)

    await fs.writeFile(filePath, content)

    // Return public URL (in production, this would be a CDN URL)
    return `/api/files/${savedFilename}`
  }

  async saveMultipleFiles(files: { content: Buffer | string; filename: string }[]): Promise<string> {
    const zipId = uuidv4()
    const zipDir = path.join(this.storageDir, zipId)

    await fs.mkdir(zipDir, { recursive: true })

    for (const file of files) {
      const filePath = path.join(zipDir, file.filename)
      await fs.writeFile(filePath, file.content)
    }

    // In production, you'd create a ZIP file here
    // For now, return the directory URL
    return `/api/files/${zipId}`
  }

  async getFile(fileId: string): Promise<Buffer> {
    const filePath = path.join(this.storageDir, fileId)
    return await fs.readFile(filePath)
  }

  async deleteFile(fileId: string): Promise<void> {
    const filePath = path.join(this.storageDir, fileId)
    await fs.unlink(filePath)
  }
}
