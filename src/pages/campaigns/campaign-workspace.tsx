import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Plus, Check, Lock, Sparkles, TrendingUp, Users, 
  Loader2, Package, Tag, Palette, Rocket, Edit3, RefreshCw, CheckCircle,
  ChevronRight, Shield, Target, Zap, Eye,
  Calendar, BarChart3, ArrowRight, Search,
  Pause, MoreHorizontal, Copy, Trash2, FileText,
  Save, LogOut, ArrowLeft, Archive
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

// Global Data Standardization - Single Source of Truth for Categories & SKUs
import { 
  getProductGroupsByClient,
  handleImageError,
  PLACEHOLDER_IMAGE 
} from '@/data/product-data'

type CampaignStep = 'context' | 'segment' | 'product' | 'promo' | 'creative' | 'review'
type CampaignStatus = 'draft' | 'active' | 'scheduled' | 'completed'

interface StepState {
  status: 'pending' | 'thinking' | 'ready' | 'approved' | 'needs-rerun'
  completedAt?: Date
}

interface Campaign {
  id: string
  name: string
  status: CampaignStatus
  currentStep: CampaignStep
  currentSubStep?: string
  lockedSteps: CampaignStep[]
  stepStates: Record<CampaignStep, StepState>
  goal: string
  category: string | null
  channel: string | null
  region: string | null
  lookbackWindow: string
  client?: 'sally' | 'michaels' | 'tsc'  // Client identifier for multi-tenant support
  // Audit info
  createdBy: string
  createdAt: Date
  lastSavedAt: Date
  lastSavedBy: string
  lastModifiedAt: Date
  lastModifiedBy: string
  // Campaign dates
  startDate?: Date
  endDate?: Date
  // Data snapshot
  dataSnapshotAt?: Date
  customerUniverseSize?: number
  skuUniverseSize?: number
  // Progress
  progressPercent: number
  completedStepsCount: number
  // Blocking items
  blockingItems?: string[]
  // Linked promos
  linkedPromoIds?: string[]
  derivedContext?: {
    campaignType: string
    campaignName: string
    risks: string[]
    guardrails: string[]
    estimatedUniverse: number
    marginProtection: string | null
    seasonality: string | null
    assumptions: { key: string; value: string; isAssumed: boolean }[]
  }
  audienceStrategy?: {
    segments: { id: string; name: string; size: number; percentage: number; description: string; logic: string; rules?: string[] }[]
    totalCoverage: number
    segmentationLayers: { name: string; type: 'rule-based' | 'statistical' }[]
  }
  offerMapping?: {
    segmentId: string
    segmentName: string
    productGroup: string
    promotion: string
    promoId?: string
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
  promoSkipped?: boolean
}

const STEPS: { id: CampaignStep; label: string; icon: React.ElementType }[] = [
  { id: 'context', label: 'Context', icon: Target },
  { id: 'segment', label: 'Segments', icon: Users },
  { id: 'product', label: 'Products', icon: Package },
  { id: 'promo', label: 'Promos', icon: Tag },
  { id: 'creative', label: 'Creative', icon: Palette },
  { id: 'review', label: 'Review', icon: Rocket },
]

const createDefaultStepStates = (): Record<CampaignStep, StepState> => ({
  context: { status: 'pending' },
  segment: { status: 'pending' },
  product: { status: 'pending' },
  promo: { status: 'pending' },
  creative: { status: 'pending' },
  review: { status: 'pending' },
})

// Mock draft campaigns for demo - Using Sally Beauty Categories & Products
const MOCK_DRAFTS: Campaign[] = [
  {
    id: 'CAMP-001',
    name: 'Hair Color Holiday Refresh',
    status: 'draft',
    currentStep: 'promo',
    lockedSteps: ['context', 'segment', 'product'],
    stepStates: {
      context: { status: 'approved', completedAt: new Date('2024-12-15') },
      segment: { status: 'approved', completedAt: new Date('2024-12-16') },
      product: { status: 'approved', completedAt: new Date('2024-12-16') },
      promo: { status: 'ready' },
      creative: { status: 'pending' },
      review: { status: 'pending' },
    },
    goal: 'Drive Hair Color sales with Wella & Ion products during holiday season while protecting margin',
    category: 'Hair Color',
    channel: 'online',
    region: 'All US',
    lookbackWindow: 'Last 6 months',
    createdBy: 'John Doe',
    createdAt: new Date('2024-12-15T09:30:00'),
    lastSavedAt: new Date('2024-12-17T07:10:00'),
    lastSavedBy: 'John Doe',
    lastModifiedAt: new Date('2024-12-17T07:10:00'),
    lastModifiedBy: 'John Doe',
    customerUniverseSize: 1150000,
    skuUniverseSize: 2450,
    progressPercent: 50,
    completedStepsCount: 3,
    derivedContext: {
      campaignType: 'Holiday Promotion',
      campaignName: 'Hair Color Holiday Refresh',
      risks: ['Margin dilution on premium color products', 'Brand perception risk'],
      guardrails: ['Cap discount at 25% for Wella', 'Exclude new Ion launches'],
      estimatedUniverse: 1150000,
      marginProtection: 'flexible',
      seasonality: 'Holiday',
      assumptions: [
        { key: 'Channel', value: 'Online', isAssumed: false },
        { key: 'Discount flexibility', value: 'Moderate', isAssumed: true },
      ]
    },
    audienceStrategy: {
      segments: [
        { id: 'seg-1', name: 'Color Enthusiasts', size: 85000, percentage: 7.4, description: 'Frequent color changers who try new shades', logic: 'statistical' },
        { id: 'seg-2', name: 'Professional Stylists', size: 140000, percentage: 12.2, description: 'Licensed pros buying for clients', logic: 'rule-based' },
        { id: 'seg-3', name: 'First-Time Colorists', size: 95000, percentage: 8.3, description: 'New to at-home color, need guidance', logic: 'statistical' },
      ],
      totalCoverage: 27.9,
      segmentationLayers: [
        { name: 'Lifecycle', type: 'rule-based' },
        { name: 'Value Tier (RFM)', type: 'statistical' },
        { name: 'Promo Sensitivity', type: 'statistical' },
        { name: 'Hair Color Affinity', type: 'rule-based' },
      ]
    }
  },
  {
    id: 'CAMP-002',
    name: 'Styling Tools VIP Loyalty',
    status: 'draft',
    currentStep: 'segment',
    lockedSteps: ['context'],
    stepStates: {
      context: { status: 'approved', completedAt: new Date('2024-12-14') },
      segment: { status: 'thinking' },
      product: { status: 'pending' },
      promo: { status: 'pending' },
      creative: { status: 'pending' },
      review: { status: 'pending' },
    },
    goal: 'Drive repeat purchases of BaBylissPRO & Hot Tools from VIP customers',
    category: 'Styling Tools',
    channel: 'omni',
    region: 'North America',
    lookbackWindow: 'Last 90 days',
    createdBy: 'Sarah Chen',
    createdAt: new Date('2024-12-14T14:20:00'),
    lastSavedAt: new Date('2024-12-16T16:45:00'),
    lastSavedBy: 'Sarah Chen',
    lastModifiedAt: new Date('2024-12-16T16:45:00'),
    lastModifiedBy: 'Sarah Chen',
    customerUniverseSize: 450000,
    progressPercent: 17,
    completedStepsCount: 1,
  }
]

const MOCK_ACTIVE: Campaign[] = [
  {
    id: 'CAMP-003',
    name: 'Olaplex Bond Repair Launch',
    status: 'active',
    currentStep: 'review',
    lockedSteps: ['context', 'segment', 'product', 'promo', 'creative', 'review'],
    stepStates: {
      context: { status: 'approved' },
      segment: { status: 'approved' },
      product: { status: 'approved' },
      promo: { status: 'approved' },
      creative: { status: 'approved' },
      review: { status: 'approved' },
    },
    goal: 'Launch Olaplex Hair Care collection to bond repair seekers',
    category: 'Hair Care',
    channel: 'omni',
    region: 'All US',
    lookbackWindow: 'Last 90 days',
    createdBy: 'John Doe',
    createdAt: new Date('2024-12-01'),
    lastSavedAt: new Date('2024-12-10'),
    lastSavedBy: 'John Doe',
    lastModifiedAt: new Date('2024-12-10'),
    lastModifiedBy: 'John Doe',
    startDate: new Date('2024-12-15'),
    endDate: new Date('2024-12-31'),
    customerUniverseSize: 320000,
    progressPercent: 100,
    completedStepsCount: 6,
  },
  {
    id: 'CAMP-004',
    name: 'Nails & Lashes Bundle Promo',
    status: 'active',
    currentStep: 'review',
    lockedSteps: ['context', 'segment', 'product', 'promo', 'creative', 'review'],
    stepStates: {
      context: { status: 'approved' },
      segment: { status: 'approved' },
      product: { status: 'approved' },
      promo: { status: 'approved' },
      creative: { status: 'approved' },
      review: { status: 'approved' },
    },
    goal: 'Cross-sell OPI Nails with Ardell Lashes for holiday glam looks',
    category: 'Nails',
    channel: 'online',
    region: 'All US',
    lookbackWindow: 'Last 60 days',
    createdBy: 'Maria Lopez',
    createdAt: new Date('2024-12-05'),
    lastSavedAt: new Date('2024-12-12'),
    lastSavedBy: 'Maria Lopez',
    lastModifiedAt: new Date('2024-12-12'),
    lastModifiedBy: 'Maria Lopez',
    startDate: new Date('2024-12-10'),
    endDate: new Date('2024-12-25'),
    customerUniverseSize: 280000,
    progressPercent: 100,
    completedStepsCount: 6,
  },
  {
    id: 'CAMP-005',
    name: "Men's Grooming Barber Pro",
    status: 'active',
    currentStep: 'review',
    lockedSteps: ['context', 'segment', 'product', 'promo', 'creative', 'review'],
    stepStates: {
      context: { status: 'approved' },
      segment: { status: 'approved' },
      product: { status: 'approved' },
      promo: { status: 'approved' },
      creative: { status: 'approved' },
      review: { status: 'approved' },
    },
    goal: 'Target barber professionals with Andis & Wahl clippers bundle',
    category: "Men's Grooming",
    channel: 'omni',
    region: 'All US',
    lookbackWindow: 'Last 90 days',
    createdBy: 'James Wilson',
    createdAt: new Date('2024-12-03'),
    lastSavedAt: new Date('2024-12-11'),
    lastSavedBy: 'James Wilson',
    lastModifiedAt: new Date('2024-12-11'),
    lastModifiedBy: 'James Wilson',
    startDate: new Date('2024-12-08'),
    endDate: new Date('2024-12-31'),
    customerUniverseSize: 165000,
    progressPercent: 100,
    completedStepsCount: 6,
  },
  {
    id: 'CAMP-006',
    name: 'Textured Hair Care Curl Love',
    status: 'active',
    currentStep: 'review',
    lockedSteps: ['context', 'segment', 'product', 'promo', 'creative', 'review'],
    stepStates: {
      context: { status: 'approved' },
      segment: { status: 'approved' },
      product: { status: 'approved' },
      promo: { status: 'approved' },
      creative: { status: 'approved' },
      review: { status: 'approved' },
    },
    goal: 'Promote Cantu & Mielle products to curl definers and natural hair lovers',
    category: 'Textured Hair Care',
    channel: 'online',
    region: 'All US',
    lookbackWindow: 'Last 120 days',
    createdBy: 'Keisha Brown',
    createdAt: new Date('2024-12-02'),
    lastSavedAt: new Date('2024-12-09'),
    lastSavedBy: 'Keisha Brown',
    lastModifiedAt: new Date('2024-12-09'),
    lastModifiedBy: 'Keisha Brown',
    startDate: new Date('2024-12-05'),
    endDate: new Date('2024-12-28'),
    customerUniverseSize: 195000,
    progressPercent: 100,
    completedStepsCount: 6,
  }
]

const deriveContext = (goal: string, category: string, channel?: string, client?: 'sally' | 'michaels' | 'tsc') => {
  const lowerGoal = goal.toLowerCase()
  const isClearance = lowerGoal.includes('clear') || lowerGoal.includes('inventory') || lowerGoal.includes('excess')
  const isVIP = lowerGoal.includes('vip')
  const isRetention = lowerGoal.includes('repeat') || lowerGoal.includes('retention') || lowerGoal.includes('loyalty')
  const isFullPrice = lowerGoal.includes('full-price') || lowerGoal.includes('sell-through')
  const isMichaelsHoliday = client === 'michaels' || (lowerGoal.includes('christmas') && lowerGoal.includes('holiday') && client !== 'tsc')
  const isTSCHoliday = client === 'tsc' || (lowerGoal.includes('farmhouse') || lowerGoal.includes('tsc') || lowerGoal.includes('tractor'))
  
  // Extract category from goal if not provided
  let derivedCategory = category || 'General'
  
  // Michaels-specific category detection
  if (client === 'michaels') {
    // For Michaels, prioritize Trees if mentioned, otherwise check for Decor
    if (lowerGoal.includes('tree')) {
      derivedCategory = 'Christmas Trees'
    } else if (lowerGoal.includes('decor') || lowerGoal.includes('ornament') || lowerGoal.includes('topper') || lowerGoal.includes('light')) {
      derivedCategory = 'Christmas Decor Collections'
    } else {
      derivedCategory = 'Christmas Trees'
    }
  } else if (client === 'tsc') {
    // TSC-specific category detection
    if (lowerGoal.includes('christmas') || lowerGoal.includes('holiday')) {
      derivedCategory = 'Christmas Decor'
    } else if (lowerGoal.includes('home') || lowerGoal.includes('farmhouse') || lowerGoal.includes('decor')) {
      derivedCategory = 'Home Decor'
    } else {
      derivedCategory = 'Home Decor'
    }
  } else {
    // Sally Beauty / default category detection
    if (lowerGoal.includes('kids') || lowerGoal.includes('children')) derivedCategory = 'Kids Apparel'
    else if (lowerGoal.includes('women')) derivedCategory = "Women's"
    else if (lowerGoal.includes('men') && !lowerGoal.includes('women')) derivedCategory = "Men's"
    else if (lowerGoal.includes('apparel')) derivedCategory = 'Apparel'
    else if (lowerGoal.includes('footwear') || lowerGoal.includes('shoes')) derivedCategory = 'Footwear'
    else if (lowerGoal.includes('electronics')) derivedCategory = 'Electronics'
    else if (lowerGoal.includes('beauty')) derivedCategory = 'Beauty'
  }
  
  // Determine campaign type and name
  let campaignType = 'Engagement Campaign'
  let campaignName = `${derivedCategory} Engagement Campaign`
  
  if (isTSCHoliday && client === 'tsc') {
    campaignType = 'Holiday Seasonal Sale'
    campaignName = `TSC ${derivedCategory} Holiday Campaign`
  } else if (isMichaelsHoliday) {
    campaignType = 'Holiday Seasonal Sale'
    campaignName = `Michaels ${derivedCategory} Holiday Campaign`
  } else if (isClearance) {
    campaignType = 'Clearance Push'
    campaignName = `${derivedCategory} Clearance Campaign`
  } else if (isVIP && isRetention) {
    campaignType = 'VIP Retention'
    campaignName = `${derivedCategory} VIP Retention Campaign`
  } else if (isRetention) {
    campaignType = 'Customer Retention'
    campaignName = `${derivedCategory} Retention Campaign`
  } else if (isFullPrice) {
    campaignType = 'Full-Price Promotion'
    campaignName = `${derivedCategory} Full-Price Campaign`
  }
  
  // Derive risks based on campaign type
  let risks: string[] = []
  let guardrails: string[] = []
  
  if (isTSCHoliday && client === 'tsc') {
    risks = ['Seasonal inventory timing', 'Post-holiday returns', 'Competitor holiday pricing']
    guardrails = ['60% max discount on decor', 'Bundle home and holiday items', 'Free shipping over $49']
  } else if (isMichaelsHoliday) {
    risks = ['Seasonal inventory timing', 'Post-holiday returns', 'Competitor holiday pricing']
    guardrails = ['60% max discount on trees', 'Bundle decor with trees', 'Free shipping over $50']
  } else if (isClearance) {
    risks = ['Margin dilution on high-value items', 'Brand perception risk', 'Cannibalization of full-price']
    guardrails = ['Cap discount at 40% for premium', 'Exclude new arrivals', 'Min margin: 25%']
  } else if (isVIP || isRetention) {
    risks = ['Over-discounting loyal customers', 'Reduced perceived exclusivity', 'Margin erosion on repeat buyers']
    guardrails = ['Limit discount depth for VIPs', 'Focus on experiential rewards', 'Personalized offers only']
  } else if (isFullPrice) {
    risks = ['Lower conversion without discount', 'Competition from clearance', 'Price sensitivity in market']
    guardrails = ['Focus on value messaging', 'Highlight exclusivity', 'Emphasize quality and newness']
  } else {
    risks = ['Lower conversion without discount', 'Competition from clearance']
    guardrails = ['Focus on value messaging', 'Highlight exclusivity']
  }
  
  return {
    campaignType,
    campaignName,
    risks,
    guardrails,
    estimatedUniverse: client === 'michaels' ? Math.floor(Math.random() * 50000) + 80000 : client === 'tsc' ? Math.floor(Math.random() * 40000) + 60000 : Math.floor(Math.random() * 100000) + 150000,
    marginProtection: lowerGoal.includes('margin') || lowerGoal.includes('protect') ? 'Enabled' : null,
    seasonality: lowerGoal.includes('holiday') || lowerGoal.includes('christmas') ? 'Holiday Season' : lowerGoal.includes('summer') ? 'Summer' : null,
    assumptions: [
      { key: 'Channel', value: channel || 'Online + In-Store', isAssumed: !channel },
      { key: 'Discount flexibility', value: client === 'michaels' || client === 'tsc' ? 'Up to 60% off' : isClearance ? 'Moderate' : isVIP ? 'Conservative' : 'Flexible', isAssumed: true },
      { key: 'Product focus', value: derivedCategory !== 'General' ? derivedCategory : 'Category-level', isAssumed: true },
      ...(client === 'michaels' ? [{ key: 'Client', value: 'Michaels', isAssumed: false }] : []),
      ...(client === 'tsc' ? [{ key: 'Client', value: 'TSC', isAssumed: false }] : []),
    ]
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
  // Sally Beauty Categories
  'Hair Color': [
    { id: 'seg-1', name: 'Color Enthusiasts', size: 45200, percentage: 24.5, description: 'Frequent color changers, try new shades', logic: 'statistical' },
    { id: 'seg-2', name: 'Vivid Creators', size: 32100, percentage: 17.4, description: 'Bold fashion colors, creative expression', logic: 'rule-based' },
    { id: 'seg-3', name: 'Professional Stylists', size: 58900, percentage: 31.9, description: 'Licensed pros buying for clients', logic: 'statistical' },
    { id: 'seg-4', name: 'First-Time Colorists', size: 28400, percentage: 15.4, description: 'New to at-home color, need guidance', logic: 'rule-based' },
  ],
  'Hair Care': [
    { id: 'seg-1', name: 'Bond Repair Seekers', size: 41300, percentage: 22.1, description: 'Damaged hair, seeking repair solutions', logic: 'statistical' },
    { id: 'seg-2', name: 'Natural Hair Lovers', size: 52800, percentage: 28.3, description: 'Prefer natural/organic ingredients', logic: 'rule-based' },
    { id: 'seg-3', name: 'Routine Restockers', size: 61200, percentage: 32.8, description: 'Regular replenishment buyers', logic: 'statistical' },
    { id: 'seg-4', name: 'Treatment Seekers', size: 31400, percentage: 16.8, description: 'Looking for specific hair treatments', logic: 'rule-based' },
  ],
  'Styling Tools': [
    { id: 'seg-1', name: 'Pro Stylists', size: 38700, percentage: 21.2, description: 'Professional salon stylists', logic: 'statistical' },
    { id: 'seg-2', name: 'Home Stylists', size: 56400, percentage: 30.9, description: 'DIY styling enthusiasts', logic: 'rule-based' },
    { id: 'seg-3', name: 'Tool Upgraders', size: 48200, percentage: 26.4, description: 'Replacing old tools with better ones', logic: 'statistical' },
    { id: 'seg-4', name: 'First Tool Buyers', size: 39100, percentage: 21.4, description: 'New to styling tools', logic: 'rule-based' },
  ],
  'Nails': [
    { id: 'seg-1', name: 'Nail Artists', size: 35600, percentage: 19.8, description: 'Creative nail art enthusiasts', logic: 'statistical' },
    { id: 'seg-2', name: 'Gel Enthusiasts', size: 48900, percentage: 27.2, description: 'Prefer long-lasting gel polish', logic: 'rule-based' },
    { id: 'seg-3', name: 'DIY Manicurists', size: 54200, percentage: 30.1, description: 'Regular at-home manicures', logic: 'statistical' },
    { id: 'seg-4', name: 'Color Collectors', size: 41100, percentage: 22.9, description: 'Build polish collections', logic: 'rule-based' },
  ],
  'Cosmetics & Lashes': [
    { id: 'seg-1', name: 'Lash Lovers', size: 42800, percentage: 23.4, description: 'False lash enthusiasts', logic: 'statistical' },
    { id: 'seg-2', name: 'Brow Perfectionists', size: 38500, percentage: 21.1, description: 'Focus on brow grooming', logic: 'rule-based' },
    { id: 'seg-3', name: 'Makeup Minimalists', size: 51200, percentage: 28.0, description: 'Simple, essential makeup routine', logic: 'statistical' },
    { id: 'seg-4', name: 'Pro MUAs', size: 50300, percentage: 27.5, description: 'Professional makeup artists', logic: 'rule-based' },
  ],
  "Men's Grooming": [
    { id: 'seg-1', name: 'Barber Pros', size: 31200, percentage: 18.9, description: 'Professional barbers', logic: 'statistical' },
    { id: 'seg-2', name: 'Beard Enthusiasts', size: 45600, percentage: 27.6, description: 'Beard care focused', logic: 'rule-based' },
    { id: 'seg-3', name: 'Home Groomers', size: 52100, percentage: 31.5, description: 'DIY haircuts and grooming', logic: 'statistical' },
    { id: 'seg-4', name: 'Classic Gentlemen', size: 36400, percentage: 22.0, description: 'Traditional grooming products', logic: 'rule-based' },
  ],
  'Textured Hair Care': [
    { id: 'seg-1', name: 'Curl Definers', size: 39800, percentage: 22.4, description: 'Curly hair definition seekers', logic: 'statistical' },
    { id: 'seg-2', name: 'Protective Stylists', size: 47200, percentage: 26.6, description: 'Protective styling enthusiasts', logic: 'rule-based' },
    { id: 'seg-3', name: 'Moisture Seekers', size: 54600, percentage: 30.7, description: 'Focus on hydration and moisture', logic: 'statistical' },
    { id: 'seg-4', name: 'Natural Hair Newbies', size: 36100, percentage: 20.3, description: 'New to natural hair journey', logic: 'rule-based' },
  ],
  // Michaels Categories - 2 segments mapping to product categories
  'Christmas Trees': [
    { id: 'mseg-1', name: 'Holiday Decorators', size: 68500, percentage: 38.2, description: 'Ornaments, toppers, and decor enthusiasts', logic: 'statistical' },
    { id: 'mseg-2', name: 'Premium Tree Seekers', size: 58200, percentage: 32.4, description: 'Looking for high-end pre-lit Christmas trees', logic: 'rule-based' },
  ],
  'Christmas Decor Collections': [
    { id: 'mseg-1', name: 'Holiday Decorators', size: 68500, percentage: 38.2, description: 'Ornaments, toppers, and decor enthusiasts', logic: 'statistical' },
    { id: 'mseg-2', name: 'Premium Tree Seekers', size: 58200, percentage: 32.4, description: 'Looking for high-end pre-lit Christmas trees', logic: 'rule-based' },
  ],
  // TSC Categories - 2 segments for Home Decor and Christmas Decor
  'Home Decor': [
    { id: 'tseg-1', name: 'Farmhouse Enthusiasts', size: 45200, percentage: 35.8, description: 'Rustic farmhouse decor lovers seeking country-style home accents', logic: 'statistical' },
    { id: 'tseg-2', name: 'Holiday Shoppers', size: 38900, percentage: 30.8, description: 'Seasonal buyers looking for festive decorations', logic: 'rule-based' },
  ],
  'Christmas Decor': [
    { id: 'tseg-1', name: 'Farmhouse Enthusiasts', size: 45200, percentage: 35.8, description: 'Rustic farmhouse decor lovers seeking country-style home accents', logic: 'statistical' },
    { id: 'tseg-2', name: 'Holiday Shoppers', size: 38900, percentage: 30.8, description: 'Seasonal buyers looking for festive outdoor and porch decorations', logic: 'rule-based' },
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
  // Sally Beauty - Using standardized categories from sally_products.json
  'Hair Color': [
    { segmentId: 'seg-1', segmentName: 'Color Enthusiasts', productGroup: 'Hair Color', promotion: 'Color Refresh 20%', promoValue: '20% OFF Color', expectedLift: 88, marginImpact: -12, overstockCoverage: 25 },
    { segmentId: 'seg-2', segmentName: 'Vivid Creators', productGroup: 'Hair Color', promotion: 'Vivid Color Bundle', promoValue: 'Buy 2 Get 1', expectedLift: 82, marginImpact: -15, overstockCoverage: 40 },
    { segmentId: 'seg-3', segmentName: 'Professional Stylists', productGroup: 'Hair Color', promotion: 'Pro Color Deal', promoValue: '25% OFF $75+', expectedLift: 91, marginImpact: -10, overstockCoverage: 35 },
    { segmentId: 'seg-4', segmentName: 'First-Time Colorists', productGroup: 'Hair Color', promotion: 'Starter Kit Special', promoValue: '15% OFF First', expectedLift: 75, marginImpact: -8, overstockCoverage: 20 },
  ],
  'Hair Care': [
    { segmentId: 'seg-1', segmentName: 'Bond Repair Seekers', productGroup: 'Hair Care', promotion: 'Olaplex Exclusive', promoValue: '20% OFF Olaplex', expectedLift: 94, marginImpact: -11, overstockCoverage: 15 },
    { segmentId: 'seg-2', segmentName: 'Natural Hair Lovers', productGroup: 'Hair Care', promotion: 'Mielle Magic', promoValue: 'Buy 2 Save 25%', expectedLift: 85, marginImpact: -13, overstockCoverage: 30 },
    { segmentId: 'seg-3', segmentName: 'Routine Restockers', productGroup: 'Hair Care', promotion: 'Restock & Save', promoValue: '15% OFF Shampoo', expectedLift: 78, marginImpact: -9, overstockCoverage: 45 },
    { segmentId: 'seg-4', segmentName: 'Treatment Seekers', productGroup: 'Hair Care', promotion: 'Treatment Tuesday', promoValue: '$10 OFF $50+', expectedLift: 72, marginImpact: -7, overstockCoverage: 25 },
  ],
  'Styling Tools': [
    { segmentId: 'seg-1', segmentName: 'Pro Stylists', productGroup: 'Styling Tools', promotion: 'Pro Tools 20%', promoValue: '20% OFF Tools', expectedLift: 89, marginImpact: -14, overstockCoverage: 20 },
    { segmentId: 'seg-2', segmentName: 'Home Stylists', productGroup: 'Styling Tools', promotion: 'Style at Home', promoValue: '$25 OFF $100+', expectedLift: 81, marginImpact: -12, overstockCoverage: 35 },
    { segmentId: 'seg-3', segmentName: 'Tool Upgraders', productGroup: 'Styling Tools', promotion: 'Upgrade Deal', promoValue: '30% OFF Select', expectedLift: 86, marginImpact: -16, overstockCoverage: 50 },
    { segmentId: 'seg-4', segmentName: 'First Tool Buyers', productGroup: 'Styling Tools', promotion: 'Starter Special', promoValue: '15% OFF First', expectedLift: 74, marginImpact: -8, overstockCoverage: 15 },
  ],
  'Nails': [
    { segmentId: 'seg-1', segmentName: 'Nail Artists', productGroup: 'Nails', promotion: 'Pro Nail Deal', promoValue: '25% OFF Pro', expectedLift: 87, marginImpact: -13, overstockCoverage: 30 },
    { segmentId: 'seg-2', segmentName: 'Gel Enthusiasts', productGroup: 'Nails', promotion: 'Gel Polish Bundle', promoValue: 'Buy 3 Get 1', expectedLift: 83, marginImpact: -11, overstockCoverage: 40 },
    { segmentId: 'seg-3', segmentName: 'DIY Manicurists', productGroup: 'Nails', promotion: 'DIY Nail Kit', promoValue: '20% OFF Kits', expectedLift: 79, marginImpact: -10, overstockCoverage: 35 },
    { segmentId: 'seg-4', segmentName: 'Color Collectors', productGroup: 'Nails', promotion: 'Color Craze', promoValue: 'Buy 2 Save 30%', expectedLift: 76, marginImpact: -9, overstockCoverage: 45 },
  ],
  'Cosmetics & Lashes': [
    { segmentId: 'seg-1', segmentName: 'Lash Lovers', productGroup: 'Cosmetics & Lashes', promotion: 'Lash Bundle', promoValue: 'Buy 2 Get 1', expectedLift: 91, marginImpact: -12, overstockCoverage: 25 },
    { segmentId: 'seg-2', segmentName: 'Brow Perfectionists', productGroup: 'Cosmetics & Lashes', promotion: 'Brow Bar Deal', promoValue: '20% OFF Brows', expectedLift: 84, marginImpact: -10, overstockCoverage: 30 },
    { segmentId: 'seg-3', segmentName: 'Makeup Minimalists', productGroup: 'Cosmetics & Lashes', promotion: 'Essentials Sale', promoValue: '15% OFF Basics', expectedLift: 77, marginImpact: -8, overstockCoverage: 40 },
    { segmentId: 'seg-4', segmentName: 'Pro MUAs', productGroup: 'Cosmetics & Lashes', promotion: 'Pro MUA Special', promoValue: '$15 OFF $75+', expectedLift: 88, marginImpact: -11, overstockCoverage: 20 },
  ],
  "Men's Grooming": [
    { segmentId: 'seg-1', segmentName: 'Barber Pros', productGroup: "Men's Grooming", promotion: 'Barber Bundle', promoValue: '25% OFF Clippers', expectedLift: 92, marginImpact: -14, overstockCoverage: 20 },
    { segmentId: 'seg-2', segmentName: 'Beard Enthusiasts', productGroup: "Men's Grooming", promotion: 'Beard Care Deal', promoValue: 'Buy 2 Get 1', expectedLift: 85, marginImpact: -11, overstockCoverage: 35 },
    { segmentId: 'seg-3', segmentName: 'Home Groomers', productGroup: "Men's Grooming", promotion: 'Home Grooming Kit', promoValue: '20% OFF Kits', expectedLift: 79, marginImpact: -10, overstockCoverage: 40 },
    { segmentId: 'seg-4', segmentName: 'Classic Gentlemen', productGroup: "Men's Grooming", promotion: 'Classic Care', promoValue: '15% OFF Aftershave', expectedLift: 73, marginImpact: -8, overstockCoverage: 30 },
  ],
  'Textured Hair Care': [
    { segmentId: 'seg-1', segmentName: 'Curl Definers', productGroup: 'Textured Hair Care', promotion: 'Curl Definition', promoValue: '20% OFF Curls', expectedLift: 90, marginImpact: -12, overstockCoverage: 25 },
    { segmentId: 'seg-2', segmentName: 'Protective Stylists', productGroup: 'Textured Hair Care', promotion: 'Protective Style Bundle', promoValue: 'Buy 2 Get 1', expectedLift: 86, marginImpact: -13, overstockCoverage: 35 },
    { segmentId: 'seg-3', segmentName: 'Moisture Seekers', productGroup: 'Textured Hair Care', promotion: 'Hydration Station', promoValue: '25% OFF Moisture', expectedLift: 82, marginImpact: -10, overstockCoverage: 40 },
    { segmentId: 'seg-4', segmentName: 'Natural Hair Newbies', productGroup: 'Textured Hair Care', promotion: 'Starter Kit', promoValue: '15% OFF First', expectedLift: 75, marginImpact: -8, overstockCoverage: 20 },
  ],
  // Michaels Categories - 2 segments
  'Christmas Trees': [
    { segmentId: 'mseg-1', segmentName: 'Holiday Decorators', productGroup: 'Christmas Decor Collections', promotion: 'Holiday Decor Sale', promoValue: '60% OFF Decor', expectedLift: 92, marginImpact: -22, overstockCoverage: 88 },
    { segmentId: 'mseg-2', segmentName: 'Premium Tree Seekers', productGroup: 'Christmas Trees', promotion: 'Premium Tree Sale', promoValue: '60% OFF Trees', expectedLift: 95, marginImpact: -25, overstockCoverage: 85 },
  ],
  'Christmas Decor Collections': [
    { segmentId: 'mseg-1', segmentName: 'Holiday Decorators', productGroup: 'Christmas Decor Collections', promotion: 'Holiday Decor Sale', promoValue: '60% OFF Decor', expectedLift: 92, marginImpact: -22, overstockCoverage: 88 },
    { segmentId: 'mseg-2', segmentName: 'Premium Tree Seekers', productGroup: 'Christmas Trees', promotion: 'Premium Tree Sale', promoValue: '60% OFF Trees', expectedLift: 95, marginImpact: -25, overstockCoverage: 85 },
  ],
  // TSC Categories - 2 segments
  'Home Decor': [
    { segmentId: 'tseg-1', segmentName: 'Farmhouse Enthusiasts', productGroup: 'Home Decor', promotion: 'Farmhouse Favorites Sale', promoValue: '60% OFF Home', expectedLift: 88, marginImpact: -20, overstockCoverage: 82 },
    { segmentId: 'tseg-2', segmentName: 'Holiday Shoppers', productGroup: 'Christmas Decor', promotion: 'Holiday Home Sale', promoValue: '60% OFF Decor', expectedLift: 91, marginImpact: -22, overstockCoverage: 85 },
  ],
  'Christmas Decor': [
    { segmentId: 'tseg-1', segmentName: 'Farmhouse Enthusiasts', productGroup: 'Home Decor', promotion: 'Farmhouse Favorites Sale', promoValue: '60% OFF Home', expectedLift: 88, marginImpact: -20, overstockCoverage: 82 },
    { segmentId: 'tseg-2', segmentName: 'Holiday Shoppers', productGroup: 'Christmas Decor', promotion: 'Holiday Outdoor Sale', promoValue: '60% OFF Decor', expectedLift: 93, marginImpact: -24, overstockCoverage: 90 },
  ],
}

// Category-specific creatives with diverse images
const CATEGORY_CREATIVES: Record<string, { id: string; segmentId: string; segmentName: string; headline: string; subcopy: string; cta: string; tone: string; hasOffer: boolean; offerBadge: string; complianceStatus: string; reasoning: string; image: string; approved: boolean }[]> = {
  'Apparel': [
    { id: 'cr-1', segmentId: 'seg-1', segmentName: 'Fashion Forward VIPs', headline: 'VIP First Look: New Arrivals', subcopy: 'BaBylissPRO styling tools for the pros', cta: 'Shop New In', tone: 'Exclusive', hasOffer: true, offerBadge: '20% OFF', complianceStatus: 'approved', reasoning: 'Exclusivity drives VIP engagement and early adoption', image: '/images/styling_tools/SBS-021477.jpg', approved: false },
    { id: 'cr-2', segmentId: 'seg-2', segmentName: 'Seasonal Shoppers', headline: 'Season Finale: Up to 40% OFF', subcopy: 'Stock up on Olaplex bond repair', cta: 'Shop the Sale', tone: 'Urgent', hasOffer: true, offerBadge: '40% OFF', complianceStatus: 'approved', reasoning: 'Urgency messaging aligns with seasonal shopping behavior', image: '/images/hair_care/SBS-009616.jpg', approved: false },
    { id: 'cr-3', segmentId: 'seg-3', segmentName: 'Basics Loyalists', headline: 'Stock Up on Essentials', subcopy: 'Wella Color Charm for perfect tones', cta: 'Build Your Routine', tone: 'Practical', hasOffer: true, offerBadge: 'Buy 3 Get 1', complianceStatus: 'approved', reasoning: 'Value-focused messaging for repeat essentials buyers', image: '/images/hair_color/WELLA17.jpg', approved: false },
    { id: 'cr-4', segmentId: 'seg-4', segmentName: 'Trend Explorers', headline: 'Trending Now: Bold Colors Await', subcopy: 'Manic Panic vivid colors for the bold', cta: 'Explore Trends', tone: 'Inspiring', hasOffer: true, offerBadge: '15% OFF', complianceStatus: 'pending', reasoning: 'Discovery-focused for browsers who need a push', image: '/images/hair_color/MANIC2.jpg', approved: false },
  ],
  'Electronics': [
    { id: 'cr-1', segmentId: 'seg-1', segmentName: 'Tech Enthusiasts', headline: 'Pro Tools for Pros', subcopy: 'Hot Tools 24K gold curling iron', cta: 'Get It First', tone: 'Exciting', hasOffer: true, offerBadge: '$50 OFF + Gift', complianceStatus: 'approved', reasoning: 'Early access appeals to tech-forward customers', image: '/images/styling_tools/SBS-345825.jpg', approved: false },
    { id: 'cr-2', segmentId: 'seg-2', segmentName: 'Practical Upgraders', headline: 'Smart Upgrade, Smart Savings', subcopy: 'Ion Magnesium flat iron technology', cta: 'Upgrade Now', tone: 'Trustworthy', hasOffer: true, offerBadge: '25% OFF', complianceStatus: 'approved', reasoning: 'Value and reliability messaging for practical buyers', image: '/images/styling_tools/ION105.jpg', approved: false },
    { id: 'cr-3', segmentId: 'seg-3', segmentName: 'Accessory Collectors', headline: 'Complete Your Setup', subcopy: 'Revlon one-step volumizer brush', cta: 'Build Your Bundle', tone: 'Helpful', hasOffer: true, offerBadge: 'Buy 2 Get 30%', complianceStatus: 'approved', reasoning: 'Cross-sell opportunity for accessory enthusiasts', image: '/images/styling_tools/SBS-170402.jpg', approved: false },
    { id: 'cr-4', segmentId: 'seg-4', segmentName: 'Deal Hunters', headline: 'Clearance Alert: Up to 50% OFF', subcopy: 'Andis T-Outliner trimmer deals', cta: 'Grab the Deal', tone: 'Urgent', hasOffer: true, offerBadge: 'Up to 50% OFF', complianceStatus: 'pending', reasoning: 'Deep discount messaging for price-sensitive segment', image: '/images/mens_grooming/SBS-395010.jpg', approved: false },
  ],
  'Home & Garden': [
    { id: 'cr-1', segmentId: 'seg-1', segmentName: 'Home Renovators', headline: 'Transform Your Look', subcopy: 'Mielle rosemary mint for healthy hair', cta: 'Start Your Project', tone: 'Inspiring', hasOffer: true, offerBadge: '20% OFF $500+', complianceStatus: 'approved', reasoning: 'Project-focused messaging for high-intent renovators', image: '/images/hair_care/SBS-762003.jpg', approved: false },
    { id: 'cr-2', segmentId: 'seg-2', segmentName: 'Seasonal Decorators', headline: 'Refresh for the Season', subcopy: 'Cantu shea butter leave-in cream', cta: 'Shop Seasonal', tone: 'Fresh', hasOffer: true, offerBadge: '30% OFF Decor', complianceStatus: 'approved', reasoning: 'Seasonal refresh aligns with decorating habits', image: '/images/textured_hair_care/SBS-459068.jpg', approved: false },
    { id: 'cr-3', segmentId: 'seg-3', segmentName: 'Garden Enthusiasts', headline: 'Grow Your Beauty Routine', subcopy: 'The Doux mousse for perfect curls', cta: 'Shop Garden', tone: 'Nurturing', hasOffer: true, offerBadge: 'Buy 2 Get 1', complianceStatus: 'approved', reasoning: 'Passion-driven messaging for garden lovers', image: '/images/textured_hair_care/SBS-801153.jpg', approved: false },
    { id: 'cr-4', segmentId: 'seg-4', segmentName: 'Smart Home Adopters', headline: 'Smart Styling Solutions', subcopy: 'Camille Rose twisting butter', cta: 'Explore Smart Home', tone: 'Modern', hasOffer: true, offerBadge: '$75 OFF Bundle', complianceStatus: 'pending', reasoning: 'Tech-forward messaging for smart home interest', image: '/images/textured_hair_care/SBS-310320.jpg', approved: false },
  ],
  'Beauty': [
    { id: 'cr-1', segmentId: 'seg-1', segmentName: 'Beauty Insiders', headline: 'Insider Access: New Launches', subcopy: 'Ardell Wispies for natural drama', cta: 'Get Early Access', tone: 'Exclusive', hasOffer: true, offerBadge: 'Free Gift + 15%', complianceStatus: 'approved', reasoning: 'Exclusivity and newness drive insider engagement', image: '/images/cosmetics_lashes/SBS-001686.jpg', approved: false },
    { id: 'cr-2', segmentId: 'seg-2', segmentName: 'Skincare Devotees', headline: 'Restock Your Routine', subcopy: 'Palladio rice powder for flawless finish', cta: 'Shop Skincare', tone: 'Caring', hasOffer: true, offerBadge: '25% OFF', complianceStatus: 'approved', reasoning: 'Routine-focused for consistent skincare buyers', image: '/images/cosmetics_lashes/PLADIO7.jpg', approved: false },
    { id: 'cr-3', segmentId: 'seg-3', segmentName: 'Makeup Enthusiasts', headline: 'Color Your World', subcopy: 'OPI nail lacquer in Big Apple Red', cta: 'Explore Colors', tone: 'Playful', hasOffer: true, offerBadge: 'Buy 2 Get 1', complianceStatus: 'approved', reasoning: 'Creative messaging for makeup collectors', image: '/images/nails/SBS-011313.jpg', approved: false },
    { id: 'cr-4', segmentId: 'seg-4', segmentName: 'Clean Beauty Seekers', headline: 'Pure Beauty, Pure Savings', subcopy: 'RefectoCil professional brow dye', cta: 'Shop Clean Beauty', tone: 'Authentic', hasOffer: true, offerBadge: '20% OFF', complianceStatus: 'pending', reasoning: 'Values-aligned messaging for conscious consumers', image: '/images/cosmetics_lashes/IBN.jpg', approved: false },
  ],
  'Sports': [
    { id: 'cr-1', segmentId: 'seg-1', segmentName: 'Fitness Fanatics', headline: 'Gear Up for Greatness', subcopy: 'Wahl Magic Clip cordless clipper', cta: 'Shop Performance', tone: 'Motivating', hasOffer: true, offerBadge: '20% OFF', complianceStatus: 'approved', reasoning: 'Performance-focused for dedicated athletes', image: '/images/mens_grooming/SBS-785007.jpg', approved: false },
    { id: 'cr-2', segmentId: 'seg-2', segmentName: 'Weekend Warriors', headline: 'Weekend Ready, Wallet Happy', subcopy: 'Clubman Pinaud aftershave lotion', cta: 'Shop Activewear', tone: 'Friendly', hasOffer: true, offerBadge: 'Buy 2 Save 25%', complianceStatus: 'approved', reasoning: 'Value and comfort for casual athletes', image: '/images/mens_grooming/SBS-625016.jpg', approved: false },
    { id: 'cr-3', segmentId: 'seg-3', segmentName: 'Team Sports Parents', headline: 'Back to Grooming Season', subcopy: 'Gibs grooming beard oil', cta: 'Shop Youth Gear', tone: 'Supportive', hasOffer: true, offerBadge: '30% OFF Youth', complianceStatus: 'approved', reasoning: 'Family-focused for sports parents', image: '/images/mens_grooming/SBS-003300.jpg', approved: false },
    { id: 'cr-4', segmentId: 'seg-4', segmentName: 'Outdoor Adventurers', headline: 'Adventure Awaits', subcopy: 'Seche Vite fast dry top coat', cta: 'Gear Up', tone: 'Adventurous', hasOffer: true, offerBadge: '$40 OFF $150+', complianceStatus: 'pending', reasoning: 'Adventure-driven for outdoor enthusiasts', image: '/images/nails/SBS-215000.jpg', approved: false },
  ],
  // Sally Beauty Categories - Using product images from sally_products.json
  'Hair Color': [
    { id: 'cr-1', segmentId: 'seg-1', segmentName: 'Color Enthusiasts', headline: 'Transform Your Look', subcopy: 'Professional color results at home', cta: 'Shop Hair Color', tone: 'Exciting', hasOffer: true, offerBadge: '20% OFF', complianceStatus: 'approved', reasoning: 'Color transformation appeals to enthusiasts', image: '/images/hair_color/WELLA17.jpg', approved: false },
    { id: 'cr-2', segmentId: 'seg-2', segmentName: 'Vivid Creators', headline: 'Go Bold, Go Vivid', subcopy: 'Unleash your creativity with vibrant colors', cta: 'Explore Vivids', tone: 'Bold', hasOffer: true, offerBadge: 'Buy 2 Get 1', complianceStatus: 'approved', reasoning: 'Creative expression drives vivid color buyers', image: '/images/hair_color/MANIC2.jpg', approved: false },
    { id: 'cr-3', segmentId: 'seg-3', segmentName: 'Professional Stylists', headline: 'Pro Color, Pro Results', subcopy: 'Salon-quality formulas for professionals', cta: 'Shop Pro Color', tone: 'Professional', hasOffer: true, offerBadge: '25% OFF $75+', complianceStatus: 'approved', reasoning: 'Quality and reliability for professionals', image: '/images/hair_color/ION87.jpg', approved: false },
    { id: 'cr-4', segmentId: 'seg-4', segmentName: 'First-Time Colorists', headline: 'Your Color Journey Starts Here', subcopy: 'Easy-to-use formulas for beginners', cta: 'Start Coloring', tone: 'Encouraging', hasOffer: true, offerBadge: '15% OFF First', complianceStatus: 'pending', reasoning: 'Beginner-friendly messaging reduces hesitation', image: '/images/hair_color/ARTFOX2.jpg', approved: false },
  ],
  'Hair Care': [
    { id: 'cr-1', segmentId: 'seg-1', segmentName: 'Bond Repair Seekers', headline: 'Repair & Restore', subcopy: 'Olaplex bond-building technology', cta: 'Shop Olaplex', tone: 'Scientific', hasOffer: true, offerBadge: '20% OFF', complianceStatus: 'approved', reasoning: 'Science-backed results for damaged hair', image: '/images/hair_care/SBS-009616.jpg', approved: false },
    { id: 'cr-2', segmentId: 'seg-2', segmentName: 'Natural Hair Lovers', headline: 'Nature Meets Haircare', subcopy: 'Rosemary mint for healthy growth', cta: 'Shop Mielle', tone: 'Natural', hasOffer: true, offerBadge: 'Buy 2 Save 25%', complianceStatus: 'approved', reasoning: 'Natural ingredients appeal to conscious buyers', image: '/images/hair_care/SBS-762003.jpg', approved: false },
    { id: 'cr-3', segmentId: 'seg-3', segmentName: 'Routine Restockers', headline: 'Restock Your Essentials', subcopy: 'Never run out of your favorites', cta: 'Restock Now', tone: 'Practical', hasOffer: true, offerBadge: '15% OFF', complianceStatus: 'approved', reasoning: 'Convenience messaging for loyal customers', image: '/images/hair_care/ION12.jpg', approved: false },
    { id: 'cr-4', segmentId: 'seg-4', segmentName: 'Treatment Seekers', headline: 'Deep Treatment, Deep Results', subcopy: 'Intensive care for your hair', cta: 'Shop Treatments', tone: 'Caring', hasOffer: true, offerBadge: '$10 OFF $50+', complianceStatus: 'pending', reasoning: 'Treatment-focused for problem solvers', image: '/images/hair_care/SBS-009285.jpg', approved: false },
  ],
  'Styling Tools': [
    { id: 'cr-1', segmentId: 'seg-1', segmentName: 'Pro Stylists', headline: 'Professional Tools, Pro Results', subcopy: 'BaBylissPRO nano titanium technology', cta: 'Shop Pro Tools', tone: 'Professional', hasOffer: true, offerBadge: '20% OFF', complianceStatus: 'approved', reasoning: 'Professional-grade appeals to stylists', image: '/images/styling_tools/SBS-021477.jpg', approved: false },
    { id: 'cr-2', segmentId: 'seg-2', segmentName: 'Home Stylists', headline: 'Salon Style at Home', subcopy: 'Hot Tools 24K gold curling iron', cta: 'Style at Home', tone: 'Empowering', hasOffer: true, offerBadge: '$25 OFF $100+', complianceStatus: 'approved', reasoning: 'Home styling empowerment messaging', image: '/images/styling_tools/SBS-345825.jpg', approved: false },
    { id: 'cr-3', segmentId: 'seg-3', segmentName: 'Tool Upgraders', headline: 'Upgrade Your Styling Game', subcopy: 'Ion magnesium flat iron technology', cta: 'Upgrade Now', tone: 'Modern', hasOffer: true, offerBadge: '30% OFF Select', complianceStatus: 'approved', reasoning: 'Upgrade messaging for existing tool owners', image: '/images/styling_tools/ION105.jpg', approved: false },
    { id: 'cr-4', segmentId: 'seg-4', segmentName: 'First Tool Buyers', headline: 'Start Your Styling Journey', subcopy: 'Revlon one-step volumizer brush', cta: 'Get Started', tone: 'Welcoming', hasOffer: true, offerBadge: '15% OFF First', complianceStatus: 'pending', reasoning: 'Entry-level messaging for new buyers', image: '/images/styling_tools/SBS-170402.jpg', approved: false },
  ],
  'Nails': [
    { id: 'cr-1', segmentId: 'seg-1', segmentName: 'Nail Artists', headline: 'Create Nail Art Magic', subcopy: 'OPI professional nail lacquer', cta: 'Shop OPI', tone: 'Creative', hasOffer: true, offerBadge: '25% OFF Pro', complianceStatus: 'approved', reasoning: 'Creative expression for nail artists', image: '/images/nails/SBS-011313.jpg', approved: false },
    { id: 'cr-2', segmentId: 'seg-2', segmentName: 'Gel Enthusiasts', headline: 'Long-Lasting Gel Perfection', subcopy: 'Gelish soak-off gel polish', cta: 'Shop Gel', tone: 'Lasting', hasOffer: true, offerBadge: 'Buy 3 Get 1', complianceStatus: 'approved', reasoning: 'Durability appeals to gel lovers', image: '/images/nails/SBS-004882.jpg', approved: false },
    { id: 'cr-3', segmentId: 'seg-3', segmentName: 'DIY Manicurists', headline: 'Salon Nails at Home', subcopy: 'Seche Vite fast dry top coat', cta: 'DIY Nails', tone: 'Practical', hasOffer: true, offerBadge: '20% OFF Kits', complianceStatus: 'approved', reasoning: 'DIY empowerment for home manicurists', image: '/images/nails/SBS-215000.jpg', approved: false },
    { id: 'cr-4', segmentId: 'seg-4', segmentName: 'Color Collectors', headline: 'Expand Your Color Collection', subcopy: 'Pure acetone for perfect prep', cta: 'Collect Colors', tone: 'Fun', hasOffer: true, offerBadge: 'Buy 2 Save 30%', complianceStatus: 'pending', reasoning: 'Collection mindset for color enthusiasts', image: '/images/nails/BTYSEC9.jpg', approved: false },
  ],
  'Cosmetics & Lashes': [
    { id: 'cr-1', segmentId: 'seg-1', segmentName: 'Lash Lovers', headline: 'Lashes That Wow', subcopy: 'Ardell Wispies for natural drama', cta: 'Shop Lashes', tone: 'Glamorous', hasOffer: true, offerBadge: 'Buy 2 Get 1', complianceStatus: 'approved', reasoning: 'Glamour messaging for lash enthusiasts', image: '/images/cosmetics_lashes/SBS-001686.jpg', approved: false },
    { id: 'cr-2', segmentId: 'seg-2', segmentName: 'Brow Perfectionists', headline: 'Perfect Brows Every Time', subcopy: 'RefectoCil professional brow dye', cta: 'Shop Brows', tone: 'Precise', hasOffer: true, offerBadge: '20% OFF Brows', complianceStatus: 'approved', reasoning: 'Precision appeals to brow perfectionists', image: '/images/cosmetics_lashes/IBN.jpg', approved: false },
    { id: 'cr-3', segmentId: 'seg-3', segmentName: 'Makeup Minimalists', headline: 'Effortless Beauty Essentials', subcopy: 'Palladio rice powder for flawless finish', cta: 'Shop Essentials', tone: 'Simple', hasOffer: true, offerBadge: '15% OFF Basics', complianceStatus: 'approved', reasoning: 'Simplicity for minimalist beauty lovers', image: '/images/cosmetics_lashes/PLADIO7.jpg', approved: false },
    { id: 'cr-4', segmentId: 'seg-4', segmentName: 'Pro MUAs', headline: 'Pro-Grade Cosmetics', subcopy: 'Duo lash adhesive for all-day hold', cta: 'Shop Pro', tone: 'Professional', hasOffer: true, offerBadge: '$15 OFF $75+', complianceStatus: 'pending', reasoning: 'Professional quality for MUAs', image: '/images/cosmetics_lashes/SBS-240027.jpg', approved: false },
  ],
  "Men's Grooming": [
    { id: 'cr-1', segmentId: 'seg-1', segmentName: 'Barber Pros', headline: 'Barber-Grade Precision', subcopy: 'Andis T-Outliner for clean lines', cta: 'Shop Clippers', tone: 'Professional', hasOffer: true, offerBadge: '25% OFF Clippers', complianceStatus: 'approved', reasoning: 'Professional precision for barbers', image: '/images/mens_grooming/SBS-395010.jpg', approved: false },
    { id: 'cr-2', segmentId: 'seg-2', segmentName: 'Beard Enthusiasts', headline: 'Beard Care Essentials', subcopy: 'Gibs grooming beard oil for the perfect beard', cta: 'Shop Beard Care', tone: 'Masculine', hasOffer: true, offerBadge: 'Buy 2 Get 1', complianceStatus: 'approved', reasoning: 'Beard pride messaging for enthusiasts', image: '/images/mens_grooming/SBS-003300.jpg', approved: false },
    { id: 'cr-3', segmentId: 'seg-3', segmentName: 'Home Groomers', headline: 'Pro Grooming at Home', subcopy: 'Wahl Magic Clip cordless clipper', cta: 'Groom at Home', tone: 'Practical', hasOffer: true, offerBadge: '20% OFF Kits', complianceStatus: 'approved', reasoning: 'Home grooming convenience', image: '/images/mens_grooming/SBS-785007.jpg', approved: false },
    { id: 'cr-4', segmentId: 'seg-4', segmentName: 'Classic Gentlemen', headline: 'Timeless Grooming Classics', subcopy: 'Clubman Pinaud aftershave tradition', cta: 'Shop Classics', tone: 'Classic', hasOffer: true, offerBadge: '15% OFF Aftershave', complianceStatus: 'pending', reasoning: 'Classic appeal for traditional gentlemen', image: '/images/mens_grooming/SBS-625016.jpg', approved: false },
  ],
  'Textured Hair Care': [
    { id: 'cr-1', segmentId: 'seg-1', segmentName: 'Curl Definers', headline: 'Define Your Curls', subcopy: 'The Doux mousse for perfect definition', cta: 'Shop Curl Care', tone: 'Empowering', hasOffer: true, offerBadge: '20% OFF Curls', complianceStatus: 'approved', reasoning: 'Curl empowerment messaging', image: '/images/textured_hair_care/SBS-801153.jpg', approved: false },
    { id: 'cr-2', segmentId: 'seg-2', segmentName: 'Protective Stylists', headline: 'Protect & Style', subcopy: 'Camille Rose twisting butter for styles that last', cta: 'Shop Protective', tone: 'Nurturing', hasOffer: true, offerBadge: 'Buy 2 Get 1', complianceStatus: 'approved', reasoning: 'Protection-focused for style longevity', image: '/images/textured_hair_care/SBS-310320.jpg', approved: false },
    { id: 'cr-3', segmentId: 'seg-3', segmentName: 'Moisture Seekers', headline: 'Hydration Station', subcopy: 'Cantu shea butter leave-in cream', cta: 'Shop Moisture', tone: 'Nourishing', hasOffer: true, offerBadge: '25% OFF Moisture', complianceStatus: 'approved', reasoning: 'Moisture-focused for dry hair concerns', image: '/images/textured_hair_care/SBS-459068.jpg', approved: false },
    { id: 'cr-4', segmentId: 'seg-4', segmentName: 'Natural Hair Newbies', headline: 'Start Your Natural Journey', subcopy: 'Mielle rosemary mint oil for growth', cta: 'Get Started', tone: 'Welcoming', hasOffer: true, offerBadge: '15% OFF First', complianceStatus: 'pending', reasoning: 'Beginner-friendly for natural hair newbies', image: '/images/textured_hair_care/SBS-762003.jpg', approved: false },
  ],
  // Michaels Categories - 2 segments
  'Christmas Trees': [
    { id: 'cr-1', segmentId: 'mseg-1', segmentName: 'Holiday Decorators', headline: '60% OFF Holiday Decor!', subcopy: 'Ornaments, tree toppers, and festive lights', cta: 'Shop Decor', tone: 'Festive', hasOffer: true, offerBadge: '60% OFF Decor', complianceStatus: 'approved', reasoning: 'Holiday decor enthusiasts seeking ornaments and accessories', image: '/images/christmas_decor_collections/10788224_1.jpg', approved: false },
    { id: 'cr-2', segmentId: 'mseg-2', segmentName: 'Premium Tree Seekers', headline: '60% OFF Christmas Trees!', subcopy: 'Premium pre-lit trees with warm white LEDs', cta: 'Shop Trees', tone: 'Luxurious', hasOffer: true, offerBadge: '60% OFF Trees', complianceStatus: 'approved', reasoning: 'Quality messaging for premium tree seekers', image: '/images/christmas_trees/10772929_15.jpg', approved: false },
  ],
  'Christmas Decor Collections': [
    { id: 'cr-1', segmentId: 'mseg-1', segmentName: 'Holiday Decorators', headline: '60% OFF Holiday Decor!', subcopy: 'Ornaments, tree toppers, and festive lights', cta: 'Shop Decor', tone: 'Festive', hasOffer: true, offerBadge: '60% OFF Decor', complianceStatus: 'approved', reasoning: 'Holiday decor enthusiasts seeking ornaments and accessories', image: '/images/christmas_decor_collections/10788224_1.jpg', approved: false },
    { id: 'cr-2', segmentId: 'mseg-2', segmentName: 'Premium Tree Seekers', headline: '60% OFF Christmas Trees!', subcopy: 'Premium pre-lit trees with warm white LEDs', cta: 'Shop Trees', tone: 'Luxurious', hasOffer: true, offerBadge: '60% OFF Trees', complianceStatus: 'approved', reasoning: 'Quality messaging for premium tree seekers', image: '/images/christmas_trees/10772929_15.jpg', approved: false },
  ],
  // TSC Categories - 2 segments
  'Home Decor': [
    { id: 'cr-1', segmentId: 'tseg-1', segmentName: 'Farmhouse Enthusiasts', headline: '60% OFF Farmhouse Favorites!', subcopy: 'Red Shed rustic home decor and country accents', cta: 'Shop Home', tone: 'Rustic', hasOffer: true, offerBadge: '60% OFF Home', complianceStatus: 'approved', reasoning: 'Country-style appeal for farmhouse decor lovers', image: 'images/home_decor/253294399.webp', approved: false },
    { id: 'cr-2', segmentId: 'tseg-2', segmentName: 'Holiday Shoppers', headline: '60% OFF Holiday Decor!', subcopy: 'Festive outdoor decorations and porch accents', cta: 'Shop Holiday', tone: 'Festive', hasOffer: true, offerBadge: '60% OFF Decor', complianceStatus: 'approved', reasoning: 'Seasonal appeal for holiday decoration shoppers', image: 'images/christmas_decor/252614899.webp', approved: false },
  ],
  'Christmas Decor': [
    { id: 'cr-1', segmentId: 'tseg-1', segmentName: 'Farmhouse Enthusiasts', headline: '60% OFF Farmhouse Favorites!', subcopy: 'Red Shed rustic home decor and country accents', cta: 'Shop Home', tone: 'Rustic', hasOffer: true, offerBadge: '60% OFF Home', complianceStatus: 'approved', reasoning: 'Country-style appeal for farmhouse decor lovers', image: 'images/home_decor/252829299.webp', approved: false },
    { id: 'cr-2', segmentId: 'tseg-2', segmentName: 'Holiday Shoppers', headline: '60% OFF Christmas Decor!', subcopy: 'Metal yard stakes, LED decorations, and festive door mats', cta: 'Shop Christmas', tone: 'Festive', hasOffer: true, offerBadge: '60% OFF Decor', complianceStatus: 'approved', reasoning: 'Outdoor holiday decoration appeal for seasonal shoppers', image: 'images/christmas_decor/252600999.webp', approved: false },
  ],
}

const deriveAudienceStrategy = (category: string, client?: 'sally' | 'michaels' | 'tsc') => {
  // For Michaels, use Christmas Trees as default category if not specified
  // For TSC, use Home Decor as default category if not specified
  let effectiveCategory = category
  if (client === 'michaels' && !CATEGORY_SEGMENTS[category]) {
    effectiveCategory = 'Christmas Trees'
  } else if (client === 'tsc' && !CATEGORY_SEGMENTS[category]) {
    effectiveCategory = 'Home Decor'
  }
  
  const segments = CATEGORY_SEGMENTS[effectiveCategory] || (client === 'michaels' ? CATEGORY_SEGMENTS['Christmas Trees'] : client === 'tsc' ? CATEGORY_SEGMENTS['Home Decor'] : CATEGORY_SEGMENTS['Hair Color'])
  return {
    segments,
    totalCoverage: segments.reduce((acc, s) => acc + s.percentage, 0),
    segmentationLayers: client === 'michaels' 
      ? [
          { name: 'Purchase Recency', type: 'rule-based' as const },
          { name: 'Seasonal Buyer', type: 'statistical' as const },
          { name: 'Holiday Affinity', type: 'statistical' as const },
          { name: 'Category Preference', type: 'rule-based' as const },
        ]
      : client === 'tsc'
      ? [
          { name: 'Purchase Recency', type: 'rule-based' as const },
          { name: 'Farmhouse Affinity', type: 'statistical' as const },
          { name: 'Seasonal Buyer', type: 'statistical' as const },
          { name: 'Product Category', type: 'rule-based' as const },
        ]
      : [
          { name: 'Lifecycle', type: 'rule-based' as const },
          { name: 'Value Tier (RFM)', type: 'statistical' as const },
          { name: 'Promo Sensitivity', type: 'statistical' as const },
          { name: 'Category Affinity', type: 'rule-based' as const },
        ]
  }
}

const deriveOfferMapping = (category: string, client?: 'sally' | 'michaels' | 'tsc') => {
  // For Michaels, use Christmas Trees as default if category not found
  // For TSC, use Home Decor as default if category not found
  if (client === 'michaels' && !CATEGORY_OFFERS[category]) {
    return CATEGORY_OFFERS['Christmas Trees'] || CATEGORY_OFFERS['Hair Color']
  }
  if (client === 'tsc' && !CATEGORY_OFFERS[category]) {
    return CATEGORY_OFFERS['Home Decor'] || CATEGORY_OFFERS['Hair Color']
  }
  return CATEGORY_OFFERS[category] || CATEGORY_OFFERS['Hair Color']
}

const deriveCreatives = (category: string, segmentNames?: string[], client?: 'sally' | 'michaels' | 'tsc') => {
  // For Michaels, use Christmas Trees as default if category not found
  // For TSC, use Home Decor as default if category not found
  let effectiveCategory = category
  if (client === 'michaels' && !CATEGORY_CREATIVES[category]) {
    effectiveCategory = 'Christmas Trees'
  } else if (client === 'tsc' && !CATEGORY_CREATIVES[category]) {
    effectiveCategory = 'Home Decor'
  }
  
  const baseCreatives = CATEGORY_CREATIVES[effectiveCategory] || (client === 'michaels' ? CATEGORY_CREATIVES['Christmas Trees'] : client === 'tsc' ? CATEGORY_CREATIVES['Home Decor'] : CATEGORY_CREATIVES['Hair Color'])
  
  // Get product groups to use their images (client-specific)
  const productGroups = getProductGroupsByClient(client || 'sally', segmentNames)
  
  // Map creatives to use product images from their corresponding segment's product group
  return baseCreatives.map((creative, index) => {
    const productGroup = productGroups[index]
    // Use the first product image from the segment's product group
    const productImage = productGroup?.skus?.[0]?.image || creative.image
    
    return {
      ...creative,
      segmentName: segmentNames?.[index] || creative.segmentName,
      image: productImage
    }
  })
}

export function CampaignWorkspace() {
  // Workspace state
  const [activeTab, setActiveTab] = useState<'draft' | 'active' | 'completed'>('draft')
  const [searchQuery, setSearchQuery] = useState('')
  const [campaigns, setCampaigns] = useState<Campaign[]>([...MOCK_DRAFTS, ...MOCK_ACTIVE])
  
  // Active campaign flow state (for drafts)
  const [activeCampaignId, setActiveCampaignId] = useState<string | null>(null)
  // View mode for live/completed campaigns
  const [viewingCampaignId, setViewingCampaignId] = useState<string | null>(null)
  const [isAlanWorking, setIsAlanWorking] = useState(false)
  const [alanStatus, setAlanStatus] = useState<string | null>(null)
  const [alanThinkingSteps, setAlanThinkingSteps] = useState<string[]>([])

  const activeCampaign = campaigns.find(c => c.id === activeCampaignId)
  
  // Filter campaigns by tab
  const filteredCampaigns = campaigns.filter(c => {
    const matchesTab = activeTab === 'draft' ? c.status === 'draft' 
      : activeTab === 'active' ? (c.status === 'active' || c.status === 'scheduled')
      : c.status === 'completed'
    const matchesSearch = !searchQuery || 
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.createdBy.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesTab && matchesSearch
  })

  const draftCount = campaigns.filter(c => c.status === 'draft').length
  const activeCount = campaigns.filter(c => c.status === 'active' || c.status === 'scheduled').length
  const completedCount = campaigns.filter(c => c.status === 'completed').length

  const updateCampaign = (id: string, updates: Partial<Campaign>) => {
    setCampaigns(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c))
  }

  const handleStartCampaign = () => {
    const now = new Date()
    const newCampaign: Campaign = {
      id: `CAMP-${Date.now()}`,
      name: 'New Campaign',
      status: 'draft',
      currentStep: 'context',
      lockedSteps: [],
      stepStates: createDefaultStepStates(),
      goal: '',
      category: null,
      channel: null,
      region: null,
      lookbackWindow: 'Last 6 months',
      createdBy: 'John Doe',
      createdAt: now,
      lastSavedAt: now,
      lastSavedBy: 'John Doe',
      lastModifiedAt: now,
      lastModifiedBy: 'John Doe',
      progressPercent: 0,
      completedStepsCount: 0,
    }
    setCampaigns(prev => [newCampaign, ...prev])
    setActiveCampaignId(newCampaign.id)
  }

  const handleResumeCampaign = (campaignId: string) => {
    // Find the campaign and ensure it has the necessary data for its current step
    const campaign = campaigns.find(c => c.id === campaignId)
    if (campaign) {
      const updates: Partial<Campaign> = {}
      
      // Generate missing data based on current step
      if (campaign.currentStep === 'promo' && !campaign.offerMapping) {
        updates.offerMapping = deriveOfferMapping(campaign.category || 'Hair Color', campaign.client)
      }
      if (campaign.currentStep === 'creative' && !campaign.creatives) {
        const segmentNames = campaign.audienceStrategy?.segments.map(s => s.name)
        updates.creatives = deriveCreatives(campaign.category || 'Hair Color', segmentNames, campaign.client)
      }
      if (campaign.currentStep === 'segment' && !campaign.audienceStrategy) {
        updates.audienceStrategy = deriveAudienceStrategy(campaign.category || 'Hair Color', campaign.client)
      }
      if (campaign.currentStep === 'context' && campaign.goal && !campaign.derivedContext) {
        updates.derivedContext = deriveContext(campaign.goal, campaign.category || 'Hair Color', campaign.channel || undefined, campaign.client)
      }
      
      if (Object.keys(updates).length > 0) {
        updateCampaign(campaignId, updates)
      }
    }
    setActiveCampaignId(campaignId)
  }

  const handleSaveDraft = () => {
    if (!activeCampaign) return
    const now = new Date()
    updateCampaign(activeCampaign.id, {
      lastSavedAt: now,
      lastSavedBy: 'John Doe',
      lastModifiedAt: now,
      lastModifiedBy: 'John Doe',
    })
    setActiveCampaignId(null)
  }

  const handleExitFlow = () => {
    setActiveCampaignId(null)
  }

  const handleLockStep = async (
    step: CampaignStep,
    nextStep: CampaignStep,
    statusMsg: string,
    thinkingSteps: string[],
    deriveData: () => Partial<Campaign>
  ) => {
    if (!activeCampaign) return
    setIsAlanWorking(true)
    setAlanStatus(statusMsg)
    setAlanThinkingSteps([])
    
    // Simulate thinking steps one by one
    for (let i = 0; i < thinkingSteps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 800))
      setAlanThinkingSteps(prev => [...prev, thinkingSteps[i]])
    }
    
    await new Promise(resolve => setTimeout(resolve, 500))
    const derived = deriveData()
    const completedCount = activeCampaign.completedStepsCount + 1
    updateCampaign(activeCampaign.id, {
      ...derived,
      lockedSteps: [...activeCampaign.lockedSteps, step],
      currentStep: nextStep,
      stepStates: {
        ...activeCampaign.stepStates,
        [step]: { status: 'approved', completedAt: new Date() },
        [nextStep]: { status: 'ready' }
      },
      completedStepsCount: completedCount,
      progressPercent: Math.round((completedCount / 6) * 100),
      lastModifiedAt: new Date(),
      lastModifiedBy: 'John Doe',
    })
    setIsAlanWorking(false)
    setAlanStatus(null)
    setAlanThinkingSteps([])
  }

