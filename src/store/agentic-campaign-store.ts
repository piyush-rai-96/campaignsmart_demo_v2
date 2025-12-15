import { create } from 'zustand'
import type { 
  AgenticCampaign, 
  AgenticStep, 
  CampaignContext, 
  SegmentStrategy,
  CampaignSegment,
  ProductGroup,
  PromotionMapping,
  CampaignCreative
} from '@/types'

interface AgenticCampaignState {
  // Campaign list
  campaigns: AgenticCampaign[]
  activeCampaignId: string | null
  
  // Agent state
  agentThinking: boolean
  agentMessage: string | null
  
  // Getters
  getActiveCampaign: () => AgenticCampaign | null
  getCampaignsByStatus: (status: 'draft' | 'locked' | 'live' | 'completed') => AgenticCampaign[]
  
  // Campaign Actions
  createCampaign: (name: string) => AgenticCampaign
  setActiveCampaign: (id: string | null) => void
  deleteCampaign: (id: string) => void
  
  // Step Navigation
  goToStep: (step: AgenticStep) => void
  
  // Agent Actions
  setAgentThinking: (thinking: boolean, message?: string) => void
  
  // Step 1: Context
  updateContext: (context: Partial<CampaignContext>) => void
  lockContext: () => void
  
  // Step 2: Segment Strategy
  setSegmentStrategy: (strategy: SegmentStrategy) => void
  lockStrategy: () => void
  
  // Step 3: Segments
  setSegments: (segments: CampaignSegment[]) => void
  approveSegment: (segmentId: string) => void
  removeSegment: (segmentId: string) => void
  lockSegments: () => void
  
  // Step 4: Products
  setProductGroups: (groups: ProductGroup[]) => void
  updateProductGroupBias: (groupId: string, bias: 'premium' | 'clearance' | 'balanced') => void
  lockProducts: () => void
  
  // Step 5: Promotions
  setPromotionMappings: (mappings: PromotionMapping[]) => void
  updatePromotionMapping: (segmentId: string, mapping: Partial<PromotionMapping>) => void
  lockPromotions: () => void
  
  // Step 6: Creatives
  setCreatives: (creatives: CampaignCreative[]) => void
  updateCreativeStatus: (creativeId: string, status: CampaignCreative['status']) => void
  lockCreatives: () => void
  
  // Step 7: Export
  exportCampaign: () => void
}

// Step order for navigation validation
// const STEP_ORDER: AgenticStep[] = [
//   'context',
//   'segment-strategy', 
//   'segment-creation',
//   'product-logic',
//   'promotion',
//   'creative',
//   'review'
// ]

// Mock campaigns for demo
const mockCampaigns: AgenticCampaign[] = [
  {
    id: 'demo-1',
    name: 'Summer Clearance Push',
    status: 'draft',
    lastUpdated: new Date(),
    owner: 'You',
    currentStep: 'segment-strategy',
    completedSteps: ['context'],
    context: {
      goal: 'Clear excess summer inventory before fall arrivals',
      category: 'Apparel',
      channel: 'Email + Push',
      region: 'North America',
      lookbackWindow: '90 days',
      campaignType: 'Clearance',
      customerUniverse: 245000,
      inventoryRelevance: 'High - 12,000 units excess',
      timeSensitivity: 'Urgent - 3 weeks to fall launch',
      agentSummary: 'This is a time-sensitive clearance campaign targeting customers with summer apparel affinity. Focus on price-sensitive segments with high email engagement.'
    },
    contextLocked: true,
    strategyLocked: false,
    segmentsLocked: false,
    productsLocked: false,
    promotionsLocked: false,
    creativesLocked: false
  },
  {
    id: 'demo-2',
    name: 'New Customer Welcome Series',
    status: 'draft',
    lastUpdated: new Date(Date.now() - 86400000),
    owner: 'You',
    currentStep: 'context',
    completedSteps: [],
    contextLocked: false,
    strategyLocked: false,
    segmentsLocked: false,
    productsLocked: false,
    promotionsLocked: false,
    creativesLocked: false
  }
]

