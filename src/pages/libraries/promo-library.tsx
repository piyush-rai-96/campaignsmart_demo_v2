import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Tag, Filter, AlertTriangle, X, ExternalLink, 
  ChevronDown, Download, RefreshCw, CheckCircle, 
  Clock, Eye, Info, RotateCcw, Calendar, Check, Sparkles
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

// Extended Promotion type for this screen
interface Promotion {
  id: string
  name: string
  type: string
  discountValue: number
  discountUnit: '%' | '$'
  scopeType: 'Sitewide' | 'Product Scope' | 'Attribute'
  scopeSummary: string
  startDate: Date
  endDate: Date
  status: 'Running' | 'Upcoming' | 'Past'
  // Marketing KPIs (renamed from finance terms)
  campaignImpact: number // renamed from liftPercent
  expectedCampaignImpact: number // renamed from expectedLiftPercent
  marginSensitivity: number // renamed from gmPercent
  forecastedMarginSensitivity: number
  impressions: number
  ctr: number // Click-through rate
  engagementRate: number
  conversionRate: number
  creativeUsageCount: number
  campaignCoverage: number // percentage
  unitsSold: number // renamed from units
  forecastedUnitsSold: number
  campaignUsage: number
  channel: string
  // Product Scope (industry-specific)
  productType: string // e.g., Hair Color, Yarn, Canvas
  treatmentType?: string // e.g., Permanent, Semi-Permanent (Beauty)
  brand?: string
  useCase?: string // e.g., Color Refresh, DIY Project
  materialType?: string // e.g., Acrylic, Oil (Michaels)
  projectType?: string // e.g., Kids Craft, Seasonal Kit
  season: string
}

// Alert type with full context
interface PromoAlert {
  id: number
  severity: 'critical' | 'warning' | 'info'
  campaign?: string
  issue: string
  impactExplanation: string
  recommendation: string
  actionLabel: string
  actionType: 'create-promo' | 'edit-promo' | 'view-campaign' | 'dismiss'
  agentSuggestion?: {
    promoType: string
    discountRange: string
    scopeLevel: string
  }
}

