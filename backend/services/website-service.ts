import { generateText, generateCode } from "@/lib/ai-services"
import type { FileStorageService } from "./file-storage"
import type { Invoice } from "@/types"

interface WebsiteServiceRequest {
  invoice: Invoice
  description: string
  options: {
    sections?: number
    animations?: boolean
    mobileOptimization?: boolean
    industry?: string
  }
  buyerContact?: string
}

export class WebsiteService {
  constructor(private fileStorage: FileStorageService) {}

  async process(request: WebsiteServiceRequest): Promise<string> {
    const { description, options, invoice } = request
    const sections = options.sections || 5
    const industry = options.industry || "Tech"
    const animations = options.animations || true
    const mobileOptimized = options.mobileOptimization !== false

    try {
      // Generate website structure and content
      const websitePrompt = `Create a professional landing page for: ${description}

Industry: ${industry}
Sections: ${sections}
Include animations: ${animations}
Mobile optimized: ${mobileOptimized}

Generate a complete, modern landing page with:
1. Hero section with compelling headline
2. Features/benefits section
3. About/company section
4. Testimonials/social proof
5. Contact/CTA section
${sections > 5 ? `6. Additional sections as needed (${sections - 5} more)` : ""}

Requirements:
- Modern, professional design
- Responsive layout
- SEO-optimized structure
- Fast loading performance
- Conversion-focused copy`

      const websiteContent = await generateText(websitePrompt, "groq", "llama-3.1-70b-versatile")

      // Generate HTML structure
      const htmlPrompt = `Convert this website content into a complete HTML page with modern CSS:

${websiteContent}

Requirements:
- Complete HTML5 structure
- Embedded CSS with modern styling
- Responsive design (mobile-first)
- Professional color scheme
- Smooth animations if requested: ${animations}
- SEO meta tags
- Performance optimized
- Cross-browser compatible

Generate clean, production-ready code.`

      const htmlCode = await generateCode(htmlPrompt, "html")

      // Generate additional CSS file
      const cssPrompt = `Create additional CSS styles for the landing page:

Content: ${websiteContent}

Generate:
- Advanced animations and transitions
- Responsive breakpoints
- Modern CSS Grid/Flexbox layouts
- Professional typography
- Color variables and themes
- Hover effects and interactions`

      const cssCode = await generateCode(cssPrompt, "css")

      // Generate JavaScript for interactions
      const jsPrompt = `Create JavaScript for landing page interactions:

Features needed:
- Smooth scrolling navigation
- Form validation
- Mobile menu toggle
- Scroll animations
- Contact form handling
- Performance optimizations

Generate clean, vanilla JavaScript code.`

      const jsCode = await generateCode(jsPrompt, "javascript")

      // Create file package
      const files = [
        {
          name: "index.html",
          content: htmlCode,
          type: "text/html",
        },
        {
          name: "styles.css",
          content: cssCode,
          type: "text/css",
        },
        {
          name: "script.js",
          content: jsCode,
          type: "text/javascript",
        },
        {
          name: "README.md",
          content: `# Landing Page - ${description}

## Features
- Responsive design
- Modern CSS styling
- Interactive JavaScript
- SEO optimized
- ${sections} sections
- ${industry} industry focus

## Setup
1. Upload files to your web server
2. Open index.html in browser
3. Customize content as needed

## Files Included
- index.html - Main page structure
- styles.css - Styling and layout
- script.js - Interactive features
- README.md - Setup instructions`,
          type: "text/markdown",
        },
      ]

      // Store files and create ZIP
      const deliverableUrl = await this.fileStorage.storeServiceFiles(invoice.invoiceId, files, "website-package")

      return deliverableUrl
    } catch (error) {
      console.error("Website service generation failed:", error)
      throw new Error(`Failed to generate website: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }
}