  // Navigate to a specific step (for going back to completed steps)
  const handleGoToStep = (step: CampaignStep) => {
    if (!activeCampaign) return
    updateCampaign(activeCampaign.id, { currentStep: step })
  }

  // Get viewing campaign (for live/completed view)
  const viewingCampaign = campaigns.find(c => c.id === viewingCampaignId)

  // If we're in an active campaign flow (draft), show the flow UI
  if (activeCampaign) {
    return (
      <CampaignFlowView
        campaign={activeCampaign}
        isAlanWorking={isAlanWorking}
        alanStatus={alanStatus}
        alanThinkingSteps={alanThinkingSteps}
        onUpdate={(updates) => updateCampaign(activeCampaign.id, updates)}
        onLockStep={handleLockStep}
        onGoToStep={handleGoToStep}
        onSaveDraft={handleSaveDraft}
        onExit={handleExitFlow}
      />
    )
  }

  // Helper for relative time
  const getRelativeTime = (date: Date) => {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)
    
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  // Get contextual agent suggestion
  const getAgentSuggestion = () => {
    const drafts = campaigns.filter(c => c.status === 'draft')
    if (drafts.length === 0) return null
    
    const needsAttention = drafts.find(c => c.currentStep === 'promo' || c.currentStep === 'creative')
    if (needsAttention) {
      return `Alan suggests completing ${needsAttention.name} — ${needsAttention.currentStep === 'promo' ? 'promo mapping' : 'creative review'} is next`
    }
    return drafts.length === 1 
      ? `You have 1 campaign in progress`
      : `You're midway through ${drafts.length} campaigns`
  }