const mockPromotions: Promotion[] = [
  {
    id: 'PROMO-001',
    name: '20% Off Hair Color',
    type: 'Percentage Discount',
    discountValue: 20,
    discountUnit: '%',
    scopeType: 'Product Scope',
    scopeSummary: 'Hair Color – Permanent',
    startDate: new Date('2024-12-01'),
    endDate: new Date('2024-12-31'),
    status: 'Running',
    campaignImpact: 18,
    expectedCampaignImpact: 20,
    marginSensitivity: 36,
    forecastedMarginSensitivity: 35,
    impressions: 245000,
    ctr: 4.2,
    engagementRate: 12.5,
    conversionRate: 3.8,
    creativeUsageCount: 4,
    campaignCoverage: 78,
    unitsSold: 2500,
    forecastedUnitsSold: 3000,
    campaignUsage: 5,
    channel: 'Email',
    productType: 'Hair Color',
    treatmentType: 'Permanent',
    brand: 'Wella',
    useCase: 'Color Refresh',
    season: 'Holiday',
  },
  {
    id: 'PROMO-002',
    name: 'Free Shipping Weekend',
    type: 'Free Shipping',
    discountValue: 0,
    discountUnit: '$',
    scopeType: 'Sitewide',
    scopeSummary: 'Orders over $50',
    startDate: new Date('2024-12-14'),
    endDate: new Date('2024-12-15'),
    status: 'Running',
    campaignImpact: 12,
    expectedCampaignImpact: 15,
    marginSensitivity: 33,
    forecastedMarginSensitivity: 33,
    impressions: 180000,
    ctr: 3.8,
    engagementRate: 9.2,
    conversionRate: 2.9,
    creativeUsageCount: 2,
    campaignCoverage: 100,
    unitsSold: 1800,
    forecastedUnitsSold: 2000,
    campaignUsage: 3,
    channel: 'All',
    productType: 'All Products',
    season: 'Holiday',
  },
  {
    id: 'PROMO-003',
    name: 'Nail Care Holiday Bundle',
    type: 'BOGO',
    discountValue: 30,
    discountUnit: '%',
    scopeType: 'Product Scope',
    scopeSummary: 'Nail Care – Gel & Polish',
    startDate: new Date('2024-12-20'),
    endDate: new Date('2024-12-26'),
    status: 'Upcoming',
    campaignImpact: 0,
    expectedCampaignImpact: 25,
    marginSensitivity: 0,
    forecastedMarginSensitivity: 32,
    impressions: 0,
    ctr: 0,
    engagementRate: 0,
    conversionRate: 0,
    creativeUsageCount: 0,
    campaignCoverage: 65,
    unitsSold: 0,
    forecastedUnitsSold: 4500,
    campaignUsage: 2,
    channel: 'All',
    productType: 'Nail Care',
    treatmentType: 'Gel Polish',
    brand: 'OPI',
    useCase: 'Holiday Glam',
    season: 'Holiday',
  },
  {
    id: 'PROMO-004',
    name: 'Styling Tools BOGO',
    type: 'BOGO',
    discountValue: 33,
    discountUnit: '%',
    scopeType: 'Attribute',
    scopeSummary: 'Tools – Heat Styling',
    startDate: new Date('2024-12-01'),
    endDate: new Date('2024-12-31'),
    status: 'Running',
    campaignImpact: 22,
    expectedCampaignImpact: 20,
    marginSensitivity: 34,
    forecastedMarginSensitivity: 35,
    impressions: 198000,
    ctr: 5.1,
    engagementRate: 14.2,
    conversionRate: 4.5,
    creativeUsageCount: 3,
    campaignCoverage: 82,
    unitsSold: 3200,
    forecastedUnitsSold: 3800,
    campaignUsage: 4,
    channel: 'Email',
    productType: 'Styling Tools',
    brand: 'CHI',
    useCase: 'Damage Repair',
    season: 'Holiday',
  },
  {
    id: 'PROMO-005',
    name: 'New Year Color Refresh',
    type: 'Percentage Discount',
    discountValue: 40,
    discountUnit: '%',
    scopeType: 'Product Scope',
    scopeSummary: 'Hair Color – Semi-Permanent',
    startDate: new Date('2024-12-31'),
    endDate: new Date('2025-01-02'),
    status: 'Upcoming',
    campaignImpact: 0,
    expectedCampaignImpact: 35,
    marginSensitivity: 0,
    forecastedMarginSensitivity: 30,
    impressions: 0,
    ctr: 0,
    engagementRate: 0,
    conversionRate: 0,
    creativeUsageCount: 0,
    campaignCoverage: 45,
    unitsSold: 0,
    forecastedUnitsSold: 5000,
    campaignUsage: 0,
    channel: 'Push',
    productType: 'Hair Color',
    treatmentType: 'Semi-Permanent',
    brand: 'Clairol',
    useCase: 'Color Refresh',
    season: 'New Year',
  },
  {
    id: 'PROMO-006',
    name: 'Black Friday Beauty Blowout',
    type: 'Percentage Discount',
    discountValue: 50,
    discountUnit: '%',
    scopeType: 'Sitewide',
    scopeSummary: 'All beauty products',
    startDate: new Date('2024-11-29'),
    endDate: new Date('2024-12-02'),
    status: 'Past',
    campaignImpact: 45,
    expectedCampaignImpact: 40,
    marginSensitivity: 30,
    forecastedMarginSensitivity: 30,
    impressions: 520000,
    ctr: 6.8,
    engagementRate: 18.5,
    conversionRate: 5.2,
    creativeUsageCount: 8,
    campaignCoverage: 100,
    unitsSold: 12000,
    forecastedUnitsSold: 10000,
    campaignUsage: 8,
    channel: 'All',
    productType: 'All Products',
    season: 'Black Friday',
  },
  {
    id: 'PROMO-007',
    name: 'Cyber Monday Skincare',
    type: 'Percentage Discount',
    discountValue: 35,
    discountUnit: '%',
    scopeType: 'Product Scope',
    scopeSummary: 'Skincare – Anti-Aging',
    startDate: new Date('2024-12-02'),
    endDate: new Date('2024-12-03'),
    status: 'Past',
    campaignImpact: 38,
    expectedCampaignImpact: 32,
    marginSensitivity: 30,
    forecastedMarginSensitivity: 30,
    impressions: 380000,
    ctr: 5.5,
    engagementRate: 15.8,
    conversionRate: 4.8,
    creativeUsageCount: 5,
    campaignCoverage: 72,
    unitsSold: 8500,
    forecastedUnitsSold: 7000,
    campaignUsage: 6,
    channel: 'Email',
    productType: 'Skincare',
    treatmentType: 'Anti-Aging',
    brand: 'Olay',
    useCase: 'Daily Routine',
    season: 'Black Friday',
  },
  {
    id: 'PROMO-008',
    name: 'Winter Hair Care',
    type: 'Fixed Discount',
    discountValue: 25,
    discountUnit: '$',
    scopeType: 'Attribute',
    scopeSummary: 'Hair Care – Moisturizing',
    startDate: new Date('2024-12-05'),
    endDate: new Date('2024-12-20'),
    status: 'Running',
    campaignImpact: 15,
    expectedCampaignImpact: 18,
    marginSensitivity: 30,
    forecastedMarginSensitivity: 30,
    impressions: 145000,
    ctr: 3.9,
    engagementRate: 11.2,
    conversionRate: 3.4,
    creativeUsageCount: 2,
    campaignCoverage: 58,
    unitsSold: 1560,
    forecastedUnitsSold: 1900,
    campaignUsage: 2,
    channel: 'Email',
    productType: 'Hair Care',
    treatmentType: 'Moisturizing',
    brand: 'Pantene',
    useCase: 'Damage Repair',
    season: 'Holiday',
  },
  {
    id: 'PROMO-009',
    name: 'Pro Member Exclusive',
    type: 'Percentage Discount',
    discountValue: 15,
    discountUnit: '%',
    scopeType: 'Sitewide',
    scopeSummary: 'Pro members only',
    startDate: new Date('2024-12-01'),
    endDate: new Date('2024-12-31'),
    status: 'Running',
    campaignImpact: 12,
    expectedCampaignImpact: 14,
    marginSensitivity: 35,
    forecastedMarginSensitivity: 35,
    impressions: 290000,
    ctr: 4.5,
    engagementRate: 13.8,
    conversionRate: 4.1,
    creativeUsageCount: 3,
    campaignCoverage: 100,
    unitsSold: 4200,
    forecastedUnitsSold: 5000,
    campaignUsage: 3,
    channel: 'In-App',
    productType: 'All Products',
    season: 'Holiday',
  },
  {
    id: 'PROMO-010',
    name: 'Gift Set Bonus',
    type: 'BOGO',
    discountValue: 10,
    discountUnit: '%',
    scopeType: 'Attribute',
    scopeSummary: 'Gift Sets – Holiday Edition',
    startDate: new Date('2024-12-15'),
    endDate: new Date('2024-12-24'),
    status: 'Running',
    campaignImpact: 25,
    expectedCampaignImpact: 30,
    marginSensitivity: 10,
    forecastedMarginSensitivity: 10,
    impressions: 125000,
    ctr: 5.8,
    engagementRate: 16.2,
    conversionRate: 4.9,
    creativeUsageCount: 2,
    campaignCoverage: 35,
    unitsSold: 900,
    forecastedUnitsSold: 1300,
    campaignUsage: 1,
    channel: 'All',
    productType: 'Gift Sets',
    useCase: 'Holiday Gifting',
    season: 'Holiday',
  },
  {
    id: 'PROMO-011',
    name: 'Spring Color Launch',
    type: 'Percentage Discount',
    discountValue: 20,
    discountUnit: '%',
    scopeType: 'Product Scope',
    scopeSummary: 'Hair Color – New Shades',
    startDate: new Date('2025-01-15'),
    endDate: new Date('2025-02-15'),
    status: 'Upcoming',
    campaignImpact: 0,
    expectedCampaignImpact: 22,
    marginSensitivity: 0,
    forecastedMarginSensitivity: 35,
    impressions: 0,
    ctr: 0,
    engagementRate: 0,
    conversionRate: 0,
    creativeUsageCount: 0,
    campaignCoverage: 0,
    unitsSold: 0,
    forecastedUnitsSold: 3000,
    campaignUsage: 0,
    channel: 'Email',
    productType: 'Hair Color',
    treatmentType: 'Permanent',
    brand: 'Wella',
    useCase: 'New Look',
    season: 'Spring',
  },
  {
    id: 'PROMO-012',
    name: 'Valentine Beauty',
    type: 'Percentage Discount',
    discountValue: 25,
    discountUnit: '%',
    scopeType: 'Product Scope',
    scopeSummary: 'Fragrance & Makeup',
    startDate: new Date('2025-02-01'),
    endDate: new Date('2025-02-14'),
    status: 'Upcoming',
    campaignImpact: 0,
    expectedCampaignImpact: 28,
    marginSensitivity: 0,
    forecastedMarginSensitivity: 40,
    impressions: 0,
    ctr: 0,
    engagementRate: 0,
    conversionRate: 0,
    creativeUsageCount: 0,
    campaignCoverage: 0,
    unitsSold: 0,
    forecastedUnitsSold: 2400,
    campaignUsage: 0,
    channel: 'All',
    productType: 'Fragrance',
    useCase: 'Gift Giving',
    season: 'Spring',
  },
  // Additional Running/Past Promotions
  {
    id: 'PROMO-013',
    name: 'Salon Pro Discount',
    type: 'Percentage Discount',
    discountValue: 30,
    discountUnit: '%',
    scopeType: 'Attribute',
    scopeSummary: 'Professional Products',
    startDate: new Date('2024-12-01'),
    endDate: new Date('2024-12-31'),
    status: 'Running',
    campaignImpact: 28,
    expectedCampaignImpact: 25,
    marginSensitivity: 32,
    forecastedMarginSensitivity: 32,
    impressions: 185000,
    ctr: 4.8,
    engagementRate: 13.5,
    conversionRate: 4.2,
    creativeUsageCount: 3,
    campaignCoverage: 85,
    unitsSold: 2800,
    forecastedUnitsSold: 3200,
    campaignUsage: 4,
    channel: 'Email',
    productType: 'Hair Care',
    brand: 'Redken',
    useCase: 'Professional Use',
    season: 'Holiday',
  },
  {
    id: 'PROMO-014',
    name: 'Flash Sale Friday',
    type: 'Percentage Discount',
    discountValue: 40,
    discountUnit: '%',
    scopeType: 'Sitewide',
    scopeSummary: 'All Categories',
    startDate: new Date('2024-12-13'),
    endDate: new Date('2024-12-13'),
    status: 'Running',
    campaignImpact: 35,
    expectedCampaignImpact: 30,
    marginSensitivity: 28,
    forecastedMarginSensitivity: 28,
    impressions: 320000,
    ctr: 6.2,
    engagementRate: 17.8,
    conversionRate: 5.5,
    creativeUsageCount: 5,
    campaignCoverage: 100,
    unitsSold: 5600,
    forecastedUnitsSold: 5000,
    campaignUsage: 6,
    channel: 'All',
    productType: 'All Products',
    season: 'Holiday',
  },
  {
    id: 'PROMO-015',
    name: 'Curly Hair Essentials',
    type: 'Fixed Discount',
    discountValue: 15,
    discountUnit: '$',
    scopeType: 'Product Scope',
    scopeSummary: 'Curly Hair Products',
    startDate: new Date('2024-12-10'),
    endDate: new Date('2024-12-25'),
    status: 'Running',
    campaignImpact: 19,
    expectedCampaignImpact: 22,
    marginSensitivity: 34,
    forecastedMarginSensitivity: 34,
    impressions: 98000,
    ctr: 4.1,
    engagementRate: 11.8,
    conversionRate: 3.6,
    creativeUsageCount: 2,
    campaignCoverage: 68,
    unitsSold: 1420,
    forecastedUnitsSold: 1800,
    campaignUsage: 2,
    channel: 'Email',
    productType: 'Hair Care',
    treatmentType: 'Curl Define',
    brand: 'DevaCurl',
    useCase: 'Curl Care',
    season: 'Holiday',
  },
  {
    id: 'PROMO-016',
    name: 'Thanksgiving Special',
    type: 'Percentage Discount',
    discountValue: 25,
    discountUnit: '%',
    scopeType: 'Sitewide',
    scopeSummary: 'All Products',
    startDate: new Date('2024-11-25'),
    endDate: new Date('2024-11-28'),
    status: 'Past',
    campaignImpact: 32,
    expectedCampaignImpact: 28,
    marginSensitivity: 31,
    forecastedMarginSensitivity: 31,
    impressions: 410000,
    ctr: 5.9,
    engagementRate: 16.2,
    conversionRate: 4.8,
    creativeUsageCount: 6,
    campaignCoverage: 100,
    unitsSold: 9200,
    forecastedUnitsSold: 8000,
    campaignUsage: 5,
    channel: 'All',
    productType: 'All Products',
    season: 'Holiday',
  },
  {
    id: 'PROMO-017',
    name: 'Luxury Skincare Event',
    type: 'Fixed Discount',
    discountValue: 50,
    discountUnit: '$',
    scopeType: 'Product Scope',
    scopeSummary: 'Premium Skincare',
    startDate: new Date('2024-11-15'),
    endDate: new Date('2024-11-20'),
    status: 'Past',
    campaignImpact: 42,
    expectedCampaignImpact: 35,
    marginSensitivity: 38,
    forecastedMarginSensitivity: 38,
    impressions: 165000,
    ctr: 5.2,
    engagementRate: 14.5,
    conversionRate: 4.1,
    creativeUsageCount: 4,
    campaignCoverage: 78,
    unitsSold: 3800,
    forecastedUnitsSold: 3200,
    campaignUsage: 3,
    channel: 'Email',
    productType: 'Skincare',
    treatmentType: 'Premium',
    brand: 'La Mer',
    useCase: 'Luxury Care',
    season: 'Holiday',
  },
  {
    id: 'PROMO-018',
    name: 'Early Bird Holiday',
    type: 'Percentage Discount',
    discountValue: 20,
    discountUnit: '%',
    scopeType: 'Sitewide',
    scopeSummary: 'All Categories',
    startDate: new Date('2024-11-01'),
    endDate: new Date('2024-11-10'),
    status: 'Past',
    campaignImpact: 18,
    expectedCampaignImpact: 20,
    marginSensitivity: 35,
    forecastedMarginSensitivity: 35,
    impressions: 280000,
    ctr: 4.2,
    engagementRate: 12.1,
    conversionRate: 3.5,
    creativeUsageCount: 4,
    campaignCoverage: 100,
    unitsSold: 4500,
    forecastedUnitsSold: 5000,
    campaignUsage: 4,
    channel: 'All',
    productType: 'All Products',
    season: 'Holiday',
  },
  {
    id: 'PROMO-019',
    name: 'Nail Art Collection',
    type: 'BOGO',
    discountValue: 50,
    discountUnit: '%',
    scopeType: 'Product Scope',
    scopeSummary: 'Nail Art & Accessories',
    startDate: new Date('2024-12-08'),
    endDate: new Date('2024-12-22'),
    status: 'Running',
    campaignImpact: 24,
    expectedCampaignImpact: 22,
    marginSensitivity: 29,
    forecastedMarginSensitivity: 29,
    impressions: 112000,
    ctr: 5.4,
    engagementRate: 15.2,
    conversionRate: 4.6,
    creativeUsageCount: 3,
    campaignCoverage: 72,
    unitsSold: 1850,
    forecastedUnitsSold: 2100,
    campaignUsage: 2,
    channel: 'Push',
    productType: 'Nail Care',
    treatmentType: 'Nail Art',
    brand: 'OPI',
    useCase: 'Creative Expression',
    season: 'Holiday',
  },
  {
    id: 'PROMO-020',
    name: 'Men\'s Grooming Week',
    type: 'Percentage Discount',
    discountValue: 25,
    discountUnit: '%',
    scopeType: 'Attribute',
    scopeSummary: 'Men\'s Products',
    startDate: new Date('2024-12-09'),
    endDate: new Date('2024-12-16'),
    status: 'Running',
    campaignImpact: 16,
    expectedCampaignImpact: 18,
    marginSensitivity: 36,
    forecastedMarginSensitivity: 36,
    impressions: 145000,
    ctr: 3.8,
    engagementRate: 10.5,
    conversionRate: 3.2,
    creativeUsageCount: 2,
    campaignCoverage: 65,
    unitsSold: 1680,
    forecastedUnitsSold: 2000,
    campaignUsage: 2,
    channel: 'Email',
    productType: 'Hair Care',
    useCase: 'Men\'s Grooming',
    season: 'Holiday',
  },
  // Additional Upcoming Promotions
  {
    id: 'PROMO-021',
    name: 'New Year Glow Up',
    type: 'Percentage Discount',
    discountValue: 30,
    discountUnit: '%',
    scopeType: 'Product Scope',
    scopeSummary: 'Skincare & Makeup',
    startDate: new Date('2025-01-01'),
    endDate: new Date('2025-01-07'),
    status: 'Upcoming',
    campaignImpact: 0,
    expectedCampaignImpact: 32,
    marginSensitivity: 0,
    forecastedMarginSensitivity: 33,
    impressions: 0,
    ctr: 0,
    engagementRate: 0,
    conversionRate: 0,
    creativeUsageCount: 0,
    campaignCoverage: 55,
    unitsSold: 0,
    forecastedUnitsSold: 4200,
    campaignUsage: 0,
    channel: 'All',
    productType: 'Skincare',
    useCase: 'New Year Refresh',
    season: 'New Year',
  },
  {
    id: 'PROMO-022',
    name: 'Winter Wellness Bundle',
    type: 'Bundle',
    discountValue: 35,
    discountUnit: '%',
    scopeType: 'Attribute',
    scopeSummary: 'Wellness Bundles',
    startDate: new Date('2025-01-10'),
    endDate: new Date('2025-01-31'),
    status: 'Upcoming',
    campaignImpact: 0,
    expectedCampaignImpact: 26,
    marginSensitivity: 0,
    forecastedMarginSensitivity: 30,
    impressions: 0,
    ctr: 0,
    engagementRate: 0,
    conversionRate: 0,
    creativeUsageCount: 0,
    campaignCoverage: 40,
    unitsSold: 0,
    forecastedUnitsSold: 1800,
    campaignUsage: 0,
    channel: 'Email',
    productType: 'Hair Care',
    useCase: 'Winter Protection',
    season: 'New Year',
  },
  {
    id: 'PROMO-023',
    name: 'VIP Early Access',
    type: 'Member Exclusive',
    discountValue: 20,
    discountUnit: '%',
    scopeType: 'Sitewide',
    scopeSummary: 'VIP Members Only',
    startDate: new Date('2025-01-05'),
    endDate: new Date('2025-01-12'),
    status: 'Upcoming',
    campaignImpact: 0,
    expectedCampaignImpact: 24,
    marginSensitivity: 0,
    forecastedMarginSensitivity: 38,
    impressions: 0,
    ctr: 0,
    engagementRate: 0,
    conversionRate: 0,
    creativeUsageCount: 0,
    campaignCoverage: 100,
    unitsSold: 0,
    forecastedUnitsSold: 3500,
    campaignUsage: 0,
    channel: 'In-App',
    productType: 'All Products',
    season: 'New Year',
  },
  {
    id: 'PROMO-024',
    name: 'Spring Prep Sale',
    type: 'Percentage Discount',
    discountValue: 25,
    discountUnit: '%',
    scopeType: 'Product Scope',
    scopeSummary: 'Hair Treatment',
    startDate: new Date('2025-02-15'),
    endDate: new Date('2025-02-28'),
    status: 'Upcoming',
    campaignImpact: 0,
    expectedCampaignImpact: 20,
    marginSensitivity: 0,
    forecastedMarginSensitivity: 34,
    impressions: 0,
    ctr: 0,
    engagementRate: 0,
    conversionRate: 0,
    creativeUsageCount: 0,
    campaignCoverage: 48,
    unitsSold: 0,
    forecastedUnitsSold: 2600,
    campaignUsage: 0,
    channel: 'Email',
    productType: 'Hair Care',
    treatmentType: 'Deep Conditioning',
    brand: 'Olaplex',
    useCase: 'Damage Repair',
    season: 'Spring',
  },
  {
    id: 'PROMO-025',
    name: 'Free Gift with Purchase',
    type: 'Gift with Purchase',
    discountValue: 0,
    discountUnit: '$',
    scopeType: 'Sitewide',
    scopeSummary: 'Orders over $75',
    startDate: new Date('2025-01-20'),
    endDate: new Date('2025-02-10'),
    status: 'Upcoming',
    campaignImpact: 0,
    expectedCampaignImpact: 18,
    marginSensitivity: 0,
    forecastedMarginSensitivity: 42,
    impressions: 0,
    ctr: 0,
    engagementRate: 0,
    conversionRate: 0,
    creativeUsageCount: 0,
    campaignCoverage: 100,
    unitsSold: 0,
    forecastedUnitsSold: 2200,
    campaignUsage: 0,
    channel: 'All',
    productType: 'All Products',
    season: 'Spring',
  },
  {
    id: 'PROMO-026',
    name: 'Galentine\'s Day Special',
    type: 'BOGO',
    discountValue: 50,
    discountUnit: '%',
    scopeType: 'Product Scope',
    scopeSummary: 'Nail & Lip Products',
    startDate: new Date('2025-02-10'),
    endDate: new Date('2025-02-13'),
    status: 'Upcoming',
    campaignImpact: 0,
    expectedCampaignImpact: 30,
    marginSensitivity: 0,
    forecastedMarginSensitivity: 28,
    impressions: 0,
    ctr: 0,
    engagementRate: 0,
    conversionRate: 0,
    creativeUsageCount: 0,
    campaignCoverage: 62,
    unitsSold: 0,
    forecastedUnitsSold: 3800,
    campaignUsage: 0,
    channel: 'Push',
    productType: 'Nail Care',
    useCase: 'Gift Giving',
    season: 'Spring',
  },
  {
    id: 'PROMO-027',
    name: 'Color Correction Week',
    type: 'Fixed Discount',
    discountValue: 20,
    discountUnit: '$',
    scopeType: 'Product Scope',
    scopeSummary: 'Color Correction Products',
    startDate: new Date('2025-01-25'),
    endDate: new Date('2025-02-01'),
    status: 'Upcoming',
    campaignImpact: 0,
    expectedCampaignImpact: 22,
    marginSensitivity: 0,
    forecastedMarginSensitivity: 35,
    impressions: 0,
    ctr: 0,
    engagementRate: 0,
    conversionRate: 0,
    creativeUsageCount: 0,
    campaignCoverage: 52,
    unitsSold: 0,
    forecastedUnitsSold: 1900,
    campaignUsage: 0,
    channel: 'Email',
    productType: 'Hair Color',
    treatmentType: 'Color Correction',
    brand: 'Wella',
    useCase: 'Color Fix',
    season: 'New Year',
  },
  {
    id: 'PROMO-028',
    name: 'Student Discount',
    type: 'Percentage Discount',
    discountValue: 15,
    discountUnit: '%',
    scopeType: 'Sitewide',
    scopeSummary: 'Verified Students',
    startDate: new Date('2025-01-15'),
    endDate: new Date('2025-05-31'),
    status: 'Upcoming',
    campaignImpact: 0,
    expectedCampaignImpact: 12,
    marginSensitivity: 0,
    forecastedMarginSensitivity: 40,
    impressions: 0,
    ctr: 0,
    engagementRate: 0,
    conversionRate: 0,
    creativeUsageCount: 0,
    campaignCoverage: 100,
    unitsSold: 0,
    forecastedUnitsSold: 8500,
    campaignUsage: 0,
    channel: 'All',
    productType: 'All Products',
    season: 'Spring',
  },
]

