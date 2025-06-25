import React from 'react';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from './ui/carousel';
import { cn } from '../lib/utils';
import { useShopifyProducts } from '../hooks/useShopifyProducts';
import { ShoppingCart, ChevronLeft, ChevronRight } from 'lucide-react';

interface SideArrowsSliderProps {
  maxProducts?: number;
  showTitle?: boolean;
  compact?: boolean;
  className?: string;
}

/**
 * Product Slider with Large Side Arrows - Minimal design focus on products
 */
const SideArrowsSlider: React.FC<SideArrowsSliderProps> = ({
  maxProducts = 6,
  showTitle = false,
  compact = false,
  className,
}) => {
  const [api, setApi] = React.useState<CarouselApi>();
  const {
    convertedProducts,
    loading,
    hasProducts,
  } = useShopifyProducts(true);

  const displayProducts = convertedProducts.slice(0, maxProducts);

  if (loading) {
    return (
      <div className={cn("w-full relative", className)}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-16">
          {Array(3).fill(0).map((_, i) => (
            <div key={i} className={cn(
              "bg-muted rounded-lg animate-pulse",
              compact ? "h-64" : "h-96"
            )} />
          ))}
        </div>
        {/* Loading arrows */}
        <div className="absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-muted rounded-full animate-pulse" />
        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-muted rounded-full animate-pulse" />
      </div>
    );
  }

  if (!hasProducts) {
    return null;
  }

  return (
    <div className={cn("w-full relative", className)}>
      <Carousel
        setApi={setApi}
        opts={{
          align: "center",
          loop: true,
        }}
        className="w-full"
      >
        <CarouselContent className="px-16">
          {displayProducts.map((product, index) => (
            <CarouselItem key={product.id} className={cn(
              compact ? "md:basis-1/2 lg:basis-1/3" : "md:basis-1/2 lg:basis-1/3 xl:basis-1/4"
            )}>
              <Card className="group overflow-hidden border-0 shadow-xl bg-gradient-to-b from-white to-gray-50 transition-all duration-500 hover:shadow-2xl hover:scale-105">
                {/* Product Image */}
                <div className="relative overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.title}
                    className={cn(
                      "w-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:brightness-110",
                      compact ? "h-40" : "h-64"
                    )}
                  />
                  
                  {/* Floating Price Badge */}
                  <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm rounded-full px-3 py-1 shadow-lg">
                    <span className="font-bold text-primary text-lg">
                      {product.price}
                    </span>
                  </div>

                  {/* Sale Badge */}
                  {product.compareAtPrice && (
                    <Badge className="absolute top-4 left-4 bg-gradient-to-r from-red-500 to-pink-500 text-white font-bold px-3 py-1">
                      SALE
                    </Badge>
                  )}

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div className="absolute bottom-4 left-4 right-4">
                      <Button 
                        className="w-full bg-white/90 text-black hover:bg-white hover:scale-105 transition-all duration-300 font-semibold"
                        onClick={() => {
                          console.log(`Adding ${product.title} to cart`);
                        }}
                      >
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Quick Add
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Product Info */}
                <CardContent className={cn("p-4", compact && "p-3")}>
                  <div className="space-y-2">
                    {showTitle && (
                      <h3 className={cn(
                        "font-bold line-clamp-2 group-hover:text-primary transition-colors",
                        compact ? "text-sm" : "text-lg"
                      )}>
                        {product.title}
                      </h3>
                    )}
                    
                    {product.vendor && (
                      <p className={cn(
                        "text-muted-foreground uppercase tracking-wider font-medium",
                        compact ? "text-xs" : "text-sm"
                      )}>
                        {product.vendor}
                      </p>
                    )}

                    {!compact && (
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xl font-bold text-primary">
                              {product.price}
                            </span>
                            {product.compareAtPrice && (
                              <span className="text-sm text-muted-foreground line-through">
                                {product.compareAtPrice}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        {product.available && (
                          <Badge variant="secondary" className="bg-green-100 text-green-700 text-xs">
                            Available
                          </Badge>
                        )}
                      </div>
                    )}

                    {/* Tags for non-compact version */}
                    {!compact && product.tags && product.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-2">
                        {product.tags.slice(0, 2).map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>

        {/* Large Custom Side Arrows */}
        <Button
          variant="outline"
          className="absolute left-2 top-1/2 transform -translate-y-1/2 w-14 h-14 bg-white/95 border-2 border-gray-200 hover:border-primary hover:bg-primary hover:text-white shadow-xl backdrop-blur-sm transition-all duration-300 hover:scale-110"
          onClick={() => api?.scrollPrev()}
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>
        
        <Button
          variant="outline"
          className="absolute right-2 top-1/2 transform -translate-y-1/2 w-14 h-14 bg-white/95 border-2 border-gray-200 hover:border-primary hover:bg-primary hover:text-white shadow-xl backdrop-blur-sm transition-all duration-300 hover:scale-110"
          onClick={() => api?.scrollNext()}
        >
          <ChevronRight className="h-6 w-6" />
        </Button>
      </Carousel>

      {/* Background Decoration */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-blue-50/50 via-purple-50/50 to-pink-50/50 rounded-3xl" />
    </div>
  );
};

export default SideArrowsSlider;