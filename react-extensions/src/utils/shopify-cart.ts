/**
 * Shopify Cart Integration Utilities
 * Provides multiple methods to interact with Shopify's cart system from React components
 */

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

export interface AddToCartData {
  items: Array<{
    id: number | string;
    quantity: number;
    properties?: Record<string, any>;
  }>;
}

/**
 * Modern Shopify Cart API integration using fetch
 */
export class ShopifyCartAPI {
  private static baseUrl = window.location.origin;

  /**
   * Add item(s) to cart using Shopify's Cart API
   */
  static async addToCart(data: AddToCartData): Promise<Cart> {
    try {
      console.log('🔧 Modern Cart API called with:', data);
      
      const response = await fetch(`${this.baseUrl}/cart/add.js`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
        body: JSON.stringify(data),
      });

      console.log('📥 Modern Cart API response:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Modern Cart API error body:', errorText);
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { message: errorText };
        }
        throw new Error(errorData.message || 'Failed to add to cart');
      }

      // Get updated cart after adding
      console.log('🔄 Getting cart after Modern API add...');
      const cart = await this.getCart();
      console.log('📦 Modern Cart API success:', cart);
      return cart;
    } catch (error) {
      console.error('❌ Modern Cart API failed completely:', error);
      throw error;
    }
  }

  /**
   * Get current cart contents
   */
  static async getCart(): Promise<Cart> {
    try {
      const response = await fetch(`${this.baseUrl}/cart.js`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch cart');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching cart:', error);
      throw error;
    }
  }

  /**
   * Update cart item quantity
   */
  static async updateCart(updates: Record<string, number>): Promise<Cart> {
    try {
      const response = await fetch(`${this.baseUrl}/cart/update.js`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
        body: JSON.stringify({ updates }),
      });

      if (!response.ok) {
        throw new Error('Failed to update cart');
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating cart:', error);
      throw error;
    }
  }

  /**
   * Remove item from cart
   */
  static async removeFromCart(variantId: string | number): Promise<Cart> {
    return this.updateCart({ [variantId]: 0 });
  }

  /**
   * Clear entire cart
   */
  static async clearCart(): Promise<Cart> {
    try {
      const response = await fetch(`${this.baseUrl}/cart/clear.js`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to clear cart');
      }

      return await response.json();
    } catch (error) {
      console.error('Error clearing cart:', error);
      throw error;
    }
  }
}

/**
 * Theme Integration - Communicates with Liquid theme
 */
export class ThemeIntegration {
  /**
   * Open cart drawer - Updated to use React Sheet drawer
   */
  static openCartDrawer(): void {
    console.log('🛒 ThemeIntegration: Opening cart drawer...');
    
    // First try to open React cart drawer
    if ((window as any).openCartDrawer) {
      (window as any).openCartDrawer();
      return;
    }

    // Fallback to dispatching events for React drawer
    document.dispatchEvent(new CustomEvent('cart:open', {
      bubbles: true,
      detail: { source: 'theme-integration' }
    }));

    // Additional fallback events
    const events = [
      'drawer:open',
      'cart-drawer:open',
      'open-cart-drawer',
    ];

    events.forEach(eventName => {
      document.dispatchEvent(new CustomEvent(eventName, {
        bubbles: true,
        detail: { source: 'react-extension' }
      }));
    });

    console.log('🛒 Cart drawer events dispatched');
  }

  /**
   * Update cart count in theme header
   */
  static updateCartCount(count: number): void {
    const countSelectors = [
      '.cart-count',
      '.cart-item-count',
      '[data-cart-count]',
      '.header-cart-count',
      '.cart-counter',
      '.cart-count-bubble',
    ];

    countSelectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(element => {
        if (element.textContent !== null) {
          element.textContent = count.toString();
        }
        // Also update data attributes
        if (element.hasAttribute('data-cart-count')) {
          element.setAttribute('data-cart-count', count.toString());
        }
      });
    });

    // Dispatch event for themes that listen to cart updates
    document.dispatchEvent(new CustomEvent('cart:updated', {
      bubbles: true,
      detail: { count, source: 'react-extension' }
    }));
  }

  /**
   * Refresh cart sections (for themes using Shopify sections)
   */
  static async refreshCartSections(): Promise<void> {
    try {
      const sectionsToUpdate = [
        'cart-drawer',
        'cart-icon-bubble',
        'header-cart',
        'mini-cart',
      ];

      const sectionParams = sectionsToUpdate.join(',');
      const response = await fetch(`${window.location.pathname}?sections=${sectionParams}`, {
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
        },
      });

      if (response.ok) {
        const sections = await response.json();
        
        // Update each section
        Object.entries(sections).forEach(([sectionId, html]) => {
          const element = document.getElementById(sectionId);
          if (element && typeof html === 'string') {
            element.innerHTML = html;
          }
        });
      }
    } catch (error) {
      console.error('Error refreshing cart sections:', error);
    }
  }
}

