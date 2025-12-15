export type CampaignStatus = 'draft' | 'locked' | 'live' | 'completed'
export type CampaignStep = 'context' | 'audience' | 'offer' | 'creative' | 'review'
export type AgenticStep = 'context' | 'segment-strategy' | 'segment-creation' | 'product-logic' | 'promotion' | 'creative' | 'review'

export interface Campaign {
  id: string
  name: string
  status: CampaignStatus
  lastUpdated: Date
  owner: string
  channel?: string
  objective?: string
  currentStep: CampaignStep
}

// Agentic Campaign Types
export interface AgenticCampaign {
  id: string
  name: string
  status: CampaignStatus
  lastUpdated: Date
  owner: string
  currentStep: AgenticStep
  completedSteps: AgenticStep[]
  
  // Step 1: Context (locked after confirmation)
  context?: CampaignContext
  contextLocked: boolean
  
  // Step 2: Segment Strategy (locked after confirmation)
  segmentStrategy?: SegmentStrategy
  strategyLocked: boolean
  
  // Step 3: Segments (locked after confirmation)
  segments?: CampaignSegment[]
  segmentsLocked: boolean
  
  // Step 4: Product Logic (locked after confirmation)
  productGroups?: ProductGroup[]
  productsLocked: boolean
  
  // Step 5: Promotions (locked after confirmation)
  promotionMappings?: PromotionMapping[]
  promotionsLocked: boolean
  
  // Step 6: Creatives (locked after confirmation)
  creatives?: CampaignCreative[]
  creativesLocked: boolean
}

export interface CampaignContext {
  goal: string
  category: string
  channel: string
  region: string
  lookbackWindow: string
  
  // Agent-derived
  campaignType?: string
  customerUniverse?: number
  inventoryRelevance?: string
  timeSensitivity?: string
  agentSummary?: string
}

export interface SegmentStrategy {
  layers: SegmentLayer[]
  approach: 'rule-based' | 'statistical' | 'hybrid'
  agentRationale: string
}

export interface SegmentLayer {
  id: string
  name: string
  type: 'rule-based' | 'statistical'
  description: string
  rationale: string
}

export interface CampaignSegment {
  id: string
  name: string
  layerId: string
  size: number
  percentage: number
  intent: string
  characteristics: string[]
  isApproved: boolean
}

export interface ProductGroup {
  id: string
  segmentId: string
  segmentName: string
  products: ProductItem[]
  rationale: string
  bias: 'premium' | 'clearance' | 'balanced'
}

export interface ProductItem {
  id: string
  name: string
  category: string
  price: number
  margin: number
  inventory: number
  affinity: number
  image: string
}

export interface PromotionMapping {
  segmentId: string
  segmentName: string
  promotionId: string | null
  promotionName: string | null
  promotionValue: string | null
  status: 'accepted' | 'switched' | 'none' | 'pending'
  scores?: {
    lift: number
    margin: number
    overstockFit: number
  }
}

export interface CampaignCreative {
  id: string
  segmentId: string
  segmentName: string
  tone: string
  headline: string
  subcopy: string
  cta: string
  imageUrl: string
  rationale: string
  status: 'pending' | 'approved' | 'rejected' | 'regenerating'
}

export interface Audience {
  id: string
  name: string
  description: string
  size: number
  sizeLabel: 'small' | 'medium' | 'large'
  criteria: string[]
  isRecommended?: boolean
}

export interface Promo {
  id: string
  name: string
  discount: string
  status: 'active' | 'upcoming' | 'missing'
  channel: string
  category: string
  validFrom?: Date
  validTo?: Date
}

export interface Segment {
  id: string
  name: string
  type: 'static' | 'dynamic'
  creationType: 'manual' | 'agent'
  usageCount: number
  category: string
  channel: string
  description: string
}

export interface AgentMessage {
  id: string
  type: 'suggestion' | 'explanation' | 'action' | 'question'
  content: string
  timestamp: Date
  isUser?: boolean
}

export interface CreativeVariant {
  id: string
  audienceId: string
  audienceName: string
  headline: string
  subheadline: string
  cta: string
  promoLabel?: string
  imageUrl: string
  compliance: {
    approved: boolean
    flags: string[]
  }
}
