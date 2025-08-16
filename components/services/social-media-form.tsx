"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Separator } from '@/components/ui/separator'
import { CalendarDays, Users, Camera, Hash, Zap, Clock } from 'lucide-react'

interface SocialMediaFormData {
  platforms: string[]
  contentStyle: string
  contentTypes: string[]
  brandAssets: boolean
  competitorAnalysis: boolean
  hashtagResearch: string
  urgentDelivery: boolean
}

const PLATFORMS = [
  { id: 'instagram', name: 'Instagram', icon: Camera, price: 15 },
  { id: 'twitter', name: 'Twitter/X', icon: Hash, price: 15 },
  { id: 'linkedin', name: 'LinkedIn', icon: Users, price: 15 },
  { id: 'facebook', name: 'Facebook', icon: Users, price: 15 },
  { id: 'tiktok', name: 'TikTok', icon: Camera, price: 15 },
  { id: 'youtube', name: 'YouTube Shorts', icon: Camera, price: 15 }
]

const CONTENT_STYLES = [
  { id: 'professional', name: 'Professional & Corporate', price: 0 },
  { id: 'casual', name: 'Casual & Friendly', price: 0 },
  { id: 'trendy', name: 'Trendy & Modern', price: 10 },
  { id: 'educational', name: 'Educational', price: 5 },
  { id: 'inspirational', name: 'Inspirational', price: 5 }
]

const CONTENT_TYPES = [
  { id: 'posts', name: 'Regular Posts', price: 8 },
  { id: 'stories', name: 'Stories Content', price: 8 },
  { id: 'reels', name: 'Reels/Videos', price: 8 },
  { id: 'carousel', name: 'Carousel Posts', price: 8 },
  { id: 'polls', name: 'Interactive Polls', price: 8 },
  { id: 'quotes', name: 'Quote Graphics', price: 8 }
]

const HASHTAG_RESEARCH = [
  { id: 'basic', name: 'Basic (50 hashtags)', price: 0 },
  { id: 'advanced', name: 'Advanced (150+ hashtags)', price: 15 },
  { id: 'premium', name: 'Premium (300+ hashtags)', price: 30 }
]

