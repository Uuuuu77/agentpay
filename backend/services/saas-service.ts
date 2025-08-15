import { generateText, generateCreativeContent } from "@/lib/ai-services"
import type { FileStorageService } from "./file-storage"
import type { Invoice } from "@/types"

interface SaasServiceRequest {
  invoice: Invoice
  description: string
  options: {
    pitchDeck?: boolean
    businessPlan?: boolean
    mvpSpecs?: boolean
    marketingStrategy?: boolean
    financialModel?: boolean
    industry?: string
  }
  buyerContact?: string
}

export class SaasService {
  constructor(private fileStorage: FileStorageService) {}

  async process(request: SaasServiceRequest): Promise<string> {
    const { description, options, invoice } = request
    const includePitchDeck = options.pitchDeck !== false
    const includeBusinessPlan = options.businessPlan !== false
    const includeMvpSpecs = options.mvpSpecs !== false
    const includeMarketing = options.marketingStrategy !== false
    const includeFinancials = options.financialModel || false
    const industry = options.industry || "B2B SaaS"

    try {
      // Generate executive summary
      const summaryPrompt = `Create an executive summary for this SaaS startup: ${description}

Industry: ${industry}
Business Concept: ${description}

Generate a compelling executive summary covering:
1. Problem statement and market opportunity
2. Solution overview and unique value proposition
3. Target market and customer segments
4. Business model and revenue streams
5. Competitive advantage
6. Team and execution capability
7. Financial projections summary
8. Funding requirements and use of funds`

      const executiveSummary = await generateCreativeContent(summaryPrompt, "business")

      // Generate pitch deck if requested
      let pitchDeck = ""
      if (includePitchDeck) {
        const pitchPrompt = `Create a comprehensive investor pitch deck for: ${description}

Industry: ${industry}
Target: Seed/Series A investors

Generate content for 15-20 slides:
1. Title slide with tagline
2. Problem statement
3. Solution overview
4. Market size and opportunity
5. Product demo/screenshots
6. Business model
7. Traction and metrics
8. Competition analysis
9. Marketing and sales strategy
10. Team introduction
11. Financial projections
12. Funding ask and use of funds
13. Roadmap and milestones
14. Risk analysis
15. Thank you and contact

Make it investor-ready and compelling.`

        pitchDeck = await generateCreativeContent(pitchPrompt, "presentation")
      }

      // Generate business plan if requested
      let businessPlan = ""
      if (includeBusinessPlan) {
        const businessPrompt = `Create a detailed business plan for: ${description}

Industry: ${industry}
Business Type: SaaS startup

Generate comprehensive sections:
1. Executive Summary
2. Company Description
3. Market Analysis
4. Organization & Management
5. Products & Services
6. Marketing & Sales Strategy
7. Funding Request
8. Financial Projections
9. Risk Analysis
10. Implementation Timeline

Make it professional and investor-grade.`

        businessPlan = await generateText(businessPrompt, "groq", "llama-3.1-70b-versatile")
      }

      // Generate MVP specifications if requested
      let mvpSpecs = ""
      if (includeMvpSpecs) {
        const mvpPrompt = `Create detailed MVP technical specifications for: ${description}

Industry: ${industry}
Product Type: SaaS application

Generate:
1. Core features and functionality
2. User stories and acceptance criteria
3. Technical architecture overview
4. Database schema design
5. API specifications
6. UI/UX wireframes description
7. Technology stack recommendations
8. Development timeline and milestones
9. Testing and QA requirements
10. Deployment and infrastructure needs

Make it development-ready.`

        mvpSpecs = await generateText(mvpPrompt, "groq", "mixtral-8x7b-32768")
      }

      // Generate marketing strategy if requested
      let marketingStrategy = ""
      if (includeMarketing) {
        const marketingPrompt = `Create a go-to-market strategy for: ${description}

Industry: ${industry}
Target: ${industry} customers

Generate:
1. Target customer personas
2. Value proposition and messaging
3. Marketing channels and tactics
4. Content marketing strategy
5. Sales funnel and conversion strategy
6. Pricing strategy
7. Launch plan and timeline
8. Customer acquisition cost analysis
9. Retention and growth strategies
10. Marketing budget allocation

Make it actionable and results-focused.`

        marketingStrategy = await generateCreativeContent(marketingPrompt, "marketing")
      }

      // Generate financial model if requested
      let financialModel = ""
      if (includeFinancials) {
        const financialPrompt = `Create financial projections and model for: ${description}

Industry: ${industry}
Business Model: SaaS

Generate:
1. Revenue model and assumptions
2. 5-year financial projections
3. Unit economics (CAC, LTV, churn)
4. Cash flow analysis
5. Break-even analysis
6. Funding requirements
7. Scenario planning (best/worst/realistic)
8. Key financial metrics and KPIs
9. Investment returns analysis
10. Financial risk assessment

Include specific numbers and formulas.`

        financialModel = await generateText(financialPrompt, "groq", "llama-3.1-70b-versatile")
      }

      // Generate market analysis and competitor research
      const marketPrompt = `Conduct market analysis and competitor research for: ${description}

Industry: ${industry}

Generate:
1. Market size and growth trends
2. Target market segmentation
3. Competitive landscape analysis
4. Key competitors and their positioning
5. Market gaps and opportunities
6. Industry trends and drivers
7. Regulatory considerations
8. Market entry barriers
9. Customer behavior insights
10. Market positioning recommendations`

      const marketAnalysis = await generateText(marketPrompt, "groq", "llama-3.1-70b-versatile")

      // Create deliverable files
      const files = [
        {
          name: "executive-summary.md",
          content: `# Executive Summary\n\n${executiveSummary}`,
          type: "text/markdown",
        },
        {
          name: "market-analysis.md",
          content: `# Market Analysis & Competitor Research\n\n${marketAnalysis}`,
          type: "text/markdown",
        },
      ]

      if (pitchDeck) {
        files.push({
          name: "investor-pitch-deck.md",
          content: `# Investor Pitch Deck\n\n${pitchDeck}`,
          type: "text/markdown",
        })
      }

      if (businessPlan) {
        files.push({
          name: "business-plan.md",
          content: `# Business Plan\n\n${businessPlan}`,
          type: "text/markdown",
        })
      }

      if (mvpSpecs) {
        files.push({
          name: "mvp-specifications.md",
          content: `# MVP Technical Specifications\n\n${mvpSpecs}`,
          type: "text/markdown",
        })
      }

      if (marketingStrategy) {
        files.push({
          name: "go-to-market-strategy.md",
          content: `# Go-to-Market Strategy\n\n${marketingStrategy}`,
          type: "text/markdown",
        })
      }

      if (financialModel) {
        files.push({
          name: "financial-projections.md",
          content: `# Financial Model & Projections\n\n${financialModel}`,
          type: "text/markdown",
        })
      }

      files.push({
        name: "README.md",
        content: `# SaaS Startup Launch Kit

## Business Overview
${description}

## Industry Focus
${industry}

## Package Contents
- executive-summary.md - Compelling business overview
- market-analysis.md - Market research and competitive analysis
${pitchDeck ? "- investor-pitch-deck.md - 15-20 slide investor presentation\n" : ""}${businessPlan ? "- business-plan.md - Comprehensive business plan\n" : ""}${mvpSpecs ? "- mvp-specifications.md - Technical MVP requirements\n" : ""}${marketingStrategy ? "- go-to-market-strategy.md - Marketing and sales strategy\n" : ""}${financialModel ? "- financial-projections.md - 5-year financial model\n" : ""}

## Next Steps
1. Review all documents thoroughly
2. Customize content for your specific situation
3. Validate assumptions with market research
4. Begin MVP development using technical specs
5. Start building your team and network
6. Prepare for investor meetings

## Usage Guidelines
- All content is professionally written and investor-ready
- Customize numbers and specifics to your actual business
- Use the pitch deck as a template for presentations
- Implement the go-to-market strategy systematically
- Track financial projections against actual performance

This package provides a comprehensive foundation for launching your SaaS startup successfully.`,
        type: "text/markdown",
      })

      // Store files and create package
      const deliverableUrl = await this.fileStorage.storeServiceFiles(invoice.invoiceId, files, "saas-startup-kit")

      return deliverableUrl
    } catch (error) {
      console.error("SaaS service generation failed:", error)
      throw new Error(
        `Failed to generate SaaS startup kit: ${error instanceof Error ? error.message : "Unknown error"}`,
      )
    }
  }
}
