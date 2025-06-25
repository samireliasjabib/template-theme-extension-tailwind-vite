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
  isAdding: boolean;
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
  const [isAdding, setIsAdding] = useState(false);
  const [lastAddedItem, setLastAddedItem] = useState<string | null>(null);

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
    try {
      setIsAdding(true);
      setError(null);
      setLastAddedItem(null);

      // Check if this is a test product (fake ID)
      const isTestProduct = variantId.toString().length > 15 || variantId.toString().startsWith('12345');
      
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

      const result = await SmartCartManager.addToCart(variantId, quantity, properties);
      
      if (result.success) {
        if (result.cart) {
          setCart(result.cart);
        } else {
          // If no cart returned, refresh it
          await refreshCart();
        }
        setLastAddedItem(variantId.toString());
        
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
      setIsAdding(false);
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
    isAdding,
    lastAddedItem,
  };
}; 