// Enhanced Alerts with Agent Suggestions
const initialAlerts: PromoAlert[] = [
  { 
    id: 1, 
    severity: 'critical',
    campaign: 'Spring Color Refresh', 
    issue: 'No promotion mapped for Hair Color – Permanent',
    impactExplanation: 'Campaign blocked – cannot launch without promo coverage for primary product scope',
    recommendation: 'Add category-level % Off promo targeting Permanent Hair Color',
    actionLabel: 'Create in PromoSmart',
    actionType: 'create-promo',
    agentSuggestion: {
      promoType: 'Percentage Discount',
      discountRange: '15-25%',
      scopeLevel: 'Product Scope: Hair Color – Permanent'
    }
  },
  { 
    id: 2, 
    severity: 'warning',
    campaign: 'Holiday Gift Guide', 
    issue: 'Promotion expires before campaign end (Dec 26 vs Dec 31)',
    impactExplanation: 'Last 5 days of campaign will have no active promotion – expected 18% drop in conversion',
    recommendation: 'Extend promo end date or create follow-up promotion',
    actionLabel: 'Edit Promo',
    actionType: 'edit-promo',
    agentSuggestion: {
      promoType: 'Extension',
      discountRange: 'Same as current',
      scopeLevel: 'Maintain current scope'
    }
  },
  { 
    id: 3, 
    severity: 'info',
    campaign: 'Winter Skincare Push', 
    issue: 'Low creative usage (1 of 4 creatives using this promo)',
    impactExplanation: 'Underutilized promo may reduce campaign reach by ~25%',
    recommendation: 'Consider adding promo badge to remaining creatives',
    actionLabel: 'View Campaign',
    actionType: 'view-campaign'
  },
]

const productTypes = ['All Product Types', 'Hair Color', 'Nail Care', 'Styling Tools', 'Skincare', 'Hair Care', 'Fragrance', 'Gift Sets']
const seasons = ['All Seasons', 'Holiday', 'Black Friday', 'New Year', 'Spring', 'Summer']
const channels = ['All Channels', 'Email', 'Push', 'SMS', 'In-App']
const promoTypes = ['All Types', 'Percentage Discount', 'Fixed Discount', 'Free Shipping', 'BOGO']

type TabType = 'running-past' | 'upcoming'

