import React from 'react';
import { createRoot } from 'react-dom/client';
import { GlobalCartDrawer } from './components/CartDrawer/GlobalCartDrawer';
import './styles/main.css';

/**
 * Initialize Cart Drawer for Shopify extension
 */
function initializeCartDrawer() {
  console.log('🛒 Initializing Cart Drawer...');
  
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
  document.addEventListener('DOMContentLoaded', initializeCartDrawer);
} else {
  initializeCartDrawer();
}

// Also try to initialize after a short delay for dynamic content
setTimeout(initializeCartDrawer, 1000);

// Export for debugging
(window as any).initializeCartDrawer = initializeCartDrawer;

// Also initialize on Shopify section load (for theme editor)
document.addEventListener('shopify:section:load', () => {
  setTimeout(initializeCartDrawer, 100);
});

// Handle theme editor section changes
document.addEventListener('shopify:section:reorder', () => {
  setTimeout(initializeCartDrawer, 100);
});

export { GlobalCartDrawer }; 