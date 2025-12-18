/**
 * GLOBAL DATA STANDARDIZATION
 * ===========================
 * This file serves as the SINGLE SOURCE OF TRUTH for all product categories and SKUs.
 * 
 * Design Principle: One category model, one SKU model, one image source — everywhere.
 * 
 * Rules:
 * - Categories must be rendered only from these standardized definitions
 * - SKU pickers, tables, and mappings must source SKUs only from this list
 * - All SKU images resolve via the imageUrl field
 * - Any new SKU/category must be added here to propagate across the tool
 */

import sallyProductsData from './sally_products.json'
import michaelsProductsData from './michaels_products.json'

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface SKU {
  sku: string           // Unique identifier
  name: string          // Display name
  visualDescription: string  // For accessibility and context
  imageUrl: string      // For rendering images - SINGLE SOURCE
  price?: number        // Optional price
  discountedPrice?: number  // Optional discounted price
  offerPercent?: number // Optional offer percentage
}

export interface Category {
  id: string
  name: string
  items: SKU[]
  client?: 'sally' | 'michaels'  // Client identifier
}

export interface ProductData {
  categories: Category[]
}

// ============================================================================
// PLACEHOLDER IMAGE (Fallback when SKU image fails to load)
// ============================================================================

export const PLACEHOLDER_IMAGE = '/images/placeholder-product.svg'

// ============================================================================
// LOAD PRODUCT DATA FROM JSON
// ============================================================================

const sallyData: ProductData = sallyProductsData as ProductData

// Map Michaels data to standard SKU format
const michaelsCategories: Category[] = (michaelsProductsData as any).categories.map((cat: any) => ({
  id: cat.id,
  name: cat.name,
  client: 'michaels' as const,
  items: cat.items.map((item: any) => ({
    sku: item.skuId,
    name: item.skuName,
    visualDescription: item.skuName,
    imageUrl: item.imageUrl,
    price: item.price,
    discountedPrice: item.discountedPrice,
    offerPercent: item.offerPercent
  }))
}))

// Add client identifier to Sally categories
const sallyCategories: Category[] = sallyData.categories.map(cat => ({
  ...cat,
  client: 'sally' as const
}))

// ============================================================================
// EXPORTED DATA & HELPERS
// ============================================================================

/**
 * All categories from both Sally and Michaels
 */
export const CATEGORIES: Category[] = [...sallyCategories, ...michaelsCategories]

/**
 * Get categories by client
 */
export const getCategoriesByClient = (client: 'sally' | 'michaels'): Category[] => {
  return CATEGORIES.filter(c => c.client === client)
}

/**
 * Sally-only categories (for backward compatibility)
 */
export const SALLY_CATEGORIES: Category[] = sallyCategories

/**
 * Michaels-only categories
 */
export const MICHAELS_CATEGORIES: Category[] = michaelsCategories

/**
 * Get category by ID
 */
export const getCategoryById = (id: string): Category | undefined => {
  return CATEGORIES.find(c => c.id === id)
}

/**
 * Get category by name
 */
export const getCategoryByName = (name: string): Category | undefined => {
  return CATEGORIES.find(c => c.name.toLowerCase() === name.toLowerCase())
}

/**
 * Get all category names
 */
export const getCategoryNames = (): string[] => {
  return CATEGORIES.map(c => c.name)
}

/**
 * Get all category IDs
 */
export const getCategoryIds = (): string[] => {
  return CATEGORIES.map(c => c.id)
}

/**
 * Get all SKUs across all categories
 */
export const getAllSKUs = (): SKU[] => {
  return CATEGORIES.flatMap(c => c.items)
}

/**
 * Get SKUs for a specific category
 */
export const getSKUsByCategory = (categoryId: string): SKU[] => {
  const category = getCategoryById(categoryId)
  return category?.items || []
}

/**
 * Get a specific SKU by its ID
 */
export const getSKUById = (skuId: string): SKU | undefined => {
  return getAllSKUs().find(s => s.sku === skuId)
}

/**
 * Get SKU image URL with fallback
 */
export const getSKUImageUrl = (skuId: string): string => {
  const sku = getSKUById(skuId)
  return sku?.imageUrl || PLACEHOLDER_IMAGE
}

/**
 * Handle image load error - returns placeholder
 */
export const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>): void => {
  const target = e.target as HTMLImageElement
  target.src = PLACEHOLDER_IMAGE
  target.onerror = null // Prevent infinite loop
}

// ============================================================================
// CATEGORY-TO-SEGMENT MAPPING (for campaign workflows)
// ============================================================================

export interface SegmentProductMapping {
  segmentId: string
  segmentName: string
  group: string
  categoryIds: string[]
  rationale: string
  color: string
}

/**
 * Default segment-to-category mapping for Sally Beauty campaigns
 */
