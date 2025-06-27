/**
 * Cart Helper Functions
 * Pure functions for cart-related operations and data transformations
 */

import { formatPrice, formatVariantTitle } from '../utils/format-helpers';

export interface CartItem {
  id: number;
  variant_id: number;
  product_id: number;
  title: string;
  product_title: string;
  variant_title?: string;
  price: number;
  line_price: number;
  quantity: number;
  image?: string;
  url?: string;
  handle?: string;
}

export interface Cart {
  items: CartItem[];
  total_price: number;
  item_count: number;
  currency: string;
  note?: string;
}

export interface SeedingProgress {
  progress: number;
  message: string;
  isComplete: boolean;
  stage: 'initializing' | 'loading' | 'syncing' | 'complete';
}

/**
 * Calculate total items in cart
 */
export function calculateItemCount(items: CartItem[]): number {
  return items.reduce((total, item) => total + item.quantity, 0);
}

/**
 * Calculate cart subtotal
 */
export function calculateSubtotal(items: CartItem[]): number {
  return items.reduce((total, item) => total + item.line_price, 0);
}

/**
 * Format cart item for display with all computed fields
 */
export function formatCartItem(item: CartItem) {
  return {
    ...item,
    formattedPrice: formatPrice(item.price),
    formattedLinePrice: formatPrice(item.line_price),
    formattedVariantTitle: formatVariantTitle(item.variant_title || ''),
    displayImage: item.image || 'https://via.placeholder.com/64x64/f8f9fa/6c757d?text=No+Image',
    displayTitle: item.product_title || item.title || 'Product',
    hasVariant: Boolean(item.variant_title && item.variant_title !== 'Default Title'),
  };
}

/**
 * Group cart items by product for better organization
 */
export function groupCartItemsByProduct(items: CartItem[]) {
  return items.reduce((groups, item) => {
    const productId = item.product_id;
    if (!groups[productId]) {
      groups[productId] = [];
    }
    groups[productId].push(item);
    return groups;
  }, {} as Record<number, CartItem[]>);
}

/**
 * Validate cart item data structure
 */
export function validateCartItem(item: any): item is CartItem {
  return (
    typeof item === 'object' &&
    item !== null &&
    typeof item.id === 'number' &&
    typeof item.variant_id === 'number' &&
    typeof item.quantity === 'number' &&
    item.quantity > 0 &&
    typeof item.price === 'number' &&
    item.price >= 0
  );
}

/**
 * Filter and validate cart items
 */
export function filterValidCartItems(items: any[]): CartItem[] {
  return items.filter(validateCartItem);
}

/**
 * Check if cart is empty
 */
export function isCartEmpty(cart: Cart | null): boolean {
  return !cart || !cart.items || cart.items.length === 0;
}

/**
 * Find cart item by variant ID
 */
export function findCartItemByVariantId(items: CartItem[], variantId: number): CartItem | undefined {
  return items.find(item => item.variant_id === variantId);
}

/**
 * Calculate shipping threshold progress (if implementing free shipping)
 */
export function calculateShippingProgress(currentTotal: number, threshold: number = 5000): {
  progress: number;
  remaining: number;
  isEligible: boolean;
} {
  const progress = Math.min((currentTotal / threshold) * 100, 100);
  const remaining = Math.max(threshold - currentTotal, 0);
  
  return {
    progress,
    remaining,
    isEligible: currentTotal >= threshold,
  };
}

/**
 * Generate seeding progress simulation for cart drawer
 */
export function generateSeedingProgress(step: number = 0): SeedingProgress {
  const progressSteps: SeedingProgress[] = [
    {
      progress: 0,
      message: "Initializing cart drawer...",
      isComplete: false,
      stage: 'initializing'
    },
    {
      progress: 25,
      message: "Loading cart items...",
      isComplete: false,
      stage: 'loading'
    },
    {
      progress: 50,
      message: "Syncing with theme cart...",
      isComplete: false,
      stage: 'syncing'
    },
    {
      progress: 75,
      message: "Applying cart styles...",
      isComplete: false,
      stage: 'syncing'
    },
    {
      progress: 100,
      message: "Cart drawer ready!",
      isComplete: true,
      stage: 'complete'
    }
  ];

  const currentStep = Math.min(step, progressSteps.length - 1);
  return progressSteps[currentStep];
}

/**
 * Simulate progressive loading with realistic timing
 */
export function simulateCartSeeding(): Promise<SeedingProgress[]> {
  return new Promise((resolve) => {
    const steps: SeedingProgress[] = [];
    let currentStep = 0;
    
    const progressInterval = setInterval(() => {
      const progress = generateSeedingProgress(currentStep);
      steps.push(progress);
      currentStep++;
      
      if (progress.isComplete) {
        clearInterval(progressInterval);
        resolve(steps);
      }
    }, 800); // 800ms per step for realistic timing
  });
}

/**
 * Format cart summary for display
 */
export function formatCartSummary(cart: Cart): {
  itemCount: number;
  formattedTotal: string;
  itemText: string;
  isEmpty: boolean;
} {
  const itemCount = calculateItemCount(cart.items);
  const isEmpty = isCartEmpty(cart);
  
  return {
    itemCount,
    formattedTotal: formatPrice(cart.total_price),
    itemText: itemCount === 1 ? 'item' : 'items',
    isEmpty,
  };
}

/**
 * Generate cart item key for React rendering
 */
export function generateCartItemKey(item: CartItem): string {
  return `cart-item-${item.id}-${item.variant_id}`;
}

/**
 * Sort cart items by preference (newest first, then by product title)
 */
export function sortCartItems(items: CartItem[]): CartItem[] {
  return [...items].sort((a, b) => {
    // First by ID (newest first, assuming higher ID = newer)
    if (a.id !== b.id) {
      return b.id - a.id;
    }
    
    // Then by product title alphabetically
    const titleA = a.product_title || a.title || '';
    const titleB = b.product_title || b.title || '';
    return titleA.localeCompare(titleB);
  });
}

/**
 * Check if item can be incremented (inventory limits, etc.)
 */
export function canIncrementItem(item: CartItem, maxQuantity: number = 99): boolean {
  return item.quantity < maxQuantity;
}

/**
 * Check if item can be decremented
 */
export function canDecrementItem(item: CartItem): boolean {
  return item.quantity > 1;
}

/**
 * Calculate line price safely
 */
export function calculateLinePrice(price: number, quantity: number): number {
  return Math.round(price * quantity);
}

/**
 * Format cart for analytics/tracking
 */
export function formatCartForAnalytics(cart: Cart): {
  totalValue: number;
  itemCount: number;
  productIds: number[];
  variantIds: number[];
} {
  return {
    totalValue: cart.total_price / 100, // Convert cents to dollars
    itemCount: calculateItemCount(cart.items),
    productIds: [...new Set(cart.items.map(item => item.product_id))],
    variantIds: cart.items.map(item => item.variant_id),
  };
} 