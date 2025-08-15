import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Zap, Shield, Clock, Wallet } from "lucide-react"
import { InstallPrompt } from "@/components/pwa/install-prompt"
import { OfflineIndicator } from "@/components/pwa/offline-indicator"

export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <InstallPrompt />
      <OfflineIndicator />

      {/* Hero Section */}
      <section className="text-center py-20">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Autonomous Freelancer Agent
            <span className="text-primary"> Platform</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Pay with crypto, get instant delivery. Professional services automated with blockchain payments.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-gradient-orange hover:shadow-orange-lg transition-all duration-300">
              <Link href="/services">
                Browse Services
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/about">Learn More</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Why Choose AgentPay?</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Experience the future of freelance services with automated delivery and secure crypto payments.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader>
              <Zap className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Instant Delivery</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Automated service delivery once payment is confirmed on-chain.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Shield className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Secure Payments</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Smart contract escrow ensures secure transactions with USDC/USDT.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Clock className="h-8 w-8 text-primary mb-2" />
              <CardTitle>24/7 Available</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Autonomous agents work around the clock to deliver your services.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Wallet className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Multi-Chain</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Pay from any wallet on Ethereum, Polygon, BSC, or Avalanche.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Popular Services */}
      <section className="py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Popular Services</h2>
          <p className="text-muted-foreground">Professional services delivered instantly upon payment confirmation.</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="hover:shadow-orange transition-all duration-300">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Logo Design</CardTitle>
                <Badge variant="secondary">$45+</Badge>
              </div>
              <CardDescription>Professional logo concepts with brand guidelines</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• 2-3 design concepts</li>
                <li>• Vector files included</li>
                <li>• 72-hour delivery</li>
                <li>• 2 revisions included</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="hover:shadow-orange transition-all duration-300">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Automation Script</CardTitle>
                <Badge variant="secondary">$60+</Badge>
              </div>
              <CardDescription>Custom Python/Node.js scripts and tools</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Custom script development</li>
                <li>• Documentation included</li>
                <li>• 96-hour delivery</li>
                <li>• Usage examples</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="hover:shadow-orange transition-all duration-300">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Resume Rewrite</CardTitle>
                <Badge variant="secondary">$40+</Badge>
              </div>
              <CardDescription>ATS-optimized resume with professional formatting</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• ATS optimization</li>
                <li>• PDF + DOCX formats</li>
                <li>• 48-hour delivery</li>
                <li>• LinkedIn summary</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-8">
          <Button asChild variant="outline">
            <Link href="/services">View All Services</Link>
          </Button>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-muted-foreground mb-8">
            Connect your wallet and start ordering professional services with instant delivery.
          </p>
          <Button asChild size="lg" className="bg-gradient-orange hover:shadow-orange-lg transition-all duration-300">
            <Link href="/services">
              Start Ordering
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
