import type { DatabaseManager } from "../database"
import type { WebhookManager } from "../webhook-manager"
import { LogoService } from "./logo-service"
import { GraphicService } from "./graphic-service"
import { ScriptService } from "./script-service"
import { PromptService } from "./prompt-service"
import { ResumeService } from "./resume-service"
import { ConsultService } from "./consult-service"
import { WebsiteService } from "./website-service"
import { EmailService } from "./email-service"
import { LinkedInService } from "./linkedin-service"
import { DataService } from "./data-service"
import { BugfixService } from "./bugfix-service"
import { SaasService } from "./saas-service"
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
    this.services = new Map()
    this.services.set(ServiceType.LOGO, new LogoService(this.fileStorage))
    this.services.set(ServiceType.GRAPHIC, new GraphicService())
    this.services.set(ServiceType.SCRIPT, new ScriptService(this.fileStorage))
    this.services.set(ServiceType.PROMPT, new PromptService(this.fileStorage))
    this.services.set(ServiceType.RESUME, new ResumeService(this.fileStorage))
    this.services.set(ServiceType.CONSULT, new ConsultService())
    this.services.set(ServiceType.WEBSITE, new WebsiteService(this.fileStorage))
    this.services.set(ServiceType.EMAIL, new EmailService(this.fileStorage))
    this.services.set(ServiceType.LINKEDIN, new LinkedInService(this.fileStorage))
    this.services.set(ServiceType.DATA, new DataService(this.fileStorage))
    this.services.set(ServiceType.BUGFIX, new BugfixService(this.fileStorage))
    this.services.set(ServiceType.SAAS, new SaasService(this.fileStorage))
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

      // Update status to indicate failure
      await this.db.updateInvoiceStatus(invoice.invoiceId, InvoiceStatus.CREATED)

      throw error
    }
  }

  async processAllPendingInvoices(): Promise<void> {
    try {
      const pendingInvoices = await this.db.getInvoicesByStatus(InvoiceStatus.PAID)

      console.log(`Processing ${pendingInvoices.length} pending invoices`)

      for (const invoice of pendingInvoices) {
        try {
          await this.processInvoice(invoice)
          
          // Add small delay between processing to avoid rate limits
          await new Promise(resolve => setTimeout(resolve, 1000))
        } catch (error) {
          console.error(`Failed to process invoice ${invoice.invoiceId}:`, error)
          // Continue processing other invoices
        }
      }

      console.log(`Finished processing pending invoices`)
    } catch (error) {
      console.error("Failed to process pending invoices:", error)
    }
  }

  async getProcessingStats(): Promise<{
    total: number
    inProgress: number
    delivered: number
    failed: number
  }> {
    try {
      const [paid, inProgress, delivered] = await Promise.all([
        this.db.getInvoicesByStatus(InvoiceStatus.PAID),
        this.db.getInvoicesByStatus(InvoiceStatus.IN_PROGRESS),
        this.db.getInvoicesByStatus(InvoiceStatus.DELIVERED),
      ])

      return {
        total: paid.length + inProgress.length + delivered.length,
        inProgress: inProgress.length,
        delivered: delivered.length,
        failed: 0
      }
    } catch (error) {
      console.error("Failed to get processing stats:", error)
      return { total: 0, inProgress: 0, delivered: 0, failed: 0 }
    }
  }
}
