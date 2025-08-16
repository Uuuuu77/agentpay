import OpenAI from "openai"
import { GoogleGenerativeAI } from "@google/generative-ai"

export interface ResearchRequest {
  researchTopic: string
  specificQuestions: string
  industry: string
  targetAudience: string
  researchDepth: 'overview' | 'intermediate' | 'detailed'
  preferredSources: string[]
  deliverableFormat: string
  context: string
}

export interface ResearchReport {
  topic: string
  summary: string
  keyFindings: string[]
  recommendations: string[]
  sources: any[]
  formattedContent: string
  deliveryFormat: string
  researchDepth: string
  generatedAt: string
}

export class ResearchEngine {
  private openai: OpenAI
  private google: GoogleGenerativeAI

  constructor() {
    this.openai = new OpenAI({ 
      apiKey: process.env.OPENAI_API_KEY!
    })
    this.google = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!)
  }

  async conductResearch(request: ResearchRequest): Promise<ResearchReport> {
    try {
      console.log(`Starting research for: ${request.researchTopic}`)
      
      // Step 1: Generate comprehensive research using AI
      const analysis = await this.generateResearchAnalysis(request)
      
      // Step 2: Format according to user preference
      const formattedReport = await this.formatReport(analysis, request.deliverableFormat)
      
      return {
        topic: request.researchTopic,
        summary: analysis.summary,
        keyFindings: analysis.keyFindings,
        recommendations: analysis.recommendations,
        sources: analysis.sources,
        formattedContent: formattedReport,
        deliveryFormat: request.deliverableFormat,
        researchDepth: request.researchDepth,
        generatedAt: new Date().toISOString()
      }
    } catch (error) {
      throw new Error(`Research generation failed: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  private async generateResearchAnalysis(request: ResearchRequest) {
    const researchPrompt = this.buildResearchPrompt(request)
    
    try {
      const response = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [{ role: "user", content: researchPrompt }],
        temperature: 0.7,
        max_tokens: 3000
      })

      const content = response.choices[0].message.content
      if (!content) {
        throw new Error("Empty response from AI")
      }

      return JSON.parse(content)
    } catch (parseError) {
      // Fallback to Google AI if OpenAI fails or returns invalid JSON
      console.warn("OpenAI failed, trying Google AI:", parseError)
      return await this.generateWithGoogle(request)
    }
  }

  private async generateWithGoogle(request: ResearchRequest) {
    const model = this.google.getGenerativeModel({ model: "gemini-pro" })
    const prompt = this.buildResearchPrompt(request)
    
    const response = await model.generateContent(prompt)
    const content = response.response.text()
    
    try {
      return JSON.parse(content)
    } catch (error) {
      // If JSON parsing fails, create structured response manually
      return this.createFallbackResponse(content, request)
    }
  }

  private buildResearchPrompt(request: ResearchRequest): string {
    return `
You are an expert research analyst. Conduct comprehensive research on the following topic and provide a detailed analysis.

RESEARCH TOPIC: ${request.researchTopic}
SPECIFIC QUESTIONS: ${request.specificQuestions || "General analysis"}
INDUSTRY: ${request.industry}
TARGET AUDIENCE: ${request.targetAudience}
RESEARCH DEPTH: ${request.researchDepth}
ADDITIONAL CONTEXT: ${request.context}

Please provide a comprehensive research analysis covering:

1. Current state of the topic/industry
2. Market trends and developments
3. Key players and competitors
4. Opportunities and challenges
5. Future outlook and predictions
6. Actionable insights and recommendations

Format your response as valid JSON with these exact fields:
{
  "summary": "2-3 paragraph executive summary",
  "keyFindings": [
    "Finding 1 - specific insight with data/context",
    "Finding 2 - another key insight",
    "Finding 3 - third important finding",
    "Finding 4 - fourth insight",
    "Finding 5 - fifth finding"
  ],
  "recommendations": [
    "Recommendation 1 - specific actionable advice",
    "Recommendation 2 - another recommendation", 
    "Recommendation 3 - third actionable item",
    "Recommendation 4 - fourth recommendation"
  ],
  "detailedAnalysis": "Comprehensive analysis covering all aspects in detail with specific examples, data points, and insights organized into clear sections",
  "sources": [
    {"type": "Industry Analysis", "description": "Current market research and trends"},
    {"type": "Competitive Intelligence", "description": "Analysis of key players and market dynamics"},
    {"type": "Technical Research", "description": "Technology and innovation insights"},
    {"type": "Market Data", "description": "Statistical analysis and projections"}
  ]
}

Ensure all insights are current, actionable, and relevant to ${request.targetAudience}. Include specific examples, metrics, and concrete recommendations where possible.
`
  }

  private createFallbackResponse(content: string, request: ResearchRequest) {
    // Extract key information from unstructured content
    const lines = content.split('\n').filter(line => line.trim())
    
    return {
      summary: lines.slice(0, 3).join(' '),
      keyFindings: [
        `Current market analysis for ${request.researchTopic}`,
        `Industry trends in ${request.industry}`,
        `Opportunities for ${request.targetAudience}`,
        `Technology and innovation insights`,
        `Strategic considerations and next steps`
      ],
      recommendations: [
        `Focus on emerging trends in ${request.researchTopic}`,
        `Leverage opportunities in ${request.industry}`,
        `Consider strategic partnerships and collaborations`,
        `Invest in technology and innovation capabilities`
      ],
      detailedAnalysis: content,
      sources: [
        {"type": "AI Analysis", "description": "Generated insights and analysis"},
        {"type": "Industry Knowledge", "description": "Current market understanding"},
        {"type": "Strategic Assessment", "description": "Business and competitive analysis"}
      ]
    }
  }

  private async formatReport(analysis: any, format: string): Promise<string> {
    const formatPrompts = {
      report: "Format as a comprehensive business report with clear sections, subsections, and professional structure",
      summary: "Create a concise executive summary focusing on the most critical insights and actionable items",
      bullets: "Present as organized bullet points with clear categories and specific actionable items",
      comparison: "Create comparison tables and analysis matrices where applicable, showing pros/cons and alternatives",
      roadmap: "Format as a strategic roadmap with timeline, milestones, and implementation steps"
    }

    const formatPrompt = `
Transform this research analysis into a ${format} format:

ANALYSIS DATA:
${JSON.stringify(analysis)}

FORMATTING REQUIREMENTS: ${formatPrompts[format as keyof typeof formatPrompts]}

Use professional business language, clear structure, and actionable insights.
Include relevant data points, examples, and specific recommendations.
Make it suitable for ${format} consumption with proper formatting and organization.

Return the formatted content as clean HTML that can be displayed in an email or document.
`

    try {
      const response = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [{ role: "user", content: formatPrompt }],
        temperature: 0.3,
        max_tokens: 2000
      })

      return response.choices[0].message.content || analysis.detailedAnalysis
    } catch (error) {
      console.warn("Format generation failed, using original analysis:", error)
      return analysis.detailedAnalysis
    }
  }
}