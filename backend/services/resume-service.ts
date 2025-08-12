import type { FileStorageService } from "./file-storage"
import type { Invoice } from "../../types"

interface ResumeServiceRequest {
  invoice: Invoice
  description: string
  options: {
    industry?: string
    coverLetter?: boolean
  }
  buyerContact?: string
}

export class ResumeService {
  private fileStorage: FileStorageService

  constructor(fileStorage: FileStorageService) {
    this.fileStorage = fileStorage
  }

  async process(request: ResumeServiceRequest): Promise<string> {
    const { description, options } = request
    const industry = options.industry || "Tech"
    const includeCoverLetter = options.coverLetter || false

    console.log(`Generating ATS-optimized resume for ${industry} industry`)

    try {
      // Generate resume content
      const resumeContent = await this.generateResumeContent(description, industry)

      // Generate LinkedIn summary
      const linkedinSummary = await this.generateLinkedInSummary(description, industry)

      // Generate keywords list
      const keywords = await this.generateKeywords(industry)

      // Generate cover letter if requested
      const coverLetter = includeCoverLetter ? await this.generateCoverLetter(description, industry) : null

      // Create deliverable files
      const files = [
        {
          filename: "resume.md",
          content: resumeContent,
        },
        {
          filename: "linkedin-summary.md",
          content: linkedinSummary,
        },
        {
          filename: "keywords.md",
          content: keywords,
        },
        {
          filename: "README.md",
          content: this.createReadme(industry, includeCoverLetter),
        },
      ]

      if (coverLetter) {
        files.push({
          filename: "cover-letter.md",
          content: coverLetter,
        })
      }

      return await this.fileStorage.saveMultipleFiles(files)
    } catch (error) {
      console.error("Resume service error:", error)
      throw new Error("Failed to generate resume")
    }
  }

  private async generateResumeContent(description: string, industry: string): Promise<string> {
    return `# Professional Resume

## Contact Information
[Your Name]
[Your Email]
[Your Phone]
[Your Location]
[LinkedIn Profile]
[Portfolio/Website]

## Professional Summary
${this.generateProfessionalSummary(description, industry)}

## Core Competencies
${this.generateCoreCompetencies(industry)}

## Professional Experience

### [Most Recent Position]
**[Company Name]** | [Location] | [Start Date] - [End Date]

${this.generateJobDescription(industry, "senior")}

### [Previous Position]
**[Company Name]** | [Location] | [Start Date] - [End Date]

${this.generateJobDescription(industry, "mid")}

### [Earlier Position]
**[Company Name]** | [Location] | [Start Date] - [End Date]

${this.generateJobDescription(industry, "junior")}

## Education
**[Degree]** in [Field of Study]
[University Name] | [Location] | [Graduation Year]
- Relevant coursework: [List relevant courses]
- GPA: [If 3.5 or higher]

## Technical Skills
${this.generateTechnicalSkills(industry)}

## Certifications
${this.generateCertifications(industry)}

## Projects
${this.generateProjects(industry)}

## Additional Information
- Languages: [List languages and proficiency levels]
- Volunteer Work: [Relevant volunteer experience]
- Awards: [Professional awards and recognition]

---
*This resume is optimized for Applicant Tracking Systems (ATS) and includes industry-specific keywords for ${industry} positions.*
`
  }

  private generateProfessionalSummary(description: string, industry: string): string {
    const templates = {
      Tech: `Results-driven software professional with [X] years of experience in full-stack development, system architecture, and team leadership. Proven track record of delivering scalable solutions that improve operational efficiency by up to 40%. Expertise in modern technologies including cloud platforms, microservices, and agile methodologies.`,
      Finance: `Accomplished finance professional with [X] years of experience in financial analysis, risk management, and strategic planning. Demonstrated ability to optimize financial performance and drive cost savings of up to $[X]M annually. Strong background in regulatory compliance and cross-functional collaboration.`,
      Healthcare: `Dedicated healthcare professional with [X] years of experience in patient care, clinical operations, and healthcare administration. Committed to improving patient outcomes through evidence-based practices and innovative care delivery models. Proven ability to work effectively in fast-paced, high-pressure environments.`,
      Marketing: `Creative marketing professional with [X] years of experience in digital marketing, brand management, and campaign optimization. Track record of increasing brand awareness by [X]% and driving revenue growth through data-driven marketing strategies. Expertise in multi-channel marketing and customer acquisition.`,
      General: `Accomplished professional with [X] years of experience in [relevant field]. Proven ability to drive results, lead teams, and implement strategic initiatives that deliver measurable business impact. Strong analytical and communication skills with a track record of exceeding performance targets.`,
    }

    return templates[industry as keyof typeof templates] || templates.General
  }

