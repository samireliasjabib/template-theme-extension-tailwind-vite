/**
 * Utility functions for formatting data
 * Following clean architecture principles
 */

import { formatShopifyPrice } from './shopify-products';

/**
 * Format price in cents to currency string
 * Re-exports the existing formatShopifyPrice function
 */
export function formatPrice(cents: number): string {
  return formatShopifyPrice(cents);
}

/**
 * Format price with custom currency
 */
export function formatPriceWithCurrency(cents: number, currency: string = 'USD'): string {
  const dollars = cents / 100;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
  }).format(dollars);
}

/**
 * Format product title (truncate if too long)
 */
export function formatProductTitle(title: string, maxLength: number = 50): string {
  if (title.length <= maxLength) return title;
  return title.substring(0, maxLength) + '...';
}

/**
 * Format variant title for display
 */
export function formatVariantTitle(title: string): string {
  if (!title || title === 'Default Title') return '';
  return title;
}

/**
 * Format weight for display
 */
export function formatWeight(grams: number, unit: 'kg' | 'lb' | 'g' = 'g'): string {
  if (!grams || grams <= 0) return '';
  
  switch (unit) {
    case 'kg':
      return `${(grams / 1000).toFixed(2)} kg`;
    case 'lb':
      return `${(grams * 0.00220462).toFixed(2)} lb`;
    default:
      return `${grams} g`;
  }
}

/**
 * Format percentage for discounts
 */
export function formatDiscountPercentage(originalPrice: number, salePrice: number): string {
  if (!originalPrice || !salePrice || salePrice >= originalPrice) return '';
  
  const discount = ((originalPrice - salePrice) / originalPrice) * 100;
  return `${Math.round(discount)}% OFF`;
}

/**
 * Format inventory status
 */
export function formatInventoryStatus(available: boolean, quantity?: number): string {
  if (!available) return 'Out of Stock';
  if (quantity === undefined) return 'In Stock';
  if (quantity <= 0) return 'Out of Stock';
  if (quantity <= 5) return `Only ${quantity} left`;
  return 'In Stock';
}

/**
 * Format date for display
 */
export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return dateString;
  }
}

/**
 * Slugify text for URLs
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

/**
 * Capitalize first letter of each word
 */
export function titleCase(text: string): string {
  return text
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
} 