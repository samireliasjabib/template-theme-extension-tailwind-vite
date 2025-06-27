import React, { useState, useEffect } from 'react';
import { useShopifyCart } from '../hooks/useShopifyCart';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from './ui/carousel';
import { cn } from '../lib/utils';
import { ShoppingCart, Store, Info, Filter, Grid, LayoutGrid, AlertTriangle } from 'lucide-react';
import { ProductCard } from './ProductCard';
import { ShopifyApiService } from '../services/shopify-api.service';
import type { ShopifyProduct, TestingBlockProps } from '../types/shopify.types';

/**
 * Enhanced React Extension Widget with Robust Data Validation
 * Handles real-world API inconsistencies gracefully
 */
const TestingBlock: React.FC<TestingBlockProps> = ({
  blockId,
  themeColor = '#007bff',
  showDescription = true,
  animationEnabled = true,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [products, setProducts] = useState<ShopifyProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [validationWarnings, setValidationWarnings] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'carousel'>('carousel');
  const [filterByVendor, setFilterByVendor] = useState<string>('all');

  // Use cart integration
  const { itemCount, totalPrice, cart, error: cartError, addToCart, isAdding, lastAddedItem } = useShopifyCart();

  // Fetch products with enhanced error handling
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        setValidationWarnings([]);

        const result = await ShopifyApiService.fetchProducts(12);
        
        if (result.success) {
          setProducts(result.products);
          console.log(`✅ Loaded ${result.products.length} products with data validation`);
          
          // Check for common data quality issues
          const warnings: string[] = [];
          const productsWithoutImages = result.products.filter(p => !p.featured_image && (!p.images || p.images.length === 0));
          const productsWithoutVariants = result.products.filter(p => !p.variants || p.variants.length === 0);
          
          if (productsWithoutImages.length > 0) {
            warnings.push(`${productsWithoutImages.length} products missing images`);
          }
          if (productsWithoutVariants.length > 0) {
            warnings.push(`${productsWithoutVariants.length} products without variants`);
          }
          
          setValidationWarnings(warnings);
        } else {
          setError(result.error || 'Could not load products');
        }
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Error loading products from proxy');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Animation on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  // Get unique vendors for filter
  const vendors = ['all', ...new Set(products.map(p => p.vendor).filter(Boolean))];
  
  // Filter products by vendor
  const filteredProducts = filterByVendor === 'all' 
    ? products 
    : products.filter(p => p.vendor === filterByVendor);

  const handleAddToCart = async (variantId: number, quantity: number): Promise<boolean> => {
    return await addToCart(variantId, quantity);
  };

  if (loading) {
    return (
      <div className="w-full max-w-6xl mx-auto p-6">
        <div className="text-center mb-8">
          <div className="h-8 bg-muted rounded w-64 mx-auto mb-4 animate-pulse" />
          <div className="h-4 bg-muted rounded w-96 mx-auto animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array(8).fill(0).map((_, i) => (
            <div key={i} className="h-96 bg-muted rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-6xl mx-auto p-6">
        <Alert variant="destructive">
          <Info className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div 
      className={cn(
        "w-full max-w-6xl mx-auto p-6",
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
            Featured Products
          </h1>
        </div>
        
        {showDescription && (
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-6">
            Discover our curated selection with validated data & cart integration
          </p>
        )}

        {/* Data Quality Warnings */}
        {validationWarnings.length > 0 && (
          <Alert className="max-w-2xl mx-auto mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Data Quality Notes</AlertTitle>
            <AlertDescription>
              {validationWarnings.join(', ')} - handled gracefully by Zod validation
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

      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
        {/* View Mode Toggle */}
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'carousel' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('carousel')}
          >
            <LayoutGrid className="h-4 w-4 mr-2" />
            Carousel
          </Button>
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <Grid className="h-4 w-4 mr-2" />
            Grid
          </Button>
        </div>

        {/* Vendor Filter */}
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <select
            value={filterByVendor}
            onChange={(e) => setFilterByVendor(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            {vendors.map((vendor) => (
              <option key={vendor} value={vendor}>
                {vendor === 'all' ? 'All Vendors' : vendor}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Display */}
      {filteredProducts.length > 0 ? (
        viewMode === 'carousel' ? (
          /* Carousel View */
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-4">
              {filteredProducts.map((product) => (
                <CarouselItem key={product.id} className="pl-4 md:basis-1/2 lg:basis-1/3 xl:basis-1/4">
                  <ProductCard
                    product={product}
                    onAddToCart={handleAddToCart}
                    isAdding={isAdding}
                    lastAddedItem={lastAddedItem}
                    themeColor={themeColor}
                    showQuickActions={true}
                    compact={false}
                  />
                </CarouselItem>
              ))}
            </CarouselContent>
            
            <CarouselPrevious className="left-2" />
            <CarouselNext className="right-2" />
          </Carousel>
        ) : (
          /* Grid View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={handleAddToCart}
                isAdding={isAdding}
                lastAddedItem={lastAddedItem}
                themeColor={themeColor}
                showQuickActions={true}
                compact={false}
              />
            ))}
          </div>
        )
      ) : (
        /* Empty State */
        <Card className="text-center py-16">
          <CardContent>
            <Store className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <CardTitle className="mb-2">No products available</CardTitle>
            <CardDescription>
              {filterByVendor !== 'all' 
                ? `No products found for vendor "${filterByVendor}"`
                : 'Add products to your store to see them here'
              }
            </CardDescription>
            {filterByVendor !== 'all' && (
              <Button 
                onClick={() => setFilterByVendor('all')}
                variant="outline"
                className="mt-4"
              >
                Show All Products
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Cart Error Display */}
      {cartError && (
        <Alert variant="destructive" className="mt-6">
          <Info className="h-4 w-4" />
          <AlertTitle>Cart Error</AlertTitle>
          <AlertDescription>{cartError}</AlertDescription>
        </Alert>
      )}

      {/* Footer */}
      <div className="mt-8 text-center">
        <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
          <Badge variant="secondary" className="gap-1">
            <Store className="h-3 w-3" />
            React + Zod
          </Badge>
          <Badge variant="secondary" className="gap-1">
            <ShoppingCart className="h-3 w-3" />
            Validated Data
          </Badge>
          {blockId && (
            <Badge variant="outline" className="gap-1">
              ID: {blockId}
            </Badge>
          )}
          <Badge variant="outline" className="gap-1">
            {filteredProducts.length} Products
          </Badge>
          {validationWarnings.length > 0 && (
            <Badge variant="outline" className="gap-1 text-orange-600">
              <AlertTriangle className="h-3 w-3" />
              Data Fixed
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
};

export default TestingBlock; 