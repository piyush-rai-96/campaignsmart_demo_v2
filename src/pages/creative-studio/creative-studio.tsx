import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Palette, Sparkles, Check, ChevronRight, RotateCcw, Search, 
  Grid3X3, List, Users, Heart, TrendingUp, Package, X, Download, Edit3,
  CheckCircle, Loader2, ArrowLeft
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

// Mock SKU data with actual product images
const mockSKUs = [
  { id: 'SKU-007', name: 'Pet Winter Sweater', category: 'Pet Apparel', price: 35.00, status: 'Overstock', image: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400&h=400&fit=crop', emoji: '🐕', tags: ['New Arrival'] },
  { id: 'SKU-004', name: 'Gold Chain Necklace', category: 'Jewelry & Watches', price: 75.00, status: 'Overstock', image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&h=400&fit=crop', emoji: '📿', tags: ['Best Seller'] },
  { id: 'SKU-008', name: 'Hiking Backpack', category: 'Outdoor & Active', price: 79.00, status: 'In Stock', image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop', emoji: '🎒', tags: ['Best Seller'] },
  { id: 'SKU-001', name: 'Classic Denim Jacket', category: 'Apparel', price: 89.99, status: 'In Stock', image: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=400&h=400&fit=crop', emoji: '🧥', tags: ['Best Seller', 'Trending'] },
  { id: 'SKU-006', name: 'Designer Sunglasses', category: 'Accessories', price: 95.00, status: 'In Stock', image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&h=400&fit=crop', emoji: '🕶️', tags: ['High Margin', 'Trending'] },
  { id: 'SKU-003', name: 'Running Sneakers Pro', category: 'Footwear', price: 129.00, status: 'In Stock', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop', emoji: '👟', tags: ['Trending', 'Best Seller'] },
  { id: 'SKU-002', name: 'Leather Crossbody Bag', category: 'Bags & Travel', price: 149.99, status: 'Low', image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&h=400&fit=crop', emoji: '👜', tags: ['High Margin', 'New Arrival'] },
  { id: 'SKU-005', name: 'Winter Puffer Jacket', category: 'Cold Weather', price: 189.00, status: 'In Stock', image: 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=400&h=400&fit=crop', emoji: '🧥', tags: ['Seasonal Styles'] },
]

// Mock Segments
const mockSegments = [
  { id: 'seg-1', name: 'Budget Conscious', customers: 15400, description: 'Price-sensitive customers who respond well to discounts and free shipping.', traits: ['High discount sensitivity', 'Low AOV', 'Frequency: Monthly'], match: 65, icon: Users, color: 'text-primary' },
  { id: 'seg-2', name: 'Trendsetters', customers: 8200, description: 'Early adopters looking for the latest styles and products.', traits: ['High new arrival engagement', 'Social media driven', 'High return rate'], match: 92, icon: TrendingUp, color: 'text-agent', recommended: true },
  { id: 'seg-3', name: 'Loyalists', customers: 5600, description: 'Repeat customers with high lifetime value.', traits: ['High AOV', 'Low churn risk', 'Brand advocate'], match: 88, icon: Heart, color: 'text-danger' },
]

// Mock Promotions
const mockPromotions = [
  { id: 'promo-1', name: 'New Arrival Special', type: 'Fixed Amount', value: '$20 OFF', duration: '3 Days', marginImpact: 'Low Margin Impact', revenue: '+8% Revenue', insight: 'Great for driving trial of new products without deep discounting.', recommended: true, rank: 1 },
  { id: 'promo-2', name: 'Bundle & Save', type: 'BOGO', value: 'Buy 1 Get 1 50% Off', duration: 'Weekend', marginImpact: 'Medium Margin Impact', revenue: '+12% Revenue', insight: 'Inventory Depletion', rank: 2 },
  { id: 'promo-3', name: 'Flash Sale', type: 'Percentage', value: '25% OFF', duration: '24 Hours', marginImpact: 'High Margin Impact', revenue: '+15% Revenue', insight: 'Creates urgency and drives immediate action.', rank: 3 },
]

// Generation steps
const generationSteps = [
  { label: 'Analyzing SKU attributes and inventory levels', done: false },
  { label: 'Matching with customer segment behaviors', done: false },
  { label: 'Applying promotion rules and constraints', done: false },
  { label: 'Generating headline and copy variations', done: false },
  { label: 'Composing visual layouts and designs', subtext: 'Arranging product imagery and brand elements', done: false },
  { label: 'Optimizing for channel specifications', done: false },
  { label: 'Running brand compliance checks', done: false },
]

// Mock generated banners
const mockBanners = [
  { id: 'banner-1', ratio: '16:9', style: 'Bold & Dynamic', brandSafe: 94, engagement: 95, tags: ['Brand Safe', 'Top Performer', 'Recommended'], approved: false },
  { id: 'banner-2', ratio: '1:1', style: 'Clean & Modern', brandSafe: 95, engagement: 88, tags: ['Brand Safe', 'High Engagement'], approved: false },
  { id: 'banner-3', ratio: '4:5', style: 'Vibrant & Eye-catching', brandSafe: 96, engagement: 91, tags: ['Brand Safe', 'Social Optimized'], approved: false },
]

const wizardSteps = ['Filters', 'SKUs', 'Segment', 'Promo', 'Brief', 'Generate', 'Review']

export function CreativeStudio() {
  const [currentStep, setCurrentStep] = useState(1)
  
  // Filter state
  const [channelFilter, setChannelFilter] = useState('All Channels')
  const [seasonFilter, setSeasonFilter] = useState('All Seasons')
  const [categoryFilter, setCategoryFilter] = useState('All Categories')
  const [offerTypeFilter, setOfferTypeFilter] = useState('All Types')
  
  // Selection state
  const [selectedSKUs, setSelectedSKUs] = useState<string[]>([])
  const [selectedSegment, setSelectedSegment] = useState<string | null>(null)
  const [selectedPromotion, setSelectedPromotion] = useState<string | null>(null)
  
  // Brief state
  const [headline, setHeadline] = useState('$20 OFF on Pet Apparel!')
  const [subcopy, setSubcopy] = useState('Exclusive offer for our budget conscious. Shop Pet Winter Sweater and more.')
  const [cta, setCta] = useState('Shop Now')
  const [additionalInput, setAdditionalInput] = useState('')
  
  // Generation state
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationProgress, setGenerationProgress] = useState(0)
  const [currentGenStep, setCurrentGenStep] = useState(0)
  
  // Banner state
  const [banners, setBanners] = useState(mockBanners)
  
  // View state
  const [skuView, setSkuView] = useState<'list' | 'grid'>('list')
  const [skuSearch, setSkuSearch] = useState('')
  const [skuTagFilter, setSkuTagFilter] = useState<string | null>(null)

  const filteredSKUs = mockSKUs.filter(sku => {
    const matchesSearch = sku.name.toLowerCase().includes(skuSearch.toLowerCase()) || sku.id.toLowerCase().includes(skuSearch.toLowerCase())
    const matchesTag = !skuTagFilter || sku.tags.includes(skuTagFilter)
    return matchesSearch && matchesTag
  })

  const toggleSKU = (skuId: string) => {
    setSelectedSKUs(prev => prev.includes(skuId) ? prev.filter(id => id !== skuId) : [...prev, skuId])
  }

  const startGeneration = () => {
    setIsGenerating(true)
    setGenerationProgress(0)
    setCurrentGenStep(0)
    
    const interval = setInterval(() => {
      setGenerationProgress(prev => {
        const newProgress = prev + Math.random() * 15
        if (newProgress >= 100) {
          clearInterval(interval)
          setTimeout(() => {
            setIsGenerating(false)
            setCurrentStep(7)
          }, 500)
          return 100
        }
        return newProgress
      })
      setCurrentGenStep(prev => Math.min(prev + 1, generationSteps.length - 1))
    }, 1200)
  }

  const toggleBannerApproval = (bannerId: string) => {
    setBanners(prev => prev.map(b => b.id === bannerId ? { ...b, approved: !b.approved } : b))
  }

  const approvedCount = banners.filter(b => b.approved).length

  const resetFilters = () => {
    setChannelFilter('All Channels')
    setSeasonFilter('All Seasons')
    setCategoryFilter('All Categories')
    setOfferTypeFilter('All Types')
  }

  const selectedSegmentData = mockSegments.find(s => s.id === selectedSegment)
  const selectedPromoData = mockPromotions.find(p => p.id === selectedPromotion)

  return (
    <div className="min-h-screen bg-surface-secondary">
      {/* Header */}
      <header className="bg-surface border-b border-border px-8 py-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Palette className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-text-primary">Campaign Asset Generator</h1>
              <p className="text-sm text-text-secondary">Create AI-powered promotional banners and creatives</p>
            </div>
          </div>
        </div>
      </header>

      {/* Progress Steps - Only show after step 1 */}
      {currentStep > 1 && (
        <div className="bg-surface border-b border-border px-8 py-4">
          <div className="flex items-center justify-center gap-2">
            {wizardSteps.map((step, index) => {
              const stepNum = index + 1
              const isCompleted = stepNum < currentStep
              const isCurrent = stepNum === currentStep
              return (
                <div key={step} className="flex items-center">
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      'w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium transition-colors',
                      isCompleted ? 'bg-success text-white' : isCurrent ? 'bg-primary text-white' : 'bg-surface-tertiary text-text-muted'
                    )}>
                      {isCompleted ? <Check className="w-3.5 h-3.5" /> : stepNum}
                    </div>
                    <span className={cn('text-sm', isCurrent ? 'text-text-primary font-medium' : 'text-text-muted')}>{step}</span>
                  </div>
                  {index < wizardSteps.length - 1 && (
                    <div className={cn('w-8 h-0.5 mx-2', stepNum < currentStep ? 'bg-success' : 'bg-border')} />
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="p-8">
        <AnimatePresence mode="wait">
          {/* Step 1: Global Filters */}
          {currentStep === 1 && (
            <motion.div key="filters" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="max-w-5xl mx-auto">
              <div className="bg-surface rounded-2xl border border-border p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-text-primary">Global Filters</h2>
                  <button onClick={resetFilters} className="flex items-center gap-1.5 text-sm text-text-secondary hover:text-primary">
                    <RotateCcw className="w-4 h-4" /> Reset
                  </button>
                </div>
                
                <div className="grid grid-cols-4 gap-4 mb-6">
                  <div>
                    <label className="block text-xs text-text-muted mb-1.5">Channel</label>
                    <select value={channelFilter} onChange={(e) => setChannelFilter(e.target.value)}
                      className="w-full px-3 py-2.5 bg-surface border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
                      <option>All Channels</option>
                      <option>Online</option>
                      <option>Store</option>
                      <option>Omni</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-text-muted mb-1.5">Season</label>
                    <select value={seasonFilter} onChange={(e) => setSeasonFilter(e.target.value)}
                      className="w-full px-3 py-2.5 bg-surface border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
                      <option>All Seasons</option>
                      <option>Spring</option>
                      <option>Summer</option>
                      <option>Fall</option>
                      <option>Winter</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-text-muted mb-1.5">Category</label>
                    <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}
                      className="w-full px-3 py-2.5 bg-surface border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
                      <option>All Categories</option>
                      <option>Apparel</option>
                      <option>Footwear</option>
                      <option>Accessories</option>
                      <option>Outdoor</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-text-muted mb-1.5">Offer Type</label>
                    <select value={offerTypeFilter} onChange={(e) => setOfferTypeFilter(e.target.value)}
                      className="w-full px-3 py-2.5 bg-surface border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
                      <option>All Types</option>
                      <option>Percentage</option>
                      <option>Fixed Amount</option>
                      <option>BOGO</option>
                    </select>
                  </div>
                </div>

                <div className="p-4 bg-primary/5 rounded-xl flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Package className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-text-primary">All items selected</p>
                    <p className="text-xs text-text-secondary">{mockSKUs.length} SKUs available</p>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button variant="primary" onClick={() => setCurrentStep(2)}>
                    Continue to SKU Selection <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 2: SKU Selection */}
          {currentStep === 2 && (
            <motion.div key="skus" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="max-w-6xl mx-auto">
              <div className="bg-surface rounded-2xl border border-border">
                <div className="p-6 border-b border-border">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-xl font-semibold text-text-primary">Select SKUs</h2>
                      <p className="text-sm text-text-secondary">{selectedSKUs.length}/{mockSKUs.length} selected • {mockSKUs.length} available</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button onClick={() => setSelectedSKUs(mockSKUs.map(s => s.id))} className="text-sm text-primary hover:underline">Select All</button>
                      <button onClick={() => setSelectedSKUs([])} className="text-sm text-text-secondary hover:underline">Clear All</button>
                      <div className="flex border border-border rounded-lg overflow-hidden">
                        <button onClick={() => setSkuView('list')} className={cn('p-2', skuView === 'list' ? 'bg-primary text-white' : 'bg-surface text-text-muted')}>
                          <List className="w-4 h-4" />
                        </button>
                        <button onClick={() => setSkuView('grid')} className={cn('p-2', skuView === 'grid' ? 'bg-primary text-white' : 'bg-surface text-text-muted')}>
                          <Grid3X3 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                      <input type="text" value={skuSearch} onChange={(e) => setSkuSearch(e.target.value)}
                        placeholder="Search SKU ID, name, category..."
                        className="w-full pl-10 pr-4 py-2.5 bg-surface-secondary border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                    </div>
                    <div className="flex gap-2">
                      {['Best Seller', 'New Arrival', 'High Margin', 'Clearance', 'Trending'].map(tag => (
                        <button key={tag} onClick={() => setSkuTagFilter(skuTagFilter === tag ? null : tag)}
                          className={cn('px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
                            skuTagFilter === tag ? 'bg-primary text-white' : 'bg-surface-secondary text-text-secondary hover:bg-surface-tertiary')}>
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="max-h-[400px] overflow-y-auto">
                  <table className="w-full">
                    <thead className="bg-surface-secondary sticky top-0">
                      <tr className="text-xs text-text-muted uppercase">
                        <th className="text-left p-4 w-12"></th>
                        <th className="text-left p-4">Image</th>
                        <th className="text-left p-4">SKU ID</th>
                        <th className="text-left p-4">Product Name</th>
                        <th className="text-left p-4">Category</th>
                        <th className="text-left p-4">Price</th>
                        <th className="text-left p-4">Status</th>
                        <th className="text-left p-4">Tags</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredSKUs.map(sku => (
                        <tr key={sku.id} className={cn('border-b border-border hover:bg-surface-secondary cursor-pointer', selectedSKUs.includes(sku.id) && 'bg-primary/5')}
                          onClick={() => toggleSKU(sku.id)}>
                          <td className="p-4">
                            <div className={cn('w-5 h-5 rounded border-2 flex items-center justify-center',
                              selectedSKUs.includes(sku.id) ? 'bg-primary border-primary' : 'border-border')}>
                              {selectedSKUs.includes(sku.id) && <Check className="w-3 h-3 text-white" />}
                            </div>
                          </td>
                          <td className="p-4">
                            <img src={sku.image} alt={sku.name} className="w-10 h-10 rounded-lg object-cover" />
                          </td>
                          <td className="p-4 text-sm text-text-secondary">{sku.id}</td>
                          <td className="p-4 text-sm font-medium text-text-primary">{sku.name}</td>
                          <td className="p-4 text-sm text-text-secondary">{sku.category}</td>
                          <td className="p-4 text-sm text-text-primary">${sku.price.toFixed(2)}</td>
                          <td className="p-4">
                            <span className={cn('text-sm', sku.status === 'In Stock' ? 'text-success' : sku.status === 'Low' ? 'text-warning' : 'text-danger')}>
                              {sku.status}
                            </span>
                          </td>
                          <td className="p-4">
                            <div className="flex gap-1.5">
                              {sku.tags.map(tag => (
                                <span key={tag} className="px-2 py-0.5 bg-surface-tertiary rounded text-xs text-text-secondary">{tag}</span>
                              ))}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="p-6 border-t border-border flex justify-between">
                  <Button variant="ghost" onClick={() => setCurrentStep(1)}>
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back
                  </Button>
                  <Button variant="primary" disabled={selectedSKUs.length === 0} onClick={() => setCurrentStep(3)}>
                    Continue to Segment <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 3: Segment Selection */}
          {currentStep === 3 && (
            <motion.div key="segment" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="max-w-4xl mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-semibold text-text-primary mb-2">Select Target Segment</h2>
                <p className="text-text-secondary">Choose the customer segment that best matches your campaign goals</p>
              </div>

              <div className="grid grid-cols-3 gap-6 mb-6">
                {mockSegments.map(segment => (
                  <div key={segment.id} onClick={() => setSelectedSegment(segment.id)}
                    className={cn('bg-surface rounded-2xl border-2 p-6 cursor-pointer transition-all relative',
                      selectedSegment === segment.id ? 'border-primary shadow-lg' : 'border-border hover:border-primary/50')}>
                    {segment.recommended && (
                      <Badge variant="success" className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <Sparkles className="w-3 h-3 mr-1" /> Recommended
                      </Badge>
                    )}
                    <div className="absolute top-4 right-4">
                      <div className={cn('w-5 h-5 rounded-full border-2 flex items-center justify-center',
                        selectedSegment === segment.id ? 'bg-primary border-primary' : 'border-border')}>
                        {selectedSegment === segment.id && <Check className="w-3 h-3 text-white" />}
                      </div>
                    </div>
                    <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center mb-4',
                      selectedSegment === segment.id ? 'bg-primary/10' : 'bg-surface-tertiary')}>
                      <segment.icon className={cn('w-6 h-6', segment.color)} />
                    </div>
                    <h3 className="font-semibold text-text-primary mb-1">{segment.name}</h3>
                    <p className="text-sm text-primary mb-3">{segment.customers.toLocaleString()} customers</p>
                    <p className="text-sm text-text-secondary mb-4">{segment.description}</p>
                    <ul className="space-y-1.5 mb-4">
                      {segment.traits.map((trait, i) => (
                        <li key={i} className="text-xs text-text-secondary flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary" /> {trait}
                        </li>
                      ))}
                    </ul>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-surface-tertiary rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{ width: `${segment.match}%` }} />
                      </div>
                      <span className="text-sm font-medium text-primary">{segment.match}%</span>
                    </div>
                  </div>
                ))}
              </div>

              {selectedSegment && (
                <div className="p-4 bg-primary/5 rounded-xl flex items-center gap-3 mb-6">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-sm font-medium text-text-primary">Selected: {selectedSegmentData?.name}</p>
                    <p className="text-xs text-text-secondary">{selectedSegmentData?.customers.toLocaleString()} customers will be targeted</p>
                  </div>
                </div>
              )}

              <div className="flex justify-between">
                <Button variant="ghost" onClick={() => setCurrentStep(2)}>
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Button>
                <Button variant="primary" disabled={!selectedSegment} onClick={() => setCurrentStep(4)}>
                  Continue to Promotion <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 4: Promotion Selection */}
          {currentStep === 4 && (
            <motion.div key="promo" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="max-w-3xl mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-semibold text-text-primary mb-2">Select Promotion</h2>
                <p className="text-text-secondary">Choose the best promotion for your {selectedSKUs.length} selected SKUs and {selectedSegmentData?.name} segment</p>
              </div>

              <div className="p-4 bg-surface rounded-xl border border-border flex items-center gap-4 mb-6">
                <div className="flex -space-x-2">
                  {selectedSKUs.slice(0, 3).map(skuId => {
                    const sku = mockSKUs.find(s => s.id === skuId)
                    return (
                      <img 
                        key={skuId} 
                        src={sku?.image} 
                        alt={sku?.name}
                        className="w-10 h-10 rounded-full object-cover border-2 border-surface"
                      />
                    )
                  })}
                </div>
                <div>
                  <p className="text-sm font-medium text-text-primary">{selectedSKUs.length} SKUs selected</p>
                  <p className="text-xs text-text-secondary">Target: {selectedSegmentData?.name} ({selectedSegmentData?.customers.toLocaleString()} customers)</p>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                {mockPromotions.map(promo => (
                  <div key={promo.id} onClick={() => setSelectedPromotion(promo.id)}
                    className={cn('bg-surface rounded-xl border-2 p-5 cursor-pointer transition-all relative',
                      selectedPromotion === promo.id ? 'border-primary' : 'border-border hover:border-primary/50')}>
                    {promo.recommended && (
                      <Badge variant="success" className="absolute top-4 right-4">
                        <Sparkles className="w-3 h-3 mr-1" /> Recommended
                      </Badge>
                    )}
                    <div className="flex items-start gap-4">
                      <div className={cn('w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold',
                        promo.rank === 1 ? 'bg-primary text-white' : promo.rank === 2 ? 'bg-info/20 text-info' : 'bg-surface-tertiary text-text-muted')}>
                        {promo.rank === 1 ? '1st' : promo.rank === 2 ? '2nd' : '3rd'}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-text-primary">{promo.name}</h3>
                          <Badge variant="default">{promo.type}</Badge>
                        </div>
                        <p className="text-2xl font-bold text-text-primary mb-2">{promo.value}</p>
                        <p className="text-sm text-text-muted mb-3">{promo.duration}</p>
                        <div className="flex gap-2 mb-3">
                          <span className="px-2 py-1 bg-warning/10 text-warning text-xs rounded">{promo.marginImpact}</span>
                          <span className="px-2 py-1 bg-success/10 text-success text-xs rounded">{promo.revenue}</span>
                        </div>
                        <p className="text-sm text-text-secondary flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-agent" /> {promo.insight}
                        </p>
                      </div>
                      <div className={cn('w-6 h-6 rounded-full border-2 flex items-center justify-center',
                        selectedPromotion === promo.id ? 'bg-primary border-primary' : 'border-border')}>
                        {selectedPromotion === promo.id && <Check className="w-4 h-4 text-white" />}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-between">
                <Button variant="ghost" onClick={() => setCurrentStep(3)}>
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Button>
                <Button variant="primary" disabled={!selectedPromotion} onClick={() => setCurrentStep(5)}>
                  Continue to Brief <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 5: Creative Brief */}
          {currentStep === 5 && (
            <motion.div key="brief" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="max-w-3xl mx-auto">
              <div className="bg-surface rounded-2xl border border-border p-8">
                <h2 className="text-xl font-semibold text-text-primary mb-2">Creative Brief</h2>
                <p className="text-text-secondary mb-6">Review and customize your creative content</p>

                <div className="grid grid-cols-3 gap-4 mb-8">
                  <div className="p-4 bg-surface-secondary rounded-xl">
                    <p className="text-xs text-primary font-medium mb-1">SKUs Selected</p>
                    <p className="text-lg font-semibold text-text-primary">{selectedSKUs.length} products</p>
                  </div>
                  <div className="p-4 bg-surface-secondary rounded-xl">
                    <p className="text-xs text-primary font-medium mb-1">Target Segment</p>
                    <p className="text-lg font-semibold text-text-primary">{selectedSegmentData?.name}</p>
                  </div>
                  <div className="p-4 bg-surface-secondary rounded-xl">
                    <p className="text-xs text-primary font-medium mb-1">Promotion</p>
                    <p className="text-lg font-semibold text-text-primary">{selectedPromoData?.value}</p>
                  </div>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="block text-sm text-text-secondary mb-1.5">Headline</label>
                    <input type="text" value={headline} onChange={(e) => setHeadline(e.target.value)}
                      className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-primary/50" />
                  </div>
                  <div>
                    <label className="block text-sm text-text-secondary mb-1.5">Subcopy</label>
                    <textarea value={subcopy} onChange={(e) => setSubcopy(e.target.value)}
                      className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-sm resize-none h-20 focus:outline-none focus:ring-2 focus:ring-primary/50" />
                  </div>
                  <div>
                    <label className="block text-sm text-text-secondary mb-1.5">Call to Action</label>
                    <input type="text" value={cta} onChange={(e) => setCta(e.target.value)}
                      className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                  </div>
                  <div>
                    <label className="block text-sm text-text-secondary mb-1.5">Additional Input <span className="text-text-muted">(optional, max 120 chars)</span></label>
                    <input type="text" value={additionalInput} onChange={(e) => setAdditionalInput(e.target.value.slice(0, 120))}
                      placeholder="e.g., Highlight grain-free, Emphasize winter warmth"
                      className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                    <p className="text-xs text-text-muted mt-1">{additionalInput.length}/120</p>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-surface-secondary rounded-xl">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-5 h-5 rounded-full border-2 border-border" />
                    <span className="text-sm font-medium text-text-primary">System-Enforced Guidelines</span>
                  </div>
                  <ul className="space-y-2 text-sm text-text-secondary">
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-success" /> Brand colors, logos, and spacing applied</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-success" /> Compliant claim language enforced</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-success" /> Image style constraints applied</li>
                  </ul>
                </div>

                <div className="mt-8 flex justify-between">
                  <Button variant="ghost" onClick={() => setCurrentStep(4)}>
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back
                  </Button>
                  <Button variant="primary" onClick={() => { setCurrentStep(6); startGeneration() }}>
                    Generate Banners <Sparkles className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 6: AI Generation */}
          {currentStep === 6 && isGenerating && (
            <motion.div key="generate" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-gradient-to-br from-[#1a1f3c] to-[#0d1025] z-50 flex items-center justify-center">
              <div className="max-w-xl w-full px-8">
                <div className="text-center mb-8">
                  <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="w-8 h-8 text-primary" />
                  </div>
                  <h2 className="text-2xl font-semibold text-white mb-2">AI Creative Engine</h2>
                  <p className="text-white/60">Generating optimized banners for your campaign</p>
                </div>

                <div className="mb-8">
                  <div className="flex justify-between text-sm text-white/60 mb-2">
                    <span>Progress</span>
                    <span>{Math.round(generationProgress)}%</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <motion.div className="h-full bg-gradient-to-r from-primary to-success rounded-full"
                      initial={{ width: 0 }} animate={{ width: `${generationProgress}%` }} />
                  </div>
                </div>

                <div className="p-4 bg-white/5 rounded-xl mb-6 flex items-center gap-4">
                  <div className="flex -space-x-2">
                    {selectedSKUs.slice(0, 2).map(skuId => {
                      const sku = mockSKUs.find(s => s.id === skuId)
                      return (
                        <img 
                          key={skuId} 
                          src={sku?.image} 
                          alt={sku?.name}
                          className="w-10 h-10 rounded-full object-cover border-2 border-white/20"
                        />
                      )
                    })}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{selectedSKUs.length} SKUs • {selectedSegmentData?.name}</p>
                    <p className="text-xs text-white/60">{selectedPromoData?.name} - {selectedPromoData?.value}</p>
                  </div>
                </div>

                <div className="bg-white/5 rounded-xl p-4 space-y-3">
                  {generationSteps.map((step, index) => (
                    <div key={index} className={cn('flex items-center gap-3 transition-opacity',
                      index <= currentGenStep ? 'opacity-100' : 'opacity-40')}>
                      <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center',
                        index < currentGenStep ? 'bg-success/20' : index === currentGenStep ? 'bg-primary/20' : 'bg-white/10')}>
                        {index < currentGenStep ? (
                          <Check className="w-4 h-4 text-success" />
                        ) : index === currentGenStep ? (
                          <Loader2 className="w-4 h-4 text-primary animate-spin" />
                        ) : (
                          <span className="text-xs text-white/40">{index + 1}</span>
                        )}
                      </div>
                      <div>
                        <p className={cn('text-sm', index <= currentGenStep ? 'text-white' : 'text-white/40')}>{step.label}</p>
                        {step.subtext && index === currentGenStep && (
                          <p className="text-xs text-white/40">{step.subtext}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 7: Review Banners */}
          {currentStep === 7 && (
            <motion.div key="review" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="max-w-6xl mx-auto">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-text-primary">Review Banners</h2>
                  <p className="text-sm text-text-secondary">{approvedCount}/{banners.length} approved</p>
                </div>
                <button className="flex items-center gap-2 text-sm text-success hover:underline">
                  <CheckCircle className="w-4 h-4" /> Approve Recommended
                </button>
              </div>

              <div className="grid grid-cols-3 gap-6 mb-8">
                {banners.map((banner) => {
                  const selectedSKU = mockSKUs.find(s => s.id === selectedSKUs[0])
                  return (
                    <div key={banner.id} className="bg-surface rounded-2xl border border-border overflow-hidden shadow-sm">
                      {/* Banner Preview - Different aspect ratios */}
                      <div className={cn(
                        'relative bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden',
                        banner.ratio === '16:9' ? 'aspect-video' : banner.ratio === '1:1' ? 'aspect-square' : 'aspect-[4/5]'
                      )}>
                        {/* Size Badge */}
                        <div className="absolute top-3 left-3 z-10">
                          <span className="px-2 py-1 bg-gray-800/80 text-white text-xs rounded font-medium">{banner.ratio}</span>
                        </div>
                        
                        {/* Promo Badge */}
                        <div className="absolute top-3 right-3 z-10">
                          <span className="px-3 py-1.5 bg-emerald-500 text-white text-xs font-bold rounded-lg shadow-md">
                            {selectedPromoData?.value}
                          </span>
                        </div>

                        {/* Banner Content */}
                        {banner.ratio === '16:9' ? (
                          <div className="h-full p-4 flex items-center">
                            {/* Product Image */}
                            <div className="w-1/3 flex items-center justify-center">
                              <img 
                                src={selectedSKU?.image} 
                                alt={selectedSKU?.name}
                                className="w-24 h-24 object-cover rounded-xl shadow-lg"
                              />
                            </div>
                            {/* Content */}
                            <div className="flex-1 pl-4">
                              <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wide mb-1">
                                {selectedSKU?.name}
                              </p>
                              <h3 className="text-lg font-bold text-gray-900 mb-1 leading-tight">{headline}</h3>
                              <p className="text-xs text-gray-500 mb-3 line-clamp-2">{subcopy}</p>
                              <button className="px-4 py-2 bg-gray-900 text-white rounded-lg text-xs font-semibold">
                                {cta} →
                              </button>
                            </div>
                          </div>
                        ) : banner.ratio === '1:1' ? (
                          <div className="h-full p-4 flex flex-col">
                            {/* Product Image */}
                            <div className="flex-1 flex items-center justify-center py-4">
                              <img 
                                src={selectedSKU?.image} 
                                alt={selectedSKU?.name}
                                className="w-28 h-28 object-cover rounded-xl shadow-lg"
                              />
                            </div>
                            {/* Content */}
                            <div className="text-center">
                              <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wide mb-1">
                                {selectedSKU?.name}
                              </p>
                              <h3 className="text-base font-bold text-gray-900 mb-1">{headline}</h3>
                              <p className="text-xs text-gray-500 mb-3 line-clamp-2 px-2">{subcopy}</p>
                              <button className="px-4 py-2 bg-gray-900 text-white rounded-lg text-xs font-semibold">
                                {cta} →
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="h-full p-4 flex flex-col">
                            {/* Product Image */}
                            <div className="flex-1 flex items-center justify-center py-6">
                              <img 
                                src={selectedSKU?.image} 
                                alt={selectedSKU?.name}
                                className="w-32 h-32 object-cover rounded-xl shadow-lg"
                              />
                            </div>
                            {/* Content */}
                            <div className="mt-auto">
                              <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wide mb-1">
                                {selectedSKU?.name}
                              </p>
                              <h3 className="text-lg font-bold text-gray-900 mb-1">{headline}</h3>
                              <p className="text-xs text-gray-500 mb-3 line-clamp-2">{subcopy}</p>
                              <button className="w-full px-4 py-2.5 bg-gray-900 text-white rounded-lg text-sm font-semibold">
                                {cta} →
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {/* Banner Info */}
                      <div className="p-4 border-t border-border">
                        <div className="flex items-center gap-4 mb-3">
                          <div className="flex items-center gap-1.5 text-sm">
                            <Heart className="w-4 h-4 text-text-muted" />
                            <span className="text-text-primary">{banner.brandSafe}%</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-sm">
                            <TrendingUp className="w-4 h-4 text-text-muted" />
                            <span className="text-text-primary">{banner.engagement}%</span>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1.5 mb-4">
                          {banner.tags.map(tag => (
                            <span key={tag} className="px-2 py-0.5 bg-surface-tertiary rounded text-xs text-text-secondary">{tag}</span>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            variant={banner.approved ? 'primary' : 'ghost'} 
                            className={cn('flex-1', !banner.approved && 'border border-border')} 
                            onClick={() => toggleBannerApproval(banner.id)}
                          >
                            <Check className="w-4 h-4 mr-1" /> {banner.approved ? 'Approved' : 'Approve'}
                          </Button>
                          <button className="p-2 border border-border rounded-lg hover:bg-surface-secondary">
                            <Edit3 className="w-4 h-4 text-text-muted" />
                          </button>
                          <button className="p-2 border border-border rounded-lg hover:bg-danger/10">
                            <X className="w-4 h-4 text-danger" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="flex justify-between">
                <Button variant="ghost" onClick={() => setCurrentStep(5)}>
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Button>
                <div className="flex gap-3">
                  <Button variant="ghost" className="border border-border">
                    <Download className="w-4 h-4 mr-2" /> Download All
                  </Button>
                  <Button variant="primary" disabled={approvedCount === 0} className="bg-danger hover:bg-danger/90">
                    <Sparkles className="w-4 h-4 mr-2" /> Deploy ({approvedCount})
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}
