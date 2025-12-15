import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Users, Plus, Sparkles, X, Eye, ChevronDown, Check, 
  RotateCcw, Copy, Archive, Edit3, Clock, CheckCircle,
  AlertCircle, Lightbulb, BarChart3, Filter, Download, Tag
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

// Extended Segment type for this screen
interface Segment {
  id: string
  name: string
  createdBy: 'User' | 'Alan'
  segmentationMethod: 'Rule-Based' | 'Statistical'
  segmentNature: 'Static' | 'Dynamic'
  definitionSummary: string
  category: string
  channel: 'Online' | 'Store' | 'Omni'
  campaignUsage: number
  lastUpdated: Date
  estimatedSize: number
  status: 'Active' | 'Archived'
  rules?: string[]
  features?: string[]
}

const mockSegments: Segment[] = [
  {
    id: 'SEG-001',
    name: 'High-Value Loyalists',
    createdBy: 'Alan',
    segmentationMethod: 'Statistical',
    segmentNature: 'Dynamic',
    definitionSummary: 'Customers with 5+ purchases and high lifetime value, showing consistent engagement patterns',
    category: 'Retention',
    channel: 'Omni',
    campaignUsage: 12,
    lastUpdated: new Date('2024-12-10'),
    estimatedSize: 45000,
    status: 'Active',
    features: ['Purchase frequency', 'Average order value', 'Engagement score', 'Tenure'],
  },
  {
    id: 'SEG-002',
    name: 'At-Risk Churners',
    createdBy: 'Alan',
    segmentationMethod: 'Statistical',
    segmentNature: 'Dynamic',
    definitionSummary: 'Previously active customers showing disengagement signals in the last 60 days',
    category: 'Win-back',
    channel: 'Online',
    campaignUsage: 8,
    lastUpdated: new Date('2024-12-08'),
    estimatedSize: 28000,
    status: 'Active',
    features: ['Days since last purchase', 'Email open rate decline', 'Browse frequency drop'],
  },
  {
    id: 'SEG-003',
    name: 'New Subscribers',
    createdBy: 'User',
    segmentationMethod: 'Rule-Based',
    segmentNature: 'Static',
    definitionSummary: 'Recently joined customers in the last 30 days ready for first purchase',
    category: 'Acquisition',
    channel: 'Online',
    campaignUsage: 5,
    lastUpdated: new Date('2024-12-05'),
    estimatedSize: 12000,
    status: 'Active',
    rules: ['Signup date within 30 days', 'No purchase history', 'Email verified'],
  },
  {
    id: 'SEG-004',
    name: 'VIP Customers',
    createdBy: 'User',
    segmentationMethod: 'Rule-Based',
    segmentNature: 'Dynamic',
    definitionSummary: 'Top 5% customers by lifetime value with premium tier membership',
    category: 'Loyalty',
    channel: 'Omni',
    campaignUsage: 15,
    lastUpdated: new Date('2024-12-12'),
    estimatedSize: 8500,
    status: 'Active',
    rules: ['LTV > $5000', 'Membership tier = Premium', 'Active in last 90 days'],
  },
  {
    id: 'SEG-005',
    name: 'Cart Abandoners',
    createdBy: 'Alan',
    segmentationMethod: 'Rule-Based',
    segmentNature: 'Dynamic',
    definitionSummary: 'Users who added items to cart but did not complete purchase within 24 hours',
    category: 'Conversion',
    channel: 'Online',
    campaignUsage: 20,
    lastUpdated: new Date('2024-12-14'),
    estimatedSize: 35000,
    status: 'Active',
    rules: ['Cart value > $0', 'No checkout completion', 'Time since cart > 24h'],
  },
  {
    id: 'SEG-006',
    name: 'Store-Only Shoppers',
    createdBy: 'User',
    segmentationMethod: 'Rule-Based',
    segmentNature: 'Static',
    definitionSummary: 'Customers who exclusively shop in physical stores with no online activity',
    category: 'Channel Migration',
    channel: 'Store',
    campaignUsage: 3,
    lastUpdated: new Date('2024-11-28'),
    estimatedSize: 52000,
    status: 'Active',
    rules: ['Store purchases > 0', 'Online purchases = 0', 'Has email address'],
  },
  {
    id: 'SEG-007',
    name: 'Seasonal Buyers',
    createdBy: 'Alan',
    segmentationMethod: 'Statistical',
    segmentNature: 'Dynamic',
    definitionSummary: 'Customers identified with strong seasonal purchase patterns during holidays',
    category: 'Seasonal',
    channel: 'Omni',
    campaignUsage: 6,
    lastUpdated: new Date('2024-12-01'),
    estimatedSize: 67000,
    status: 'Active',
    features: ['Holiday purchase history', 'Seasonal engagement spikes', 'Gift purchase behavior'],
  },
  {
    id: 'SEG-008',
    name: 'Price Sensitive',
    createdBy: 'Alan',
    segmentationMethod: 'Statistical',
    segmentNature: 'Dynamic',
    definitionSummary: 'Customers who primarily purchase during promotions and respond to discounts',
    category: 'Promotion',
    channel: 'Online',
    campaignUsage: 11,
    lastUpdated: new Date('2024-12-09'),
    estimatedSize: 89000,
    status: 'Active',
    features: ['Promo purchase ratio', 'Coupon redemption rate', 'Price comparison behavior'],
  },
]

const channels = ['All Channels', 'Online', 'Store', 'Omni']

const alanSteps = [
  'Understanding business context',
  'Identifying relevant customer signals',
  'Applying selected segmentation method',
  'Designing segment definitions',
  'Validating size & overlap',
  'Classifying static vs dynamic behavior',
  'Finalizing segments',
]

