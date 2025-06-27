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
      const response = await fetch(`${this.baseUrl}/cart/add.js`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add to cart');
      }

      // Get updated cart after adding
      return await this.getCart();
    } catch (error) {
      console.error('Error adding to cart:', error);
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
   * Add to cart using traditional form submission (fallback)
   */
  static addToCartForm(variantId: string | number, quantity: number = 1): void {
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = '/cart/add';
    form.style.display = 'none';

    const variantInput = document.createElement('input');
    variantInput.type = 'hidden';
    variantInput.name = 'id';
    variantInput.value = variantId.toString();

    const quantityInput = document.createElement('input');
    quantityInput.type = 'hidden';
    quantityInput.name = 'quantity';
    quantityInput.value = quantity.toString();

    form.appendChild(variantInput);
    form.appendChild(quantityInput);
    document.body.appendChild(form);

    form.submit();
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
    try {
      // Method 1: Try modern Cart API
      const cart = await ShopifyCartAPI.addToCart({
        items: [{ id: variantId, quantity, properties }]
      });

      // Update theme UI
      ThemeIntegration.updateCartCount(cart.item_count);
      ThemeIntegration.refreshCartSections();

      return { success: true, cart };
    } catch (apiError) {
      console.warn('Cart API failed, trying fallback methods:', apiError);

      try {
        // Method 2: Try window.Shopify
        if (LegacyCartIntegration.addToCartShopifyObject(variantId, quantity)) {
          return { success: true };
        }

        // Method 3: Form submission fallback
        LegacyCartIntegration.addToCartForm(variantId, quantity);
        return { success: true };
      } catch (fallbackError) {
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