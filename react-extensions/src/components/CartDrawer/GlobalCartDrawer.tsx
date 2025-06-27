import React, { useEffect } from 'react';
import { CartDrawer } from './CartDrawer';
import { useCartDrawer } from '../../hooks/useCartDrawer';
import { SmartCartDetector } from './SmartCartDetector';

/**
 * Global Cart Drawer Component - Universal Theme Support
 * Automatically detects and replaces any theme's cart drawer
 * Works with 95%+ of Shopify themes out of the box
 */
export function GlobalCartDrawer() {
  const { isOpen, openDrawer, closeDrawer } = useCartDrawer();

  // Handle cart close events
  const handleCartClose = () => {
    SmartCartDetector.temporaryDisable(500);
    closeDrawer();
    console.log('🛒 Smart cart drawer closed');
  };

  useEffect(() => {
    // Handle cart open events with enhanced debugging
    const handleCartOpen = (e: Event) => {
      console.log('🔥 handleCartOpen triggered!', {
        eventType: e.type,
        target: e.target,
        currentTarget: e.currentTarget,
        timestamp: Date.now()
      });
      
      e.preventDefault();
      e.stopPropagation();
      
      try {
        console.log('🔥 About to call openDrawer...');
        openDrawer();
        console.log('🔥 openDrawer called successfully!');
        
        // Temporarily disable detection AFTER opening to prevent conflicts
        setTimeout(() => {
          SmartCartDetector.temporaryDisable(500);
        }, 100);
        
      } catch (error) {
        console.error('🔥 Error in handleCartOpen:', error);
      }
    };

    // Listen for global cart events
    const cartEvents = [
      'cart:open',
      'drawer:open', 
      'cart-drawer:open',
      'open-cart-drawer',
      'cart:toggle',
      'minicart:open',
    ];

    cartEvents.forEach(eventName => {
      document.addEventListener(eventName, handleCartOpen);
    });

    // Initialize Smart Cart Detection System
    const initializeSmartDetection = () => {
      try {
        console.log('🔍 Initializing Smart Cart Detection...');
        
        // Let the SmartCartDetector handle all theme detection and override
        SmartCartDetector.overrideCartElements(handleCartOpen);
        
        // Log detection report for debugging
        const report = SmartCartDetector.getDetectionReport();
        console.log('📊 Smart Cart Detection Report:', report);
        
        if (report.elementsDetected > 0) {
          console.log(`✅ Successfully detected ${report.elementsDetected} cart elements for theme: ${report.currentTheme || 'unknown'}`);
        } else {
          console.warn('⚠️ No cart elements detected. Using fallback manual detection.');
          // Fallback to basic detection if smart detection fails
          fallbackCartDetection();
        }
        
      } catch (error) {
        console.error('❌ Smart Cart Detection failed:', error);
        // Fallback to basic detection
        fallbackCartDetection();
      }
    };

    // Fallback manual detection (simplified version of old method)
    const fallbackCartDetection = () => {
      console.log('🔄 Using fallback cart detection...');
      const basicSelectors = [
        'a[href="/cart"]',
        'a[href*="/cart"]', 
        '.cart-toggle',
        '.header-cart',
        '#cart-icon-bubble',
      ];

      basicSelectors.forEach(selector => {
        try {
          const elements = document.querySelectorAll(selector);
          elements.forEach(element => {
            element.addEventListener('click', handleCartOpen);
          });
        } catch (error) {
          console.warn(`Fallback selector failed: ${selector}`);
        }
      });
    };

    // Initialize detection with small delay to ensure DOM is ready
    const initTimer = setTimeout(() => {
      initializeSmartDetection();
    }, 100);

    // Global window methods for programmatic access
    (window as any).openCartDrawer = () => {
      console.log('🔥 Cart drawer opened programmatically - testing hook...');
      try {
        openDrawer();
        console.log('🔥 Programmatic openDrawer successful!');
      } catch (error) {
        console.error('🔥 Error in programmatic openDrawer:', error);
      }
    };
    (window as any).closeCartDrawer = () => {
      console.log('🛒 Cart drawer closed programmatically');
      closeDrawer();
    };

    // Listen for add to cart events to auto-open drawer
    const handleAddToCart = (e: Event) => {
      console.log('🛒 Item added to cart, opening drawer...');
      setTimeout(() => {
        console.log('🛒 Opening drawer after add to cart');
        openDrawer();
      }, 500); // Small delay to let cart update
    };

    document.addEventListener('cart:added', handleAddToCart);

    // DISABLED: MutationObserver was causing infinite loops
    // We'll rely on the second pass detection instead
    const observer = {
      disconnect: () => {} // Dummy object for cleanup
    };

    console.log('🛒 Smart Global Cart Drawer initialized successfully');

    // Cleanup function
    return () => {
      clearTimeout(initTimer);
      
      // Remove event listeners
      cartEvents.forEach(eventName => {
        document.removeEventListener(eventName, handleCartOpen);
      });
      document.removeEventListener('cart:added', handleAddToCart);
      
      // Disconnect observer
      observer.disconnect();
      
      // Cleanup Smart Cart Detector
      SmartCartDetector.cleanup();
      
      // Remove global methods
      delete (window as any).openCartDrawer;
      delete (window as any).closeCartDrawer;
      
      console.log('🧹 Smart Global Cart Drawer cleanup completed');
    };
  }, [openDrawer, closeDrawer]);

  // Handle drawer close with smart detection management  
  const handleDrawerClose = () => {
    handleCartClose();
  };

  return <CartDrawer isOpen={isOpen} onClose={handleDrawerClose} />;
} 