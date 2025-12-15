import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Plus, Check, Lock, Sparkles, TrendingUp, Users, 
  Mail, Bell, MessageSquare, Smartphone, Loader2, 
  Package, Tag, Palette, Rocket, Edit3, RefreshCw, CheckCircle,
  ChevronRight, AlertTriangle, Shield, Target, Zap, Eye,
  Calendar, Globe, ShoppingBag, BarChart3, ArrowRight
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

type CampaignStep = 'context' | 'segment' | 'product' | 'promo' | 'creative' | 'review'

interface Campaign {
  id: string
  name: string
  status: 'draft' | 'active' | 'completed'
  currentStep: CampaignStep
  lockedSteps: CampaignStep[]
  goal: string
  category: string | null
  channel: string | null
  region: string | null
  derivedContext?: {
    campaignType: string
    campaignName: string
    risks: string[]
    guardrails: string[]
    estimatedUniverse: number
    marginProtection: string | null
    seasonality: string | null
  }
  audienceStrategy?: {
    segments: { id: string; name: string; size: number; percentage: number; description: string; logic: string }[]
    totalCoverage: number
    segmentationLayers: string[]
  }
  offerMapping?: {
    segmentId: string
    segmentName: string
    productGroup: string
    promotion: string
    promoValue: string
    expectedLift: number
    marginImpact: number
    overstockCoverage: number
  }[]
  creatives?: {
    id: string
    segmentId: string
    segmentName: string
    headline: string
    subcopy: string
    cta: string
    tone: string
    hasOffer: boolean
    offerBadge?: string
    complianceStatus: string
    reasoning: string
    image: string
    approved: boolean
  }[]
}

const CATEGORIES = ['Apparel', 'Electronics', 'Home & Garden', 'Beauty', 'Sports']
const CHANNELS = [
  { id: 'email', label: 'Email', icon: Mail },
  { id: 'push', label: 'Push', icon: Bell },
  { id: 'sms', label: 'SMS', icon: MessageSquare },
  { id: 'in-app', label: 'In-App', icon: Smartphone },
]
const REGIONS = ['North America', 'Europe', 'Asia Pacific', 'Latin America']

// Goal suggestions by category
const GOAL_SUGGESTIONS: Record<string, { goal: string; icon: string }[]> = {
  'Apparel': [
    { goal: 'Clear excess summer inventory before fall arrivals while protecting brand margins', icon: '👗' },
    { goal: 'Drive full-price sales for new winter collection launch', icon: '🧥' },
    { goal: 'Re-engage lapsed customers with personalized style recommendations', icon: '✨' },
  ],
  'Electronics': [
    { goal: 'Promote new smartphone accessories to recent device buyers', icon: '📱' },
    { goal: 'Clear last-gen inventory before new model release', icon: '💻' },
    { goal: 'Upsell extended warranties to high-value electronics purchasers', icon: '🔌' },
  ],
  'Home & Garden': [
    { goal: 'Boost outdoor furniture sales for spring season', icon: '🌿' },
    { goal: 'Cross-sell home decor to recent furniture buyers', icon: '🏠' },
    { goal: 'Promote smart home devices to tech-savvy homeowners', icon: '💡' },
  ],
  'Beauty': [
    { goal: 'Launch new skincare line to loyal beauty customers', icon: '✨' },
    { goal: 'Drive subscription sign-ups for replenishment products', icon: '💄' },
    { goal: 'Re-engage dormant customers with personalized beauty picks', icon: '🌸' },
  ],
  'Sports': [
    { goal: 'Promote fitness gear for New Year resolution shoppers', icon: '🏃' },
    { goal: 'Clear seasonal sports equipment before next season', icon: '⚽' },
    { goal: 'Cross-sell nutrition products to active wear buyers', icon: '💪' },
  ],
  'default': [
    { goal: 'Increase customer engagement with personalized offers', icon: '🎯' },
    { goal: 'Drive repeat purchases from one-time buyers', icon: '🔄' },
    { goal: 'Re-activate dormant customers with win-back campaign', icon: '💫' },
  ]
}

const STEPS: { id: CampaignStep; label: string; icon: React.ElementType }[] = [
  { id: 'context', label: 'Context', icon: Target },
  { id: 'segment', label: 'Segment', icon: Users },
  { id: 'product', label: 'Product', icon: Package },
  { id: 'promo', label: 'Promo', icon: Tag },
  { id: 'creative', label: 'Creative', icon: Palette },
  { id: 'review', label: 'Review', icon: Rocket },
]

const deriveContext = (goal: string, category: string) => {
  const isClearance = goal.toLowerCase().includes('clear') || goal.toLowerCase().includes('inventory')
  return {
    campaignType: isClearance ? 'Clearance Push' : 'Full-Price Promotion',
    campaignName: isClearance ? `${category} Clearance Campaign` : `${category} Engagement Campaign`,
    risks: isClearance 
      ? ['Margin dilution on high-value items', 'Brand perception risk', 'Cannibalization of full-price'] 
      : ['Lower conversion without discount', 'Competition from clearance'],
    guardrails: isClearance 
      ? ['Cap discount at 40% for premium', 'Exclude new arrivals', 'Min margin: 25%'] 
      : ['Focus on value messaging', 'Highlight exclusivity'],
    estimatedUniverse: Math.floor(Math.random() * 100000) + 150000,
    marginProtection: null,
    seasonality: null
  }
}

// Category-specific segments
const CATEGORY_SEGMENTS: Record<string, { id: string; name: string; size: number; percentage: number; description: string; logic: string }[]> = {
  'Apparel': [
    { id: 'seg-1', name: 'Fashion Forward VIPs', size: 52300, percentage: 21.2, description: 'High spenders who buy new arrivals within 2 weeks', logic: 'statistical' },
    { id: 'seg-2', name: 'Seasonal Shoppers', size: 78400, percentage: 31.8, description: 'Purchase primarily during sales and season changes', logic: 'rule-based' },
    { id: 'seg-3', name: 'Basics Loyalists', size: 34200, percentage: 13.9, description: 'Repeat buyers of core wardrobe essentials', logic: 'statistical' },
    { id: 'seg-4', name: 'Trend Explorers', size: 41500, percentage: 16.8, description: 'Browse frequently, buy selectively', logic: 'rule-based' },
  ],
  'Electronics': [
    { id: 'seg-1', name: 'Tech Enthusiasts', size: 38900, percentage: 19.5, description: 'Early adopters who upgrade frequently', logic: 'statistical' },
    { id: 'seg-2', name: 'Practical Upgraders', size: 67200, percentage: 33.7, description: 'Replace devices when necessary, value reliability', logic: 'rule-based' },
    { id: 'seg-3', name: 'Accessory Collectors', size: 45600, percentage: 22.9, description: 'Buy add-ons and accessories regularly', logic: 'statistical' },
    { id: 'seg-4', name: 'Deal Hunters', size: 29800, percentage: 14.9, description: 'Wait for major sales and promotions', logic: 'rule-based' },
  ],
  'Home & Garden': [
    { id: 'seg-1', name: 'Home Renovators', size: 31200, percentage: 17.4, description: 'Large basket buyers doing room makeovers', logic: 'statistical' },
    { id: 'seg-2', name: 'Seasonal Decorators', size: 58900, percentage: 32.8, description: 'Update decor with seasons and holidays', logic: 'rule-based' },
    { id: 'seg-3', name: 'Garden Enthusiasts', size: 42100, percentage: 23.5, description: 'Regular outdoor and plant purchases', logic: 'statistical' },
    { id: 'seg-4', name: 'Smart Home Adopters', size: 28400, percentage: 15.8, description: 'Interested in connected home devices', logic: 'rule-based' },
  ],
  'Beauty': [
    { id: 'seg-1', name: 'Beauty Insiders', size: 48700, percentage: 24.1, description: 'Try new products, follow trends', logic: 'statistical' },
    { id: 'seg-2', name: 'Skincare Devotees', size: 56300, percentage: 27.9, description: 'Consistent skincare routine buyers', logic: 'rule-based' },
    { id: 'seg-3', name: 'Makeup Enthusiasts', size: 39200, percentage: 19.4, description: 'Color cosmetics collectors', logic: 'statistical' },
    { id: 'seg-4', name: 'Clean Beauty Seekers', size: 34800, percentage: 17.2, description: 'Prefer natural and organic products', logic: 'rule-based' },
  ],
  'Sports': [
    { id: 'seg-1', name: 'Fitness Fanatics', size: 44500, percentage: 22.8, description: 'Regular gym-goers, buy performance gear', logic: 'statistical' },
    { id: 'seg-2', name: 'Weekend Warriors', size: 62300, percentage: 31.9, description: 'Casual athletes, seasonal activity spikes', logic: 'rule-based' },
    { id: 'seg-3', name: 'Team Sports Parents', size: 38900, percentage: 19.9, description: 'Buy for kids sports activities', logic: 'statistical' },
    { id: 'seg-4', name: 'Outdoor Adventurers', size: 29700, percentage: 15.2, description: 'Hiking, camping, outdoor activities', logic: 'rule-based' },
  ],
}

