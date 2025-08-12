import type { DatabaseManager } from "../database"
import type { WebhookManager } from "../webhook-manager"
import { LogoService } from "./logo-service"
import { GraphicService } from "./graphic-service"
import { ScriptService } from "./script-service"
import { PromptService } from "./prompt-service"
import { ResumeService } from "./resume-service"
import { ConsultService } from "./consult-service"
import { FileStorageService } from "./file-storage"
import { InvoiceStatus, ServiceType } from "../../types"
import type { Invoice } from "../../types"

export class ServiceProcessor {
  private db: DatabaseManager
  private webhookManager: WebhookManager
  private fileStorage: FileStorageService
  private services: Map<ServiceType, any>

  constructor(db: DatabaseManager, webhookManager: WebhookManager) {
    this.db = db
    this.webhookManager = webhookManager
    this.fileStorage = new FileStorageService()

    // Initialize service handlers
    this.services = new Map([
      [ServiceType.LOGO, new LogoService(this.fileStorage)],
      [ServiceType.GRAPHIC, new GraphicService(this.fileStorage)],
      [ServiceType.SCRIPT, new ScriptService(this.fileStorage)],
      [ServiceType.PROMPT, new PromptService(this.fileStorage)],
      [ServiceType.RESUME, new ResumeService(this.fileStorage)],
      [ServiceType.CONSULT, new ConsultService(this.fileStorage)],
    ])
  }

  async processInvoice(invoice: Invoice): Promise<void> {
    try {
      console.log(`Processing service for invoice ${invoice.invoiceId}`)

      // Update status to in progress
      await this.db.updateInvoiceStatus(invoice.invoiceId, InvoiceStatus.IN_PROGRESS)

      // Get service handler
      const serviceHandler = this.services.get(invoice.serviceType as ServiceType)
      if (!serviceHandler) {
        throw new Error(`No handler found for service type: ${invoice.serviceType}`)
      }

      // Process the service
      const deliverableUrl = await serviceHandler.process({
        invoice,
        description: invoice.description,
        options: invoice.options,
        buyerContact: invoice.buyerContact,
      })

      // Update invoice with deliverable
      await this.db.updateInvoiceStatus(invoice.invoiceId, InvoiceStatus.DELIVERED, {
        deliverableURL: deliverableUrl,
      })

      // Send delivery webhook
      await this.webhookManager.sendDeliveryWebhook(invoice.invoiceId, deliverableUrl)

      console.log(`Service delivered for invoice ${invoice.invoiceId}: ${deliverableUrl}`)
    } catch (error) {
      console.error(`Failed to process service for invoice ${invoice.invoiceId}:`, error)

      // Update status to indicate failure (you might want a FAILED status)
      await this.db.updateInvoiceStatus(invoice.invoiceId, InvoiceStatus.CREATED)

      throw error
    }
  }

  async processAllPendingInvoices(): Promise<void> {
    try {
      const pendingInvoices = await this.db.getInvoicesByStatus(InvoiceStatus.PAID)

      for (const invoice of pendingInvoices) {
        try {
          await this.processInvoice(invoice)
        } catch (error) {
          console.error(`Failed to process invoice ${invoice.invoiceId}:`, error)
          // Continue processing other invoices
        }
      }
    } catch (error) {
      console.error("Failed to process pending invoices:", error)
    }
  }
}
