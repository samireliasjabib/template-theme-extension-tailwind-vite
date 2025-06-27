import type { ShopifyProduct, ShopifyVariant } from '../types/shopify.types';

/**
 * Product Helper Functions
 * Pure utility functions for product data manipulation and formatting
 */

/**
 * Format money amount with currency
 */
export function formatMoney(price: string | number, currency: string = 'USD'): string {
  const amount = typeof price === 'string' ? parseFloat(price) : price;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
}

/**
 * Get the best product image URL with fallback
 */
export function getProductImage(
  product: ShopifyProduct, 
  variant?: ShopifyVariant, 
  size: string = '300x300'
): string {
  // Priority: variant image > featured image > first image > placeholder
  const imageUrl = variant?.featured_image?.src || 
                   product.featured_image?.src || 
                   product.images?.[0]?.src;
  
  console.log('🖼️ Image URL debug:', {
    variantImage: variant?.featured_image?.src,
    featuredImage: product.featured_image?.src,
    firstImage: product.images?.[0]?.src,
    selectedUrl: imageUrl,
    productTitle: product.title
  });
  
  if (!imageUrl) {
    return `https://via.placeholder.com/${size}?text=No+Image`;
  }
  
  // For Shopify CDN URLs, use their image transformation
  if (imageUrl.includes('cdn.shopify.com')) {
    // If URL already has parameters, preserve the v parameter but add size
    if (imageUrl.includes('?v=')) {
      const [baseUrl, params] = imageUrl.split('?');
      const vParam = params.split('&').find(p => p.startsWith('v='));
      return `${baseUrl}?${vParam}&width=${size.split('x')[0]}`;
    } else {
      // No existing parameters
      const baseUrl = imageUrl.split('?')[0];
      return `${baseUrl}?width=${size.split('x')[0]}`;
    }
  }
  
  return imageUrl;
}

/**
 * Get product image alt text with fallback
 */
export function getProductImageAlt(
  product: ShopifyProduct, 
  variant?: ShopifyVariant
): string {
  return variant?.featured_image?.alt || 
         product.featured_image?.alt || 
         product.title || 
         'Product image';
}

/**
 * Calculate discount percentage
 */
export function getDiscountPercentage(price: string, compareAtPrice?: string): number {
  if (!compareAtPrice) return 0;
  
  const currentPrice = parseFloat(price);
  const originalPrice = parseFloat(compareAtPrice);
  
  if (originalPrice <= currentPrice) return 0;
  
  return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
}

/**
 * Check if product is on sale
 */
export function isProductOnSale(variant: ShopifyVariant): boolean {
  return Boolean(variant.compare_at_price && 
                 parseFloat(variant.compare_at_price) > parseFloat(variant.price));
}

/**
 * Get variant title with fallback
 */
export function getVariantTitle(variant: ShopifyVariant): string {
  if (!variant.title || variant.title === 'Default Title') {
    return `Variant ${variant.id}`;
  }
  return variant.title;
}

/**
 * Generate product URL slug
 */
export function getProductSlug(product: ShopifyProduct): string {
  return product.handle || 
         product.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

/**
 * Check if product has multiple variants
 */
export function hasMultipleVariants(product: ShopifyProduct): boolean {
  return product.variants && product.variants.length > 1;
}

/**
 * Get available variants only
 */
export function getAvailableVariants(product: ShopifyProduct): ShopifyVariant[] {
  return product.variants?.filter(variant => variant.available) || [];
}

/**
 * Get product price range
 */
export function getProductPriceRange(product: ShopifyProduct): {
  min: number;
  max: number;
  formatted: string;
} {
  if (!product.variants || product.variants.length === 0) {
    return { min: 0, max: 0, formatted: 'Price not available' };
  }
  
  const prices = product.variants.map(v => parseFloat(v.price));
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  
  if (min === max) {
    return {
      min,
      max,
      formatted: formatMoney(min)
    };
  }
  
  return {
    min,
    max,
    formatted: `${formatMoney(min)} - ${formatMoney(max)}`
  };
}

/**
 * Generate random rating for demo purposes
 */
export function generateDemoRating(): { rating: number; reviews: number } {
  return {
    rating: Math.round((Math.random() * 2 + 3) * 10) / 10, // 3.0 - 5.0
    reviews: Math.floor(Math.random() * 500) + 10 // 10 - 510 reviews
  };
}

/**
 * Sort products by various criteria
 */
export function sortProducts(
  products: ShopifyProduct[], 
  sortBy: 'name' | 'price' | 'vendor' | 'created',
  order: 'asc' | 'desc' = 'asc'
): ShopifyProduct[] {
  return [...products].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'name':
        comparison = a.title.localeCompare(b.title);
        break;
      case 'price':
        const aPrice = parseFloat(a.variants[0]?.price || '0');
        const bPrice = parseFloat(b.variants[0]?.price || '0');
        comparison = aPrice - bPrice;
        break;
      case 'vendor':
        comparison = (a.vendor || '').localeCompare(b.vendor || '');
        break;
      case 'created':
        comparison = new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime();
        break;
    }
    
    return order === 'asc' ? comparison : -comparison;
  });
}

/**
 * Validate product data completeness
 */
export function validateProductCompleteness(product: ShopifyProduct): {
  isComplete: boolean;
  missingFields: string[];
  score: number;
} {
  const requiredFields = ['title', 'variants'];
  const optionalFields = ['featured_image', 'body_html', 'vendor', 'tags'];
  
  const missingRequired = requiredFields.filter(field => !product[field as keyof ShopifyProduct]);
  const missingOptional = optionalFields.filter(field => !product[field as keyof ShopifyProduct]);
  
  const totalFields = requiredFields.length + optionalFields.length;
  const presentFields = totalFields - missingRequired.length - missingOptional.length;
  const score = Math.round((presentFields / totalFields) * 100);
  
  return {
    isComplete: missingRequired.length === 0,
    missingFields: [...missingRequired, ...missingOptional],
    score
  };
} 