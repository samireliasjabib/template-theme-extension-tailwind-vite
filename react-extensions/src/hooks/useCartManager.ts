import { useState } from 'react';
import { useShopifyCart } from './useShopifyCart';

/**
 * Hook for managing cart operations and UI state
 * Centralizes cart actions, loading states, and error handling
 */
export function useCartManager() {
  const {
    cart,
    loading,
    error,
    itemCount,
    updateQuantity,
    removeFromCart,
    clearCart,
    refreshCart
  } = useShopifyCart();

  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  /**
   * Handle quantity updates with loading state
   */
  const handleQuantityUpdate = async (variantId: number, newQuantity: number) => {
    if (newQuantity < 0) return;
    
    setIsUpdating(variantId.toString());
    
    try {
      if (newQuantity === 0) {
        await removeFromCart(variantId);
      } else {
        await updateQuantity(variantId, newQuantity);
      }
    } catch (error) {
      console.error('Failed to update quantity:', error);
    } finally {
      setIsUpdating(null);
    }
  };

  /**
   * Handle checkout navigation
   */
  const handleCheckout = () => {
    window.location.href = '/checkout';
  };

  /**
   * Handle clear cart with confirmation
   */
  const handleClearCart = async () => {
    try {
      await clearCart();
    } catch (error) {
      console.error('Failed to clear cart:', error);
    }
  };

  return {
    // Cart data
    cart,
    loading,
    error,
    itemCount,
    
    // Loading states
    isUpdating,
    
    // Actions
    handleQuantityUpdate,
    handleCheckout,
    handleClearCart,
    refreshCart,
  };
} 