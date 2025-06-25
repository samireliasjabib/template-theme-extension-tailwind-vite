import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Skeleton } from './ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from './ui/carousel';
import { cn } from '../lib/utils';
import { useShopifyProducts } from '../hooks/useShopifyProducts';
import { ShoppingCart, Star, AlertCircle, Sparkles, TrendingUp, Heart } from 'lucide-react';
import ModernProductCard from './ModernProductCard';

interface ProductCarouselProps {
  title: string;
  description?: string;
  maxProducts?: number;
  variant?: 'featured' | 'trending' | 'recommended' | 'bestseller';
  autoplay?: boolean;
  showPrice?: boolean;
  showRating?: boolean;
  className?: string;
}

/**
 * Product Carousel Component - Different swiper styles for product listings
 */
const ProductCarousel: React.FC<ProductCarouselProps> = ({
  title,
  description,
  maxProducts = 8,
  variant = 'featured',
  autoplay = true,
  showPrice = true,
  showRating = false,
  className,
}) => {
  const {
    convertedProducts,
    loading,
    error,
    hasProducts,
  } = useShopifyProducts(true);

  const displayProducts = convertedProducts.slice(0, maxProducts);

  // Get variant-specific icons and colors
  const getVariantConfig = () => {
    switch (variant) {
      case 'trending':
        return {
          icon: <TrendingUp className="h-5 w-5" />,
          badge: 'Trending',
          badgeVariant: 'default' as const,
          accentColor: 'text-orange-500',
        };
      case 'recommended':
        return {
          icon: <Sparkles className="h-5 w-5" />,
          badge: 'Recommended',
          badgeVariant: 'secondary' as const,
          accentColor: 'text-purple-500',
        };
      case 'bestseller':
        return {
          icon: <Star className="h-5 w-5" />,
          badge: 'Best Sellers',
          badgeVariant: 'destructive' as const,
          accentColor: 'text-yellow-500',
        };
      default:
        return {
          icon: <Heart className="h-5 w-5" />,
          badge: 'Featured',
          badgeVariant: 'outline' as const,
          accentColor: 'text-primary',
        };
    }
  };

  const config = getVariantConfig();

  // Loading skeleton
  const CarouselSkeleton = () => (
    <Carousel className="w-full">
      <CarouselContent>
        {Array(4).fill(0).map((_, i) => (
          <CarouselItem key={i} className="md:basis-1/2 lg:basis-1/3">
            <div className="p-1">
              <Card className="overflow-hidden">
                <Skeleton className="h-48 w-full" />
                <CardHeader className="pb-2">
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-3 w-full" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-6 w-1/3 mb-4" />
                  <Skeleton className="h-10 w-full" />
                </CardContent>
              </Card>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  );

  if (loading) {
    return (
      <div className={cn("w-full", className)}>
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <Skeleton className="h-6 w-6 rounded" />
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
          {description && <Skeleton className="h-4 w-3/4" />}
        </div>
        <CarouselSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn("w-full", className)}>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error loading {title.toLowerCase()}</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!hasProducts) {
    return (
      <div className={cn("w-full", className)}>
        <Card className="text-center py-12">
          <CardContent>
            <ShoppingCart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <CardTitle className="mb-2">No {title.toLowerCase()} available</CardTitle>
            <CardDescription>
              Check back later for amazing products!
            </CardDescription>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={cn("w-full", className)}>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <span className={config.accentColor}>{config.icon}</span>
          <h2 className="text-2xl font-bold text-foreground">{title}</h2>
          <Badge variant={config.badgeVariant} className="gap-1">
            {config.badge}
          </Badge>
        </div>
        {description && (
          <p className="text-muted-foreground">{description}</p>
        )}
      </div>

      {/* Carousel */}
      <Carousel
        opts={{
          align: "start",
          loop: autoplay,
        }}
        className="w-full"
      >
        <CarouselContent>
          {displayProducts.map((product, index) => (
            <CarouselItem key={product.id} className="md:basis-1/2 lg:basis-1/3 xl:basis-1/4">
              <div className="p-1">
                <Card className="group overflow-hidden border transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                  {/* Product Image */}
                  <div className="relative overflow-hidden">
                    <img
                      src={product.image}
                      alt={product.title}
                      className="h-48 w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    {variant === 'bestseller' && index < 3 && (
                      <Badge 
                        className="absolute top-2 left-2 bg-yellow-500 text-black"
                      >
                        #{index + 1} Best Seller
                      </Badge>
                    )}
                    {variant === 'trending' && (
                      <Badge 
                        className="absolute top-2 right-2 bg-orange-500"
                      >
                        🔥 Hot
                      </Badge>
                    )}
                  </div>

                  {/* Product Info */}
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg line-clamp-2 group-hover:text-primary transition-colors">
                      {product.title}
                    </CardTitle>
                    {product.vendor && (
                      <CardDescription className="text-xs">
                        by {product.vendor}
                      </CardDescription>
                    )}
                  </CardHeader>

                  <CardContent className="space-y-3">
                    {/* Price */}
                    {showPrice && (
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-bold text-primary">
                              {product.price}
                            </span>
                            {product.compareAtPrice && (
                              <span className="text-sm text-muted-foreground line-through">
                                {product.compareAtPrice}
                              </span>
                            )}
                          </div>
                          {product.priceVaries && product.priceMax && (
                            <p className="text-xs text-muted-foreground">
                              Up to {product.priceMax}
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Rating (if enabled) */}
                    {showRating && (
                      <div className="flex items-center gap-1">
                        {Array(5).fill(0).map((_, i) => (
                          <Star 
                            key={i} 
                            className={cn(
                              "h-3 w-3",
                              i < 4 ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                            )} 
                          />
                        ))}
                        <span className="text-xs text-muted-foreground ml-1">
                          (4.0)
                        </span>
                      </div>
                    )}

                    {/* Tags */}
                    {product.tags && product.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {product.tags.slice(0, 2).map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {/* Add to Cart Button */}
                    <Button 
                      className="w-full group-hover:bg-primary/90 transition-colors"
                      onClick={() => {
                        console.log(`Adding ${product.title} to cart`);
                      }}
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Add to Cart
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>

      {/* Footer Info */}
      <div className="mt-4 flex justify-center">
        <p className="text-sm text-muted-foreground">
          Showing {displayProducts.length} of {convertedProducts.length} products
        </p>
      </div>
    </div>
  );
};

export default ProductCarousel;