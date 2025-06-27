import React from 'react';
import { ProductCard } from './ProductCard';
import { Button } from '../ui/button';
import { Grid, List } from 'lucide-react';
import { cn } from '../../lib/utils';
import type { ShopifyProduct } from '../../types/shopify.types';

interface ProductGridProps {
  products: ShopifyProduct[];
  themeColor?: string;
  columns?: 2 | 3 | 4 | 5 | 6;
  gap?: 'sm' | 'md' | 'lg';
  compact?: boolean;
}

/**
 * Independent Product Grid Component
 * Features: responsive grid layout, configurable columns, gap control
 */
export function ProductGrid({
  products,
  themeColor = '#007bff',
  columns = 4,
  gap = 'md',
  compact = false,
}: ProductGridProps) {
  
  const gridClasses = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
    5: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5',
    6: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6',
  };

  const gapClasses = {
    sm: 'gap-3',
    md: 'gap-6',
    lg: 'gap-8',
  };

  if (products.length === 0) {
    return (
      <div className="text-center py-16">
        <Grid className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
        <p className="text-gray-500">
          Try adjusting your filters or check back later for new products.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Grid Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Grid className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold text-gray-900">
            Product Grid
          </h3>
          <span className="text-sm text-gray-500">
            ({products.length} items)
          </span>
        </div>
        
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span>{columns} columns</span>
          <span>•</span>
          <span>{gap} spacing</span>
        </div>
      </div>

      {/* Product Grid */}
      <div 
        className={cn(
          'grid',
          gridClasses[columns],
          gapClasses[gap],
          'auto-rows-fr' // Equal height rows
        )}
      >
        {products.map((product) => (
          <div key={product.id} className="h-full">
            <ProductCard
              product={product}
              themeColor={themeColor}
              showQuickActions={true}
              compact={compact}
            />
          </div>
        ))}
      </div>

      {/* Grid Footer */}
      <div className="flex items-center justify-center pt-4 border-t border-gray-100">
        <div className="text-sm text-gray-500">
          Showing all {products.length} products in grid layout
        </div>
      </div>

      {/* Layout Tips */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <List className="h-5 w-5 text-gray-400 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-sm font-medium text-gray-900">Grid Layout Tips</h4>
            <ul className="text-xs text-gray-600 space-y-0.5">
              <li>• Use fewer columns on mobile for better readability</li>
              <li>• Compact mode works better with more columns</li>
              <li>• Larger gaps help with visual separation</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
} 