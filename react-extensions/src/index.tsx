import React from 'react';
import { createRoot } from 'react-dom/client';
import { GlobalCartDrawer } from './components/CartDrawer/GlobalCartDrawer';
import './styles/main.css';
import TestingBlock from './components/TestingBlock';

/**
 * Initialize React components for Shopify extension
 */
function initializeReactBlocks() {
  console.log('🚀 Initializing React Testing Blocks...');
  
  // Initialize testing blocks
  const testingBlocks = document.querySelectorAll('[id^="react-testing-block-"]');
  console.log(`Found ${testingBlocks.length} React testing blocks`);

  testingBlocks.forEach((container, index) => {
    try {
      const blockId = container.getAttribute('data-block-id') || '';
      const themeColor = container.getAttribute('data-theme-color') || '#007bff';
      const showDescription = container.getAttribute('data-show-description') !== 'false';
      const animationEnabled = container.getAttribute('data-animation-enabled') !== 'false';
      const interactionType = container.getAttribute('data-interaction-type') || 'both';
      const productDataStr = container.getAttribute('data-product-data') || '{}';

      console.log(`Block ${index + 1}:`, {
        blockId,
        themeColor,
        showDescription,
        animationEnabled,
        interactionType,
        productData: productDataStr.substring(0, 100) + '...'
      });

      let productData = {};
      try {
        productData = JSON.parse(productDataStr);
        console.log('✅ Successfully parsed product data:', productData);
      } catch (parseError) {
        console.warn('⚠️ Failed to parse product data:', parseError);
      }

      const root = createRoot(container);
      root.render(
        <TestingBlock
          blockId={blockId}
          themeColor={themeColor}
          showDescription={showDescription}
          animationEnabled={animationEnabled}
          interactionType={interactionType}
          productData={productData}
        />
      );

      console.log(`✅ Block ${blockId} rendered successfully`);
    } catch (error) {
      console.error(`❌ Error rendering block ${index + 1}:`, error);
    }
  });

  // Initialize Global Cart Drawer
  initializeGlobalCartDrawer();
}

/**
 * Initialize Global Cart Drawer
 * This replaces the theme's default cart drawer
 */
function initializeGlobalCartDrawer() {
  console.log('🛒 Initializing Global Cart Drawer...');
  
  // Create container for cart drawer if it doesn't exist
  let cartContainer = document.getElementById('react-cart-drawer');
  
  if (!cartContainer) {
    cartContainer = document.createElement('div');
    cartContainer.id = 'react-cart-drawer';
    document.body.appendChild(cartContainer);
  }

  const root = createRoot(cartContainer);
  root.render(<GlobalCartDrawer />);
  
  console.log('✅ Global Cart Drawer initialized');
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeReactBlocks);
} else {
  initializeReactBlocks();
}

// Also try to initialize after a short delay for dynamic content
setTimeout(initializeReactBlocks, 1000);

// Export for debugging
(window as any).initializeReactBlocks = initializeReactBlocks;

// Also initialize on Shopify section load (for theme editor)
document.addEventListener('shopify:section:load', () => {
  setTimeout(initializeReactBlocks, 100);
});

// Handle theme editor section changes
document.addEventListener('shopify:section:reorder', () => {
  setTimeout(initializeReactBlocks, 100);
});

export { TestingBlock, GlobalCartDrawer }; 