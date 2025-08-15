import { ServiceProcessor } from "./service-processor"
import { FileStorageService } from "./file-storage"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { groq } from "@ai-sdk/groq"
import type { Invoice, ServiceDeliverable } from "@/types"

export class ConsultService {
  private fileStorage: FileStorageService
  private processor: ServiceProcessor

  constructor() {
    this.fileStorage = new FileStorageService()
    this.processor = new ServiceProcessor()
  }

  async processOrder(invoice: Invoice): Promise<ServiceDeliverable[]> {
    try {
      console.log("[ConsultService] Processing consultation order:", invoice.id)

      const requirements = invoice.requirements || {}
      const topic = requirements.topic || "business strategy"
      const industry = requirements.industry || "general"
      const duration = requirements.duration || "60 minutes"

      // Generate consultation materials
      const consultation = await this.generateConsultationMaterials(topic, industry, duration)

      // Create consultation report
      const report = await this.createConsultationReport(consultation, invoice.id)

      // Generate action plan
      const actionPlan = await this.generateActionPlan(consultation, topic)

      const deliverables: ServiceDeliverable[] = [
        {
          id: `${invoice.id}-consultation`,
          name: "Consultation Report",
          description: "Comprehensive consultation analysis and recommendations",
          fileUrl: report.fileUrl,
          fileSize: report.fileSize,
          mimeType: "application/pdf",
        },
        {
          id: `${invoice.id}-action-plan`,
          name: "Action Plan",
          description: "Step-by-step implementation roadmap",
          fileUrl: actionPlan.fileUrl,
          fileSize: actionPlan.fileSize,
          mimeType: "application/pdf",
        },
      ]

      console.log("[ConsultService] Generated deliverables:", deliverables.length)
      return deliverables
    } catch (error) {
      console.error("[ConsultService] Error processing order:", error)
      throw new Error(`Failed to process consultation order: ${error.message}`)
    }
  }

  private async generateConsultationMaterials(topic: string, industry: string, duration: string): Promise<any> {
    try {
      const prompt = `Provide expert consultation on ${topic} for the ${industry} industry. This is a ${duration} consultation session. Include:
      
      1. Current industry analysis and trends
      2. Key challenges and opportunities
      3. Strategic recommendations
      4. Best practices and methodologies
      5. Risk assessment and mitigation
      6. Implementation timeline
      7. Success metrics and KPIs
      8. Resource requirements
      
      Provide actionable, specific advice that can be implemented immediately.`

      const { text } = await generateText({
        model: groq("llama-3.1-70b-versatile"),
        prompt,
        maxTokens: 3000,
      })

      return {
        content: text,
        topic,
        industry,
        duration,
        timestamp: new Date().toISOString(),
        sessionId: `consult-${Date.now()}`,
      }
    } catch (error) {
      console.error("[ConsultService] Error generating consultation:", error)

      // Fallback to template consultation
      return {
        content: this.getTemplateConsultation(topic, industry, duration),
        topic,
        industry,
        duration,
        timestamp: new Date().toISOString(),
        sessionId: `consult-${Date.now()}`,
      }
    }
  }

  private async createConsultationReport(consultation: any, invoiceId: string): Promise<any> {
    try {
      const reportContent = this.formatConsultationReport(consultation)

      const fileName = `consultation-report-${invoiceId}.pdf`
      const filePath = await this.fileStorage.saveFile(fileName, reportContent, "application/pdf")

      return {
        fileUrl: filePath,
        fileSize: Buffer.byteLength(reportContent),
        fileName,
      }
    } catch (error) {
      console.error("[ConsultService] Error creating report:", error)
      throw error
    }
  }

  private async generateActionPlan(consultation: any, topic: string): Promise<any> {
    try {
      const prompt = `Based on this consultation content, create a detailed action plan:
      ${consultation.content}
      
      Create a step-by-step implementation plan with:
      1. Immediate actions (Week 1-2)
      2. Short-term goals (Month 1-3)
      3. Medium-term objectives (Month 3-6)
      4. Long-term strategy (6+ months)
      5. Resource allocation
      6. Timeline and milestones
      7. Success metrics
      8. Risk mitigation steps`

      const { text } = await generateText({
        model: openai("gpt-4"),
        prompt,
        maxTokens: 2000,
      })

      const planContent = this.formatActionPlan(text, topic)
      const fileName = `action-plan-${Date.now()}.pdf`
      const filePath = await this.fileStorage.saveFile(fileName, planContent, "application/pdf")

      return {
        fileUrl: filePath,
        fileSize: Buffer.byteLength(planContent),
        content: text,
      }
    } catch (error) {
      console.error("[ConsultService] Error generating action plan:", error)

      // Fallback action plan
      const fallbackContent = this.getTemplateActionPlan(topic)
      const fileName = `action-plan-${Date.now()}.pdf`
      const filePath = await this.fileStorage.saveFile(fileName, fallbackContent, "application/pdf")

      return {
        fileUrl: filePath,
        fileSize: Buffer.byteLength(fallbackContent),
        content: "Template action plan",
      }
    }
  }