  private generateCoreCompetencies(industry: string): string {
    const competencies = {
      Tech: [
        "Software Development",
        "System Architecture",
        "Cloud Computing (AWS/Azure/GCP)",
        "Database Management",
        "API Development",
        "DevOps & CI/CD",
        "Agile/Scrum Methodologies",
        "Team Leadership",
        "Code Review & Quality Assurance",
        "Performance Optimization",
      ],
      Finance: [
        "Financial Analysis",
        "Risk Management",
        "Budget Planning & Forecasting",
        "Regulatory Compliance",
        "Investment Analysis",
        "Financial Modeling",
        "Cost Management",
        "Audit & Controls",
        "Strategic Planning",
        "Stakeholder Management",
      ],
      Healthcare: [
        "Patient Care",
        "Clinical Documentation",
        "Healthcare Regulations",
        "Quality Improvement",
        "Electronic Health Records",
        "Care Coordination",
        "Patient Safety",
        "Healthcare Analytics",
        "Team Collaboration",
        "Continuing Education",
      ],
      Marketing: [
        "Digital Marketing",
        "Content Strategy",
        "Social Media Management",
        "SEO/SEM",
        "Email Marketing",
        "Analytics & Reporting",
        "Brand Management",
        "Campaign Management",
        "Market Research",
        "Customer Segmentation",
      ],
      General: [
        "Project Management",
        "Strategic Planning",
        "Team Leadership",
        "Process Improvement",
        "Data Analysis",
        "Communication",
        "Problem Solving",
        "Stakeholder Management",
        "Budget Management",
        "Quality Assurance",
      ],
    }

    const skills = competencies[industry as keyof typeof competencies] || competencies.General
    return skills.map((skill) => `• ${skill}`).join("\n")
  }

  private generateJobDescription(industry: string, level: "senior" | "mid" | "junior"): string {
    const achievements = {
      senior: [
        "Led cross-functional team of [X] members to deliver [specific project/initiative]",
        "Implemented strategic initiatives that resulted in [X]% improvement in [relevant metric]",
        "Managed budget of $[X] and consistently delivered projects on time and under budget",
        "Mentored [X] junior team members and contributed to their professional development",
      ],
      mid: [
        "Collaborated with stakeholders to define requirements and deliver solutions",
        "Improved [specific process/system] resulting in [X]% efficiency gain",
        "Contributed to team goals by consistently exceeding individual performance targets",
        "Participated in cross-functional projects and initiatives",
      ],
      junior: [
        "Supported senior team members in executing key projects and initiatives",
        "Learned and applied industry best practices and methodologies",
        "Contributed to team success through attention to detail and strong work ethic",
        "Participated in training programs and professional development activities",
      ],
    }

    return achievements[level].map((achievement) => `• ${achievement}`).join("\n")
  }

  private generateTechnicalSkills(industry: string): string {
    const skills = {
      Tech: {
        "Programming Languages": ["Python", "JavaScript", "Java", "C#", "Go"],
        "Frameworks & Libraries": ["React", "Node.js", "Django", "Spring Boot", "Express"],
        Databases: ["PostgreSQL", "MongoDB", "Redis", "MySQL", "Elasticsearch"],
        "Cloud Platforms": ["AWS", "Azure", "Google Cloud", "Docker", "Kubernetes"],
        "Tools & Technologies": ["Git", "Jenkins", "Terraform", "Monitoring Tools", "API Design"],
      },
      Finance: {
        Software: ["Excel", "Bloomberg Terminal", "SAP", "Oracle", "Tableau"],
        "Analysis Tools": ["Python", "R", "SQL", "Power BI", "QuickBooks"],
        Compliance: ["SOX", "GAAP", "IFRS", "Risk Management", "Audit Tools"],
      },
      General: {
        Software: ["Microsoft Office Suite", "Google Workspace", "Slack", "Zoom"],
        Analysis: ["Excel", "PowerPoint", "Data Analysis", "Reporting"],
        "Project Management": ["Jira", "Trello", "Asana", "Monday.com"],
      },
    }

    const industrySkills = skills[industry as keyof typeof skills] || skills.General
    let content = ""

    Object.entries(industrySkills).forEach(([category, skillList]) => {
      content += `**${category}**: ${skillList.join(", ")}\n`
    })

    return content
  }

