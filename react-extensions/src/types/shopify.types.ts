import { z } from 'zod';

/**
 * Updated Zod Schemas to match real Shopify API data
 * Made fields optional/nullable based on actual API responses
 */

// Shopify Image Schema - more flexible
export const ShopifyImageSchema = z.object({
  id: z.number(),
  product_id: z.number(),
  position: z.number(),
  alt: z.string().nullable().optional(),
  width: z.number(),
  height: z.number(),
  src: z.string().url().optional(), // Some images might not have src
  variant_ids: z.array(z.number()).optional(),
});

// Shopify Variant Schema - handle undefined fields
export const ShopifyVariantSchema = z.object({
  id: z.number(),
  title: z.string(),
  option1: z.string().nullable().optional(),
  option2: z.string().nullable().optional(),
  option3: z.string().nullable().optional(),
  sku: z.string().optional().default(''), // Often undefined in Shopify
  requires_shipping: z.boolean().optional().default(true), // Default to true
  taxable: z.boolean().optional().default(true), // Default to true
  featured_image: ShopifyImageSchema.nullable().optional(),
  available: z.boolean().optional().default(true), // Default to available
  price: z.string(),
  grams: z.number(),
  compare_at_price: z.string().nullable().optional(),
  position: z.number(),
  product_id: z.number(),
});

// Shopify Product Schema - more flexible
export const ShopifyProductSchema = z.object({
  id: z.number(),
  title: z.string(),
  handle: z.string(),
  body_html: z.string(),
  published_at: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
  vendor: z.string().default(''),
  product_type: z.string().default(''),
  tags: z.array(z.string()).default([]),
  variants: z.array(ShopifyVariantSchema),
  images: z.array(ShopifyImageSchema).optional().default([]),
  featured_image: ShopifyImageSchema.nullable().optional(),
});

// API Response Schema - unchanged
export const ProductsApiResponseSchema = z.object({
  success: z.boolean(),
  products: z.array(ShopifyProductSchema).optional(),
  count: z.number().optional(),
  shop: z.string().optional(),
  timestamp: z.string().optional(),
  error: z.string().optional(),
  message: z.string().optional(),
});

// Transform the data after validation to ensure required fields have defaults
const processShopifyProduct = (product: z.infer<typeof ShopifyProductSchema>) => ({
  ...product,
  vendor: product.vendor || '',
  product_type: product.product_type || '',
  tags: product.tags || [],
  images: product.images || [],
  variants: product.variants.map(variant => ({
    ...variant,
    sku: variant.sku || '',
    requires_shipping: variant.requires_shipping ?? true,
    taxable: variant.taxable ?? true,
    available: variant.available ?? true,
  }))
});

// Infer TypeScript types from Zod schemas
export type ShopifyImage = z.infer<typeof ShopifyImageSchema>;
export type ShopifyVariant = z.infer<typeof ShopifyVariantSchema>;
export type ShopifyProduct = ReturnType<typeof processShopifyProduct>;
export type ProductsApiResponse = z.infer<typeof ProductsApiResponseSchema>;

// Export the transform function
export { processShopifyProduct };

// Cart Types (unchanged - simpler, no complex validation needed)
export interface CartItem {
  id: number;
  product_id: number;
  variant_id: number;
  quantity: number;
  title: string;
  price: number;
  line_price: number;
  url: string;
  image: string;
  handle: string;
  requires_shipping: boolean;
  product_title: string;
  product_description: string;
  variant_title: string;
  vendor: string;
  properties: Record<string, any>;
}

export interface Cart {
  token: string;
  note: string;
  attributes: Record<string, any>;
  total_price: number;
  total_weight: number;
  item_count: number;
  items: CartItem[];
  requires_shipping: boolean;
  currency: string;
  items_subtotal_price: number;
  cart_level_discount_applications: any[];
}

// Component Props Types
export interface TestingBlockProps {
  blockId?: string;
  themeColor?: string;
  showDescription?: boolean;
  animationEnabled?: boolean;
  interactionType?: string;
  productData?: string;
}

export interface ProductCardProps {
  product: ShopifyProduct;
  onAddToCart: (variantId: number, quantity: number) => Promise<boolean>;
  isAdding: boolean;
  lastAddedItem: string | null;
  themeColor?: string;
  showQuickActions?: boolean;
  compact?: boolean;
} 