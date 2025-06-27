import React, { useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Card } from '../ui/card';
import { Skeleton } from '../ui/skeleton';
import { AlertTriangle, ShoppingCart, Store } from 'lucide-react';
import { cn } from '../../lib/utils';

// Import all the new components and hooks
import { useProductManager } from '../../hooks/useProductManager';
import { useProductFilter } from '../../hooks/useProductFilter';
import { useCarouselMode } from '../../hooks/useCarouselMode';
import { ProductControls } from './ProductControls';
import { ProductGrid } from './ProductGrid';
import { ProductCarousel } from './ProductCarousel';
import { ProductCarouselWithDots } from './ProductCarouselWithDots';
import { ProductCarouselVertical } from './ProductCarouselVertical';

interface ProductSliderProps {
  themeColor?: string;
  showDescription?: boolean;
  animationEnabled?: boolean;
  initialViewMode?: 'grid' | 'carousel' | 'carousel-dots' | 'carousel-vertical';
  productCount?: number;
  autoPlay?: boolean;
}

/**
 * Main Product Slider Component
 * Orchestrates all product display modes with clean architecture
 */
export function ProductSlider({
  themeColor = '#007bff',
  showDescription = true,
  animationEnabled = true,
  initialViewMode = 'carousel',
  productCount = 12,
  autoPlay = false,
}: ProductSliderProps) {
  const [isVisible, setIsVisible] = useState(false);

  // Use our custom hooks
  const {
    products,
    loading,
    error,
    validationWarnings,
    cart,
    itemCount,
    totalPrice,
    cartError,
    handleAddToCart,
    hasProducts,
    hasValidationIssues,
    isCartEmpty,
  } = useProductManager(productCount);

  // Debug logging
  console.log('🎨 ProductSlider state:', {
    productsCount: products.length,
    loading,
    error,
    hasProducts,
    filteredProductsLength: 'will check after filter hook'
  });

  const {
    filteredProducts,
    filterByVendor,
    vendors,
    sortBy,
    sortOrder,
    setFilterByVendor,
    setSortBy,
    setSortOrder,
    resetFilters,
  } = useProductFilter(products);

  // Debug filtered products
  console.log('🔍 ProductSlider filtered state:', {
    originalProductsCount: products.length,
    filteredProductsCount: filteredProducts.length,
    filterByVendor,
    vendors,
    sortBy,
    sortOrder,
    firstThreeProducts: filteredProducts.slice(0, 3).map(p => ({
      id: p.id,
      title: p.title,
      vendor: p.vendor,
      hasImage: !!p.featured_image?.src
    }))
  });

  const {
    viewMode,
    setViewMode,
    autoPlay: carouselAutoPlay,
    setAutoPlay,
  } = useCarouselMode(initialViewMode);

  // Animation on mount
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  // Handle sort change
  const handleSortChange = (newSortBy: 'name' | 'price' | 'vendor', order: 'asc' | 'desc') => {
    setSortBy(newSortBy);
    setSortOrder(order);
  };

  // Loading State
  if (loading) {
    return (
      <div className="w-full max-w-6xl mx-auto p-6">
        <div className="text-center mb-8">
          <Skeleton className="h-8 w-64 mx-auto mb-4" />
          <Skeleton className="h-4 w-96 mx-auto" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array(8).fill(0).map((_, i) => (
            <Skeleton key={i} className="h-96 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="w-full max-w-6xl mx-auto p-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error Loading Products</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div 
      className={cn(
        "w-full max-w-7xl mx-auto p-6",
        isVisible && animationEnabled && "animate-in fade-in duration-500"
      )}
      style={{ 
        '--theme-color': themeColor,
      } as React.CSSProperties}
    >
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Store className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            Enhanced Product Showcase
          </h1>
        </div>
        
        {showDescription && (
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-6">
            Experience our advanced product slider with multiple view modes, smart filtering, and beautiful animations
          </p>
        )}

        {/* Data Quality Warnings */}
        {hasValidationIssues && (
          <Alert className="max-w-2xl mx-auto mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Data Quality Notes</AlertTitle>
            <AlertDescription>
              {validationWarnings.join(', ')} - handled gracefully by our validation system
            </AlertDescription>
          </Alert>
        )}
        
        {/* Cart Status */}
        {cart && itemCount > 0 && (
          <Alert className="max-w-md mx-auto mb-6">
            <ShoppingCart className="h-4 w-4" />
            <AlertTitle>Shopping Cart</AlertTitle>
            <AlertDescription>
              {itemCount} items • ${(totalPrice / 100).toFixed(2)}
            </AlertDescription>
          </Alert>
        )}
      </div>

      {/* Product Controls */}
      {hasProducts && (
        <div className="mb-8">
          <ProductControls
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            filterByVendor={filterByVendor}
            vendors={vendors}
            onVendorChange={setFilterByVendor}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSortChange={handleSortChange}
            filteredCount={filteredProducts.length}
            totalCount={products.length}
            onResetFilters={resetFilters}
          />
        </div>
      )}

      {/* Debug Info - Show current state */}
      <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h4 className="font-semibold text-blue-900 mb-2">🔍 Debug Info:</h4>
        <div className="text-sm space-y-1">
          <p><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</p>
          <p><strong>Error:</strong> {error || 'None'}</p>
          <p><strong>Original Products:</strong> {products.length}</p>
          <p><strong>Filtered Products:</strong> {filteredProducts.length}</p>
          <p><strong>View Mode:</strong> {viewMode}</p>
          <p><strong>Filter by Vendor:</strong> {filterByVendor}</p>
          <p><strong>Has Products:</strong> {hasProducts ? 'Yes' : 'No'}</p>
          {filteredProducts.length > 0 && (
            <p><strong>First Product:</strong> {filteredProducts[0]?.title}</p>
          )}
        </div>
      </div>

      {/* Product Display */}
      {(() => {
        console.log('🎭 ProductSlider render decision:', {
          filteredProductsLength: filteredProducts.length,
          willShowProducts: filteredProducts.length > 0,
          viewMode,
          hasProducts,
          products: filteredProducts.slice(0, 3).map(p => ({ 
            id: p.id, 
            title: p.title,
            vendor: p.vendor,
            hasImage: !!p.featured_image?.src 
          })),
          loading,
          error,
          originalProductsLength: products.length
        });
        // Force show products if we have any data
        return filteredProducts.length > 0 || products.length > 0;
      })() ? (
        <div className="space-y-8">
          {viewMode === 'grid' && (
            <ProductGrid
              products={filteredProducts.length > 0 ? filteredProducts : products.slice(0, 12)}
              themeColor={themeColor}
              columns={4}
              gap="md"
              compact={false}
            />
          )}

          {viewMode === 'carousel' && (
            <ProductCarousel
              products={filteredProducts.length > 0 ? filteredProducts : products.slice(0, 12)}
              themeColor={themeColor}
            />
          )}

          {viewMode === 'carousel-dots' && (
            <ProductCarouselWithDots
              products={filteredProducts.length > 0 ? filteredProducts : products.slice(0, 12)}
              themeColor={themeColor}
              autoPlay={autoPlay}
              autoPlayInterval={3000}
            />
          )}

          {viewMode === 'carousel-vertical' && (
            <ProductCarouselVertical
              products={filteredProducts.length > 0 ? filteredProducts : products.slice(0, 12)}
              themeColor={themeColor}
              height={600}
              itemsPerRow={2}
            />
          )}
        </div>
      ) : (
        /* Empty State */
        <Card className="text-center py-16">
          <div className="flex flex-col items-center">
            <Store className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No products found</h3>
            <p className="text-muted-foreground mb-6">
              {filterByVendor !== 'all' || sortBy !== 'name' || sortOrder !== 'asc'
                ? 'Try adjusting your filters to see more products'
                : 'Products will appear here once they\'re added to your store'
              }
            </p>
            {(filterByVendor !== 'all' || sortBy !== 'name' || sortOrder !== 'asc') && (
              <button 
                onClick={resetFilters}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
              >
                Reset Filters
              </button>
            )}
          </div>
        </Card>
      )}

      {/* Cart Error Display */}
      {cartError && (
        <Alert variant="destructive" className="mt-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Cart Error</AlertTitle>
          <AlertDescription>{cartError}</AlertDescription>
        </Alert>
      )}

      {/* Footer Stats */}
      <div className="mt-12 pt-8 border-t border-gray-100">
        <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Store className="h-4 w-4" />
            <span>{products.length} Total Products</span>
          </div>
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-4 w-4" />
            <span>React + TypeScript + Zod</span>
          </div>
          <div className="flex items-center gap-2">
            <span>View Mode: {viewMode.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
          </div>
          {hasValidationIssues && (
            <div className="flex items-center gap-2 text-orange-600">
              <AlertTriangle className="h-4 w-4" />
              <span>Data Auto-Fixed</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 