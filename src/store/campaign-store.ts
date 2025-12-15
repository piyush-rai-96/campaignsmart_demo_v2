import { create } from 'zustand'
import type { Campaign, CampaignStep, Audience, CreativeVariant } from '@/types'

interface CampaignState {
  campaigns: Campaign[]
  activeCampaign: Campaign | null
  currentStep: CampaignStep
  selectedAudiences: Audience[]
  audiencePromoMapping: Record<string, string>
  creativeVariants: CreativeVariant[]
  
  // Actions
  setActiveCampaign: (campaign: Campaign | null) => void
  setCurrentStep: (step: CampaignStep) => void
  createCampaign: (name: string) => Campaign
  updateCampaign: (id: string, updates: Partial<Campaign>) => void
  selectAudience: (audience: Audience) => void
  deselectAudience: (audienceId: string) => void
  setAudiencePromo: (audienceId: string, promoId: string) => void
  setCreativeVariants: (variants: CreativeVariant[]) => void
  completeCampaign: () => void
}

const mockCampaigns: Campaign[] = [
  {
    id: '1',
    name: 'Summer Sale 2024',
    status: 'live',
    lastUpdated: new Date('2024-12-10'),
    owner: 'Sarah Chen',
    channel: 'Email',
    objective: 'Drive seasonal revenue',
    currentStep: 'review'
  },
  {
    id: '2',
    name: 'New Customer Welcome',
    status: 'draft',
    lastUpdated: new Date('2024-12-14'),
    owner: 'Mike Johnson',
    channel: 'Push',
    objective: 'Onboard new users',
    currentStep: 'audience'
  },
  {
    id: '3',
    name: 'Holiday Gift Guide',
    status: 'completed',
    lastUpdated: new Date('2024-12-01'),
    owner: 'Emily Davis',
    channel: 'Email',
    objective: 'Holiday engagement',
    currentStep: 'review'
  }
]

export const useCampaignStore = create<CampaignState>((set, get) => ({
  campaigns: mockCampaigns,
  activeCampaign: null,
  currentStep: 'context',
  selectedAudiences: [],
  audiencePromoMapping: {},
  creativeVariants: [],

  setActiveCampaign: (campaign) => set({ 
    activeCampaign: campaign,
    currentStep: campaign?.currentStep || 'context'
  }),

  setCurrentStep: (step) => set({ currentStep: step }),

  createCampaign: (name) => {
    const newCampaign: Campaign = {
      id: Date.now().toString(),
      name,
      status: 'draft',
      lastUpdated: new Date(),
      owner: 'You',
      currentStep: 'context'
    }
    set((state) => ({
      campaigns: [newCampaign, ...state.campaigns],
      activeCampaign: newCampaign,
      currentStep: 'context'
    }))
    return newCampaign
  },

  updateCampaign: (id, updates) => set((state) => ({
    campaigns: state.campaigns.map(c => 
      c.id === id ? { ...c, ...updates, lastUpdated: new Date() } : c
    ),
    activeCampaign: state.activeCampaign?.id === id 
      ? { ...state.activeCampaign, ...updates, lastUpdated: new Date() }
      : state.activeCampaign
  })),

  selectAudience: (audience) => set((state) => ({
    selectedAudiences: [...state.selectedAudiences, audience]
  })),

  deselectAudience: (audienceId) => set((state) => ({
    selectedAudiences: state.selectedAudiences.filter(a => a.id !== audienceId)
  })),

  setAudiencePromo: (audienceId, promoId) => set((state) => ({
    audiencePromoMapping: { ...state.audiencePromoMapping, [audienceId]: promoId }
  })),

  setCreativeVariants: (variants) => set({ creativeVariants: variants }),

  completeCampaign: () => {
    const { activeCampaign } = get()
    if (activeCampaign) {
      set((state) => ({
        campaigns: state.campaigns.map(c =>
          c.id === activeCampaign.id ? { ...c, status: 'live' as const } : c
        ),
        activeCampaign: null,
        currentStep: 'context',
        selectedAudiences: [],
        audiencePromoMapping: {},
        creativeVariants: []
      }))
    }
  }
}))
