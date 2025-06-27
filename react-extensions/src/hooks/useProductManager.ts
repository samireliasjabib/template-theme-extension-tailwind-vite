import { useState, useEffect } from 'react';
import { useShopifyCart } from './useShopifyCart';
import { ShopifyApiService } from '../services/shopify-api.service';
import type { ShopifyProduct } from '../types/shopify.types';

/**
 * Hook for managing product data loading, validation, and cart integration
 * Centralizes all product-related operations and state management
 */
export function useProductManager(productCount: number = 12) {
  const [products, setProducts] = useState<ShopifyProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [validationWarnings, setValidationWarnings] = useState<string[]>([]);

  // Cart integration
  const { 
    itemCount, 
    totalPrice, 
    cart, 
    error: cartError, 
    addToCart, 
    isItemAdding, 
    lastAddedItem 
  } = useShopifyCart();

  // Fetch products with enhanced error handling
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        console.log('🚀 useProductManager: Starting to fetch products...');
        setLoading(true);
        setError(null);
        setValidationWarnings([]);

        console.log('📞 Calling ShopifyApiService.fetchProducts with count:', productCount);
        const result = await ShopifyApiService.fetchProducts(productCount);
        console.log('📦 useProductManager: Raw result:', result);
        
        if (result.success) {
          console.log('✅ useProductManager: Setting products to state:', result.products);
          setProducts(result.products);
          console.log(`✅ Loaded ${result.products.length} products with data validation`);
          
          // Check for common data quality issues
          const warnings = validateProductData(result.products);
          setValidationWarnings(warnings);
        } else {
          console.error('❌ useProductManager: API call failed:', result.error);
          setError(result.error || 'Could not load products');
        }
      } catch (err) {
        console.error('❌ useProductManager: Exception caught:', err);
        setError('Error loading products from proxy');
      } finally {
        console.log('🏁 useProductManager: Setting loading to false');
        setLoading(false);
      }
    };

    fetchProducts();
  }, [productCount]);

  // Validate product data quality
  const validateProductData = (products: ShopifyProduct[]): string[] => {
    const warnings: string[] = [];
    
    const productsWithoutImages = products.filter(p => 
      !p.featured_image && (!p.images || p.images.length === 0)
    );
    const productsWithoutVariants = products.filter(p => 
      !p.variants || p.variants.length === 0
    );
    const productsWithoutDescriptions = products.filter(p => 
      !p.body_html || p.body_html.trim() === ''
    );
    
    if (productsWithoutImages.length > 0) {
      warnings.push(`${productsWithoutImages.length} products missing images`);
    }
    if (productsWithoutVariants.length > 0) {
      warnings.push(`${productsWithoutVariants.length} products without variants`);
    }
    if (productsWithoutDescriptions.length > 0) {
      warnings.push(`${productsWithoutDescriptions.length} products without descriptions`);
    }
    
    return warnings;
  };

  // Handle add to cart with enhanced error handling
  const handleAddToCart = async (variantId: number, quantity: number = 1): Promise<boolean> => {
    try {
      return await addToCart(variantId, quantity);
    } catch (err) {
      console.error('Failed to add to cart:', err);
      return false;
    }
  };

  // Refresh products
  const refreshProducts = async () => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const result = await ShopifyApiService.fetchProducts(productCount);
        
        if (result.success) {
          setProducts(result.products);
          const warnings = validateProductData(result.products);
          setValidationWarnings(warnings);
        } else {
          setError(result.error || 'Could not load products');
        }
      } catch (err) {
        setError('Error loading products from proxy');
      } finally {
        setLoading(false);
      }
    };

    await fetchProducts();
  };

  return {
    // Product data
    products,
    loading,
    error,
    validationWarnings,
    
    // Cart data
    cart,
    itemCount,
    totalPrice,
    cartError,
    isAdding,
    lastAddedItem,
    
    // Actions
    handleAddToCart,
    refreshProducts,
    
    // Computed
    hasProducts: products.length > 0,
    hasValidationIssues: validationWarnings.length > 0,
    isCartEmpty: !cart || itemCount === 0,
  };
} 