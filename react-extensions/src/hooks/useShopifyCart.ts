import { useState, useEffect, useCallback } from 'react';
import { SmartCartManager, Cart, ShopifyCartAPI } from '../utils/shopify-cart';

interface UseShopifyCartReturn {
  cart: Cart | null;
  loading: boolean;
  error: string | null;
  itemCount: number;
  totalPrice: number;
  
  // Actions
  addToCart: (variantId: string | number, quantity?: number, properties?: Record<string, any>) => Promise<boolean>;
  removeFromCart: (variantId: string | number) => Promise<boolean>;
  updateQuantity: (variantId: string | number, quantity: number) => Promise<boolean>;
  clearCart: () => Promise<boolean>;
  openCart: () => void;
  refreshCart: () => Promise<void>;
  
  // States
  isItemAdding: (variantId: string | number) => boolean;
  lastAddedItem: string | null;
}

/**
 * React hook for Shopify cart management
 * Provides all cart operations with loading states and error handling
 */
export const useShopifyCart = (): UseShopifyCartReturn => {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addingItems, setAddingItems] = useState<Set<string>>(new Set());
  const [lastAddedItem, setLastAddedItem] = useState<string | null>(null);

  const shop = window.location.hostname;

  console.log(shop ,'testing');


  const [dataProxy, setDataProxy] = useState<any>(null);

  console.log('🔍 Current dataProxy state:', dataProxy);


  useEffect(() => {
    console.log('🔍 Sending POST to proxy for shop:', shop);
    console.log('🌍 Current window location:', window.location);
    
    if (!shop) {
      console.log('⚠️ No shop available, skipping request');
      return;
    }
    
    // Real API call to get products from Shopify Admin API
    console.log('🚀 Fetching real products from Shopify Admin API...');
    
    fetch(`/apps/recommendations?shop=${shop}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'get_recommendations',
        shop: shop,
        timestamp: new Date().toISOString()
      }),
    })
    .then(res => {
      console.log('📡 POST Response status:', res.status);
      console.log('📡 POST Response headers:', Object.fromEntries(res.headers));
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      return res.json();
    })
    .then(data => {
      console.log('✅ POST Proxy data received:', data);
      setDataProxy(data);
    })
    .catch(err => {
      console.error('❌ POST Error:', err);
      console.log('🔄 Falling back to mock data due to error...');
      
      // Fallback to mock data if proxy fails
      setDataProxy({
        success: false,
        error: err.message,
        shop: shop,
        fallback: true,
        data: {
          recommendations: [
            { id: 1, title: "Fallback Product 1", price: "$19.99" },
            { id: 2, title: "Fallback Product 2", price: "$29.99" }
          ]
        },
        timestamp: new Date().toISOString()
      });
    });
  }, [shop]);

  // Computed values
  const itemCount = cart?.item_count || 0;
  const totalPrice = cart?.total_price || 0;

  /**
   * Load cart data
   */
  const refreshCart = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const cartData = await SmartCartManager.getCart();
      setCart(cartData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load cart');
      console.error('Error loading cart:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Add item to cart
   */
  const addToCart = useCallback(async (
    variantId: string | number, 
    quantity: number = 1,
    properties?: Record<string, any>
  ): Promise<boolean> => {
    const variantKey = variantId.toString();
    
    try {
      console.log('🛒 addToCart called with:', { variantId, quantity, properties });
      
      // Check if this variant is already being added
      if (addingItems.has(variantKey)) {
        console.log('⚠️ Variant already being added, skipping duplicate request');
        return false;
      }
      
      // Add small delay to prevent rate limiting on multiple simultaneous clicks
      await new Promise(resolve => setTimeout(resolve, Math.random() * 500));
      
      setAddingItems(prev => new Set(prev).add(variantKey));
      setError(null);
      setLastAddedItem(null);

      // Check if this is a test product (fake ID)
      const isTestProduct = variantId.toString().length > 15 || variantId.toString().startsWith('12345');
      
      console.log('🔍 Product type check:', { 
        variantId: variantId.toString(), 
        isTestProduct, 
        idLength: variantId.toString().length 
      });
      
      if (isTestProduct) {
        console.log('🧪 Test mode: Simulating add to cart for demo product');
        
        // Simulate loading time
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Simulate success
        setLastAddedItem(variantId.toString());
        
        // Show demo message
        alert(`🧪 Demo Mode: "${quantity} x Test Product" would be added to cart.\n\nSelect a real product from the theme editor to test actual cart integration!`);
        
        // Clear the last added item after 3 seconds
        setTimeout(() => setLastAddedItem(null), 3000);
        
        return true;
      }

      console.log('🚀 Calling SmartCartManager.addToCart with real product...');
      const result = await SmartCartManager.addToCart(variantId, quantity, properties);
      console.log('📦 SmartCartManager.addToCart result:', result);
      
      if (result.success) {
        if (result.cart) {
          setCart(result.cart);
        } else {
          // If no cart returned, refresh it
          await refreshCart();
        }
        setLastAddedItem(variantId.toString());
        
        // Try to trigger cart update events to ensure cart drawer opens
        // We'll use a timeout to avoid immediate double-opening
        setTimeout(() => {
          document.dispatchEvent(new CustomEvent('cart:updated', {
            bubbles: true,
            detail: { variantId, quantity, source: 'react-extension' }
          }));
        }, 100);
        
        console.log('✅ Product added to cart successfully');
        
        // Clear the last added item after 3 seconds
        setTimeout(() => setLastAddedItem(null), 3000);
        
        return true;
      } else {
        setError(result.error || 'Failed to add item to cart');
        return false;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add item to cart';
      setError(errorMessage);
      console.error('Error adding to cart:', err);
      return false;
    } finally {
      setAddingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(variantKey);
        return newSet;
      });
    }
  }, [refreshCart]);

  /**
   * Remove item from cart
   */
  const removeFromCart = useCallback(async (variantId: string | number): Promise<boolean> => {
    try {
      setError(null);
      await ShopifyCartAPI.removeFromCart(variantId);
      await refreshCart();
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to remove item from cart';
      setError(errorMessage);
      console.error('Error removing from cart:', err);
      return false;
    }
  }, [refreshCart]);

  /**
   * Update item quantity
   */
  const updateQuantity = useCallback(async (
    variantId: string | number, 
    quantity: number
  ): Promise<boolean> => {
    try {
      setError(null);
      await ShopifyCartAPI.updateCart({ [variantId]: quantity });
      await refreshCart();
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update cart';
      setError(errorMessage);
      console.error('Error updating cart:', err);
      return false;
    }
  }, [refreshCart]);

  /**
   * Clear entire cart
   */
  const clearCart = useCallback(async (): Promise<boolean> => {
    try {
      setError(null);
      await ShopifyCartAPI.clearCart();
      await refreshCart();
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to clear cart';
      setError(errorMessage);
      console.error('Error clearing cart:', err);
      return false;
    }
  }, [refreshCart]);

  /**
   * Open cart drawer/modal
   */
  const openCart = useCallback(() => {
    SmartCartManager.openCart();
  }, []);

  // Load cart on mount
  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  // Listen for cart updates from other parts of the page
  useEffect(() => {
    const handleCartUpdate = () => {
      refreshCart();
    };

    // Listen for custom cart events
    document.addEventListener('cart:updated', handleCartUpdate);
    document.addEventListener('cart:added', handleCartUpdate);
    document.addEventListener('cart:removed', handleCartUpdate);

    // Listen for Shopify theme events (common in themes)
    document.addEventListener('cartDrawer:updated', handleCartUpdate);
    document.addEventListener('cart-drawer:updated', handleCartUpdate);

    return () => {
      document.removeEventListener('cart:updated', handleCartUpdate);
      document.removeEventListener('cart:added', handleCartUpdate);
      document.removeEventListener('cart:removed', handleCartUpdate);
      document.removeEventListener('cartDrawer:updated', handleCartUpdate);
      document.removeEventListener('cart-drawer:updated', handleCartUpdate);
    };
  }, [refreshCart]);

  // Helper function to check if a specific variant is being added
  const isItemAdding = (variantId: string | number): boolean => {
    return addingItems.has(variantId.toString());
  };

  return {
    cart,
    loading,
    error,
    itemCount,
    totalPrice,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    openCart,
    refreshCart,
    isItemAdding,
    lastAddedItem,
  };
}; 