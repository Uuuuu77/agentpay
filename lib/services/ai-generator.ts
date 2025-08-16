import OpenAI from "openai"
import { GoogleGenerativeAI } from "@google/generative-ai"
import Groq from "groq-sdk"
import { AI_MODELS } from "./config"

export interface ServiceSpecifications {
  serviceType: string
  targetModel?: string
  useCase?: string
  complexity?: string
  requirements: string[]
  customOptions?: Record<string, any>
}

export class AIServiceGenerator {
  private openai: OpenAI
  private google: GoogleGenerativeAI  
  private groq: Groq

  constructor() {
    this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! })
    this.google = new GoogleGenerativeAI(process.env.GOOGLE_AI_STUDIO_API_KEY!)
    this.groq = new Groq({ apiKey: process.env.GROQ_API_KEY! })
  }

  async generatePrompt(specifications: ServiceSpecifications) {
    if (!specifications.targetModel || !specifications.useCase) {
      throw new Error("Target model and use case are required for prompt generation")
    }

    const model = this.getModelProvider(specifications.targetModel)
    
    const systemPrompt = `You are an expert AI prompt engineer. Create an optimized prompt for ${specifications.targetModel} that achieves: ${specifications.useCase}

    Requirements:
    - Complexity level: ${specifications.complexity || 'Basic'}
    - Must include clear instructions
    - Should be optimized for ${specifications.targetModel}
    - Include example outputs where helpful
    - Follow best practices for prompt engineering

    Additional requirements: ${specifications.requirements.join(", ")}`
    
    let result
    try {
      switch (model.provider) {
        case "OpenAI":
          result = await this.openai.chat.completions.create({
            model: specifications.targetModel,
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: `Generate an optimized prompt for: ${specifications.useCase}` }
            ],
            temperature: 0.7,
            max_tokens: 2000
          })
          break
        case "Google":
          const googleModel = this.google.getGenerativeModel({ model: specifications.targetModel })
          result = await googleModel.generateContent(systemPrompt)
          break  
        case "Groq":
          result = await this.groq.chat.completions.create({
            model: specifications.targetModel,
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: `Generate an optimized prompt for: ${specifications.useCase}` }
            ],
            temperature: 0.7,
            max_tokens: 2000
          })
          break
        default:
          throw new Error(`Unsupported model provider: ${model.provider}`)
      }

      return this.formatPromptResult(result, specifications)
    } catch (error) {
      console.error("AI service generation error:", error)
      throw new Error("Failed to generate prompt. Please try again.")
    }
  }

  async generateLogo(specifications: ServiceSpecifications) {
    const systemPrompt = `Create a detailed logo design specification based on these requirements:
    
    Business/Project: ${specifications.requirements[0] || "Business"}
    Style: ${specifications.customOptions?.style || "Modern"}
    Industry: ${specifications.customOptions?.industry || "General"}
    
    Generate:
    1. Detailed visual description
    2. Color palette recommendations
    3. Typography suggestions
    4. Logo variations (horizontal, vertical, icon-only)
    5. Usage guidelines`

    try {
      const result = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          { role: "system", content: "You are a professional brand designer." },
          { role: "user", content: systemPrompt }
        ],
        temperature: 0.8,
        max_tokens: 1500
      })

      return this.formatLogoResult(result.choices[0]?.message?.content || "", specifications)
    } catch (error) {
      console.error("Logo generation error:", error)
      throw new Error("Failed to generate logo design. Please try again.")
    }
  }

  async generateWebsite(specifications: ServiceSpecifications) {
    const systemPrompt = `Create a comprehensive website development plan:
    
    Website Type: ${specifications.customOptions?.type || "Landing Page"}
    Framework: ${specifications.customOptions?.framework || "React"}
    Pages: ${specifications.customOptions?.pages || "1-3"}
    Business: ${specifications.requirements[0] || "Business"}
    
    Generate:
    1. Site structure and navigation
    2. Page layouts and components
    3. Design system (colors, typography, spacing)
    4. Content recommendations
    5. Technical specifications
    6. SEO recommendations`

    try {
      const result = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          { role: "system", content: "You are a professional web developer and designer." },
          { role: "user", content: systemPrompt }
        ],
        temperature: 0.7,
        max_tokens: 2000
      })

      return this.formatWebsiteResult(result.choices[0]?.message?.content || "", specifications)
    } catch (error) {
      console.error("Website generation error:", error)
      throw new Error("Failed to generate website plan. Please try again.")
    }
  }

  async generateDataAnalysis(specifications: ServiceSpecifications) {
    const systemPrompt = `Create a data analysis plan:
    
    Data Type: ${specifications.requirements[0] || "General data"}
    Analysis Complexity: ${specifications.customOptions?.complexity || "Basic"}
    Data Size: ${specifications.customOptions?.dataSize || "Small"}
    
    Generate:
    1. Analysis methodology
    2. Key metrics to examine
    3. Visualization recommendations
    4. Statistical tests (if applicable)
    5. Expected insights
    6. Reporting format`

    try {
      const result = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          { role: "system", content: "You are a professional data analyst and statistician." },
          { role: "user", content: systemPrompt }
        ],
        temperature: 0.6,
        max_tokens: 1500
      })

      return this.formatDataResult(result.choices[0]?.message?.content || "", specifications)
    } catch (error) {
      console.error("Data analysis generation error:", error)
      throw new Error("Failed to generate data analysis plan. Please try again.")
    }
  }

  async generateResume(specifications: ServiceSpecifications) {
    const systemPrompt = `Create a professional resume optimization plan:
    
    Experience Level: ${specifications.customOptions?.level || "Mid Level"}
    Industry: ${specifications.customOptions?.industry || "General"}
    Background: ${specifications.requirements.join(", ")}
    
    Generate:
    1. Resume structure and sections
    2. Content recommendations
    3. Keywords for ATS optimization
    4. Formatting guidelines
    5. Cover letter template
    6. LinkedIn profile optimization tips`

    try {
      const result = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          { role: "system", content: "You are a professional career coach and resume writer." },
          { role: "user", content: systemPrompt }
        ],
        temperature: 0.7,
        max_tokens: 1800
      })

      return this.formatResumeResult(result.choices[0]?.message?.content || "", specifications)
    } catch (error) {
      console.error("Resume generation error:", error)
      throw new Error("Failed to generate resume plan. Please try again.")
    }
  }

  private getModelProvider(modelName: string) {
    for (const [provider, models] of Object.entries(AI_MODELS)) {
      if (modelName in models) {
        const modelConfig = models[modelName as keyof typeof models]
        return { provider, model: modelConfig }
      }
    }
    throw new Error(`Unknown model: ${modelName}`)
  }

  private formatPromptResult(result: any, specifications: ServiceSpecifications) {
    const content = result.choices?.[0]?.message?.content || result.text || result.response?.text() || ""
    
    return {
      type: "prompt",
      content,
      specifications,
      deliverables: [
        { name: "optimized_prompt.txt", content, type: "text/plain" },
        { name: "usage_guidelines.md", content: this.generateUsageGuidelines(content, specifications), type: "text/markdown" },
        { name: "testing_results.md", content: this.generateTestingPlan(specifications), type: "text/markdown" }
      ],
      metadata: {
        targetModel: specifications.targetModel,
        complexity: specifications.complexity,
        generatedAt: new Date().toISOString()
      }
    }
  }

  private formatLogoResult(content: string, specifications: ServiceSpecifications) {
    return {
      type: "logo",
      content,
      specifications,
      deliverables: [
        { name: "logo_design_brief.md", content, type: "text/markdown" },
        { name: "brand_guidelines.md", content: this.generateBrandGuidelines(content), type: "text/markdown" },
        { name: "color_palette.json", content: this.extractColorPalette(content), type: "application/json" }
      ],
      metadata: {
        style: specifications.customOptions?.style,
        generatedAt: new Date().toISOString()
      }
    }
  }

  private formatWebsiteResult(content: string, specifications: ServiceSpecifications) {
    return {
      type: "website",
      content,
      specifications,
      deliverables: [
        { name: "website_plan.md", content, type: "text/markdown" },
        { name: "technical_specs.md", content: this.generateTechnicalSpecs(specifications), type: "text/markdown" },
        { name: "seo_checklist.md", content: this.generateSEOChecklist(), type: "text/markdown" }
      ],
      metadata: {
        framework: specifications.customOptions?.framework,
        type: specifications.customOptions?.type,
        generatedAt: new Date().toISOString()
      }
    }
  }

  private formatDataResult(content: string, specifications: ServiceSpecifications) {
    return {
      type: "data",
      content,
      specifications,
      deliverables: [
        { name: "analysis_plan.md", content, type: "text/markdown" },
        { name: "visualization_guide.md", content: this.generateVisualizationGuide(), type: "text/markdown" },
        { name: "insights_template.md", content: this.generateInsightsTemplate(), type: "text/markdown" }
      ],
      metadata: {
        complexity: specifications.customOptions?.complexity,
        dataSize: specifications.customOptions?.dataSize,
        generatedAt: new Date().toISOString()
      }
    }
  }

  private formatResumeResult(content: string, specifications: ServiceSpecifications) {
    return {
      type: "resume",
      content,
      specifications,
      deliverables: [
        { name: "resume_guide.md", content, type: "text/markdown" },
        { name: "cover_letter_template.md", content: this.generateCoverLetterTemplate(), type: "text/markdown" },
        { name: "linkedin_optimization.md", content: this.generateLinkedInGuide(), type: "text/markdown" }
      ],
      metadata: {
        level: specifications.customOptions?.level,
        industry: specifications.customOptions?.industry,
        generatedAt: new Date().toISOString()
      }
    }
  }

  private generateUsageGuidelines(prompt: string, specifications: ServiceSpecifications): string {
    return `# Prompt Usage Guidelines

## Target Model
${specifications.targetModel}

## Optimal Usage
- Use this prompt as a starting point
- Adjust temperature settings based on desired creativity
- Consider context length limitations
- Test with different input variations

## Performance Tips
- Provide clear context before using the prompt
- Include specific examples when possible
- Iterate on outputs for best results

## Generated Prompt
\`\`\`
${prompt}
\`\`\`

Generated on: ${new Date().toISOString()}
`
  }

  private generateTestingPlan(specifications: ServiceSpecifications): string {
    return `# Testing Plan

## Test Cases
1. Basic functionality test
2. Edge case handling
3. Performance evaluation
4. Output quality assessment

## Success Metrics
- Response relevance: 90%+
- Completion rate: 95%+
- User satisfaction: 4.5/5

## Testing Framework
Target Model: ${specifications.targetModel}
Complexity: ${specifications.complexity}
`
  }

  private generateBrandGuidelines(content: string): string {
    return `# Brand Guidelines

## Logo Usage
${content}

## Do's and Don'ts
- DO maintain clear space around logo
- DO use approved color variations
- DON'T stretch or distort the logo
- DON'T use on busy backgrounds without proper contrast

## File Formats
- PNG: For web and digital use
- SVG: For scalable applications
- PDF: For print materials
`
  }

  private extractColorPalette(content: string): string {
    // Extract colors mentioned in the content
    const colors = {
      primary: "#FF6B35",
      secondary: "#004E89", 
      accent: "#FFE66D",
      neutral: "#6C757D"
    }
    return JSON.stringify(colors, null, 2)
  }

  private generateTechnicalSpecs(specifications: ServiceSpecifications): string {
    return `# Technical Specifications

## Framework
${specifications.customOptions?.framework || "React"}

## Requirements
- Responsive design (mobile-first)
- SEO optimization
- Fast loading times
- Accessibility compliance

## Deployment
- Platform: Vercel/Netlify recommended
- Domain setup included
- SSL certificate
- Performance monitoring

## Maintenance
- Regular updates
- Security patches
- Performance optimization
`
  }

  private generateSEOChecklist(): string {
    return `# SEO Checklist

## On-Page SEO
- [ ] Title tags optimized
- [ ] Meta descriptions
- [ ] Header structure (H1, H2, H3)
- [ ] Image alt tags
- [ ] Internal linking

## Technical SEO
- [ ] Site speed optimization
- [ ] Mobile responsiveness
- [ ] XML sitemap
- [ ] Robots.txt
- [ ] SSL certificate

## Content SEO
- [ ] Keyword research
- [ ] Quality content
- [ ] Regular updates
- [ ] Schema markup
`
  }

  private generateVisualizationGuide(): string {
    return `# Data Visualization Guide

## Chart Types
- Bar charts: For categorical comparisons
- Line charts: For trends over time
- Pie charts: For part-to-whole relationships
- Scatter plots: For correlations
- Heatmaps: For pattern recognition

## Best Practices
- Choose appropriate chart types
- Use consistent color schemes
- Include clear labels and legends
- Optimize for target audience
- Ensure accessibility
`
  }

  private generateInsightsTemplate(): string {
    return `# Data Insights Template

## Executive Summary
[Key findings overview]

## Methodology
[Analysis approach and techniques used]

## Key Findings
1. [Finding 1 with supporting data]
2. [Finding 2 with supporting data]
3. [Finding 3 with supporting data]

## Recommendations
1. [Actionable recommendation]
2. [Actionable recommendation]
3. [Actionable recommendation]

## Next Steps
[Proposed follow-up actions]
`
  }

  private generateCoverLetterTemplate(): string {
    return `# Cover Letter Template

## Structure
1. Header with contact information
2. Professional greeting
3. Opening paragraph (hook)
4. Body paragraphs (value proposition)
5. Closing paragraph (call to action)
6. Professional sign-off

## Key Elements
- Personalize for each application
- Highlight relevant achievements
- Show knowledge of the company
- Express enthusiasm
- Keep it concise (one page)
`
  }

  private generateLinkedInGuide(): string {
    return `# LinkedIn Optimization Guide

## Profile Sections
1. **Headline**: Clear value proposition
2. **Summary**: Compelling professional story
3. **Experience**: Achievement-focused descriptions
4. **Skills**: Relevant and endorsed
5. **Recommendations**: Professional testimonials

## Best Practices
- Use a professional headshot
- Include relevant keywords
- Post regularly
- Engage with your network
- Join industry groups
`
  }
}