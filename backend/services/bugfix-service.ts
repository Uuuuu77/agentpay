import { generateText, generateCode } from "@/lib/ai-services"
import type { FileStorageService } from "./file-storage"
import type { Invoice } from "@/types"

interface BugfixServiceRequest {
  invoice: Invoice
  description: string
  options: {
    complexity?: string
    codeReview?: boolean
    testing?: boolean
    documentation?: boolean
    technology?: string
  }
  buyerContact?: string
}

export class BugfixService {
  constructor(private fileStorage: FileStorageService) {}

  async process(request: BugfixServiceRequest): Promise<string> {
    const { description, options, invoice } = request
    const complexity = options.complexity || "Medium"
    const includeReview = options.codeReview !== false
    const includeTesting = options.testing !== false
    const includeDocumentation = options.documentation || false
    const technology = options.technology || "JavaScript/Node.js"

    try {
      // Generate bug analysis and fix plan
      const analysisPrompt = `Analyze and create a fix plan for this bug/issue: ${description}

Technology Stack: ${technology}
Complexity Level: ${complexity}
Include Code Review: ${includeReview}
Include Testing: ${includeTesting}

Generate:
1. Bug analysis and root cause identification
2. Step-by-step fix implementation plan
3. Potential side effects and considerations
4. Testing strategy
5. Prevention recommendations
6. Code quality improvements`

      const bugAnalysis = await generateText(analysisPrompt, "groq", "mixtral-8x7b-32768")

      // Generate the actual bug fix code
      const fixPrompt = `Create a bug fix for: ${description}

Technology: ${technology}
Complexity: ${complexity}

Requirements:
- Clean, production-ready code
- Proper error handling
- Performance considerations
- Security best practices
- Clear comments explaining the fix
- Backward compatibility where possible

Generate the complete fixed code with explanations.`

      const fixedCode = await generateCode(
        fixPrompt,
        technology.toLowerCase().includes("python") ? "python" : "typescript",
      )

      // Generate code review report if requested
      let codeReview = ""
      if (includeReview) {
        const reviewPrompt = `Perform a comprehensive code review for this bug fix:

Original Issue: ${description}
Technology: ${technology}
Fixed Code: ${fixedCode}

Generate a detailed code review covering:
1. Code quality assessment
2. Security vulnerabilities check
3. Performance optimization opportunities
4. Best practices compliance
5. Maintainability improvements
6. Potential edge cases
7. Refactoring suggestions`

        codeReview = await generateText(reviewPrompt, "groq", "mixtral-8x7b-32768")
      }

      // Generate test cases if requested
      let testCases = ""
      if (includeTesting) {
        const testPrompt = `Create comprehensive test cases for this bug fix:

Bug Description: ${description}
Technology: ${technology}
Fixed Code: ${fixedCode}

Generate:
1. Unit tests for the fixed functionality
2. Integration tests if applicable
3. Edge case testing scenarios
4. Regression tests to prevent future issues
5. Performance tests if relevant
6. Test data and mock objects

Use appropriate testing framework for ${technology}.`

        testCases = await generateCode(
          testPrompt,
          technology.toLowerCase().includes("python") ? "python" : "typescript",
        )
      }

      // Generate documentation if requested
      let documentation = ""
      if (includeDocumentation) {
        const docPrompt = `Create technical documentation for this bug fix:

Issue: ${description}
Technology: ${technology}
Solution: ${fixedCode}

Generate:
1. Bug fix summary
2. Implementation details
3. API changes (if any)
4. Configuration updates needed
5. Deployment instructions
6. Monitoring and maintenance notes
7. Troubleshooting guide`

        documentation = await generateText(docPrompt, "groq", "llama-3.1-70b-versatile")
      }

      // Generate performance optimization notes
      const optimizationPrompt = `Analyze performance optimization opportunities for this fix:

Bug Fix: ${description}
Technology: ${technology}
Code: ${fixedCode}

Generate recommendations for:
1. Performance improvements
2. Memory optimization
3. Database query optimization (if applicable)
4. Caching strategies
5. Scalability considerations
6. Monitoring metrics to track`

      const optimizationNotes = await generateText(optimizationPrompt, "groq", "mixtral-8x7b-32768")

      // Create deliverable files
      const files = [
        {
          name: "bug-analysis.md",
          content: `# Bug Analysis and Fix Plan\n\n${bugAnalysis}`,
          type: "text/markdown",
        },
        {
          name: `fixed-code.${technology.toLowerCase().includes("python") ? "py" : "ts"}`,
          content: fixedCode,
          type: technology.toLowerCase().includes("python") ? "text/x-python" : "text/typescript",
        },
        {
          name: "performance-optimization.md",
          content: `# Performance Optimization Recommendations\n\n${optimizationNotes}`,
          type: "text/markdown",
        },
      ]

      if (codeReview) {
        files.push({
          name: "code-review-report.md",
          content: `# Code Review Report\n\n${codeReview}`,
          type: "text/markdown",
        })
      }

      if (testCases) {
        files.push({
          name: `test-cases.${technology.toLowerCase().includes("python") ? "py" : "test.ts"}`,
          content: testCases,
          type: technology.toLowerCase().includes("python") ? "text/x-python" : "text/typescript",
        })
      }

      if (documentation) {
        files.push({
          name: "technical-documentation.md",
          content: `# Technical Documentation\n\n${documentation}`,
          type: "text/markdown",
        })
      }

      files.push({
        name: "README.md",
        content: `# Bug Fix Package

## Issue Summary
${description}

## Technology Stack
${technology}

## Complexity Level
${complexity}

## Files Included
- bug-analysis.md - Detailed analysis and fix plan
- fixed-code.${technology.toLowerCase().includes("python") ? "py" : "ts"} - The actual bug fix
- performance-optimization.md - Performance improvement recommendations
${codeReview ? "- code-review-report.md - Comprehensive code review\n" : ""}${testCases ? `- test-cases.${technology.toLowerCase().includes("python") ? "py" : "test.ts"} - Test cases and validation\n` : ""}${documentation ? "- technical-documentation.md - Implementation documentation\n" : ""}

## Implementation Steps
1. Review the bug analysis and fix plan
2. Apply the fixed code to your project
3. Run the provided test cases
4. Deploy following the documentation guidelines
5. Monitor performance metrics

## Support
If you need clarification on any part of the fix, refer to the detailed analysis and documentation provided.`,
        type: "text/markdown",
      })

      // Store files and create package
      const deliverableUrl = await this.fileStorage.storeServiceFiles(invoice.invoiceId, files, "bugfix-package")

      return deliverableUrl
    } catch (error) {
      console.error("Bugfix service generation failed:", error)
      throw new Error(`Failed to generate bug fix: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }
}
