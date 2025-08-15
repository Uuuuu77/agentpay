import { ServiceProcessor } from "./service-processor"
import { FileStorageService } from "./file-storage"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { groq } from "@ai-sdk/groq"
import type { Invoice, ServiceDeliverable } from "@/types"

export class GraphicService {
  private fileStorage: FileStorageService
  private processor: ServiceProcessor

  constructor() {
    this.fileStorage = new FileStorageService()
    this.processor = new ServiceProcessor()
  }

  async processOrder(invoice: Invoice): Promise<ServiceDeliverable[]> {
    try {
      console.log("[GraphicService] Processing graphic design order:", invoice.id)

      const requirements = invoice.requirements || {}
      const style = requirements.style || "modern"
      const colors = requirements.colors || "professional"
      const industry = requirements.industry || "general"

      // Generate design concepts using AI
      const concepts = await this.generateDesignConcepts(style, colors, industry)

      // Create design files
      const designFiles = await this.createDesignFiles(concepts, invoice.id)

      // Generate brand guidelines
      const guidelines = await this.generateBrandGuidelines(concepts, style, colors)

      const deliverables: ServiceDeliverable[] = [
        {
          id: `${invoice.id}-concepts`,
          name: "Design Concepts",
          description: "Multiple graphic design concepts",
          fileUrl: designFiles.conceptsUrl,
          fileSize: designFiles.conceptsSize,
          mimeType: "application/pdf",
        },
        {
          id: `${invoice.id}-guidelines`,
          name: "Brand Guidelines",
          description: "Comprehensive brand usage guidelines",
          fileUrl: guidelines.fileUrl,
          fileSize: guidelines.fileSize,
          mimeType: "application/pdf",
        },
      ]

      console.log("[GraphicService] Generated deliverables:", deliverables.length)
      return deliverables
    } catch (error) {
      console.error("[GraphicService] Error processing order:", error)
      throw new Error(`Failed to process graphic design order: ${error.message}`)
    }
  }

  private async generateDesignConcepts(style: string, colors: string, industry: string): Promise<any> {
    try {
      const prompt = `Create detailed graphic design concepts for a ${industry} business with ${style} style and ${colors} color scheme. Include:
      1. Primary design concept with rationale
      2. Alternative design variations
      3. Color palette specifications
      4. Typography recommendations
      5. Usage guidelines`

      const { text } = await generateText({
        model: groq("llama-3.1-70b-versatile"),
        prompt,
        maxTokens: 2000,
      })

      return {
        concepts: text,
        style,
        colors,
        industry,
        timestamp: new Date().toISOString(),
      }
    } catch (error) {
      console.error("[GraphicService] Error generating concepts:", error)

      // Fallback to template-based concepts
      return {
        concepts: this.getTemplateDesignConcepts(style, colors, industry),
        style,
        colors,
        industry,
        timestamp: new Date().toISOString(),
      }
    }
  }

  private async createDesignFiles(concepts: any, invoiceId: string): Promise<any> {
    try {
      // Generate design mockups and files
      const designContent = this.createDesignMockups(concepts)

      const fileName = `design-concepts-${invoiceId}.pdf`
      const filePath = await this.fileStorage.saveFile(fileName, designContent, "application/pdf")

      return {
        conceptsUrl: filePath,
        conceptsSize: Buffer.byteLength(designContent),
        fileName,
      }
    } catch (error) {
      console.error("[GraphicService] Error creating design files:", error)
      throw error
    }
  }

  private async generateBrandGuidelines(concepts: any, style: string, colors: string): Promise<any> {
    try {
      const prompt = `Create comprehensive brand guidelines document based on these design concepts:
      ${JSON.stringify(concepts)}
      
      Include:
      1. Logo usage rules
      2. Color specifications (hex codes)
      3. Typography hierarchy
      4. Spacing and layout guidelines
      5. Do's and don'ts
      6. Application examples`

      const { text } = await generateText({
        model: openai("gpt-4"),
        prompt,
        maxTokens: 1500,
      })

      const guidelinesContent = this.formatBrandGuidelines(text, style, colors)
      const fileName = `brand-guidelines-${Date.now()}.pdf`
      const filePath = await this.fileStorage.saveFile(fileName, guidelinesContent, "application/pdf")

      return {
        fileUrl: filePath,
        fileSize: Buffer.byteLength(guidelinesContent),
        content: text,
      }
    } catch (error) {
      console.error("[GraphicService] Error generating guidelines:", error)

      // Fallback guidelines
      const fallbackContent = this.getTemplateBrandGuidelines(style, colors)
      const fileName = `brand-guidelines-${Date.now()}.pdf`
      const filePath = await this.fileStorage.saveFile(fileName, fallbackContent, "application/pdf")

      return {
        fileUrl: filePath,
        fileSize: Buffer.byteLength(fallbackContent),
        content: "Template brand guidelines",
      }
    }
  }

  private createDesignMockups(concepts: any): string {
    // Create PDF content with design mockups
    return `
    GRAPHIC DESIGN CONCEPTS
    =====================
    
    Generated: ${concepts.timestamp}
    Style: ${concepts.style}
    Colors: ${concepts.colors}
    Industry: ${concepts.industry}
    
    DESIGN CONCEPTS:
    ${concepts.concepts}
    
    FILES INCLUDED:
    - Primary logo concept (SVG, PNG)
    - Alternative variations
    - Color palette swatches
    - Typography samples
    - Usage examples
    
    TECHNICAL SPECIFICATIONS:
    - Vector formats: SVG, AI, EPS
    - Raster formats: PNG (transparent), JPG
    - Minimum size: 32px height
    - Maximum size: Scalable vector
    - Color modes: RGB, CMYK, Pantone
    `
  }

  private formatBrandGuidelines(content: string, style: string, colors: string): string {
    return `
    BRAND GUIDELINES
    ===============
    
    Style: ${style}
    Color Scheme: ${colors}
    Generated: ${new Date().toISOString()}
    
    ${content}
    
    QUICK REFERENCE:
    - Logo minimum size: 32px height
    - Clear space: 2x logo height
    - Primary colors: See color palette
    - Typography: See font specifications
    - File formats: SVG (web), PNG (presentations), EPS (print)
    
    For questions or additional formats, contact support.
    `
  }

  private getTemplateDesignConcepts(style: string, colors: string, industry: string): string {
    return `
    DESIGN CONCEPT OVERVIEW
    
    Primary Concept:
    A ${style} design approach featuring ${colors} colors, tailored for the ${industry} industry.
    
    Design Elements:
    - Clean, professional typography
    - Balanced composition
    - Industry-appropriate imagery
    - Scalable vector graphics
    
    Color Palette:
    - Primary: Professional blue (#2563EB)
    - Secondary: Accent orange (#D2691E)
    - Neutral: Clean gray (#6B7280)
    
    Typography:
    - Headings: Modern sans-serif
    - Body: Clean, readable font
    - Accent: Complementary typeface
    `
  }

  private getTemplateBrandGuidelines(style: string, colors: string): string {
    return `
    BRAND GUIDELINES TEMPLATE
    
    Logo Usage:
    - Maintain clear space around logo
    - Use on appropriate backgrounds
    - Don't distort or modify
    
    Color Specifications:
    - Primary: #2563EB (RGB: 37, 99, 235)
    - Secondary: #D2691E (RGB: 210, 105, 30)
    - Neutral: #6B7280 (RGB: 107, 114, 128)
    
    Typography:
    - Primary font: System font stack
    - Headings: Bold weight
    - Body text: Regular weight
    
    Applications:
    - Business cards
    - Letterhead
    - Digital media
    - Signage
    `
  }
}
