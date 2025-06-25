import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Skeleton } from './ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { cn } from '../lib/utils';
import { useShopifyProducts } from '../hooks/useShopifyProducts';
import { Search, ShoppingCart, AlertCircle, Package, Heart, Star } from 'lucide-react';
import ModernProductCard from './ModernProductCard';

interface ModernProductListProps {
  className?: string;
  maxProducts?: number;
  showSearch?: boolean;
}

/**
 * Modern ProductList Component - Built entirely with shadcn/ui
 * Features beautiful cards, proper loading states, and modern interactions
 */
export const ModernProductList: React.FC<ModernProductListProps> = ({
  className = '',
  maxProducts = 6,
  showSearch = true,
}) => {
  const {
    convertedProducts,
    loading,
    error,
    hasProducts,
    fetchProducts,
    searchProducts,
    isSearching,
    lastQuery,
  } = useShopifyProducts(true);

  const [searchQuery, setSearchQuery] = React.useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      await searchProducts(searchQuery);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    fetchProducts();
  };

  const displayProducts = convertedProducts.slice(0, maxProducts);

  // Loading skeleton component
  const ProductSkeleton = () => (
    <Card className="overflow-hidden">
      <Skeleton className="h-48 w-full" />
      <CardHeader className="pb-2">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-3 w-full" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-6 w-1/3 mb-4" />
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-10 w-24" />
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className={cn("w-full max-w-7xl mx-auto p-6", className)}>
      {/* Header Section */}
      <div className="mb-8">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-primary mb-2">
            {lastQuery ? `Search Results for "${lastQuery}"` : 'Featured Products'}
          </h2>
          <p className="text-muted-foreground">
            Discover amazing products from our Shopify store
          </p>
        </div>
        
        {/* Search Section */}
        {showSearch && (
          <Card className="mb-6">
            <CardContent className="pt-6">
              <form onSubmit={handleSearch} className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search products..."
                    className="pl-10"
                    disabled={isSearching}
                  />
                </div>
                <Button
                  type="submit"
                  disabled={isSearching || !searchQuery.trim()}
                  className="shrink-0"
                >
                  {isSearching ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                </Button>
                {lastQuery && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleClearSearch}
                    disabled={loading}
                  >
                    Clear
                  </Button>
                )}
              </form>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Loading State */}
      {(loading || isSearching) && (
        <div className="space-y-6">
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent mx-auto mb-4" />
              <p className="text-muted-foreground">
                {isSearching ? 'Searching products...' : 'Loading products...'}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array(maxProducts).fill(0).map((_, i) => (
              <ProductSkeleton key={i} />
            ))}
          </div>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Unable to load products</AlertTitle>
          <AlertDescription className="mt-2">
            {error}
            <Button 
              onClick={fetchProducts} 
              variant="outline"
              size="sm"
              className="mt-3"
              disabled={loading}
            >
              Try Again
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Empty State */}
      {!loading && !error && !hasProducts && (
        <Card className="text-center py-12">
          <CardContent>
            <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <CardTitle className="mb-2">No products found</CardTitle>
            <CardDescription className="mb-6">
              {lastQuery 
                ? `No products match "${lastQuery}". Try a different search term.`
                : 'No products are available in this store.'
              }
            </CardDescription>
            {lastQuery && (
              <Button onClick={handleClearSearch} variant="outline">
                Show All Products
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Products Grid */}
      {!loading && hasProducts && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {displayProducts.map((product) => (
              <ModernProductCard
                key={product.id}
                product={product}
                themeColor="hsl(var(--primary))"
                animationEnabled={true}
                onAddToCart={async (variantId, quantity) => {
                  // Simulate cart add
                  console.log(`Adding ${quantity}x ${variantId} to cart`);
                  await new Promise(resolve => setTimeout(resolve, 1000));
                }}
              />
            ))}
          </div>

          {/* Products Count */}
          {convertedProducts.length > maxProducts && (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">
                  Showing {displayProducts.length} of {convertedProducts.length} products
                </p>
              </CardContent>
            </Card>
          )}

          {/* Performance Stats */}
          <div className="mt-8 flex justify-center">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <Badge variant="secondary" className="gap-1">
                <Star className="h-3 w-3" />
                shadcn/ui
              </Badge>
              <Badge variant="secondary" className="gap-1">
                <ShoppingCart className="h-3 w-3" />
                Real Shopify Data
              </Badge>
              <Badge variant="secondary" className="gap-1">
                <Heart className="h-3 w-3" />
                Tailwind CSS
              </Badge>
            </div>
          </div>
        </>
      )}
    </div>
  );
};