  private generateCertifications(industry: string): string {
    const certs = {
      Tech: [
        "AWS Certified Solutions Architect",
        "Google Cloud Professional",
        "Certified Kubernetes Administrator",
        "PMP (Project Management Professional)",
        "Scrum Master Certification",
      ],
      Finance: [
        "CPA (Certified Public Accountant)",
        "CFA (Chartered Financial Analyst)",
        "FRM (Financial Risk Manager)",
        "PMP (Project Management Professional)",
      ],
      General: [
        "PMP (Project Management Professional)",
        "Six Sigma Green Belt",
        "Industry-specific certifications",
        "Continuing education courses",
      ],
    }

    const industryCerts = certs[industry as keyof typeof certs] || certs.General
    return industryCerts.map((cert) => `• ${cert} (In Progress/Completed)`).join("\n")
  }

  private generateProjects(industry: string): string {
    return `### [Project Name 1]
**Technologies Used**: [List relevant technologies]
**Description**: Brief description of the project, your role, and key achievements
**Impact**: Quantified results or improvements achieved

### [Project Name 2]
**Technologies Used**: [List relevant technologies]
**Description**: Brief description of the project, your role, and key achievements
**Impact**: Quantified results or improvements achieved`
  }

  private async generateLinkedInSummary(description: string, industry: string): Promise<string> {
    return `# LinkedIn Professional Summary

## Optimized Summary
${this.generateProfessionalSummary(description, industry)}

## Key Points to Highlight:
• [X] years of experience in ${industry.toLowerCase()}
• Proven track record of [specific achievements]
• Expertise in [key skills/technologies]
• Strong background in [relevant areas]
• Passionate about [industry trends/innovations]

## Call to Action:
"I'm always interested in connecting with fellow professionals and exploring opportunities to collaborate. Feel free to reach out if you'd like to discuss [relevant topics] or potential partnerships."

## Hashtags to Use:
${this.generateHashtags(industry)}

## Tips for LinkedIn Optimization:
1. Use industry-specific keywords throughout your profile
2. Include quantified achievements in your experience section
3. Regularly share relevant industry content
4. Engage with your network's posts and updates
5. Keep your profile updated with recent accomplishments

Generated: ${new Date().toLocaleString()}
`
  }

  private generateHashtags(industry: string): string {
    const hashtags = {
      Tech: [
        "#SoftwareDevelopment",
        "#CloudComputing",
        "#TechInnovation",
        "#FullStackDeveloper",
        "#DevOps",
        "#Agile",
        "#TechLeadership",
      ],
      Finance: ["#Finance", "#FinTech", "#RiskManagement", "#Investment", "#FinancialAnalysis", "#Banking"],
      Healthcare: ["#Healthcare", "#PatientCare", "#HealthTech", "#MedicalInnovation", "#HealthcareLeadership"],
      Marketing: ["#DigitalMarketing", "#MarketingStrategy", "#ContentMarketing", "#SocialMedia", "#MarTech"],
      General: ["#ProfessionalDevelopment", "#Leadership", "#ProjectManagement", "#Innovation", "#CareerGrowth"],
    }

    const industryHashtags = hashtags[industry as keyof typeof hashtags] || hashtags.General
    return industryHashtags.join(" ")
  }

  private async generateKeywords(industry: string): Promise<string> {
    const keywords = {
      Tech: [
        "Software Development",
        "Full Stack Developer",
        "Cloud Computing",
        "DevOps",
        "Agile",
        "Scrum",
        "API Development",
        "Database Management",
        "System Architecture",
        "Code Review",
        "CI/CD",
        "Microservices",
        "Container Orchestration",
        "Performance Optimization",
        "Technical Leadership",
      ],
      Finance: [
        "Financial Analysis",
        "Risk Management",
        "Investment Banking",
        "Portfolio Management",
        "Financial Modeling",
        "Regulatory Compliance",
        "Budget Planning",
        "Cost Management",
        "Audit",
        "Financial Reporting",
        "Treasury Management",
        "Credit Analysis",
        "Derivatives",
        "Asset Management",
        "Financial Planning",
      ],
      General: [
        "Project Management",
        "Team Leadership",
        "Strategic Planning",
        "Process Improvement",
        "Stakeholder Management",
        "Budget Management",
        "Quality Assurance",
        "Data Analysis",
        "Communication",
        "Problem Solving",
        "Cross-functional Collaboration",
        "Performance Management",
        "Change Management",
        "Business Development",
        "Customer Relations",
      ],
    }

    const industryKeywords = keywords[industry as keyof typeof keywords] || keywords.General

    return `# ATS Keywords for ${industry}

## Primary Keywords (Use in Summary and Experience)
${industryKeywords
  .slice(0, 8)
  .map((keyword) => `• ${keyword}`)
  .join("\n")}

## Secondary Keywords (Use Throughout Resume)
${industryKeywords
  .slice(8)
  .map((keyword) => `• ${keyword}`)
  .join("\n")}

## Usage Tips:
1. **Natural Integration**: Incorporate keywords naturally into your experience descriptions
2. **Exact Matches**: Use exact phrases from job descriptions when applicable
3. **Variations**: Include both acronyms and full terms (e.g., "AI" and "Artificial Intelligence")
4. **Context**: Always use keywords in meaningful context, not just as lists
5. **Density**: Aim for 2-3% keyword density throughout your resume

## Industry-Specific Advice:
- Research job postings in your target companies
- Use LinkedIn to identify trending skills in your industry
- Include both technical and soft skills keywords
- Update keywords regularly based on industry trends

Generated: ${new Date().toLocaleString()}
`
  }

