import { useState, useMemo } from 'react';
import type { ShopifyProduct } from '../types/shopify.types';

/**
 * Hook for managing product filtering and sorting
 * Centralizes all filter logic and provides computed values
 */
export function useProductFilter(products: ShopifyProduct[]) {
  const [filterByVendor, setFilterByVendor] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'vendor'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Get unique vendors
  const vendors = useMemo(() => {
    return ['all', ...new Set(products.map(p => p.vendor).filter(Boolean))];
  }, [products]);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let filtered = filterByVendor === 'all' 
      ? products 
      : products.filter(p => p.vendor === filterByVendor);

    // Sort products
    filtered = [...filtered].sort((a, b) => {
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
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [products, filterByVendor, sortBy, sortOrder]);

  return {
    // State
    filterByVendor,
    sortBy,
    sortOrder,
    
    // Computed
    vendors,
    filteredProducts,
    
    // Actions
    setFilterByVendor,
    setSortBy,
    setSortOrder,
    
    // Reset
    resetFilters: () => {
      setFilterByVendor('all');
      setSortBy('name');
      setSortOrder('asc');
    }
  };
} 