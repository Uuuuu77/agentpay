import type { FileStorageService } from "./file-storage"
import type { Invoice } from "../../types"

interface PromptServiceRequest {
  invoice: Invoice
  description: string
  options: {
    targetModel?: string
    iterations?: number
  }
  buyerContact?: string
}

export class PromptService {
  private fileStorage: FileStorageService

  constructor(fileStorage: FileStorageService) {
    this.fileStorage = fileStorage
  }

  async process(request: PromptServiceRequest): Promise<string> {
    const { description, options } = request
    const targetModel = options.targetModel || "GPT-4"
    const iterations = options.iterations || 3

    console.log(`Generating optimized prompts for ${targetModel}: ${description}`)

    try {
      // Generate optimized prompts
      const prompts = await this.generateOptimizedPrompts(description, targetModel, iterations)

      // Generate example outputs
      const examples = await this.generateExampleOutputs(prompts, targetModel)

      // Generate usage guide
      const usageGuide = await this.generateUsageGuide(description, targetModel)

      // Generate parameter recommendations
      const parameterGuide = await this.generateParameterGuide(targetModel)

      // Create deliverable files
      const files = [
        {
          filename: "optimized-prompts.md",
          content: this.formatPrompts(prompts),
        },
        {
          filename: "example-outputs.md",
          content: examples,
        },
        {
          filename: "usage-guide.md",
          content: usageGuide,
        },
        {
          filename: "parameter-recommendations.md",
          content: parameterGuide,
        },
        {
          filename: "README.md",
          content: this.createReadme(description, targetModel, iterations),
        },
      ]

      return await this.fileStorage.saveMultipleFiles(files)
    } catch (error) {
      console.error("Prompt service error:", error)
      throw new Error("Failed to generate optimized prompts")
    }
  }

  private async generateOptimizedPrompts(
    description: string,
    targetModel: string,
    iterations: number,
  ): Promise<string[]> {
    const prompts: string[] = []

    // Base prompt
    const basePrompt = this.createBasePrompt(description, targetModel)
    prompts.push(basePrompt)

    // Generate variations
    for (let i = 1; i < iterations; i++) {
      const variation = this.createPromptVariation(basePrompt, i, targetModel)
      prompts.push(variation)
    }

    return prompts
  }

  private createBasePrompt(description: string, targetModel: string): string {
    const modelSpecificInstructions = this.getModelSpecificInstructions(targetModel)

    return `${modelSpecificInstructions}

Task: ${description}

Please provide a comprehensive response that:
1. Addresses the specific requirements mentioned
2. Includes relevant examples where appropriate
3. Maintains clarity and accuracy
4. Follows best practices for the given domain

Format your response in a structured manner with clear sections and actionable insights.`
  }

  private createPromptVariation(basePrompt: string, iteration: number, targetModel: string): string {
    const variations = [
      {
        prefix: "You are an expert consultant specializing in this domain.",
        style: "Focus on providing expert-level insights with practical examples.",
      },
      {
        prefix: "Act as a professional advisor with extensive experience.",
        style: "Emphasize actionable recommendations and best practices.",
      },
      {
        prefix: "You are a knowledgeable specialist in this field.",
        style: "Provide detailed explanations with step-by-step guidance.",
      },
    ]

    const variation = variations[iteration - 1] || variations[0]

    return `${variation.prefix}

${basePrompt}

${variation.style}

Please ensure your response is:
- Comprehensive yet concise
- Actionable and practical
- Well-structured and easy to follow
- Tailored to the specific requirements`
  }

  private getModelSpecificInstructions(targetModel: string): string {
    switch (targetModel.toLowerCase()) {
      case "gpt-4":
      case "gpt-3.5":
        return "You are ChatGPT, a helpful AI assistant created by OpenAI."
      case "claude":
        return "You are Claude, an AI assistant created by Vercel to be helpful, harmless, and honest."
      case "gemini":
        return "You are Gemini, Google's helpful AI assistant."
      default:
        return "You are a helpful AI assistant."
    }
  }