export function SegmentLibrary() {
  // Filter states
  const [creationModeFilter, setCreationModeFilter] = useState<'all' | 'Manual' | 'Alan'>('all')
  const [methodFilter, setMethodFilter] = useState<'all' | 'Rule-Based' | 'Statistical'>('all')
  const [natureFilter, setNatureFilter] = useState<'all' | 'Static' | 'Dynamic'>('all')
  const [channelFilter, setChannelFilter] = useState('All Channels')
  const [campaignUsedFilter, setCampaignUsedFilter] = useState<'all' | 'yes' | 'no'>('all')
  
  // Dropdown states
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showAlanPanel, setShowAlanPanel] = useState(false)
  const [selectedSegment, setSelectedSegment] = useState<Segment | null>(null)
  
  // Alan states
  const [alanRunning, setAlanRunning] = useState(false)
  const [alanCurrentStep, setAlanCurrentStep] = useState(0)
  const [showAlanInsights, setShowAlanInsights] = useState(false)
  const [showAlanResults, setShowAlanResults] = useState(false)
  
  // Alan configuration
  const [alanMethod, setAlanMethod] = useState<'Rule-Based' | 'Statistical' | null>(null)
  const [alanNature, setAlanNature] = useState<'Static' | 'Dynamic' | null>(null)
  const [alanBusinessIntent, setAlanBusinessIntent] = useState('')
  const [alanChannel, setAlanChannel] = useState('')
  const [alanTimeWindow, setAlanTimeWindow] = useState('')
  const [alanGeneratedSegmentName, setAlanGeneratedSegmentName] = useState('')
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // Create segment wizard state
  const [createStep, setCreateStep] = useState(1)
  const [selectedMethod, setSelectedMethod] = useState<'rule-based' | 'statistical' | null>(null)
  const [selectedSegmentationType, setSelectedSegmentationType] = useState<string | null>(null)
  const [selectedClusteringAlgorithm, setSelectedClusteringAlgorithm] = useState<string>('K-Means')
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>(['Recency', 'Frequency', 'Monetary', 'Avg Order Value'])
  const [clusterCount, setClusterCount] = useState(5)
  const [segmentName, setSegmentName] = useState('')
  const [segmentNature, setSegmentNature] = useState<'Static' | 'Dynamic'>('Dynamic')
  const [segmentChannel, setSegmentChannel] = useState<'Online' | 'Store' | 'Omni'>('Omni')
  // Rule definition state
  const [ruleConditions, setRuleConditions] = useState<{field: string, operator: string, value: string}[]>([
    { field: '', operator: 'equals', value: '' }
  ])
  
  const addRuleCondition = () => {
    setRuleConditions([...ruleConditions, { field: '', operator: 'equals', value: '' }])
  }
  
  const updateRuleCondition = (index: number, key: string, value: string) => {
    const updated = [...ruleConditions]
    updated[index] = { ...updated[index], [key]: value }
    setRuleConditions(updated)
  }
  
  const removeRuleCondition = (index: number) => {
    if (ruleConditions.length > 1) {
      setRuleConditions(ruleConditions.filter((_, i) => i !== index))
    }
  }
  
  const resetCreateWizard = () => {
    setCreateStep(1)
    setSelectedMethod(null)
    setSelectedSegmentationType(null)
    setSelectedClusteringAlgorithm('K-Means')
    setSelectedFeatures(['Recency', 'Frequency', 'Monetary', 'Avg Order Value'])
    setClusterCount(5)
    setSegmentName('')
    setSegmentNature('Dynamic')
    setSegmentChannel('Omni')
    setRuleConditions([{ field: '', operator: 'equals', value: '' }])
  }

  const hasActiveFilters = creationModeFilter !== 'all' || methodFilter !== 'all' || natureFilter !== 'all' ||
    channelFilter !== 'All Channels' || campaignUsedFilter !== 'all'

  const resetFilters = () => {
    setCreationModeFilter('all')
    setMethodFilter('all')
    setNatureFilter('all')
    setChannelFilter('All Channels')
    setCampaignUsedFilter('all')
    setCurrentPage(1)
  }

  const filteredSegments = mockSegments.filter(segment => {
    const matchesCreation = creationModeFilter === 'all' || 
      (creationModeFilter === 'Manual' && segment.createdBy === 'User') ||
      (creationModeFilter === 'Alan' && segment.createdBy === 'Alan')
    const matchesMethod = methodFilter === 'all' || segment.segmentationMethod === methodFilter
    const matchesNature = natureFilter === 'all' || segment.segmentNature === natureFilter
    const matchesChannel = channelFilter === 'All Channels' || segment.channel === channelFilter
    const matchesCampaignUsed = campaignUsedFilter === 'all' || 
      (campaignUsedFilter === 'yes' && segment.campaignUsage > 0) ||
      (campaignUsedFilter === 'no' && segment.campaignUsage === 0)
    return matchesCreation && matchesMethod && matchesNature && matchesChannel && matchesCampaignUsed
  })

  const totalPages = Math.ceil(filteredSegments.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedSegments = filteredSegments.slice(startIndex, startIndex + itemsPerPage)

  const runAlan = () => {
    if (!alanMethod || !alanNature || !alanBusinessIntent || !alanChannel) return
    setAlanRunning(true)
    setAlanCurrentStep(0)
    setShowAlanPanel(false)
    // Generate a segment name based on business intent
    const intentWords = alanBusinessIntent.split(' ').slice(0, 3).join(' ')
    setAlanGeneratedSegmentName(`${intentWords} - ${alanChannel}`)
    const interval = setInterval(() => {
      setAlanCurrentStep(prev => {
        if (prev >= alanSteps.length - 1) {
          clearInterval(interval)
          setAlanRunning(false)
          setShowAlanInsights(true)
          setShowAlanResults(true) // Show results panel when done
          return prev
        }
        return prev + 1
      })
    }, 1500)
  }

  const formatNumber = (value: number) => new Intl.NumberFormat('en-US').format(value)

  return (
    <div className="min-h-screen bg-surface-secondary">
      {/* Header */}
      <header className="bg-surface border-b border-border px-8 py-6">
        <div className="max-w-full mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-text-primary">Segment Library</h1>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => setShowAlanPanel(true)}>
              <Sparkles className="w-4 h-4 mr-2" />
              Create with Alan
            </Button>
            <Button variant="primary" onClick={() => setShowCreateModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Segment
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-full mx-auto px-8 py-6">
        {/* Alan Running Banner */}
        <AnimatePresence>
          {alanRunning && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6 bg-agent/5 border border-agent/20 rounded-xl p-6"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-10 h-10 rounded-full bg-agent/10 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-agent animate-pulse" />
                </div>
                <div>
                  <h3 className="font-semibold text-text-primary">Alan is creating segments…</h3>
                  <p className="text-sm text-text-secondary">This may take a moment</p>
                </div>
              </div>
              <div className="space-y-2">
                {alanSteps.map((step, index) => (
                  <div key={step} className={cn(
                    'flex items-center gap-3 py-2 px-3 rounded-lg transition-colors',
                    index < alanCurrentStep && 'bg-success/5',
                    index === alanCurrentStep && 'bg-agent/10'
                  )}>
                    {index < alanCurrentStep ? (
                      <CheckCircle className="w-4 h-4 text-success" />
                    ) : index === alanCurrentStep ? (
                      <div className="w-4 h-4 rounded-full border-2 border-agent border-t-transparent animate-spin" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border-2 border-border" />
                    )}
                    <span className={cn('text-sm', index <= alanCurrentStep ? 'text-text-primary' : 'text-text-muted')}>{step}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Alan Insights Section */}
        <AnimatePresence>
          {showAlanInsights && (
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-agent" />
                  <h3 className="font-semibold text-text-primary">Alan's Insights</h3>
                </div>
                <button onClick={() => setShowAlanInsights(false)} className="text-sm text-text-muted hover:text-text-primary">Dismiss all</button>
              </div>
              <div className="grid grid-cols-4 gap-4">
                <Card className="p-4 border-agent/20 bg-agent/5">
                  <div className="flex items-center gap-2 mb-2">
                    <Lightbulb className="w-4 h-4 text-agent" />
                    <span className="text-xs font-medium text-agent">Key Behavior</span>
                  </div>
                  <p className="text-sm text-text-primary">Identified strong correlation between email engagement and purchase frequency.</p>
                </Card>
                <Card className="p-4 border-agent/20 bg-agent/5">
                  <div className="flex items-center gap-2 mb-2">
                    <BarChart3 className="w-4 h-4 text-agent" />
                    <span className="text-xs font-medium text-agent">Segmentation Logic</span>
                  </div>
                  <p className="text-sm text-text-primary">Used K-means clustering with 4 behavioral features to identify 3 distinct groups.</p>
                </Card>
                <Card className="p-4 border-agent/20 bg-agent/5">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-4 h-4 text-agent" />
                    <span className="text-xs font-medium text-agent">Coverage Summary</span>
                  </div>
                  <p className="text-sm text-text-primary">New segments cover 78% of active customers with minimal overlap (&lt;5%).</p>
                </Card>
                <Card className="p-4 border-warning/20 bg-warning/5">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="w-4 h-4 text-warning" />
                    <span className="text-xs font-medium text-warning">Caveat</span>
                  </div>
                  <p className="text-sm text-text-primary">Segment "Price Sensitive" may need refinement as holiday data could skew results.</p>
                </Card>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Filters Toggle */}
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
                {[creationModeFilter !== 'all', methodFilter !== 'all', natureFilter !== 'all', channelFilter !== 'All Channels', campaignUsedFilter !== 'all'].filter(Boolean).length}
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
                    <button onClick={resetFilters} className="flex items-center gap-1.5 text-sm text-primary hover:underline">
                      <RotateCcw className="w-3 h-3" />
                      Reset
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-5 gap-4">
                  {/* Creation Mode Dropdown */}
                  <div className="relative">
                    <label className="block text-xs text-text-muted mb-1.5">Creation Mode</label>
                    <button
                      onClick={() => setOpenDropdown(openDropdown === 'creationMode' ? null : 'creationMode')}
                      className="w-full px-3 py-2.5 bg-surface border border-border rounded-lg text-sm text-left flex items-center justify-between hover:border-primary/50 transition-colors"
                    >
                      <span className="text-text-primary">{creationModeFilter === 'all' ? 'All Modes' : creationModeFilter}</span>
                      <ChevronDown className={cn('w-4 h-4 text-text-muted transition-transform', openDropdown === 'creationMode' && 'rotate-180')} />
                    </button>
                    <AnimatePresence>
                      {openDropdown === 'creationMode' && (
                        <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                          className="absolute top-full left-0 right-0 mt-1 bg-surface border border-border rounded-lg shadow-lg z-[9999] overflow-hidden">
                          {[{ value: 'all', label: 'All Modes' }, { value: 'Manual', label: 'Manual' }, { value: 'Alan', label: 'Alan' }].map((opt) => (
                            <button key={opt.value} onClick={() => { setCreationModeFilter(opt.value as 'all' | 'Manual' | 'Alan'); setOpenDropdown(null) }}
                              className={cn('w-full px-4 py-2.5 text-left text-sm hover:bg-surface-secondary transition-colors flex items-center justify-between',
                                creationModeFilter === opt.value && 'bg-primary/5 text-primary font-medium')}>
                              {opt.label}
                              {creationModeFilter === opt.value && <Check className="w-4 h-4" />}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Segmentation Method Dropdown */}
                  <div className="relative">
                    <label className="block text-xs text-text-muted mb-1.5">Segmentation Method</label>
                    <button
                      onClick={() => setOpenDropdown(openDropdown === 'method' ? null : 'method')}
                      className="w-full px-3 py-2.5 bg-surface border border-border rounded-lg text-sm text-left flex items-center justify-between hover:border-primary/50 transition-colors"
                    >
                      <span className="text-text-primary">{methodFilter === 'all' ? 'All Methods' : methodFilter}</span>
                      <ChevronDown className={cn('w-4 h-4 text-text-muted transition-transform', openDropdown === 'method' && 'rotate-180')} />
                    </button>
                    <AnimatePresence>
                      {openDropdown === 'method' && (
                        <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                          className="absolute top-full left-0 right-0 mt-1 bg-surface border border-border rounded-lg shadow-lg z-[9999] overflow-hidden">
                          {[{ value: 'all', label: 'All Methods' }, { value: 'Rule-Based', label: 'Rule-Based' }, { value: 'Statistical', label: 'Statistical' }].map((opt) => (
                            <button key={opt.value} onClick={() => { setMethodFilter(opt.value as 'all' | 'Rule-Based' | 'Statistical'); setOpenDropdown(null) }}
                              className={cn('w-full px-4 py-2.5 text-left text-sm hover:bg-surface-secondary transition-colors flex items-center justify-between',
                                methodFilter === opt.value && 'bg-primary/5 text-primary font-medium')}>
                              {opt.label}
                              {methodFilter === opt.value && <Check className="w-4 h-4" />}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Segment Nature Dropdown */}
                  <div className="relative">
                    <label className="block text-xs text-text-muted mb-1.5">Segment Nature</label>
                    <button
                      onClick={() => setOpenDropdown(openDropdown === 'nature' ? null : 'nature')}
                      className="w-full px-3 py-2.5 bg-surface border border-border rounded-lg text-sm text-left flex items-center justify-between hover:border-primary/50 transition-colors"
                    >
                      <span className="text-text-primary">{natureFilter === 'all' ? 'All Natures' : natureFilter}</span>
                      <ChevronDown className={cn('w-4 h-4 text-text-muted transition-transform', openDropdown === 'nature' && 'rotate-180')} />
                    </button>
                    <AnimatePresence>
                      {openDropdown === 'nature' && (
                        <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                          className="absolute top-full left-0 right-0 mt-1 bg-surface border border-border rounded-lg shadow-lg z-[9999] overflow-hidden">
                          {[{ value: 'all', label: 'All Natures' }, { value: 'Static', label: 'Static' }, { value: 'Dynamic', label: 'Dynamic' }].map((opt) => (
                            <button key={opt.value} onClick={() => { setNatureFilter(opt.value as 'all' | 'Static' | 'Dynamic'); setOpenDropdown(null) }}
                              className={cn('w-full px-4 py-2.5 text-left text-sm hover:bg-surface-secondary transition-colors flex items-center justify-between',
                                natureFilter === opt.value && 'bg-primary/5 text-primary font-medium')}>
                              {opt.label}
                              {natureFilter === opt.value && <Check className="w-4 h-4" />}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Channel Dropdown */}
                  <div className="relative">
                    <label className="block text-xs text-text-muted mb-1.5">Channel</label>
                    <button
                      onClick={() => setOpenDropdown(openDropdown === 'channel' ? null : 'channel')}
                      className="w-full px-3 py-2.5 bg-surface border border-border rounded-lg text-sm text-left flex items-center justify-between hover:border-primary/50 transition-colors"
                    >
                      <span className="text-text-primary">{channelFilter}</span>
                      <ChevronDown className={cn('w-4 h-4 text-text-muted transition-transform', openDropdown === 'channel' && 'rotate-180')} />
                    </button>
                    <AnimatePresence>
                      {openDropdown === 'channel' && (
                        <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                          className="absolute top-full left-0 right-0 mt-1 bg-surface border border-border rounded-lg shadow-lg z-[9999] overflow-hidden">
                          {channels.map((opt) => (
                            <button key={opt} onClick={() => { setChannelFilter(opt); setOpenDropdown(null) }}
                              className={cn('w-full px-4 py-2.5 text-left text-sm hover:bg-surface-secondary transition-colors flex items-center justify-between',
                                channelFilter === opt && 'bg-primary/5 text-primary font-medium')}>
                              {opt}
                              {channelFilter === opt && <Check className="w-4 h-4" />}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Used in Campaign Dropdown */}
                  <div className="relative">
                    <label className="block text-xs text-text-muted mb-1.5">Used in Campaign</label>
                    <button
                      onClick={() => setOpenDropdown(openDropdown === 'campaignUsed' ? null : 'campaignUsed')}
                      className="w-full px-3 py-2.5 bg-surface border border-border rounded-lg text-sm text-left flex items-center justify-between hover:border-primary/50 transition-colors"
                    >
                      <span className="text-text-primary">{campaignUsedFilter === 'all' ? 'All' : campaignUsedFilter === 'yes' ? 'Yes' : 'No'}</span>
                      <ChevronDown className={cn('w-4 h-4 text-text-muted transition-transform', openDropdown === 'campaignUsed' && 'rotate-180')} />
                    </button>
                    <AnimatePresence>
                      {openDropdown === 'campaignUsed' && (
                        <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                          className="absolute top-full left-0 right-0 mt-1 bg-surface border border-border rounded-lg shadow-lg z-[9999] overflow-hidden">
                          {[{ value: 'all', label: 'All' }, { value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }].map((opt) => (
                            <button key={opt.value} onClick={() => { setCampaignUsedFilter(opt.value as 'all' | 'yes' | 'no'); setOpenDropdown(null) }}
                              className={cn('w-full px-4 py-2.5 text-left text-sm hover:bg-surface-secondary transition-colors flex items-center justify-between',
                                campaignUsedFilter === opt.value && 'bg-primary/5 text-primary font-medium')}>
                              {opt.label}
                              {campaignUsedFilter === opt.value && <Check className="w-4 h-4" />}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Export Row */}
        <div className="flex items-center justify-end mb-6">
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Export
          </Button>
        </div>

        {/* Segment Table */}
        <div className="bg-surface rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-surface-secondary border-b border-border sticky top-0">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Segment Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Created By</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Method</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Nature</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider w-64">Definition Summary</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Category</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Channel</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-text-muted uppercase tracking-wider">Campaigns</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Last Updated</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-text-muted uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {paginatedSegments.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="px-4 py-12 text-center">
                      <Users className="w-12 h-12 text-text-muted mx-auto mb-3" />
                      <p className="text-text-primary font-medium mb-1">No segments found</p>
                      <p className="text-sm text-text-secondary mb-4">Create your first segment manually or with Alan</p>
                      <div className="flex gap-3 justify-center">
                        <Button variant="outline" onClick={() => setShowAlanPanel(true)}><Sparkles className="w-4 h-4 mr-2" />Create with Alan</Button>
                        <Button variant="primary" onClick={() => setShowCreateModal(true)}><Plus className="w-4 h-4 mr-2" />Create Segment</Button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedSegments.map((segment) => (
                    <tr key={segment.id} className="hover:bg-surface-secondary transition-colors">
                      <td className="px-4 py-3"><span className="text-sm font-medium text-text-primary">{segment.name}</span></td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          {segment.createdBy === 'Alan' && <Sparkles className="w-3.5 h-3.5 text-agent" />}
                          <span className="text-sm text-text-secondary">{segment.createdBy}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3"><Badge variant={segment.segmentationMethod === 'Statistical' ? 'info' : 'default'}>{segment.segmentationMethod}</Badge></td>
                      <td className="px-4 py-3"><Badge variant={segment.segmentNature === 'Dynamic' ? 'success' : 'default'}>{segment.segmentNature}</Badge></td>
                      <td className="px-4 py-3"><p className="text-sm text-text-secondary line-clamp-2">{segment.definitionSummary}</p></td>
                      <td className="px-4 py-3 text-sm text-text-secondary">{segment.category}</td>
                      <td className="px-4 py-3 text-sm text-text-secondary">{segment.channel}</td>
                      <td className="px-4 py-3 text-center text-sm text-text-primary font-medium">{segment.campaignUsage}</td>
                      <td className="px-4 py-3 text-sm text-text-secondary">{segment.lastUpdated.toLocaleDateString()}</td>
                      <td className="px-4 py-3 text-center">
                        <Button variant="ghost" size="sm" onClick={() => setSelectedSegment(segment)}><Eye className="w-4 h-4" /></Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {filteredSegments.length > 0 && (
            <div className="px-4 py-3 border-t border-border flex items-center justify-between">
              <p className="text-sm text-text-secondary">Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredSegments.length)} of {filteredSegments.length} segments</p>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>Previous</Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button key={page} onClick={() => setCurrentPage(page)}
                      className={cn('w-8 h-8 text-sm rounded-md transition-colors', currentPage === page ? 'bg-primary text-white' : 'hover:bg-surface-tertiary text-text-secondary')}>{page}</button>
                  ))}
                </div>
                <Button variant="outline" size="sm" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>Next</Button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Create Segment Modal - Multi-step Wizard */}
      <AnimatePresence>
        {showCreateModal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/40 z-[100]" onClick={() => { setShowCreateModal(false); resetCreateWizard() }} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-surface rounded-2xl shadow-xl z-[101] max-h-[90vh] overflow-y-auto">
              
              {/* Header */}
              <div className="p-6 border-b border-border flex items-center justify-between sticky top-0 bg-surface z-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Plus className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-text-primary text-lg">Create New Segment</h3>
                    <p className="text-sm text-text-secondary">
                      {createStep === 1 && 'Choose segmentation method'}
                      {createStep === 2 && selectedMethod === 'rule-based' && 'Choose segmentation types'}
                      {createStep === 2 && selectedMethod === 'statistical' && 'Configure clustering'}
                      {createStep === 3 && selectedMethod === 'rule-based' && 'Define segment rules'}
                      {createStep === 3 && selectedMethod === 'statistical' && 'Configure segment details'}
                      {createStep === 4 && selectedMethod === 'rule-based' && 'Configure segment details'}
                      {createStep === 4 && selectedMethod === 'statistical' && 'Review and save'}
                      {createStep === 5 && 'Review and save'}
                    </p>
                  </div>
                </div>
                <button onClick={() => { setShowCreateModal(false); resetCreateWizard() }} className="p-2 hover:bg-surface-tertiary rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Progress Steps */}
              {createStep > 1 && (
                <div className="px-6 pt-4">
                  {selectedMethod === 'rule-based' ? (
                    <>
                      <div className="flex items-center justify-between">
                        {[1, 2, 3, 4, 5].map((step) => (
                          <div key={step} className="flex items-center">
                            <div className={cn(
                              'w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium',
                              step < createStep ? 'bg-primary text-white' :
                              step === createStep ? 'bg-primary text-white' :
                              'bg-surface-tertiary text-text-muted'
                            )}>
                              {step < createStep ? <Check className="w-3 h-3" /> : step}
                            </div>
                            {step < 5 && (
                              <div className={cn('w-10 h-1 mx-1 rounded', step < createStep ? 'bg-primary' : 'bg-surface-tertiary')} />
                            )}
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-between mt-2 text-xs text-text-muted">
                        <span>Method</span>
                        <span>Type</span>
                        <span>Rules</span>
                        <span>Details</span>
                        <span>Save</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center justify-between">
                        {[1, 2, 3, 4].map((step) => (
                          <div key={step} className="flex items-center">
                            <div className={cn(
                              'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium',
                              step < createStep ? 'bg-primary text-white' :
                              step === createStep ? 'bg-primary text-white' :
                              'bg-surface-tertiary text-text-muted'
                            )}>
                              {step < createStep ? <Check className="w-4 h-4" /> : step}
                            </div>
                            {step < 4 && (
                              <div className={cn('w-16 h-1 mx-2 rounded', step < createStep ? 'bg-primary' : 'bg-surface-tertiary')} />
                            )}
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-between mt-2 text-xs text-text-muted">
                        <span>Method</span>
                        <span>Configure</span>
                        <span>Details</span>
                        <span>Save</span>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Step 1: Choose Method */}
              {createStep === 1 && (
                <div className="p-6">
                  <h4 className="text-center text-lg font-semibold text-text-primary mb-2">How would you like to create this segment?</h4>
                  <p className="text-center text-text-secondary mb-6">Choose a segmentation method based on your needs</p>
                  
                  <div className="space-y-4">
                    <button onClick={() => { setSelectedMethod('rule-based'); setCreateStep(2) }}
                      className="w-full p-5 bg-surface border border-border rounded-xl text-left hover:border-primary/50 hover:bg-surface-secondary transition-all">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Tag className="w-6 h-6 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h5 className="font-semibold text-text-primary mb-1">Rule-Based Segmentation</h5>
                          <p className="text-sm text-text-secondary mb-3">Define segments using business rules like lifecycle stages, RFM tiers, promo sensitivity, and channel preferences.</p>
                          <div className="flex flex-wrap gap-2">
                            {['Lifecycle Windows', 'RFM Tiers', 'Promo Sensitivity', 'Channel Preference', 'Category Affinity'].map((tag) => (
                              <span key={tag} className="px-2.5 py-1 bg-surface-tertiary rounded-full text-xs text-text-secondary">{tag}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </button>

                    <button onClick={() => { setSelectedMethod('statistical'); setCreateStep(2) }}
                      className="w-full p-5 bg-surface border border-border rounded-xl text-left hover:border-primary/50 hover:bg-surface-secondary transition-all">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-agent/10 flex items-center justify-center flex-shrink-0">
                          <BarChart3 className="w-6 h-6 text-agent" />
                        </div>
                        <div className="flex-1">
                          <h5 className="font-semibold text-text-primary mb-1">Statistical (ML Clustering)</h5>
                          <p className="text-sm text-text-secondary mb-3">Let machine learning algorithms automatically discover customer segments based on behavioral patterns.</p>
                          <div className="flex flex-wrap gap-2">
                            {['K-Means Clustering', 'Auto-Feature Selection', 'PCA Visualization', 'Auto-Labeling'].map((tag) => (
                              <span key={tag} className="px-2.5 py-1 bg-surface-tertiary rounded-full text-xs text-text-secondary">{tag}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Rule-Based - Choose Segmentation Types */}
              {createStep === 2 && selectedMethod === 'rule-based' && (
                <div className="p-6">
                  <h4 className="text-lg font-semibold text-text-primary mb-6">Choose Segmentation Types</h4>
                  
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { id: 'rfm', name: 'RFM Analysis', desc: 'Segment by Recency, Frequency & Monetary value', icon: BarChart3, color: 'text-primary' },
                      { id: 'lifecycle', name: 'Lifecycle Stage', desc: 'Based on customer journey position', icon: Clock, color: 'text-success' },
                      { id: 'value', name: 'Value Tier', desc: 'Customer lifetime value classification', icon: Tag, color: 'text-warning' },
                      { id: 'promo', name: 'Promo Sensitivity', desc: 'Response to promotional offers', icon: Tag, color: 'text-danger' },
                      { id: 'channel', name: 'Channel Preference', desc: 'Preferred shopping channel', icon: Users, color: 'text-info' },
                      { id: 'category', name: 'Category Affinity', desc: 'Product category preferences', icon: Tag, color: 'text-agent' },
                    ].map((type) => (
                      <button key={type.id} onClick={() => setSelectedSegmentationType(type.id)}
                        className={cn('p-4 rounded-xl border text-left transition-all',
                          selectedSegmentationType === type.id ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-surface-secondary')}>
                        <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center mb-3', 
                          selectedSegmentationType === type.id ? 'bg-primary/10' : 'bg-surface-tertiary')}>
                          <type.icon className={cn('w-5 h-5', type.color)} />
                        </div>
                        <h5 className="font-medium text-text-primary mb-1">{type.name}</h5>
                        <p className="text-xs text-text-secondary">{type.desc}</p>
                      </button>
                    ))}
                  </div>

                  <div className="mt-6 pt-6 border-t border-border flex justify-between">
                    <Button variant="ghost" onClick={() => { setCreateStep(1); setSelectedMethod(null); setSelectedSegmentationType(null) }}>Back</Button>
                    <Button variant="primary" disabled={!selectedSegmentationType} onClick={() => setCreateStep(3)}>Continue</Button>
                  </div>
                </div>
              )}

              {/* Step 2: Statistical - Configure Clustering */}
              {createStep === 2 && selectedMethod === 'statistical' && (
                <div className="p-6">
                  <h4 className="text-lg font-semibold text-text-primary mb-4">Choose Clustering Algorithm</h4>
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    {[
                      { id: 'K-Means', name: 'K-Means', desc: 'Most common, works well for spherical clusters' },
                      { id: 'Gaussian', name: 'Gaussian Mixture', desc: 'Handles overlapping clusters with soft assignments' },
                      { id: 'Hierarchical', name: 'Hierarchical', desc: 'Creates nested cluster hierarchy' },
                      { id: 'DBSCAN', name: 'DBSCAN', desc: 'Detects noise and outliers automatically' },
                    ].map((algo) => (
                      <button key={algo.id} onClick={() => setSelectedClusteringAlgorithm(algo.id)}
                        className={cn('p-4 rounded-xl border text-left transition-all',
                          selectedClusteringAlgorithm === algo.id ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50')}>
                        <div className="flex items-center gap-2 mb-1">
                          <h5 className="font-medium text-text-primary">{algo.name}</h5>
                          {selectedClusteringAlgorithm === algo.id && <CheckCircle className="w-4 h-4 text-primary" />}
                        </div>
                        <p className="text-xs text-text-secondary">{algo.desc}</p>
                      </button>
                    ))}
                  </div>

                  <h4 className="text-lg font-semibold text-text-primary mb-4">Select Input Features</h4>
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    {[
                      { id: 'Recency', category: 'RFM', score: 95 },
                      { id: 'Frequency', category: 'RFM', score: 92 },
                      { id: 'Monetary', category: 'RFM', score: 94 },
                      { id: 'Avg Order Value', category: 'Transaction', score: 91 },
                      { id: 'Promo Sensitivity', category: 'Behavior', score: 88 },
                      { id: 'Category Affinity', category: 'Preference', score: 90 },
                    ].map((feature) => (
                      <button key={feature.id} onClick={() => setSelectedFeatures(prev => 
                          prev.includes(feature.id) ? prev.filter(f => f !== feature.id) : [...prev, feature.id])}
                        className={cn('p-3 rounded-lg border text-left transition-all flex items-center justify-between',
                          selectedFeatures.includes(feature.id) ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50')}>
                        <div className="flex items-center gap-3">
                          <div className={cn('w-5 h-5 rounded border-2 flex items-center justify-center',
                            selectedFeatures.includes(feature.id) ? 'bg-primary border-primary' : 'border-border')}>
                            {selectedFeatures.includes(feature.id) && <Check className="w-3 h-3 text-white" />}
                          </div>
                          <div>
                            <p className="font-medium text-text-primary text-sm">{feature.id}</p>
                            <p className="text-xs text-text-muted">{feature.category}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-12 h-1.5 bg-surface-tertiary rounded-full overflow-hidden">
                            <div className="h-full bg-success rounded-full" style={{ width: `${feature.score}%` }} />
                          </div>
                          <span className="text-xs text-text-muted">{feature.score}%</span>
                        </div>
                      </button>
                    ))}
                  </div>

                  <h4 className="text-lg font-semibold text-text-primary mb-4">Number of Clusters</h4>
                  <div className="flex items-center gap-4 mb-2">
                    <span className="text-2xl font-bold text-text-primary">{clusterCount}</span>
                    <span className="text-text-secondary">clusters</span>
                  </div>
                  <input type="range" min={3} max={10} value={clusterCount} onChange={(e) => setClusterCount(Number(e.target.value))}
                    className="w-full h-2 bg-surface-tertiary rounded-lg appearance-none cursor-pointer accent-primary" />
                  <div className="flex justify-between text-xs text-text-muted mt-1"><span>3</span><span>10</span></div>

                  <div className="mt-6 pt-6 border-t border-border flex justify-between">
                    <Button variant="ghost" onClick={() => { setCreateStep(1); setSelectedMethod(null) }}>Back</Button>
                    <Button variant="primary" onClick={() => setCreateStep(3)}>Continue</Button>
                  </div>
                </div>
              )}

              {/* Step 3: Rule-Based - Define Rules */}
              {createStep === 3 && selectedMethod === 'rule-based' && (
                <div className="p-6">
                  <h4 className="text-lg font-semibold text-text-primary mb-2">Define Segment Rules</h4>
                  <p className="text-sm text-text-secondary mb-6">
                    Configure the rules for your {selectedSegmentationType?.replace('-', ' ')} segmentation
                  </p>
                  
                  <div className="space-y-4">
                    {ruleConditions.map((condition, index) => (
                      <div key={index} className="flex items-center gap-3">
                        {index > 0 && (
                          <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded">AND</span>
                        )}
                        <div className="flex-1 grid grid-cols-3 gap-3">
                          <select
                            value={condition.field}
                            onChange={(e) => updateRuleCondition(index, 'field', e.target.value)}
                            className="px-3 py-2.5 bg-surface border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                          >
                            <option value="">Select field...</option>
                            {selectedSegmentationType === 'rfm' && (
                              <>
                                <option value="recency">Recency (days)</option>
                                <option value="frequency">Frequency (orders)</option>
                                <option value="monetary">Monetary (spend)</option>
                                <option value="rfm_score">RFM Score</option>
                              </>
                            )}
                            {selectedSegmentationType === 'lifecycle' && (
                              <>
                                <option value="days_since_first">Days since first purchase</option>
                                <option value="days_since_last">Days since last purchase</option>
                                <option value="total_orders">Total orders</option>
                                <option value="lifecycle_stage">Lifecycle stage</option>
                              </>
                            )}
                            {selectedSegmentationType === 'value' && (
                              <>
                                <option value="ltv">Lifetime Value</option>
                                <option value="avg_order_value">Avg Order Value</option>
                                <option value="total_spend">Total Spend</option>
                                <option value="value_tier">Value Tier</option>
                              </>
                            )}
                            {selectedSegmentationType === 'promo' && (
                              <>
                                <option value="promo_response_rate">Promo Response Rate</option>
                                <option value="coupon_usage">Coupon Usage</option>
                                <option value="discount_sensitivity">Discount Sensitivity</option>
                                <option value="promo_orders_pct">Promo Orders %</option>
                              </>
                            )}
                            {selectedSegmentationType === 'channel' && (
                              <>
                                <option value="primary_channel">Primary Channel</option>
                                <option value="online_orders_pct">Online Orders %</option>
                                <option value="store_orders_pct">Store Orders %</option>
                                <option value="channel_switches">Channel Switches</option>
                              </>
                            )}
                            {selectedSegmentationType === 'category' && (
                              <>
                                <option value="top_category">Top Category</option>
                                <option value="category_diversity">Category Diversity</option>
                                <option value="category_spend">Category Spend</option>
                                <option value="cross_category">Cross-Category Buyer</option>
                              </>
                            )}
                          </select>
                          <select
                            value={condition.operator}
                            onChange={(e) => updateRuleCondition(index, 'operator', e.target.value)}
                            className="px-3 py-2.5 bg-surface border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                          >
                            <option value="equals">Equals</option>
                            <option value="not_equals">Not Equals</option>
                            <option value="greater_than">Greater Than</option>
                            <option value="less_than">Less Than</option>
                            <option value="between">Between</option>
                            <option value="contains">Contains</option>
                          </select>
                          <input
                            type="text"
                            value={condition.value}
                            onChange={(e) => updateRuleCondition(index, 'value', e.target.value)}
                            placeholder="Enter value..."
                            className="px-3 py-2.5 bg-surface border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                          />
                        </div>
                        {ruleConditions.length > 1 && (
                          <button onClick={() => removeRuleCondition(index)} className="p-2 text-text-muted hover:text-danger hover:bg-danger/10 rounded-lg">
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={addRuleCondition}
                    className="mt-4 flex items-center gap-2 text-sm text-primary hover:text-primary/80 font-medium"
                  >
                    <Plus className="w-4 h-4" />
                    Add Condition
                  </button>

                  <div className="mt-6 p-4 bg-surface-secondary rounded-xl">
                    <p className="text-xs text-text-muted mb-2">Preview</p>
                    <p className="text-sm text-text-primary font-mono">
                      {ruleConditions.filter(c => c.field && c.value).length > 0 
                        ? ruleConditions.filter(c => c.field && c.value).map((c, i) => 
                            `${i > 0 ? ' AND ' : ''}${c.field} ${c.operator.replace('_', ' ')} "${c.value}"`
                          ).join('')
                        : 'No rules defined yet'}
                    </p>
                  </div>

                  <div className="mt-6 pt-6 border-t border-border flex justify-between">
                    <Button variant="ghost" onClick={() => setCreateStep(2)}>Back</Button>
                    <Button variant="primary" onClick={() => setCreateStep(4)}>Continue</Button>
                  </div>
                </div>
              )}

              {/* Step 3: Statistical - Segment Details */}
              {createStep === 3 && selectedMethod === 'statistical' && (
                <div className="p-6">
                  <h4 className="text-lg font-semibold text-text-primary mb-6">Configure Segment Details</h4>
                  
                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-2">Segment Name *</label>
                      <input type="text" value={segmentName} onChange={(e) => setSegmentName(e.target.value)}
                        placeholder="e.g., High-Value Loyalists"
                        className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary" />
                      <p className="text-xs text-text-muted mt-1.5">Give your segment a descriptive name</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-2">Segment Nature</label>
                      <div className="grid grid-cols-2 gap-3">
                        {(['Static', 'Dynamic'] as const).map((nature) => (
                          <button key={nature} onClick={() => setSegmentNature(nature)}
                            className={cn('p-4 rounded-xl border text-left transition-all',
                              segmentNature === nature ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50')}>
                            <div className="flex items-center gap-2 mb-1">
                              <h5 className="font-medium text-text-primary">{nature}</h5>
                              {segmentNature === nature && <CheckCircle className="w-4 h-4 text-primary" />}
                            </div>
                            <p className="text-xs text-text-secondary">
                              {nature === 'Static' ? 'Frozen snapshot of customers at creation time' : 'Auto-refreshes based on rules periodically'}
                            </p>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-2">Target Channel</label>
                      <div className="grid grid-cols-3 gap-3">
                        {(['Online', 'Store', 'Omni'] as const).map((ch) => (
                          <button key={ch} onClick={() => setSegmentChannel(ch)}
                            className={cn('px-4 py-3 rounded-xl border text-sm font-medium transition-all',
                              segmentChannel === ch ? 'border-primary bg-primary text-white' : 'border-border text-text-secondary hover:border-primary/50')}>
                            {ch}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t border-border flex justify-between">
                    <Button variant="ghost" onClick={() => setCreateStep(2)}>Back</Button>
                    <Button variant="primary" disabled={!segmentName.trim()} onClick={() => setCreateStep(4)}>Continue</Button>
                  </div>
                </div>
              )}

              {/* Step 4: Rule-Based - Segment Details */}
              {createStep === 4 && selectedMethod === 'rule-based' && (
                <div className="p-6">
                  <h4 className="text-lg font-semibold text-text-primary mb-6">Configure Segment Details</h4>
                  
                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-2">Segment Name *</label>
                      <input type="text" value={segmentName} onChange={(e) => setSegmentName(e.target.value)}
                        placeholder="e.g., High-Value Loyalists"
                        className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary" />
                      <p className="text-xs text-text-muted mt-1.5">Give your segment a descriptive name</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-2">Segment Nature</label>
                      <div className="grid grid-cols-2 gap-3">
                        {(['Static', 'Dynamic'] as const).map((nature) => (
                          <button key={nature} onClick={() => setSegmentNature(nature)}
                            className={cn('p-4 rounded-xl border text-left transition-all',
                              segmentNature === nature ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50')}>
                            <div className="flex items-center gap-2 mb-1">
                              <h5 className="font-medium text-text-primary">{nature}</h5>
                              {segmentNature === nature && <CheckCircle className="w-4 h-4 text-primary" />}
                            </div>
                            <p className="text-xs text-text-secondary">
                              {nature === 'Static' ? 'Frozen snapshot of customers at creation time' : 'Auto-refreshes based on rules periodically'}
                            </p>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-2">Target Channel</label>
                      <div className="grid grid-cols-3 gap-3">
                        {(['Online', 'Store', 'Omni'] as const).map((ch) => (
                          <button key={ch} onClick={() => setSegmentChannel(ch)}
                            className={cn('px-4 py-3 rounded-xl border text-sm font-medium transition-all',
                              segmentChannel === ch ? 'border-primary bg-primary text-white' : 'border-border text-text-secondary hover:border-primary/50')}>
                            {ch}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t border-border flex justify-between">
                    <Button variant="ghost" onClick={() => setCreateStep(3)}>Back</Button>
                    <Button variant="primary" disabled={!segmentName.trim()} onClick={() => setCreateStep(5)}>Continue</Button>
                  </div>
                </div>
              )}

              {/* Step 4: Statistical - Review & Save */}
              {createStep === 4 && selectedMethod === 'statistical' && (
                <div className="p-6">
                  <h4 className="text-lg font-semibold text-text-primary mb-6">Review & Create Segment</h4>
                  
                  <div className="bg-surface-secondary rounded-xl p-5 space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-xs text-text-muted mb-1">Segment Name</p>
                        <p className="font-semibold text-text-primary text-lg">{segmentName}</p>
                      </div>
                      <Badge variant="info">{segmentNature}</Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                      <div>
                        <p className="text-xs text-text-muted mb-1">Method</p>
                        <p className="text-sm text-text-primary font-medium">Statistical (ML)</p>
                      </div>
                      <div>
                        <p className="text-xs text-text-muted mb-1">Channel</p>
                        <p className="text-sm text-text-primary font-medium">{segmentChannel}</p>
                      </div>
                      <div>
                        <p className="text-xs text-text-muted mb-1">Algorithm</p>
                        <p className="text-sm text-text-primary font-medium">{selectedClusteringAlgorithm}</p>
                      </div>
                      <div>
                        <p className="text-xs text-text-muted mb-1">Clusters</p>
                        <p className="text-sm text-text-primary font-medium">{clusterCount}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-xs text-text-muted mb-1">Features ({selectedFeatures.length})</p>
                        <div className="flex flex-wrap gap-1.5">
                          {selectedFeatures.map(f => (
                            <span key={f} className="px-2 py-1 bg-surface rounded text-xs text-text-secondary">{f}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 p-4 bg-info/5 border border-info/20 rounded-xl">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-info flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-text-primary">Estimated segment size</p>
                        <p className="text-xs text-text-secondary mt-1">Based on your configuration, this segment is estimated to contain approximately <strong>45,000 - 52,000 customers</strong>.</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t border-border flex justify-between">
                    <Button variant="ghost" onClick={() => setCreateStep(3)}>Back</Button>
                    <Button variant="primary" onClick={() => { setShowCreateModal(false); resetCreateWizard() }}>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Create Segment
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 5: Rule-Based - Review & Save */}
              {createStep === 5 && selectedMethod === 'rule-based' && (
                <div className="p-6">
                  <h4 className="text-lg font-semibold text-text-primary mb-6">Review & Create Segment</h4>
                  
                  <div className="bg-surface-secondary rounded-xl p-5 space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-xs text-text-muted mb-1">Segment Name</p>
                        <p className="font-semibold text-text-primary text-lg">{segmentName}</p>
                      </div>
                      <Badge variant="info">{segmentNature}</Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                      <div>
                        <p className="text-xs text-text-muted mb-1">Method</p>
                        <p className="text-sm text-text-primary font-medium">Rule-Based</p>
                      </div>
                      <div>
                        <p className="text-xs text-text-muted mb-1">Channel</p>
                        <p className="text-sm text-text-primary font-medium">{segmentChannel}</p>
                      </div>
                      <div>
                        <p className="text-xs text-text-muted mb-1">Segmentation Type</p>
                        <p className="text-sm text-text-primary font-medium capitalize">{selectedSegmentationType?.replace('-', ' ')}</p>
                      </div>
                      <div>
                        <p className="text-xs text-text-muted mb-1">Rules</p>
                        <p className="text-sm text-text-primary font-medium">{ruleConditions.filter(c => c.field && c.value).length} conditions</p>
                      </div>
                    </div>

                    {ruleConditions.filter(c => c.field && c.value).length > 0 && (
                      <div className="pt-4 border-t border-border">
                        <p className="text-xs text-text-muted mb-2">Rule Preview</p>
                        <p className="text-sm text-text-primary font-mono bg-surface p-3 rounded-lg">
                          {ruleConditions.filter(c => c.field && c.value).map((c, i) => 
                            `${i > 0 ? ' AND ' : ''}${c.field} ${c.operator.replace('_', ' ')} "${c.value}"`
                          ).join('')}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 p-4 bg-info/5 border border-info/20 rounded-xl">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-info flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-text-primary">Estimated segment size</p>
                        <p className="text-xs text-text-secondary mt-1">Based on your rules, this segment is estimated to contain approximately <strong>38,000 - 45,000 customers</strong>.</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t border-border flex justify-between">
                    <Button variant="ghost" onClick={() => setCreateStep(4)}>Back</Button>
                    <Button variant="primary" onClick={() => { setShowCreateModal(false); resetCreateWizard() }}>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Create Segment
                    </Button>
                  </div>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Create with Alan Panel */}
      <AnimatePresence>
        {showAlanPanel && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/20 z-40" onClick={() => setShowAlanPanel(false)} />
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25 }}
              className="fixed right-0 top-0 h-full w-[480px] bg-surface border-l border-border z-50 shadow-xl overflow-y-auto">
              <div className="p-6 border-b border-border flex items-center justify-between sticky top-0 bg-surface">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-agent/10 flex items-center justify-center"><Sparkles className="w-5 h-5 text-agent" /></div>
                  <div>
                    <h3 className="font-semibold text-text-primary">Create with Alan</h3>
                    <p className="text-sm text-text-secondary">Configure segment generation</p>
                  </div>
                </div>
                <button onClick={() => setShowAlanPanel(false)} className="p-2 hover:bg-surface-tertiary rounded-lg"><X className="w-5 h-5" /></button>
              </div>
              <div className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">Segmentation Method <span className="text-danger">*</span></label>
                  <div className="flex gap-2">
                    {(['Rule-Based', 'Statistical'] as const).map((m) => (
                      <button key={m} onClick={() => setAlanMethod(m)}
                        className={cn('flex-1 px-4 py-3 rounded-lg text-sm font-medium transition-colors border',
                          alanMethod === m ? 'bg-agent/10 border-agent text-agent' : 'bg-surface-secondary border-border text-text-secondary hover:border-agent/50')}>{m}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">Segment Nature <span className="text-danger">*</span></label>
                  <div className="flex gap-2">
                    {(['Static', 'Dynamic'] as const).map((n) => (
                      <button key={n} onClick={() => setAlanNature(n)}
                        className={cn('flex-1 px-4 py-3 rounded-lg text-sm font-medium transition-colors border',
                          alanNature === n ? 'bg-agent/10 border-agent text-agent' : 'bg-surface-secondary border-border text-text-secondary hover:border-agent/50')}>
                        <span className="block">{n}</span>
                        <span className="block text-xs opacity-70 mt-0.5">{n === 'Static' ? 'Frozen snapshot' : 'Auto-refresh'}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="p-3 bg-agent/5 rounded-lg border border-agent/20">
                  <p className="text-sm text-text-secondary">
                    <Sparkles className="w-4 h-4 text-agent inline mr-1.5" />
                    {alanMethod === 'Rule-Based' 
                      ? 'Alan will analyze your context and define optimal segmentation rules automatically.'
                      : 'Alan will own feature selection and clustering for statistical segmentation.'}
                  </p>
                </div>
                <div className="pt-4 border-t border-border">
                  <h4 className="text-sm font-medium text-text-primary mb-4">Context Inputs</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-text-secondary mb-1.5">Business Intent <span className="text-danger">*</span></label>
                      <textarea value={alanBusinessIntent} onChange={(e) => setAlanBusinessIntent(e.target.value)}
                        placeholder="e.g., Find customers likely to churn in the next 30 days..."
                        className="w-full h-24 px-3 py-2.5 bg-surface-secondary border border-border rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-agent/50" />
                    </div>
                    <div>
                      <label className="block text-sm text-text-secondary mb-1.5">Channel <span className="text-danger">*</span></label>
                      <select value={alanChannel} onChange={(e) => setAlanChannel(e.target.value)}
                        className="w-full px-3 py-2.5 bg-surface-secondary border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-agent/50">
                        <option value="">Select channel...</option>
                        <option value="Online">Online</option>
                        <option value="Store">Store</option>
                        <option value="Omni">Omni</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-text-secondary mb-1.5">Time Window</label>
                      <input type="text" value={alanTimeWindow} onChange={(e) => setAlanTimeWindow(e.target.value)} placeholder="e.g., Last 90 days"
                        className="w-full px-3 py-2.5 bg-surface-secondary border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-agent/50" />
                    </div>
                  </div>
                </div>
                <Button variant="primary" className="w-full bg-agent hover:bg-agent/90" onClick={runAlan}
                  disabled={!alanMethod || !alanNature || !alanBusinessIntent || !alanChannel}>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Run Alan
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Alan Results Panel */}
      <AnimatePresence>
        {showAlanResults && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/40 z-[100]" onClick={() => setShowAlanResults(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-surface rounded-2xl shadow-xl z-[101] max-h-[90vh] overflow-y-auto">
              
              {/* Header */}
              <div className="p-6 border-b border-border flex items-center justify-between sticky top-0 bg-surface z-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-agent/10 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-agent" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-text-primary text-lg">Alan Generated Segment</h3>
                    <p className="text-sm text-text-secondary">Review the segment before saving</p>
                  </div>
                </div>
                <button onClick={() => setShowAlanResults(false)} className="p-2 hover:bg-surface-tertiary rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Segment Name */}
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">Segment Name</label>
                  <input 
                    type="text" 
                    value={alanGeneratedSegmentName} 
                    onChange={(e) => setAlanGeneratedSegmentName(e.target.value)}
                    className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-agent/50 focus:border-agent" 
                  />
                </div>

                {/* Segment Summary */}
                <div className="bg-surface-secondary rounded-xl p-5 space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-xs text-text-muted mb-1">Method</p>
                      <p className="font-medium text-text-primary">{alanMethod}</p>
                    </div>
                    <Badge variant="agent">{alanNature}</Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                    <div>
                      <p className="text-xs text-text-muted mb-1">Channel</p>
                      <p className="text-sm text-text-primary font-medium">{alanChannel}</p>
                    </div>
                    <div>
                      <p className="text-xs text-text-muted mb-1">Time Window</p>
                      <p className="text-sm text-text-primary font-medium">{alanTimeWindow || 'Not specified'}</p>
                    </div>
                  </div>
                </div>

                {/* Alan Insights */}
                <div>
                  <h4 className="text-sm font-medium text-text-primary mb-3 flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-agent" />
                    Alan's Insights
                  </h4>
                  <div className="space-y-3">
                    <div className="p-4 bg-agent/5 border border-agent/20 rounded-xl">
                      <p className="text-sm text-text-primary font-medium mb-1">Segment Definition</p>
                      <p className="text-sm text-text-secondary">
                        Based on your intent "{alanBusinessIntent}", Alan identified customers with high churn risk 
                        based on declining purchase frequency and reduced engagement in the last 60 days.
                      </p>
                    </div>
                    <div className="p-4 bg-surface-secondary rounded-xl">
                      <p className="text-sm text-text-primary font-medium mb-1">Key Characteristics</p>
                      <ul className="text-sm text-text-secondary space-y-1">
                        <li>• Last purchase: 45-90 days ago</li>
                        <li>• Purchase frequency dropped by 40%+</li>
                        <li>• Email engagement rate below 10%</li>
                        <li>• No app activity in last 30 days</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Estimated Size */}
                <div className="p-4 bg-info/5 border border-info/20 rounded-xl">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-info flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-text-primary">Estimated Segment Size</p>
                      <p className="text-xs text-text-secondary mt-1">
                        This segment contains approximately <strong>32,450 customers</strong> (8.2% of total customer base).
                      </p>
                    </div>
                  </div>
                </div>

                {/* Recommended Actions */}
                <div>
                  <h4 className="text-sm font-medium text-text-primary mb-3">Recommended Actions</h4>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1.5 bg-surface-tertiary rounded-lg text-xs text-text-secondary">Win-back Email Campaign</span>
                    <span className="px-3 py-1.5 bg-surface-tertiary rounded-lg text-xs text-text-secondary">Personalized Discount Offer</span>
                    <span className="px-3 py-1.5 bg-surface-tertiary rounded-lg text-xs text-text-secondary">Re-engagement Push Notification</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-6 border-t border-border flex gap-3">
                  <Button 
                    variant="ghost" 
                    className="flex-1 text-danger hover:bg-danger/10"
                    onClick={() => { setShowAlanResults(false); setShowAlanInsights(false) }}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Decline
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => { setShowAlanResults(false); setShowAlanPanel(true) }}
                  >
                    <Edit3 className="w-4 h-4 mr-2" />
                    Modify
                  </Button>
                  <Button 
                    variant="primary" 
                    className="flex-1 bg-agent hover:bg-agent/90"
                    onClick={() => { setShowAlanResults(false); setShowAlanInsights(false) }}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Save Segment
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Segment Details Drawer */}
      <AnimatePresence>
        {selectedSegment && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/20 z-40" onClick={() => setSelectedSegment(null)} />
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25 }}
              className="fixed right-0 top-0 h-full w-[480px] bg-surface border-l border-border z-50 shadow-xl overflow-y-auto">
              <div className="p-6 border-b border-border flex items-center justify-between sticky top-0 bg-surface">
                <h3 className="font-semibold text-text-primary text-lg">Segment Details</h3>
                <button onClick={() => setSelectedSegment(null)} className="p-2 hover:bg-surface-tertiary rounded-lg"><X className="w-5 h-5" /></button>
              </div>
              <div className="p-6 space-y-6">
                <div>
                  <h4 className="text-sm font-medium text-text-muted mb-3">Segment Overview</h4>
                  <Card className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-semibold text-text-primary text-lg">{selectedSegment.name}</p>
                        <p className="text-sm text-text-muted font-mono">{selectedSegment.id}</p>
                      </div>
                      <Badge variant={selectedSegment.status === 'Active' ? 'success' : 'default'}>{selectedSegment.status}</Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div><span className="text-text-muted">Created by:</span><div className="flex items-center gap-1 mt-0.5">{selectedSegment.createdBy === 'Alan' && <Sparkles className="w-3.5 h-3.5 text-agent" />}<span className="font-medium">{selectedSegment.createdBy}</span></div></div>
                      <div><span className="text-text-muted">Method:</span><div className="mt-0.5"><Badge variant={selectedSegment.segmentationMethod === 'Statistical' ? 'info' : 'default'}>{selectedSegment.segmentationMethod}</Badge></div></div>
                      <div><span className="text-text-muted">Nature:</span><div className="mt-0.5"><Badge variant={selectedSegment.segmentNature === 'Dynamic' ? 'success' : 'default'}>{selectedSegment.segmentNature}</Badge></div></div>
                      <div><span className="text-text-muted">Channel:</span><div className="font-medium mt-0.5">{selectedSegment.channel}</div></div>
                    </div>
                  </Card>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-text-muted mb-3">Logic Summary</h4>
                  <Card className="p-4">
                    <p className="text-sm text-text-secondary mb-3">{selectedSegment.definitionSummary}</p>
                    {selectedSegment.rules && (
                      <div>
                        <p className="text-xs font-medium text-text-muted mb-2">Rules:</p>
                        <ul className="space-y-1">{selectedSegment.rules.map((rule, i) => (<li key={i} className="text-sm text-text-secondary flex items-center gap-2"><Check className="w-3 h-3 text-success" />{rule}</li>))}</ul>
                      </div>
                    )}
                    {selectedSegment.features && (
                      <div>
                        <p className="text-xs font-medium text-text-muted mb-2">Features Used:</p>
                        <ul className="space-y-1">{selectedSegment.features.map((f, i) => (<li key={i} className="text-sm text-text-secondary flex items-center gap-2"><BarChart3 className="w-3 h-3 text-info" />{f}</li>))}</ul>
                      </div>
                    )}
                  </Card>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-text-muted mb-3">Estimated Size</h4>
                  <Card className="p-4">
                    <p className="text-2xl font-semibold text-text-primary">{formatNumber(selectedSegment.estimatedSize)}</p>
                    <p className="text-sm text-text-secondary">customers</p>
                    {selectedSegment.segmentNature === 'Dynamic' && (
                      <p className="text-xs text-text-muted mt-2 flex items-center gap-1"><Clock className="w-3 h-3" />Last refreshed: {selectedSegment.lastUpdated.toLocaleDateString()}</p>
                    )}
                  </Card>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-text-muted mb-3">Usage</h4>
                  <Card className="p-4">
                    <p className="text-lg font-semibold text-text-primary">{selectedSegment.campaignUsage}</p>
                    <p className="text-sm text-text-secondary">campaigns using this segment</p>
                  </Card>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-text-muted mb-3">Actions</h4>
                  <div className="flex flex-col gap-2">
                    <Button variant="outline" className="justify-start"><Edit3 className="w-4 h-4 mr-2" />Edit Segment</Button>
                    <Button variant="outline" className="justify-start"><Copy className="w-4 h-4 mr-2" />Duplicate Segment</Button>
                    <Button variant="outline" className="justify-start text-warning hover:text-warning"><Archive className="w-4 h-4 mr-2" />Archive Segment</Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