export function PromoLibrary() {
  const [showFilters, setShowFilters] = useState(false)
  const [alertsExpanded, setAlertsExpanded] = useState(false)
  const [alerts, setAlerts] = useState(initialAlerts)

  const dismissAlert = (alertId: number) => {
    setAlerts(prev => prev.filter(a => a.id !== alertId))
  }
  const [activeTab, setActiveTab] = useState<TabType>('running-past')
  const [selectedPromotion, setSelectedPromotion] = useState<Promotion | null>(null)
  
  // Filter states
  const [productTypeFilter, setProductTypeFilter] = useState('All Product Types')
  const [seasonFilter, setSeasonFilter] = useState('All Seasons')
  const [channelFilter, setChannelFilter] = useState('All Channels')
  const [typeFilter, setTypeFilter] = useState('All Types')
  const [scopeFilter, setScopeFilter] = useState('All Scopes')
  const [campaignUsedFilter, setCampaignUsedFilter] = useState<'all' | 'yes' | 'no'>('all')
  const [dateRange, setDateRange] = useState('Last 30 Days')
  const [showCustomDatePicker, setShowCustomDatePicker] = useState(false)
  const [customStartDate, setCustomStartDate] = useState('')
  const [customEndDate, setCustomEndDate] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // Dropdown open states
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)

  const handleDateRangeSelect = (value: string) => {
    setDateRange(value)
    if (value === 'Custom') {
      setShowCustomDatePicker(true)
    } else {
      setShowCustomDatePicker(false)
    }
    setOpenDropdown(null)
  }

  const applyCustomDateRange = () => {
    if (customStartDate && customEndDate) {
      setDateRange(`${customStartDate} - ${customEndDate}`)
      setShowCustomDatePicker(false)
    }
  }

  const hasActiveFilters = productTypeFilter !== 'All Product Types' || 
    seasonFilter !== 'All Seasons' || 
    channelFilter !== 'All Channels' ||
    typeFilter !== 'All Types' ||
    scopeFilter !== 'All Scopes' ||
    campaignUsedFilter !== 'all'

  const resetFilters = () => {
    setProductTypeFilter('All Product Types')
    setSeasonFilter('All Seasons')
    setChannelFilter('All Channels')
    setTypeFilter('All Types')
    setScopeFilter('All Scopes')
    setCampaignUsedFilter('all')
    setDateRange('Last 30 Days')
  }

  const filteredPromotions = mockPromotions.filter(promo => {
    const matchesTab = activeTab === 'upcoming' 
      ? promo.status === 'Upcoming'
      : promo.status === 'Running' || promo.status === 'Past'
    const matchesProductType = productTypeFilter === 'All Product Types' || promo.productType === productTypeFilter
    const matchesSeason = seasonFilter === 'All Seasons' || promo.season === seasonFilter
    const matchesChannel = channelFilter === 'All Channels' || promo.channel === channelFilter
    const matchesType = typeFilter === 'All Types' || promo.type === typeFilter
    const matchesScope = scopeFilter === 'All Scopes' || promo.scopeType === scopeFilter
    const matchesCampaignUsed = campaignUsedFilter === 'all' || 
      (campaignUsedFilter === 'yes' && promo.campaignUsage > 0) ||
      (campaignUsedFilter === 'no' && promo.campaignUsage === 0)
    
    return matchesTab && matchesProductType && matchesSeason && matchesChannel && matchesType && matchesScope && matchesCampaignUsed
  })

  // Pagination calculations
  const totalPages = Math.ceil(filteredPromotions.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedPromotions = filteredPromotions.slice(startIndex, endIndex)

  // Reset to page 1 when tab changes
  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab)
    setCurrentPage(1)
  }

  // KPI calculations with marketing qualifiers
  const totalPromotions = mockPromotions.length
  const campaignReadyPromos = mockPromotions.filter(p => p.campaignCoverage >= 50).length
  const draftPromos = totalPromotions - campaignReadyPromos
  const avgCoverage = Math.round(mockPromotions.reduce((acc, p) => acc + p.campaignCoverage, 0) / totalPromotions)

  const runningPromos = mockPromotions.filter(p => p.status === 'Running')
  const runningPromotions = runningPromos.length
  const lowPerformingRunning = runningPromos.filter(p => p.ctr < 3 || p.campaignCoverage < 50).length
  const avgRunningCTR = runningPromos.length > 0 
    ? (runningPromos.reduce((acc, p) => acc + p.ctr, 0) / runningPromos.length).toFixed(1)
    : '0'
  const avgRunningConversion = runningPromos.length > 0
    ? (runningPromos.reduce((acc, p) => acc + p.conversionRate, 0) / runningPromos.length).toFixed(1)
    : '0'

  const upcomingPromos = mockPromotions.filter(p => p.status === 'Upcoming')
  const upcomingPromotions = upcomingPromos.length
  const missingScope = upcomingPromos.filter(p => !p.productType || p.productType === 'All Products').length
  const belowCoverageThreshold = upcomingPromos.filter(p => p.campaignCoverage < 50).length

  const usedPromos = mockPromotions.filter(p => p.campaignUsage > 0)
  const usedInCampaigns = usedPromos.length
  const avgCampaignImpact = usedPromos.length > 0
    ? Math.round(usedPromos.reduce((acc, p) => acc + p.campaignImpact, 0) / usedPromos.length)
    : 0
  const highImpactPromos = usedPromos.filter(p => p.campaignImpact >= 30).length
  const mediumImpactPromos = usedPromos.filter(p => p.campaignImpact >= 15 && p.campaignImpact < 30).length
  const lowImpactPromos = usedPromos.filter(p => p.campaignImpact < 15).length

  const unusedPromos = mockPromotions.filter(p => p.campaignUsage === 0)
  const unusedPromotions = unusedPromos.length
  const reusablePromos = unusedPromos.filter(p => p.status !== 'Past' && new Date(p.endDate) > new Date()).length
  const expiredPromos = unusedPromotions - reusablePromos

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-US').format(value)
  }

  // Helper to get Campaign Impact tier
  const getImpactTier = (impact: number): { label: string; color: string } => {
    if (impact >= 30) return { label: 'High', color: 'text-success' }
    if (impact >= 15) return { label: 'Medium', color: 'text-warning' }
    return { label: 'Low', color: 'text-text-muted' }
  }

  // Helper to get Margin Sensitivity tier
  const getMarginRisk = (sensitivity: number): { label: string; color: string } => {
    if (sensitivity >= 35) return { label: 'Low', color: 'text-success' }
    if (sensitivity >= 25) return { label: 'Medium', color: 'text-warning' }
    return { label: 'High', color: 'text-danger' }
  }

  // Helper to format discount display based on offer type
  const formatDiscountDisplay = (promo: Promotion): string => {
    const type = promo.type
    if (type === 'Percentage Discount') return `${promo.discountValue}%`
    if (type === 'Fixed Discount') return `$${promo.discountValue}`
    if (type === 'BOGO') return 'Buy 2 Get 1'
    if (type === 'Free Shipping') return promo.discountValue > 0 ? `Over $${promo.discountValue}` : 'All Orders'
    if (type === 'Gift with Purchase') return 'Free Gift'
    if (type === 'Bundle') return 'Bundle Deal'
    if (type === 'Member Exclusive') return 'Members Only'
    return '—'
  }

  // Helper to get offer type short label
  const getOfferTypeLabel = (type: string): string => {
    if (type === 'Percentage Discount') return '% Off'
    if (type === 'Fixed Discount') return '$ Off'
    if (type === 'BOGO') return 'BOGO'
    if (type === 'Free Shipping') return 'Free Shipping'
    if (type === 'Gift with Purchase') return 'Gift w/ Purchase'
    if (type === 'Bundle') return 'Bundle'
    if (type === 'Member Exclusive') return 'Member Exclusive'
    return type
  }

  return (
    <div className="min-h-screen bg-surface-secondary">
      {/* Header */}
      <header className="bg-surface border-b border-border px-8 py-6">
        <div className="max-w-full mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-text-primary">Promotion Library</h1>
              <p className="text-text-secondary text-sm">Synced from PromoSmart</p>
            </div>
            <div className="flex items-center gap-4">
              {/* Sync Status */}
              <div className="flex items-center gap-3 px-4 py-2 bg-surface-secondary rounded-lg border border-border">
                <Button variant="primary" size="sm" className="gap-2">
                  <RefreshCw className="w-4 h-4" />
                  Sync with PromoSmart
                </Button>
                <div className="flex items-center gap-2 text-sm text-text-secondary">
                  <Clock className="w-4 h-4" />
                  <span>Last synced: Dec 15, 2024, 09:30 AM</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-success" />
                  <span className="text-sm text-success font-medium">Up to date</span>
                </div>
                <button className="p-1 hover:bg-surface-tertiary rounded">
                  <Info className="w-4 h-4 text-text-muted" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-full mx-auto px-8 py-6">
        {/* Filters Toggle - At Top */}
        <div className="mb-6">
          <Button
            variant={showFilters ? 'primary' : 'outline'}
            onClick={() => setShowFilters(!showFilters)}
            className="gap-2"
          >
            <Filter className="w-4 h-4" />
            Filters
            {hasActiveFilters && (
              <span className="ml-1 px-1.5 py-0.5 bg-white/20 rounded text-xs">
                {[productTypeFilter !== 'All Product Types', seasonFilter !== 'All Seasons', channelFilter !== 'All Channels', typeFilter !== 'All Types', scopeFilter !== 'All Scopes', campaignUsedFilter !== 'all'].filter(Boolean).length}
              </span>
            )}
          </Button>
        </div>

        {/* Collapsible Filter Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mb-6 relative z-50"
            >
              <div className="bg-surface rounded-xl border border-border p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium text-text-primary">Global Filters</h3>
                  {hasActiveFilters && (
                    <button
                      onClick={resetFilters}
                      className="flex items-center gap-1.5 text-sm text-primary hover:underline"
                    >
                      <RotateCcw className="w-3 h-3" />
                      Reset
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-5 gap-4">
                  {/* Date Range Dropdown */}
                  <div className="relative">
                    <label className="block text-xs text-text-muted mb-1.5">Date Range</label>
                    <button
                      onClick={() => setOpenDropdown(openDropdown === 'dateRange' ? null : 'dateRange')}
                      className="w-full px-3 py-2.5 bg-surface border border-border rounded-lg text-sm text-left flex items-center justify-between hover:border-primary/50 transition-colors"
                    >
                      <span className="text-text-primary">{dateRange}</span>
                      <ChevronDown className={cn('w-4 h-4 text-text-muted transition-transform', openDropdown === 'dateRange' && 'rotate-180')} />
                    </button>
                    <AnimatePresence>
                      {openDropdown === 'dateRange' && (
                        <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                          className="absolute top-full left-0 right-0 mt-1 bg-surface border border-border rounded-lg shadow-lg z-[9999] overflow-hidden">
                          {['Last 7 Days', 'Last 30 Days', 'Last Quarter', 'YTD', 'Custom'].map((option) => (
                            <button key={option} onClick={() => handleDateRangeSelect(option)}
                              className={cn('w-full px-4 py-2.5 text-left text-sm hover:bg-surface-secondary transition-colors flex items-center justify-between',
                                dateRange === option && 'bg-primary/5 text-primary font-medium')}>
                              {option}
                              {dateRange === option && <Check className="w-4 h-4" />}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                    <AnimatePresence>
                      {showCustomDatePicker && (
                        <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                          className="absolute top-full left-0 mt-1 p-4 bg-surface border border-border rounded-lg shadow-lg z-[9999] min-w-[280px]">
                          <div className="flex items-center gap-2 mb-3">
                            <Calendar className="w-4 h-4 text-primary" />
                            <span className="text-sm font-medium text-text-primary">Custom Range</span>
                          </div>
                          <div className="space-y-3">
                            <div>
                              <label className="block text-xs text-text-muted mb-1">Start Date</label>
                              <input type="date" value={customStartDate} onChange={(e) => setCustomStartDate(e.target.value)}
                                className="w-full px-3 py-2 bg-surface-secondary border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                            </div>
                            <div>
                              <label className="block text-xs text-text-muted mb-1">End Date</label>
                              <input type="date" value={customEndDate} onChange={(e) => setCustomEndDate(e.target.value)}
                                className="w-full px-3 py-2 bg-surface-secondary border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                            </div>
                            <div className="flex gap-2 pt-2">
                              <Button variant="outline" size="sm" className="flex-1" onClick={() => setShowCustomDatePicker(false)}>Cancel</Button>
                              <Button variant="primary" size="sm" className="flex-1" onClick={applyCustomDateRange}>Apply</Button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Channel Dropdown */}
                  <div className="relative">
                    <label className="block text-xs text-text-muted mb-1.5">Channel</label>
                    <button onClick={() => setOpenDropdown(openDropdown === 'channel' ? null : 'channel')}
                      className="w-full px-3 py-2.5 bg-surface border border-border rounded-lg text-sm text-left flex items-center justify-between hover:border-primary/50 transition-colors">
                      <span className="text-text-primary">{channelFilter}</span>
                      <ChevronDown className={cn('w-4 h-4 text-text-muted transition-transform', openDropdown === 'channel' && 'rotate-180')} />
                    </button>
                    <AnimatePresence>
                      {openDropdown === 'channel' && (
                        <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                          className="absolute top-full left-0 right-0 mt-1 bg-surface border border-border rounded-lg shadow-lg z-[9999] overflow-hidden">
                          {channels.map((option) => (
                            <button key={option} onClick={() => { setChannelFilter(option); setOpenDropdown(null) }}
                              className={cn('w-full px-4 py-2.5 text-left text-sm hover:bg-surface-secondary transition-colors flex items-center justify-between',
                                channelFilter === option && 'bg-primary/5 text-primary font-medium')}>
                              {option}
                              {channelFilter === option && <Check className="w-4 h-4" />}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Offer Type Dropdown */}
                  <div className="relative">
                    <label className="block text-xs text-text-muted mb-1.5">Offer Type</label>
                    <button onClick={() => setOpenDropdown(openDropdown === 'type' ? null : 'type')}
                      className="w-full px-3 py-2.5 bg-surface border border-border rounded-lg text-sm text-left flex items-center justify-between hover:border-primary/50 transition-colors">
                      <span className="text-text-primary">{typeFilter}</span>
                      <ChevronDown className={cn('w-4 h-4 text-text-muted transition-transform', openDropdown === 'type' && 'rotate-180')} />
                    </button>
                    <AnimatePresence>
                      {openDropdown === 'type' && (
                        <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                          className="absolute top-full left-0 right-0 mt-1 bg-surface border border-border rounded-lg shadow-lg z-[9999] overflow-hidden">
                          {promoTypes.map((option) => (
                            <button key={option} onClick={() => { setTypeFilter(option); setOpenDropdown(null) }}
                              className={cn('w-full px-4 py-2.5 text-left text-sm hover:bg-surface-secondary transition-colors flex items-center justify-between',
                                typeFilter === option && 'bg-primary/5 text-primary font-medium')}>
                              {option}
                              {typeFilter === option && <Check className="w-4 h-4" />}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Product Type Dropdown */}
                  <div className="relative">
                    <label className="block text-xs text-text-muted mb-1.5">Product Type</label>
                    <button onClick={() => setOpenDropdown(openDropdown === 'productType' ? null : 'productType')}
                      className="w-full px-3 py-2.5 bg-surface border border-border rounded-lg text-sm text-left flex items-center justify-between hover:border-primary/50 transition-colors">
                      <span className="text-text-primary">{productTypeFilter}</span>
                      <ChevronDown className={cn('w-4 h-4 text-text-muted transition-transform', openDropdown === 'productType' && 'rotate-180')} />
                    </button>
                    <AnimatePresence>
                      {openDropdown === 'productType' && (
                        <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                          className="absolute top-full left-0 right-0 mt-1 bg-surface border border-border rounded-lg shadow-lg z-[9999] overflow-hidden">
                          {productTypes.map((option: string) => (
                            <button key={option} onClick={() => { setProductTypeFilter(option); setOpenDropdown(null) }}
                              className={cn('w-full px-4 py-2.5 text-left text-sm hover:bg-surface-secondary transition-colors flex items-center justify-between',
                                productTypeFilter === option && 'bg-primary/5 text-primary font-medium')}>
                              {option}
                              {productTypeFilter === option && <Check className="w-4 h-4" />}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Season Dropdown */}
                  <div className="relative">
                    <label className="block text-xs text-text-muted mb-1.5">Season</label>
                    <button onClick={() => setOpenDropdown(openDropdown === 'season' ? null : 'season')}
                      className="w-full px-3 py-2.5 bg-surface border border-border rounded-lg text-sm text-left flex items-center justify-between hover:border-primary/50 transition-colors">
                      <span className="text-text-primary">{seasonFilter}</span>
                      <ChevronDown className={cn('w-4 h-4 text-text-muted transition-transform', openDropdown === 'season' && 'rotate-180')} />
                    </button>
                    <AnimatePresence>
                      {openDropdown === 'season' && (
                        <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                          className="absolute top-full left-0 right-0 mt-1 bg-surface border border-border rounded-lg shadow-lg z-[9999] overflow-hidden">
                          {seasons.map((option) => (
                            <button key={option} onClick={() => { setSeasonFilter(option); setOpenDropdown(null) }}
                              className={cn('w-full px-4 py-2.5 text-left text-sm hover:bg-surface-secondary transition-colors flex items-center justify-between',
                                seasonFilter === option && 'bg-primary/5 text-primary font-medium')}>
                              {option}
                              {seasonFilter === option && <Check className="w-4 h-4" />}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Campaign Used Filter */}
                <div className="mt-4 flex items-center gap-4">
                  <span className="text-sm text-text-secondary">Campaign Used:</span>
                  <div className="flex gap-2">
                    {(['all', 'yes', 'no'] as const).map((option) => (
                      <button key={option} onClick={() => setCampaignUsedFilter(option)}
                        className={cn('px-3 py-1.5 text-sm rounded-lg transition-colors',
                          campaignUsedFilter === option ? 'bg-primary text-white' : 'bg-surface border border-border text-text-secondary hover:border-primary/50')}>
                        {option === 'all' ? 'All' : option === 'yes' ? 'Yes' : 'No'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Modern Alerts Section - Collapsed by Default */}
        <AnimatePresence>
          {alerts.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              className="mb-4"
            >
              <div className="bg-surface rounded-lg border border-border overflow-hidden">
                {/* Compact Header */}
                <div 
                  onClick={() => setAlertsExpanded(!alertsExpanded)}
                  className="px-4 py-2.5 flex items-center justify-between cursor-pointer hover:bg-surface-secondary/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {/* Alert Icon with Count Badge */}
                    <div className="relative">
                      <AlertTriangle className="w-4 h-4 text-warning" />
                      {alerts.filter(a => a.severity === 'critical').length > 0 && (
                        <span className="absolute -top-1.5 -right-1.5 w-2 h-2 rounded-full bg-danger animate-pulse" />
                      )}
                    </div>
                    
                    {/* Alert Summary */}
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-text-primary">{alerts.length} Alerts</span>
                      <div className="flex items-center gap-1.5 text-[11px]">
                        {alerts.filter(a => a.severity === 'critical').length > 0 && (
                          <span className="text-danger font-medium">{alerts.filter(a => a.severity === 'critical').length} critical</span>
                        )}
                        {alerts.filter(a => a.severity === 'warning').length > 0 && (
                          <>
                            {alerts.filter(a => a.severity === 'critical').length > 0 && <span className="text-text-muted">•</span>}
                            <span className="text-warning">{alerts.filter(a => a.severity === 'warning').length} warning</span>
                          </>
                        )}
                        {alerts.filter(a => a.severity === 'info').length > 0 && (
                          <>
                            <span className="text-text-muted">•</span>
                            <span className="text-info">{alerts.filter(a => a.severity === 'info').length} info</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Clear All - Always visible */}
                    <button
                      onClick={(e) => { e.stopPropagation(); setAlerts([]); }}
                      className="text-[11px] text-text-muted hover:text-danger transition-colors"
                    >
                      × Clear All
                    </button>
                    
                    {/* Expand/Collapse */}
                    <ChevronDown className={cn(
                      'w-4 h-4 text-text-muted transition-transform duration-200',
                      alertsExpanded && 'rotate-180'
                    )} />
                  </div>
                </div>

                {/* Expandable Alert List */}
                <AnimatePresence>
                  {alertsExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="border-t border-border/50 overflow-hidden"
                    >
                      <div className="max-h-[280px] overflow-y-auto">
                        <AnimatePresence mode="popLayout">
                          {alerts.map((alert) => (
                            <motion.div
                              key={alert.id}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0, height: 0 }}
                              className="flex items-start gap-3 px-4 py-2.5 border-b border-border/30 last:border-0 hover:bg-surface-secondary/30 transition-colors group"
                            >
                              {/* Severity Indicator */}
                              <div className={cn(
                                'w-1 h-full min-h-[40px] rounded-full flex-shrink-0',
                                alert.severity === 'critical' ? 'bg-danger' : 
                                alert.severity === 'warning' ? 'bg-warning' : 'bg-info'
                              )} />
                              
                              {/* Content */}
                              <div className="flex-1 min-w-0 py-0.5">
                                <div className="flex items-center gap-2 mb-1">
                                  {alert.campaign && (
                                    <span className="text-[10px] font-medium text-primary">{alert.campaign}</span>
                                  )}
                                </div>
                                <p className="text-sm text-text-primary leading-snug">{alert.issue}</p>
                                <p className="text-xs text-text-muted mt-1">
                                  <span className="text-success">→</span> {alert.recommendation}
                                </p>
                              </div>

                              {/* Agent Suggestion Pill */}
                              {alert.agentSuggestion && (
                                <div className="hidden lg:flex items-center gap-1.5 px-2 py-1 bg-agent/5 rounded text-[10px] flex-shrink-0">
                                  <Sparkles className="w-3 h-3 text-agent" />
                                  <span className="text-agent font-medium">{alert.agentSuggestion.promoType}</span>
                                  <span className="text-text-muted">@</span>
                                  <span className="text-text-secondary">{alert.agentSuggestion.discountRange}</span>
                                </div>
                              )}

                              {/* Dismiss Button */}
                              <button
                                onClick={(e) => { e.stopPropagation(); dismissAlert(alert.id); }}
                                className="p-1 rounded hover:bg-surface-tertiary text-text-muted hover:text-danger opacity-0 group-hover:opacity-100 transition-all flex-shrink-0"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      </div>

                      {/* Footer */}
                      <div className="px-4 py-2 bg-surface-secondary/30 border-t border-border/30 flex items-center justify-end gap-3 text-[11px]">
                        <button onClick={() => setAlerts(alerts.filter(a => a.severity !== 'info'))} className="text-text-muted hover:text-info transition-colors">Clear info</button>
                        <span className="text-border">•</span>
                        <button onClick={() => setAlerts(alerts.filter(a => a.severity !== 'warning'))} className="text-text-muted hover:text-warning transition-colors">Clear warnings</button>
                        <span className="text-border">•</span>
                        <button onClick={() => setAlerts([])} className="text-text-muted hover:text-danger transition-colors">Clear all</button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Summary Cards with Marketing Qualifiers */}
        <div className="grid grid-cols-5 gap-4 mb-6">
          {/* Total Promotions */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }}>
            <Card className="p-4 group hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-text-muted uppercase tracking-wide">Total Promotions</span>
                <Tag className="w-4 h-4 text-text-muted" />
              </div>
              <p className="text-2xl font-bold text-text-primary mb-1">{totalPromotions}</p>
              <p className="text-xs text-text-secondary">
                <span className="text-success font-medium">{campaignReadyPromos} ready</span>
                <span className="mx-1">•</span>
                <span>{draftPromos} draft</span>
              </p>
              <div className="mt-2 pt-2 border-t border-border/50 opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="text-[10px] text-text-muted">Avg Coverage: {avgCoverage}%</p>
              </div>
            </Card>
          </motion.div>

          {/* Running Promotions */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
            <Card className="p-4 group hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-text-muted uppercase tracking-wide">Running</span>
                <CheckCircle className="w-4 h-4 text-success" />
              </div>
              <p className="text-2xl font-bold text-text-primary mb-1">{runningPromotions}</p>
              {lowPerformingRunning > 0 ? (
                <p className="text-xs text-warning">
                  <span className="font-medium">{lowPerformingRunning} flagged</span> low coverage/CTR
                </p>
              ) : (
                <p className="text-xs text-success">All performing well</p>
              )}
              <div className="mt-2 pt-2 border-t border-border/50 opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="text-[10px] text-text-muted">Avg CTR: {avgRunningCTR}% | Conv: {avgRunningConversion}%</p>
              </div>
            </Card>
          </motion.div>

          {/* Upcoming Promotions */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="p-4 group hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-text-muted uppercase tracking-wide">Upcoming</span>
                <Clock className="w-4 h-4 text-info" />
              </div>
              <p className="text-2xl font-bold text-text-primary mb-1">{upcomingPromotions}</p>
              {missingScope > 0 ? (
                <p className="text-xs text-warning">
                  <span className="font-medium">{missingScope} missing</span> product scope
                </p>
              ) : (
                <p className="text-xs text-success">All scopes defined</p>
              )}
              <div className="mt-2 pt-2 border-t border-border/50 opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="text-[10px] text-text-muted">{belowCoverageThreshold} below coverage threshold</p>
              </div>
            </Card>
          </motion.div>

          {/* Used in Campaigns - Marketing KPI explicit here */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <Card className="p-4 group hover:shadow-md transition-shadow border-primary/20">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-text-muted uppercase tracking-wide">Used in Campaigns</span>
                <Tag className="w-4 h-4 text-primary" />
              </div>
              <p className="text-2xl font-bold text-text-primary mb-1">{usedInCampaigns}</p>
              <p className="text-xs">
                <span className="text-primary font-semibold">Avg Impact: +{avgCampaignImpact}%</span>
              </p>
              <div className="mt-2 pt-2 border-t border-border/50 opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="text-[10px] text-text-muted">
                  High: {highImpactPromos} • Med: {mediumImpactPromos} • Low: {lowImpactPromos}
                </p>
              </div>
            </Card>
          </motion.div>

          {/* Unused Promotions */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="p-4 group hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-text-muted uppercase tracking-wide">Unused</span>
                <AlertTriangle className="w-4 h-4 text-warning" />
              </div>
              <p className="text-2xl font-bold text-text-primary mb-1">{unusedPromotions}</p>
              <p className="text-xs text-text-secondary">
                <span className="text-success font-medium">{reusablePromos} reusable</span>
                <span className="mx-1">•</span>
                <span className="text-text-muted">{expiredPromos} expired</span>
              </p>
              <div className="mt-2 pt-2 border-t border-border/50 opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="text-[10px] text-text-muted">Opportunity for campaign mapping</p>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Tabs and Export Row */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-1 bg-surface-tertiary p-1 rounded-lg w-fit">
            <button
              onClick={() => handleTabChange('running-past')}
              className={cn(
                'px-4 py-2 text-sm font-medium rounded-md transition-colors',
                activeTab === 'running-past'
                  ? 'bg-surface text-text-primary shadow-sm'
                  : 'text-text-secondary hover:text-text-primary'
              )}
            >
              Running & Past
            </button>
            <button
              onClick={() => handleTabChange('upcoming')}
              className={cn(
                'px-4 py-2 text-sm font-medium rounded-md transition-colors',
                activeTab === 'upcoming'
                  ? 'bg-surface text-text-primary shadow-sm'
                  : 'text-text-secondary hover:text-text-primary'
              )}
            >
              Upcoming
            </button>
          </div>
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Export
          </Button>
        </div>

        {/* Promotion Table - Production Ready with Clean Styling */}
        <div className="bg-surface rounded-xl border border-border overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1400px]">
              <thead className="bg-surface-secondary/80 border-b border-border">
                <tr className="divide-x divide-border/30">
                  <th className="px-4 py-3.5 text-left text-[11px] font-semibold text-text-muted uppercase tracking-wider whitespace-nowrap w-[95px]">ID</th>
                  <th className="px-4 py-3.5 text-left text-[11px] font-semibold text-text-muted uppercase tracking-wider whitespace-nowrap w-[160px]">Promotion</th>
                  <th className="px-4 py-3.5 text-left text-[11px] font-semibold text-text-muted uppercase tracking-wider whitespace-nowrap w-[110px]">Offer Type</th>
                  <th className="px-4 py-3.5 text-left text-[11px] font-semibold text-text-muted uppercase tracking-wider whitespace-nowrap w-[100px]">Discount</th>
                  <th className="px-4 py-3.5 text-left text-[11px] font-semibold text-text-muted uppercase tracking-wider whitespace-nowrap w-[140px]">Scope</th>
                  <th className="px-4 py-3.5 text-left text-[11px] font-semibold text-text-muted uppercase tracking-wider whitespace-nowrap w-[85px]">Start</th>
                  <th className="px-4 py-3.5 text-left text-[11px] font-semibold text-text-muted uppercase tracking-wider whitespace-nowrap w-[85px]">End</th>
                  <th className="px-4 py-3.5 text-center text-[11px] font-semibold text-text-muted uppercase tracking-wider whitespace-nowrap w-[80px]">Status</th>
                  <th className="px-4 py-3.5 text-center text-[11px] font-semibold text-text-muted uppercase tracking-wider whitespace-nowrap w-[75px] group relative cursor-help">
                    Impact
                    <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-text-primary text-surface text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                      Relative uplift vs baseline (not revenue)
                    </span>
                  </th>
                  <th className="px-4 py-3.5 text-center text-[11px] font-semibold text-text-muted uppercase tracking-wider whitespace-nowrap w-[90px] group relative cursor-help">
                    Margin Risk
                    <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-text-primary text-surface text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                      Risk based on discount depth & elasticity
                    </span>
                  </th>
                  <th className="px-4 py-3.5 text-center text-[11px] font-semibold text-text-muted uppercase tracking-wider whitespace-nowrap w-[60px]">CTR</th>
                  <th className="px-4 py-3.5 text-center text-[11px] font-semibold text-text-muted uppercase tracking-wider whitespace-nowrap w-[60px]">Conv.</th>
                  <th className="px-4 py-3.5 text-center text-[11px] font-semibold text-text-muted uppercase tracking-wider whitespace-nowrap w-[90px]">Coverage</th>
                  <th className="px-4 py-3.5 text-right text-[11px] font-semibold text-text-muted uppercase tracking-wider whitespace-nowrap w-[85px]">Units Sold</th>
                  <th className="px-2 py-3.5 text-center text-[11px] font-semibold text-text-muted uppercase tracking-wider whitespace-nowrap w-[40px]"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {paginatedPromotions.length === 0 ? (
                  <tr>
                    <td colSpan={15} className="px-4 py-12 text-center">
                      <div className="flex flex-col items-center">
                        <Tag className="w-10 h-10 text-text-muted mb-3" />
                        <p className="text-text-primary font-medium mb-1">No promotions found</p>
                        <p className="text-sm text-text-secondary">
                          {activeTab === 'upcoming' 
                            ? 'No upcoming promotions scheduled'
                            : 'No promotions match your current filters'}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedPromotions.map((promo, index) => {
                    const impactValue = activeTab === 'upcoming' ? promo.expectedCampaignImpact : promo.campaignImpact
                    const impactTier = getImpactTier(impactValue)
                    const marginValue = activeTab === 'upcoming' ? promo.forecastedMarginSensitivity : promo.marginSensitivity
                    const marginRisk = getMarginRisk(marginValue)
                    
                    return (
                      <tr 
                        key={promo.id} 
                        className={cn(
                          'hover:bg-primary/5 transition-colors group',
                          index % 2 === 0 ? 'bg-surface' : 'bg-surface-secondary/20'
                        )}
                      >
                        {/* ID */}
                        <td className="px-4 py-3 text-xs font-mono text-text-muted whitespace-nowrap">{promo.id}</td>
                        {/* Promotion Name */}
                        <td className="px-4 py-3">
                          <p className="text-sm font-medium text-text-primary truncate max-w-[150px]" title={promo.name}>{promo.name}</p>
                        </td>
                        {/* Offer Type */}
                        <td className="px-4 py-3">
                          <span className="text-xs text-text-secondary whitespace-nowrap">{getOfferTypeLabel(promo.type)}</span>
                        </td>
                        {/* Discount */}
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-primary/10 text-primary text-xs font-semibold whitespace-nowrap">
                            {formatDiscountDisplay(promo)}
                          </span>
                        </td>
                        {/* Scope */}
                        <td className="px-4 py-3">
                          <p className="text-xs font-medium text-text-primary truncate max-w-[130px]" title={promo.scopeType}>{promo.scopeType}</p>
                          <p className="text-[10px] text-text-muted truncate max-w-[130px]" title={promo.scopeSummary}>{promo.scopeSummary}</p>
                        </td>
                        {/* Start Date */}
                        <td className="px-4 py-3 text-xs text-text-secondary whitespace-nowrap">
                          {promo.startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </td>
                        {/* End Date */}
                        <td className="px-4 py-3 text-xs text-text-secondary whitespace-nowrap">
                          {promo.endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </td>
                        {/* Status */}
                        <td className="px-4 py-3 text-center">
                          <Badge
                            variant={promo.status === 'Running' ? 'success' : promo.status === 'Upcoming' ? 'info' : 'default'}
                            className="text-[10px] px-2 py-0.5"
                          >
                            {promo.status}
                          </Badge>
                        </td>
                        {/* Campaign Impact - Tier based */}
                        <td className="px-4 py-3 text-center group/cell relative">
                          <span className={cn(
                            'inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold',
                            impactTier.label === 'High' ? 'bg-success/10 text-success' :
                            impactTier.label === 'Medium' ? 'bg-warning/10 text-warning' :
                            'bg-surface-tertiary text-text-muted'
                          )}>
                            {impactTier.label}
                          </span>
                          <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-text-primary text-surface text-[10px] rounded opacity-0 group-hover/cell:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                            +{impactValue}% vs baseline
                          </span>
                        </td>
                        {/* Margin Risk */}
                        <td className="px-4 py-3 text-center group/cell relative">
                          <span className={cn(
                            'inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold',
                            marginRisk.label === 'Low' ? 'bg-success/10 text-success' :
                            marginRisk.label === 'Medium' ? 'bg-warning/10 text-warning' :
                            'bg-danger/10 text-danger'
                          )}>
                            {marginRisk.label}
                          </span>
                          <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-text-primary text-surface text-[10px] rounded opacity-0 group-hover/cell:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                            {marginValue}% margin sensitivity
                          </span>
                        </td>
                        {/* CTR */}
                        <td className="px-4 py-3 text-center text-xs text-text-secondary font-medium">
                          {promo.ctr > 0 ? `${promo.ctr}%` : '—'}
                        </td>
                        {/* Conversion */}
                        <td className="px-4 py-3 text-center text-xs text-text-secondary font-medium">
                          {promo.conversionRate > 0 ? `${promo.conversionRate}%` : '—'}
                        </td>
                        {/* Coverage */}
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <div className="w-12 h-1.5 bg-surface-tertiary rounded-full overflow-hidden">
                              <div 
                                className={cn(
                                  'h-full rounded-full',
                                  promo.campaignCoverage >= 80 ? 'bg-success' : 
                                  promo.campaignCoverage >= 50 ? 'bg-warning' : 'bg-danger'
                                )}
                                style={{ width: `${promo.campaignCoverage}%` }}
                              />
                            </div>
                            <span className="text-[11px] text-text-muted font-medium w-8">{promo.campaignCoverage}%</span>
                          </div>
                        </td>
                        {/* Units Sold */}
                        <td className="px-4 py-3 text-right text-xs text-text-secondary font-medium whitespace-nowrap">
                          {promo.unitsSold > 0 ? formatNumber(promo.unitsSold) : '—'}
                        </td>
                        {/* Action */}
                        <td className="px-2 py-3 text-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-7 h-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => setSelectedPromotion(promo)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {filteredPromotions.length > 0 && (
            <div className="px-4 py-3 border-t border-border flex items-center justify-between">
              <p className="text-sm text-text-secondary">
                Showing {startIndex + 1}-{Math.min(endIndex, filteredPromotions.length)} of {filteredPromotions.length} promotions
              </p>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                >
                  Previous
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={cn(
                        'w-8 h-8 text-sm rounded-md transition-colors',
                        currentPage === page
                          ? 'bg-primary text-white'
                          : 'hover:bg-surface-tertiary text-text-secondary'
                      )}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Promotion Details Drawer - Structured View */}
      <AnimatePresence>
        {selectedPromotion && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/30 z-40 backdrop-blur-sm"
              onClick={() => setSelectedPromotion(null)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
              className="fixed right-0 top-0 h-full w-[520px] bg-surface border-l border-border z-50 shadow-2xl overflow-y-auto"
            >
              {/* A. Header / Identity */}
              <div className="p-5 border-b border-border sticky top-0 bg-surface z-10">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge
                        variant={
                          selectedPromotion.status === 'Running' ? 'success' :
                          selectedPromotion.status === 'Upcoming' ? 'info' : 'default'
                        }
                        className="text-[10px]"
                      >
                        {selectedPromotion.status}
                      </Badge>
                      <span className="text-xs font-mono text-text-muted">{selectedPromotion.id}</span>
                    </div>
                    <h3 className="font-semibold text-text-primary text-lg leading-tight">{selectedPromotion.name}</h3>
                    <div className="flex items-center gap-3 mt-2 text-sm">
                      <span className="text-text-secondary">{getOfferTypeLabel(selectedPromotion.type)}</span>
                      <span className="text-text-muted">•</span>
                      <span className="text-text-secondary">
                        {selectedPromotion.channel === 'All' ? 'Omni' : selectedPromotion.channel}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedPromotion(null)}
                    className="p-2 hover:bg-surface-tertiary rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-5 space-y-5">
                {/* B. Offer Mechanics */}
                <section>
                  <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">Offer Mechanics</h4>
                  <Card className="p-4 bg-surface-secondary/30">
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium text-text-primary mb-1">How it works</p>
                        <p className="text-sm text-text-secondary">
                          {selectedPromotion.type === 'Free Shipping' 
                            ? `Free shipping on orders over $${selectedPromotion.discountValue || 50}`
                            : selectedPromotion.type === 'BOGO'
                            ? 'Buy 2, Get 1 at 50% off on qualifying items'
                            : selectedPromotion.type === 'Gift with Purchase'
                            ? 'Receive a complimentary gift with qualifying purchase'
                            : selectedPromotion.type === 'Bundle'
                            ? 'Bundle discount applied automatically at checkout'
                            : selectedPromotion.type === 'Member Exclusive'
                            ? 'Exclusive discount for verified members only'
                            : `${selectedPromotion.discountValue}${selectedPromotion.discountUnit} off ${selectedPromotion.scopeType === 'Sitewide' ? 'all products' : 'qualifying items'}`
                          }
                        </p>
                      </div>
                      <div className="pt-2 border-t border-border/50">
                        <p className="text-xs text-text-muted mb-1.5">Conditions</p>
                        <ul className="text-xs text-text-secondary space-y-1">
                          <li className="flex items-start gap-2">
                            <Check className="w-3 h-3 text-success mt-0.5 flex-shrink-0" />
                            <span>Valid {selectedPromotion.startDate.toLocaleDateString()} – {selectedPromotion.endDate.toLocaleDateString()}</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <Check className="w-3 h-3 text-success mt-0.5 flex-shrink-0" />
                            <span>{selectedPromotion.channel === 'All' ? 'Available on all channels' : `${selectedPromotion.channel} channel only`}</span>
                          </li>
                          {selectedPromotion.type !== 'Sitewide' && (
                            <li className="flex items-start gap-2">
                              <Info className="w-3 h-3 text-info mt-0.5 flex-shrink-0" />
                              <span>Excludes gift cards and clearance items</span>
                            </li>
                          )}
                        </ul>
                      </div>
                      <div className="pt-2 border-t border-border/50">
                        <p className="text-xs text-text-muted mb-1">Stackability</p>
                        <p className="text-xs text-text-secondary">
                          {selectedPromotion.type === 'Member Exclusive' 
                            ? 'Can be combined with loyalty points redemption'
                            : 'Not stackable with other promotional offers'
                          }
                        </p>
                      </div>
                    </div>
                  </Card>
                </section>

                {/* C. Product Scope — Deep Dive */}
                <section>
                  <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">Product Scope</h4>
                  <Card className="p-4 bg-surface-secondary/30">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-text-muted">Scope Type</span>
                        <Badge variant="default" className="text-[10px]">{selectedPromotion.scopeType}</Badge>
                      </div>
                      
                      <div className="pt-2 border-t border-border/50">
                        <p className="text-xs text-text-muted mb-2">Included</p>
                        <div className="flex flex-wrap gap-1.5">
                          <span className="px-2 py-1 bg-success/10 text-success text-xs rounded">{selectedPromotion.productType}</span>
                          {selectedPromotion.treatmentType && (
                            <span className="px-2 py-1 bg-success/10 text-success text-xs rounded">{selectedPromotion.treatmentType}</span>
                          )}
                          {selectedPromotion.brand && (
                            <span className="px-2 py-1 bg-success/10 text-success text-xs rounded">{selectedPromotion.brand}</span>
                          )}
                        </div>
                      </div>

                      <div className="pt-2 border-t border-border/50">
                        <p className="text-xs text-text-muted mb-2">Excluded</p>
                        <div className="flex flex-wrap gap-1.5">
                          <span className="px-2 py-1 bg-danger/10 text-danger text-xs rounded">Professional-only SKUs</span>
                          <span className="px-2 py-1 bg-danger/10 text-danger text-xs rounded">Clearance items</span>
                        </div>
                      </div>

                      {selectedPromotion.channel === 'All' && (
                        <div className="pt-2 border-t border-border/50">
                          <p className="text-xs text-text-muted mb-1">Channel-specific scope</p>
                          <p className="text-xs text-text-secondary">Store scope limited to Tier-1 locations</p>
                        </div>
                      )}
                    </div>
                  </Card>
                </section>

                {/* D. Performance Interpretation (NO Raw KPIs) */}
                {selectedPromotion.status !== 'Upcoming' && (
                  <section>
                    <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">Performance Interpretation</h4>
                    <Card className="p-4 bg-gradient-to-br from-primary/5 to-transparent border-primary/20">
                      <div className="space-y-3">
                        <div className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-success mt-1.5 flex-shrink-0" />
                          <p className="text-sm text-text-primary">
                            {selectedPromotion.ctr >= 5 
                              ? `Above-average engagement for ${getOfferTypeLabel(selectedPromotion.type)} promos in ${selectedPromotion.channel === 'All' ? 'Omni' : selectedPromotion.channel} channel`
                              : selectedPromotion.ctr >= 3
                              ? `Moderate engagement, typical for ${selectedPromotion.productType} category`
                              : `Below-benchmark engagement — consider creative refresh`
                            }
                          </p>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-warning mt-1.5 flex-shrink-0" />
                          <p className="text-sm text-text-primary">
                            {selectedPromotion.conversionRate >= 4.5
                              ? 'Strong conversion indicates high purchase intent'
                              : selectedPromotion.conversionRate >= 3
                              ? 'Conversion slightly below benchmark — consider threshold adjustment'
                              : 'High reach but moderate conversion indicates browsing behavior'
                            }
                          </p>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-info mt-1.5 flex-shrink-0" />
                          <p className="text-sm text-text-primary">
                            {selectedPromotion.campaignImpact >= 30
                              ? 'Significant lift vs baseline — strong performer'
                              : selectedPromotion.campaignImpact >= 15
                              ? 'Moderate lift — performing within expected range'
                              : 'Minimal incremental impact — evaluate offer attractiveness'
                            }
                          </p>
                        </div>
                      </div>
                    </Card>
                  </section>
                )}

                {/* E. Campaign Usage Context */}
                <section>
                  <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">Campaign Usage</h4>
                  <Card className="p-4 bg-surface-secondary/30">
                    {selectedPromotion.campaignUsage > 0 ? (
                      <div className="space-y-2">
                        {/* Mock campaign usage data based on promo */}
                        <div className="flex items-center justify-between py-2 border-b border-border/30">
                          <div>
                            <p className="text-sm font-medium text-text-primary">Spring Color Refresh</p>
                            <p className="text-xs text-text-muted">Online • 2 creatives</p>
                          </div>
                          <Badge variant="success" className="text-[10px]">Live</Badge>
                        </div>
                        {selectedPromotion.campaignUsage > 1 && (
                          <div className="flex items-center justify-between py-2 border-b border-border/30">
                            <div>
                              <p className="text-sm font-medium text-text-primary">Holiday Gift Guide</p>
                              <p className="text-xs text-text-muted">Omni • 1 creative</p>
                            </div>
                            <Badge variant="default" className="text-[10px]">Completed</Badge>
                          </div>
                        )}
                        {selectedPromotion.campaignUsage > 2 && (
                          <div className="flex items-center justify-between py-2">
                            <div>
                              <p className="text-sm font-medium text-text-primary">Winter Essentials</p>
                              <p className="text-xs text-text-muted">Email • 3 creatives</p>
                            </div>
                            <Badge variant="info" className="text-[10px]">Scheduled</Badge>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-sm text-text-muted">Not yet used in any campaign</p>
                        <p className="text-xs text-text-secondary mt-1">Available for mapping</p>
                      </div>
                    )}
                  </Card>
                </section>

                {/* F. Volume Context (Supportive Only) */}
                {selectedPromotion.status !== 'Upcoming' && selectedPromotion.unitsSold > 0 && (
                  <section>
                    <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">Volume Context</h4>
                    <Card className="p-4 bg-surface-secondary/30">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-text-muted">Units Sold</span>
                        <span className="text-sm text-text-secondary">{formatNumber(selectedPromotion.unitsSold)}</span>
                      </div>
                      <p className="text-xs text-text-muted italic">
                        {selectedPromotion.unitsSold >= 5000
                          ? 'High volume indicates strong demand and offer resonance.'
                          : selectedPromotion.unitsSold >= 2000
                          ? 'Moderate unit volume relative to reach suggests consideration-stage behavior.'
                          : 'Lower volume — may indicate niche appeal or awareness gap.'
                        }
                      </p>
                    </Card>
                  </section>
                )}

                {/* G. Risk & Constraints */}
                <section>
                  <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">Risk & Constraints</h4>
                  <Card className="p-4 bg-surface-secondary/30">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-text-muted">Margin Risk</span>
                        <span className={cn(
                          'px-2 py-0.5 rounded-full text-xs font-medium',
                          (selectedPromotion.status === 'Upcoming' ? selectedPromotion.forecastedMarginSensitivity : selectedPromotion.marginSensitivity) >= 35 
                            ? 'bg-success/10 text-success' 
                            : (selectedPromotion.status === 'Upcoming' ? selectedPromotion.forecastedMarginSensitivity : selectedPromotion.marginSensitivity) >= 25 
                            ? 'bg-warning/10 text-warning' 
                            : 'bg-danger/10 text-danger'
                        )}>
                          {(selectedPromotion.status === 'Upcoming' ? selectedPromotion.forecastedMarginSensitivity : selectedPromotion.marginSensitivity) >= 35 
                            ? 'Low' 
                            : (selectedPromotion.status === 'Upcoming' ? selectedPromotion.forecastedMarginSensitivity : selectedPromotion.marginSensitivity) >= 25 
                            ? 'Medium' 
                            : 'High'
                          }
                        </span>
                      </div>
                      <div className="pt-2 border-t border-border/50">
                        <p className="text-xs text-text-muted mb-1">Constraints</p>
                        <ul className="text-xs text-text-secondary space-y-1">
                          {selectedPromotion.discountValue >= 40 && (
                            <li className="flex items-center gap-2">
                              <AlertTriangle className="w-3 h-3 text-warning" />
                              <span>Deep discount may impact margin on low-stock items</span>
                            </li>
                          )}
                          {selectedPromotion.channel === 'All' && (
                            <li className="flex items-center gap-2">
                              <Info className="w-3 h-3 text-info" />
                              <span>Store execution requires POS sync verification</span>
                            </li>
                          )}
                          <li className="flex items-center gap-2">
                            <Check className="w-3 h-3 text-success" />
                            <span>No inventory constraints identified</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </Card>
                </section>

                {/* H. Agent Insights & Recommendations */}
                <section>
                  <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-agent" />
                    Agent Recommendations
                  </h4>
                  <Card className="p-4 bg-gradient-to-br from-agent/5 to-transparent border-agent/20">
                    <div className="space-y-3">
                      <div className="flex items-start gap-3 p-2 rounded-lg hover:bg-agent/5 transition-colors">
                        <div className="w-6 h-6 rounded-full bg-agent/10 flex items-center justify-center flex-shrink-0">
                          <RotateCcw className="w-3 h-3 text-agent" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-text-primary">Reuse Recommendation</p>
                          <p className="text-xs text-text-secondary mt-0.5">
                            {selectedPromotion.campaignImpact >= 20 || selectedPromotion.expectedCampaignImpact >= 20
                              ? `Recommend reuse for Spring Sale (similar scope & offer type)`
                              : `Consider scope expansion before reuse to improve reach`
                            }
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-2 rounded-lg hover:bg-agent/5 transition-colors">
                        <div className="w-6 h-6 rounded-full bg-agent/10 flex items-center justify-center flex-shrink-0">
                          <ExternalLink className="w-3 h-3 text-agent" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-text-primary">Channel Optimization</p>
                          <p className="text-xs text-text-secondary mt-0.5">
                            {selectedPromotion.channel === 'Email'
                              ? 'Pair with Push channel to improve reach by ~25%'
                              : selectedPromotion.channel === 'All'
                              ? 'Omni execution performing well — maintain current distribution'
                              : 'Avoid Store-only execution due to low in-store conversion history'
                            }
                          </p>
                        </div>
                      </div>
                      {selectedPromotion.campaignCoverage < 70 && (
                        <div className="flex items-start gap-3 p-2 rounded-lg hover:bg-agent/5 transition-colors">
                          <div className="w-6 h-6 rounded-full bg-warning/10 flex items-center justify-center flex-shrink-0">
                            <AlertTriangle className="w-3 h-3 text-warning" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-text-primary">Coverage Alert</p>
                            <p className="text-xs text-text-secondary mt-0.5">
                              Low campaign coverage — consider mapping to upcoming campaigns
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </Card>
                </section>

                {/* Actions */}
                <div className="flex gap-3 pt-2 pb-4">
                  <Button variant="outline" className="flex-1 gap-2">
                    <Eye className="w-4 h-4" />
                    View Campaigns
                  </Button>
                  <Button variant="primary" className="flex-1 gap-2">
                    <ExternalLink className="w-4 h-4" />
                    Open in PromoSmart
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