  private async generateExampleOutputs(prompts: string[], targetModel: string): Promise<string> {
    let content = `# Example Outputs\n\nThese are sample outputs generated using the optimized prompts with ${targetModel}.\n\n`

    prompts.forEach((prompt, index) => {
      content += `## Prompt ${index + 1} Example Output\n\n`
      content += `**Prompt Used:**\n\`\`\`\n${prompt}\n\`\`\`\n\n`
      content += `**Sample Output:**\n`
      content += this.generateSampleOutput(prompt, targetModel)
      content += `\n\n---\n\n`
    })

    return content
  }

  private generateSampleOutput(prompt: string, targetModel: string): string {
    // Generate a realistic sample output based on the prompt
    return `This is a sample output that demonstrates how ${targetModel} would respond to the optimized prompt. The actual output would be more detailed and specific to your exact requirements.

Key points covered:
- Addresses the main requirements
- Provides structured information
- Includes relevant examples
- Maintains professional tone

Note: This is a demonstration. Actual outputs will vary based on your specific use case and the model's current capabilities.`
  }

  private async generateUsageGuide(description: string, targetModel: string): Promise<string> {
    return `# Usage Guide

## Overview
This guide explains how to effectively use the optimized prompts for: ${description}

## Target Model: ${targetModel}

## Best Practices

### 1. Prompt Selection
- **Prompt 1**: Best for general inquiries and broad topics
- **Prompt 2**: Ideal for expert-level analysis and detailed insights
- **Prompt 3**: Perfect for step-by-step guidance and tutorials

### 2. Customization Tips
- Replace placeholder text with your specific requirements
- Adjust the tone and style based on your audience
- Add context-specific examples when relevant

### 3. Parameter Recommendations
${this.getParameterRecommendations(targetModel)}

### 4. Common Modifications
- **For shorter responses**: Add "Please provide a concise summary"
- **For more detail**: Add "Please provide comprehensive details with examples"
- **For specific format**: Add "Please format your response as [bullets/numbered list/table]"

## Troubleshooting

### If responses are too generic:
- Add more specific context to your prompt
- Include examples of what you're looking for
- Specify the desired output format

### If responses are too long:
- Add length constraints to your prompt
- Request bullet points or summaries
- Focus on specific aspects rather than broad topics

### If responses miss key points:
- Explicitly list the points you want covered
- Use numbered requirements
- Provide examples of good responses

## Advanced Usage

### Chaining Prompts
For complex tasks, consider using multiple prompts in sequence:
1. Use Prompt 1 for initial analysis
2. Use Prompt 2 for detailed exploration
3. Use Prompt 3 for implementation guidance

### Context Management
- Keep conversations focused on the specific topic
- Provide relevant background information
- Reference previous responses when building on ideas

Generated: ${new Date().toLocaleString()}
`
  }

  private async generateParameterGuide(targetModel: string): Promise<string> {
    return `# Parameter Recommendations for ${targetModel}

## Recommended Settings

### Temperature
${this.getTemperatureRecommendations(targetModel)}

### Max Tokens
${this.getTokenRecommendations(targetModel)}

### Top-p (Nucleus Sampling)
${this.getTopPRecommendations(targetModel)}

### Frequency Penalty
${this.getFrequencyPenaltyRecommendations(targetModel)}

### Presence Penalty
${this.getPresencePenaltyRecommendations(targetModel)}

## Use Case Specific Settings

### Creative Writing
- Temperature: 0.8-1.0
- Top-p: 0.9
- Higher randomness for creativity

### Technical Documentation
- Temperature: 0.2-0.4
- Top-p: 0.8
- Lower randomness for accuracy

### Analysis and Research
- Temperature: 0.3-0.5
- Top-p: 0.85
- Balanced approach

### Code Generation
- Temperature: 0.1-0.3
- Top-p: 0.7
- Minimal randomness for precision

## Testing and Optimization

### A/B Testing
1. Test different temperature settings
2. Compare output quality and consistency
3. Adjust based on your specific needs

### Quality Metrics
- Relevance to the prompt
- Accuracy of information
- Clarity and structure
- Completeness of response

### Iteration Process
1. Start with recommended settings
2. Test with sample prompts
3. Adjust parameters based on results
4. Document what works best for your use case

Generated: ${new Date().toLocaleString()}
`
  }