// Category-specific offers
const CATEGORY_OFFERS: Record<string, { segmentId: string; segmentName: string; productGroup: string; promotion: string; promoValue: string; expectedLift: number; marginImpact: number; overstockCoverage: number }[]> = {
  'Apparel': [
    { segmentId: 'seg-1', segmentName: 'Fashion Forward VIPs', productGroup: 'New Arrivals Premium', promotion: 'VIP First Look 20%', promoValue: '20% OFF', expectedLift: 92, marginImpact: -10, overstockCoverage: 0 },
    { segmentId: 'seg-2', segmentName: 'Seasonal Shoppers', productGroup: 'End of Season Styles', promotion: 'Season Finale 40%', promoValue: '40% OFF', expectedLift: 78, marginImpact: -18, overstockCoverage: 85 },
    { segmentId: 'seg-3', segmentName: 'Basics Loyalists', productGroup: 'Core Essentials', promotion: 'Stock Up & Save', promoValue: 'Buy 3 Get 1', expectedLift: 65, marginImpact: -8, overstockCoverage: 42 },
    { segmentId: 'seg-4', segmentName: 'Trend Explorers', productGroup: 'Trending Now', promotion: 'Try Something New', promoValue: '15% OFF First', expectedLift: 71, marginImpact: -6, overstockCoverage: 28 },
  ],
  'Electronics': [
    { segmentId: 'seg-1', segmentName: 'Tech Enthusiasts', productGroup: 'Latest Gadgets', promotion: 'Early Adopter Bonus', promoValue: '$50 OFF + Gift', expectedLift: 88, marginImpact: -12, overstockCoverage: 0 },
    { segmentId: 'seg-2', segmentName: 'Practical Upgraders', productGroup: 'Certified Refurbished', promotion: 'Smart Upgrade Deal', promoValue: '25% OFF', expectedLift: 74, marginImpact: -14, overstockCoverage: 72 },
    { segmentId: 'seg-3', segmentName: 'Accessory Collectors', productGroup: 'Cases & Chargers', promotion: 'Bundle & Save', promoValue: 'Buy 2 Get 30%', expectedLift: 82, marginImpact: -9, overstockCoverage: 56 },
    { segmentId: 'seg-4', segmentName: 'Deal Hunters', productGroup: 'Last Gen Models', promotion: 'Clearance Blowout', promoValue: 'Up to 50% OFF', expectedLift: 91, marginImpact: -22, overstockCoverage: 94 },
  ],
  'Home & Garden': [
    { segmentId: 'seg-1', segmentName: 'Home Renovators', productGroup: 'Furniture Collections', promotion: 'Room Makeover 20%', promoValue: '20% OFF $500+', expectedLift: 76, marginImpact: -11, overstockCoverage: 38 },
    { segmentId: 'seg-2', segmentName: 'Seasonal Decorators', productGroup: 'Seasonal Decor', promotion: 'Refresh Your Space', promoValue: '30% OFF Decor', expectedLift: 84, marginImpact: -15, overstockCoverage: 78 },
    { segmentId: 'seg-3', segmentName: 'Garden Enthusiasts', productGroup: 'Plants & Planters', promotion: 'Spring Garden Sale', promoValue: 'Buy 2 Get 1 Free', expectedLift: 79, marginImpact: -12, overstockCoverage: 45 },
    { segmentId: 'seg-4', segmentName: 'Smart Home Adopters', productGroup: 'Smart Devices', promotion: 'Connected Home Bundle', promoValue: '$75 OFF Bundle', expectedLift: 68, marginImpact: -8, overstockCoverage: 22 },
  ],
  'Beauty': [
    { segmentId: 'seg-1', segmentName: 'Beauty Insiders', productGroup: 'New Launches', promotion: 'Insider Early Access', promoValue: 'Free Gift + 15%', expectedLift: 94, marginImpact: -13, overstockCoverage: 0 },
    { segmentId: 'seg-2', segmentName: 'Skincare Devotees', productGroup: 'Skincare Essentials', promotion: 'Routine Restock', promoValue: '25% OFF Skincare', expectedLift: 81, marginImpact: -10, overstockCoverage: 35 },
    { segmentId: 'seg-3', segmentName: 'Makeup Enthusiasts', productGroup: 'Color Cosmetics', promotion: 'Palette Perfection', promoValue: 'Buy 2 Get 1', expectedLift: 77, marginImpact: -14, overstockCoverage: 52 },
    { segmentId: 'seg-4', segmentName: 'Clean Beauty Seekers', productGroup: 'Natural & Organic', promotion: 'Clean Beauty Week', promoValue: '20% OFF Clean', expectedLift: 72, marginImpact: -9, overstockCoverage: 28 },
  ],
  'Sports': [
    { segmentId: 'seg-1', segmentName: 'Fitness Fanatics', productGroup: 'Performance Gear', promotion: 'Pro Performance 20%', promoValue: '20% OFF Gear', expectedLift: 86, marginImpact: -11, overstockCoverage: 32 },
    { segmentId: 'seg-2', segmentName: 'Weekend Warriors', productGroup: 'Casual Activewear', promotion: 'Weekend Ready Sale', promoValue: 'Buy 2 Save 25%', expectedLift: 73, marginImpact: -12, overstockCoverage: 48 },
    { segmentId: 'seg-3', segmentName: 'Team Sports Parents', productGroup: 'Youth Equipment', promotion: 'Back to Sports', promoValue: '30% OFF Youth', expectedLift: 89, marginImpact: -16, overstockCoverage: 65 },
    { segmentId: 'seg-4', segmentName: 'Outdoor Adventurers', productGroup: 'Outdoor Essentials', promotion: 'Adventure Awaits', promoValue: '$40 OFF $150+', expectedLift: 71, marginImpact: -10, overstockCoverage: 38 },
  ],
}