  private formatConsultationReport(consultation: any): string {
    return `
    CONSULTATION REPORT
    ==================
    
    Session Details:
    - Topic: ${consultation.topic}
    - Industry: ${consultation.industry}
    - Duration: ${consultation.duration}
    - Date: ${consultation.timestamp}
    - Session ID: ${consultation.sessionId}
    
    EXECUTIVE SUMMARY
    ================
    This consultation provides strategic guidance and actionable recommendations
    for ${consultation.topic} in the ${consultation.industry} industry.
    
    CONSULTATION CONTENT
    ===================
    ${consultation.content}
    
    NEXT STEPS
    ==========
    1. Review the provided recommendations
    2. Implement the action plan (see separate document)
    3. Monitor progress using suggested KPIs
    4. Schedule follow-up consultation if needed
    
    ADDITIONAL RESOURCES
    ===================
    - Industry reports and analysis
    - Best practice guidelines
    - Implementation templates
    - Success case studies
    
    For questions or clarifications, contact our consultation team.
    `
  }

  private formatActionPlan(content: string, topic: string): string {
    return `
    ACTION PLAN
    ===========
    
    Topic: ${topic}
    Generated: ${new Date().toISOString()}
    
    IMPLEMENTATION ROADMAP
    =====================
    ${content}
    
    TRACKING AND MONITORING
    ======================
    - Weekly progress reviews
    - Monthly milestone assessments
    - Quarterly strategy evaluations
    - Annual comprehensive review
    
    SUCCESS INDICATORS
    ==================
    - Key performance metrics
    - Milestone completion rates
    - ROI measurements
    - Stakeholder satisfaction
    
    SUPPORT RESOURCES
    =================
    - Implementation templates
    - Progress tracking tools
    - Best practice guides
    - Expert consultation access
    `
  }

  private getTemplateConsultation(topic: string, industry: string, duration: string): string {
    return `
    CONSULTATION OVERVIEW: ${topic.toUpperCase()}
    
    Industry Context: ${industry}
    Session Duration: ${duration}
    
    KEY RECOMMENDATIONS:
    
    1. STRATEGIC ANALYSIS
    - Current market position assessment
    - Competitive landscape evaluation
    - Growth opportunity identification
    - Risk factor analysis
    
    2. IMPLEMENTATION STRATEGY
    - Phased approach to execution
    - Resource allocation planning
    - Timeline development
    - Success metrics definition
    
    3. BEST PRACTICES
    - Industry-specific methodologies
    - Proven frameworks and tools
    - Quality assurance processes
    - Continuous improvement cycles
    
    4. RISK MITIGATION
    - Potential challenge identification
    - Contingency planning
    - Monitoring and early warning systems
    - Adaptive strategy development
    
    5. SUCCESS METRICS
    - Key performance indicators
    - Measurement frameworks
    - Reporting structures
    - Review and optimization cycles
    `
  }

  private getTemplateActionPlan(topic: string): string {
    return `
    ACTION PLAN TEMPLATE: ${topic.toUpperCase()}
    
    PHASE 1: IMMEDIATE ACTIONS (Week 1-2)
    - Initial assessment and baseline establishment
    - Team alignment and communication
    - Resource identification and allocation
    - Quick wins implementation
    
    PHASE 2: SHORT-TERM GOALS (Month 1-3)
    - Core strategy implementation
    - Process optimization
    - Performance monitoring setup
    - Stakeholder engagement
    
    PHASE 3: MEDIUM-TERM OBJECTIVES (Month 3-6)
    - Scaling successful initiatives
    - Advanced optimization
    - Expansion planning
    - Continuous improvement
    
    PHASE 4: LONG-TERM STRATEGY (6+ months)
    - Strategic evolution
    - Market expansion
    - Innovation integration
    - Sustainable growth
    
    MONITORING AND EVALUATION
    - Weekly progress reviews
    - Monthly performance assessments
    - Quarterly strategic evaluations
    - Annual comprehensive reviews
    `
  }
}
