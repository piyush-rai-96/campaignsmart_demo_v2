import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Tag, Filter, AlertTriangle, X, ExternalLink, 
  ChevronDown, ChevronUp, Download, RefreshCw, CheckCircle, 
  Clock, Eye, Info, RotateCcw, Calendar, Check
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
  scopeType: 'Sitewide' | 'Category' | 'SKU'
  scopeSummary: string
  startDate: Date
  endDate: Date
  status: 'Running' | 'Upcoming' | 'Past'
  sales: number
  forecastedSales: number
  units: number
  forecastedUnits: number
  gmDollars: number
  forecastedGmDollars: number
  gmPercent: number
  forecastedGmPercent: number
  liftPercent: number
  expectedLiftPercent: number
  campaignUsage: number
  channel: string
  category: string
  season: string
}

const mockPromotions: Promotion[] = [
  {
    id: 'PROMO-001',
    name: '20% Off First Order',
    type: 'Percentage Discount',
    discountValue: 20,
    discountUnit: '%',
    scopeType: 'Sitewide',
    scopeSummary: 'All products',
    startDate: new Date('2024-12-01'),
    endDate: new Date('2024-12-31'),
    status: 'Running',
    sales: 125000,
    forecastedSales: 150000,
    units: 2500,
    forecastedUnits: 3000,
    gmDollars: 45000,
    forecastedGmDollars: 52000,
    gmPercent: 36,
    forecastedGmPercent: 35,
    liftPercent: 18,
    expectedLiftPercent: 20,
    campaignUsage: 5,
    channel: 'Email',
    category: 'Electronics',
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
    sales: 85000,
    forecastedSales: 90000,
    units: 1800,
    forecastedUnits: 2000,
    gmDollars: 28000,
    forecastedGmDollars: 30000,
    gmPercent: 33,
    forecastedGmPercent: 33,
    liftPercent: 12,
    expectedLiftPercent: 15,
    campaignUsage: 3,
    channel: 'All',
    category: 'All',
    season: 'Holiday',
  },
  {
    id: 'PROMO-003',
    name: 'Holiday Special 30%',
    type: 'Percentage Discount',
    discountValue: 30,
    discountUnit: '%',
    scopeType: 'Category',
    scopeSummary: 'Winter Apparel',
    startDate: new Date('2024-12-20'),
    endDate: new Date('2024-12-26'),
    status: 'Upcoming',
    sales: 0,
    forecastedSales: 200000,
    units: 0,
    forecastedUnits: 4500,
    gmDollars: 0,
    forecastedGmDollars: 65000,
    gmPercent: 0,
    forecastedGmPercent: 32,
    liftPercent: 0,
    expectedLiftPercent: 25,
    campaignUsage: 2,
    channel: 'All',
    category: 'Apparel',
    season: 'Holiday',
  },
  {
    id: 'PROMO-004',
    name: 'Buy 2 Get 1 Free',
    type: 'BOGO',
    discountValue: 33,
    discountUnit: '%',
    scopeType: 'SKU',
    scopeSummary: '45 SKUs selected',
    startDate: new Date('2024-12-01'),
    endDate: new Date('2024-12-31'),
    status: 'Running',
    sales: 95000,
    forecastedSales: 110000,
    units: 3200,
    forecastedUnits: 3800,
    gmDollars: 32000,
    forecastedGmDollars: 38000,
    gmPercent: 34,
    forecastedGmPercent: 35,
    liftPercent: 22,
    expectedLiftPercent: 20,
    campaignUsage: 4,
    channel: 'Email',
    category: 'Home & Garden',
    season: 'Holiday',
  },
  {
    id: 'PROMO-005',
    name: 'New Year Flash Sale',
    type: 'Percentage Discount',
    discountValue: 40,
    discountUnit: '%',
    scopeType: 'Category',
    scopeSummary: 'Clearance Items',
    startDate: new Date('2024-12-31'),
    endDate: new Date('2025-01-02'),
    status: 'Upcoming',
    sales: 0,
    forecastedSales: 180000,
    units: 0,
    forecastedUnits: 5000,
    gmDollars: 0,
    forecastedGmDollars: 55000,
    gmPercent: 0,
    forecastedGmPercent: 30,
    liftPercent: 0,
    expectedLiftPercent: 35,
    campaignUsage: 0,
    channel: 'Push',
    category: 'All',
    season: 'New Year',
  },
  {
    id: 'PROMO-006',
    name: 'Black Friday Blowout',
    type: 'Percentage Discount',
    discountValue: 50,
    discountUnit: '%',
    scopeType: 'Sitewide',
    scopeSummary: 'All products',
    startDate: new Date('2024-11-29'),
    endDate: new Date('2024-12-02'),
    status: 'Past',
    sales: 450000,
    forecastedSales: 400000,
    units: 12000,
    forecastedUnits: 10000,
    gmDollars: 135000,
    forecastedGmDollars: 120000,
    gmPercent: 30,
    forecastedGmPercent: 30,
    liftPercent: 45,
    expectedLiftPercent: 40,
    campaignUsage: 8,
    channel: 'All',
    category: 'All',
    season: 'Black Friday',
  },
  {
    id: 'PROMO-007',
    name: 'Cyber Monday Deal',
    type: 'Percentage Discount',
    discountValue: 35,
    discountUnit: '%',
    scopeType: 'Category',
    scopeSummary: 'Electronics & Tech',
    startDate: new Date('2024-12-02'),
    endDate: new Date('2024-12-03'),
    status: 'Past',
    sales: 320000,
    forecastedSales: 280000,
    units: 8500,
    forecastedUnits: 7000,
    gmDollars: 96000,
    forecastedGmDollars: 84000,
    gmPercent: 30,
    forecastedGmPercent: 30,
    liftPercent: 38,
    expectedLiftPercent: 32,
    campaignUsage: 6,
    channel: 'Email',
    category: 'Electronics',
    season: 'Black Friday',
  },
  {
    id: 'PROMO-008',
    name: 'Winter Warmup Sale',
    type: 'Fixed Discount',
    discountValue: 25,
    discountUnit: '$',
    scopeType: 'Category',
    scopeSummary: 'Outerwear & Jackets',
    startDate: new Date('2024-12-05'),
    endDate: new Date('2024-12-20'),
    status: 'Running',
    sales: 78000,
    forecastedSales: 95000,
    units: 1560,
    forecastedUnits: 1900,
    gmDollars: 23400,
    forecastedGmDollars: 28500,
    gmPercent: 30,
    forecastedGmPercent: 30,
    liftPercent: 15,
    expectedLiftPercent: 18,
    campaignUsage: 2,
    channel: 'Email',
    category: 'Apparel',
    season: 'Holiday',
  },
  {
    id: 'PROMO-009',
    name: 'Member Exclusive 15%',
    type: 'Percentage Discount',
    discountValue: 15,
    discountUnit: '%',
    scopeType: 'Sitewide',
    scopeSummary: 'Loyalty members only',
    startDate: new Date('2024-12-01'),
    endDate: new Date('2024-12-31'),
    status: 'Running',
    sales: 210000,
    forecastedSales: 250000,
    units: 4200,
    forecastedUnits: 5000,
    gmDollars: 73500,
    forecastedGmDollars: 87500,
    gmPercent: 35,
    forecastedGmPercent: 35,
    liftPercent: 12,
    expectedLiftPercent: 14,
    campaignUsage: 3,
    channel: 'In-App',
    category: 'All',
    season: 'Holiday',
  },
  {
    id: 'PROMO-010',
    name: 'Gift Card Bonus',
    type: 'BOGO',
    discountValue: 10,
    discountUnit: '%',
    scopeType: 'SKU',
    scopeSummary: 'Gift Cards $50+',
    startDate: new Date('2024-12-15'),
    endDate: new Date('2024-12-24'),
    status: 'Running',
    sales: 45000,
    forecastedSales: 65000,
    units: 900,
    forecastedUnits: 1300,
    gmDollars: 4500,
    forecastedGmDollars: 6500,
    gmPercent: 10,
    forecastedGmPercent: 10,
    liftPercent: 25,
    expectedLiftPercent: 30,
    campaignUsage: 1,
    channel: 'All',
    category: 'All',
    season: 'Holiday',
  },
  {
    id: 'PROMO-011',
    name: 'Early Bird Spring',
    type: 'Percentage Discount',
    discountValue: 20,
    discountUnit: '%',
    scopeType: 'Category',
    scopeSummary: 'Spring Collection',
    startDate: new Date('2025-01-15'),
    endDate: new Date('2025-02-15'),
    status: 'Upcoming',
    sales: 0,
    forecastedSales: 150000,
    units: 0,
    forecastedUnits: 3000,
    gmDollars: 0,
    forecastedGmDollars: 52500,
    gmPercent: 0,
    forecastedGmPercent: 35,
    liftPercent: 0,
    expectedLiftPercent: 22,
    campaignUsage: 0,
    channel: 'Email',
    category: 'Apparel',
    season: 'Spring',
  },
  {
    id: 'PROMO-012',
    name: 'Valentine Special',
    type: 'Percentage Discount',
    discountValue: 25,
    discountUnit: '%',
    scopeType: 'Category',
    scopeSummary: 'Jewelry & Gifts',
    startDate: new Date('2025-02-01'),
    endDate: new Date('2025-02-14'),
    status: 'Upcoming',
    sales: 0,
    forecastedSales: 120000,
    units: 0,
    forecastedUnits: 2400,
    gmDollars: 0,
    forecastedGmDollars: 48000,
    gmPercent: 0,
    forecastedGmPercent: 40,
    liftPercent: 0,
    expectedLiftPercent: 28,
    campaignUsage: 0,
    channel: 'All',
    category: 'Home & Garden',
    season: 'Spring',
  },
  {
    id: 'PROMO-013',
    name: 'Thanksgiving Weekend',
    type: 'Percentage Discount',
    discountValue: 30,
    discountUnit: '%',
    scopeType: 'Sitewide',
    scopeSummary: 'All products',
    startDate: new Date('2024-11-28'),
    endDate: new Date('2024-11-30'),
    status: 'Past',
    sales: 280000,
    forecastedSales: 250000,
    units: 7000,
    forecastedUnits: 6250,
    gmDollars: 84000,
    forecastedGmDollars: 75000,
    gmPercent: 30,
    forecastedGmPercent: 30,
    liftPercent: 32,
    expectedLiftPercent: 28,
    campaignUsage: 5,
    channel: 'All',
    category: 'All',
    season: 'Black Friday',
  },
  {
    id: 'PROMO-014',
    name: 'Flash Sale Friday',
    type: 'Percentage Discount',
    discountValue: 45,
    discountUnit: '%',
    scopeType: 'SKU',
    scopeSummary: '120 selected items',
    startDate: new Date('2024-12-13'),
    endDate: new Date('2024-12-13'),
    status: 'Past',
    sales: 65000,
    forecastedSales: 55000,
    units: 2600,
    forecastedUnits: 2200,
    gmDollars: 16250,
    forecastedGmDollars: 13750,
    gmPercent: 25,
    forecastedGmPercent: 25,
    liftPercent: 55,
    expectedLiftPercent: 45,
    campaignUsage: 2,
    channel: 'Push',
    category: 'Electronics',
    season: 'Holiday',
  },
  {
    id: 'PROMO-015',
    name: 'Outdoor Adventure Sale',
    type: 'Percentage Discount',
    discountValue: 20,
    discountUnit: '%',
    scopeType: 'Category',
    scopeSummary: 'Camping & Hiking',
    startDate: new Date('2024-12-10'),
    endDate: new Date('2024-12-25'),
    status: 'Running',
    sales: 42000,
    forecastedSales: 60000,
    units: 840,
    forecastedUnits: 1200,
    gmDollars: 14700,
    forecastedGmDollars: 21000,
    gmPercent: 35,
    forecastedGmPercent: 35,
    liftPercent: 16,
    expectedLiftPercent: 20,
    campaignUsage: 1,
    channel: 'Email',
    category: 'Outdoor Gear',
    season: 'Holiday',
  },
  {
    id: 'PROMO-016',
    name: 'Presidents Day Sale',
    type: 'Percentage Discount',
    discountValue: 25,
    discountUnit: '%',
    scopeType: 'Sitewide',
    scopeSummary: 'All products',
    startDate: new Date('2025-02-15'),
    endDate: new Date('2025-02-17'),
    status: 'Upcoming',
    sales: 0,
    forecastedSales: 175000,
    units: 0,
    forecastedUnits: 3500,
    gmDollars: 0,
    forecastedGmDollars: 61250,
    gmPercent: 0,
    forecastedGmPercent: 35,
    liftPercent: 0,
    expectedLiftPercent: 28,
    campaignUsage: 0,
    channel: 'All',
    category: 'All',
    season: 'Spring',
  },
  {
    id: 'PROMO-017',
    name: 'Spring Clearance',
    type: 'Percentage Discount',
    discountValue: 40,
    discountUnit: '%',
    scopeType: 'Category',
    scopeSummary: 'Winter Items',
    startDate: new Date('2025-03-01'),
    endDate: new Date('2025-03-15'),
    status: 'Upcoming',
    sales: 0,
    forecastedSales: 220000,
    units: 0,
    forecastedUnits: 5500,
    gmDollars: 0,
    forecastedGmDollars: 66000,
    gmPercent: 0,
    forecastedGmPercent: 30,
    liftPercent: 0,
    expectedLiftPercent: 35,
    campaignUsage: 0,
    channel: 'Email',
    category: 'Apparel',
    season: 'Spring',
  },
  {
    id: 'PROMO-018',
    name: 'Easter Weekend Special',
    type: 'BOGO',
    discountValue: 50,
    discountUnit: '%',
    scopeType: 'Category',
    scopeSummary: 'Home Decor',
    startDate: new Date('2025-04-18'),
    endDate: new Date('2025-04-21'),
    status: 'Upcoming',
    sales: 0,
    forecastedSales: 95000,
    units: 0,
    forecastedUnits: 1900,
    gmDollars: 0,
    forecastedGmDollars: 33250,
    gmPercent: 0,
    forecastedGmPercent: 35,
    liftPercent: 0,
    expectedLiftPercent: 30,
    campaignUsage: 0,
    channel: 'All',
    category: 'Home & Garden',
    season: 'Spring',
  },
  {
    id: 'PROMO-019',
    name: 'Mother\'s Day Gift Sale',
    type: 'Percentage Discount',
    discountValue: 20,
    discountUnit: '%',
    scopeType: 'Category',
    scopeSummary: 'Jewelry & Beauty',
    startDate: new Date('2025-05-01'),
    endDate: new Date('2025-05-11'),
    status: 'Upcoming',
    sales: 0,
    forecastedSales: 160000,
    units: 0,
    forecastedUnits: 3200,
    gmDollars: 0,
    forecastedGmDollars: 64000,
    gmPercent: 0,
    forecastedGmPercent: 40,
    liftPercent: 0,
    expectedLiftPercent: 25,
    campaignUsage: 0,
    channel: 'Email',
    category: 'All',
    season: 'Spring',
  },
  {
    id: 'PROMO-020',
    name: 'Memorial Day Blowout',
    type: 'Percentage Discount',
    discountValue: 35,
    discountUnit: '%',
    scopeType: 'Sitewide',
    scopeSummary: 'All products',
    startDate: new Date('2025-05-23'),
    endDate: new Date('2025-05-26'),
    status: 'Upcoming',
    sales: 0,
    forecastedSales: 280000,
    units: 0,
    forecastedUnits: 7000,
    gmDollars: 0,
    forecastedGmDollars: 84000,
    gmPercent: 0,
    forecastedGmPercent: 30,
    liftPercent: 0,
    expectedLiftPercent: 38,
    campaignUsage: 0,
    channel: 'All',
    category: 'All',
    season: 'Summer',
  },
  {
    id: 'PROMO-021',
    name: 'Summer Kickoff',
    type: 'Free Shipping',
    discountValue: 0,
    discountUnit: '$',
    scopeType: 'Sitewide',
    scopeSummary: 'All orders',
    startDate: new Date('2025-06-01'),
    endDate: new Date('2025-06-07'),
    status: 'Upcoming',
    sales: 0,
    forecastedSales: 140000,
    units: 0,
    forecastedUnits: 2800,
    gmDollars: 0,
    forecastedGmDollars: 49000,
    gmPercent: 0,
    forecastedGmPercent: 35,
    liftPercent: 0,
    expectedLiftPercent: 18,
    campaignUsage: 0,
    channel: 'Push',
    category: 'All',
    season: 'Summer',
  },
  {
    id: 'PROMO-022',
    name: 'Back to School Prep',
    type: 'Percentage Discount',
    discountValue: 25,
    discountUnit: '%',
    scopeType: 'Category',
    scopeSummary: 'School Supplies & Electronics',
    startDate: new Date('2025-07-15'),
    endDate: new Date('2025-08-15'),
    status: 'Upcoming',
    sales: 0,
    forecastedSales: 320000,
    units: 0,
    forecastedUnits: 8000,
    gmDollars: 0,
    forecastedGmDollars: 96000,
    gmPercent: 0,
    forecastedGmPercent: 30,
    liftPercent: 0,
    expectedLiftPercent: 32,
    campaignUsage: 0,
    channel: 'Email',
    category: 'Electronics',
    season: 'Summer',
  },
]

