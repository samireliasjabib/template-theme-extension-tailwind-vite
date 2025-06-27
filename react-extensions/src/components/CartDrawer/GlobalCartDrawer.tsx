import React, { useEffect } from 'react';
import { CartDrawer } from './CartDrawer';
import { useCartDrawer } from '../../hooks/useCartDrawer';

/**
 * Global Cart Drawer Component
 * Automatically replaces theme's cart drawer
 * Listens for global cart events
 */
export function GlobalCartDrawer() {
  const { isOpen, openDrawer, closeDrawer } = useCartDrawer();

  useEffect(() => {
    // Override theme's cart drawer triggers
    const handleCartOpen = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
      openDrawer();
      console.log('🛒 Cart drawer opened via event:', e.type);
    };

    // Listen for various cart events
    const cartEvents = [
      'cart:open',
      'drawer:open',
      'cart-drawer:open',
      'open-cart-drawer',
    ];

    cartEvents.forEach(eventName => {
      document.addEventListener(eventName, handleCartOpen);
    });

    // Override cart drawer buttons and links
    const overrideCartButtons = () => {
      const cartSelectors = [
        '[data-cart-drawer-toggle]',
        '.cart-drawer-toggle',
        '.js-drawer-open-cart',
        '.cart-toggle',
        '.header-cart',
        '.cart-icon',
        '.cart-link',
        '.cart-count-bubble',
        'a[href="/cart"]',
        'a[href*="/cart"]',
        '[href="/cart"]',
        '[href*="/cart"]',
      ];

      cartSelectors.forEach(selector => {
        try {
          const elements = document.querySelectorAll(selector);
          elements.forEach(element => {
            // Remove existing listeners by cloning
            const newElement = element.cloneNode(true) as HTMLElement;
            element.parentNode?.replaceChild(newElement, element);
            
            // Add our custom listener
            newElement.addEventListener('click', handleCartOpen);
            
            // Also prevent default behavior for cart links
            if (newElement.getAttribute('href')?.includes('/cart')) {
              newElement.addEventListener('click', (e) => {
                e.preventDefault();
                handleCartOpen(e);
              });
            }
          });
        } catch (error) {
          console.warn(`Could not override selector ${selector}:`, error);
        }
      });
    };

    // Run initial override
    overrideCartButtons();

    // Re-run after DOM changes (for dynamic content)
    const observer = new MutationObserver((mutations) => {
      let shouldUpdate = false;
      mutations.forEach(mutation => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach(node => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as Element;
              // Check if added node contains cart elements
              const hasCartElements = element.querySelector && (
                element.querySelector('[data-cart-drawer-toggle]') ||
                element.querySelector('.cart-toggle') ||
                element.querySelector('.header-cart') ||
                element.querySelector('a[href*="/cart"]')
              );
              if (hasCartElements) {
                shouldUpdate = true;
              }
            }
          });
        }
      });
      
      if (shouldUpdate) {
        setTimeout(overrideCartButtons, 100);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    // Global window methods for programmatic access
    (window as any).openCartDrawer = () => {
      console.log('🛒 Cart drawer opened programmatically');
      openDrawer();
    };
    (window as any).closeCartDrawer = () => {
      console.log('🛒 Cart drawer closed programmatically');
      closeDrawer();
    };

    // Listen for add to cart events to auto-open drawer
    const handleAddToCart = (e: Event) => {
      console.log('🛒 Item added to cart, opening drawer...');
      setTimeout(() => openDrawer(), 500); // Small delay to let cart update
    };

    document.addEventListener('cart:added', handleAddToCart);

    console.log('🛒 Global Cart Drawer initialized successfully');

    return () => {
      // Cleanup
      cartEvents.forEach(eventName => {
        document.removeEventListener(eventName, handleCartOpen);
      });
      document.removeEventListener('cart:added', handleAddToCart);
      observer.disconnect();
      delete (window as any).openCartDrawer;
      delete (window as any).closeCartDrawer;
    };
  }, [openDrawer, closeDrawer]);

  return <CartDrawer isOpen={isOpen} onClose={closeDrawer} />;
} 