export function SocialMediaServiceForm() {
  const [formData, setFormData] = useState<SocialMediaFormData>({
    platforms: [],
    contentStyle: 'professional',
    contentTypes: [],
    brandAssets: false,
    competitorAnalysis: false,
    hashtagResearch: 'basic',
    urgentDelivery: false
  })

  const calculatePrice = () => {
    let total = 95 // Base price

    // Platform costs
    total += formData.platforms.length * 15

    // Content style modifier
    const stylePrice = CONTENT_STYLES.find(s => s.id === formData.contentStyle)?.price || 0
    total += stylePrice

    // Content types
    total += formData.contentTypes.length * 8

    // Add-ons
    if (formData.brandAssets) total += 25
    if (formData.competitorAnalysis) total += 20
    
    // Hashtag research
    const hashtagPrice = HASHTAG_RESEARCH.find(h => h.id === formData.hashtagResearch)?.price || 0
    total += hashtagPrice

    if (formData.urgentDelivery) total += 40

    return total
  }

  const handlePlatformToggle = (platformId: string) => {
    setFormData(prev => ({
      ...prev,
      platforms: prev.platforms.includes(platformId)
        ? prev.platforms.filter(p => p !== platformId)
        : [...prev.platforms, platformId]
    }))
  }

  const handleContentTypeToggle = (typeId: string) => {
    setFormData(prev => ({
      ...prev,
      contentTypes: prev.contentTypes.includes(typeId)
        ? prev.contentTypes.filter(t => t !== typeId)
        : [...prev.contentTypes, typeId]
    }))
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <Card className="border-orange-200 dark:border-orange-800">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-gradient-orange">AI Social Media Manager</CardTitle>
          <CardDescription className="text-lg">
            Complete social media management package with AI-generated content
          </CardDescription>
          <div className="flex justify-center">
            <Badge variant="secondary" className="text-lg px-4 py-2 bg-orange-50 text-orange-700 dark:bg-orange-950 dark:text-orange-300">
              ${calculatePrice()} USDC
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Platform Selection */}
          <div className="space-y-4">
            <Label className="text-lg font-semibold flex items-center gap-2">
              <Users className="h-5 w-5 text-orange-500" />
              Social Media Platforms
            </Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {PLATFORMS.map((platform) => {
                const Icon = platform.icon
                return (
                  <div
                    key={platform.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                      formData.platforms.includes(platform.id)
                        ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/20'
                        : 'border-border hover:border-orange-300'
                    }`}
                    onClick={() => handlePlatformToggle(platform.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        <span className="font-medium">{platform.name}</span>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        +${platform.price}
                      </Badge>
                    </div>
                    <Checkbox
                      checked={formData.platforms.includes(platform.id)}
                      className="mt-2"
                      readOnly
                    />
                  </div>
                )
              })}
            </div>
          </div>

          <Separator />

          {/* Content Style */}
          <div className="space-y-4">
            <Label className="text-lg font-semibold">Content Style</Label>
            <RadioGroup
              value={formData.contentStyle}
              onValueChange={(value) => setFormData(prev => ({ ...prev, contentStyle: value }))}
              className="grid grid-cols-1 sm:grid-cols-2 gap-3"
            >
              {CONTENT_STYLES.map((style) => (
                <div key={style.id} className="flex items-center space-x-2 p-3 border rounded-lg">
                  <RadioGroupItem value={style.id} id={style.id} />
                  <Label htmlFor={style.id} className="flex-1 cursor-pointer">
                    <div className="flex justify-between items-center">
                      <span>{style.name}</span>
                      {style.price > 0 && (
                        <Badge variant="outline" className="text-xs">
                          +${style.price}
                        </Badge>
                      )}
                    </div>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <Separator />

          {/* Content Types */}
          <div className="space-y-4">
            <Label className="text-lg font-semibold flex items-center gap-2">
              <Camera className="h-5 w-5 text-orange-500" />
              Content Types
            </Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {CONTENT_TYPES.map((type) => (
                <div
                  key={type.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-all ${
                    formData.contentTypes.includes(type.id)
                      ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/20'
                      : 'border-border hover:border-orange-300'
                  }`}
                  onClick={() => handleContentTypeToggle(type.id)}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{type.name}</span>
                    <Badge variant="outline" className="text-xs">
                      +${type.price}
                    </Badge>
                  </div>
                  <Checkbox
                    checked={formData.contentTypes.includes(type.id)}
                    className="mt-2"
                    readOnly
                  />
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Add-on Services */}
          <div className="space-y-4">
            <Label className="text-lg font-semibold">Add-on Services</Label>
            <div className="space-y-3">
              <div
                className={`p-4 border rounded-lg cursor-pointer transition-all ${
                  formData.brandAssets
                    ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/20'
                    : 'border-border hover:border-orange-300'
                }`}
                onClick={() => setFormData(prev => ({ ...prev, brandAssets: !prev.brandAssets }))}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Brand Asset Creation</div>
                    <div className="text-sm text-muted-foreground">
                      Custom graphics, templates, and visual elements
                    </div>
                  </div>
                  <Badge variant="outline">+$25</Badge>
                </div>
                <Checkbox checked={formData.brandAssets} className="mt-2" readOnly />
              </div>

              <div
                className={`p-4 border rounded-lg cursor-pointer transition-all ${
                  formData.competitorAnalysis
                    ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/20'
                    : 'border-border hover:border-orange-300'
                }`}
                onClick={() => setFormData(prev => ({ ...prev, competitorAnalysis: !prev.competitorAnalysis }))}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Competitor Analysis</div>
                    <div className="text-sm text-muted-foreground">
                      Analyze top 5 competitors with insights
                    </div>
                  </div>
                  <Badge variant="outline">+$20</Badge>
                </div>
                <Checkbox checked={formData.competitorAnalysis} className="mt-2" readOnly />
              </div>
            </div>
          </div>

          <Separator />

          {/* Hashtag Research */}
          <div className="space-y-4">
            <Label className="text-lg font-semibold flex items-center gap-2">
              <Hash className="h-5 w-5 text-orange-500" />
              Hashtag Research
            </Label>
            <RadioGroup
              value={formData.hashtagResearch}
              onValueChange={(value) => setFormData(prev => ({ ...prev, hashtagResearch: value }))}
              className="space-y-3"
            >
              {HASHTAG_RESEARCH.map((option) => (
                <div key={option.id} className="flex items-center space-x-2 p-3 border rounded-lg">
                  <RadioGroupItem value={option.id} id={option.id} />
                  <Label htmlFor={option.id} className="flex-1 cursor-pointer">
                    <div className="flex justify-between items-center">
                      <span>{option.name}</span>
                      {option.price > 0 && (
                        <Badge variant="outline" className="text-xs">
                          +${option.price}
                        </Badge>
                      )}
                    </div>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <Separator />

          {/* Delivery Options */}
          <div className="space-y-4">
            <Label className="text-lg font-semibold flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-500" />
              Delivery Options
            </Label>
            <div
              className={`p-4 border rounded-lg cursor-pointer transition-all ${
                formData.urgentDelivery
                  ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/20'
                  : 'border-border hover:border-orange-300'
              }`}
              onClick={() => setFormData(prev => ({ ...prev, urgentDelivery: !prev.urgentDelivery }))}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium flex items-center gap-2">
                    <Zap className="h-4 w-4 text-yellow-500" />
                    Rush Delivery (2-3 days)
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Priority processing for urgent campaigns
                  </div>
                </div>
                <Badge variant="outline">+$40</Badge>
              </div>
              <Checkbox checked={formData.urgentDelivery} className="mt-2" readOnly />
            </div>
          </div>

          <Separator />

          {/* Deliverables Summary */}
          <div className="bg-orange-50 dark:bg-orange-950/20 p-6 rounded-lg">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-orange-500" />
              What You'll Receive
            </h3>
            <ul className="space-y-2 text-sm">
              <li>• 30-day content calendar tailored to your brand</li>
              <li>• 60 ready-to-post content pieces</li>
              <li>• Custom hashtag strategy for each platform</li>
              <li>• Engagement optimization guide</li>
              <li>• Brand voice guidelines and style guide</li>
              <li>• Analytics tracking setup and KPI recommendations</li>
              {formData.brandAssets && <li>• Custom brand assets and templates</li>}
              {formData.competitorAnalysis && <li>• Comprehensive competitor analysis report</li>}
            </ul>
          </div>

          {/* Action Button */}
          <div className="text-center">
            <Button 
              size="lg" 
              className="bg-gradient-orange hover:shadow-orange-lg w-full sm:w-auto min-w-[200px]"
              disabled={formData.platforms.length === 0 || formData.contentTypes.length === 0}
            >
              Order Social Media Package - ${calculatePrice()} USDC
            </Button>
            <p className="text-sm text-muted-foreground mt-2">
              Delivery: {formData.urgentDelivery ? '2-3 days' : '4-5 days'}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}