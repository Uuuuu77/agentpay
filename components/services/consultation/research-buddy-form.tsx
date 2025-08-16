"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Mail, Clock, TrendingUp, Lightbulb, Loader2, CheckCircle } from "lucide-react"
import { RESEARCH_INDUSTRIES, RESEARCH_SOURCES, DELIVERABLE_FORMATS } from "@/lib/services/consultation-config"
import { toast } from "sonner"

interface FormData {
  email: string
  name: string
  researchTopic: string
  specificQuestions: string
  industry: string
  targetAudience: string
  researchDepth: string
  preferredSources: string[]
  deliverableFormat: string
  context: string
}

export function ResearchBuddyForm() {
  const [formData, setFormData] = useState<FormData>({
    email: "",
    name: "",
    researchTopic: "",
    specificQuestions: "",
    industry: "",
    targetAudience: "",
    researchDepth: "intermediate",
    preferredSources: [],
    deliverableFormat: "report",
    context: ""
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSourceChange = (sourceId: string, checked: boolean) => {
    if (checked) {
      setFormData({
        ...formData, 
        preferredSources: [...formData.preferredSources, sourceId]
      })
    } else {
      setFormData({
        ...formData,
        preferredSources: formData.preferredSources.filter(s => s !== sourceId)
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation
    if (!formData.name || !formData.email || !formData.researchTopic) {
      toast.error("Please fill in all required fields")
      return
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      toast.error("Please enter a valid email address")
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/consultation/research', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit research request')
      }

      setIsSubmitted(true)
      toast.success("Research request submitted! Check your email in 2-4 hours.")
      
    } catch (error) {
      console.error('Submission error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to submit request. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="max-w-2xl mx-auto p-6 text-center">
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-green-800 mb-2">Research Request Submitted!</h2>
            <p className="text-green-700 mb-4">
              We've received your request for research on "{formData.researchTopic}". 
              Our AI research buddy is now working on your personalized report.
            </p>
            <div className="bg-white p-4 rounded-lg border border-green-200 mb-4">
              <p className="text-sm text-gray-600">
                <strong>Delivery Email:</strong> {formData.email}<br />
                <strong>Expected Delivery:</strong> 2-4 hours<br />
                <strong>Format:</strong> {DELIVERABLE_FORMATS.find(f => f.id === formData.deliverableFormat)?.label}
              </p>
            </div>
            <Button 
              onClick={() => window.location.reload()} 
              variant="outline"
              className="mr-4"
            >
              Submit Another Request
            </Button>
            <Button asChild>
              <a href="/services">Explore More Services</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-4">
          <h1 className="text-3xl font-bold">AI Research Buddy</h1>
          <Badge className="bg-green-100 text-green-800">FREE</Badge>
        </div>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Get personalized research and insights delivered to your inbox. Perfect for market analysis, 
          technical deep-dives, and strategic planning.
        </p>
      </div>

      {/* Service Features */}
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <Card className="text-center p-4">
          <Mail className="w-8 h-8 text-primary mx-auto mb-2" />
          <h3 className="font-semibold">Email Delivery</h3>
          <p className="text-sm text-muted-foreground">Comprehensive research sent directly to your inbox</p>
        </Card>
        <Card className="text-center p-4">
          <Clock className="w-8 h-8 text-primary mx-auto mb-2" />
          <h3 className="font-semibold">2-4 Hour Turnaround</h3>
          <p className="text-sm text-muted-foreground">Fast, AI-powered research and analysis</p>
        </Card>
        <Card className="text-center p-4">
          <TrendingUp className="w-8 h-8 text-primary mx-auto mb-2" />
          <h3 className="font-semibold">Current Insights</h3>
          <p className="text-sm text-muted-foreground">Latest trends and strategic recommendations</p>
        </Card>
      </div>

      {/* Main Form */}
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Research Request Form</CardTitle>
            <CardDescription>
              Tell us what you'd like to research and how you'd like the information delivered
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Contact Information */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Your Name *</Label>
                <Input 
                  id="name"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="email">Email Address *</Label>
                <Input 
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                />
              </div>
            </div>

            {/* Research Topic */}
            <div>
              <Label htmlFor="topic">Research Topic *</Label>
              <Input 
                id="topic"
                placeholder="e.g., AI trends in healthcare, SaaS marketing strategies, blockchain adoption"
                value={formData.researchTopic}
                onChange={(e) => setFormData({...formData, researchTopic: e.target.value})}
                required
              />
            </div>

            {/* Specific Questions */}
            <div>
              <Label htmlFor="questions">Specific Questions or Focus Areas</Label>
              <Textarea 
                id="questions"
                placeholder="What specific aspects would you like us to focus on? Any particular questions you need answered?"
                rows={3}
                value={formData.specificQuestions}
                onChange={(e) => setFormData({...formData, specificQuestions: e.target.value})}
              />
            </div>

            {/* Industry & Context */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Industry/Sector</Label>
                <Select value={formData.industry} onValueChange={(value) => setFormData({...formData, industry: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent>
                    {RESEARCH_INDUSTRIES.map(industry => (
                      <SelectItem key={industry} value={industry.toLowerCase()}>
                        {industry}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="audience">Target Audience</Label>
                <Input 
                  id="audience"
                  placeholder="e.g., Startup founders, Marketing managers"
                  value={formData.targetAudience}
                  onChange={(e) => setFormData({...formData, targetAudience: e.target.value})}
                />
              </div>
            </div>

            {/* Research Depth */}
            <div>
              <Label>Research Depth Level</Label>
              <Select value={formData.researchDepth} onValueChange={(value) => setFormData({...formData, researchDepth: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="overview">High-Level Overview</SelectItem>
                  <SelectItem value="intermediate">Intermediate Analysis</SelectItem>
                  <SelectItem value="detailed">Deep Dive Research</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Preferred Sources */}
            <div>
              <Label>Preferred Research Sources (optional)</Label>
              <div className="grid md:grid-cols-2 gap-2 mt-2">
                {RESEARCH_SOURCES.map(source => (
                  <div key={source.id} className="flex items-center space-x-2">
                    <Checkbox 
                      id={source.id}
                      checked={formData.preferredSources.includes(source.id)}
                      onCheckedChange={(checked) => handleSourceChange(source.id, checked as boolean)}
                    />
                    <Label htmlFor={source.id}>{source.label}</Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Deliverable Format */}
            <div>
              <Label>How would you like the research delivered?</Label>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3 mt-2">
                {DELIVERABLE_FORMATS.map(format => (
                  <Card 
                    key={format.id}
                    className={`cursor-pointer transition-all ${
                      formData.deliverableFormat === format.id 
                        ? 'border-primary bg-primary/5' 
                        : 'hover:border-primary/50'
                    }`}
                    onClick={() => setFormData({...formData, deliverableFormat: format.id})}
                  >
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl mb-2">{format.icon}</div>
                      <div className="font-medium text-sm mb-1">{format.label}</div>
                      <div className="text-xs text-muted-foreground">{format.description}</div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Additional Context */}
            <div>
              <Label htmlFor="context">Additional Context (Optional)</Label>
              <Textarea 
                id="context"
                placeholder="Any additional context about your business, project, or specific requirements that would help us provide better research"
                rows={3}
                value={formData.context}
                onChange={(e) => setFormData({...formData, context: e.target.value})}
              />
            </div>

            {/* Submit Button */}
            <Button 
              type="submit"
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
              size="lg"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting Request...
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4 mr-2" />
                  Request Free Research (Delivered in 2-4 Hours)
                </>
              )}
            </Button>

            {/* Terms */}
            <p className="text-xs text-muted-foreground text-center">
              By submitting this form, you agree to receive research via email. 
              This is a free service with a limit of 3 requests per user per day.
            </p>
          </CardContent>
        </Card>
      </form>

      {/* Example Research Topics */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5" />
            Example Research Topics
          </CardTitle>
          <CardDescription>Need inspiration? Here are some popular research requests:</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold mb-2">Business & Strategy</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Market size analysis for SaaS products</li>
                <li>• Competitor pricing strategies</li>
                <li>• Digital transformation trends in retail</li>
                <li>• Remote work impact on productivity</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Technology & Innovation</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• AI adoption in small businesses</li>
                <li>• Blockchain use cases beyond crypto</li>
                <li>• Cloud migration best practices</li>
                <li>• Cybersecurity trends for 2025</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}