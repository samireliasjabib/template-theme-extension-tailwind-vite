import React from 'react';
import { ProductSlider } from './ProductSlider/ProductSlider';
import type { TestingBlockProps } from '../types/shopify.types';

/**
 * Enhanced Testing Block Component
 * Now uses the new ProductSlider with clean architecture
 */
const TestingBlock: React.FC<TestingBlockProps> = ({
  blockId,
  themeColor = '#007bff',
  showDescription = true,
  animationEnabled = true,
  interactionType = 'both',
}) => {
  console.log('🎯 TestingBlock rendering with props:', {
    blockId,
    themeColor,
    showDescription,
    animationEnabled,
    interactionType
  });

  return (
    <div>
      {/* Debug info at the top */}
      <div className="text-xs text-gray-500 bg-gray-100 p-2 mb-4 rounded">
        🔍 Block: {blockId} | Theme: {themeColor} | Mode: {interactionType}
      </div>
      
      <ProductSlider
        themeColor={themeColor}
        showDescription={showDescription}
        animationEnabled={animationEnabled}
        initialViewMode="carousel"
        productCount={12}
        autoPlay={false}
      />
    </div>
  );
};

export default TestingBlock; 