  private async generateCoverLetter(description: string, industry: string): Promise<string> {
    return `# Professional Cover Letter Template

**[Date]**

**[Hiring Manager Name]**  
**[Company Name]**  
**[Company Address]**

Dear Hiring Manager,

## Opening Paragraph
I am writing to express my strong interest in the [Position Title] role at [Company Name]. With [X] years of experience in ${industry.toLowerCase()} and a proven track record of [specific achievement], I am confident that my skills and passion make me an ideal candidate for this position.

## Body Paragraph 1 - Relevant Experience
In my previous role as [Previous Position] at [Previous Company], I successfully [specific achievement that relates to the job]. This experience has equipped me with [relevant skills] that directly align with the requirements outlined in your job posting. My expertise in [key skill/technology] has enabled me to [specific result or impact].

## Body Paragraph 2 - Value Proposition
What sets me apart is my ability to [unique strength or skill]. For example, [specific example that demonstrates this strength]. I am particularly drawn to [Company Name] because of [specific reason related to company/role], and I am excited about the opportunity to contribute to [specific company goal or project].

## Closing Paragraph
I would welcome the opportunity to discuss how my background in ${industry.toLowerCase()} and passion for [relevant area] can contribute to your team's success. Thank you for considering my application. I look forward to hearing from you soon.

Sincerely,  
[Your Name]

---

## Customization Notes:
- Replace all bracketed placeholders with specific information
- Research the company and mention specific projects or values
- Quantify achievements with specific numbers when possible
- Keep the letter to one page
- Match the tone to the company culture
- Proofread carefully for grammar and spelling

Generated: ${new Date().toLocaleString()}
`
  }

  private createReadme(industry: string, includeCoverLetter: boolean): string {
    return `# Professional Resume Package

## Package Contents

This resume package has been professionally crafted and optimized for the ${industry} industry. It includes:

### 📄 Core Documents
- **resume.md** - ATS-optimized professional resume
- **linkedin-summary.md** - LinkedIn profile optimization guide
- **keywords.md** - Industry-specific ATS keywords
${includeCoverLetter ? "- **cover-letter.md** - Professional cover letter template" : ""}

### 🎯 Optimization Features
- **ATS-Friendly**: Formatted to pass Applicant Tracking Systems
- **Industry-Specific**: Tailored keywords and terminology for ${industry}
- **Quantified Achievements**: Template includes spaces for measurable results
- **Modern Format**: Clean, professional layout that stands out

### 📋 Next Steps

1. **Customize Your Resume**
   - Replace all bracketed placeholders [like this] with your specific information
   - Add quantified achievements and specific examples
   - Tailor the content to match specific job descriptions

2. **Optimize Your LinkedIn**
   - Use the provided summary and keywords
   - Update your headline and experience sections
   - Add relevant skills and endorsements

3. **Prepare for Applications**
   - Save resume as both .docx and .pdf formats
   - Customize the resume for each application
   - Use keywords from job postings
${includeCoverLetter ? "\n4. **Cover Letter Usage**\n   - Customize the cover letter template for each application\n   - Research the company and mention specific details\n   - Keep it concise and focused on value proposition" : ""}

### 💡 Pro Tips

- **Keyword Optimization**: Use the provided keywords naturally throughout your resume
- **Quantify Everything**: Include numbers, percentages, and specific results
- **Tailor for Each Job**: Adjust keywords and emphasis based on job requirements
- **Keep It Current**: Update regularly with new achievements and skills
- **Professional Email**: Use a professional email address for applications

### 🔧 Technical Notes

- All files are in Markdown format for easy editing
- Convert to PDF/Word as needed for applications
- Maintain consistent formatting across all documents
- Use professional fonts like Arial, Calibri, or Times New Roman

### 📞 Support

This resume package was generated by AgentPay's AI-powered resume service. For additional customization or questions, please refer to your service delivery confirmation.

---

**Generated**: ${new Date().toLocaleString()}  
**Industry**: ${industry}  
**Package Type**: ${includeCoverLetter ? "Complete Package with Cover Letter" : "Standard Package"}

Good luck with your job search! 🚀
`
  }
}
