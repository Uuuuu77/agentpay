import nodemailer from "nodemailer"
import { readFileSync } from "fs"
import path from "path"

export interface EmailTemplate {
  subject: string
  html: string
  text?: string
  attachments?: EmailAttachment[]
}

export interface EmailAttachment {
  filename: string
  content: string | Buffer
  contentType: string
  encoding?: string
}

export interface EmailConfig {
  to: string | string[]
  cc?: string | string[]
  bcc?: string | string[]
  replyTo?: string
  priority?: 'high' | 'normal' | 'low'
}

export interface EmailContext {
  [key: string]: any
}

export type EmailType = 
  | 'service_delivery'
  | 'research_delivery' 
  | 'invoice_notification'
  | 'payment_confirmation'
  | 'order_confirmation'
  | 'error_notification'
  | 'welcome'
  | 'newsletter'

export class UnifiedEmailService {
  private transporter: nodemailer.Transporter
  private templates: Map<EmailType, Function> = new Map()

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'localhost',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      pool: true, // Use connection pooling
      maxConnections: 5,
      maxMessages: 100,
    })

    // Initialize email templates
    this.initializeTemplates()
  }

  private initializeTemplates() {
    // Service Delivery Template
    this.templates.set('service_delivery', (context: EmailContext) => ({
      subject: `Your ${context.serviceName} Order is Complete! 🎉`,
      html: this.generateServiceDeliveryHTML(context),
      attachments: context.attachments || []
    }))

    // Research Delivery Template  
    this.templates.set('research_delivery', (context: EmailContext) => ({
      subject: `Your Research Report: ${context.topic} 🔍`,
      html: this.generateResearchDeliveryHTML(context),
      attachments: context.attachments || []
    }))

    // Invoice Notification Template
    this.templates.set('invoice_notification', (context: EmailContext) => ({
      subject: `Invoice ${context.invoiceId} - Payment Required`,
      html: this.generateInvoiceNotificationHTML(context)
    }))

    // Payment Confirmation Template
    this.templates.set('payment_confirmation', (context: EmailContext) => ({
      subject: `Payment Confirmed - Order ${context.orderId} ✅`,
      html: this.generatePaymentConfirmationHTML(context)
    }))

    // Order Confirmation Template
    this.templates.set('order_confirmation', (context: EmailContext) => ({
      subject: `Order Confirmation - ${context.serviceName}`,
      html: this.generateOrderConfirmationHTML(context)
    }))

    // Error Notification Template
    this.templates.set('error_notification', (context: EmailContext) => ({
      subject: `Update on your ${context.serviceName} order`,
      html: this.generateErrorNotificationHTML(context)
    }))
  }

  async sendEmail(
    type: EmailType,
    config: EmailConfig,
    context: EmailContext
  ): Promise<boolean> {
    try {
      const templateFunction = this.templates.get(type)
      if (!templateFunction) {
        throw new Error(`Email template not found for type: ${type}`)
      }

      const template = templateFunction(context)
      
      const mailOptions = {
        from: this.getFromAddress(type, context),
        to: Array.isArray(config.to) ? config.to.join(', ') : config.to,
        cc: config.cc ? (Array.isArray(config.cc) ? config.cc.join(', ') : config.cc) : undefined,
        bcc: config.bcc ? (Array.isArray(config.bcc) ? config.bcc.join(', ') : config.bcc) : undefined,
        replyTo: config.replyTo,
        subject: template.subject,
        html: template.html,
        text: template.text,
        attachments: template.attachments,
        priority: config.priority || 'normal',
      }

      const result = await this.transporter.sendMail(mailOptions)
      console.log(`Email sent successfully [${type}] to:`, config.to)
      return true

    } catch (error) {
      console.error(`Failed to send email [${type}]:`, error)
      return false
    }
  }

  private getFromAddress(type: EmailType, context: EmailContext): string {
    const defaultFrom = process.env.SMTP_FROM || 'AgentPay <noreply@agentpay.com>'
    
    const fromMap: Record<EmailType, string> = {
      'service_delivery': process.env.SMTP_FROM_DELIVERY || `AgentPay Delivery <delivery@agentpay.com>`,
      'research_delivery': process.env.SMTP_FROM_RESEARCH || `AgentPay Research Buddy <research@agentpay.com>`,
      'invoice_notification': process.env.SMTP_FROM_BILLING || `AgentPay Billing <billing@agentpay.com>`,
      'payment_confirmation': process.env.SMTP_FROM_BILLING || `AgentPay Billing <billing@agentpay.com>`,
      'order_confirmation': process.env.SMTP_FROM_ORDERS || `AgentPay Orders <orders@agentpay.com>`,
      'error_notification': process.env.SMTP_FROM_SUPPORT || `AgentPay Support <support@agentpay.com>`,
      'welcome': process.env.SMTP_FROM_WELCOME || `AgentPay <welcome@agentpay.com>`,
      'newsletter': process.env.SMTP_FROM_NEWSLETTER || `AgentPay Newsletter <newsletter@agentpay.com>`,
    }

    return fromMap[type] || defaultFrom
  }

  // Base email template with consistent branding
  private getBaseEmailTemplate(content: string, title?: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            margin: 0; 
            padding: 0; 
            background-color: #f8f9fa;
          }
          .container { 
            max-width: 600px; 
            margin: 0 auto; 
            background: white;
            border-radius: 10px;
            box-shadow: 0 4px 14px rgba(255, 107, 53, 0.15);
            overflow: hidden;
          }
          .header { 
            background: linear-gradient(135deg, #ff6b35, #f7931e); 
            color: white; 
            padding: 30px 20px; 
            text-align: center; 
          }
          .header h1 { margin: 0 0 10px 0; font-size: 28px; }
          .header p { margin: 0; opacity: 0.9; }
          .content { 
            padding: 30px 20px; 
          }
          .footer { 
            background: #f8f9fa; 
            padding: 20px; 
            text-align: center; 
            border-top: 1px solid #eee;
            font-size: 14px;
            color: #666;
          }
          .highlight { 
            background: #fff3e0; 
            padding: 20px; 
            border-left: 4px solid #ff6b35; 
            margin: 20px 0; 
            border-radius: 0 8px 8px 0;
          }
          .btn { 
            display: inline-block; 
            background: #ff6b35; 
            color: white !important; 
            padding: 12px 24px; 
            text-decoration: none; 
            border-radius: 6px; 
            font-weight: bold; 
            margin: 10px 0;
          }
          .meta-info {
            background: #e3f2fd;
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
          }
          .meta-info strong { color: #1976d2; }
          @media only screen and (max-width: 600px) {
            .container { margin: 10px; }
            .content { padding: 20px 15px; }
            .header { padding: 20px 15px; }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${title || '🚀 AgentPay'}</h1>
            <p>Autonomous Freelancer Agent Platform</p>
          </div>
          
          <div class="content">
            ${content}
          </div>
          
          <div class="footer">
            <p><strong>AgentPay</strong> - AI-powered freelance services</p>
            <p>Questions? Reply to this email or visit <a href="https://agentpay.com/about">agentpay.com</a></p>
            <p style="font-size: 12px; color: #999; margin-top: 10px;">
              This email was sent from an automated system. Please do not reply to this email directly.
            </p>
          </div>
        </div>
      </body>
      </html>
    `
  }

  private generateServiceDeliveryHTML(context: EmailContext): string {
    const content = `
      <h2>Hello ${context.customerName}! 👋</h2>
      
      <p>Great news! Your <strong>${context.serviceName}</strong> order has been completed and is ready for download.</p>
      
      <div class="highlight">
        <h3>📦 Order Summary</h3>
        <p><strong>Service:</strong> ${context.serviceName}</p>
        <p><strong>Order ID:</strong> ${context.orderId}</p>
        <p><strong>Completed:</strong> ${new Date().toLocaleDateString()}</p>
        ${context.deliveryTime ? `<p><strong>Delivery Time:</strong> ${context.deliveryTime}</p>` : ''}
      </div>
      
      ${context.summary ? `
        <div class="meta-info">
          <h3>📋 Delivery Summary</h3>
          <p>${context.summary}</p>
        </div>
      ` : ''}
      
      ${context.downloadUrl ? `
        <div style="text-align: center; margin: 30px 0;">
          <a href="${context.downloadUrl}" class="btn">Download Your Files</a>
        </div>
      ` : ''}
      
      ${context.deliverables && context.deliverables.length > 0 ? `
        <div class="highlight">
          <h3>📄 Deliverables Included</h3>
          <ul>
            ${context.deliverables.map((item: string) => `<li>${item}</li>`).join('')}
          </ul>
        </div>
      ` : ''}
      
      <p>If you have any questions or need support, please don't hesitate to reach out!</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="https://agentpay.com/services" class="btn">Order More Services</a>
      </div>
    `
    
    return this.getBaseEmailTemplate(content, `✅ Your ${context.serviceName} is Ready!`)
  }

  private generateResearchDeliveryHTML(context: EmailContext): string {
    const content = `
      <h2>Hello ${context.userName}! 👋</h2>
      
      <p>Your research on <strong>"${context.topic}"</strong> has been completed! Our AI research buddy has analyzed current data, trends, and insights to provide you with comprehensive information.</p>
      
      <div class="highlight">
        <h3>📊 Executive Summary</h3>
        <p>${context.summary}</p>
      </div>
      
      ${context.keyFindings && context.keyFindings.length > 0 ? `
        <div class="meta-info">
          <h3>🔍 Key Findings</h3>
          <ul>
            ${context.keyFindings.slice(0, 3).map((finding: string) => `<li>${finding}</li>`).join('')}
          </ul>
        </div>
      ` : ''}
      
      ${context.recommendations && context.recommendations.length > 0 ? `
        <div class="highlight">
          <h3>💡 Top Recommendations</h3>
          <ul>
            ${context.recommendations.slice(0, 3).map((rec: string) => `<li>${rec}</li>`).join('')}
          </ul>
        </div>
      ` : ''}
      
      <div class="meta-info">
        <p><strong>📎 Complete Report:</strong> The full detailed research report is attached as an HTML file for easy viewing and sharing.</p>
        <p><strong>📈 Research Depth:</strong> ${context.researchDepth}</p>
        <p><strong>🕒 Generated:</strong> ${new Date().toLocaleDateString()}</p>
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="https://agentpay.com/services" class="btn">Need More Research? Visit AgentPay</a>
      </div>
    `
    
    return this.getBaseEmailTemplate(content, `🤖 Your Research is Ready!`)
  }

  private generateInvoiceNotificationHTML(context: EmailContext): string {
    const content = `
      <h2>Invoice Ready for Payment</h2>
      
      <p>Hello! Your invoice for <strong>${context.serviceName}</strong> is ready for payment.</p>
      
      <div class="highlight">
        <h3>💰 Invoice Details</h3>
        <p><strong>Invoice ID:</strong> ${context.invoiceId}</p>
        <p><strong>Service:</strong> ${context.serviceName}</p>
        <p><strong>Amount:</strong> ${context.amount} ${context.token}</p>
        <p><strong>Due Date:</strong> ${context.dueDate}</p>
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${context.paymentUrl}" class="btn">Pay Invoice</a>
      </div>
      
      <p>Please complete payment to begin work on your order. Payment can be made using cryptocurrency on multiple networks.</p>
    `
    
    return this.getBaseEmailTemplate(content, `💳 Invoice ${context.invoiceId}`)
  }

  private generatePaymentConfirmationHTML(context: EmailContext): string {
    const content = `
      <h2>Payment Confirmed! 🎉</h2>
      
      <p>Thank you! Your payment has been confirmed and work will begin on your order immediately.</p>
      
      <div class="highlight">
        <h3>✅ Payment Details</h3>
        <p><strong>Transaction:</strong> ${context.txHash}</p>
        <p><strong>Amount:</strong> ${context.amount} ${context.token}</p>
        <p><strong>Service:</strong> ${context.serviceName}</p>
        <p><strong>Expected Delivery:</strong> ${context.deliveryTime}</p>
      </div>
      
      <div class="meta-info">
        <p><strong>What's Next?</strong></p>
        <p>Your order is now in progress. You'll receive another email when your ${context.serviceName} is completed and ready for download.</p>
      </div>
    `
    
    return this.getBaseEmailTemplate(content, `✅ Payment Confirmed`)
  }

  private generateOrderConfirmationHTML(context: EmailContext): string {
    const content = `
      <h2>Order Confirmed! 📋</h2>
      
      <p>Your order for <strong>${context.serviceName}</strong> has been confirmed and added to our queue.</p>
      
      <div class="highlight">
        <h3>📦 Order Details</h3>
        <p><strong>Order ID:</strong> ${context.orderId}</p>
        <p><strong>Service:</strong> ${context.serviceName}</p>
        <p><strong>Expected Delivery:</strong> ${context.deliveryTime}</p>
        ${context.requirements ? `<p><strong>Requirements:</strong> ${context.requirements}</p>` : ''}
      </div>
      
      <div class="meta-info">
        <p><strong>Next Steps:</strong></p>
        <p>Please complete payment to begin work on your order. You'll receive a payment link shortly.</p>
      </div>
    `
    
    return this.getBaseEmailTemplate(content, `📋 Order Confirmation`)
  }

  private generateErrorNotificationHTML(context: EmailContext): string {
    const content = `
      <h2>Order Update</h2>
      
      <p>Hello ${context.customerName},</p>
      
      <p>We encountered an issue while processing your order for <strong>${context.serviceName}</strong>.</p>
      
      <div class="highlight">
        <h3>ℹ️ What Happened</h3>
        <p>${context.errorMessage || 'We experienced a technical issue while processing your order.'}</p>
      </div>
      
      <div class="meta-info">
        <p><strong>What We're Doing:</strong></p>
        <p>Our team has been notified and is working to resolve this issue. ${context.resolution || 'We will contact you shortly with an update.'}</p>
      </div>
      
      <p>We apologize for any inconvenience and appreciate your patience.</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="mailto:support@agentpay.com" class="btn">Contact Support</a>
      </div>
    `
    
    return this.getBaseEmailTemplate(content, `🔄 Order Update`)
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.transporter.verify()
      console.log('Email service connection verified successfully')
      return true
    } catch (error) {
      console.error('Email service connection test failed:', error)
      return false
    }
  }

  async close(): Promise<void> {
    this.transporter.close()
  }
}

// Singleton instance
let emailService: UnifiedEmailService | null = null

export function getEmailService(): UnifiedEmailService {
  if (!emailService) {
    emailService = new UnifiedEmailService()
  }
  return emailService
}