const initialAlerts = [
  { id: 1, campaign: 'Winter Clearance', issue: 'No promotion available for Category: Outdoor Gear', severity: 'error' },
  { id: 2, campaign: 'Holiday Gift Guide', issue: 'Promotion expires before campaign end (Dec 26 vs Dec 31)', severity: 'warning' },
]

const categories = ['All Categories', 'Electronics', 'Apparel', 'Home & Garden', 'Outdoor Gear']
const seasons = ['All Seasons', 'Holiday', 'Black Friday', 'New Year', 'Spring', 'Summer']
const channels = ['All Channels', 'Email', 'Push', 'SMS', 'In-App']
const promoTypes = ['All Types', 'Percentage Discount', 'Fixed Discount', 'Free Shipping', 'BOGO']

type TabType = 'running-past' | 'upcoming'

export function PromoLibrary() {
  const [showFilters, setShowFilters] = useState(false)
  const [alertsExpanded, setAlertsExpanded] = useState(true)
  const [alerts, setAlerts] = useState(initialAlerts)

  const dismissAlert = (alertId: number) => {
    setAlerts(prev => prev.filter(a => a.id !== alertId))
  }
  const [activeTab, setActiveTab] = useState<TabType>('running-past')
  const [selectedPromotion, setSelectedPromotion] = useState<Promotion | null>(null)
  
  // Filter states
  const [categoryFilter, setCategoryFilter] = useState('All Categories')
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

  const hasActiveFilters = categoryFilter !== 'All Categories' || 
    seasonFilter !== 'All Seasons' || 
    channelFilter !== 'All Channels' ||
    typeFilter !== 'All Types' ||
    scopeFilter !== 'All Scopes' ||
    campaignUsedFilter !== 'all'

  const resetFilters = () => {
    setCategoryFilter('All Categories')
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
    const matchesCategory = categoryFilter === 'All Categories' || promo.category === categoryFilter
    const matchesSeason = seasonFilter === 'All Seasons' || promo.season === seasonFilter
    const matchesChannel = channelFilter === 'All Channels' || promo.channel === channelFilter
    const matchesType = typeFilter === 'All Types' || promo.type === typeFilter
    const matchesScope = scopeFilter === 'All Scopes' || promo.scopeType === scopeFilter
    const matchesCampaignUsed = campaignUsedFilter === 'all' || 
      (campaignUsedFilter === 'yes' && promo.campaignUsage > 0) ||
      (campaignUsedFilter === 'no' && promo.campaignUsage === 0)
    
    return matchesTab && matchesCategory && matchesSeason && matchesChannel && matchesType && matchesScope && matchesCampaignUsed
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

  // KPI calculations
  const totalPromotions = mockPromotions.length
  const runningPromotions = mockPromotions.filter(p => p.status === 'Running').length
  const upcomingPromotions = mockPromotions.filter(p => p.status === 'Upcoming').length
  const usedInCampaigns = mockPromotions.filter(p => p.campaignUsage > 0).length
  const unusedPromotions = mockPromotions.filter(p => p.campaignUsage === 0).length

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value)
  }

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-US').format(value)
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
                {[categoryFilter !== 'All Categories', seasonFilter !== 'All Seasons', channelFilter !== 'All Channels', typeFilter !== 'All Types', scopeFilter !== 'All Scopes', campaignUsedFilter !== 'all'].filter(Boolean).length}
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

                  {/* Category Dropdown */}
                  <div className="relative">
                    <label className="block text-xs text-text-muted mb-1.5">Category</label>
                    <button onClick={() => setOpenDropdown(openDropdown === 'category' ? null : 'category')}
                      className="w-full px-3 py-2.5 bg-surface border border-border rounded-lg text-sm text-left flex items-center justify-between hover:border-primary/50 transition-colors">
                      <span className="text-text-primary">{categoryFilter}</span>
                      <ChevronDown className={cn('w-4 h-4 text-text-muted transition-transform', openDropdown === 'category' && 'rotate-180')} />
                    </button>
                    <AnimatePresence>
                      {openDropdown === 'category' && (
                        <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                          className="absolute top-full left-0 right-0 mt-1 bg-surface border border-border rounded-lg shadow-lg z-[9999] overflow-hidden">
                          {categories.map((option) => (
                            <button key={option} onClick={() => { setCategoryFilter(option); setOpenDropdown(null) }}
                              className={cn('w-full px-4 py-2.5 text-left text-sm hover:bg-surface-secondary transition-colors flex items-center justify-between',
                                categoryFilter === option && 'bg-primary/5 text-primary font-medium')}>
                              {option}
                              {categoryFilter === option && <Check className="w-4 h-4" />}
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

        {/* Alerts Section */}
        {alerts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <div className="bg-surface rounded-xl border border-border overflow-hidden">
              <button
                onClick={() => setAlertsExpanded(!alertsExpanded)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-surface-secondary transition-colors"
              >
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-warning" />
                  <span className="font-medium text-text-primary">{alerts.length} Alerts Require Attention</span>
                </div>
                {alertsExpanded ? (
                  <ChevronUp className="w-5 h-5 text-text-muted" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-text-muted" />
                )}
              </button>
              <AnimatePresence>
                {alertsExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-border"
                  >
                    <div className="p-4 space-y-3">
                      {alerts.map((alert) => (
                        <div
                          key={alert.id}
                          className={cn(
                            'flex items-center justify-between p-4 rounded-lg',
                            alert.severity === 'error' ? 'bg-danger/5 border border-danger/20' : 'bg-warning/5 border border-warning/20'
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <AlertTriangle className={cn(
                              'w-4 h-4',
                              alert.severity === 'error' ? 'text-danger' : 'text-warning'
                            )} />
                            <div>
                              <span className="font-medium text-text-primary">{alert.campaign}:</span>
                              <span className="text-text-secondary ml-2">{alert.issue}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm">
                              <ExternalLink className="w-3 h-3 mr-2" />
                              Create in PromoSmart
                            </Button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                dismissAlert(alert.id)
                              }}
                              className={cn(
                                'p-1.5 rounded-md transition-colors',
                                alert.severity === 'error' 
                                  ? 'hover:bg-danger/10 text-danger/60 hover:text-danger' 
                                  : 'hover:bg-warning/10 text-warning/60 hover:text-warning'
                              )}
                              title="Dismiss alert"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}

        {/* KPI Summary Cards */}
        <div className="grid grid-cols-5 gap-4 mb-6">
          {[
            { label: 'Total Promotions', value: totalPromotions, icon: Tag },
            { label: 'Running Promotions', value: runningPromotions, icon: CheckCircle, color: 'text-success' },
            { label: 'Upcoming Promotions', value: upcomingPromotions, icon: Clock, color: 'text-info' },
            { label: 'Used in Campaigns', value: usedInCampaigns, icon: Tag },
            { label: 'Unused Promotions', value: unusedPromotions, icon: AlertTriangle, color: 'text-warning' },
          ].map((kpi, index) => (
            <motion.div
              key={kpi.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-text-secondary">{kpi.label}</span>
                  <kpi.icon className={cn('w-4 h-4', kpi.color || 'text-text-muted')} />
                </div>
                <p className="text-2xl font-semibold text-text-primary">{kpi.value}</p>
              </Card>
            </motion.div>
          ))}
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

        {/* Promotion Table */}
        <div className="bg-surface rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-surface-secondary border-b border-border sticky top-0">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Promotion ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Promotion Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Discount</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Scope</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Start Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">End Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-text-muted uppercase tracking-wider">
                    {activeTab === 'upcoming' ? 'Forecasted Sales' : 'Sales'}
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-text-muted uppercase tracking-wider">
                    {activeTab === 'upcoming' ? 'Forecasted Units' : 'Units'}
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-text-muted uppercase tracking-wider">
                    {activeTab === 'upcoming' ? 'Forecasted GM%' : 'GM%'}
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-text-muted uppercase tracking-wider">
                    {activeTab === 'upcoming' ? 'Expected Lift' : 'Lift%'}
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-text-muted uppercase tracking-wider">Campaigns</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-text-muted uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {paginatedPromotions.length === 0 ? (
                  <tr>
                    <td colSpan={14} className="px-4 py-12 text-center">
                      <div className="flex flex-col items-center">
                        <Tag className="w-12 h-12 text-text-muted mb-3" />
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
                  paginatedPromotions.map((promo) => (
                    <tr key={promo.id} className="hover:bg-surface-secondary transition-colors">
                      <td className="px-4 py-3 text-sm font-mono text-text-secondary">{promo.id}</td>
                      <td className="px-4 py-3">
                        <span className="text-sm font-medium text-text-primary">{promo.name}</span>
                      </td>
                      <td className="px-4 py-3 text-sm text-text-secondary">{promo.type}</td>
                      <td className="px-4 py-3">
                        <span className="text-sm font-semibold text-primary">
                          {promo.discountUnit === '%' ? `${promo.discountValue}%` : `$${promo.discountValue}`}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <Badge variant="default" className="mb-1">{promo.scopeType}</Badge>
                          <p className="text-xs text-text-muted">{promo.scopeSummary}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-text-secondary">
                        {promo.startDate.toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-sm text-text-secondary">
                        {promo.endDate.toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant={
                            promo.status === 'Running' ? 'success' :
                            promo.status === 'Upcoming' ? 'info' : 'default'
                          }
                        >
                          {promo.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-sm text-right font-medium text-text-primary">
                        {activeTab === 'upcoming' 
                          ? formatCurrency(promo.forecastedSales)
                          : formatCurrency(promo.sales)}
                      </td>
                      <td className="px-4 py-3 text-sm text-right text-text-secondary">
                        {activeTab === 'upcoming'
                          ? formatNumber(promo.forecastedUnits)
                          : formatNumber(promo.units)}
                      </td>
                      <td className="px-4 py-3 text-sm text-right text-text-secondary">
                        {activeTab === 'upcoming'
                          ? `${promo.forecastedGmPercent}%`
                          : `${promo.gmPercent}%`}
                      </td>
                      <td className="px-4 py-3 text-sm text-right">
                        <span className={cn(
                          'font-medium',
                          (activeTab === 'upcoming' ? promo.expectedLiftPercent : promo.liftPercent) >= 20
                            ? 'text-success'
                            : 'text-text-secondary'
                        )}>
                          {activeTab === 'upcoming'
                            ? `${promo.expectedLiftPercent}%`
                            : `${promo.liftPercent}%`}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={cn(
                          'text-sm font-medium',
                          promo.campaignUsage > 0 ? 'text-primary' : 'text-text-muted'
                        )}>
                          {promo.campaignUsage}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedPromotion(promo)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))
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

      {/* Promotion Details Drawer */}
      <AnimatePresence>
        {selectedPromotion && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 z-40"
              onClick={() => setSelectedPromotion(null)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
              className="fixed right-0 top-0 h-full w-[480px] bg-surface border-l border-border z-50 shadow-xl overflow-y-auto"
            >
              <div className="p-6 border-b border-border flex items-center justify-between sticky top-0 bg-surface">
                <h3 className="font-semibold text-text-primary text-lg">Promotion Details</h3>
                <button
                  onClick={() => setSelectedPromotion(null)}
                  className="p-2 hover:bg-surface-tertiary rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Summary */}
                <div>
                  <h4 className="text-sm font-medium text-text-muted mb-3">Summary</h4>
                  <Card className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-semibold text-text-primary text-lg">{selectedPromotion.name}</p>
                        <p className="text-sm text-text-muted font-mono">{selectedPromotion.id}</p>
                      </div>
                      <Badge
                        variant={
                          selectedPromotion.status === 'Running' ? 'success' :
                          selectedPromotion.status === 'Upcoming' ? 'info' : 'default'
                        }
                      >
                        {selectedPromotion.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="px-3 py-2 bg-primary/10 rounded-lg">
                        <span className="text-xl font-bold text-primary">
                          {selectedPromotion.discountUnit === '%' 
                            ? `${selectedPromotion.discountValue}%` 
                            : `$${selectedPromotion.discountValue}`}
                        </span>
                      </div>
                      <div className="text-sm text-text-secondary">
                        {selectedPromotion.type}
                      </div>
                    </div>
                  </Card>
                </div>

                {/* Scope Details */}
                <div>
                  <h4 className="text-sm font-medium text-text-muted mb-3">Scope Details</h4>
                  <Card className="p-4 space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-text-secondary">Scope Type</span>
                      <Badge>{selectedPromotion.scopeType}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-text-secondary">Scope Summary</span>
                      <span className="text-sm text-text-primary">{selectedPromotion.scopeSummary}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-text-secondary">Category</span>
                      <span className="text-sm text-text-primary">{selectedPromotion.category}</span>
                    </div>
                  </Card>
                </div>

                {/* Channel & Validity */}
                <div>
                  <h4 className="text-sm font-medium text-text-muted mb-3">Channel & Validity</h4>
                  <Card className="p-4 space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-text-secondary">Channel</span>
                      <span className="text-sm text-text-primary">{selectedPromotion.channel}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-text-secondary">Start Date</span>
                      <span className="text-sm text-text-primary">{selectedPromotion.startDate.toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-text-secondary">End Date</span>
                      <span className="text-sm text-text-primary">{selectedPromotion.endDate.toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-text-secondary">Season</span>
                      <span className="text-sm text-text-primary">{selectedPromotion.season}</span>
                    </div>
                  </Card>
                </div>

                {/* Performance Snapshot */}
                <div>
                  <h4 className="text-sm font-medium text-text-muted mb-3">Performance Snapshot</h4>
                  <Card className="p-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-text-muted mb-1">Sales</p>
                        <p className="text-lg font-semibold text-text-primary">
                          {formatCurrency(selectedPromotion.status === 'Upcoming' ? selectedPromotion.forecastedSales : selectedPromotion.sales)}
                        </p>
                        {selectedPromotion.status === 'Upcoming' && (
                          <p className="text-xs text-text-muted">Forecasted</p>
                        )}
                      </div>
                      <div>
                        <p className="text-xs text-text-muted mb-1">Units</p>
                        <p className="text-lg font-semibold text-text-primary">
                          {formatNumber(selectedPromotion.status === 'Upcoming' ? selectedPromotion.forecastedUnits : selectedPromotion.units)}
                        </p>
                        {selectedPromotion.status === 'Upcoming' && (
                          <p className="text-xs text-text-muted">Forecasted</p>
                        )}
                      </div>
                      <div>
                        <p className="text-xs text-text-muted mb-1">GM%</p>
                        <p className="text-lg font-semibold text-text-primary">
                          {selectedPromotion.status === 'Upcoming' ? selectedPromotion.forecastedGmPercent : selectedPromotion.gmPercent}%
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-text-muted mb-1">Lift</p>
                        <p className="text-lg font-semibold text-success">
                          {selectedPromotion.status === 'Upcoming' ? selectedPromotion.expectedLiftPercent : selectedPromotion.liftPercent}%
                        </p>
                      </div>
                    </div>
                  </Card>
                </div>

                {/* Campaign Usage */}
                <div>
                  <h4 className="text-sm font-medium text-text-muted mb-3">Campaign Usage</h4>
                  <Card className="p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-text-secondary">Used in campaigns</span>
                      <span className="text-lg font-semibold text-primary">{selectedPromotion.campaignUsage}</span>
                    </div>
                  </Card>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4">
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
