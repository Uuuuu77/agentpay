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
            Choose from 12 professional services. Pay with crypto, get instant delivery. Automated with blockchain
            payments.
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
                Pay from any wallet on Ethereum, Polygon, BSC, Avalanche, or Base.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Popular Services */}
      <section className="py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Featured Services</h2>
          <p className="text-muted-foreground">Premium AI-powered services for businesses and professionals.</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="hover:shadow-orange transition-all duration-300 border-orange-200">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>SaaS Startup Kit</CardTitle>
                <Badge className="bg-orange-100 text-orange-800">$150+</Badge>
              </div>
              <CardDescription>Complete startup package with pitch deck and business plan</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Professional pitch deck</li>
                <li>• Business plan & MVP specs</li>
                <li>• Market analysis</li>
                <li>• 7-day delivery</li>
              </ul>
              <Button asChild className="w-full mt-4" size="sm">
                <Link href="/services/saas">Order Now</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-orange transition-all duration-300">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Data Analysis</CardTitle>
                <Badge variant="secondary">$95+</Badge>
              </div>
              <CardDescription>Professional data analysis with insights and visualizations</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Statistical analysis</li>
                <li>• Professional charts</li>
                <li>• AI-powered insights</li>
                <li>• 4-day delivery</li>
              </ul>
              <Button asChild className="w-full mt-4" size="sm">
                <Link href="/services/data">Order Now</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-orange transition-all duration-300">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Landing Page</CardTitle>
                <Badge variant="secondary">$85+</Badge>
              </div>
              <CardDescription>Custom responsive landing page with modern design</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• HTML/CSS/JS files</li>
                <li>• Mobile responsive</li>
                <li>• SEO optimized</li>
                <li>• 5-day delivery</li>
              </ul>
              <Button asChild className="w-full mt-4" size="sm">
                <Link href="/services/website">Order Now</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-orange transition-all duration-300">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Bug Fix & Review</CardTitle>
                <Badge variant="secondary">$75+</Badge>
              </div>
              <CardDescription>Professional debugging and code optimization</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Code debugging</li>
                <li>• Full code review</li>
                <li>• Test cases included</li>
                <li>• 3-day delivery</li>
              </ul>
              <Button asChild className="w-full mt-4" size="sm">
                <Link href="/services/bugfix">Order Now</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-orange transition-all duration-300">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>LinkedIn Makeover</CardTitle>
                <Badge variant="secondary">$65+</Badge>
              </div>
              <CardDescription>Complete LinkedIn profile optimization</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Profile optimization</li>
                <li>• Content strategy</li>
                <li>• Post templates</li>
                <li>• 2-day delivery</li>
              </ul>
              <Button asChild className="w-full mt-4" size="sm">
                <Link href="/services/linkedin">Order Now</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-orange transition-all duration-300">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Email Marketing</CardTitle>
                <Badge variant="secondary">$55+</Badge>
              </div>
              <CardDescription>Complete email marketing campaign series</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Email sequences</li>
                <li>• HTML templates</li>
                <li>• A/B test recommendations</li>
                <li>• 3-day delivery</li>
              </ul>
              <Button asChild className="w-full mt-4" size="sm">
                <Link href="/services/email">Order Now</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-8">
          <Button asChild variant="outline">
            <Link href="/services">View All 12 Services</Link>
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
