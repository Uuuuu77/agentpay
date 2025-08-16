import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Github, Linkedin, Twitter, Mail, Code, Zap, Users, Target } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      {/* Hero Section */}
      <section className="text-center py-20">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            About <span className="text-gradient-orange">AgentPay</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Revolutionizing freelance services with autonomous AI agents and blockchain payments
          </p>
        </div>
      </section>

      {/* Founder Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto">
          <Card className="p-8">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <div className="w-48 h-48 mx-auto md:mx-0 rounded-full bg-gradient-orange p-1">
                  <div className="w-full h-full rounded-full bg-background flex items-center justify-center">
                    <div className="w-44 h-44 rounded-full bg-gradient-orange flex items-center justify-center text-white text-6xl font-bold">
                      JN
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <h2 className="text-3xl font-bold mb-4">John Njuguna</h2>
                <Badge className="mb-4">Founder & Lead Engineer</Badge>
                <p className="text-muted-foreground mb-6">
                  John Njuguna is a visionary software engineer and entrepreneur passionate about the intersection 
                  of AI, blockchain technology, and the future of work. With extensive experience in full-stack 
                  development and a deep understanding of decentralized systems, John founded AgentPay to solve 
                  the inefficiencies in the traditional freelance marketplace.
                </p>
                <div className="flex gap-4">
                  <Button variant="outline" size="sm" asChild>
                    <Link href="https://github.com/johnnjuguna" target="_blank">
                      <Github className="w-4 h-4 mr-2" />
                      GitHub
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="https://linkedin.com/in/johnnjuguna" target="_blank">
                      <Linkedin className="w-4 h-4 mr-2" />
                      LinkedIn
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="mailto:john@agentpay.com">
                      <Mail className="w-4 h-4 mr-2" />
                      Contact
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Our Mission</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="text-center p-6">
              <Zap className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Instant Delivery</h3>
              <p className="text-sm text-muted-foreground">
                Eliminate waiting times with AI-powered service automation
              </p>
            </Card>
            <Card className="text-center p-6">
              <Code className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Quality Assured</h3>
              <p className="text-sm text-muted-foreground">
                Professional-grade outputs powered by advanced AI models
              </p>
            </Card>
            <Card className="text-center p-6">
              <Users className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Accessible</h3>
              <p className="text-sm text-muted-foreground">
                High-quality services available 24/7 to everyone
              </p>
            </Card>
            <Card className="text-center p-6">
              <Target className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Transparent</h3>
              <p className="text-sm text-muted-foreground">
                Blockchain-powered transparency and secure payments
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* What AgentPay Does */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">What AgentPay Does</h2>
          <Card className="p-8">
            <CardContent className="prose max-w-none">
              <p className="text-lg leading-relaxed mb-6">
                AgentPay is the world's first autonomous freelancer agent platform that combines artificial 
                intelligence with blockchain technology to deliver professional services instantly.
              </p>
              
              <h3 className="text-xl font-semibold mb-4">How It Works:</h3>
              <ol className="list-decimal list-inside space-y-3 mb-6">
                <li><strong>Browse Services:</strong> Choose from 12+ professional AI-powered services</li>
                <li><strong>Pay with Crypto:</strong> Secure payments using USDC/USDT on multiple blockchains</li>
                <li><strong>Instant Processing:</strong> AI agents automatically start work upon payment confirmation</li>
                <li><strong>Automated Delivery:</strong> Receive professional results via email and downloadable files</li>
              </ol>

              <h3 className="text-xl font-semibold mb-4">Available Services:</h3>
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <ul className="space-y-2">
                  <li>• Logo & Graphic Design</li>
                  <li>• Website Development</li>
                  <li>• AI Prompt Engineering</li>
                  <li>• Data Analysis & Visualization</li>
                  <li>• Business Plan Creation</li>
                  <li>• LinkedIn Profile Optimization</li>
                </ul>
                <ul className="space-y-2">
                  <li>• Email Marketing Campaigns</li>
                  <li>• Resume & CV Writing</li>
                  <li>• Bug Fixing & Code Review</li>
                  <li>• SaaS Startup Kit</li>
                  <li>• Content Writing</li>
                  <li>• Technical Consultation</li>
                </ul>
              </div>

              <p className="text-lg leading-relaxed">
                By eliminating the traditional freelancer marketplace friction, AgentPay enables instant access 
                to professional services at competitive prices, powered by cutting-edge AI technology and secured 
                by blockchain payments.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">Ready to Experience the Future?</h2>
          <p className="text-muted-foreground mb-8">
            Join thousands of users who are already enjoying instant, professional services.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-gradient-orange hover:shadow-orange-lg">
              <Link href="/services">
                Try AgentPay Now
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="mailto:john@agentpay.com">
                Contact John
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}