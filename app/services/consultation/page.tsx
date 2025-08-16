import { ResearchBuddyForm } from "@/components/services/consultation/research-buddy-form"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "AI Research Buddy - Free Consultation Service | AgentPay",
  description: "Get personalized research and insights on any topic delivered to your inbox. Free AI-powered research service with 2-4 hour turnaround.",
  keywords: "AI research, free consultation, market research, business analysis, technical research",
}

export default function ConsultationPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <ResearchBuddyForm />
    </div>
  )
}