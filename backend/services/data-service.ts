import { generateText, generateCode } from "@/lib/ai-services"
import type { FileStorageService } from "./file-storage"
import type { Invoice } from "@/types"

interface DataServiceRequest {
  invoice: Invoice
  description: string
  options: {
    dataSize?: string
    visualizations?: number
    insights?: boolean
    dashboard?: boolean
  }
  buyerContact?: string
}

export class DataService {
  constructor(private fileStorage: FileStorageService) {}

  async process(request: DataServiceRequest): Promise<string> {
    const { description, options, invoice } = request
    const dataSize = options.dataSize || "Medium (1K-10K rows)"
    const vizCount = options.visualizations || 8
    const includeInsights = options.insights !== false
    const includeDashboard = options.dashboard || false

    try {
      // Generate data analysis plan
      const analysisPrompt = `Create a comprehensive data analysis plan for: ${description}

Dataset Size: ${dataSize}
Visualizations Needed: ${vizCount}
Include AI Insights: ${includeInsights}
Interactive Dashboard: ${includeDashboard}

Generate:
1. Data analysis methodology
2. Statistical tests to perform
3. Key metrics to calculate
4. Visualization recommendations
5. Expected insights and findings
6. Data cleaning and preprocessing steps`

      const analysisPlan = await generateText(analysisPrompt, "groq", "llama-3.1-70b-versatile")

      // Generate Python analysis script
      const pythonPrompt = `Create a Python data analysis script for: ${description}

Requirements:
- Data loading and cleaning
- Statistical analysis
- ${vizCount} different visualizations
- Export results to files
- Professional code structure
- Error handling

Libraries to use: pandas, numpy, matplotlib, seaborn, plotly, scipy

Generate complete, runnable Python code.`

      const pythonCode = await generateCode(pythonPrompt, "python")

      // Generate R analysis script as alternative
      const rPrompt = `Create an R data analysis script for: ${description}

Requirements:
- Data import and cleaning
- Statistical analysis
- ${vizCount} visualizations using ggplot2
- Export results
- Professional R code structure

Generate complete, runnable R code.`

      const rCode = await generateCode(rPrompt, "r")

      // Generate insights report if requested
      let insightsReport = ""
      if (includeInsights) {
        const insightsPrompt = `Generate a data analysis insights report template for: ${description}

Dataset: ${dataSize}
Analysis Type: ${description}

Create a professional report structure with:
1. Executive summary
2. Key findings and insights
3. Statistical significance
4. Business recommendations
5. Methodology explanation
6. Limitations and assumptions
7. Next steps and follow-up analysis

Make it business-ready and actionable.`

        insightsReport = await generateText(insightsPrompt, "groq", "llama-3.1-70b-versatile")
      }

      // Generate dashboard code if requested
      let dashboardCode = ""
      if (includeDashboard) {
        const dashboardPrompt = `Create an interactive dashboard for: ${description}

Requirements:
- Web-based dashboard (HTML/CSS/JavaScript)
- Interactive charts and filters
- Responsive design
- Data visualization with Chart.js or D3.js
- Professional styling

Generate complete dashboard code.`

        dashboardCode = await generateCode(dashboardPrompt, "html")
      }

      // Create deliverable files
      const files = [
        {
          name: "analysis-plan.md",
          content: `# Data Analysis Plan\n\n${analysisPlan}`,
          type: "text/markdown",
        },
        {
          name: "analysis.py",
          content: pythonCode,
          type: "text/x-python",
        },
        {
          name: "analysis.R",
          content: rCode,
          type: "text/x-r",
        },
        {
          name: "requirements.txt",
          content: `pandas>=1.3.0
numpy>=1.21.0
matplotlib>=3.4.0
seaborn>=0.11.0
plotly>=5.0.0
scipy>=1.7.0
jupyter>=1.0.0`,
          type: "text/plain",
        },
      ]

      if (insightsReport) {
        files.push({
          name: "insights-report-template.md",
          content: `# Data Analysis Report\n\n${insightsReport}`,
          type: "text/markdown",
        })
      }

      if (dashboardCode) {
        files.push({
          name: "dashboard.html",
          content: dashboardCode,
          type: "text/html",
        })
      }

      files.push({
        name: "README.md",
        content: `# Data Analysis Package

## Files Included
- analysis-plan.md - Comprehensive analysis methodology
- analysis.py - Python analysis script
- analysis.R - R analysis script  
- requirements.txt - Python dependencies
${insightsReport ? "- insights-report-template.md - Report template\n" : ""}${dashboardCode ? "- dashboard.html - Interactive dashboard\n" : ""}

## Setup Instructions
1. Install Python dependencies: pip install -r requirements.txt
2. Load your dataset and update file paths in scripts
3. Run analysis.py or analysis.R
4. Review generated visualizations and results

## Analysis Features
- ${vizCount} different visualizations
- Statistical analysis and testing
- Data cleaning and preprocessing
- Professional reporting structure`,
        type: "text/markdown",
      })

      // Store files and create package
      const deliverableUrl = await this.fileStorage.storeServiceFiles(invoice.invoiceId, files, "data-analysis")

      return deliverableUrl
    } catch (error) {
      console.error("Data service generation failed:", error)
      throw new Error(`Failed to generate data analysis: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }
}
