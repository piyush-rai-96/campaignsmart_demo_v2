import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Palette, Sparkles, Check, Search, Image, Mail, Bell, X, Eye, RefreshCw, 
  Loader2, ArrowLeft, Settings, FileText, Type, Droplets, MessageSquare, 
  Shield, Clock, Plus, Filter, Upload, ChevronDown
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

// Brand Guidelines Data (mutable for demo)
const initialBrandGuidelines = {
  lastUpdatedBy: 'Sarah Chen',
  lastUpdatedAt: 'Dec 15, 2024',
  logo: {
    rules: [
      'Full color logo on white/light backgrounds',
      'White logo on dark/colored backgrounds',
      '24px height minimum',
      '1x logo height on all sides'
    ]
  },
  colors: [
    { name: 'Primary Blue', hex: '#2563EB', usage: 'CTAs, Links, Highlights' },
    { name: 'Success Green', hex: '#10B981', usage: 'Positive actions, Confirmations' },
    { name: 'Warning Orange', hex: '#F59E0B', usage: 'Alerts, Urgency' },
    { name: 'Neutral Dark', hex: '#1F2937', usage: 'Headlines, Body text' },
  ],
  typography: {
    headline: 'Inter Bold, 24-48px',
    subhead: 'Inter Semibold, 16-20px',
    body: 'Inter Regular, 14-16px',
    cta: 'Inter Semibold, 14-16px, ALL CAPS optional'
  },
  tone: [
    'Confident but not arrogant',
    'Helpful and approachable',
    'Clear and concise',
    'Action-oriented'
  ],
  compliance: [
    'No unsubstantiated claims',
    'Include required disclaimers for promotions',
    'Accessibility: WCAG 2.1 AA compliant',
    'No competitor mentions'
  ]
}