/**
 * Legacy support for older themes
 */
export class LegacyCartIntegration {
  /**
   * Add to cart using AJAX (no redirect) - FIXED for password-protected stores
   */
  static async addToCartAjax(variantId: string | number, quantity: number = 1): Promise<Cart> {
    console.log('🔧 AJAX addToCart called with:', { variantId, quantity });
    
    const requestBody = {
      id: variantId,
      quantity: quantity
    };
    
    console.log('📤 AJAX request body:', requestBody);
    
    const response = await fetch('/cart/add.js', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
      },
      body: JSON.stringify(requestBody),
    });

    console.log('📥 AJAX response status:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ AJAX response error body:', errorText);
      throw new Error(`Failed to add to cart: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const result = await response.json();
    console.log('✅ AJAX cart add successful:', result);
    
    // Get updated cart
    console.log('🔄 Getting updated cart...');
    const updatedCart = await ShopifyCartAPI.getCart();
    console.log('📦 Updated cart:', updatedCart);
    
    return updatedCart;
  }

  /**
   * Try to use window.Shopify if available
   */
  static addToCartShopifyObject(variantId: string | number, quantity: number = 1): boolean {
    const shopify = (window as any).Shopify;
    
    if (shopify && shopify.addItem) {
      shopify.addItem(variantId, quantity);
      return true;
    }
    
    return false;
  }
}

/**
 * Smart Cart Manager - Tries multiple methods for maximum compatibility
 */
export class SmartCartManager {
  /**
   * Add to cart with automatic fallback to different methods
   */
  static async addToCart(
    variantId: string | number, 
    quantity: number = 1,
    properties?: Record<string, any>
  ): Promise<{ success: boolean; cart?: Cart; error?: string }> {
    console.log('🎯 SmartCartManager.addToCart starting with:', { variantId, quantity, properties });
    
    try {
      // Method 1: Try modern Cart API
      console.log('📞 Trying Method 1: Modern Cart API...');
      const cart = await ShopifyCartAPI.addToCart({
        items: [{ id: variantId, quantity, properties }]
      });

      console.log('✅ Method 1 SUCCESS - Modern Cart API worked!');
      // Update theme UI
      ThemeIntegration.updateCartCount(cart.item_count);
      ThemeIntegration.refreshCartSections();

      return { success: true, cart };
    } catch (apiError) {
      console.error('❌ Method 1 FAILED - Cart API error:', apiError);

      try {
        // Method 2: Try window.Shopify
        console.log('📞 Trying Method 2: window.Shopify...');
        if (LegacyCartIntegration.addToCartShopifyObject(variantId, quantity)) {
          console.log('✅ Method 2 SUCCESS - window.Shopify worked!');
          return { success: true };
        }
        console.log('⚠️ Method 2 SKIPPED - window.Shopify not available');

        // Method 3: AJAX fallback (no redirect)
        console.log('📞 Trying Method 3: AJAX fallback...');
        const cart = await LegacyCartIntegration.addToCartAjax(variantId, quantity);
        
        console.log('✅ Method 3 SUCCESS - AJAX fallback worked!');
        // Update theme UI
        ThemeIntegration.updateCartCount(cart.item_count);
        
        return { success: true, cart };
      } catch (fallbackError) {
        console.error('❌ Method 3 FAILED - AJAX fallback error:', fallbackError);
        console.error('All cart methods failed:', fallbackError);
        return { 
          success: false, 
          error: 'Failed to add item to cart. Please try refreshing the page.' 
        };
      }
    }
  }

  /**
   * Open cart with theme integration
   */
  static openCart(): void {
    ThemeIntegration.openCartDrawer();
  }

  /**
   * Get cart with error handling
   */
  static async getCart(): Promise<Cart | null> {
    try {
      return await ShopifyCartAPI.getCart();
    } catch (error) {
      console.error('Failed to get cart:', error);
      return null;
    }
  }
} 