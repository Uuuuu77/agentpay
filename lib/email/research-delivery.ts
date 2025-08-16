import { getEmailService, EmailAttachment } from "@/lib/email/unified-email-service"
import { ResearchReport } from "@/lib/services/research-engine"

export class ResearchDeliveryService {
  private emailService = getEmailService()

  async deliverResearch(
    userEmail: string, 
    userName: string, 
    report: ResearchReport
  ): Promise<void> {
    try {
      const attachments: EmailAttachment[] = [
        {
          filename: `Research-Report-${this.sanitizeFilename(report.topic)}.html`,
          content: this.generateHTMLReport(report),
          contentType: 'text/html'
        }
      ]

      const emailContext = {
        userName,
        topic: report.topic,
        summary: report.summary,
        keyFindings: report.keyFindings,
        recommendations: report.recommendations,
        researchDepth: report.researchDepth.charAt(0).toUpperCase() + report.researchDepth.slice(1),
        attachments
      }

      const success = await this.emailService.sendEmail(
        'research_delivery',
        { to: userEmail },
        emailContext
      )

      if (!success) {
        throw new Error('Failed to send research email')
      }

      console.log(`Research delivered to ${userEmail}`)
    } catch (error) {
      console.error('Failed to deliver research:', error)
      throw new Error('Email delivery failed')
    }
  }

  async sendErrorNotification(
    email: string,
    name: string,
    topic: string,
    errorMessage: string
  ): Promise<void> {
    try {
      const emailContext = {
        customerName: name,
        serviceName: `Research on "${topic}"`,
        errorMessage,
        resolution: "We're working to complete your research and will try again shortly."
      }

      await this.emailService.sendEmail(
        'error_notification',
        { to: email },
        emailContext
      )

      console.log(`Error notification sent to ${email}`)
    } catch (error) {
      console.error('Failed to send error notification:', error)
    }
  }



  private generateHTMLReport(report: ResearchReport): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Research Report: ${report.topic}</title>
        <style>
          body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            line-height: 1.6; 
            margin: 40px; 
            color: #333; 
            background: white;
          }
          .header { 
            text-align: center; 
            margin-bottom: 40px; 
            padding-bottom: 20px; 
            border-bottom: 2px solid #ff6b35; 
          }
          .header h1 { 
            color: #ff6b35; 
            margin-bottom: 10px; 
            font-size: 32px;
          }
          .section { 
            margin-bottom: 30px; 
            page-break-inside: avoid;
          }
          .section h2 { 
            color: #ff6b35; 
            border-bottom: 1px solid #eee; 
            padding-bottom: 10px; 
            margin-top: 30px;
          }
          .findings-grid { 
            display: grid; 
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); 
            gap: 20px; 
            margin: 20px 0;
          }
          .finding-card { 
            background: #f8f9fa; 
            padding: 20px; 
            border-radius: 8px; 
            border-left: 4px solid #ff6b35; 
          }
          .finding-card h4 { 
            color: #ff6b35; 
            margin-top: 0; 
          }
          .sources { 
            background: #f0f8ff; 
            padding: 20px; 
            border-radius: 8px; 
            margin-top: 30px; 
          }
          .recommendations ol { 
            background: #fff3e0; 
            padding: 20px; 
            border-radius: 8px; 
          }
          .recommendations li { 
            margin-bottom: 15px; 
            padding: 10px; 
            background: white; 
            border-radius: 4px; 
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          }
          @media print { 
            body { margin: 20px; } 
            .section { page-break-inside: avoid; }
          }
          .formatted-content {
            background: #fafafa;
            padding: 25px;
            border-radius: 8px;
            border-left: 4px solid #ff6b35;
            margin: 20px 0;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${report.topic}</h1>
          <p><strong>AI Research Report</strong> | Generated: ${new Date(report.generatedAt).toLocaleDateString()}</p>
          <p>Research Depth: ${report.researchDepth} | Format: ${report.deliveryFormat}</p>
        </div>

        <div class="section">
          <h2>📊 Executive Summary</h2>
          <p>${report.summary}</p>
        </div>

        <div class="section">
          <h2>🔍 Key Findings</h2>
          <div class="findings-grid">
            ${report.keyFindings.map((finding, index) => `
              <div class="finding-card">
                <h4>Finding ${index + 1}</h4>
                <p>${finding}</p>
              </div>
            `).join('')}
          </div>
        </div>

        <div class="section">
          <h2>📋 Detailed Analysis</h2>
          <div class="formatted-content">
            ${report.formattedContent}
          </div>
        </div>

        <div class="section recommendations">
          <h2>💡 Recommendations</h2>
          <ol>
            ${report.recommendations.map(rec => `<li>${rec}</li>`).join('')}
          </ol>
        </div>

        <div class="sources">
          <h3>📚 Sources & Research Methods</h3>
          <ul>
            ${report.sources.map(source => `
              <li>
                <strong>${source.type || source.title}</strong>
                ${source.description ? ` - ${source.description}` : ''}
                ${source.url ? ` | <a href="${source.url}" target="_blank">${source.url}</a>` : ''}
              </li>
            `).join('')}
          </ul>
          <p style="font-size: 12px; color: #666; margin-top: 20px; padding-top: 15px; border-top: 1px solid #ddd;">
            <strong>Disclaimer:</strong> This research was generated using AI analysis and current knowledge. 
            Please verify critical information independently and consider this as a starting point for your research and decision-making process.
          </p>
        </div>

        <div style="text-align: center; margin-top: 50px; padding-top: 20px; border-top: 1px solid #ddd;">
          <p><strong>Generated by AgentPay Research Buddy</strong></p>
          <p>Visit <a href="https://agentpay.com">agentpay.com</a> for more AI-powered services</p>
        </div>
      </body>
      </html>
    `
  }

  private sanitizeFilename(filename: string): string {
    return filename.replace(/[^a-z0-9]/gi, '-').toLowerCase()
  }

  async testConnection(): Promise<boolean> {
    return await this.emailService.testConnection()
  }
}