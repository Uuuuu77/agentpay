import { generateText, generateCreativeContent } from "@/lib/ai-services"
import type { FileStorageService } from "./file-storage"
import type { Invoice } from "@/types"

interface EmailServiceRequest {
  invoice: Invoice
  description: string
  options: {
    emailCount?: number
    templates?: boolean
    automation?: string
    personalization?: boolean
  }
  buyerContact?: string
}

export class EmailService {
  constructor(private fileStorage: FileStorageService) {}

  async process(request: EmailServiceRequest): Promise<string> {
    const { description, options, invoice } = request
    const emailCount = options.emailCount || 5
    const campaignType = options.automation || "Welcome Series"
    const includeTemplates = options.templates !== false
    const personalization = options.personalization || false

    try {
      // Generate email campaign strategy
      const strategyPrompt = `Create an email marketing campaign strategy for: ${description}

Campaign Type: ${campaignType}
Number of Emails: ${emailCount}
Personalization: ${personalization}

Generate:
1. Campaign overview and objectives
2. Target audience analysis
3. Email sequence timeline
4. Key messaging for each email
5. Call-to-action strategy
6. Success metrics and KPIs`

      const strategy = await generateCreativeContent(strategyPrompt, "marketing")

      // Generate individual emails
      const emails = []
      for (let i = 1; i <= emailCount; i++) {
        const emailPrompt = `Create email ${i} of ${emailCount} for ${campaignType} campaign:

Business: ${description}
Email Position: ${i}/${emailCount}
Campaign Strategy: ${strategy}

Generate:
1. Compelling subject line (with 3 variations)
2. Email content (professional, engaging)
3. Clear call-to-action
4. Personalization tokens if enabled: ${personalization}

Make it conversion-focused and valuable to recipients.`

        const emailContent = await generateCreativeContent(emailPrompt, "email")
        emails.push({
          number: i,
          content: emailContent,
        })
      }

      // Generate HTML templates if requested
      const htmlTemplates = []
      if (includeTemplates) {
        for (let i = 0; i < emails.length; i++) {
          const templatePrompt = `Convert this email content into a professional HTML email template:

${emails[i].content}

Requirements:
- Responsive email design
- Compatible with major email clients
- Professional styling
- Clear CTA buttons
- Mobile-optimized
- Proper email HTML structure`

          const htmlTemplate = await generateText(templatePrompt, "groq", "mixtral-8x7b-32768")
          htmlTemplates.push({
            number: i + 1,
            html: htmlTemplate,
          })
        }
      }

      // Generate A/B testing recommendations
      const abTestPrompt = `Create A/B testing recommendations for this email campaign:

Campaign: ${description}
Type: ${campaignType}
Emails: ${emailCount}

Generate specific A/B test ideas for:
1. Subject lines
2. Email content
3. Call-to-action buttons
4. Send times
5. Personalization elements`

      const abTesting = await generateCreativeContent(abTestPrompt, "strategy")

      // Create deliverable files
      const files = [
        {
          name: "campaign-strategy.md",
          content: `# Email Marketing Campaign Strategy\n\n${strategy}`,
          type: "text/markdown",
        },
        {
          name: "email-sequence.md",
          content: `# Email Sequence - ${campaignType}\n\n${emails
            .map((email) => `## Email ${email.number}\n\n${email.content}\n\n---\n`)
            .join("")}`,
          type: "text/markdown",
        },
        {
          name: "ab-testing-guide.md",
          content: `# A/B Testing Recommendations\n\n${abTesting}`,
          type: "text/markdown",
        },
      ]

      // Add HTML templates if generated
      if (htmlTemplates.length > 0) {
        htmlTemplates.forEach((template) => {
          files.push({
            name: `email-${template.number}-template.html`,
            content: template.html,
            type: "text/html",
          })
        })
      }

      // Store files and create package
      const deliverableUrl = await this.fileStorage.storeServiceFiles(invoice.invoiceId, files, "email-campaign")

      return deliverableUrl
    } catch (error) {
      console.error("Email service generation failed:", error)
      throw new Error(`Failed to generate email campaign: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }
}