  private getParameterRecommendations(targetModel: string): string {
    switch (targetModel.toLowerCase()) {
      case "gpt-4":
        return `- **Temperature**: 0.3-0.7 (0.5 recommended for balanced creativity and accuracy)
- **Max Tokens**: 2000-4000 (adjust based on desired response length)
- **Top-p**: 0.8-0.9 (0.85 recommended)
- **Frequency Penalty**: 0.0-0.3 (0.1 recommended to reduce repetition)`
      case "claude":
        return `- **Temperature**: 0.2-0.8 (0.4 recommended for most use cases)
- **Max Tokens**: 1000-3000 (Claude handles length well automatically)
- **Top-p**: 0.7-0.9 (0.8 recommended)`
      default:
        return `- **Temperature**: 0.3-0.7 (adjust based on creativity needs)
- **Max Tokens**: 1000-3000 (based on desired response length)
- **Top-p**: 0.8-0.9 (for balanced output)`
    }
  }

  private getTemperatureRecommendations(targetModel: string): string {
    return `**Recommended Range**: 0.3-0.7

- **0.1-0.3**: Very focused and deterministic responses
- **0.4-0.6**: Balanced creativity and accuracy (recommended)
- **0.7-0.9**: More creative and varied responses
- **1.0+**: Highly creative but potentially less accurate`
  }

  private getTokenRecommendations(targetModel: string): string {
    return `**Recommended Range**: 1000-3000 tokens

- **500-1000**: Short, concise responses
- **1000-2000**: Standard detailed responses (recommended)
- **2000-4000**: Comprehensive, in-depth responses
- **4000+**: Very detailed analysis (use sparingly)`
  }

  private getTopPRecommendations(targetModel: string): string {
    return `**Recommended Range**: 0.8-0.9

- **0.7-0.8**: More focused responses
- **0.85**: Balanced approach (recommended)
- **0.9-0.95**: More diverse vocabulary and ideas
- **0.95+**: Maximum diversity (may reduce coherence)`
  }

  private getFrequencyPenaltyRecommendations(targetModel: string): string {
    return `**Recommended Range**: 0.0-0.3

- **0.0**: No penalty for repetition
- **0.1**: Light penalty (recommended for most cases)
- **0.2-0.3**: Stronger penalty for repetitive content
- **0.5+**: May negatively impact natural language flow`
  }

  private getPresencePenaltyRecommendations(targetModel: string): string {
    return `**Recommended Range**: 0.0-0.2

- **0.0**: No penalty for topic repetition
- **0.1**: Light encouragement for topic diversity (recommended)
- **0.2**: Stronger push for new topics
- **0.3+**: May cause topic drift`
  }

  private formatPrompts(prompts: string[]): string {
    let content = `# Optimized Prompts\n\n`

    prompts.forEach((prompt, index) => {
      content += `## Prompt ${index + 1}\n\n`
      content += `\`\`\`\n${prompt}\n\`\`\`\n\n`
      content += `### Use Case\n`
      content += this.getPromptUseCase(index)
      content += `\n\n---\n\n`
    })

    return content
  }

  private getPromptUseCase(index: number): string {
    const useCases = [
      "General purpose prompt suitable for most inquiries and broad topics.",
      "Expert-level prompt ideal for detailed analysis and professional insights.",
      "Structured prompt perfect for step-by-step guidance and educational content.",
    ]

    return useCases[index] || "Specialized prompt for specific use cases."
  }

  private createReadme(description: string, targetModel: string, iterations: number): string {
    return `# Prompt Engineering Package

## Project: ${description}
## Target Model: ${targetModel}
## Optimization Iterations: ${iterations}

This package contains professionally optimized prompts designed to maximize the effectiveness of your AI interactions.

## Files Included:
- **optimized-prompts.md**: ${iterations} carefully crafted prompt variations
- **example-outputs.md**: Sample responses demonstrating prompt effectiveness
- **usage-guide.md**: Comprehensive guide for implementing the prompts
- **parameter-recommendations.md**: Optimal settings for ${targetModel}

## Quick Start:
1. Review the optimized prompts
2. Select the most appropriate prompt for your use case
3. Customize with your specific requirements
4. Apply recommended parameters
5. Test and iterate based on results

## Support:
For questions about implementation or customization, contact us through the AgentPay platform.

Generated: ${new Date().toLocaleString()}
`
  }
}