// Creative Campaigns Data with enhanced info
const creativeCampaigns = [
  { 
    id: 'CC-001', 
    name: 'Spring Collection Launch',
    linkedCampaigns: ['Summer Kickoff 2024'],
    linkedPromotions: ['20% Off New Arrivals'],
    category: 'Apparel',
    assetTypes: ['Banner', 'Email'],
    status: 'Approved',
    lastUpdated: 'Dec 14, 2024',
    assetCount: 6,
    thumbnail: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=400&h=300&fit=crop',
    products: [
      { name: 'Classic Denim Jacket', image: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=100&h=100&fit=crop' },
      { name: 'Spring Dress', image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=100&h=100&fit=crop' }
    ]
  },
  { 
    id: 'CC-002', 
    name: 'Holiday Flash Sale',
    linkedCampaigns: ['Holiday Push Q4'],
    linkedPromotions: ['Buy 1 Get 1 50%'],
    category: 'Seasonal',
    assetTypes: ['Banner', 'Push'],
    status: 'Needs Update',
    lastUpdated: 'Dec 12, 2024',
    assetCount: 4,
    thumbnail: 'https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?w=400&h=300&fit=crop',
    products: [
      { name: 'Holiday Gift Set', image: 'https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?w=100&h=100&fit=crop' }
    ]
  },
  { 
    id: 'CC-003', 
    name: 'Pet Apparel Promo',
    linkedCampaigns: ['Pet Lovers Campaign'],
    linkedPromotions: ['$20 Off Pet Items'],
    category: 'Pet Apparel',
    assetTypes: ['Banner', 'Email', 'Push'],
    status: 'Draft',
    lastUpdated: 'Dec 10, 2024',
    assetCount: 3,
    thumbnail: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400&h=300&fit=crop',
    products: [
      { name: 'Pet Winter Sweater', image: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=100&h=100&fit=crop' },
      { name: 'Pet Raincoat', image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=100&h=100&fit=crop' }
    ]
  },
  { 
    id: 'CC-004', 
    name: 'Accessories Bundle',
    linkedCampaigns: ['Accessory Focus'],
    linkedPromotions: ['Bundle & Save 25%'],
    category: 'Accessories',
    assetTypes: ['Banner'],
    status: 'Approved',
    lastUpdated: 'Dec 8, 2024',
    assetCount: 2,
    thumbnail: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&h=300&fit=crop',
    products: [
      { name: 'Gold Chain Necklace', image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=100&h=100&fit=crop' }
    ]
  },
]

// Agent update suggestions
const agentUpdateSuggestions = [
  { id: 'color', label: 'Add a new accent color', description: 'Suggest adding a coral accent (#FF6B6B) for seasonal campaigns' },
  { id: 'tone', label: 'Update tone guidelines', description: 'Add "Inclusive and welcoming" to tone of voice' },
  { id: 'typography', label: 'Add mobile typography', description: 'Include mobile-specific font sizes for better readability' },
  { id: 'compliance', label: 'Update compliance rules', description: 'Add GDPR consent language requirements' },
]

// Creative Assets for a campaign
const campaignAssets = [
  { id: 'asset-1', type: 'Banner', format: '16:9', channel: 'Web', status: 'Approved', agentNote: 'Created for homepage hero placement', thumbnail: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400&h=225&fit=crop', headline: '$20 OFF Pet Apparel!', subcopy: 'Exclusive offer for pet lovers' },
  { id: 'asset-2', type: 'Banner', format: '1:1', channel: 'Social', status: 'Approved', agentNote: 'Square format for Instagram feed', thumbnail: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400&h=400&fit=crop', headline: 'Cozy Up Your Pet', subcopy: 'Winter collection now available' },
  { id: 'asset-3', type: 'Banner', format: '4:5', channel: 'Social', status: 'Needs Update', agentNote: 'Stories format, needs CTA adjustment', thumbnail: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=320&h=400&fit=crop', headline: 'Limited Time Offer', subcopy: 'Shop pet sweaters today' },
  { id: 'asset-4', type: 'Email', format: '600px', channel: 'Email', status: 'Draft', agentNote: 'Email header banner', thumbnail: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=600&h=200&fit=crop', headline: 'Your Pet Deserves the Best', subcopy: 'New arrivals just dropped' },
]

// Regeneration steps
const regenerationSteps = [
  { label: 'Applying brand rules', icon: Shield },
  { label: 'Adjusting tone for selected audience', icon: MessageSquare },
  { label: 'Preserving approved messaging', icon: Check },
  { label: 'Regenerating selected assets', icon: RefreshCw },
]

type ViewMode = 'library' | 'review' | 'compare' | 'create'
type GuidelinesMode = 'view' | 'agent-update' | 'upload-json' | 'review-changes'
type CreateStep = 'details' | 'products' | 'brief' | 'generate' | 'preview'

// Mock products for selection
const availableProducts = [
  { id: 'prod-1', name: 'Pet Winter Sweater', category: 'Pet Apparel', price: 35.00, image: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=200&h=200&fit=crop' },
  { id: 'prod-2', name: 'Classic Denim Jacket', category: 'Apparel', price: 89.99, image: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=200&h=200&fit=crop' },
  { id: 'prod-3', name: 'Gold Chain Necklace', category: 'Accessories', price: 75.00, image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=200&h=200&fit=crop' },
  { id: 'prod-4', name: 'Running Sneakers Pro', category: 'Footwear', price: 129.00, image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&h=200&fit=crop' },
  { id: 'prod-5', name: 'Designer Sunglasses', category: 'Accessories', price: 95.00, image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=200&h=200&fit=crop' },
  { id: 'prod-6', name: 'Leather Crossbody Bag', category: 'Bags', price: 149.99, image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=200&h=200&fit=crop' },
]

// Available segments for selection
const availableSegments = [
  { id: 'seg-1', name: 'Budget Conscious', customers: 15400, description: 'Price-sensitive customers' },
  { id: 'seg-2', name: 'Trendsetters', customers: 8200, description: 'Early adopters of new styles' },
  { id: 'seg-3', name: 'Loyalists', customers: 5600, description: 'High lifetime value customers' },
  { id: 'seg-4', name: 'Pet Lovers', customers: 12300, description: 'Pet product enthusiasts' },
  { id: 'seg-5', name: 'Seasonal Shoppers', customers: 9800, description: 'Holiday and seasonal buyers' },
  { id: 'seg-6', name: 'Premium Buyers', customers: 4200, description: 'High-end product preference' },
]

// Available promotions for selection
const availablePromos = [
  { id: 'promo-1', name: '20% Off New Arrivals', type: 'Percentage', value: '20% OFF' },
  { id: 'promo-2', name: 'Buy 1 Get 1 50%', type: 'BOGO', value: 'BOGO 50%' },
  { id: 'promo-3', name: '$20 Off Pet Items', type: 'Fixed', value: '$20 OFF' },
  { id: 'promo-4', name: 'Free Shipping Over $50', type: 'Shipping', value: 'Free Ship' },
  { id: 'promo-5', name: '30% Off Clearance', type: 'Percentage', value: '30% OFF' },
  { id: 'promo-6', name: 'Bundle & Save 25%', type: 'Bundle', value: '25% OFF' },
]

// Banner generation steps
const bannerGenSteps = [
  { label: 'Analyzing product attributes', icon: Eye },
  { label: 'Applying brand guidelines', icon: Shield },
  { label: 'Generating headline variations', icon: Type },
  { label: 'Composing visual layouts', icon: Image },
  { label: 'Running compliance checks', icon: Check },
]

export function CreativeStudio() {
  const [viewMode, setViewMode] = useState<ViewMode>('library')
  const [selectedCampaign, setSelectedCampaign] = useState<typeof creativeCampaigns[0] | null>(null)
  const [selectedAssets, setSelectedAssets] = useState<string[]>([])
  
  // Brand guidelines state
  const [guidelinesExpanded, setGuidelinesExpanded] = useState(false)
  const [guidelinesMode, setGuidelinesMode] = useState<GuidelinesMode>('view')
  const [brandGuidelines, setBrandGuidelines] = useState(initialBrandGuidelines)
  const [pendingChanges, setPendingChanges] = useState<{field: string, oldValue: string, newValue: string}[]>([])
  const [selectedAgentSuggestion, setSelectedAgentSuggestion] = useState<string | null>(null)
  const [agentThinking, setAgentThinking] = useState(false)
  const [customUpdateInput, setCustomUpdateInput] = useState('')
  const [showWarningConfirm, setShowWarningConfirm] = useState(false)
  const [pendingUpdateAction, setPendingUpdateAction] = useState<{type: 'suggestion' | 'custom', value: string} | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Filters
  const [statusFilter, setStatusFilter] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [assetChannelFilter, setAssetChannelFilter] = useState('All')
  const [assetStatusFilter, setAssetStatusFilter] = useState('All')
  
  // Change intent state
  const [showChangeIntent, setShowChangeIntent] = useState(false)
  const [selectedIntents, setSelectedIntents] = useState<string[]>([])
  const [additionalDirection, setAdditionalDirection] = useState('')
  const [isRegenerating, setIsRegenerating] = useState(false)
  const [currentRegenStep, setCurrentRegenStep] = useState(0)
  const [_compareAsset, _setCompareAsset] = useState<typeof campaignAssets[0] | null>(null)
  
  // New Creative Campaign state
  const [createStep, setCreateStep] = useState<CreateStep>('details')
  const [newCampaignName, setNewCampaignName] = useState('')
  const [selectedSegment, setSelectedSegment] = useState('')
  const [segmentSearch, setSegmentSearch] = useState('')
  const [showSegmentDropdown, setShowSegmentDropdown] = useState(false)
  const [selectedPromo, setSelectedPromo] = useState('')
  const [promoSearch, setPromoSearch] = useState('')
  const [showPromoDropdown, setShowPromoDropdown] = useState(false)
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])
  const [bannerHeadline, setBannerHeadline] = useState('')
  const [bannerSubcopy, setBannerSubcopy] = useState('')
  const [bannerCta, setBannerCta] = useState('Shop Now')
  const [selectedFormats, setSelectedFormats] = useState<string[]>(['16:9', '1:1'])
  const [isGeneratingBanners, setIsGeneratingBanners] = useState(false)
  const [bannerGenStep, setBannerGenStep] = useState(0)
  const [generatedBanners, setGeneratedBanners] = useState<{id: string, format: string, approved: boolean}[]>([])

  const filteredCampaigns = creativeCampaigns.filter(campaign => {
    const matchesStatus = statusFilter === 'All' || campaign.status === statusFilter
    const matchesSearch = campaign.name.toLowerCase().includes(searchQuery.toLowerCase()) || campaign.id.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesStatus && matchesSearch
  })

  const filteredAssets = campaignAssets.filter(asset => {
    const matchesChannel = assetChannelFilter === 'All' || asset.channel === assetChannelFilter
    const matchesStatus = assetStatusFilter === 'All' || asset.status === assetStatusFilter
    return matchesChannel && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved': return 'bg-success/10 text-success border-success/20'
      case 'Needs Update': return 'bg-warning/10 text-warning border-warning/20'
      case 'Draft': return 'bg-blue-50 text-blue-600 border-blue-200'
      default: return 'bg-gray-100 text-gray-600 border-gray-200'
    }
  }

  const getAssetTypeIcon = (type: string) => {
    switch (type) { case 'Banner': return Image; case 'Email': return Mail; case 'Push': return Bell; default: return Image }
  }

  const initiateUpdate = (type: 'suggestion' | 'custom', value: string) => {
    setPendingUpdateAction({ type, value })
    setShowWarningConfirm(true)
  }

  const confirmAndProcessUpdate = () => {
    if (!pendingUpdateAction) return
    setShowWarningConfirm(false)
    
    if (pendingUpdateAction.type === 'suggestion') {
      setSelectedAgentSuggestion(pendingUpdateAction.value)
    }
    
    setAgentThinking(true)
    setTimeout(() => {
      setAgentThinking(false)
      
      if (pendingUpdateAction.type === 'suggestion') {
        const suggestionId = pendingUpdateAction.value
        if (suggestionId === 'color') {
          setPendingChanges([{ field: 'Color Palette', oldValue: '4 colors defined', newValue: '5 colors (added Coral #FF6B6B)' }])
        } else if (suggestionId === 'tone') {
          setPendingChanges([{ field: 'Tone of Voice', oldValue: '4 guidelines', newValue: '5 guidelines (added "Inclusive and welcoming")' }])
        } else if (suggestionId === 'typography') {
          setPendingChanges([{ field: 'Typography', oldValue: '4 type styles', newValue: '5 type styles (added Mobile Body: 16-18px)' }])
        } else if (suggestionId === 'compliance') {
          setPendingChanges([{ field: 'Compliance', oldValue: '4 rules', newValue: '5 rules (added GDPR consent language)' }])
        }
      } else {
        // Custom input - simulate Alan understanding the request
        setPendingChanges([{ field: 'Custom Update', oldValue: 'Current guidelines', newValue: `Updated based on: "${pendingUpdateAction.value}"` }])
      }
      
      setPendingUpdateAction(null)
      setCustomUpdateInput('')
      setGuidelinesMode('review-changes')
    }, 1500)
  }

  const cancelWarning = () => {
    setShowWarningConfirm(false)
    setPendingUpdateAction(null)
  }

  const handleJsonUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        try {
          JSON.parse(event.target?.result as string) // Validate JSON
          setPendingChanges([
            { field: 'Brand Guidelines', oldValue: 'Current configuration', newValue: 'Uploaded JSON configuration' }
          ])
          setGuidelinesMode('review-changes')
        } catch { alert('Invalid JSON file') }
      }
      reader.readAsText(file)
    }
  }

  const approveChanges = () => {
    // Get current date formatted
    const today = new Date()
    const formattedDate = today.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    
    // Update based on the type of change
    if (selectedAgentSuggestion === 'color') {
      setBrandGuidelines(prev => ({ 
        ...prev, 
        colors: [...prev.colors, { name: 'Coral Accent', hex: '#FF6B6B', usage: 'Seasonal highlights' }],
        lastUpdatedBy: 'You',
        lastUpdatedAt: formattedDate
      }))
    } else if (selectedAgentSuggestion === 'tone') {
      setBrandGuidelines(prev => ({ 
        ...prev, 
        tone: [...prev.tone, 'Inclusive and welcoming'],
        lastUpdatedBy: 'You',
        lastUpdatedAt: formattedDate
      }))
    } else if (selectedAgentSuggestion === 'typography') {
      setBrandGuidelines(prev => ({ 
        ...prev, 
        typography: { ...prev.typography, mobile: 'Inter Regular, 16-18px' },
        lastUpdatedBy: 'You',
        lastUpdatedAt: formattedDate
      }))
    } else if (selectedAgentSuggestion === 'compliance') {
      setBrandGuidelines(prev => ({ 
        ...prev, 
        compliance: [...prev.compliance, 'GDPR consent language required'],
        lastUpdatedBy: 'You',
        lastUpdatedAt: formattedDate
      }))
    } else {
      // Custom update - just update the date
      setBrandGuidelines(prev => ({ 
        ...prev, 
        lastUpdatedBy: 'You',
        lastUpdatedAt: formattedDate
      }))
    }
    
    setPendingChanges([])
    setSelectedAgentSuggestion(null)
    setGuidelinesMode('view')
  }

  const startRegeneration = () => {
    setIsRegenerating(true)
    setCurrentRegenStep(0)
    const interval = setInterval(() => {
      setCurrentRegenStep(prev => {
        if (prev >= regenerationSteps.length - 1) {
          clearInterval(interval)
          setTimeout(() => { setIsRegenerating(false); setShowChangeIntent(false); setSelectedIntents([]); setAdditionalDirection('') }, 800)
          return prev
        }
        return prev + 1
      })
    }, 1000)
  }

  // Reset create form
  const resetCreateForm = () => {
    setNewCampaignName('')
    setSelectedSegment('')
    setSegmentSearch('')
    setShowSegmentDropdown(false)
    setSelectedPromo('')
    setPromoSearch('')
    setShowPromoDropdown(false)
    setSelectedProducts([])
    setBannerHeadline('')
    setBannerSubcopy('')
    setBannerCta('Shop Now')
    setSelectedFormats(['16:9', '1:1'])
    setGeneratedBanners([])
    setBannerGenStep(0)
    setIsGeneratingBanners(false)
  }

  // Start banner generation
  const startBannerGeneration = () => {
    setIsGeneratingBanners(true)
    setBannerGenStep(0)
    const interval = setInterval(() => {
      setBannerGenStep(prev => {
        if (prev >= bannerGenSteps.length - 1) {
          clearInterval(interval)
          setTimeout(() => {
            setIsGeneratingBanners(false)
            setGeneratedBanners(selectedFormats.map((format, i) => ({ id: `gen-${i}`, format, approved: false })))
            setCreateStep('preview')
          }, 800)
          return prev
        }
        return prev + 1
      })
    }, 1000)
  }

  const toggleProductSelection = (productId: string) => {
    setSelectedProducts(prev => prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId])
  }

  const toggleFormatSelection = (format: string) => {
    setSelectedFormats(prev => prev.includes(format) ? prev.filter(f => f !== format) : [...prev, format])
  }

  const toggleBannerApprovalGen = (bannerId: string) => {
    setGeneratedBanners(prev => prev.map(b => b.id === bannerId ? { ...b, approved: !b.approved } : b))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-8 py-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-200">
              <Palette className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-slate-800">Creative Studio</h1>
              <p className="text-sm text-slate-500">All Creative Campaigns</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" className="border border-slate-200 hover:bg-slate-50" onClick={() => { setGuidelinesExpanded(!guidelinesExpanded); setGuidelinesMode('view') }}>
              <Settings className="w-4 h-4 mr-2" /> Update Brand Guidelines
            </Button>
            <Button 
              className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white shadow-lg shadow-violet-200"
              onClick={() => { setViewMode('create'); setCreateStep('details'); resetCreateForm() }}
            >
              <Plus className="w-4 h-4 mr-2" /> New Creative Campaign
            </Button>
          </div>
        </div>
      </header>

      {/* Brand Guidelines Panel */}
      <AnimatePresence>
        {guidelinesExpanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden border-b border-slate-100 bg-slate-50/50">
            <div className="px-8 py-5">
              {/* Header */}
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-slate-200 flex items-center justify-center">
                    <Shield className="w-3.5 h-3.5 text-slate-500" />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-slate-700">Brand Guidelines</h2>
                    <p className="text-xs text-slate-400">Last updated by {brandGuidelines.lastUpdatedBy} on {brandGuidelines.lastUpdatedAt}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {guidelinesMode === 'view' && (
                    <>
                      <Button variant="ghost" size="sm" className="text-violet-600 hover:bg-violet-50" onClick={() => setGuidelinesMode('agent-update')}>
                        <Sparkles className="w-4 h-4 mr-1" /> Ask Alan to Update
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => fileInputRef.current?.click()}>
                        <Upload className="w-4 h-4 mr-1" /> Upload JSON
                      </Button>
                      <input ref={fileInputRef} type="file" accept=".json" className="hidden" onChange={handleJsonUpload} />
                    </>
                  )}
                  {guidelinesMode === 'review-changes' && (
                    <>
                      <Button variant="ghost" size="sm" onClick={() => { setGuidelinesMode('view'); setPendingChanges([]) }}>Cancel</Button>
                      <Button size="sm" className="bg-gradient-to-r from-emerald-500 to-green-600 text-white" onClick={approveChanges}>
                        <Check className="w-4 h-4 mr-1" /> Approve Changes
                      </Button>
                    </>
                  )}
                  <button onClick={() => setGuidelinesExpanded(false)} className="p-1.5 hover:bg-slate-100 rounded-lg ml-2">
                    <X className="w-4 h-4 text-slate-400" />
                  </button>
                </div>
              </div>

              {/* Agent Update Mode */}
              {guidelinesMode === 'agent-update' && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
                  <div className="bg-gradient-to-r from-violet-50 to-purple-50 rounded-2xl p-6 border border-violet-100">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                        <Sparkles className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-800">What would you like Alan to update?</h3>
                        <p className="text-sm text-slate-500">Describe your changes or select a quick suggestion below</p>
                      </div>
                    </div>
                    
                    {agentThinking ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
                        <span className="ml-3 text-slate-600">Alan is preparing the update...</span>
                      </div>
                    ) : (
                      <>
                        {/* Custom Input Text Area */}
                        <div className="mb-6">
                          <label className="block text-sm font-medium text-slate-700 mb-2">Describe what you want to change</label>
                          <textarea
                            value={customUpdateInput}
                            onChange={(e) => setCustomUpdateInput(e.target.value)}
                            placeholder="e.g., Add a warmer color palette for holiday campaigns, update the tone to be more playful..."
                            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm resize-none h-24 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500"
                          />
                          <div className="flex items-center justify-between mt-2">
                            <p className="text-xs text-slate-400">Be specific about what you want Alan to change</p>
                            <Button 
                              size="sm" 
                              disabled={!customUpdateInput.trim()}
                              onClick={() => initiateUpdate('custom', customUpdateInput)}
                              className="bg-gradient-to-r from-violet-500 to-purple-600 text-white disabled:opacity-50"
                            >
                              <Sparkles className="w-3.5 h-3.5 mr-1.5" /> Ask Alan
                            </Button>
                          </div>
                        </div>

                        {/* Example Prompts */}
                        <div className="mb-6 p-4 bg-white/60 rounded-xl border border-violet-100">
                          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-3">Example prompts you can try:</p>
                          <div className="flex flex-wrap gap-2">
                            {[
                              'Add a coral accent color for seasonal campaigns',
                              'Make the tone more inclusive and welcoming',
                              'Add mobile-specific font sizes',
                              'Include GDPR consent requirements'
                            ].map((example, i) => (
                              <button
                                key={i}
                                onClick={() => setCustomUpdateInput(example)}
                                className="px-3 py-1.5 bg-white rounded-lg border border-slate-200 text-xs text-slate-600 hover:border-violet-300 hover:text-violet-600 transition-colors"
                              >
                                "{example}"
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Divider */}
                        <div className="flex items-center gap-4 mb-6">
                          <div className="flex-1 h-px bg-slate-200" />
                          <span className="text-xs text-slate-400 font-medium">OR SELECT A QUICK UPDATE</span>
                          <div className="flex-1 h-px bg-slate-200" />
                        </div>

                        {/* Quick Suggestions */}
                        <div className="grid grid-cols-2 gap-3">
                          {agentUpdateSuggestions.map(suggestion => (
                            <button key={suggestion.id} onClick={() => initiateUpdate('suggestion', suggestion.id)}
                              className="p-4 bg-white rounded-xl border border-slate-200 hover:border-violet-300 hover:shadow-md transition-all text-left group">
                              <p className="font-medium text-slate-800 group-hover:text-violet-600">{suggestion.label}</p>
                              <p className="text-xs text-slate-500 mt-1">{suggestion.description}</p>
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                    <button onClick={() => { setGuidelinesMode('view'); setCustomUpdateInput('') }} className="mt-4 text-sm text-slate-500 hover:text-slate-700">← Back to guidelines</button>
                  </div>
                </motion.div>
              )}

              {/* Warning Confirmation Modal */}
              {showWarningConfirm && (
                <motion.div 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-8"
                  onClick={cancelWarning}
                >
                  <motion.div 
                    initial={{ scale: 0.95, opacity: 0 }} 
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-6"
                    onClick={e => e.stopPropagation()}
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
                        <Shield className="w-6 h-6 text-amber-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-800">Confirm Brand Guidelines Update</h3>
                        <p className="text-sm text-slate-500">This will modify your brand guidelines</p>
                      </div>
                    </div>

                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
                      <div className="flex items-start gap-3">
                        <div className="w-5 h-5 rounded-full bg-amber-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-amber-700 text-xs font-bold">!</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-amber-800 mb-1">Warning</p>
                          <p className="text-xs text-amber-700">
                            Updating brand guidelines will affect all future creative assets. 
                            Existing approved assets will not be automatically updated. 
                            Please review the changes carefully before approving.
                          </p>
                        </div>
                      </div>
                    </div>

                    {pendingUpdateAction && (
                      <div className="bg-slate-50 rounded-xl p-4 mb-6">
                        <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">Requested Update</p>
                        <p className="text-sm text-slate-700">
                          {pendingUpdateAction.type === 'custom' 
                            ? `"${pendingUpdateAction.value}"`
                            : agentUpdateSuggestions.find(s => s.id === pendingUpdateAction.value)?.description
                          }
                        </p>
                      </div>
                    )}

                    <div className="flex gap-3">
                      <Button variant="ghost" className="flex-1" onClick={cancelWarning}>
                        Cancel
                      </Button>
                      <Button 
                        className="flex-1 bg-gradient-to-r from-violet-500 to-purple-600 text-white"
                        onClick={confirmAndProcessUpdate}
                      >
                        <Check className="w-4 h-4 mr-2" /> Confirm & Proceed
                      </Button>
                    </div>
                  </motion.div>
                </motion.div>
              )}

              {/* Review Changes Mode */}
              {guidelinesMode === 'review-changes' && pendingChanges.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
                  <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-2xl p-6 border border-emerald-100">
                    <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                      <Eye className="w-5 h-5 text-emerald-600" /> Review Proposed Changes
                    </h3>
                    <div className="space-y-3">
                      {pendingChanges.map((change, i) => (
                        <div key={i} className="bg-white rounded-xl p-4 border border-emerald-200">
                          <p className="text-sm font-medium text-slate-800 mb-2">{change.field}</p>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="p-3 bg-red-50 rounded-lg border border-red-100">
                              <p className="text-xs text-red-600 font-medium mb-1">Before</p>
                              <p className="text-sm text-slate-700">{change.oldValue}</p>
                            </div>
                            <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-100">
                              <p className="text-xs text-emerald-600 font-medium mb-1">After</p>
                              <p className="text-sm text-slate-700">{change.newValue}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Guidelines Grid */}
              {guidelinesMode === 'view' && (
                <div className="grid grid-cols-5 gap-3">
                  <div className="bg-white rounded-xl p-4 border border-slate-200/60 shadow-sm">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-5 h-5 rounded-md bg-slate-100 flex items-center justify-center"><Image className="w-3 h-3 text-slate-500" /></div>
                      <h3 className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Logo Usage</h3>
                    </div>
                    <ul className="space-y-1.5 text-xs text-slate-500">
                      {brandGuidelines.logo.rules.map((rule, i) => (<li key={i} className="flex items-start gap-1.5"><span className="text-slate-300 mt-0.5">•</span>{rule}</li>))}
                    </ul>
                  </div>
                  <div className="bg-white rounded-xl p-4 border border-slate-200/60 shadow-sm">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-5 h-5 rounded-md bg-slate-100 flex items-center justify-center"><Droplets className="w-3 h-3 text-slate-500" /></div>
                      <h3 className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Color Palette</h3>
                    </div>
                    <div className="space-y-2">
                      {brandGuidelines.colors.map(color => (
                        <div key={color.hex} className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded-full shadow-sm ring-1 ring-slate-200" style={{ backgroundColor: color.hex }} />
                          <span className="text-xs text-slate-500">{color.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-white rounded-xl p-4 border border-slate-200/60 shadow-sm">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-5 h-5 rounded-md bg-slate-100 flex items-center justify-center"><Type className="w-3 h-3 text-slate-500" /></div>
                      <h3 className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Typography</h3>
                    </div>
                    <ul className="space-y-1.5 text-xs text-slate-500">
                      <li><span className="text-slate-400">Headline:</span> {brandGuidelines.typography.headline}</li>
                      <li><span className="text-slate-400">Subhead:</span> {brandGuidelines.typography.subhead}</li>
                      <li><span className="text-slate-400">Body:</span> {brandGuidelines.typography.body}</li>
                      <li><span className="text-slate-400">CTA:</span> {brandGuidelines.typography.cta}</li>
                    </ul>
                  </div>
                  <div className="bg-white rounded-xl p-4 border border-slate-200/60 shadow-sm">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-5 h-5 rounded-md bg-slate-100 flex items-center justify-center"><MessageSquare className="w-3 h-3 text-slate-500" /></div>
                      <h3 className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Tone of Voice</h3>
                    </div>
                    <ul className="space-y-1.5 text-xs text-slate-500">
                      {brandGuidelines.tone.map((item, i) => (<li key={i} className="flex items-start gap-1.5"><span className="text-slate-300 mt-0.5">•</span>{item}</li>))}
                    </ul>
                  </div>
                  <div className="bg-white rounded-xl p-4 border border-slate-200/60 shadow-sm">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-5 h-5 rounded-md bg-slate-100 flex items-center justify-center"><Shield className="w-3 h-3 text-slate-500" /></div>
                      <h3 className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Compliance</h3>
                    </div>
                    <ul className="space-y-1.5 text-xs text-slate-500">
                      {brandGuidelines.compliance.map((item, i) => (<li key={i} className="flex items-start gap-1.5"><span className="text-slate-300 mt-0.5">•</span>{item}</li>))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="p-8">
        <AnimatePresence mode="wait">
          {/* Library View */}
          {viewMode === 'library' && (
            <motion.div key="library" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              {/* Filters */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search campaigns..."
                      className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm w-64 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 shadow-sm" />
                  </div>
                  <div className="relative">
                    <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
                      className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 appearance-none pr-10 shadow-sm">
                      <option value="All">All Status</option>
                      <option value="Approved">Approved</option>
                      <option value="Needs Update">Needs Update</option>
                      <option value="Draft">Draft</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>
                <p className="text-sm text-slate-500">{filteredCampaigns.length} creative campaigns</p>
              </div>

              {/* Campaigns Grid */}
              <div className="grid grid-cols-4 gap-6">
                {filteredCampaigns.map(campaign => (
                  <motion.div key={campaign.id} whileHover={{ y: -4 }} onClick={() => { setSelectedCampaign(campaign); setViewMode('review') }}
                    className="bg-white rounded-2xl border border-slate-200 overflow-hidden cursor-pointer hover:shadow-xl hover:border-violet-200 transition-all group">
                    {/* Thumbnail */}
                    <div className="aspect-[4/3] bg-slate-100 relative overflow-hidden">
                      <img src={campaign.thumbnail} alt={campaign.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                      <div className="absolute top-3 right-3">
                        <Badge className={cn('text-xs border shadow-sm', getStatusColor(campaign.status))}>{campaign.status}</Badge>
                      </div>
                      {/* Product thumbnails */}
                      <div className="absolute bottom-3 left-3 flex -space-x-2">
                        {campaign.products.slice(0, 3).map((product, i) => (
                          <img key={i} src={product.image} alt={product.name} className="w-8 h-8 rounded-lg border-2 border-white object-cover shadow-sm" />
                        ))}
                      </div>
                    </div>
                    {/* Content */}
                    <div className="p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-slate-400 font-mono">{campaign.id}</span>
                        <span className="text-xs text-violet-500 bg-violet-50 px-2 py-0.5 rounded-full">{campaign.category}</span>
                      </div>
                      <h3 className="font-semibold text-slate-800 mb-2 group-hover:text-violet-600 transition-colors">{campaign.name}</h3>
                      <div className="space-y-1 mb-3">
                        <p className="text-xs text-slate-500"><span className="text-slate-400">Campaign:</span> {campaign.linkedCampaigns[0]}</p>
                        <p className="text-xs text-slate-500"><span className="text-slate-400">Promo:</span> {campaign.linkedPromotions[0]}</p>
                      </div>
                      <div className="flex items-center gap-2 mb-3">
                        {campaign.assetTypes.map(type => {
                          const Icon = getAssetTypeIcon(type)
                          return (<div key={type} className="flex items-center gap-1 px-2 py-1 bg-slate-50 rounded-lg text-xs text-slate-600"><Icon className="w-3 h-3" />{type}</div>)
                        })}
                      </div>
                      <div className="flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-slate-100">
                        <span className="font-medium">{campaign.assetCount} assets</span>
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{campaign.lastUpdated}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Review Mode */}
          {viewMode === 'review' && selectedCampaign && (
            <motion.div key="review" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <button onClick={() => { setViewMode('library'); setSelectedCampaign(null) }} className="flex items-center gap-2 text-sm text-slate-500 hover:text-violet-600 mb-4">
                <ArrowLeft className="w-4 h-4" /> Back to Library
              </button>
              <div className="flex gap-6">
                {/* Left: Context */}
                <div className="w-80 flex-shrink-0">
                  <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm sticky top-6">
                    <h2 className="text-lg font-semibold text-slate-800 mb-4">Creative Context</h2>
                    <div className="space-y-4">
                      <div>
                        <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Campaign</p>
                        <p className="text-sm font-medium text-slate-800">{selectedCampaign.name}</p>
                        <p className="text-xs text-slate-500">{selectedCampaign.id}</p>
                      </div>
                      <div className="h-px bg-slate-100" />
                      <div>
                        <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Category</p>
                        <p className="text-sm text-slate-800">{selectedCampaign.category}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Products</p>
                        <div className="flex gap-2 mt-2">
                          {selectedCampaign.products.map((product, i) => (
                            <div key={i} className="text-center">
                              <img src={product.image} alt={product.name} className="w-12 h-12 rounded-lg object-cover border border-slate-200" />
                              <p className="text-xs text-slate-500 mt-1 truncate w-12">{product.name.split(' ')[0]}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="h-px bg-slate-100" />
                      <div>
                        <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Linked Campaign</p>
                        <p className="text-sm text-slate-800">{selectedCampaign.linkedCampaigns[0]}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Promotion</p>
                        <p className="text-sm text-slate-800">{selectedCampaign.linkedPromotions[0]}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Status</p>
                        <Badge className={cn('text-xs border', getStatusColor(selectedCampaign.status))}>{selectedCampaign.status}</Badge>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Right: Assets */}
                <div className="flex-1">
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
                    <div className="p-6 border-b border-slate-100">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h2 className="text-lg font-semibold text-slate-800">Creative Assets</h2>
                          <p className="text-sm text-slate-500">{filteredAssets.length} assets</p>
                        </div>
                        {selectedAssets.length > 0 && (
                          <Button className="bg-gradient-to-r from-violet-500 to-purple-600 text-white" onClick={() => setShowChangeIntent(true)}>
                            <Sparkles className="w-4 h-4 mr-2" /> Request Changes
                          </Button>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <Filter className="w-4 h-4 text-slate-400" />
                        <select value={assetChannelFilter} onChange={(e) => setAssetChannelFilter(e.target.value)} className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs">
                          <option value="All">All Channels</option><option value="Web">Web</option><option value="Social">Social</option><option value="Email">Email</option>
                        </select>
                        <select value={assetStatusFilter} onChange={(e) => setAssetStatusFilter(e.target.value)} className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs">
                          <option value="All">All Status</option><option value="Approved">Approved</option><option value="Needs Update">Needs Update</option><option value="Draft">Draft</option>
                        </select>
                      </div>
                    </div>
                    <div className="p-6 grid grid-cols-3 gap-4">
                      {filteredAssets.map(asset => {
                        const TypeIcon = getAssetTypeIcon(asset.type)
                        const isSelected = selectedAssets.includes(asset.id)
                        return (
                          <div key={asset.id} className={cn('bg-slate-50 rounded-xl overflow-hidden border-2 transition-all cursor-pointer', isSelected ? 'border-violet-500 shadow-lg' : 'border-transparent hover:border-violet-200')}>
                            <div className="relative aspect-video bg-slate-200">
                              <img src={asset.thumbnail} alt={asset.headline} className="w-full h-full object-cover" />
                              <button onClick={(e) => { e.stopPropagation(); setSelectedAssets(prev => prev.includes(asset.id) ? prev.filter(id => id !== asset.id) : [...prev, asset.id]) }}
                                className={cn('absolute top-2 left-2 w-6 h-6 rounded-md border-2 flex items-center justify-center', isSelected ? 'bg-violet-500 border-violet-500' : 'bg-white/90 border-slate-300')}>
                                {isSelected && <Check className="w-4 h-4 text-white" />}
                              </button>
                              <Badge className={cn('absolute top-2 right-2 text-xs border', getStatusColor(asset.status))}>{asset.status}</Badge>
                              <span className="absolute bottom-2 left-2 px-2 py-1 bg-black/70 text-white text-xs rounded">{asset.format}</span>
                            </div>
                            <div className="p-3">
                              <div className="flex items-center gap-2 mb-1">
                                <TypeIcon className="w-3.5 h-3.5 text-slate-400" />
                                <span className="text-xs text-slate-500">{asset.type} • {asset.channel}</span>
                              </div>
                              <h4 className="text-sm font-medium text-slate-800 mb-1">{asset.headline}</h4>
                              <p className="text-xs text-violet-600 flex items-start gap-1"><Sparkles className="w-3 h-3 mt-0.5" />{asset.agentNote}</p>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Create New Campaign View */}
          {viewMode === 'create' && (
            <motion.div key="create" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <button onClick={() => { setViewMode('library'); resetCreateForm() }} className="flex items-center gap-2 text-sm text-slate-500 hover:text-violet-600 mb-4">
                <ArrowLeft className="w-4 h-4" /> Back to Library
              </button>

              {/* Progress Steps */}
              <div className="flex items-center justify-center gap-2 mb-8">
                {['Details', 'Products', 'Brief', 'Generate', 'Preview'].map((step, i) => {
                  const steps: CreateStep[] = ['details', 'products', 'brief', 'generate', 'preview']
                  const currentIndex = steps.indexOf(createStep)
                  const stepIndex = i
                  const isCompleted = stepIndex < currentIndex
                  const isCurrent = stepIndex === currentIndex
                  return (
                    <div key={step} className="flex items-center">
                      <div className="flex items-center gap-2">
                        <div className={cn('w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium',
                          isCompleted ? 'bg-emerald-500 text-white' : isCurrent ? 'bg-violet-500 text-white' : 'bg-slate-200 text-slate-500')}>
                          {isCompleted ? <Check className="w-4 h-4" /> : stepIndex + 1}
                        </div>
                        <span className={cn('text-sm', isCurrent ? 'text-slate-800 font-medium' : 'text-slate-500')}>{step}</span>
                      </div>
                      {i < 4 && <div className={cn('w-12 h-0.5 mx-3', stepIndex < currentIndex ? 'bg-emerald-500' : 'bg-slate-200')} />}
                    </div>
                  )
                })}
              </div>

              {/* Step 1: Campaign Details */}
              {createStep === 'details' && (
                <div className="max-w-2xl mx-auto">
                  <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
                    <h2 className="text-xl font-semibold text-slate-800 mb-2">Campaign Details</h2>
                    <p className="text-slate-500 mb-6">Enter the basic information for your creative campaign</p>
                    
                    <div className="space-y-5">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Campaign Name *</label>
                        <input type="text" value={newCampaignName} onChange={e => setNewCampaignName(e.target.value)}
                          placeholder="e.g., Spring Collection Launch" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500" />
                      </div>
                      
                      {/* Segment Selection with Search */}
                      <div className="relative">
                        <label className="block text-sm font-medium text-slate-700 mb-2">Select Segment</label>
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 z-10" />
                          {selectedSegment && !segmentSearch ? (
                            <div 
                              onClick={() => { setSegmentSearch(''); setShowSegmentDropdown(true) }}
                              className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm cursor-pointer hover:border-violet-300"
                            >
                              <span className="text-slate-800">{availableSegments.find(s => s.id === selectedSegment)?.name}</span>
                            </div>
                          ) : (
                            <input 
                              type="text" 
                              value={segmentSearch}
                              onChange={e => { setSegmentSearch(e.target.value); setShowSegmentDropdown(true) }}
                              onFocus={() => setShowSegmentDropdown(true)}
                              placeholder="Search segments..."
                              className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500"
                            />
                          )}
                          {selectedSegment && (
                            <button onClick={() => { setSelectedSegment(''); setSegmentSearch('') }} className="absolute right-3 top-1/2 -translate-y-1/2 z-10">
                              <X className="w-4 h-4 text-slate-400 hover:text-slate-600" />
                            </button>
                          )}
                        </div>
                        {showSegmentDropdown && (
                          <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                            {availableSegments
                              .filter(seg => seg.name.toLowerCase().includes(segmentSearch.toLowerCase()) || seg.description.toLowerCase().includes(segmentSearch.toLowerCase()))
                              .map(segment => (
                                <button
                                  key={segment.id}
                                  onClick={() => { setSelectedSegment(segment.id); setSegmentSearch(''); setShowSegmentDropdown(false) }}
                                  className={cn('w-full px-4 py-3 text-left hover:bg-violet-50 flex items-center justify-between', selectedSegment === segment.id && 'bg-violet-50')}
                                >
                                  <div>
                                    <p className="text-sm font-medium text-slate-800">{segment.name}</p>
                                    <p className="text-xs text-slate-500">{segment.description}</p>
                                  </div>
                                  <span className="text-xs text-violet-600 font-medium">{segment.customers.toLocaleString()} customers</span>
                                </button>
                              ))}
                            {availableSegments.filter(seg => seg.name.toLowerCase().includes(segmentSearch.toLowerCase())).length === 0 && (
                              <p className="px-4 py-3 text-sm text-slate-500">No segments found</p>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Promotion Selection with Search */}
                      <div className="relative">
                        <label className="block text-sm font-medium text-slate-700 mb-2">Select Promotion</label>
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 z-10" />
                          {selectedPromo && !promoSearch ? (
                            <div 
                              onClick={() => { setPromoSearch(''); setShowPromoDropdown(true) }}
                              className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm cursor-pointer hover:border-violet-300"
                            >
                              <span className="text-slate-800">{availablePromos.find(p => p.id === selectedPromo)?.name}</span>
                            </div>
                          ) : (
                            <input 
                              type="text" 
                              value={promoSearch}
                              onChange={e => { setPromoSearch(e.target.value); setShowPromoDropdown(true) }}
                              onFocus={() => setShowPromoDropdown(true)}
                              placeholder="Search promotions..."
                              className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500"
                            />
                          )}
                          {selectedPromo && (
                            <button onClick={() => { setSelectedPromo(''); setPromoSearch('') }} className="absolute right-3 top-1/2 -translate-y-1/2 z-10">
                              <X className="w-4 h-4 text-slate-400 hover:text-slate-600" />
                            </button>
                          )}
                        </div>
                        {showPromoDropdown && (
                          <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                            {availablePromos
                              .filter(promo => promo.name.toLowerCase().includes(promoSearch.toLowerCase()) || promo.type.toLowerCase().includes(promoSearch.toLowerCase()))
                              .map(promo => (
                                <button
                                  key={promo.id}
                                  onClick={() => { setSelectedPromo(promo.id); setPromoSearch(''); setShowPromoDropdown(false) }}
                                  className={cn('w-full px-4 py-3 text-left hover:bg-violet-50 flex items-center justify-between', selectedPromo === promo.id && 'bg-violet-50')}
                                >
                                  <div>
                                    <p className="text-sm font-medium text-slate-800">{promo.name}</p>
                                    <p className="text-xs text-slate-500">{promo.type}</p>
                                  </div>
                                  <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-medium rounded">{promo.value}</span>
                                </button>
                              ))}
                            {availablePromos.filter(promo => promo.name.toLowerCase().includes(promoSearch.toLowerCase())).length === 0 && (
                              <p className="px-4 py-3 text-sm text-slate-500">No promotions found</p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-end mt-8">
                      <Button className="bg-gradient-to-r from-violet-500 to-purple-600 text-white" disabled={!newCampaignName.trim()} onClick={() => setCreateStep('products')}>
                        Continue to Products <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Select Products */}
              {createStep === 'products' && (
                <div className="max-w-4xl mx-auto">
                  <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
                    <h2 className="text-xl font-semibold text-slate-800 mb-2">Select Products</h2>
                    <p className="text-slate-500 mb-6">Choose products to feature in your banners ({selectedProducts.length} selected)</p>
                    
                    <div className="grid grid-cols-3 gap-4 mb-8">
                      {availableProducts.map(product => {
                        const isSelected = selectedProducts.includes(product.id)
                        return (
                          <div key={product.id} onClick={() => toggleProductSelection(product.id)}
                            className={cn('p-4 rounded-xl border-2 cursor-pointer transition-all', isSelected ? 'border-violet-500 bg-violet-50' : 'border-slate-200 hover:border-violet-200')}>
                            <div className="flex items-center gap-3">
                              <img src={product.image} alt={product.name} className="w-16 h-16 rounded-lg object-cover" />
                              <div className="flex-1">
                                <h4 className="font-medium text-slate-800">{product.name}</h4>
                                <p className="text-xs text-slate-500">{product.category}</p>
                                <p className="text-sm font-medium text-violet-600">${product.price.toFixed(2)}</p>
                              </div>
                              <div className={cn('w-6 h-6 rounded-full border-2 flex items-center justify-center', isSelected ? 'bg-violet-500 border-violet-500' : 'border-slate-300')}>
                                {isSelected && <Check className="w-4 h-4 text-white" />}
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>

                    <div className="flex justify-between">
                      <Button variant="ghost" onClick={() => setCreateStep('details')}><ArrowLeft className="w-4 h-4 mr-2" /> Back</Button>
                      <Button className="bg-gradient-to-r from-violet-500 to-purple-600 text-white" disabled={selectedProducts.length === 0} onClick={() => setCreateStep('brief')}>
                        Continue to Brief <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Creative Brief */}
              {createStep === 'brief' && (
                <div className="max-w-2xl mx-auto">
                  <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
                    <h2 className="text-xl font-semibold text-slate-800 mb-2">Creative Brief</h2>
                    <p className="text-slate-500 mb-6">Define your banner content and select formats</p>
                    
                    <div className="space-y-5 mb-8">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Headline *</label>
                        <input type="text" value={bannerHeadline} onChange={e => setBannerHeadline(e.target.value)}
                          placeholder="e.g., Spring Sale - 20% OFF!" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Subcopy</label>
                        <textarea value={bannerSubcopy} onChange={e => setBannerSubcopy(e.target.value)}
                          placeholder="e.g., Limited time offer on selected items" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm resize-none h-20" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Call to Action</label>
                        <input type="text" value={bannerCta} onChange={e => setBannerCta(e.target.value)}
                          placeholder="Shop Now" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-3">Banner Formats</label>
                        <div className="flex flex-wrap gap-3">
                          {['16:9', '1:1', '4:5', '9:16', '728x90'].map(format => (
                            <button key={format} onClick={() => toggleFormatSelection(format)}
                              className={cn('px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all',
                                selectedFormats.includes(format) ? 'border-violet-500 bg-violet-50 text-violet-600' : 'border-slate-200 text-slate-600 hover:border-violet-200')}>
                              {format}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between">
                      <Button variant="ghost" onClick={() => setCreateStep('products')}><ArrowLeft className="w-4 h-4 mr-2" /> Back</Button>
                      <Button className="bg-gradient-to-r from-violet-500 to-purple-600 text-white" disabled={!bannerHeadline.trim() || selectedFormats.length === 0} onClick={() => { setCreateStep('generate'); startBannerGeneration() }}>
                        <Sparkles className="w-4 h-4 mr-2" /> Generate Banners
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Generating */}
              {createStep === 'generate' && isGeneratingBanners && (
                <div className="max-w-md mx-auto">
                  <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm text-center">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mx-auto mb-4">
                      <Sparkles className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-xl font-semibold text-slate-800 mb-2">Generating Banners...</h2>
                    <p className="text-slate-500 mb-6">Alan is creating {selectedFormats.length} banner variations</p>
                    
                    <div className="bg-slate-50 rounded-xl p-5 space-y-4 text-left">
                      {bannerGenSteps.map((step, i) => (
                        <div key={i} className={cn('flex items-center gap-3', i <= bannerGenStep ? 'opacity-100' : 'opacity-40')}>
                          <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', i < bannerGenStep ? 'bg-emerald-100' : i === bannerGenStep ? 'bg-violet-100' : 'bg-slate-100')}>
                            {i < bannerGenStep ? <Check className="w-4 h-4 text-emerald-600" /> : i === bannerGenStep ? <Loader2 className="w-4 h-4 text-violet-600 animate-spin" /> : <step.icon className="w-4 h-4 text-slate-400" />}
                          </div>
                          <span className={cn('text-sm', i < bannerGenStep ? 'text-emerald-600' : i === bannerGenStep ? 'text-slate-800' : 'text-slate-400')}>{i < bannerGenStep ? '✓ ' : ''}{step.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 5: Preview & Approve */}
              {createStep === 'preview' && (
                <div className="max-w-5xl mx-auto">
                  <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h2 className="text-xl font-semibold text-slate-800">Review Generated Banners</h2>
                        <p className="text-slate-500">{generatedBanners.filter(b => b.approved).length} of {generatedBanners.length} approved</p>
                      </div>
                      <Button variant="ghost" onClick={() => setGeneratedBanners(prev => prev.map(b => ({ ...b, approved: true })))}>
                        <Check className="w-4 h-4 mr-2" /> Approve All
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-6 mb-8">
                      {generatedBanners.map(banner => {
                        const product = availableProducts.find(p => p.id === selectedProducts[0])
                        return (
                          <div key={banner.id} className={cn('rounded-xl border-2 overflow-hidden transition-all', banner.approved ? 'border-emerald-500' : 'border-slate-200')}>
                            <div className={cn('relative bg-gradient-to-br from-slate-100 to-slate-50', banner.format === '16:9' ? 'aspect-video' : banner.format === '1:1' ? 'aspect-square' : 'aspect-[4/5]')}>
                              <div className="absolute top-2 left-2"><span className="px-2 py-1 bg-black/70 text-white text-xs rounded">{banner.format}</span></div>
                              <div className="absolute top-2 right-2">
                                {selectedPromo && <span className="px-2 py-1 bg-emerald-500 text-white text-xs rounded font-medium">{availablePromos.find(p => p.id === selectedPromo)?.value}</span>}
                              </div>
                              <div className="h-full flex flex-col items-center justify-center p-4">
                                {product && <img src={product.image} alt={product.name} className="w-20 h-20 rounded-lg object-cover mb-3" />}
                                <h3 className="text-sm font-bold text-slate-800 text-center">{bannerHeadline || 'Your Headline'}</h3>
                                <p className="text-xs text-slate-500 text-center mt-1">{bannerSubcopy || 'Your subcopy here'}</p>
                                <button className="mt-3 px-4 py-1.5 bg-slate-800 text-white text-xs rounded-lg">{bannerCta}</button>
                              </div>
                            </div>
                            <div className="p-3 flex items-center justify-between">
                              <span className="text-xs text-slate-500">Banner {banner.format}</span>
                              <Button size="sm" variant="ghost"
                                className={banner.approved ? 'bg-emerald-500 hover:bg-emerald-600 text-white' : 'border border-slate-200'}
                                onClick={() => toggleBannerApprovalGen(banner.id)}>
                                <Check className="w-3 h-3 mr-1" /> {banner.approved ? 'Approved' : 'Approve'}
                              </Button>
                            </div>
                          </div>
                        )
                      })}
                    </div>

                    <div className="flex justify-between">
                      <Button variant="ghost" onClick={() => { setCreateStep('brief'); setGeneratedBanners([]) }}><ArrowLeft className="w-4 h-4 mr-2" /> Back to Brief</Button>
                      <Button className="bg-gradient-to-r from-emerald-500 to-green-600 text-white" disabled={generatedBanners.filter(b => b.approved).length === 0} onClick={() => { setViewMode('library'); resetCreateForm() }}>
                        <Check className="w-4 h-4 mr-2" /> Save Campaign
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Change Intent Modal */}
      <AnimatePresence>
        {showChangeIntent && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-8" onClick={() => setShowChangeIntent(false)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="bg-white rounded-2xl w-full max-w-xl shadow-2xl" onClick={e => e.stopPropagation()}>
              {!isRegenerating ? (
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-slate-800">What would you like to change?</h2>
                      <p className="text-sm text-slate-500">{selectedAssets.length} assets selected</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3 mb-6">
                    {[{id:'headline',label:'Headline / Copy',icon:Type},{id:'visual',label:'Visual Style',icon:Image},{id:'cta',label:'Call to Action',icon:MessageSquare},{id:'tone',label:'Tone',icon:FileText},{id:'offer',label:'Offer Emphasis',icon:Sparkles},{id:'format',label:'Format / Size',icon:Filter}].map(opt => (
                      <button key={opt.id} onClick={() => setSelectedIntents(prev => prev.includes(opt.id) ? prev.filter(i => i !== opt.id) : [...prev, opt.id])}
                        className={cn('p-4 rounded-xl border-2 text-left transition-all', selectedIntents.includes(opt.id) ? 'border-violet-500 bg-violet-50' : 'border-slate-200 hover:border-violet-200')}>
                        <opt.icon className={cn('w-5 h-5 mb-2', selectedIntents.includes(opt.id) ? 'text-violet-600' : 'text-slate-400')} />
                        <p className={cn('text-sm font-medium', selectedIntents.includes(opt.id) ? 'text-violet-600' : 'text-slate-700')}>{opt.label}</p>
                      </button>
                    ))}
                  </div>
                  <textarea value={additionalDirection} onChange={e => setAdditionalDirection(e.target.value)} placeholder="Add specific direction for Alan..." className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm resize-none h-20 mb-6" />
                  <div className="flex justify-end gap-3">
                    <Button variant="ghost" onClick={() => setShowChangeIntent(false)}>Cancel</Button>
                    <Button className="bg-gradient-to-r from-violet-500 to-purple-600 text-white" disabled={selectedIntents.length === 0} onClick={startRegeneration}>
                      <Sparkles className="w-4 h-4 mr-2" /> Regenerate
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-xl font-semibold text-slate-800 mb-6">Regenerating Assets...</h2>
                  <div className="bg-slate-50 rounded-xl p-5 space-y-4 text-left">
                    {regenerationSteps.map((step, i) => (
                      <div key={i} className={cn('flex items-center gap-3', i <= currentRegenStep ? 'opacity-100' : 'opacity-40')}>
                        <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', i < currentRegenStep ? 'bg-emerald-100' : i === currentRegenStep ? 'bg-violet-100' : 'bg-slate-100')}>
                          {i < currentRegenStep ? <Check className="w-4 h-4 text-emerald-600" /> : i === currentRegenStep ? <Loader2 className="w-4 h-4 text-violet-600 animate-spin" /> : <step.icon className="w-4 h-4 text-slate-400" />}
                        </div>
                        <span className={cn('text-sm', i < currentRegenStep ? 'text-emerald-600' : i === currentRegenStep ? 'text-slate-800' : 'text-slate-400')}>{i < currentRegenStep ? '✓ ' : ''}{step.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
