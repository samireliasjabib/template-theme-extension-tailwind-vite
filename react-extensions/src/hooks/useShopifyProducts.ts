import { useState, useEffect, useCallback, useRef } from 'react';
import { ShopifyProductsFetcher, ShopifyProductAPI, convertShopifyProduct } from '../utils/shopify-products';

interface UseShopifyProductsReturn {
  products: ShopifyProductAPI[];
  convertedProducts: any[];
  loading: boolean;
  error: string | null;
  hasProducts: boolean;
  
  // Actions
  fetchProducts: () => Promise<void>;
  searchProducts: (query: string) => Promise<void>;
  getProductByHandle: (handle: string) => Promise<ShopifyProductAPI | null>;
  
  // State
  isSearching: boolean;
  lastQuery: string | null;
}

/**
 * React hook for fetching and managing Shopify products
 */
export const useShopifyProducts = (autoFetch: boolean = true): UseShopifyProductsReturn => {
  const [products, setProducts] = useState<ShopifyProductAPI[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [lastQuery, setLastQuery] = useState<string | null>(null);
  
  // Use refs to prevent infinite loops
  const hasInitialized = useRef(false);
  const isFetching = useRef(false);

  // Computed values
  const hasProducts = products.length > 0;
  const convertedProducts = products.map(convertShopifyProduct);

  /**
   * Fetch featured products
   */
  const fetchProducts = useCallback(async () => {
    // Prevent multiple simultaneous fetches
    if (isFetching.current) {
      console.log('🔄 Fetch already in progress, skipping...');
      return;
    }
    
    try {
      isFetching.current = true;
      setLoading(true);
      setError(null);
      setLastQuery(null);
      
      console.log('🛍️ Fetching featured products...');
      
      // Debug all endpoints first
      await ShopifyProductsFetcher.debugAllEndpoints();
      
      const fetchedProducts = await ShopifyProductsFetcher.getFeaturedProducts(6);
      
      if (fetchedProducts.length > 0) {
        setProducts(fetchedProducts);
        console.log(`✅ Loaded ${fetchedProducts.length} products:`, 
          fetchedProducts.map(p => ({ id: p.id, title: p.title, price: p.price_min }))
        );
      } else {
        setError('No products found in store. Create some products to test the integration.');
        console.warn('⚠️ No products found - this could be because:');
        console.warn('1. No products exist in the store');
        console.warn('2. Products are not published/available');
        console.warn('3. API endpoints are not accessible');
        console.warn('4. CORS or authentication issues');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch products';
      setError(errorMessage);
      console.error('❌ Error fetching products:', err);
    } finally {
      setLoading(false);
      isFetching.current = false;
    }
  }, []); // No dependencies to prevent infinite loops

  /**
   * Search products by query
   */
  const searchProducts = useCallback(async (query: string) => {
    if (isSearching || !query.trim()) return;
    
    try {
      setIsSearching(true);
      setError(null);
      setLastQuery(query);
      
      console.log(`🔍 Searching products for: "${query}"`);
      const searchResults = await ShopifyProductsFetcher.searchProducts(query, 10);
      
      if (searchResults.length > 0) {
        setProducts(searchResults);
        console.log(`✅ Found ${searchResults.length} search results`);
      } else {
        setProducts([]);
        setError(`No products found for "${query}"`);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to search products';
      setError(errorMessage);
      console.error('❌ Error searching products:', err);
    } finally {
      setIsSearching(false);
    }
  }, [isSearching]);

  /**
   * Get single product by handle
   */
  const getProductByHandle = useCallback(async (handle: string): Promise<ShopifyProductAPI | null> => {
    try {
      console.log(`🔍 Fetching product by handle: ${handle}`);
      const product = await ShopifyProductsFetcher.getProductByHandle(handle);
      
      if (product) {
        console.log(`✅ Found product: ${product.title}`);
      } else {
        console.warn(`❌ Product not found: ${handle}`);
      }
      
      return product;
    } catch (err) {
      console.error('❌ Error fetching product by handle:', err);
      return null;
    }
  }, []);

  // Auto-fetch products on mount if enabled (only once)
  useEffect(() => {
    if (autoFetch && !hasInitialized.current && !isFetching.current) {
      hasInitialized.current = true;
      console.log('🚀 Initializing product fetch...');
      fetchProducts();
    }
  }, [autoFetch, fetchProducts]);

  return {
    products,
    convertedProducts,
    loading,
    error,
    hasProducts,
    fetchProducts,
    searchProducts,
    getProductByHandle,
    isSearching,
    lastQuery,
  };
}; 