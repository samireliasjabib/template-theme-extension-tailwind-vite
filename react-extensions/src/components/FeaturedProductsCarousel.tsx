import React from 'react';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from './ui/carousel';
import { cn } from '../lib/utils';
import { useShopifyProducts } from '../hooks/useShopifyProducts';
import { ShoppingCart, Heart, Eye } from 'lucide-react';

interface FeaturedProductsCarouselProps {
  maxProducts?: number;
  showQuickActions?: boolean;
  compact?: boolean;
  className?: string;
}

/**
 * Compact Featured Products Carousel - Hero section style
 */
const FeaturedProductsCarousel: React.FC<FeaturedProductsCarouselProps> = ({
  maxProducts = 6,
  showQuickActions = true,
  compact = false,
  className,
}) => {
  const {
    convertedProducts,
    loading,
    hasProducts,
  } = useShopifyProducts(true);

  const [hoveredProduct, setHoveredProduct] = React.useState<string | null>(null);
  const displayProducts = convertedProducts.slice(0, maxProducts);

  if (loading) {
    return (
      <div className={cn("w-full", className)}>
        <Carousel className="w-full">
          <CarouselContent>
            {Array(3).fill(0).map((_, i) => (
              <CarouselItem key={i} className={compact ? "basis-1/2 md:basis-1/3" : "md:basis-1/2"}>
                <Card className="overflow-hidden">
                  <div className={cn(
                    "animate-pulse bg-muted",
                    compact ? "h-32" : "h-64"
                  )} />
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <div className="h-4 bg-muted rounded animate-pulse" />
                      <div className="h-3 bg-muted rounded w-2/3 animate-pulse" />
                      <div className="h-6 bg-muted rounded w-1/3 animate-pulse" />
                    </div>
                  </CardContent>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>
    );
  }

  if (!hasProducts) {
    return null;
  }

  return (
    <div className={cn("w-full", className)}>
      <Carousel
        opts={{
          align: "start",
          loop: true,
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-2 md:-ml-4">
          {displayProducts.map((product, index) => (
            <CarouselItem 
              key={product.id} 
              className={cn(
                "pl-2 md:pl-4",
                compact 
                  ? "basis-1/2 md:basis-1/3 lg:basis-1/4" 
                  : "md:basis-1/2 lg:basis-1/3"
              )}
            >
              <Card 
                className="group relative overflow-hidden border-0 shadow-lg transition-all duration-500 hover:shadow-xl hover:-translate-y-2"
                onMouseEnter={() => setHoveredProduct(product.id)}
                onMouseLeave={() => setHoveredProduct(null)}
              >
                {/* Product Image */}
                <div className="relative overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.title}
                    className={cn(
                      "w-full object-cover transition-transform duration-700 group-hover:scale-110",
                      compact ? "h-32" : "h-64"
                    )}
                  />
                  
                  {/* Featured Badge */}
                  {index === 0 && (
                    <Badge className="absolute top-3 left-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-semibold">
                      ⭐ Featured
                    </Badge>
                  )}
                  
                  {/* Discount Badge */}
                  {product.compareAtPrice && (
                    <Badge className="absolute top-3 right-3 bg-red-500 text-white">
                      Sale
                    </Badge>
                  )}

                  {/* Quick Actions Overlay */}
                  {showQuickActions && (
                    <div 
                      className={cn(
                        "absolute inset-0 bg-black/50 flex items-center justify-center gap-2 transition-opacity duration-300",
                        hoveredProduct === product.id ? "opacity-100" : "opacity-0"
                      )}
                    >
                      <Button
                        size="sm"
                        variant="secondary"
                        className="bg-white/90 text-black hover:bg-white"
                        onClick={(e) => {
                          e.stopPropagation();
                          console.log(`Quick view ${product.title}`);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        className="bg-primary hover:bg-primary/90"
                        onClick={(e) => {
                          e.stopPropagation();
                          console.log(`Adding ${product.title} to cart`);
                        }}
                      >
                        <ShoppingCart className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        className="bg-white/90 text-red-500 hover:bg-white hover:text-red-600"
                        onClick={(e) => {
                          e.stopPropagation();
                          console.log(`Add ${product.title} to wishlist`);
                        }}
                      >
                        <Heart className="h-4 w-4" />
                      </Button>
                    </div>
                  )}

                  {/* Gradient Overlay for Text */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                    <div className="text-white">
                      <h3 className={cn(
                        "font-semibold line-clamp-2 mb-1",
                        compact ? "text-sm" : "text-lg"
                      )}>
                        {product.title}
                      </h3>
                      
                      {!compact && product.vendor && (
                        <p className="text-xs text-white/80 mb-2">
                          by {product.vendor}
                        </p>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className={cn(
                              "font-bold text-white",
                              compact ? "text-sm" : "text-lg"
                            )}>
                              {product.price}
                            </span>
                            {product.compareAtPrice && (
                              <span className={cn(
                                "text-white/70 line-through",
                                compact ? "text-xs" : "text-sm"
                              )}>
                                {product.compareAtPrice}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        {!showQuickActions && (
                          <Button
                            size={compact ? "sm" : "default"}
                            className="bg-white/20 border border-white/30 text-white hover:bg-white hover:text-black transition-all duration-300"
                            onClick={(e) => {
                              e.stopPropagation();
                              console.log(`Adding ${product.title} to cart`);
                            }}
                          >
                            <ShoppingCart className={cn("mr-1", compact ? "h-3 w-3" : "h-4 w-4")} />
                            {compact ? "Add" : "Add to Cart"}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        
        <CarouselPrevious className="left-2" />
        <CarouselNext className="right-2" />
      </Carousel>
    </div>
  );
};

export default FeaturedProductsCarousel;