// Category-specific creatives with diverse images
const CATEGORY_CREATIVES: Record<string, { id: string; segmentId: string; segmentName: string; headline: string; subcopy: string; cta: string; tone: string; hasOffer: boolean; offerBadge: string; complianceStatus: string; reasoning: string; image: string; approved: boolean }[]> = {
  'Apparel': [
    { id: 'cr-1', segmentId: 'seg-1', segmentName: 'Fashion Forward VIPs', headline: 'VIP First Look: New Arrivals', subcopy: 'Be the first to shop our latest collection', cta: 'Shop New In', tone: 'Exclusive', hasOffer: true, offerBadge: '20% OFF', complianceStatus: 'approved', reasoning: 'Exclusivity drives VIP engagement and early adoption', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600', approved: false },
    { id: 'cr-2', segmentId: 'seg-2', segmentName: 'Seasonal Shoppers', headline: 'Season Finale: Up to 40% OFF', subcopy: 'Last chance to grab summer favorites', cta: 'Shop the Sale', tone: 'Urgent', hasOffer: true, offerBadge: '40% OFF', complianceStatus: 'approved', reasoning: 'Urgency messaging aligns with seasonal shopping behavior', image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=600', approved: false },
    { id: 'cr-3', segmentId: 'seg-3', segmentName: 'Basics Loyalists', headline: 'Stock Up on Essentials', subcopy: 'Your favorite basics, now with bonus savings', cta: 'Build Your Wardrobe', tone: 'Practical', hasOffer: true, offerBadge: 'Buy 3 Get 1', complianceStatus: 'approved', reasoning: 'Value-focused messaging for repeat essentials buyers', image: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=600', approved: false },
    { id: 'cr-4', segmentId: 'seg-4', segmentName: 'Trend Explorers', headline: 'Trending Now: Your Style Awaits', subcopy: 'Discover what everyone is wearing', cta: 'Explore Trends', tone: 'Inspiring', hasOffer: true, offerBadge: '15% OFF', complianceStatus: 'pending', reasoning: 'Discovery-focused for browsers who need a push', image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=600', approved: false },
  ],
  'Electronics': [
    { id: 'cr-1', segmentId: 'seg-1', segmentName: 'Tech Enthusiasts', headline: 'Be First: New Tech Just Dropped', subcopy: 'Early adopter exclusive with bonus gift', cta: 'Get It First', tone: 'Exciting', hasOffer: true, offerBadge: '$50 OFF + Gift', complianceStatus: 'approved', reasoning: 'Early access appeals to tech-forward customers', image: 'https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=600', approved: false },
    { id: 'cr-2', segmentId: 'seg-2', segmentName: 'Practical Upgraders', headline: 'Smart Upgrade, Smart Savings', subcopy: 'Certified quality at unbeatable prices', cta: 'Upgrade Now', tone: 'Trustworthy', hasOffer: true, offerBadge: '25% OFF', complianceStatus: 'approved', reasoning: 'Value and reliability messaging for practical buyers', image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600', approved: false },
    { id: 'cr-3', segmentId: 'seg-3', segmentName: 'Accessory Collectors', headline: 'Complete Your Setup', subcopy: 'Bundle your favorites and save more', cta: 'Build Your Bundle', tone: 'Helpful', hasOffer: true, offerBadge: 'Buy 2 Get 30%', complianceStatus: 'approved', reasoning: 'Cross-sell opportunity for accessory enthusiasts', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600', approved: false },
    { id: 'cr-4', segmentId: 'seg-4', segmentName: 'Deal Hunters', headline: 'Clearance Alert: Up to 50% OFF', subcopy: 'Premium tech at outlet prices', cta: 'Grab the Deal', tone: 'Urgent', hasOffer: true, offerBadge: 'Up to 50% OFF', complianceStatus: 'pending', reasoning: 'Deep discount messaging for price-sensitive segment', image: 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=600', approved: false },
  ],
  'Home & Garden': [
    { id: 'cr-1', segmentId: 'seg-1', segmentName: 'Home Renovators', headline: 'Transform Your Space', subcopy: 'Big savings on your room makeover', cta: 'Start Your Project', tone: 'Inspiring', hasOffer: true, offerBadge: '20% OFF $500+', complianceStatus: 'approved', reasoning: 'Project-focused messaging for high-intent renovators', image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600', approved: false },
    { id: 'cr-2', segmentId: 'seg-2', segmentName: 'Seasonal Decorators', headline: 'Refresh for the Season', subcopy: 'New decor to brighten your home', cta: 'Shop Seasonal', tone: 'Fresh', hasOffer: true, offerBadge: '30% OFF Decor', complianceStatus: 'approved', reasoning: 'Seasonal refresh aligns with decorating habits', image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600', approved: false },
    { id: 'cr-3', segmentId: 'seg-3', segmentName: 'Garden Enthusiasts', headline: 'Grow Your Garden Dreams', subcopy: 'Everything you need to bloom', cta: 'Shop Garden', tone: 'Nurturing', hasOffer: true, offerBadge: 'Buy 2 Get 1', complianceStatus: 'approved', reasoning: 'Passion-driven messaging for garden lovers', image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600', approved: false },
    { id: 'cr-4', segmentId: 'seg-4', segmentName: 'Smart Home Adopters', headline: 'Make Your Home Smarter', subcopy: 'Connected living starts here', cta: 'Explore Smart Home', tone: 'Modern', hasOffer: true, offerBadge: '$75 OFF Bundle', complianceStatus: 'pending', reasoning: 'Tech-forward messaging for smart home interest', image: 'https://images.unsplash.com/photo-1558002038-1055907df827?w=600', approved: false },
  ],
  'Beauty': [
    { id: 'cr-1', segmentId: 'seg-1', segmentName: 'Beauty Insiders', headline: 'Insider Access: New Launches', subcopy: 'Try it before everyone else + free gift', cta: 'Get Early Access', tone: 'Exclusive', hasOffer: true, offerBadge: 'Free Gift + 15%', complianceStatus: 'approved', reasoning: 'Exclusivity and newness drive insider engagement', image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600', approved: false },
    { id: 'cr-2', segmentId: 'seg-2', segmentName: 'Skincare Devotees', headline: 'Restock Your Routine', subcopy: 'Your skincare favorites, now on sale', cta: 'Shop Skincare', tone: 'Caring', hasOffer: true, offerBadge: '25% OFF', complianceStatus: 'approved', reasoning: 'Routine-focused for consistent skincare buyers', image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=600', approved: false },
    { id: 'cr-3', segmentId: 'seg-3', segmentName: 'Makeup Enthusiasts', headline: 'Color Your World', subcopy: 'New palettes, endless possibilities', cta: 'Explore Colors', tone: 'Playful', hasOffer: true, offerBadge: 'Buy 2 Get 1', complianceStatus: 'approved', reasoning: 'Creative messaging for makeup collectors', image: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=600', approved: false },
    { id: 'cr-4', segmentId: 'seg-4', segmentName: 'Clean Beauty Seekers', headline: 'Pure Beauty, Pure Savings', subcopy: 'Natural ingredients you can trust', cta: 'Shop Clean Beauty', tone: 'Authentic', hasOffer: true, offerBadge: '20% OFF', complianceStatus: 'pending', reasoning: 'Values-aligned messaging for conscious consumers', image: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=600', approved: false },
  ],
  'Sports': [
    { id: 'cr-1', segmentId: 'seg-1', segmentName: 'Fitness Fanatics', headline: 'Gear Up for Greatness', subcopy: 'Performance gear for peak results', cta: 'Shop Performance', tone: 'Motivating', hasOffer: true, offerBadge: '20% OFF', complianceStatus: 'approved', reasoning: 'Performance-focused for dedicated athletes', image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600', approved: false },
    { id: 'cr-2', segmentId: 'seg-2', segmentName: 'Weekend Warriors', headline: 'Weekend Ready, Wallet Happy', subcopy: 'Casual comfort meets great value', cta: 'Shop Activewear', tone: 'Friendly', hasOffer: true, offerBadge: 'Buy 2 Save 25%', complianceStatus: 'approved', reasoning: 'Value and comfort for casual athletes', image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600', approved: false },
    { id: 'cr-3', segmentId: 'seg-3', segmentName: 'Team Sports Parents', headline: 'Back to Sports Season', subcopy: 'Outfit the whole team for less', cta: 'Shop Youth Gear', tone: 'Supportive', hasOffer: true, offerBadge: '30% OFF Youth', complianceStatus: 'approved', reasoning: 'Family-focused for sports parents', image: 'https://images.unsplash.com/photo-1526676037777-05a232554f77?w=600', approved: false },
    { id: 'cr-4', segmentId: 'seg-4', segmentName: 'Outdoor Adventurers', headline: 'Adventure Awaits', subcopy: 'Explore more, spend less', cta: 'Gear Up', tone: 'Adventurous', hasOffer: true, offerBadge: '$40 OFF $150+', complianceStatus: 'pending', reasoning: 'Adventure-driven for outdoor enthusiasts', image: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=600', approved: false },
  ],
}

const deriveAudienceStrategy = (category: string) => {
  const segments = CATEGORY_SEGMENTS[category] || CATEGORY_SEGMENTS['Apparel']
  return {
    segments,
    totalCoverage: segments.reduce((acc, s) => acc + s.percentage, 0),
    segmentationLayers: ['Engagement recency', 'Value clustering (k-means)', 'Category affinity', 'Purchase behavior']
  }
}

const deriveOfferMapping = (category: string) => {
  return CATEGORY_OFFERS[category] || CATEGORY_OFFERS['Apparel']
}

const deriveCreatives = (category: string) => {
  return CATEGORY_CREATIVES[category] || CATEGORY_CREATIVES['Apparel']
}

export function CampaignWorkspace() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [activeCampaignId, setActiveCampaignId] = useState<string | null>(null)
  const [isAlanWorking, setIsAlanWorking] = useState(false)
  const [alanStatus, setAlanStatus] = useState<string | null>(null)

  const activeCampaign = campaigns.find(c => c.id === activeCampaignId)

  const updateCampaign = (id: string, updates: Partial<Campaign>) => {
    setCampaigns(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c))
  }

  const handleStartCampaign = () => {
    const newCampaign: Campaign = {
      id: Date.now().toString(),
      name: 'New Campaign',
      status: 'draft',
      currentStep: 'context',
      lockedSteps: [],
      goal: '',
      category: null,
      channel: null,
      region: null
    }
    setCampaigns(prev => [newCampaign, ...prev])
    setActiveCampaignId(newCampaign.id)
  }

  const handleLockStep = async (
    step: CampaignStep,
    nextStep: CampaignStep,
    statusMsg: string,
    deriveData: () => Partial<Campaign>
  ) => {
    if (!activeCampaign) return
    setIsAlanWorking(true)
    setAlanStatus(statusMsg)
    await new Promise(resolve => setTimeout(resolve, 2000))
    const derived = deriveData()
    updateCampaign(activeCampaign.id, {
      ...derived,
      lockedSteps: [...activeCampaign.lockedSteps, step],
      currentStep: nextStep
    })
    setIsAlanWorking(false)
    setAlanStatus(null)
  }

  return (
    <div className="min-h-screen bg-surface-secondary flex">
      {/* Left Panel - Campaign List */}
      <div className="w-72 bg-surface border-r border-border flex flex-col">
        <div className="p-4 border-b border-border">
          <h2 className="font-semibold text-text-primary mb-3">Campaigns</h2>
          <Button variant="primary" className="w-full" onClick={handleStartCampaign}>
            <Plus className="w-4 h-4 mr-2" /> New Campaign
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {campaigns.length === 0 ? (
            <p className="text-sm text-text-muted text-center py-8">No campaigns yet</p>
          ) : (
            campaigns.map(campaign => (
              <button
                key={campaign.id}
                onClick={() => setActiveCampaignId(campaign.id)}
                className={cn(
                  'w-full p-3 rounded-xl text-left transition-colors',
                  activeCampaignId === campaign.id
                    ? 'bg-primary/10 border border-primary/30'
                    : 'bg-surface-secondary hover:bg-surface-tertiary'
                )}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-text-primary text-sm truncate">
                    {campaign.name}
                  </span>
                  <Badge variant="warning" className="text-xs">{campaign.status}</Badge>
                </div>
                <div className="flex gap-1">
                  {STEPS.map(step => (
                    <div
                      key={step.id}
                      className={cn(
                        'w-1.5 h-1.5 rounded-full',
                        campaign.lockedSteps.includes(step.id)
                          ? 'bg-success'
                          : campaign.currentStep === step.id
                          ? 'bg-primary'
                          : 'bg-border'
                      )}
                    />
                  ))}
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Stepper */}
        {activeCampaign && (
          <div className="bg-surface border-b border-border px-8 py-4">
            <div className="flex items-center justify-center gap-2">
              {STEPS.map((step, i) => {
                const isLocked = activeCampaign.lockedSteps.includes(step.id)
                const isCurrent = activeCampaign.currentStep === step.id
                const StepIcon = step.icon
                return (
                  <div key={step.id} className="flex items-center">
                    <div
                      className={cn(
                        'flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium',
                        isLocked
                          ? 'bg-success/10 text-success'
                          : isCurrent
                          ? 'bg-primary text-white'
                          : 'bg-surface-tertiary text-text-muted'
                      )}
                    >
                      {isLocked ? <Check className="w-4 h-4" /> : <StepIcon className="w-4 h-4" />}
                      {step.label}
                      {isLocked && <Lock className="w-3 h-3 ml-1" />}
                    </div>
                    {i < STEPS.length - 1 && (
                      <ChevronRight className={cn('w-5 h-5 mx-2', isLocked ? 'text-success' : 'text-border')} />
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto bg-gradient-to-br from-surface via-surface to-primary/5">
          {!activeCampaign ? (
            <div className="flex items-center justify-center h-full">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center max-w-lg"
              >
                {/* Icon */}
                <div className="mx-auto mb-8">
                  <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary to-agent flex items-center justify-center mx-auto shadow-xl shadow-primary/20">
                    <Sparkles className="w-12 h-12 text-white" />
                  </div>
                </div>

                <h2 className="text-3xl font-bold text-text-primary mb-3">Start a New Campaign</h2>
                <p className="text-text-secondary mb-8 text-lg leading-relaxed">
                  Let Alan guide you through creating a personalized, 
                  <br />data-driven marketing campaign
                </p>

                {/* Feature highlights */}
                <div className="flex justify-center gap-6 mb-8">
                  <div className="flex items-center gap-2 text-sm text-text-muted">
                    <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center">
                      <Users className="w-4 h-4 text-success" />
                    </div>
                    <span>Smart Segmentation</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-text-muted">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <TrendingUp className="w-4 h-4 text-primary" />
                    </div>
                    <span>AI-Powered Offers</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-text-muted">
                    <div className="w-8 h-8 rounded-lg bg-agent/10 flex items-center justify-center">
                      <Palette className="w-4 h-4 text-agent" />
                    </div>
                    <span>Auto Creatives</span>
                  </div>
                </div>

                <Button 
                  variant="primary" 
                  onClick={handleStartCampaign}
                  className="px-8 py-6 text-base rounded-2xl shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.02] transition-all"
                >
                  <Plus className="w-5 h-5 mr-2" /> Create Campaign
                </Button>

                <p className="mt-6 text-sm text-text-muted">
                  Or select an existing campaign from the sidebar
                </p>
              </motion.div>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto py-8 px-6">
              {/* Alan Working Indicator */}
              <AnimatePresence>
                {isAlanWorking && (
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="mb-6 p-5 bg-gradient-to-r from-agent/10 to-primary/10 border border-agent/20 rounded-2xl"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-agent/20 flex items-center justify-center">
                        <Loader2 className="w-6 h-6 text-agent animate-spin" />
                      </div>
                      <div>
                        <p className="font-semibold text-agent">Alan is working...</p>
                        <p className="text-sm text-text-secondary">{alanStatus}</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Step Content */}
              <AnimatePresence mode="wait">
                {activeCampaign.currentStep === 'context' && !activeCampaign.derivedContext && (
                  <ContextInputStep
                    campaign={activeCampaign}
                    onUpdate={(u) => updateCampaign(activeCampaign.id, u)}
                    onSubmit={() =>
                      handleLockStep('context', 'context', 'Analyzing campaign context...', () => ({
                        derivedContext: deriveContext(activeCampaign.goal, activeCampaign.category!)
                      }))
                    }
                    isWorking={isAlanWorking}
                  />
                )}
                {activeCampaign.currentStep === 'context' && activeCampaign.derivedContext && (
                  <ContextDecisionStep
                    campaign={activeCampaign}
                    onUpdateDerived={(f, v) =>
                      updateCampaign(activeCampaign.id, {
                        derivedContext: { ...activeCampaign.derivedContext!, [f]: v }
                      })
                    }
                    onConfirm={() =>
                      handleLockStep('context', 'segment', 'Designing MECE segment strategy...', () => ({
                        name: activeCampaign.derivedContext!.campaignName,
                        audienceStrategy: deriveAudienceStrategy(activeCampaign.category!)
                      }))
                    }
                    onGoBack={() => {
                      updateCampaign(activeCampaign.id, { derivedContext: undefined })
                    }}
                    isWorking={isAlanWorking}
                  />
                )}
                {activeCampaign.currentStep === 'segment' && (
                  <AudienceStep
                    campaign={activeCampaign}
                    onConfirm={() =>
                      handleLockStep('segment', 'product', 'Matching products to segments...', () => ({
                        offerMapping: deriveOfferMapping(activeCampaign.category!)
                      }))
                    }
                    isWorking={isAlanWorking}
                  />
                )}
                {activeCampaign.currentStep === 'product' && (
                  <ProductStep
                    campaign={activeCampaign}
                    onConfirm={() =>
                      handleLockStep('product', 'promo', 'Searching promotion library...', () => ({}))
                    }
                    isWorking={isAlanWorking}
                  />
                )}
                {activeCampaign.currentStep === 'promo' && (
                  <OfferStep
                    campaign={activeCampaign}
                    onConfirm={() =>
                      handleLockStep('promo', 'creative', 'Generating creatives...', () => ({
                        creatives: deriveCreatives(activeCampaign.category!)
                      }))
                    }
                    isWorking={isAlanWorking}
                  />
                )}
                {activeCampaign.currentStep === 'creative' && (
                  <CreativeStep
                    campaign={activeCampaign}
                    onApprove={(id) =>
                      updateCampaign(activeCampaign.id, {
                        creatives: activeCampaign.creatives?.map(c =>
                          c.id === id ? { ...c, approved: !c.approved } : c
                        )
                      })
                    }
                    onConfirm={() =>
                      handleLockStep('creative', 'review', 'Validating campaign...', () => ({}))
                    }
                    isWorking={isAlanWorking}
                  />
                )}
                {activeCampaign.currentStep === 'review' && (
                  <ReviewStep
                    campaign={activeCampaign}
                    onSaveDraft={() => {
                      updateCampaign(activeCampaign.id, { status: 'draft' })
                      setActiveCampaignId(null)
                    }}
                    onLaunch={() => {
                      updateCampaign(activeCampaign.id, { status: 'active' })
                      setActiveCampaignId(null)
                    }}
                  />
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Step Components

function ContextInputStep({
  campaign,
  onUpdate,
  onSubmit,
  isWorking
}: {
  campaign: Campaign
  onUpdate: (u: Partial<Campaign>) => void
  onSubmit: () => void
  isWorking: boolean
}) {
  const canSubmit = campaign.goal && campaign.category && campaign.channel

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      {/* Hero Header */}
      <div className="bg-gradient-to-br from-primary/5 via-agent/5 to-primary/10 rounded-2xl p-8 border border-primary/10">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-agent flex items-center justify-center shadow-lg shadow-primary/25">
            <Sparkles className="w-7 h-7 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-text-primary">What would you like to achieve?</h2>
            <p className="text-text-secondary">Describe your campaign goal and Alan will design the strategy</p>
          </div>
        </div>
        
        <div className="relative">
          <textarea
            value={campaign.goal}
            onChange={(e) => onUpdate({ goal: e.target.value })}
            placeholder="e.g., Clear excess summer inventory before fall arrivals while protecting brand margins..."
            className="w-full px-5 py-4 bg-white/80 backdrop-blur border-2 border-primary/20 rounded-2xl text-base focus:outline-none focus:ring-4 focus:ring-primary/20 focus:border-primary resize-none h-28 shadow-sm"
          />
          {campaign.goal && (
            <div className="absolute bottom-3 right-3">
              <Badge variant="success" className="text-xs">
                <Check className="w-3 h-3 mr-1" /> Goal defined
              </Badge>
            </div>
          )}
        </div>

        {/* Goal Suggestions */}
        <div className="mt-4">
          <p className="text-xs text-text-muted mb-2 flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> Quick suggestions {campaign.category && `for ${campaign.category}`}:
          </p>
          <div className="flex flex-wrap gap-2">
            {(GOAL_SUGGESTIONS[campaign.category || 'default'] || GOAL_SUGGESTIONS['default']).map((suggestion, i) => (
              <button
                key={i}
                onClick={() => onUpdate({ goal: suggestion.goal })}
                className={cn(
                  'px-4 py-2 rounded-xl text-sm border-2 transition-all flex items-center gap-2',
                  campaign.goal === suggestion.goal
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border bg-white hover:border-primary/50 text-text-secondary hover:text-text-primary'
                )}
              >
                <span>{suggestion.icon}</span>
                <span className="truncate max-w-[200px]">{suggestion.goal.slice(0, 40)}...</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Configuration Cards */}
      <div className="grid grid-cols-2 gap-4">
        {/* Category Card */}
        <div className="bg-surface rounded-2xl border border-border p-5 hover:border-primary/30 transition-colors">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4 text-primary" />
            </div>
            <label className="font-medium text-text-primary">Category <span className="text-danger">*</span></label>
          </div>
          <select
            value={campaign.category || ''}
            onChange={(e) => onUpdate({ category: e.target.value || null })}
            className="w-full px-4 py-3 bg-surface-secondary border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer"
          >
            <option value="">Select category</option>
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Medium Card */}
        <div className="bg-surface rounded-2xl border border-border p-5 hover:border-primary/30 transition-colors">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Mail className="w-4 h-4 text-primary" />
            </div>
            <label className="font-medium text-text-primary">Medium <span className="text-danger">*</span></label>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {CHANNELS.map(ch => {
              const Icon = ch.icon
              const isSelected = campaign.channel === ch.id
              return (
                <button
                  key={ch.id}
                  onClick={() => onUpdate({ channel: ch.id })}
                  className={cn(
                    'flex flex-col items-center justify-center gap-1 p-3 rounded-xl border-2 text-xs font-medium transition-all',
                    isSelected
                      ? 'border-primary bg-primary text-white shadow-lg shadow-primary/25'
                      : 'border-border hover:border-primary/50 text-text-secondary hover:bg-surface-secondary'
                  )}
                >
                  <Icon className="w-5 h-5" />
                  {ch.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Region Card */}
        <div className="bg-surface rounded-2xl border border-border p-5 hover:border-primary/30 transition-colors">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Globe className="w-4 h-4 text-primary" />
            </div>
            <label className="font-medium text-text-primary">Region</label>
          </div>
          <select
            value={campaign.region || ''}
            onChange={(e) => onUpdate({ region: e.target.value || null })}
            className="w-full px-4 py-3 bg-surface-secondary border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer"
          >
            <option value="">All regions</option>
            {REGIONS.map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>

        {/* Lookback Card */}
        <div className="bg-surface rounded-2xl border border-border p-5 hover:border-primary/30 transition-colors">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Calendar className="w-4 h-4 text-primary" />
            </div>
            <label className="font-medium text-text-primary">Lookback Period</label>
          </div>
          <select className="w-full px-4 py-3 bg-surface-secondary border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer">
            <option>Default (90 days)</option>
            <option>30 days</option>
            <option>60 days</option>
            <option>180 days</option>
          </select>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-center pt-4">
        <Button
          variant="primary"
          onClick={onSubmit}
          disabled={!canSubmit || isWorking}
          className={cn(
            'px-10 py-6 text-base rounded-2xl shadow-lg transition-all',
            canSubmit ? 'shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.02]' : ''
          )}
        >
          {isWorking ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Alan is analyzing...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 mr-2" />
              Let Alan Analyze
              <ArrowRight className="w-5 h-5 ml-2" />
            </>
          )}
        </Button>
      </div>

      {/* Helper Text */}
      {!canSubmit && (
        <p className="text-center text-sm text-text-muted">
          Fill in the required fields above to continue
        </p>
      )}
    </motion.div>
  )
}

function ContextDecisionStep({
  campaign,
  onUpdateDerived,
  onConfirm,
  onGoBack,
  isWorking
}: {
  campaign: Campaign
  onUpdateDerived: (f: string, v: string) => void
  onConfirm: () => void
  onGoBack: () => void
  isWorking: boolean
}) {
  const derived = campaign.derivedContext!
  const needsInput = !derived.marginProtection || !derived.seasonality
  const [showAdjustModal, setShowAdjustModal] = useState(false)
  const [adjustFeedback, setAdjustFeedback] = useState('')

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      {/* Adjust Inputs Modal */}
      <AnimatePresence>
        {showAdjustModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setShowAdjustModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-surface rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="bg-agent/5 px-6 py-4 border-b border-agent/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-agent/20 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-agent" />
                  </div>
                  <div>
                    <p className="font-semibold text-agent">Alan is listening</p>
                    <p className="text-sm text-text-secondary">What would you like me to adjust?</p>
                  </div>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-6">
                <p className="text-sm text-text-secondary mb-4">
                  Tell me what you'd like to change about the campaign strategy. I'll re-analyze based on your feedback.
                </p>
                <textarea
                  value={adjustFeedback}
                  onChange={(e) => setAdjustFeedback(e.target.value)}
                  placeholder="e.g., Focus more on high-value customers, reduce discount depth, target a different region..."
                  className="w-full px-4 py-3 bg-surface-secondary border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-agent/50 resize-none h-32"
                />

                {/* Quick suggestions */}
                <div className="mt-4">
                  <p className="text-xs text-text-muted mb-2">Quick adjustments:</p>
                  <div className="flex flex-wrap gap-2">
                    {['Change target audience', 'Adjust discount levels', 'Different campaign type', 'Modify timeline'].map(s => (
                      <button
                        key={s}
                        onClick={() => setAdjustFeedback(s)}
                        className="px-3 py-1.5 bg-surface-secondary border border-border rounded-lg text-xs text-text-secondary hover:border-agent/50 hover:text-agent transition-colors"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 bg-surface-secondary border-t border-border flex items-center justify-end gap-3">
                <Button variant="ghost" onClick={() => setShowAdjustModal(false)}>
                  Cancel
                </Button>
                <Button 
                  variant="primary" 
                  onClick={() => {
                    setShowAdjustModal(false)
                    onGoBack()
                  }}
                  disabled={!adjustFeedback.trim()}
                  className="bg-agent hover:bg-agent/90"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Re-analyze
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-surface rounded-2xl border border-agent/30 overflow-hidden">
        {/* Header */}
        <div className="bg-agent/5 px-6 py-4 border-b border-agent/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-agent/20 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-agent" />
            </div>
            <div>
              <p className="font-semibold text-agent">Alan has analyzed your goal</p>
              <p className="text-sm text-text-secondary">Review the derived strategy below</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Campaign Type */}
          <div className="flex items-start gap-4 p-4 bg-surface-secondary rounded-xl">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-text-muted mb-1">Campaign Type</p>
              <p className="text-lg font-semibold text-text-primary">{derived.campaignType}</p>
              <p className="text-sm text-text-secondary mt-1">
                Suggested name: <span className="font-medium">{derived.campaignName}</span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-text-muted mb-1">Est. Universe</p>
              <p className="text-lg font-semibold text-primary">
                {derived.estimatedUniverse.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Risks */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-4 h-4 text-warning" />
              <p className="font-medium text-text-primary">Key Risks</p>
            </div>
            <ul className="space-y-2">
              {derived.risks.map((r, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-text-secondary">
                  <span className="w-1.5 h-1.5 rounded-full bg-warning mt-2" />
                  {r}
                </li>
              ))}
            </ul>
          </div>

          {/* Guardrails */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Shield className="w-4 h-4 text-success" />
              <p className="font-medium text-text-primary">Guardrails</p>
            </div>
            <ul className="space-y-2">
              {derived.guardrails.map((g, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-text-secondary">
                  <Check className="w-4 h-4 text-success mt-0.5" />
                  {g}
                </li>
              ))}
            </ul>
          </div>

          {/* Why this works */}
          <div className="p-4 bg-success/5 border border-success/20 rounded-xl">
            <p className="text-sm font-medium text-success mb-1">Why this approach works</p>
            <p className="text-sm text-text-secondary">
              This strategy balances inventory clearance with margin protection by targeting
              price-sensitive segments with appropriate discounts.
            </p>
          </div>

          {/* Alan needs input */}
          {needsInput && (
            <div className="p-4 bg-warning/5 border border-warning/20 rounded-xl">
              <p className="text-sm font-medium text-warning mb-3">Alan needs your input</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-text-muted mb-2">Margin Protection</p>
                  <div className="flex gap-2">
                    {['strict', 'flexible'].map(v => (
                      <button
                        key={v}
                        onClick={() => onUpdateDerived('marginProtection', v)}
                        className={cn(
                          'flex-1 px-3 py-2 rounded-lg text-sm font-medium border-2 capitalize',
                          derived.marginProtection === v
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-border hover:border-primary/50'
                        )}
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-text-muted mb-2">Campaign Type</p>
                  <div className="flex gap-2">
                    {['seasonal', 'evergreen'].map(v => (
                      <button
                        key={v}
                        onClick={() => onUpdateDerived('seasonality', v)}
                        className={cn(
                          'flex-1 px-3 py-2 rounded-lg text-sm font-medium border-2 capitalize',
                          derived.seasonality === v
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-border hover:border-primary/50'
                        )}
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-surface-secondary border-t border-border flex items-center justify-between">
          <Button variant="ghost" onClick={() => setShowAdjustModal(true)}>
            <Edit3 className="w-4 h-4 mr-2" /> Adjust Inputs
          </Button>
          <Button variant="primary" onClick={onConfirm} disabled={needsInput || isWorking}>
            <Check className="w-4 h-4 mr-2" /> Confirm & Lock Context
          </Button>
        </div>
      </div>
    </motion.div>
  )
}

function AudienceStep({
  campaign,
  onConfirm,
  isWorking
}: {
  campaign: Campaign
  onConfirm: () => void
  isWorking: boolean
}) {
  const strategy = campaign.audienceStrategy

  if (!strategy) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 text-agent animate-spin" />
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <div className="bg-surface rounded-2xl border border-agent/30 overflow-hidden">
        {/* Header */}
        <div className="bg-agent/5 px-6 py-4 border-b border-agent/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-agent/20 flex items-center justify-center">
              <Users className="w-5 h-5 text-agent" />
            </div>
            <div>
              <p className="font-semibold text-agent">Alan has designed your audience strategy</p>
              <p className="text-sm text-text-secondary">
                MECE segmentation with {strategy.totalCoverage}% coverage
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Layers */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-text-muted">Layers:</span>
            {strategy.segmentationLayers.map((l, i) => (
              <Badge key={i} variant="default" className="bg-surface-tertiary">{l}</Badge>
            ))}
          </div>

          {/* Segments */}
          <div className="space-y-3">
            {strategy.segments.map(seg => (
              <div key={seg.id} className="p-4 bg-surface-secondary rounded-xl">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-text-primary">{seg.name}</h4>
                      <Badge
                        variant={seg.logic === 'statistical' ? 'info' : 'default'}
                        className="text-xs"
                      >
                        {seg.logic}
                      </Badge>
                    </div>
                    <p className="text-sm text-text-secondary mt-1">{seg.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-primary">{seg.size.toLocaleString()}</p>
                    <p className="text-xs text-text-muted">{seg.percentage}%</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Coverage */}
          <div className="flex items-center justify-between p-4 bg-success/5 border border-success/20 rounded-xl">
            <div>
              <p className="text-sm font-medium text-success">Total Coverage</p>
              <p className="text-sm text-text-secondary">
                {strategy.segments.reduce((a, s) => a + s.size, 0).toLocaleString()} customers
              </p>
            </div>
            <p className="text-2xl font-bold text-success">{strategy.totalCoverage}%</p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-surface-secondary border-t border-border flex items-center justify-between">
          <div className="flex gap-2">
            <Button variant="ghost" size="sm">Make stricter</Button>
            <Button variant="ghost" size="sm">Make broader</Button>
          </div>
          <Button variant="primary" onClick={onConfirm} disabled={isWorking}>
            <Check className="w-4 h-4 mr-2" /> Confirm Segment Strategy
          </Button>
        </div>
      </div>
    </motion.div>
  )
}

function OfferStep({
  campaign,
  onConfirm,
  isWorking
}: {
  campaign: Campaign
  onConfirm: () => void
  isWorking: boolean
}) {
  const mapping = campaign.offerMapping

  if (!mapping) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 text-agent animate-spin" />
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <div className="bg-surface rounded-2xl border border-agent/30 overflow-hidden">
        {/* Header */}
        <div className="bg-agent/5 px-6 py-4 border-b border-agent/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-agent/20 flex items-center justify-center">
              <Tag className="w-5 h-5 text-agent" />
            </div>
            <div>
              <p className="font-semibold text-agent">Alan has mapped offers to segments</p>
              <p className="text-sm text-text-secondary">Optimized for lift while protecting margins</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {mapping.map(o => (
            <div key={o.segmentId} className="p-4 bg-surface-secondary rounded-xl">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-sm text-text-muted">{o.segmentName}</p>
                  <p className="font-semibold text-text-primary">
                    {o.productGroup} → {o.promotion}
                  </p>
                </div>
                <Badge variant="success" className="text-lg px-4 py-1">{o.promoValue}</Badge>
              </div>
              <div className="flex gap-6">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-success" />
                  <span className="text-sm">
                    <span className="font-semibold text-success">+{o.expectedLift}%</span> lift
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-warning" />
                  <span className="text-sm">
                    <span className="font-semibold text-warning">{o.marginImpact}%</span> margin
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-primary" />
                  <span className="text-sm">
                    <span className="font-semibold text-primary">{o.overstockCoverage}%</span> overstock
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-surface-secondary border-t border-border flex items-center justify-between">
          <Button variant="ghost" size="sm">Adjust Mapping</Button>
          <Button variant="primary" onClick={onConfirm} disabled={isWorking}>
            <Check className="w-4 h-4 mr-2" /> Confirm Promo Mapping
          </Button>
        </div>
      </div>
    </motion.div>
  )
}

// ============================================================================
// STEP 3: PRODUCT / SKU ELIGIBILITY (NEW STEP)
// ============================================================================

function ProductStep({
  campaign,
  onConfirm,
  isWorking
}: {
  campaign: Campaign
  onConfirm: () => void
  isWorking: boolean
}) {
  const segments = campaign.audienceStrategy?.segments || []
  const [expandedSegment, setExpandedSegment] = useState<string | null>(null)
  
  // Rich product groups with sample SKUs
  const productGroups = [
    { 
      segmentId: 'seg-1', 
      segmentName: segments[0]?.name || 'VIP Segment', 
      group: 'Premium & New Arrivals', 
      skuCount: 245, 
      rationale: 'Avoid brand dilution for VIPs',
      color: 'from-purple-500 to-indigo-500',
      skus: [
        { id: 'sku-1', name: 'Cashmere Sweater', price: 189, image: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=120' },
        { id: 'sku-2', name: 'Silk Blouse', price: 145, image: 'https://images.unsplash.com/photo-1485462537746-965f33f7f6a7?w=120' },
        { id: 'sku-3', name: 'Wool Coat', price: 299, image: 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=120' },
        { id: 'sku-4', name: 'Designer Jeans', price: 165, image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=120' },
      ]
    },
    { 
      segmentId: 'seg-2', 
      segmentName: segments[1]?.name || 'Mid-Value Segment', 
      group: 'Value Bundles & Basics', 
      skuCount: 412, 
      rationale: 'Maximize sell-through for overstock',
      color: 'from-blue-500 to-cyan-500',
      skus: [
        { id: 'sku-5', name: 'Cotton T-Shirt Pack', price: 45, image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=120' },
        { id: 'sku-6', name: 'Casual Shorts', price: 35, image: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=120' },
        { id: 'sku-7', name: 'Summer Dress', price: 65, image: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=120' },
        { id: 'sku-8', name: 'Linen Pants', price: 55, image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=120' },
      ]
    },
    { 
      segmentId: 'seg-3', 
      segmentName: segments[2]?.name || 'At-Risk Segment', 
      group: 'Past Favorites & Clearance', 
      skuCount: 189, 
      rationale: 'Win back with familiar items',
      color: 'from-orange-500 to-amber-500',
      skus: [
        { id: 'sku-9', name: 'Classic Cardigan', price: 79, image: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=120' },
        { id: 'sku-10', name: 'Vintage Jacket', price: 89, image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=120' },
        { id: 'sku-11', name: 'Relaxed Fit Jeans', price: 59, image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=120' },
      ]
    },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <div className="bg-surface rounded-2xl border border-agent/30 overflow-hidden">
        {/* ADB Header */}
        <div className="bg-gradient-to-r from-agent/10 to-primary/10 px-6 py-5 border-b border-agent/20">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-agent to-primary flex items-center justify-center shadow-lg shadow-agent/25">
              <Package className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="font-bold text-lg text-text-primary">Alan has matched products per segment</p>
              <p className="text-sm text-text-secondary">Click any segment to preview sample SKUs from the product group</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {productGroups.slice(0, segments.length || 3).map((pg, i) => (
            <motion.div 
              key={pg.segmentId} 
              className={cn(
                "rounded-2xl border-2 overflow-hidden transition-all cursor-pointer",
                expandedSegment === pg.segmentId 
                  ? "border-primary shadow-lg shadow-primary/10" 
                  : "border-border hover:border-primary/30"
              )}
              onClick={() => setExpandedSegment(expandedSegment === pg.segmentId ? null : pg.segmentId)}
            >
              {/* Segment Header */}
              <div className="p-4 bg-surface-secondary">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center text-white font-bold shadow-md",
                      pg.color
                    )}>
                      {i + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-text-primary">{pg.segmentName}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <ArrowRight className="w-3 h-3 text-primary" />
                        <p className="text-sm font-medium text-primary">{pg.group}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="success" className="text-xs px-3 py-1">
                      <Package className="w-3 h-3 mr-1" /> {pg.skuCount} SKUs
                    </Badge>
                    <ChevronRight className={cn(
                      "w-5 h-5 text-text-muted transition-transform",
                      expandedSegment === pg.segmentId && "rotate-90"
                    )} />
                  </div>
                </div>
                
                {/* Rationale */}
                <div className="mt-3 flex items-center gap-2">
                  <Sparkles className="w-3 h-3 text-agent" />
                  <p className="text-xs text-text-muted">
                    <span className="text-agent font-medium">Why:</span> {pg.rationale}
                  </p>
                </div>
              </div>

              {/* Expanded SKU Preview */}
              <AnimatePresence>
                {expandedSegment === pg.segmentId && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="p-4 bg-surface border-t border-border">
                      <p className="text-xs text-text-muted mb-3 flex items-center gap-1">
                        <Eye className="w-3 h-3" /> Sample SKUs from this product group:
                      </p>
                      <div className="grid grid-cols-4 gap-3">
                        {pg.skus.map(sku => (
                          <div key={sku.id} className="group relative">
                            <div className="aspect-square rounded-xl overflow-hidden bg-surface-secondary border border-border group-hover:border-primary/50 transition-all">
                              <img 
                                src={sku.image} 
                                alt={sku.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                              />
                            </div>
                            <div className="mt-2">
                              <p className="text-xs font-medium text-text-primary truncate">{sku.name}</p>
                              <p className="text-xs text-primary font-semibold">${sku.price}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-text-muted mt-3 text-center">
                        + {pg.skuCount - pg.skus.length} more SKUs in this group
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}

          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-4 pt-2">
            <div className="p-4 bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl text-center">
              <p className="text-2xl font-bold text-primary">
                {productGroups.slice(0, segments.length || 3).reduce((acc, pg) => acc + pg.skuCount, 0)}
              </p>
              <p className="text-xs text-text-muted">Total SKUs</p>
            </div>
            <div className="p-4 bg-gradient-to-br from-success/5 to-success/10 rounded-xl text-center">
              <p className="text-2xl font-bold text-success">{segments.length || 3}</p>
              <p className="text-xs text-text-muted">Product Groups</p>
            </div>
            <div className="p-4 bg-gradient-to-br from-agent/5 to-agent/10 rounded-xl text-center">
              <p className="text-2xl font-bold text-agent">100%</p>
              <p className="text-xs text-text-muted">Segment Coverage</p>
            </div>
          </div>

          {/* Why this works */}
          <div className="p-4 bg-gradient-to-r from-success/5 to-agent/5 border border-success/20 rounded-xl">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-success/20 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-4 h-4 text-success" />
              </div>
              <div>
                <p className="text-sm font-semibold text-success mb-1">Why this product mapping works</p>
                <p className="text-sm text-text-secondary">
                  Products are matched based on segment affinity, inventory levels, and margin requirements.
                  VIPs get premium items to protect brand perception, while value-focused segments
                  receive bundles and overstock items to maximize sell-through.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-surface-secondary border-t border-border flex items-center justify-between">
          <Button variant="ghost">
            <Edit3 className="w-4 h-4 mr-2" /> Adjust Product Logic
          </Button>
          <Button variant="primary" onClick={onConfirm} disabled={isWorking} className="px-6">
            <Check className="w-4 h-4 mr-2" /> Approve Product Groups
          </Button>
        </div>
      </div>
    </motion.div>
  )
}

// ============================================================================
// STEP 5: CREATIVE
// ============================================================================

function CreativeStep({
  campaign,
  onApprove,
  onConfirm,
  isWorking
}: {
  campaign: Campaign
  onApprove: (id: string) => void
  onConfirm: () => void
  isWorking: boolean
}) {
  const creatives = campaign.creatives
  const [activeTab, setActiveTab] = useState(creatives?.[0]?.segmentId || null)

  if (!creatives) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 text-agent animate-spin" />
      </div>
    )
  }

  const active = creatives.find(c => c.segmentId === activeTab)
  
  // CRITICAL FIX: Count-based approval check
  const approvedCount = creatives.filter(c => c.approved).length
  const totalRequired = creatives.length
  const allApproved = approvedCount === totalRequired

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <div className="bg-surface rounded-2xl border border-agent/30 overflow-hidden">
        {/* Header */}
        <div className="bg-agent/5 px-6 py-4 border-b border-agent/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-agent/20 flex items-center justify-center">
              <Palette className="w-5 h-5 text-agent" />
            </div>
            <div>
              <p className="font-semibold text-agent">Alan has generated segment-specific creatives</p>
              <p className="text-sm text-text-secondary">Based on confirmed context and offer mapping</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Tabs */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {creatives.map(c => (
              <button
                key={c.segmentId}
                onClick={() => setActiveTab(c.segmentId)}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap flex items-center gap-2',
                  activeTab === c.segmentId
                    ? 'bg-primary text-white'
                    : 'bg-surface-secondary text-text-secondary hover:bg-surface-tertiary'
                )}
              >
                {c.segmentName}
                {c.approved && <Check className="w-3 h-3" />}
              </button>
            ))}
          </div>

          {/* Creative Preview */}
          {active && (
            <div className="grid grid-cols-2 gap-6">
              {/* Banner */}
              <div className={cn('rounded-2xl overflow-hidden border-2', active.approved ? 'border-success' : 'border-border')}>
                <div className="relative aspect-[4/3] bg-gradient-to-br from-gray-100 to-gray-200">
                  <img src={active.image} alt="" className="absolute inset-0 w-full h-full object-cover opacity-40" />
                  <div className="absolute inset-0 p-6 flex flex-col justify-end bg-gradient-to-t from-black/60 to-transparent">
                    {active.hasOffer && (
                      <Badge className="self-start mb-3 bg-red-500 text-white text-sm px-3 py-1">
                        {active.offerBadge}
                      </Badge>
                    )}
                    <h3 className="text-2xl font-bold text-white mb-2">{active.headline}</h3>
                    <p className="text-white/80 mb-4">{active.subcopy}</p>
                    <button className="self-start px-6 py-2.5 bg-white text-gray-900 rounded-lg font-semibold">
                      {active.cta} →
                    </button>
                  </div>
                </div>
                <div className="p-4 bg-surface flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge variant="default">{active.tone}</Badge>
                    <Badge variant={active.complianceStatus === 'approved' ? 'success' : 'warning'}>
                      {active.complianceStatus}
                    </Badge>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => onApprove(active.id)}
                      className={cn(
                        'p-2 rounded-lg',
                        active.approved
                          ? 'bg-success text-white'
                          : 'bg-surface-secondary text-text-muted hover:bg-success/10'
                      )}
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button className="p-2 rounded-lg bg-surface-secondary text-text-muted hover:bg-surface-tertiary">
                      <RefreshCw className="w-4 h-4" />
                    </button>
                    <button className="p-2 rounded-lg bg-surface-secondary text-text-muted hover:bg-surface-tertiary">
                      <Edit3 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Details */}
              <div className="space-y-4">
                <div className="p-4 bg-surface-secondary rounded-xl">
                  <p className="text-sm text-text-muted mb-1">Segment</p>
                  <p className="font-semibold text-text-primary">{active.segmentName}</p>
                </div>
                <div className="p-4 bg-surface-secondary rounded-xl">
                  <p className="text-sm text-text-muted mb-1">Headline</p>
                  <p className="font-semibold text-text-primary">{active.headline}</p>
                </div>
                <div className="p-4 bg-surface-secondary rounded-xl">
                  <p className="text-sm text-text-muted mb-1">Subcopy</p>
                  <p className="text-text-primary">{active.subcopy}</p>
                </div>
                <div className="p-4 bg-agent/5 border border-agent/20 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Eye className="w-4 h-4 text-agent" />
                    <p className="text-sm font-medium text-agent">Why this creative works</p>
                  </div>
                  <p className="text-sm text-text-secondary">{active.reasoning}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-surface-secondary border-t border-border flex items-center justify-between">
          <p className="text-sm text-text-secondary">
            {creatives.filter(c => c.approved).length}/{creatives.length} approved
          </p>
          <Button variant="primary" onClick={onConfirm} disabled={!allApproved || isWorking}>
            <Check className="w-4 h-4 mr-2" /> Confirm All Creatives
          </Button>
        </div>
      </div>
    </motion.div>
  )
}

function ReviewStep({ campaign, onSaveDraft, onLaunch }: { campaign: Campaign; onSaveDraft: () => void; onLaunch: () => void }) {
  const checks = [
    { label: 'Context', locked: campaign.lockedSteps.includes('context') },
    { label: 'Segment', locked: campaign.lockedSteps.includes('segment') },
    { label: 'Product', locked: campaign.lockedSteps.includes('product') },
    { label: 'Promo', locked: campaign.lockedSteps.includes('promo') },
    { label: 'Creative', locked: campaign.lockedSteps.includes('creative') },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <div className="bg-surface rounded-2xl border border-success/30 overflow-hidden">
        {/* Header */}
        <div className="bg-success/5 px-6 py-4 border-b border-success/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-success/20 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="font-semibold text-success">Alan has validated this campaign</p>
              <p className="text-sm text-text-secondary">All decisions are locked and ready for launch</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Summary */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-surface-secondary rounded-xl">
              <p className="text-sm text-text-muted mb-1">Campaign</p>
              <p className="font-semibold text-text-primary">{campaign.derivedContext?.campaignName}</p>
            </div>
            <div className="p-4 bg-surface-secondary rounded-xl">
              <p className="text-sm text-text-muted mb-1">Type</p>
              <p className="font-semibold text-text-primary">{campaign.derivedContext?.campaignType}</p>
            </div>
            <div className="p-4 bg-surface-secondary rounded-xl">
              <p className="text-sm text-text-muted mb-1">Reach</p>
              <p className="font-semibold text-text-primary">
                {campaign.audienceStrategy?.segments.reduce((a, s) => a + s.size, 0).toLocaleString()}
              </p>
            </div>
            <div className="p-4 bg-surface-secondary rounded-xl">
              <p className="text-sm text-text-muted mb-1">Segments</p>
              <p className="font-semibold text-text-primary">{campaign.audienceStrategy?.segments.length}</p>
            </div>
          </div>

          {/* Checklist */}
          <div className="p-4 bg-surface-secondary rounded-xl">
            <p className="font-medium text-text-primary mb-3">Validation Checklist</p>
            <div className="space-y-2">
              {checks.map(c => (
                <div key={c.label} className="flex items-center gap-3">
                  {c.locked ? (
                    <CheckCircle className="w-5 h-5 text-success" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-border" />
                  )}
                  <span className={cn('text-sm', c.locked ? 'text-text-primary' : 'text-text-muted')}>
                    {c.label}
                  </span>
                  {c.locked && <Lock className="w-3 h-3 text-text-muted" />}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-surface-secondary border-t border-border flex items-center justify-center gap-4">
          <Button variant="ghost" className="px-8" onClick={onSaveDraft}>Save as Draft</Button>
          <Button variant="primary" className="px-8 bg-success hover:bg-success/90" onClick={onLaunch}>
            <Rocket className="w-4 h-4 mr-2" /> Approve & Launch
          </Button>
        </div>
      </div>
    </motion.div>
  )
}
