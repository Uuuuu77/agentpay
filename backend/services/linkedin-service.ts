import { generateCreativeContent } from "@/lib/ai-services"
import type { FileStorageService } from "./file-storage"
import type { Invoice } from "@/types"

interface LinkedInServiceRequest {
  invoice: Invoice
  description: string
  options: {
    industry?: string
    contentStrategy?: boolean
    postTemplates?: number
    networking?: boolean
  }
  buyerContact?: string
}

export class LinkedInService {
  constructor(private fileStorage: FileStorageService) {}

  async process(request: LinkedInServiceRequest): Promise<string> {
    const { description, options, invoice } = request
    const industry = options.industry || "Technology"
    const includeStrategy = options.contentStrategy !== false
    const postCount = options.postTemplates || 10
    const includeNetworking = options.networking !== false

    try {
      // Generate LinkedIn profile optimization
      const profilePrompt = `Optimize a LinkedIn profile for: ${description}

Industry: ${industry}
Professional Focus: ${description}

Generate optimized content for:
1. Professional headline (compelling, keyword-rich)
2. About/Summary section (engaging, value-focused)
3. Experience section improvements
4. Skills and endorsements strategy
5. Featured section recommendations
6. Contact information optimization

Make it professional, searchable, and compelling to recruiters and connections.`

      const profileOptimization = await generateCreativeContent(profilePrompt, "professional")

      // Generate content strategy if requested
      let contentStrategy = ""
      if (includeStrategy) {
        const strategyPrompt = `Create a LinkedIn content strategy for: ${description}

Industry: ${industry}
Professional Goals: Build authority, network, generate leads

Generate:
1. Content pillars and themes
2. Posting frequency and timing
3. Content types and formats
4. Engagement strategies
5. Hashtag research and strategy
6. Thought leadership topics
7. 30-day content calendar outline`

        contentStrategy = await generateCreativeContent(strategyPrompt, "strategy")
      }

      // Generate LinkedIn post templates
      const postTemplates = []
      if (postCount > 0) {
        const postTypes = [
          "Industry insight",
          "Personal story",
          "Tips and advice",
          "Behind the scenes",
          "Question/poll",
          "Achievement/milestone",
          "Industry news commentary",
          "Educational content",
          "Inspirational quote",
          "Case study/success story",
        ]

        for (let i = 0; i < postCount; i++) {
          const postType = postTypes[i % postTypes.length]
          const postPrompt = `Create a LinkedIn post template for: ${description}

Post Type: ${postType}
Industry: ${industry}
Professional Context: ${description}

Generate:
1. Engaging hook/opening
2. Valuable content body
3. Clear call-to-action
4. Relevant hashtags
5. Engagement questions

Make it authentic, valuable, and likely to generate engagement.`

          const postContent = await generateCreativeContent(postPrompt, "social")
          postTemplates.push({
            type: postType,
            content: postContent,
          })
        }
      }

      // Generate networking message templates if requested
      let networkingTemplates = ""
      if (includeNetworking) {
        const networkingPrompt = `Create LinkedIn networking message templates for: ${description}

Industry: ${industry}
Professional Goals: Build meaningful connections

Generate templates for:
1. Connection requests (5 variations)
2. Follow-up messages after connecting
3. Informational interview requests
4. Collaboration proposals
5. Thank you messages
6. Re-engagement messages

Make them personal, professional, and effective for building relationships.`

        networkingTemplates = await generateCreativeContent(networkingPrompt, "professional")
      }

      // Create deliverable files
      const files = [
        {
          name: "linkedin-profile-optimization.md",
          content: `# LinkedIn Profile Optimization\n\n${profileOptimization}`,
          type: "text/markdown",
        },
      ]

      if (contentStrategy) {
        files.push({
          name: "content-strategy.md",
          content: `# LinkedIn Content Strategy\n\n${contentStrategy}`,
          type: "text/markdown",
        })
      }

      if (postTemplates.length > 0) {
        files.push({
          name: "post-templates.md",
          content: `# LinkedIn Post Templates\n\n${postTemplates
            .map((post, index) => `## Template ${index + 1}: ${post.type}\n\n${post.content}\n\n---\n`)
            .join("")}`,
          type: "text/markdown",
        })
      }

      if (networkingTemplates) {
        files.push({
          name: "networking-templates.md",
          content: `# LinkedIn Networking Templates\n\n${networkingTemplates}`,
          type: "text/markdown",
        })
      }

      // Store files and create package
      const deliverableUrl = await this.fileStorage.storeServiceFiles(invoice.invoiceId, files, "linkedin-optimization")

      return deliverableUrl
    } catch (error) {
      console.error("LinkedIn service generation failed:", error)
      throw new Error(
        `Failed to generate LinkedIn optimization: ${error instanceof Error ? error.message : "Unknown error"}`,
      )
    }
  }
}
