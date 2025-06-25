import React from 'react';
import { createRoot } from 'react-dom/client';
import TestingBlock from './components/TestingBlock';
import './styles/main.css';

/**
 * Initialize React components for all testing blocks on the page
 */
function initializeReactBlocks() {
  console.log('🚀 Initializing React Testing Blocks...');
  
  const blocks = document.querySelectorAll('[id^="react-testing-block-"]');
  console.log(`Found ${blocks.length} React testing blocks`);

  blocks.forEach((container, index) => {
    try {
      const blockId = container.getAttribute('data-block-id');
      const themeColor = container.getAttribute('data-theme-color') || '#007bff';
      const showDescription = container.getAttribute('data-show-description') === 'true';
      const animationEnabled = container.getAttribute('data-animation-enabled') === 'true';
      const interactionType = container.getAttribute('data-interaction-type') || 'both';
      const productData = container.getAttribute('data-product-data');
      const debugInfo = container.getAttribute('data-debug-info');
      const productId = container.getAttribute('data-product-id');
      const productTitle = container.getAttribute('data-product-title');

      console.log(`Block ${index + 1}:`, {
        blockId,
        themeColor,
        showDescription,
        animationEnabled,
        interactionType,
        hasProductData: !!productData,
        productId,
        productTitle,
        debugInfo: debugInfo ? JSON.parse(debugInfo) : null,
        productDataLength: productData ? productData.length : 0,
        productDataPreview: productData ? productData.substring(0, 100) + '...' : null
      });

      // Try to parse product data with better error handling
      let parsedProductData = null;
      if (productData) {
        try {
          parsedProductData = JSON.parse(productData);
          console.log('✅ Successfully parsed product data:', parsedProductData);
        } catch (parseError) {
          console.error('❌ Failed to parse product data:', parseError);
          console.log('Raw product data:', productData);
        }
      }

      // Clear the loading fallback
      container.innerHTML = '';

      // Create React root and render
      const root = createRoot(container);
              root.render(
          <TestingBlock
            blockId={blockId || undefined}
            themeColor={themeColor}
            showDescription={showDescription}
            animationEnabled={animationEnabled}
            interactionType={interactionType}
            productData={productData || undefined}
          />
        );

        console.log(`✅ Block ${blockId} rendered successfully`);

      console.log(`✅ Block ${blockId} rendered successfully`);
    } catch (error) {
      console.error(`❌ Error rendering block ${index + 1}:`, error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      // Show error in the UI
      container.innerHTML = `
        <div style="
          padding: 20px; 
          border: 2px solid #dc3545; 
          border-radius: 8px; 
          background: #f8d7da; 
          color: #721c24;
          margin: 10px 0;
        ">
          <h4>❌ React Component Error</h4>
          <p><strong>Error:</strong> ${errorMessage}</p>
          <p><strong>Block:</strong> ${container.id}</p>
          <details>
            <summary>Debug Info</summary>
            <pre style="background: white; padding: 10px; border-radius: 4px; margin-top: 10px;">
Block ID: ${container.getAttribute('data-block-id')}
Theme Color: ${container.getAttribute('data-theme-color')}
Has Product Data: ${!!container.getAttribute('data-product-data')}
Product Data: ${container.getAttribute('data-product-data') || 'None'}
            </pre>
          </details>
        </div>
      `;
    }
  });
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

export { TestingBlock }; 