export const SEGMENT_PRODUCT_MAPPINGS: SegmentProductMapping[] = [
  {
    segmentId: 'seg-1',
    segmentName: 'Fashion Forward VIPs',
    group: 'Hair Color & Styling',
    categoryIds: ['styling_tools', 'hair_color'],
    rationale: 'High-margin professional color and tools for enthusiasts',
    color: 'from-purple-500 to-indigo-500'
  },
  {
    segmentId: 'seg-2',
    segmentName: 'Seasonal Shoppers',
    group: 'Textured Hair & Care',
    categoryIds: ['textured_hair_care', 'hair_care'],
    rationale: 'Trending maintenance products and treatments',
    color: 'from-blue-500 to-cyan-500'
  },
  {
    segmentId: 'seg-3',
    segmentName: 'Basics Loyalists',
    group: 'Nails & Essentials',
    categoryIds: ['nails', 'cosmetics_lashes'],
    rationale: 'High-frequency replenishment items',
    color: 'from-orange-500 to-amber-500'
  },
  {
    segmentId: 'seg-4',
    segmentName: 'Trend Explorers',
    group: 'Grooming & Innovation',
    categoryIds: ['mens_grooming'],
    rationale: 'Emerging categories and expansion targets',
    color: 'from-pink-500 to-rose-500'
  }
]

/**
 * Michaels segment-to-category mapping for campaigns
 */
export const MICHAELS_SEGMENT_MAPPINGS: SegmentProductMapping[] = [
  {
    segmentId: 'mseg-1',
    segmentName: 'Holiday Decorators',
    group: 'Christmas Trees',
    categoryIds: ['christmas_trees'],
    rationale: 'High-value tree buyers seeking premium pre-lit options',
    color: 'from-green-500 to-emerald-500'
  },
  {
    segmentId: 'mseg-2',
    segmentName: 'Ornament Collectors',
    group: 'Christmas Decor Collections',
    categoryIds: ['christmas_decor_collections'],
    rationale: 'Seasonal decor enthusiasts buying ornaments and toppers',
    color: 'from-red-500 to-rose-500'
  }
]

/**
 * Get segment mappings by client
 */
export const getSegmentMappingsByClient = (client: 'sally' | 'michaels'): SegmentProductMapping[] => {
  return client === 'michaels' ? MICHAELS_SEGMENT_MAPPINGS : SEGMENT_PRODUCT_MAPPINGS
}

/**
 * Get SKUs for a segment based on its category mappings
 */
export const getSKUsForSegment = (segmentId: string): SKU[] => {
  // Check both Sally and Michaels mappings
  const allMappings = [...SEGMENT_PRODUCT_MAPPINGS, ...MICHAELS_SEGMENT_MAPPINGS]
  const mapping = allMappings.find(m => m.segmentId === segmentId)
  if (!mapping) return []
  
  return mapping.categoryIds.flatMap(catId => getSKUsByCategory(catId))
}

/**
 * Get product groups for campaign ProductStep (Sally Beauty)
 */
export const getProductGroupsForCampaign = (segmentNames?: string[]) => {
  return SEGMENT_PRODUCT_MAPPINGS.map((mapping, index) => {
    const skus = getSKUsForSegment(mapping.segmentId)
    return {
      segmentId: mapping.segmentId,
      segmentName: segmentNames?.[index] || mapping.segmentName,
      group: mapping.group,
      baseSkuCount: skus.length * 50, // Simulated inventory count
      rationale: mapping.rationale,
      color: mapping.color,
      skus: skus.map(s => ({
        id: s.sku,
        name: s.name,
        price: Math.floor(Math.random() * 50) + 10, // Random price for demo
        image: s.imageUrl,
        visualDescription: s.visualDescription
      }))
    }
  })
}

/**
 * Get product groups for Michaels campaigns
 */
export const getMichaelsProductGroups = (segmentNames?: string[]) => {
  return MICHAELS_SEGMENT_MAPPINGS.map((mapping, index) => {
    const skus = getSKUsForSegment(mapping.segmentId)
    return {
      segmentId: mapping.segmentId,
      segmentName: segmentNames?.[index] || mapping.segmentName,
      group: mapping.group,
      baseSkuCount: skus.length * 100, // Simulated inventory count
      rationale: mapping.rationale,
      color: mapping.color,
      skus: skus.map(s => ({
        id: s.sku,
        name: s.name,
        price: s.price || Math.floor(Math.random() * 200) + 50,
        discountedPrice: s.discountedPrice,
        offerPercent: s.offerPercent,
        image: s.imageUrl,
        visualDescription: s.visualDescription
      }))
    }
  })
}

/**
 * Get product groups by client
 */
export const getProductGroupsByClient = (client: 'sally' | 'michaels', segmentNames?: string[]) => {
  return client === 'michaels' ? getMichaelsProductGroups(segmentNames) : getProductGroupsForCampaign(segmentNames)
}

// ============================================================================
// SUMMARY STATS
// ============================================================================

export const getProductStats = () => ({
  totalCategories: CATEGORIES.length,
  totalSKUs: getAllSKUs().length,
  sallyCategories: SALLY_CATEGORIES.length,
  michaelsCategories: MICHAELS_CATEGORIES.length,
  categorySummary: CATEGORIES.map(c => ({
    id: c.id,
    name: c.name,
    client: c.client,
    skuCount: c.items.length
  }))
})

// Log stats on load (development only)
if (import.meta.env.DEV) {
  console.log('📦 Products Loaded:', getProductStats())
}
