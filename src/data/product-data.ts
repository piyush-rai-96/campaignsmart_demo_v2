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

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface SKU {
  sku: string           // Unique identifier
  name: string          // Display name
  visualDescription: string  // For accessibility and context
  imageUrl: string      // For rendering images - SINGLE SOURCE
}

export interface Category {
  id: string
  name: string
  items: SKU[]
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

const productData: ProductData = sallyProductsData as ProductData

// ============================================================================
// EXPORTED DATA & HELPERS
// ============================================================================

/**
 * All categories from the standardized JSON
 */
export const CATEGORIES: Category[] = productData.categories

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
 * Default segment-to-category mapping for campaigns
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
 * Get SKUs for a segment based on its category mappings
 */
export const getSKUsForSegment = (segmentId: string): SKU[] => {
  const mapping = SEGMENT_PRODUCT_MAPPINGS.find(m => m.segmentId === segmentId)
  if (!mapping) return []
  
  return mapping.categoryIds.flatMap(catId => getSKUsByCategory(catId))
}

/**
 * Get product groups for campaign ProductStep
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

// ============================================================================
// SUMMARY STATS
// ============================================================================

export const getProductStats = () => ({
  totalCategories: CATEGORIES.length,
  totalSKUs: getAllSKUs().length,
  categorySummary: CATEGORIES.map(c => ({
    id: c.id,
    name: c.name,
    skuCount: c.items.length
  }))
})

// Log stats on load (development only)
if (import.meta.env.DEV) {
  console.log('📦 Sally Products Loaded:', getProductStats())
}
