"use client"

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Separator } from '@/components/ui/separator'

const PLATFORMS = ["Instagram", "Twitter/X", "LinkedIn", "Facebook", "TikTok", "YouTube Shorts"]
const CONTENT_STYLES = ["Professional & Corporate", "Casual & Friendly", "Trendy & Modern", "Educational", "Inspirational"]
const CONTENT_TYPES = ["Regular Posts", "Stories Content", "Reels/Videos", "Carousel Posts", "Interactive Polls", "Quote Graphics"]
const HASHTAG_OPTIONS = ["Basic (50 hashtags)", "Advanced (150+ hashtags)", "Premium (300+ hashtags)"]

interface SocialMediaFormData {
  platforms: string[]
  contentStyle: string
  contentTypes: string[]
  brandAssets: boolean
  competitorAnalysis: boolean
  hashtagResearch: string
  urgentDelivery: boolean
}

interface SocialMediaFormProps {
  onSubmit: (data: SocialMediaFormData) => void
  isLoading?: boolean
}

export function SocialMediaForm({ onSubmit, isLoading = false }: SocialMediaFormProps) {
  const [formData, setFormData] = useState<SocialMediaFormData>({
    platforms: ["Instagram"],
    contentStyle: "Professional & Corporate",
    contentTypes: ["Regular Posts"],
    brandAssets: false,
    competitorAnalysis: false,
    hashtagResearch: "Basic (50 hashtags)",
    urgentDelivery: false
  })

  const calculatePrice = () => {
    let basePrice = 95
    let totalPrice = basePrice

    // Platform pricing (first platform included, additional $15 each)
    if (formData.platforms.length > 1) {
      totalPrice += (formData.platforms.length - 1) * 15
    }

    // Content style pricing
    if (formData.contentStyle === "Trendy & Modern") totalPrice += 10
    if (formData.contentStyle === "Educational" || formData.contentStyle === "Inspirational") totalPrice += 5

    // Content types pricing ($8 per additional type)
    if (formData.contentTypes.length > 1) {
      totalPrice += (formData.contentTypes.length - 1) * 8
    }

    // Add-ons
    if (formData.brandAssets) totalPrice += 25
    if (formData.competitorAnalysis) totalPrice += 20
    if (formData.hashtagResearch === "Advanced (150+ hashtags)") totalPrice += 15
    if (formData.hashtagResearch === "Premium (300+ hashtags)") totalPrice += 30
    if (formData.urgentDelivery) totalPrice += 40

    return totalPrice
  }

  const handlePlatformToggle = (platform: string) => {
    setFormData(prev => ({
      ...prev,
      platforms: prev.platforms.includes(platform)
        ? prev.platforms.filter(p => p !== platform)
        : [...prev.platforms, platform]
    }))
  }

  const handleContentTypeToggle = (contentType: string) => {
    setFormData(prev => ({
      ...prev,
      contentTypes: prev.contentTypes.includes(contentType)
        ? prev.contentTypes.filter(t => t !== contentType)
        : [...prev.contentTypes, contentType]
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            AI Social Media Manager
            <Badge variant="secondary" className="text-lg px-4 py-2 bg-orange-50 text-orange-700 dark:bg-orange-950 dark:text-orange-300">
              ${calculatePrice()}
            </Badge>
          </CardTitle>
          <CardDescription>
            Complete social media management package with content calendar, posts, and engagement strategy
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Platform Selection */}
          <div>
            <Label className="text-base font-semibold">Social Media Platforms *</Label>
            <p className="text-sm text-muted-foreground mb-3">
              Select platforms for your content (first platform included, +$15 per additional)
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {PLATFORMS.map((platform) => (
                <div key={platform} className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50">
                  <Checkbox
                    checked={formData.platforms.includes(platform)}
                    onCheckedChange={() => handlePlatformToggle(platform)}
                    className="mt-0"
                  />
                  <div className="flex-1">
                    <Label className="text-sm font-medium">{platform}</Label>
                    {platform === "Instagram" && (
                      <Badge variant="outline" className="text-xs ml-2">
                        Popular
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Content Style */}
          <div>
            <Label className="text-base font-semibold">Content Style</Label>
            <p className="text-sm text-muted-foreground mb-3">
              Choose the tone and style for your content
            </p>
            <RadioGroup
              value={formData.contentStyle}
              onValueChange={(value: string) => setFormData(prev => ({ ...prev, contentStyle: value }))}
              className="grid grid-cols-1 md:grid-cols-2 gap-3"
            >
              {CONTENT_STYLES.map((style) => (
                <div key={style} className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50">
                  <RadioGroupItem value={style} id={style} />
                  <Label htmlFor={style} className="text-sm font-medium flex-1">
                    {style}
                    {(style === "Trendy & Modern" && (
                      <Badge variant="outline" className="text-xs ml-2">
                        +$10
                      </Badge>
                    ))}
                    {(style === "Educational" || style === "Inspirational") && (
                      <Badge variant="outline" className="text-xs ml-2">
                        +$5
                      </Badge>
                    )}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <Separator />

          {/* Content Types */}
          <div>
            <Label className="text-base font-semibold">Content Types</Label>
            <p className="text-sm text-muted-foreground mb-3">
              Select content formats (first type included, +$8 per additional)
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {CONTENT_TYPES.map((contentType) => (
                <div key={contentType} className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50">
                  <Checkbox
                    checked={formData.contentTypes.includes(contentType)}
                    onCheckedChange={() => handleContentTypeToggle(contentType)}
                    className="mt-0"
                  />
                  <div className="flex-1">
                    <Label className="text-sm font-medium">{contentType}</Label>
                    {contentType === "Regular Posts" && (
                      <Badge variant="outline" className="text-xs ml-2">
                        Included
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Add-on Services */}
          <div>
            <Label className="text-base font-semibold">Add-on Services</Label>
            <div className="space-y-4 mt-3">
              <div className="flex items-start justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <Label className="font-medium">Brand Asset Creation (+$25)</Label>
                  <p className="text-sm text-muted-foreground">Custom graphics, templates, and visual elements</p>
                </div>
                <Checkbox 
                  checked={formData.brandAssets} 
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, brandAssets: !!checked }))}
                  className="mt-2" 
                />
              </div>

              <div className="flex items-start justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <Label className="font-medium">Competitor Analysis (+$20)</Label>
                  <p className="text-sm text-muted-foreground">Analyze top 5 competitors with insights</p>
                </div>
                <Checkbox 
                  checked={formData.competitorAnalysis} 
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, competitorAnalysis: !!checked }))}
                  className="mt-2" 
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Hashtag Research */}
          <div>
            <Label className="text-base font-semibold">Hashtag Research</Label>
            <RadioGroup
              value={formData.hashtagResearch}
              onValueChange={(value: string) => setFormData(prev => ({ ...prev, hashtagResearch: value }))}
              className="space-y-3 mt-3"
            >
              {HASHTAG_OPTIONS.map((option) => (
                <div key={option} className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50">
                  <RadioGroupItem value={option} id={option} />
                  <Label htmlFor={option} className="text-sm font-medium flex-1">
                    {option}
                    {option === "Advanced (150+ hashtags)" && (
                      <Badge variant="outline" className="text-xs ml-2">
                        +$15
                      </Badge>
                    )}
                    {option === "Premium (300+ hashtags)" && (
                      <Badge variant="outline" className="text-xs ml-2">
                        +$30
                      </Badge>
                    )}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <Separator />

          {/* Rush Delivery */}
          <div>
            <Label className="text-base font-semibold">Delivery Options</Label>
            <div className="mt-3">
              <div className="flex items-start justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <Label className="font-medium">Rush Delivery (+$40)</Label>
                  <p className="text-sm text-muted-foreground">Complete delivery in 2-3 days instead of 4-5 days</p>
                </div>
                <Checkbox 
                  checked={formData.urgentDelivery} 
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, urgentDelivery: !!checked }))}
                  className="mt-2" 
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Package Details */}
          <div className="bg-muted/30 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Package Includes:</h3>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• 30-day content calendar</li>
              <li>• 60 ready-to-post content pieces</li>
              <li>• Custom hashtag strategy</li>
              <li>• Engagement optimization guide</li>
              <li>• Brand voice guidelines</li>
              <li>• Analytics tracking setup</li>
            </ul>
          </div>

          <Button 
            type="submit" 
            className="w-full bg-gradient-orange hover:shadow-orange-lg text-white font-semibold py-3"
            disabled={isLoading || formData.platforms.length === 0}
          >
            {isLoading ? "Processing..." : `Order Social Media Package - $${calculatePrice()}`}
          </Button>
        </CardContent>
      </Card>
    </form>
  )
}