  // Workspace Landing Page - Decision Hub Design
  return (
    <div className="min-h-screen bg-surface-secondary">
      {/* Global Header - Matching Other Screens */}
      <div className="bg-surface border-b border-border sticky top-0 z-50">
        <div className="px-8 py-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Rocket className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-text-primary">Campaign Engine</h1>
              <p className="text-sm text-text-muted">Create and manage AI-powered marketing campaigns</p>
            </div>
          </div>
          <Button variant="primary" onClick={handleStartCampaign} className="gap-2">
            <Plus className="w-4 h-4" />
            New Campaign
          </Button>
        </div>
      </div>

      {/* Quick Filters - Single Click, No Modals */}
      <div className="bg-surface border-b border-border">
        <div className="px-8 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              {/* State Tabs - Structural Separation */}
              <div className="flex gap-1">
                {[
                  { id: 'draft' as const, label: 'In Progress', count: draftCount },
                  { id: 'active' as const, label: 'Live', count: activeCount },
                  { id: 'completed' as const, label: 'Completed', count: completedCount },
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      'px-3 py-1.5 rounded-md text-sm font-medium transition-all',
                      activeTab === tab.id
                        ? 'bg-text-primary text-white'
                        : 'text-text-muted hover:text-text-primary hover:bg-surface-secondary'
                    )}
                  >
                    {tab.label}
                    {tab.count > 0 && (
                      <span className={cn(
                        'ml-1.5 text-xs',
                        activeTab === tab.id ? 'text-white/70' : 'text-text-muted'
                      )}>
                        {tab.count}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* Quick Sort Toggles */}
              <div className="flex items-center gap-2 pl-6 border-l border-border">
                <span className="text-xs text-text-muted">Sort:</span>
                <button className="px-2 py-1 text-xs text-text-secondary hover:text-text-primary rounded hover:bg-surface-secondary">
                  Recently updated
                </button>
                <button className="px-2 py-1 text-xs text-text-secondary hover:text-text-primary rounded hover:bg-surface-secondary">
                  Needs attention
                </button>
              </div>
            </div>

            {/* Search - Minimal */}
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 w-48 bg-surface-secondary border-0 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary/50"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="px-8 py-6">
        {/* Ambient Agent Hint */}
        {getAgentSuggestion() && activeTab === 'draft' && (
          <div className="mb-4 flex items-center gap-2 text-sm text-text-muted">
            <Sparkles className="w-3.5 h-3.5 text-agent" />
            <span>{getAgentSuggestion()}</span>
          </div>
        )}

        {filteredCampaigns.length === 0 ? (
          <EmptyState 
            tab={activeTab} 
            onStartCampaign={handleStartCampaign}
            onSwitchTab={setActiveTab}
          />
        ) : (
          <>
            {/* Draft Campaigns - Workspace Container */}
            {activeTab === 'draft' && (
              <div className="bg-surface-tertiary/50 rounded-xl p-4 space-y-3">
                {filteredCampaigns.map(campaign => (
                  <DraftCampaignCard 
                    key={campaign.id} 
                    campaign={campaign} 
                    onResume={() => handleResumeCampaign(campaign.id)}
                    getRelativeTime={getRelativeTime}
                  />
                ))}
              </div>
            )}

            {/* Active Campaigns - Operational Records */}
            {activeTab === 'active' && (
              <div className="space-y-3">
                {filteredCampaigns.map(campaign => (
                  <ActiveCampaignCard 
                    key={campaign.id} 
                    campaign={campaign}
                    onView={() => setViewingCampaignId(campaign.id)}
                  />
                ))}
              </div>
            )}

            {/* Completed Campaigns */}
            {activeTab === 'completed' && (
              <div className="space-y-3">
                {filteredCampaigns.map(campaign => (
                  <CompletedCampaignCard 
                    key={campaign.id} 
                    campaign={campaign}
                    onView={() => setViewingCampaignId(campaign.id)}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Live Campaign Modal - Overlay */}
      {viewingCampaign && (viewingCampaign.status === 'active' || viewingCampaign.status === 'completed') && (
        <LiveCampaignModal
          campaign={viewingCampaign}
          onClose={() => setViewingCampaignId(null)}
        />
      )}
    </div>
  )
}

// ============================================================================
// WORKSPACE COMPONENTS
// ============================================================================

function EmptyState({ 
  tab, 
  onStartCampaign,
  onSwitchTab 
}: { 
  tab: 'draft' | 'active' | 'completed'
  onStartCampaign: () => void
  onSwitchTab: (tab: 'draft' | 'active' | 'completed') => void
}) {
  const content = {
    draft: {
      title: 'No work in progress',
      subtitle: 'Start a new campaign to begin',
      hint: 'Alan will guide you through segments, products, and creatives',
      secondaryAction: 'View live campaigns',
      secondaryTab: 'active' as const,
    },
    active: {
      title: 'No live campaigns',
      subtitle: 'Launch a campaign to see it here',
      hint: 'Check your drafts to continue work in progress',
      secondaryAction: 'View drafts',
      secondaryTab: 'draft' as const,
    },
    completed: {
      title: 'No completed campaigns yet',
      subtitle: 'Finished campaigns will appear here',
      hint: 'View reports and insights from past campaigns',
      secondaryAction: 'View live',
      secondaryTab: 'active' as const,
    },
  }

  const c = content[tab]

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16"
    >
      <div className="w-12 h-12 rounded-xl bg-surface-tertiary flex items-center justify-center mb-4">
        <FileText className="w-6 h-6 text-text-muted" />
      </div>
      <h3 className="text-base font-medium text-text-primary mb-1">{c.title}</h3>
      <p className="text-sm text-text-muted mb-1">{c.subtitle}</p>
      <p className="text-xs text-text-muted/70 mb-6">{c.hint}</p>
      <div className="flex gap-2">
        <Button variant="primary" size="sm" onClick={onStartCampaign} className="gap-1.5">
          <Plus className="w-3.5 h-3.5" />
          New Campaign
        </Button>
        <Button variant="ghost" size="sm" onClick={() => onSwitchTab(c.secondaryTab)}>
          {c.secondaryAction}
        </Button>
      </div>
    </motion.div>
  )
}

function DraftCampaignCard({ 
  campaign, 
  onResume,
  getRelativeTime 
}: { 
  campaign: Campaign
  onResume: () => void
  getRelativeTime: (date: Date) => string
}) {
  const [isHovered, setIsHovered] = useState(false)
  
  // Get next step label for CTA
  const getNextStepLabel = () => {
    const stepLabels: Record<CampaignStep, string> = {
      context: 'Context',
      segment: 'Segments',
      product: 'Products',
      promo: 'Promos',
      creative: 'Creative',
      review: 'Review',
    }
    return stepLabels[campaign.currentStep]
  }

  const getStepStatus = (step: CampaignStep) => {
    if (campaign.lockedSteps.includes(step)) return 'completed'
    if (campaign.currentStep === step) return 'current'
    return 'pending'
  }

  // Semantic metadata line
  const getMetadataLine = () => {
    const parts = []
    if (campaign.category) parts.push(campaign.category)
    if (campaign.channel) parts.push(campaign.channel)
    if (campaign.region) parts.push(campaign.region)
    if (campaign.customerUniverseSize) {
      parts.push(`${(campaign.customerUniverseSize / 1000000).toFixed(1)}M customers`)
    }
    return parts.join(' · ')
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="bg-surface rounded-xl border border-border/60 p-4 hover:border-border transition-all group"
    >
      <div className="flex items-start gap-4">
        {/* Left Anchor: Status + Progress */}
        <div className="flex flex-col items-center pt-1">
          <div className="w-2 h-2 rounded-full bg-warning mb-2" title="In Progress" />
          <div className="w-0.5 h-12 bg-surface-tertiary rounded-full overflow-hidden">
            <div 
              className="w-full bg-primary transition-all"
              style={{ height: `${campaign.progressPercent}%` }}
            />
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Goal - The Soul (Dominant) */}
          <p className="text-base font-medium text-text-primary leading-snug mb-1 line-clamp-2">
            {campaign.goal || 'Define campaign objective...'}
          </p>
          
          {/* Campaign Name + Metadata + Creator (Secondary) */}
          <div className="flex items-center gap-2 mb-3">
            <span className="text-sm text-text-secondary">{campaign.name}</span>
            {getMetadataLine() && (
              <>
                <span className="text-text-muted">·</span>
                <span className="text-xs text-text-muted">{getMetadataLine()}</span>
              </>
            )}
            <span className="text-text-muted">·</span>
            <span className="text-xs text-text-muted">by {campaign.createdBy}</span>
          </div>

          {/* Step Chips - Linear Style (Only Progress Indicator) */}
          <div className="flex items-center gap-0.5">
            {STEPS.map((step, i) => {
              const status = getStepStatus(step.id)
              return (
                <div key={step.id} className="flex items-center">
                  <div className={cn(
                    'flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium transition-colors',
                    status === 'completed' ? 'bg-success/10 text-success' :
                    status === 'current' ? 'bg-primary text-white' :
                    'bg-surface-tertiary text-text-muted'
                  )}>
                    {status === 'completed' && <Check className="w-3 h-3" />}
                    {step.label}
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className={cn(
                      'w-3 h-px mx-0.5',
                      status === 'completed' ? 'bg-success' : 'bg-border'
                    )} />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Freshness - Contextual */}
          <span className="text-xs text-text-muted mr-2">
            {getRelativeTime(campaign.lastModifiedAt)}
          </span>

          {/* Hover Actions - Revealed on Hover */}
          <div className={cn(
            'flex items-center gap-1 transition-opacity',
            isHovered ? 'opacity-100' : 'opacity-0'
          )}>
            <button 
              className="p-1.5 hover:bg-surface-secondary rounded-md transition-colors"
              title="Duplicate"
            >
              <Copy className="w-3.5 h-3.5 text-text-muted" />
            </button>
            <button 
              className="p-1.5 hover:bg-surface-secondary rounded-md transition-colors"
              title="Archive"
            >
              <Archive className="w-3.5 h-3.5 text-text-muted" />
            </button>
            <button 
              className="p-1.5 hover:bg-danger/10 rounded-md transition-colors"
              title="Delete"
            >
              <Trash2 className="w-3.5 h-3.5 text-text-muted hover:text-danger" />
            </button>
          </div>

          {/* Primary CTA - Completes a Sentence */}
          <Button 
            variant="primary" 
            size="sm"
            onClick={onResume} 
            className="gap-1.5 ml-2"
          >
            Continue → {getNextStepLabel()}
          </Button>
        </div>
      </div>
    </motion.div>
  )
}

function ActiveCampaignCard({ campaign, onView }: { campaign: Campaign; onView: () => void }) {
  const [isHovered, setIsHovered] = useState(false)

  // Format date range
  const getDateRange = () => {
    if (!campaign.startDate || !campaign.endDate) return null
    const formatDate = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    return `${formatDate(campaign.startDate)} – ${formatDate(campaign.endDate)}`
  }

  // Semantic metadata line
  const getMetadataLine = () => {
    const parts = []
    if (campaign.category) parts.push(campaign.category)
    if (campaign.channel) parts.push(campaign.channel)
    if (campaign.customerUniverseSize) {
      parts.push(`${(campaign.customerUniverseSize / 1000000).toFixed(1)}M reach`)
    }
    return parts.join(' · ')
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="bg-surface rounded-xl border border-success/20 p-4 transition-all"
    >
      <div className="flex items-start gap-4">
        {/* Left Anchor: Status */}
        <div className="flex flex-col items-center pt-1">
          <div className="w-2 h-2 rounded-full bg-success animate-pulse" title="Live" />
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Goal - Dominant */}
          <p className="text-base font-medium text-text-primary leading-snug mb-1 line-clamp-2">
            {campaign.goal}
          </p>
          
          {/* Campaign Name + Metadata */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-text-secondary">{campaign.name}</span>
            {getMetadataLine() && (
              <>
                <span className="text-text-muted">·</span>
                <span className="text-xs text-text-muted">{getMetadataLine()}</span>
              </>
            )}
          </div>
        </div>

        {/* Right: Date + Actions */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Date Range - Operational Info */}
          {getDateRange() && (
            <span className="text-xs text-text-muted flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              {getDateRange()}
            </span>
          )}

          {/* Hover Actions */}
          <div className={cn(
            'flex items-center gap-1 transition-opacity',
            isHovered ? 'opacity-100' : 'opacity-0'
          )}>
            <button 
              className="p-1.5 hover:bg-surface-secondary rounded-md transition-colors"
              title="Pause"
            >
              <Pause className="w-3.5 h-3.5 text-text-muted" />
            </button>
            <button 
              className="p-1.5 hover:bg-surface-secondary rounded-md transition-colors"
              title="More"
            >
              <MoreHorizontal className="w-3.5 h-3.5 text-text-muted" />
            </button>
          </div>

          <Button variant="outline" size="sm" onClick={onView}>
            View
          </Button>
        </div>
      </div>
    </motion.div>
  )
}

function CompletedCampaignCard({ campaign, onView }: { campaign: Campaign; onView: () => void }) {
  // Semantic metadata line
  const getMetadataLine = () => {
    const parts = []
    if (campaign.category) parts.push(campaign.category)
    if (campaign.channel) parts.push(campaign.channel)
    if (campaign.customerUniverseSize) {
      parts.push(`${(campaign.customerUniverseSize / 1000000).toFixed(1)}M reached`)
    }
    return parts.join(' · ')
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-surface rounded-xl border border-border/40 p-4 opacity-70 hover:opacity-100 transition-all"
    >
      <div className="flex items-start gap-4">
        {/* Left Anchor: Status */}
        <div className="flex flex-col items-center pt-1">
          <div className="w-2 h-2 rounded-full bg-text-muted" title="Completed" />
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Goal */}
          <p className="text-base font-medium text-text-secondary leading-snug mb-1 line-clamp-1">
            {campaign.goal}
          </p>
          
          {/* Campaign Name + Metadata */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-text-muted">{campaign.name}</span>
            {getMetadataLine() && (
              <>
                <span className="text-text-muted/50">·</span>
                <span className="text-xs text-text-muted">{getMetadataLine()}</span>
              </>
            )}
          </div>
        </div>

        {/* Right: Action */}
        <Button variant="ghost" size="sm" className="shrink-0" onClick={onView}>
          View Report
        </Button>
      </div>
    </motion.div>
  )
}

// ============================================================================
// LIVE CAMPAIGN VIEW (Status & Assurance Surface)
// ============================================================================

function LiveCampaignModal({
  campaign,
  onClose,
}: {
  campaign: Campaign
  onClose: () => void
}) {
  const isCompleted = campaign.status === 'completed'
  
  // Calculate days remaining
  const getDaysRemaining = () => {
    if (!campaign.endDate) return null
    const now = new Date()
    const diff = Math.ceil((campaign.endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    return diff > 0 ? diff : 0
  }

  // Format date
  const formatDate = (date: Date) => date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

  // Mock performance data
  const performanceStatus = {
    reach: { status: 'on-track', label: '287K', sublabel: 'of 300K target' },
    engagement: { status: 'above', label: '4.2%', sublabel: 'vs 3.5% target' },
    conversion: { status: 'at', label: '2.8%', sublabel: 'at target' },
    delivery: { status: 'healthy', label: '94%', sublabel: 'delivered' },
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
          className="bg-surface rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center",
                isCompleted ? "bg-text-muted/10" : "bg-success/10"
              )}>
                {isCompleted ? (
                  <CheckCircle className="w-5 h-5 text-text-muted" />
                ) : (
                  <div className="relative">
                    <Rocket className="w-5 h-5 text-success" />
                    <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-success rounded-full animate-pulse" />
                  </div>
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-semibold text-text-primary">{campaign.name}</h2>
                  <span className={cn(
                    "px-2 py-0.5 rounded-full text-xs font-medium",
                    isCompleted ? "bg-text-muted/10 text-text-muted" : "bg-success/10 text-success"
                  )}>
                    {isCompleted ? 'COMPLETED' : 'LIVE'}
                  </span>
                </div>
                <p className="text-xs text-text-muted">
                  {campaign.channel} · {campaign.category} · {campaign.region}
                </p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-surface-secondary rounded-lg transition-colors"
            >
              <ArrowLeft className="w-4 h-4 text-text-muted" />
            </button>
          </div>

          {/* Content - Scrollable */}
          <div className="p-6 overflow-y-auto max-h-[calc(85vh-140px)]">
            {/* Campaign Details */}
            <div className="mb-5">
              <h3 className="text-xs font-medium text-text-muted uppercase tracking-wide mb-3">Campaign Details</h3>
              <div className="bg-surface-secondary rounded-lg p-4">
                <p className="text-sm text-text-primary font-medium mb-2">{campaign.goal}</p>
                <div className="flex items-center gap-4 text-xs text-text-muted">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {campaign.startDate && formatDate(campaign.startDate)} → {campaign.endDate && formatDate(campaign.endDate)}
                    {!isCompleted && getDaysRemaining() !== null && getDaysRemaining()! > 0 && (
                      <span className="text-text-secondary ml-1">({getDaysRemaining()}d left)</span>
                    )}
                  </span>
                  <span>·</span>
                  <span className="text-primary">{campaign.audienceStrategy?.segments.length || 4} segments</span>
                  <span>·</span>
                  <span className="text-primary">{campaign.offerMapping?.length || 4} promotions</span>
                  <span>·</span>
                  <span>{((campaign.customerUniverseSize || 0) / 1000000).toFixed(1)}M customers</span>
                </div>
              </div>
            </div>

            {/* Performance Snapshot */}
            <div className="mb-5">
              <h3 className="text-xs font-medium text-text-muted uppercase tracking-wide mb-3">Performance Snapshot</h3>
              <div className="grid grid-cols-4 gap-2">
                {Object.entries(performanceStatus).map(([key, data]) => (
                  <div key={key} className="text-center p-3 bg-surface-secondary rounded-lg">
                    <p className="text-[10px] text-text-muted capitalize mb-1">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                    <p className={cn(
                      "text-lg font-semibold",
                      data.status === 'on-track' || data.status === 'at' || data.status === 'healthy' ? 'text-success' :
                      data.status === 'above' ? 'text-primary' : 'text-warning'
                    )}>
                      {data.label}
                    </p>
                    <p className="text-[10px] text-text-muted">{data.sublabel}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Alerts */}
            <div>
              <h3 className="text-xs font-medium text-text-muted uppercase tracking-wide mb-3">Status</h3>
              <div className="flex items-center gap-2 p-3 bg-success/5 rounded-lg border border-success/20">
                <CheckCircle className="w-4 h-4 text-success" />
                <p className="text-sm text-success font-medium">Campaign is running as expected.</p>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="px-6 py-4 border-t border-border flex items-center justify-center bg-surface-secondary">
            <p className="text-xs text-text-muted">
              To modify fundamentals, duplicate or create new.
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

// ============================================================================
// CAMPAIGN FLOW VIEW (Agent Mode)
// ============================================================================

function CampaignFlowView({
  campaign,
  isAlanWorking,
  alanStatus,
  alanThinkingSteps,
  onUpdate,
  onLockStep,
  onGoToStep,
  onSaveDraft,
  onExit,
}: {
  campaign: Campaign
  isAlanWorking: boolean
  alanStatus: string | null
  alanThinkingSteps: string[]
  onUpdate: (updates: Partial<Campaign>) => void
  onLockStep: (step: CampaignStep, nextStep: CampaignStep, status: string, thinkingSteps: string[], derive: () => Partial<Campaign>) => void
  onGoToStep: (step: CampaignStep) => void
  onSaveDraft: () => void
  onExit: () => void
}) {
  // Get current step label
  const getCurrentStepLabel = () => {
    const stepLabels: Record<CampaignStep, string> = {
      context: 'Context',
      segment: 'Segments',
      product: 'Products',
      promo: 'Promos',
      creative: 'Creative',
      review: 'Review',
    }
    return stepLabels[campaign.currentStep]
  }

  return (
    <div className="min-h-screen bg-surface-secondary flex flex-col">
      {/* Persistent Global Header - The Map */}
      <div className="bg-surface border-b border-border sticky top-0 z-50">
        {/* Primary Context Bar */}
        <div className="px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={onExit} 
              className="p-1.5 hover:bg-surface-secondary rounded-md transition-colors"
              title="Back to Campaign Engine"
            >
              <ArrowLeft className="w-4 h-4 text-text-muted" />
            </button>
            
            {/* Global Context - Always Visible */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-text-muted">Campaign Engine</span>
              <span className="text-text-muted">/</span>
              <span className="text-lg font-semibold text-text-primary">{campaign.name}</span>
              <span className="text-text-muted">·</span>
              <span className="text-xs text-text-muted bg-surface-secondary px-2 py-0.5 rounded">
                {getCurrentStepLabel()}
              </span>
            </div>
          </div>

          {/* Flow Controls */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={onSaveDraft} className="gap-1.5">
              <Save className="w-3.5 h-3.5" />
              Save Draft
            </Button>
            <Button variant="outline" size="sm" onClick={onExit} className="gap-1.5">
              <LogOut className="w-3.5 h-3.5" />
              Exit
            </Button>
          </div>
        </div>
      </div>

      {/* Progress Stepper */}
      <div className="bg-surface border-b border-border px-6 py-3">
        <div className="flex items-center gap-2">
          {STEPS.map((step, i) => {
            const isLocked = campaign.lockedSteps.includes(step.id)
            const isCurrent = campaign.currentStep === step.id
            const stepState = campaign.stepStates[step.id]
            const StepIcon = step.icon
            const canNavigate = isLocked && !isAlanWorking // Can click on completed steps
            
            return (
              <div key={step.id} className="flex items-center">
                <button
                  onClick={() => canNavigate && onGoToStep(step.id)}
                  disabled={!canNavigate && !isCurrent}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all',
                    isLocked ? 'bg-success/10 text-success' :
                    isCurrent ? 'bg-primary text-white shadow-lg shadow-primary/25' :
                    stepState?.status === 'thinking' ? 'bg-agent/10 text-agent' :
                    'bg-surface-tertiary text-text-muted',
                    canNavigate && 'cursor-pointer hover:bg-success/20 hover:ring-2 hover:ring-success/30'
                  )}
                >
                  {isLocked ? <Check className="w-4 h-4" /> : 
                   stepState?.status === 'thinking' ? <Loader2 className="w-4 h-4 animate-spin" /> :
                   <StepIcon className="w-4 h-4" />}
                  {step.label}
                  {isLocked && <Lock className="w-3 h-3 ml-1" />}
                </button>
                {i < STEPS.length - 1 && (
                  <ChevronRight className={cn('w-5 h-5 mx-2', isLocked ? 'text-success' : 'text-border')} />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto bg-gradient-to-br from-surface via-surface to-primary/5">
        <div className="max-w-4xl mx-auto py-8 px-6">
          {/* Alan Working Indicator - Deep Research Style */}
          <AnimatePresence>
            {isAlanWorking && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mb-6 p-6 bg-gradient-to-r from-agent/5 via-primary/5 to-agent/5 border border-agent/20 rounded-2xl"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-agent to-primary flex items-center justify-center shadow-lg shadow-agent/25">
                    <Sparkles className="w-6 h-6 text-white animate-pulse" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-agent mb-2">{alanStatus}</p>
                    <div className="space-y-2">
                      {alanThinkingSteps.map((step, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="flex items-center gap-2 text-sm text-text-secondary"
                        >
                          <Check className="w-4 h-4 text-success" />
                          {step}
                        </motion.div>
                      ))}
                      {alanThinkingSteps.length < 4 && (
                        <div className="flex items-center gap-2 text-sm text-text-muted">
                          <Loader2 className="w-4 h-4 animate-spin text-agent" />
                          <span className="animate-pulse">Analyzing...</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Step Content */}
          <AnimatePresence mode="wait">
            {campaign.currentStep === 'context' && !campaign.derivedContext && (
              <ContextInputStep
                campaign={campaign}
                onUpdate={onUpdate}
                onSubmit={() =>
                  onLockStep('context', 'context', 'Alan is analyzing your campaign context...', [
                    'Parsing goal intent (clearance vs growth vs retention)',
                    'Identifying relevant customer signals',
                    'Evaluating channel and region implications',
                    'Generating strategic recommendations',
                  ], () => ({
                    derivedContext: deriveContext(campaign.goal, campaign.category!, campaign.channel || undefined, campaign.client)
                  }))
                }
                isWorking={isAlanWorking}
              />
            )}
            {campaign.currentStep === 'context' && campaign.derivedContext && (
              <ContextDecisionStep
                campaign={campaign}
                onConfirm={() =>
                  onLockStep('context', 'segment', 'Alan is designing your segmentation strategy...', [
                    'Building MECE segment structure',
                    'Applying lifecycle and value clustering',
                    'Calculating segment volumes',
                    'Optimizing for campaign objective',
                  ], () => ({
                    name: campaign.derivedContext!.campaignName,
                    audienceStrategy: deriveAudienceStrategy(campaign.category!, campaign.client)
                  }))
                }
                onGoBack={() => {
                  onUpdate({ derivedContext: undefined })
                }}
                isWorking={isAlanWorking}
              />
            )}
            {campaign.currentStep === 'segment' && (
              <AudienceStep
                campaign={campaign}
                onConfirm={() =>
                  onLockStep('segment', 'product', 'Alan is matching products to segments...', [
                    'Analyzing inventory levels per category',
                    'Matching product affinity to segments',
                    'Applying margin protection rules',
                    'Finalizing product groups',
                  ], () => ({
                    offerMapping: deriveOfferMapping(campaign.category!, campaign.client)
                  }))
                }
                onUpdateStrategy={(strategy) => onUpdate({ audienceStrategy: strategy })}
                onSaveDraft={onSaveDraft}
                isWorking={isAlanWorking}
              />
            )}
            {campaign.currentStep === 'product' && (
              <ProductStep
                campaign={campaign}
                onConfirm={() =>
                  onLockStep('product', 'promo', 'Alan is searching the promotion library...', [
                    'Scanning available promotions',
                    'Matching promos to product groups',
                    'Evaluating margin impact',
                    'Scoring promotion fit',
                  ], () => ({}))
                }
                onSaveDraft={onSaveDraft}
                isWorking={isAlanWorking}
              />
            )}
            {campaign.currentStep === 'promo' && (
              <OfferStep
                campaign={campaign}
                onConfirm={() => {
                  const segmentNames = campaign.audienceStrategy?.segments.map(s => s.name)
                  onLockStep('promo', 'creative', 'Alan is generating segment-specific creatives...', [
                    'Setting tone per segment',
                    'Generating headlines and copy',
                    'Matching imagery to messaging',
                    'Running compliance checks',
                  ], () => ({
                    creatives: deriveCreatives(campaign.category!, segmentNames, campaign.client),
                    promoSkipped: false
                  }))
                }}
                onSkipPromo={() => {
                  const segmentNames = campaign.audienceStrategy?.segments.map(s => s.name)
                  onLockStep('promo', 'creative', 'Alan is generating segment-specific creatives...', [
                    'Setting tone per segment',
                    'Generating headlines and copy',
                    'Matching imagery to messaging',
                    'Running compliance checks',
                  ], () => ({
                    creatives: deriveCreatives(campaign.category!, segmentNames, campaign.client).map(c => ({ ...c, hasOffer: false, offerBadge: undefined })),
                    promoSkipped: true
                  }))
                }}
                onSaveDraft={onSaveDraft}
                isWorking={isAlanWorking}
              />
            )}
            {campaign.currentStep === 'creative' && (
              <CreativeStep
                campaign={campaign}
                onApprove={(id) =>
                  onUpdate({
                    creatives: campaign.creatives?.map(c =>
                      c.id === id ? { ...c, approved: !c.approved } : c
                    )
                  })
                }
                onRegenerate={(id) => {
                  // Generate new creative content for this segment
                  const alternativeHeadlines = [
                    'Exclusive Offer Just for You',
                    'Don\'t Miss Out on Savings',
                    'Your Style, Your Price',
                    'Limited Time: Special Deal',
                    'Refresh Your Wardrobe Today',
                    'New Styles Await You',
                    'Shop the Latest Trends',
                  ]
                  const alternativeSubcopy = [
                    'Handpicked styles at prices you\'ll love',
                    'Shop now and save on your favorites',
                    'Discover new arrivals at amazing prices',
                    'Quality meets affordability',
                    'Treat yourself to something special',
                    'Curated just for you',
                    'Style that speaks to you',
                  ]
                  const randomHeadline = alternativeHeadlines[Math.floor(Math.random() * alternativeHeadlines.length)]
                  const randomSubcopy = alternativeSubcopy[Math.floor(Math.random() * alternativeSubcopy.length)]
                  
                  // Find the creative and update it
                  const updatedCreatives = campaign.creatives?.map(c => {
                    if (c.id === id) {
                      return { 
                        ...c, 
                        headline: randomHeadline,
                        subcopy: randomSubcopy,
                        approved: false // Reset approval on regenerate
                      }
                    }
                    return c
                  })
                  
                  if (updatedCreatives) {
                    onUpdate({ creatives: updatedCreatives })
                  }
                }}
                onConfirm={() =>
                  onLockStep('creative', 'review', 'Alan is validating your campaign...', [
                    'Checking all steps completed',
                    'Validating segment coverage',
                    'Confirming creative approvals',
                    'Preparing launch summary',
                  ], () => ({}))
                }
                onSaveDraft={onSaveDraft}
                isWorking={isAlanWorking}
              />
            )}
            {campaign.currentStep === 'review' && (
              <ReviewStep
                campaign={campaign}
                onSaveDraft={onSaveDraft}
                onLaunch={() => {
                  onUpdate({ status: 'active' })
                  onExit()
                }}
              />
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// STEP COMPONENTS
// ============================================================================

// Assumption token type with confidence
type ConfidenceLevel = 'high' | 'medium' | 'low'
type AssumptionSource = 'assumed' | 'inferred' | 'confirmed'

interface AssumptionToken {
  id: string
  key: string
  value: string
  source: AssumptionSource
  confidence: ConfidenceLevel
  reason: string
  editable: boolean
}

interface AgentState {
  phase: 'idle' | 'interpreting' | 'hypothesizing' | 'clarifying' | 'ready'
  goalReceived: boolean
  hypotheses: { label: string; value: string; confidence: ConfidenceLevel }[]
  assumptions: AssumptionToken[]
  clarifications: { id: string; question: string; optional: boolean; answer: string }[]
  nextAction: string
}

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
  const [agentState, setAgentState] = useState<AgentState>({
    phase: 'idle',
    goalReceived: false,
    hypotheses: [],
    assumptions: [],
    clarifications: [],
    nextAction: ''
  })
  const [isPaused, setIsPaused] = useState(false)
  const [editingAssumption, setEditingAssumption] = useState<string | null>(null)
  const [isExamplesExpanded, setIsExamplesExpanded] = useState(false)

  const canSubmit = campaign.goal && campaign.goal.trim().length > 10

  // Generate a proper campaign name from goal
  const generateCampaignName = (goal: string): string => {
    const lowerGoal = goal.toLowerCase()
    
    // Extract key elements
    let intent = ''
    let audience = ''
    let category = ''
    
    if (lowerGoal.includes('clear') || lowerGoal.includes('inventory') || lowerGoal.includes('excess')) {
      intent = 'Clearance'
    } else if (lowerGoal.includes('repeat') || lowerGoal.includes('retention')) {
      intent = 'Retention'
    } else if (lowerGoal.includes('vip')) {
      intent = 'VIP'
    } else if (lowerGoal.includes('full-price') || lowerGoal.includes('sell-through')) {
      intent = 'Full-Price'
    } else {
      intent = 'Engagement'
    }
    
    if (lowerGoal.includes('vip')) audience = 'VIP'
    else if (lowerGoal.includes('new customer')) audience = 'New Customers'
    
    if (lowerGoal.includes('kids') || lowerGoal.includes('children')) category = 'Kids'
    else if (lowerGoal.includes('women')) category = 'Women\'s'
    else if (lowerGoal.includes('men')) category = 'Men\'s'
    else if (lowerGoal.includes('apparel')) category = 'Apparel'
    else if (lowerGoal.includes('footwear') || lowerGoal.includes('shoes')) category = 'Footwear'
    
    const parts = [category, audience, intent, 'Campaign'].filter(Boolean)
    return parts.join(' ')
  }

  // Derive hypotheses from goal
  const deriveHypotheses = (goal: string) => {
    const hypotheses: { label: string; value: string; confidence: ConfidenceLevel }[] = []
    const lowerGoal = goal.toLowerCase()
    
    // Primary intent
    if (lowerGoal.includes('clear') || lowerGoal.includes('overstock') || lowerGoal.includes('inventory')) {
      hypotheses.push({ label: 'Primary intent', value: 'Inventory clearance', confidence: 'high' })
    } else if (lowerGoal.includes('repeat') || lowerGoal.includes('loyalty') || lowerGoal.includes('vip')) {
      hypotheses.push({ label: 'Primary intent', value: 'Customer retention', confidence: 'high' })
    } else if (lowerGoal.includes('new') || lowerGoal.includes('acquire')) {
      hypotheses.push({ label: 'Primary intent', value: 'Customer acquisition', confidence: 'high' })
    } else {
      hypotheses.push({ label: 'Primary intent', value: 'Engagement campaign', confidence: 'medium' })
    }
    
    // Constraint detection
    if (lowerGoal.includes('margin') || lowerGoal.includes('protect')) {
      hypotheses.push({ label: 'Constraint', value: 'Margin protection required', confidence: 'high' })
    }
    
    // Channel inference
    if (lowerGoal.includes('online')) {
      hypotheses.push({ label: 'Likely channel', value: 'Online', confidence: 'high' })
    } else if (lowerGoal.includes('store')) {
      hypotheses.push({ label: 'Likely channel', value: 'In-store', confidence: 'high' })
    } else {
      hypotheses.push({ label: 'Likely channel', value: 'Online (default)', confidence: 'medium' })
    }
    
    // Risk identification
    if (lowerGoal.includes('clear') && !lowerGoal.includes('margin')) {
      hypotheses.push({ label: 'Risk', value: 'Over-discounting VIP customers', confidence: 'medium' })
    }
    
    return hypotheses
  }

  // Generate assumptions from hypotheses
  const generateAssumptions = (hypotheses: { label: string; value: string; confidence: ConfidenceLevel }[], client?: 'sally' | 'michaels' | 'tsc', _goal?: string) => {
    const assumptions: AssumptionToken[] = []
    
    // Channel assumption
    const channelHypo = hypotheses.find(h => h.label === 'Likely channel')
    if (channelHypo && channelHypo.confidence !== 'high') {
      assumptions.push({
        id: 'channel',
        key: 'Channel',
        value: client === 'michaels' || client === 'tsc' ? 'Online + In-Store' : 'Online',
        source: 'assumed',
        confidence: 'medium',
        reason: 'No channel explicitly specified in goal',
        editable: true
      })
    }
    
    // Discount flexibility
    const hasMarginConstraint = hypotheses.some(h => h.label === 'Constraint' && h.value.includes('Margin'))
    const isClearance = hypotheses.some(h => h.label === 'Primary intent' && h.value.includes('clearance'))
    assumptions.push({
      id: 'discount',
      key: 'Discount Flexibility',
      value: client === 'michaels' || client === 'tsc' ? 'Up to 60% off' : hasMarginConstraint ? 'Conservative' : isClearance ? 'Moderate' : 'Flexible',
      source: 'inferred',
      confidence: client === 'michaels' || client === 'tsc' ? 'high' : hasMarginConstraint ? 'high' : 'medium',
      reason: client === 'michaels' 
        ? 'Michaels holiday sale with 60% off promotions'
        : client === 'tsc'
        ? 'TSC holiday sale with 60% off promotions'
        : hasMarginConstraint 
          ? 'Margin protection mentioned in goal'
          : 'No explicit discount constraints provided',
      editable: true
    })
    
    // Product scope - derive category based on client
    let productScope = 'Full category'
    let scopeConfidence: ConfidenceLevel = 'low'
    let scopeReason = 'No specific sub-categories mentioned'
    
    if (client === 'michaels') {
      // Michaels campaigns include both categories
      productScope = 'Christmas Trees & Decor Collections'
      scopeReason = 'Michaels holiday campaign - both product categories included'
      scopeConfidence = 'high'
    } else if (client === 'tsc') {
      // TSC campaigns include both categories
      productScope = 'Home Decor & Christmas Decor'
      scopeReason = 'TSC holiday campaign - both product categories included'
      scopeConfidence = 'high'
    }
    
    assumptions.push({
      id: 'scope',
      key: 'Product Scope',
      value: productScope,
      source: client === 'michaels' || client === 'tsc' ? 'confirmed' : 'assumed',
      confidence: scopeConfidence,
      reason: scopeReason,
      editable: true
    })
    
    return assumptions
  }

  // Generate optional clarifications based on low-confidence assumptions
  const generateClarifications = (assumptions: AssumptionToken[]) => {
    const clarifications: { id: string; question: string; optional: boolean; answer: string }[] = []
    
    const lowConfidence = assumptions.filter(a => a.confidence === 'low' || a.confidence === 'medium')
    
    if (lowConfidence.some(a => a.id === 'channel')) {
      clarifications.push({
        id: 'channel',
        question: 'Should this campaign include in-store traffic, or focus on online only?',
        optional: true,
        answer: ''
      })
    }
    
    if (lowConfidence.some(a => a.id === 'scope')) {
      clarifications.push({
        id: 'scope',
        question: `Are there specific ${campaign.category || 'product'} sub-categories to prioritize?`,
        optional: true,
        answer: ''
      })
    }
    
    return clarifications
  }

  // Handle goal submission - starts the reasoning canvas
  const handleSubmitGoal = async () => {
    if (isPaused) return
    
    // Generate and set proper campaign name
    const campaignName = generateCampaignName(campaign.goal)
    onUpdate({ name: campaignName })
    
    // Phase 1: Interpreting
    setAgentState(prev => ({ ...prev, phase: 'interpreting', goalReceived: true }))
    await new Promise(resolve => setTimeout(resolve, 1200))
    if (isPaused) return
    
    // Phase 2: Hypothesizing
    const hypotheses = deriveHypotheses(campaign.goal)
    setAgentState(prev => ({ 
      ...prev, 
      phase: 'hypothesizing', 
      hypotheses,
      nextAction: 'Form initial hypotheses about your campaign'
    }))
    await new Promise(resolve => setTimeout(resolve, 1500))
    if (isPaused) return
    
    // Phase 3: Generate assumptions
    const assumptions = generateAssumptions(hypotheses, campaign.client, campaign.goal)
    const clarifications = generateClarifications(assumptions)
    
    setAgentState(prev => ({ 
      ...prev, 
      phase: clarifications.length > 0 ? 'clarifying' : 'ready',
      assumptions,
      clarifications,
      nextAction: clarifications.length > 0 
        ? 'I can proceed with assumptions, or you can clarify now'
        : 'Ready to build customer segments'
    }))
  }

  // Handle proceeding with assumptions
  const handleProceedWithAssumptions = () => {
    setAgentState(prev => ({ 
      ...prev, 
      phase: 'ready',
      nextAction: 'Ready to build customer segments'
    }))
  }

  // Handle clarification answer
  const handleClarificationAnswer = (id: string, answer: string) => {
    setAgentState(prev => ({
      ...prev,
      clarifications: prev.clarifications.map(c => 
        c.id === id ? { ...c, answer } : c
      )
    }))
  }

  // Handle assumption edit
  const handleAssumptionEdit = (id: string, newValue: string) => {
    setAgentState(prev => ({
      ...prev,
      assumptions: prev.assumptions.map(a => 
        a.id === id ? { ...a, value: newValue, source: 'confirmed' as AssumptionSource, confidence: 'high' as ConfidenceLevel } : a
      )
    }))
    setEditingAssumption(null)
  }

  // Handle final authorization
  const handleAuthorize = () => {
    // Update campaign with confirmed values
    const channelAssumption = agentState.assumptions.find(a => a.id === 'channel')
    if (channelAssumption) {
      onUpdate({ channel: channelAssumption.value.toLowerCase() })
    }
    onSubmit()
  }

  // Reset to start
  const handleReset = () => {
    setAgentState({
      phase: 'idle',
      goalReceived: false,
      hypotheses: [],
      assumptions: [],
      clarifications: [],
      nextAction: ''
    })
    setIsPaused(false)
  }

  // Confidence badge color
  const getConfidenceColor = (confidence: ConfidenceLevel) => {
    switch (confidence) {
      case 'high': return 'bg-success/10 text-success border-success/20'
      case 'medium': return 'bg-warning/10 text-warning border-warning/20'
      case 'low': return 'bg-danger/10 text-danger border-danger/20'
    }
  }

  // Source badge
  const getSourceBadge = (source: AssumptionSource) => {
    switch (source) {
      case 'assumed': return { icon: '🟡', label: 'Assumed' }
      case 'inferred': return { icon: '🟠', label: 'Inferred' }
      case 'confirmed': return { icon: '🟢', label: 'Confirmed' }
    }
  }

  return (
    <div className="relative">
      {/* Agent Control Rail - Persistent */}
      {agentState.phase !== 'idle' && (
        <div className="fixed right-6 top-1/2 -translate-y-1/2 z-40 flex flex-col gap-2">
          <button
            onClick={() => setIsPaused(!isPaused)}
            className={cn(
              "p-2.5 rounded-lg border shadow-lg transition-all",
              isPaused 
                ? "bg-warning/10 border-warning/30 text-warning" 
                : "bg-surface border-border text-text-muted hover:text-text-primary"
            )}
            title={isPaused ? "Resume agent" : "Pause agent"}
          >
            {isPaused ? <RefreshCw className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setEditingAssumption(editingAssumption ? null : 'any')}
            className="p-2.5 rounded-lg border border-border bg-surface text-text-muted hover:text-text-primary shadow-lg transition-all"
            title="Edit assumptions"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button
            onClick={handleReset}
            className="p-2.5 rounded-lg border border-border bg-surface text-text-muted hover:text-danger shadow-lg transition-all"
            title="Roll back"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Single Reasoning Canvas */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-4"
      >
        {/* Goal Input - Always visible, collapses when submitted */}
        <motion.div
          layout="position"
          className={cn(
            "rounded-2xl border transition-all overflow-hidden",
            agentState.goalReceived 
              ? "bg-surface border-border" 
              : "bg-gradient-to-br from-primary/5 via-agent/5 to-primary/10 border-primary/10"
          )}
        >
          {!agentState.goalReceived ? (
            <motion.div 
              className="p-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              <motion.div 
                className="flex items-center gap-4 mb-6"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1, duration: 0.4 }}
              >
                <motion.div 
                  className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-agent flex items-center justify-center shadow-lg shadow-primary/25"
                  animate={{ 
                    boxShadow: ['0 10px 25px -5px rgba(99, 102, 241, 0.25)', '0 10px 35px -5px rgba(99, 102, 241, 0.4)', '0 10px 25px -5px rgba(99, 102, 241, 0.25)']
                  }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <Sparkles className="w-6 h-6 text-white" />
                  </motion.div>
                </motion.div>
                <div>
                  <h2 className="text-xl font-bold text-text-primary">What would you like to achieve?</h2>
                  <p className="text-sm text-text-secondary">Describe your campaign goal in your own words</p>
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.4 }}
              >
                <textarea
                  value={campaign.goal}
                  onChange={(e) => onUpdate({ goal: e.target.value })}
                  placeholder="e.g., Clear Kids Apparel overstock online across the US while protecting margin..."
                  className="w-full px-4 py-3 bg-white/80 backdrop-blur border border-primary/20 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none h-28 transition-all"
                />
              </motion.div>
              
              <motion.div 
                className="mt-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.4 }}
              >
                {/* Expandable Examples Section */}
                <button
                  onClick={() => setIsExamplesExpanded(!isExamplesExpanded)}
                  className="flex items-center gap-2 text-xs text-text-muted hover:text-text-primary transition-colors mb-3"
                >
                  <motion.div
                    animate={{ rotate: isExamplesExpanded ? 90 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </motion.div>
                  <span className="uppercase tracking-wide font-medium">Try an example</span>
                  <motion.span 
                    className="text-[10px] px-1.5 py-0.5 bg-primary/10 text-primary rounded-full"
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    5 templates
                  </motion.span>
                </button>
                
                <AnimatePresence>
                  {isExamplesExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="flex flex-col gap-2 pb-4">
                        {[
                          { goal: 'Drive repeat purchases from VIP customers online while avoiding heavy discounts', icon: '👑', label: 'VIP Retention', client: 'sally' },
                          { goal: 'Clear excess Kids Apparel inventory online across the US while protecting margins', icon: '📦', label: 'Inventory Clearance', client: 'sally' },
                          { goal: 'Increase full-price sell-through of new Women\'s Footwear styles online in North America', icon: '👠', label: 'Full-Price Push', client: 'sally' },
                          { goal: 'Drive Christmas Trees and Decor sales with 60% off holiday promotions to maximize seasonal revenue', icon: '🎄', label: 'Michaels Holiday Sale', client: 'michaels' },
                          { goal: 'Drive Home Decor and Christmas Decor sales with 60% off holiday promotions targeting farmhouse lovers and seasonal shoppers', icon: '🏡', label: 'TSC Holiday Sale', client: 'tsc' }
                        ].map((example, i) => (
                          <motion.button
                            key={i}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1, duration: 0.3 }}
                            onClick={() => {
                              onUpdate({ goal: example.goal, client: example.client as 'sally' | 'michaels' | 'tsc' })
                              setIsExamplesExpanded(false)
                            }}
                            className={cn(
                              "flex items-start gap-3 p-3 bg-surface rounded-xl border text-left transition-all group",
                              example.client === 'michaels' 
                                ? "border-green-200 hover:border-green-400 hover:bg-green-50" 
                                : example.client === 'tsc'
                                ? "border-amber-200 hover:border-amber-400 hover:bg-amber-50"
                                : "border-border hover:border-primary/30 hover:bg-primary/5"
                            )}
                          >
                            <span className="text-lg">{example.icon}</span>
                            <div className="flex-1">
                              <p className="text-xs font-medium text-primary mb-1">{example.label}</p>
                              <p className="text-xs text-text-secondary group-hover:text-text-primary transition-colors">{example.goal}</p>
                            </div>
                            <ArrowRight className="w-4 h-4 text-text-muted opacity-0 group-hover:opacity-100 transition-opacity mt-1" />
                          </motion.button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                
                <motion.div 
                  className="flex justify-end"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.3 }}
                >
                  <Button
                    variant="primary"
                    onClick={handleSubmitGoal}
                    disabled={!canSubmit}
                    size="sm"
                    className="gap-2 shadow-lg shadow-primary/25"
                  >
                    <motion.div
                      animate={canSubmit ? { scale: [1, 1.1, 1] } : {}}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <Sparkles className="w-4 h-4" />
                    </motion.div>
                    Submit to Alan
                  </Button>
                </motion.div>
              </motion.div>
            </motion.div>
          ) : (
            <div className="px-5 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-4 h-4 text-success" />
                <span className="text-sm text-text-primary font-medium">{campaign.goal}</span>
              </div>
              <button 
                onClick={handleReset}
                className="text-xs text-text-muted hover:text-text-primary"
              >
                Edit
              </button>
            </div>
          )}
        </motion.div>

        {/* Agent Intent Statement */}
        {agentState.phase !== 'idle' && (
          <div className="bg-agent/5 border border-agent/20 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-agent/10 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-4 h-4 text-agent" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-medium text-agent uppercase tracking-wide mb-2">Alan's Plan</p>
                <div className="space-y-1">
                  <div className={cn("flex items-center gap-2 text-sm", agentState.phase === 'interpreting' ? 'text-text-primary' : 'text-text-muted')}>
                    {agentState.phase === 'interpreting' ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                    <span>Interpret your goal</span>
                  </div>
                  <div className={cn("flex items-center gap-2 text-sm", agentState.phase === 'hypothesizing' ? 'text-text-primary' : agentState.hypotheses.length > 0 ? 'text-text-muted' : 'text-text-muted/50')}>
                    {agentState.phase === 'hypothesizing' ? <Loader2 className="w-3 h-3 animate-spin" /> : agentState.hypotheses.length > 0 ? <Check className="w-3 h-3" /> : <div className="w-3 h-3 rounded-full border border-current" />}
                    <span>Form initial hypotheses</span>
                  </div>
                  <div className={cn("flex items-center gap-2 text-sm", agentState.phase === 'clarifying' || agentState.phase === 'ready' ? 'text-text-primary' : 'text-text-muted/50')}>
                    {agentState.assumptions.length > 0 ? <Check className="w-3 h-3" /> : <div className="w-3 h-3 rounded-full border border-current" />}
                    <span>Validate assumptions before building segments</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Hypotheses Block */}
        {agentState.hypotheses.length > 0 && (
          <div className="bg-surface border border-border rounded-xl p-4">
            <p className="text-xs font-medium text-text-muted uppercase tracking-wide mb-3">Initial Hypotheses</p>
            <div className="grid grid-cols-2 gap-2">
              {agentState.hypotheses.map((h, i) => (
                <div key={i} className="flex items-center justify-between p-2.5 bg-surface-secondary rounded-lg">
                  <div>
                    <p className="text-xs text-text-muted">{h.label}</p>
                    <p className="text-sm font-medium text-text-primary">{h.value}</p>
                  </div>
                  <span className={cn(
                    "text-[10px] px-2 py-0.5 rounded-full border",
                    getConfidenceColor(h.confidence)
                  )}>
                    {h.confidence}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Assumption Tokens */}
        {agentState.assumptions.length > 0 && (
          <div className="bg-surface border border-border rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-medium text-text-muted uppercase tracking-wide">Assumptions</p>
              <p className="text-[10px] text-text-muted">Click to edit</p>
            </div>
            <div className="space-y-2">
              {agentState.assumptions.map((a) => (
                <div 
                  key={a.id} 
                  className={cn(
                    "flex items-center justify-between p-3 rounded-lg border transition-all",
                    editingAssumption === a.id 
                      ? "bg-primary/5 border-primary/30" 
                      : "bg-surface-secondary border-transparent hover:border-border cursor-pointer"
                  )}
                  onClick={() => a.editable && setEditingAssumption(a.id)}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm">{getSourceBadge(a.source).icon}</span>
                    <div>
                      <p className="text-xs text-text-muted">{a.key}</p>
                      {editingAssumption === a.id ? (
                        <input
                          type="text"
                          value={a.value}
                          onChange={(e) => handleAssumptionEdit(a.id, e.target.value)}
                          onBlur={() => setEditingAssumption(null)}
                          onKeyDown={(e) => e.key === 'Enter' && setEditingAssumption(null)}
                          className="text-sm font-medium text-text-primary bg-transparent border-b border-primary focus:outline-none"
                          autoFocus
                        />
                      ) : (
                        <p className="text-sm font-medium text-text-primary">{a.value}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "text-[10px] px-2 py-0.5 rounded-full border",
                      getConfidenceColor(a.confidence)
                    )}>
                      {a.confidence} confidence
                    </span>
                    <span className="text-[10px] text-text-muted px-2 py-0.5 bg-surface rounded-full">
                      {getSourceBadge(a.source).label}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Optional Clarifications */}
        {agentState.phase === 'clarifying' && agentState.clarifications.length > 0 && (
          <div className="bg-surface border border-border rounded-xl p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-text-primary">Optional Clarifications</p>
                <p className="text-xs text-text-muted mt-0.5">I can proceed with reasonable assumptions, or you can clarify now.</p>
              </div>
            </div>
            
            <div className="space-y-3">
              {agentState.clarifications.map((c) => (
                <div key={c.id} className="p-3 bg-surface-secondary rounded-lg">
                  <p className="text-sm text-text-primary mb-2">{c.question}</p>
                  <input
                    type="text"
                    value={c.answer}
                    onChange={(e) => handleClarificationAnswer(c.id, e.target.value)}
                    placeholder="Leave blank to use assumption..."
                    className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary/50"
                  />
                </div>
              ))}
            </div>

            <div className="flex items-center gap-3 mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handleProceedWithAssumptions}
                className="flex-1"
              >
                Proceed with my assumptions
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  // Apply clarifications to assumptions
                  agentState.clarifications.forEach(c => {
                    if (c.answer.trim()) {
                      handleAssumptionEdit(c.id, c.answer)
                    }
                  })
                  handleProceedWithAssumptions()
                }}
                className="flex-1"
              >
                Apply & Continue
              </Button>
            </div>
          </div>
        )}

        {/* Ready State - Authorization */}
        {agentState.phase === 'ready' && (
          <div className="bg-success/5 border border-success/20 rounded-xl p-5">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-5 h-5 text-success" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-success mb-1">Ready to proceed</p>
                <p className="text-sm text-text-secondary mb-4">
                  Based on your earlier emphasis on <span className="font-medium">{agentState.hypotheses[0]?.value.toLowerCase()}</span>, 
                  I will now build customer segments optimized for this goal.
                </p>
                <Button
                  variant="primary"
                  onClick={handleAuthorize}
                  disabled={isWorking}
                  className="gap-2"
                >
                  {isWorking ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Building segments...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Authorize Alan to build customer segments
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Paused State */}
        {isPaused && (
          <div className="fixed inset-0 bg-black/20 z-30 flex items-center justify-center">
            <div className="bg-surface rounded-xl border border-warning/30 p-6 shadow-xl max-w-sm">
              <div className="flex items-center gap-3 mb-4">
                <Pause className="w-5 h-5 text-warning" />
                <p className="font-medium text-text-primary">Agent Paused</p>
              </div>
              <p className="text-sm text-text-secondary mb-4">
                Alan is paused. You can edit assumptions or roll back to a previous state.
              </p>
              <Button variant="primary" onClick={() => setIsPaused(false)} className="w-full">
                Resume Agent
              </Button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  )
}

function ContextDecisionStep({
  campaign,
  onConfirm,
  onGoBack,
  isWorking
}: {
  campaign: Campaign
  onConfirm: () => void
  onGoBack: () => void
  isWorking: boolean
}) {
  const derived = campaign.derivedContext!
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
          {/* Context Snapshot - Full Chat Context */}
          <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl space-y-4">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-primary" />
              <p className="text-sm font-medium text-primary">Context from Goal</p>
            </div>
            
            {/* Original Goal */}
            <div className="p-3 bg-white/50 rounded-lg border border-primary/10">
              <p className="text-xs text-text-muted uppercase tracking-wide mb-1">Your Goal</p>
              <p className="text-sm text-text-primary leading-relaxed font-medium">
                "{campaign.goal}"
              </p>
            </div>

            {/* Derived Understanding */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-white/50 rounded-lg border border-primary/10">
                <p className="text-xs text-text-muted uppercase tracking-wide mb-1">Category</p>
                <p className="text-sm text-text-primary font-medium">{campaign.category || 'Auto-detected'}</p>
              </div>
              <div className="p-3 bg-white/50 rounded-lg border border-primary/10">
                <p className="text-xs text-text-muted uppercase tracking-wide mb-1">Region</p>
                <p className="text-sm text-text-primary font-medium">{campaign.region || 'US (default)'}</p>
              </div>
              <div className="p-3 bg-white/50 rounded-lg border border-primary/10">
                <p className="text-xs text-text-muted uppercase tracking-wide mb-1">Lookback</p>
                <p className="text-sm text-text-primary font-medium">{campaign.lookbackWindow}</p>
              </div>
              <div className="p-3 bg-white/50 rounded-lg border border-primary/10">
                <p className="text-xs text-text-muted uppercase tracking-wide mb-1">Margin Protection</p>
                <p className="text-sm text-text-primary font-medium">{derived.marginProtection || 'Standard'}</p>
              </div>
            </div>

            {/* Assumptions */}
            <div>
              <p className="text-xs text-text-muted uppercase tracking-wide mb-2">Assumptions Made</p>
              <div className="flex flex-wrap gap-2">
                {derived.assumptions.map((a, i) => (
                  <span 
                    key={i} 
                    className={cn(
                      "text-xs px-2.5 py-1 rounded-full",
                      a.isAssumed 
                        ? "bg-warning/10 text-warning border border-warning/20" 
                        : "bg-success/10 text-success border border-success/20"
                    )}
                  >
                    {a.isAssumed ? '🟡' : '🟢'} {a.key}: {a.value}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Campaign Type */}
          <div className="flex items-start gap-4 p-4 bg-surface-secondary rounded-xl">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-text-muted mb-1">Campaign Type</p>
              <p className="text-lg font-semibold text-text-primary">{derived.campaignType}</p>
              <p className="text-sm text-text-secondary mt-1">
                Suggested name: <span className="font-medium text-text-primary">{derived.campaignName}</span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-text-muted mb-1">Est. Universe</p>
              <p className="text-lg font-semibold text-primary">
                {derived.estimatedUniverse.toLocaleString()}
              </p>
            </div>
          </div>

          {/* What Alan Is Optimizing For */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Target className="w-4 h-4 text-agent" />
              <p className="font-medium text-text-primary">What Alan Is Optimizing For</p>
            </div>
            <ul className="space-y-2">
              {(derived.campaignType === 'Clearance Push' || derived.campaignType === 'Holiday Promotion'
                ? ['Clearing excess inventory efficiently', 'Maintaining brand trust', 'Protecting long-term customer value']
                : derived.campaignType === 'VIP Retention'
                ? ['Maximizing customer lifetime value', 'Strengthening VIP relationships', 'Driving repeat purchase behavior']
                : derived.campaignType === 'Full-Price Promotion'
                ? ['Maximizing full-price sell-through', 'Preserving brand premium positioning', 'Targeting high-intent customers']
                : ['Driving customer engagement', 'Balancing reach and relevance', 'Optimizing conversion efficiency']
              ).map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-text-secondary">
                  <Sparkles className="w-4 h-4 text-agent mt-0.5 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* What Alan Will Enforce */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Shield className="w-4 h-4 text-primary" />
              <p className="font-medium text-text-primary">What Alan Will Enforce</p>
            </div>
            <ul className="space-y-2">
              {derived.guardrails.map((g, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-text-secondary">
                  <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  {g}
                </li>
              ))}
            </ul>
          </div>

          {/* Why this works */}
          <div className="p-4 bg-success/5 border border-success/20 rounded-xl">
            <p className="text-sm font-medium text-success mb-1">Why this approach works</p>
            <p className="text-sm text-text-secondary">
              {derived.campaignType === 'Clearance Push' 
                ? 'This strategy balances inventory clearance with margin protection by targeting price-sensitive segments with appropriate discounts while preserving brand value.'
                : derived.campaignType === 'VIP Retention'
                ? 'This strategy focuses on retaining high-value customers through personalized experiences and exclusive offers, avoiding heavy discounts that could devalue the relationship.'
                : derived.campaignType === 'Full-Price Promotion'
                ? 'This strategy emphasizes product value and exclusivity to drive full-price conversions, targeting customers who prioritize quality over discounts.'
                : 'This strategy targets engaged customers with relevant messaging to drive conversions while maintaining healthy margins.'
              }
            </p>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-surface-secondary border-t border-border flex items-center justify-between">
          <Button variant="ghost" onClick={() => setShowAdjustModal(true)}>
            <Edit3 className="w-4 h-4 mr-2" /> Adjust Inputs
          </Button>
          <Button variant="primary" onClick={onConfirm} disabled={isWorking}>
            <Check className="w-4 h-4 mr-2" /> Confirm & Lock Context
          </Button>
        </div>
      </div>
    </motion.div>
  )
}

// Mock Segment Library - segments that already exist
const SEGMENT_LIBRARY = [
  { id: 'lib-seg-1', name: 'Fashion Forward VIPs', category: 'Apparel' },
  { id: 'lib-seg-2', name: 'Seasonal Shoppers', category: 'Apparel' },
  { id: 'lib-seg-3', name: 'VIP Promo-Responsive', category: 'General' },
  { id: 'lib-seg-4', name: 'High-Value Parents', category: 'Kids' },
  { id: 'lib-seg-5', name: 'Tech Enthusiasts', category: 'Electronics' },
  { id: 'lib-seg-6', name: 'Deal Hunters', category: 'General' },
]

function AudienceStep({
  campaign,
  onConfirm,
  onUpdateStrategy,
  onSaveDraft,
  isWorking
}: {
  campaign: Campaign
  onConfirm: () => void
  onUpdateStrategy: (strategy: Campaign['audienceStrategy']) => void
  onSaveDraft: () => void
  isWorking: boolean
}) {
  const strategy = campaign.audienceStrategy
  const [scopeValue, setScopeValue] = useState(50) // 0-100 slider, 50 is default
  const [baseStrategy] = useState(strategy) // Store original for calculations
  const [isAdjusting, setIsAdjusting] = useState(false)
  const [changeHighlight, setChangeHighlight] = useState<string | null>(null)
  const [prevScopeValue, setPrevScopeValue] = useState(50)

  // Check if segment exists in library
  const isFromLibrary = (segmentName: string) => {
    return SEGMENT_LIBRARY.some(libSeg => 
      segmentName.toLowerCase().includes(libSeg.name.toLowerCase().split(' ')[0]) ||
      libSeg.name.toLowerCase().includes(segmentName.toLowerCase().split(' ')[0])
    )
  }

  // Count library vs new segments
  const librarySegments = strategy?.segments.filter(s => isFromLibrary(s.name)).length || 0
  const newSegments = (strategy?.segments.length || 0) - librarySegments

  // Calculate scope label and multiplier based on slider value
  const getScopeInfo = (value: number) => {
    if (value < 25) return { label: 'Very Strict', color: 'text-danger', multiplier: 0.5, description: 'Targeting only highest-value customers' }
    if (value < 45) return { label: 'Stricter', color: 'text-warning', multiplier: 0.75, description: 'Fewer customers, higher conversion potential' }
    if (value <= 55) return { label: 'Balanced', color: 'text-success', multiplier: 1.0, description: 'Optimal balance of reach and precision' }
    if (value < 75) return { label: 'Broader', color: 'text-info', multiplier: 1.3, description: 'More customers, moderate targeting' }
    return { label: 'Very Broad', color: 'text-primary', multiplier: 1.6, description: 'Maximum reach, inclusive targeting' }
  }

  const scopeInfo = getScopeInfo(scopeValue)

  // Handle slider change with debounced update
  const handleSliderChange = async (value: number) => {
    const prevInfo = getScopeInfo(prevScopeValue)
    const newInfo = getScopeInfo(value)
    
    // Generate change highlight message
    if (prevInfo.label !== newInfo.label) {
      const totalCustomers = baseStrategy?.segments.reduce((a, s) => a + s.size, 0) || 0
      const prevCustomers = Math.round(totalCustomers * prevInfo.multiplier)
      const newCustomers = Math.round(totalCustomers * newInfo.multiplier)
      const diff = newCustomers - prevCustomers
      
      if (diff > 0) {
        setChangeHighlight(`+${diff.toLocaleString()} customers added to reach`)
      } else {
        setChangeHighlight(`${Math.abs(diff).toLocaleString()} customers removed for precision`)
      }
      
      // Clear highlight after 3 seconds
      setTimeout(() => setChangeHighlight(null), 3000)
    }
    
    setPrevScopeValue(value)
    setScopeValue(value)
    if (!baseStrategy) return
    
    setIsAdjusting(true)
    
    // Small delay for smooth UX
    await new Promise(resolve => setTimeout(resolve, 300))
    
    const { multiplier } = getScopeInfo(value)
    
    // Calculate adjusted segment sizes
    const adjustedSegments = baseStrategy.segments.map(seg => ({
      ...seg,
      size: Math.round(seg.size * multiplier)
    }))
    
    // Calculate new total customers
    const newTotalCustomers = adjustedSegments.reduce((sum, seg) => sum + seg.size, 0)
    const baseTotalCustomers = baseStrategy.segments.reduce((sum, seg) => sum + seg.size, 0)
    
    // Recalculate percentages based on new sizes
    const adjustedSegmentsWithPercentage = adjustedSegments.map(seg => ({
      ...seg,
      percentage: Math.round((seg.size / newTotalCustomers) * 1000) / 10
    }))
    
    // Adjust coverage proportionally
    const coverageRatio = newTotalCustomers / baseTotalCustomers
    const adjustedCoverage = Math.round(baseStrategy.totalCoverage * coverageRatio * 10) / 10
    
    const adjustedStrategy = {
      ...baseStrategy,
      totalCoverage: Math.min(adjustedCoverage, 100), // Cap at 100%
      segments: adjustedSegmentsWithPercentage
    }
    
    onUpdateStrategy(adjustedStrategy)
    setIsAdjusting(false)
  }

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
          <div className="flex items-center justify-between">
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
            <Badge variant={scopeValue < 45 ? 'warning' : scopeValue > 55 ? 'info' : 'success'} className="text-xs">
              {scopeInfo.label} scope
            </Badge>
          </div>
        </div>

        {/* Segment Source Info */}
        <div className="px-6 py-3 bg-primary/5 border-b border-primary/10">
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-success" />
              <span className="text-text-secondary">
                <span className="font-medium text-success">{librarySegments}</span> from Segment Library
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-agent" />
              <span className="text-text-secondary">
                <span className="font-medium text-agent">{newSegments}</span> newly created
              </span>
            </div>
            <span className="text-text-muted ml-auto">Alan checked library first, created new segments where needed</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Layers */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-text-muted">Layers:</span>
            {strategy.segmentationLayers.map((l, i) => (
              <Badge key={i} variant={l.type === 'statistical' ? 'info' : 'default'} className="bg-surface-tertiary">{l.name}</Badge>
            ))}
          </div>

          {/* Segments */}
          <div className="space-y-3">
            {strategy.segments.map((seg, idx) => {
              const baseSeg = baseStrategy?.segments[idx]
              const sizeChange = baseSeg ? ((seg.size - baseSeg.size) / baseSeg.size * 100) : 0
              const hasChange = Math.abs(sizeChange) > 1
              const fromLibrary = isFromLibrary(seg.name)
              
              return (
                <motion.div 
                  key={seg.id} 
                  className={cn(
                    "p-4 rounded-xl border",
                    fromLibrary 
                      ? "bg-success/5 border-success/20" 
                      : "bg-surface-secondary border-transparent"
                  )}
                  animate={{ opacity: isAdjusting ? 0.6 : 1 }}
                  transition={{ duration: 0.2 }}
                >
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
                        {fromLibrary && (
                          <Badge variant="success" className="text-[10px] gap-1">
                            <CheckCircle className="w-2.5 h-2.5" />
                            Library
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-text-secondary mt-1">{seg.description}</p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2 justify-end">
                        <p className="text-lg font-semibold text-primary">{seg.size.toLocaleString()}</p>
                        {hasChange && (
                          <motion.span 
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className={cn(
                              'text-xs font-medium px-1.5 py-0.5 rounded',
                              sizeChange > 0 ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'
                            )}
                          >
                            {sizeChange > 0 ? '+' : ''}{Math.round(sizeChange)}%
                          </motion.span>
                        )}
                      </div>
                      <p className="text-xs text-text-muted">{seg.percentage}%</p>
                    </div>
                  </div>
                </motion.div>
              )
            })}
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

        {/* Scope Slider */}
        <div className="px-6 py-4 border-t border-border">
          {/* Change Highlight Banner */}
          <AnimatePresence>
            {changeHighlight && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mb-3 overflow-hidden"
              >
                <div className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium text-center",
                  changeHighlight.startsWith('+') 
                    ? "bg-success/10 text-success border border-success/20" 
                    : "bg-warning/10 text-warning border border-warning/20"
                )}>
                  {changeHighlight.startsWith('+') ? '📈' : '🎯'} {changeHighlight}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-center gap-4">
            <span className="text-xs text-text-muted whitespace-nowrap">Stricter</span>
            <div className="flex-1 relative">
              <input
                type="range"
                min="0"
                max="100"
                value={scopeValue}
                onChange={(e) => handleSliderChange(Number(e.target.value))}
                className="w-full h-2 bg-gradient-to-r from-warning via-success to-info rounded-full appearance-none cursor-pointer
                  [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 
                  [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 
                  [&::-webkit-slider-thumb]:border-primary [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:cursor-pointer
                  [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full 
                  [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-primary"
              />
              {/* Scope indicator */}
              <div className="flex justify-between mt-1">
                <span className="text-[10px] text-text-muted">Fewer, high-value</span>
                <div className="text-center">
                  <span className={cn('text-xs font-medium', scopeInfo.color)}>
                    {isAdjusting ? <Loader2 className="w-3 h-3 animate-spin inline" /> : scopeInfo.label}
                  </span>
                  <p className="text-[10px] text-text-muted">{scopeInfo.description}</p>
                </div>
                <span className="text-[10px] text-text-muted">More, inclusive</span>
              </div>
            </div>
            <span className="text-xs text-text-muted whitespace-nowrap">Broader</span>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-surface-secondary border-t border-border flex items-center justify-between">
          <Button variant="ghost" onClick={onSaveDraft}>
            <Save className="w-4 h-4 mr-2" /> Save Draft
          </Button>
          <Button variant="primary" onClick={onConfirm} disabled={isWorking || isAdjusting}>
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
  onSkipPromo,
  onSaveDraft,
  isWorking
}: {
  campaign: Campaign
  onConfirm: () => void
  onSkipPromo: () => void
  onSaveDraft: () => void
  isWorking: boolean
}) {
  const mapping = campaign.offerMapping
  const [skippedSegments, setSkippedSegments] = useState<Set<string>>(new Set())

  if (!mapping) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 text-agent animate-spin" />
      </div>
    )
  }

  const toggleSkipSegment = (segmentId: string) => {
    setSkippedSegments(prev => {
      const newSet = new Set(prev)
      if (newSet.has(segmentId)) {
        newSet.delete(segmentId)
      } else {
        newSet.add(segmentId)
      }
      return newSet
    })
  }

  const skipAllSegments = () => {
    if (skippedSegments.size === mapping.length) {
      // If all are skipped, unskip all
      setSkippedSegments(new Set())
    } else {
      // Skip all
      setSkippedSegments(new Set(mapping.map(o => o.segmentId)))
    }
  }

  const activePromos = mapping.filter(o => !skippedSegments.has(o.segmentId))
  const allSkipped = skippedSegments.size === mapping.length

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <div className="bg-surface rounded-2xl border border-agent/30 overflow-hidden">
        {/* Header */}
        <div className="bg-agent/5 px-6 py-4 border-b border-agent/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-agent/20 flex items-center justify-center">
                <Tag className="w-5 h-5 text-agent" />
              </div>
              <div>
                <p className="font-semibold text-agent">Alan has mapped offers to segments</p>
                <p className="text-sm text-text-secondary">Optimized for lift while protecting margins</p>
              </div>
            </div>
            {/* Skip All Toggle */}
            <button
              onClick={skipAllSegments}
              className={cn(
                "text-xs px-3 py-1.5 rounded-lg border transition-all",
                allSkipped
                  ? "bg-warning/10 border-warning/30 text-warning"
                  : "bg-surface border-border text-text-muted hover:text-text-primary hover:border-primary/30"
              )}
            >
              {allSkipped ? '✓ All Promos Skipped' : 'Skip All Promos'}
            </button>
          </div>
        </div>

        {/* Summary Banner */}
        {skippedSegments.size > 0 && !allSkipped && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            className="px-6 py-2 bg-warning/5 border-b border-warning/20"
          >
            <p className="text-xs text-warning">
              ⚠️ {skippedSegments.size} of {mapping.length} segments will proceed without promo offers
            </p>
          </motion.div>
        )}

        {/* Content */}
        <div className="p-6 space-y-4">
          {mapping.map(o => {
            const isSkipped = skippedSegments.has(o.segmentId)
            
            return (
              <motion.div 
                key={o.segmentId} 
                className={cn(
                  "p-4 rounded-xl border transition-all",
                  isSkipped 
                    ? "bg-surface-secondary/50 border-dashed border-border opacity-60" 
                    : "bg-surface-secondary border-transparent"
                )}
                animate={{ opacity: isSkipped ? 0.6 : 1 }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex-1">
                    <p className="text-sm text-text-muted">{o.segmentName}</p>
                    {isSkipped ? (
                      <p className="font-semibold text-text-muted line-through">
                        {o.productGroup} → {o.promotion}
                      </p>
                    ) : (
                      <p className="font-semibold text-text-primary">
                        {o.productGroup} → {o.promotion}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    {isSkipped ? (
                      <Badge variant="warning" className="text-sm px-3 py-1">No Promo</Badge>
                    ) : (
                      <Badge variant="success" className="text-lg px-4 py-1">{o.promoValue}</Badge>
                    )}
                    <button
                      onClick={() => toggleSkipSegment(o.segmentId)}
                      className={cn(
                        "text-xs px-2.5 py-1 rounded-md border transition-all",
                        isSkipped
                          ? "bg-success/10 border-success/30 text-success hover:bg-success/20"
                          : "bg-surface border-border text-text-muted hover:text-warning hover:border-warning/30"
                      )}
                    >
                      {isSkipped ? 'Enable Promo' : 'Skip'}
                    </button>
                  </div>
                </div>
                {!isSkipped && (
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
                  </div>
                )}
                {isSkipped && (
                  <p className="text-xs text-text-muted mt-1">
                    This segment will receive creative content without promotional offers
                  </p>
                )}
              </motion.div>
            )
          })}
        </div>

        {/* Impact Summary */}
        {skippedSegments.size > 0 && (
          <div className="px-6 py-3 bg-primary/5 border-t border-primary/10">
            <div className="flex items-center justify-between text-sm">
              <span className="text-text-secondary">
                Active promos: <span className="font-medium text-text-primary">{activePromos.length} of {mapping.length}</span>
              </span>
              <span className="text-text-secondary">
                Est. lift: <span className="font-medium text-success">
                  +{activePromos.reduce((a, o) => a + o.expectedLift, 0) / Math.max(activePromos.length, 1)}%
                </span> avg
              </span>
              <span className="text-text-secondary">
                Margin impact: <span className="font-medium text-warning">
                  {activePromos.reduce((a, o) => a + o.marginImpact, 0) / Math.max(activePromos.length, 1)}%
                </span> avg
              </span>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="px-6 py-4 bg-surface-secondary border-t border-border flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={onSaveDraft}>
            <Save className="w-4 h-4 mr-2" /> Save Draft
          </Button>
          <Button 
            variant="primary" 
            onClick={allSkipped ? onSkipPromo : onConfirm} 
            disabled={isWorking}
          >
            <Check className="w-4 h-4 mr-2" /> 
            {allSkipped ? 'Continue Without Promos' : `Confirm ${activePromos.length} Promo${activePromos.length !== 1 ? 's' : ''}`}
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
  onSaveDraft,
  isWorking
}: {
  campaign: Campaign
  onConfirm: () => void
  onSaveDraft: () => void
  isWorking: boolean
}) {
  const segments = campaign.audienceStrategy?.segments || []
  const [expandedSegment, setExpandedSegment] = useState<string | null>(null)
  const [showAdjustModal, setShowAdjustModal] = useState(false)
  const [adjustFeedback, setAdjustFeedback] = useState('')
  const [isReanalyzing, setIsReanalyzing] = useState(false)
  const [adjustmentApplied, setAdjustmentApplied] = useState<string | null>(null)
  
  // Base product groups data - sourced from centralized Products JSON (Sally or Michaels based on client)
  const segmentNames = segments.map(s => s.name)
  const baseProductGroups = getProductGroupsByClient(campaign.client || 'sally', segmentNames)

  // Dynamic product groups state
  const [productGroups, setProductGroups] = useState(
    baseProductGroups.map(pg => ({ ...pg, skuCount: pg.baseSkuCount }))
  )

  // Handle re-analyze products
  const handleReanalyze = async () => {
    if (!adjustFeedback.trim()) return
    setIsReanalyzing(true)
    
    // Simulate Alan re-analyzing
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Apply adjustments based on feedback
    const feedback = adjustFeedback.toLowerCase()
    let multipliers = { seg1: 1, seg2: 1, seg3: 1 }
    let newRationales = { seg1: '', seg2: '', seg3: '' }
    
    if (feedback.includes('overstock')) {
      // Focus on overstock - reduce VIP, increase value segments
      multipliers = { seg1: 0.4, seg2: 1.3, seg3: 1.5 }
      newRationales = { 
        seg1: 'Reduced to overstock items only', 
        seg2: 'Expanded overstock selection', 
        seg3: 'Prioritized clearance items' 
      }
    } else if (feedback.includes('premium') || feedback.includes('high-value')) {
      // Focus on premium - increase VIP, reduce others
      multipliers = { seg1: 1.5, seg2: 0.7, seg3: 0.5 }
      newRationales = { 
        seg1: 'Expanded premium selection', 
        seg2: 'Filtered to higher-margin items', 
        seg3: 'Limited to premium clearance' 
      }
    } else if (feedback.includes('exclude') && feedback.includes('margin')) {
      // Exclude low-margin - reduce all slightly
      multipliers = { seg1: 0.85, seg2: 0.7, seg3: 0.6 }
      newRationales = { 
        seg1: 'Excluded low-margin items', 
        seg2: 'Removed items below margin threshold', 
        seg3: 'Filtered for margin protection' 
      }
    } else if (feedback.includes('seasonal')) {
      // Include seasonal - increase mid-tier
      multipliers = { seg1: 1.1, seg2: 1.4, seg3: 1.2 }
      newRationales = { 
        seg1: 'Added seasonal premium items', 
        seg2: 'Expanded with seasonal products', 
        seg3: 'Included seasonal clearance' 
      }
    } else {
      // Default adjustment
      multipliers = { seg1: 0.9, seg2: 1.1, seg3: 0.95 }
    }
    
    // Update product groups with new counts
    setProductGroups(prev => prev.map((pg, i) => {
      const mult = i === 0 ? multipliers.seg1 : i === 1 ? multipliers.seg2 : multipliers.seg3
      const newRationale = i === 0 ? newRationales.seg1 : i === 1 ? newRationales.seg2 : newRationales.seg3
      return {
        ...pg,
        skuCount: Math.round(pg.baseSkuCount * mult),
        rationale: newRationale || pg.rationale
      }
    }))
    
    setAdjustmentApplied(adjustFeedback)
    setAdjustFeedback('')
    setShowAdjustModal(false)
    setIsReanalyzing(false)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <div className="bg-surface rounded-2xl border border-agent/30 overflow-hidden">
        {/* ADB Header */}
        <div className="bg-gradient-to-r from-agent/10 to-primary/10 px-6 py-5 border-b border-agent/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-agent to-primary flex items-center justify-center shadow-lg shadow-agent/25">
                <Package className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="font-bold text-lg text-text-primary">Alan has matched products per segment</p>
                <p className="text-sm text-text-secondary">Click any segment to preview sample SKUs from the product group</p>
              </div>
            </div>
            {adjustmentApplied && (
              <Badge variant="success" className="text-xs">
                <Check className="w-3 h-3 mr-1" /> Adjusted: {adjustmentApplied}
              </Badge>
            )}
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
                        {pg.skus.slice(0, 4).map(sku => (
                          <div key={sku.id} className="group relative" title={sku.visualDescription}>
                            <div className="aspect-square rounded-xl overflow-hidden bg-surface-secondary border border-border group-hover:border-primary/50 transition-all">
                              <img 
                                src={sku.image || PLACEHOLDER_IMAGE} 
                                alt={sku.name}
                                onError={handleImageError}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                              />
                            </div>
                            <div className="mt-2">
                              <p className="text-xs font-medium text-text-primary truncate">{sku.name}</p>
                              <p className="text-xs text-text-muted truncate">{sku.id}</p>
                              <p className="text-xs text-primary font-semibold">${sku.price}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                      {pg.skus.length > 4 && (
                        <p className="text-xs text-text-muted mt-3 text-center">
                          +{pg.skus.length - 4} more SKUs in this group
                        </p>
                      )}
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
          <div className="flex gap-2">
            <Button variant="ghost" onClick={onSaveDraft}>
              <Save className="w-4 h-4 mr-2" /> Save Draft
            </Button>
            <Button variant="ghost" onClick={() => setShowAdjustModal(true)}>
              <Edit3 className="w-4 h-4 mr-2" /> Adjust Products
            </Button>
          </div>
          <Button variant="primary" onClick={onConfirm} disabled={isWorking} className="px-6">
            <Check className="w-4 h-4 mr-2" /> Approve Product Groups
          </Button>
        </div>
      </div>

      {/* Adjust Products Modal */}
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
              <div className="bg-agent/5 px-6 py-4 border-b border-agent/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-agent/20 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-agent" />
                  </div>
                  <div>
                    <p className="font-semibold text-agent">Adjust Product Selection</p>
                    <p className="text-sm text-text-secondary">Tell Alan what to change</p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <textarea
                  value={adjustFeedback}
                  onChange={(e) => setAdjustFeedback(e.target.value)}
                  placeholder="e.g., Exclude items under $20, focus more on new arrivals, add more variety to the basics segment..."
                  className="w-full px-4 py-3 bg-surface-secondary border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-agent/50 resize-none h-32"
                />
                <div className="mt-4 flex flex-wrap gap-2">
                  {['Exclude low-margin items', 'Focus on overstock only', 'Add more premium items', 'Include seasonal products'].map(s => (
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
              <div className="px-6 py-4 bg-surface-secondary border-t border-border flex items-center justify-end gap-3">
                <Button variant="ghost" onClick={() => setShowAdjustModal(false)} disabled={isReanalyzing}>
                  Cancel
                </Button>
                <Button 
                  variant="primary" 
                  onClick={handleReanalyze}
                  disabled={!adjustFeedback.trim() || isReanalyzing}
                  className="bg-agent hover:bg-agent/90"
                >
                  {isReanalyzing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Analyzing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" /> Re-analyze Products
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ============================================================================
// STEP 5: CREATIVE
// ============================================================================

function CreativeStep({
  campaign,
  onApprove,
  onRegenerate,
  onConfirm,
  onSaveDraft,
  isWorking
}: {
  campaign: Campaign
  onApprove: (id: string) => void
  onRegenerate: (id: string) => void
  onConfirm: () => void
  onSaveDraft: () => void
  isWorking: boolean
}) {
  const creatives = campaign.creatives
  const [activeTab, setActiveTab] = useState(creatives?.[0]?.segmentId || null)
  const [regeneratingId, setRegeneratingId] = useState<string | null>(null)

  if (!creatives) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 text-agent animate-spin" />
      </div>
    )
  }

  const handleRegenerate = (id: string) => {
    setRegeneratingId(id)
    // Call regenerate
    onRegenerate(id)
    // Show spinner for visual feedback
    setTimeout(() => {
      setRegeneratingId(null)
    }, 1200)
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
              {/* Banner - Hero Background Style */}
              <div className={cn('rounded-2xl overflow-hidden border-2', active.approved ? 'border-success' : 'border-border')}>
                <div className="relative aspect-[4/3]">
                  {/* Background Product Image */}
                  <div className="absolute inset-0 bg-gradient-to-br from-slate-100 to-slate-200">
                    <img 
                      src={active.image} 
                      alt="" 
                      className="absolute right-0 top-1/2 -translate-y-1/2 h-[90%] w-auto object-contain opacity-90 drop-shadow-2xl"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.src = '/images/placeholder-product.svg'
                      }}
                    />
                  </div>
                  {/* Gradient Overlay for Text Readability */}
                  <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-900/70 to-transparent" />
                  {/* Content Overlay */}
                  <div className="absolute inset-0 p-6 flex flex-col justify-center">
                    <div className="max-w-[60%]">
                      {active.hasOffer && (
                        <span className="inline-block mb-3 px-3 py-1.5 bg-gradient-to-r from-red-500 to-pink-500 text-white text-sm font-bold rounded-full shadow-lg">
                          {active.offerBadge}
                        </span>
                      )}
                      <h3 className="text-2xl font-bold text-white mb-2 leading-tight drop-shadow-lg">{active.headline}</h3>
                      <p className="text-white/80 text-sm mb-5">{active.subcopy}</p>
                      <button className="px-6 py-2.5 bg-white text-slate-900 rounded-lg font-semibold text-sm hover:bg-slate-100 transition-colors shadow-lg">
                        {active.cta} →
                      </button>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-surface flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge variant="default">{active.tone}</Badge>
                    <Badge variant={active.approved ? 'success' : 'warning'}>
                      {active.approved ? 'approved' : 'pending review'}
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
                    <button 
                      onClick={() => handleRegenerate(active.id)}
                      disabled={regeneratingId === active.id}
                      className={cn(
                        "p-2 rounded-lg transition-all",
                        regeneratingId === active.id
                          ? "bg-agent/10 text-agent"
                          : "bg-surface-secondary text-text-muted hover:bg-agent/10 hover:text-agent"
                      )}
                      title="Regenerate creative"
                    >
                      <RefreshCw className={cn("w-4 h-4", regeneratingId === active.id && "animate-spin")} />
                    </button>
                    <button className="p-2 rounded-lg bg-surface-secondary text-text-muted hover:bg-surface-tertiary" title="Edit creative">
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
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={onSaveDraft}>
              <Save className="w-4 h-4 mr-2" /> Save Draft
            </Button>
            <p className="text-sm text-text-secondary">
              {creatives.filter(c => c.approved).length}/{creatives.length} approved
            </p>
          </div>
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