export const useAgenticCampaignStore = create<AgenticCampaignState>((set, get) => ({
  campaigns: mockCampaigns,
  activeCampaignId: null,
  agentThinking: false,
  agentMessage: null,

  // Getters
  getActiveCampaign: () => {
    const { campaigns, activeCampaignId } = get()
    return campaigns.find(c => c.id === activeCampaignId) || null
  },

  getCampaignsByStatus: (status) => {
    return get().campaigns.filter(c => c.status === status)
  },

  // Campaign Actions
  createCampaign: (name) => {
    const newCampaign: AgenticCampaign = {
      id: `campaign-${Date.now()}`,
      name,
      status: 'draft',
      lastUpdated: new Date(),
      owner: 'You',
      currentStep: 'context',
      completedSteps: [],
      contextLocked: false,
      strategyLocked: false,
      segmentsLocked: false,
      productsLocked: false,
      promotionsLocked: false,
      creativesLocked: false
    }
    set(state => ({
      campaigns: [newCampaign, ...state.campaigns],
      activeCampaignId: newCampaign.id
    }))
    return newCampaign
  },

  setActiveCampaign: (id) => {
    set({ activeCampaignId: id })
  },

  deleteCampaign: (id) => {
    set(state => ({
      campaigns: state.campaigns.filter(c => c.id !== id),
      activeCampaignId: state.activeCampaignId === id ? null : state.activeCampaignId
    }))
  },

  // Step Navigation
  goToStep: (step) => {
    const campaign = get().getActiveCampaign()
    if (!campaign) return
    
    set(state => ({
      campaigns: state.campaigns.map(c => 
        c.id === campaign.id 
          ? { ...c, currentStep: step, lastUpdated: new Date() }
          : c
      )
    }))
  },

  // Agent Actions
  setAgentThinking: (thinking, message) => {
    set({ agentThinking: thinking, agentMessage: message || null })
  },

  // Step 1: Context
  updateContext: (contextUpdate) => {
    const campaign = get().getActiveCampaign()
    if (!campaign) return
    
    set(state => ({
      campaigns: state.campaigns.map(c => 
        c.id === campaign.id 
          ? { 
              ...c, 
              context: { ...c.context, ...contextUpdate } as CampaignContext,
              lastUpdated: new Date()
            }
          : c
      )
    }))
  },

  lockContext: () => {
    const campaign = get().getActiveCampaign()
    if (!campaign) return
    
    const nextStep = 'segment-strategy'
    set(state => ({
      campaigns: state.campaigns.map(c => 
        c.id === campaign.id 
          ? { 
              ...c, 
              contextLocked: true,
              currentStep: nextStep,
              completedSteps: [...c.completedSteps, 'context'],
              lastUpdated: new Date()
            }
          : c
      )
    }))
  },

  // Step 2: Segment Strategy
  setSegmentStrategy: (strategy) => {
    const campaign = get().getActiveCampaign()
    if (!campaign) return
    
    set(state => ({
      campaigns: state.campaigns.map(c => 
        c.id === campaign.id 
          ? { ...c, segmentStrategy: strategy, lastUpdated: new Date() }
          : c
      )
    }))
  },

  lockStrategy: () => {
    const campaign = get().getActiveCampaign()
    if (!campaign) return
    
    set(state => ({
      campaigns: state.campaigns.map(c => 
        c.id === campaign.id 
          ? { 
              ...c, 
              strategyLocked: true,
              currentStep: 'segment-creation',
              completedSteps: [...c.completedSteps, 'segment-strategy'],
              lastUpdated: new Date()
            }
          : c
      )
    }))
  },

  // Step 3: Segments
  setSegments: (segments) => {
    const campaign = get().getActiveCampaign()
    if (!campaign) return
    
    set(state => ({
      campaigns: state.campaigns.map(c => 
        c.id === campaign.id 
          ? { ...c, segments, lastUpdated: new Date() }
          : c
      )
    }))
  },

  approveSegment: (segmentId) => {
    const campaign = get().getActiveCampaign()
    if (!campaign) return
    
    set(state => ({
      campaigns: state.campaigns.map(c => 
        c.id === campaign.id 
          ? { 
              ...c, 
              segments: c.segments?.map(s => 
                s.id === segmentId ? { ...s, isApproved: true } : s
              ),
              lastUpdated: new Date()
            }
          : c
      )
    }))
  },

  removeSegment: (segmentId) => {
    const campaign = get().getActiveCampaign()
    if (!campaign) return
    
    set(state => ({
      campaigns: state.campaigns.map(c => 
        c.id === campaign.id 
          ? { 
              ...c, 
              segments: c.segments?.filter(s => s.id !== segmentId),
              lastUpdated: new Date()
            }
          : c
      )
    }))
  },

  lockSegments: () => {
    const campaign = get().getActiveCampaign()
    if (!campaign) return
    
    set(state => ({
      campaigns: state.campaigns.map(c => 
        c.id === campaign.id 
          ? { 
              ...c, 
              segmentsLocked: true,
              currentStep: 'product-logic',
              completedSteps: [...c.completedSteps, 'segment-creation'],
              lastUpdated: new Date()
            }
          : c
      )
    }))
  },

  // Step 4: Products
  setProductGroups: (groups) => {
    const campaign = get().getActiveCampaign()
    if (!campaign) return
    
    set(state => ({
      campaigns: state.campaigns.map(c => 
        c.id === campaign.id 
          ? { ...c, productGroups: groups, lastUpdated: new Date() }
          : c
      )
    }))
  },

  updateProductGroupBias: (groupId, bias) => {
    const campaign = get().getActiveCampaign()
    if (!campaign) return
    
    set(state => ({
      campaigns: state.campaigns.map(c => 
        c.id === campaign.id 
          ? { 
              ...c, 
              productGroups: c.productGroups?.map(g => 
                g.id === groupId ? { ...g, bias } : g
              ),
              lastUpdated: new Date()
            }
          : c
      )
    }))
  },

  lockProducts: () => {
    const campaign = get().getActiveCampaign()
    if (!campaign) return
    
    set(state => ({
      campaigns: state.campaigns.map(c => 
        c.id === campaign.id 
          ? { 
              ...c, 
              productsLocked: true,
              currentStep: 'promotion',
              completedSteps: [...c.completedSteps, 'product-logic'],
              lastUpdated: new Date()
            }
          : c
      )
    }))
  },

  // Step 5: Promotions
  setPromotionMappings: (mappings) => {
    const campaign = get().getActiveCampaign()
    if (!campaign) return
    
    set(state => ({
      campaigns: state.campaigns.map(c => 
        c.id === campaign.id 
          ? { ...c, promotionMappings: mappings, lastUpdated: new Date() }
          : c
      )
    }))
  },

  updatePromotionMapping: (segmentId, mapping) => {
    const campaign = get().getActiveCampaign()
    if (!campaign) return
    
    set(state => ({
      campaigns: state.campaigns.map(c => 
        c.id === campaign.id 
          ? { 
              ...c, 
              promotionMappings: c.promotionMappings?.map(m => 
                m.segmentId === segmentId ? { ...m, ...mapping } : m
              ),
              lastUpdated: new Date()
            }
          : c
      )
    }))
  },

  lockPromotions: () => {
    const campaign = get().getActiveCampaign()
    if (!campaign) return
    
    set(state => ({
      campaigns: state.campaigns.map(c => 
        c.id === campaign.id 
          ? { 
              ...c, 
              promotionsLocked: true,
              currentStep: 'creative',
              completedSteps: [...c.completedSteps, 'promotion'],
              lastUpdated: new Date()
            }
          : c
      )
    }))
  },

  // Step 6: Creatives
  setCreatives: (creatives) => {
    const campaign = get().getActiveCampaign()
    if (!campaign) return
    
    set(state => ({
      campaigns: state.campaigns.map(c => 
        c.id === campaign.id 
          ? { ...c, creatives, lastUpdated: new Date() }
          : c
      )
    }))
  },

  updateCreativeStatus: (creativeId, status) => {
    const campaign = get().getActiveCampaign()
    if (!campaign) return
    
    set(state => ({
      campaigns: state.campaigns.map(c => 
        c.id === campaign.id 
          ? { 
              ...c, 
              creatives: c.creatives?.map(cr => 
                cr.id === creativeId ? { ...cr, status } : cr
              ),
              lastUpdated: new Date()
            }
          : c
      )
    }))
  },

  lockCreatives: () => {
    const campaign = get().getActiveCampaign()
    if (!campaign) return
    
    set(state => ({
      campaigns: state.campaigns.map(c => 
        c.id === campaign.id 
          ? { 
              ...c, 
              creativesLocked: true,
              currentStep: 'review',
              completedSteps: [...c.completedSteps, 'creative'],
              lastUpdated: new Date()
            }
          : c
      )
    }))
  },

  // Step 7: Export
  exportCampaign: () => {
    const campaign = get().getActiveCampaign()
    if (!campaign) return
    
    set(state => ({
      campaigns: state.campaigns.map(c => 
        c.id === campaign.id 
          ? { 
              ...c, 
              status: 'live',
              completedSteps: [...c.completedSteps, 'review'],
              lastUpdated: new Date()
            }
          : c
      )
    }))
  }
}))
