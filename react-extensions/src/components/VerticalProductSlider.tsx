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
import { useShopifyCart } from '../hooks/useShopifyCart';
import { ShoppingCart, ChevronUp, ChevronDown, Star } from 'lucide-react';

interface VerticalProductSliderProps {
  title?: string;
  maxProducts?: number;
  height?: string;
  showPrice?: boolean;
  showRating?: boolean;
  compact?: boolean;
  className?: string;
}

/**
 * Vertical Product Slider - Products stack vertically with up/down navigation
 */
const VerticalProductSlider: React.FC<VerticalProductSliderProps> = ({
  title = "Vertical Collection",
  maxProducts = 4,
  height = "h-96",
  showPrice = true,
  showRating = false,
  compact = false,
  className,
}) => {
  const [api, setApi] = React.useState<CarouselApi>();
  const {
    convertedProducts,
    loading,
    hasProducts,
  } = useShopifyProducts(true);

  const { addToCart } = useShopifyCart();

  const displayProducts = convertedProducts.slice(0, maxProducts);

  // Helper function to ensure image is a string
  const getImageSrc = (image: string | number) => {
    if (typeof image === 'number') {
      return `https://via.placeholder.com/300x200?text=Product+${image}`;
    }
    return image || 'https://via.placeholder.com/300x200?text=No+Image';
  };

  if (loading) {
    return (
      <div className={cn("w-full", className)}>
        <div className="mb-4">
          <div className="h-6 bg-muted rounded w-48 animate-pulse" />
        </div>
        <div className={cn("relative bg-muted rounded-lg animate-pulse", height)} />
      </div>
    );
  }

  if (!hasProducts) {
    return null;
  }

  return (
    <div className={cn("w-full relative", className)}>
      {/* Title */}
      {title && (
        <div className="mb-6 text-center">
          <h3 className="text-2xl font-bold text-foreground">{title}</h3>
          <div className="w-20 h-1 bg-gradient-to-r from-primary to-purple-500 mx-auto mt-2 rounded-full" />
        </div>
      )}

      <div className="relative">
        {/* Vertical Carousel */}
        <Carousel
          setApi={setApi}
          opts={{
            align: "start",
            loop: true,
            axis: "y", // This makes it vertical
          }}
          orientation="vertical"
          className={cn("w-full", height)}
        >
          <CarouselContent className={cn("-mt-3", height)}>
            {displayProducts.map((product, index) => (
              <CarouselItem key={product.id} className="pt-3 basis-1/2">
                <Card className="group overflow-hidden border transition-all duration-300 hover:shadow-lg hover:border-primary/50 h-full bg-white/50 backdrop-blur-sm">
                  <div className="flex h-full">
                    {/* Product Image */}
                    <div className={cn(
                      "relative flex-shrink-0 overflow-hidden rounded-l-lg",
                      compact ? "w-20 h-20" : "w-24 h-24"
                    )}>
                      <img
                        src={getImageSrc(product.image)}
                        alt={product.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                      
                      {/* Sale Badge */}
                      {product.compareAtPrice && (
                        <Badge className="absolute top-1 left-1 bg-red-500 text-white text-xs px-1 py-0">
                          SALE
                        </Badge>
                      )}
                    </div>

                    {/* Product Info */}
                    <CardContent className={cn(
                      "flex-1 flex flex-col justify-between",
                      compact ? "p-2" : "p-3"
                    )}>
                      <div className={cn("space-y-1", compact && "space-y-0.5")}>
                        <h4 className={cn(
                          "font-semibold line-clamp-2 group-hover:text-primary transition-colors",
                          compact ? "text-xs leading-tight" : "text-sm"
                        )}>
                          {product.title}
                        </h4>
                        
                        {product.vendor && !compact && (
                          <p className="text-xs text-muted-foreground">
                            {product.vendor}
                          </p>
                        )}

                        {/* Rating */}
                        {showRating && !compact && (
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
                              4.{Math.floor(Math.random() * 9) + 1}
                            </span>
                          </div>
                        )}

                        {/* Price */}
                        {showPrice && (
                          <div className="flex items-center gap-1">
                            <span className={cn(
                              "font-bold text-primary",
                              compact ? "text-xs" : "text-sm"
                            )}>
                              {product.price}
                            </span>
                            {product.compareAtPrice && (
                              <span className="text-xs text-muted-foreground line-through">
                                {product.compareAtPrice}
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Add to Cart Button */}
                      <Button 
                        size="sm"
                        className={cn(
                          "w-full transition-all duration-300 mt-1.5",
                          compact ? "h-6 text-xs py-1" : "h-7 text-xs"
                        )}
                        onClick={async () => {
                          await addToCart(product.variants[0]?.id || product.id, 1);
                        }}
                      >
                        <ShoppingCart className={cn("mr-1", compact ? "h-3 w-3" : "h-3 w-3")} />
                        {compact ? "+" : "Add"}
                      </Button>
                    </CardContent>
                  </div>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>

        {/* Enhanced Vertical Navigation Arrows */}
        <div className="absolute -right-3 top-1/2 transform -translate-y-1/2 flex flex-col gap-2 z-20">
          <Button
            variant="outline"
            size="sm"
            className="w-10 h-10 bg-white/95 border-2 border-gray-200 hover:border-primary hover:bg-primary hover:text-white shadow-xl backdrop-blur-sm transition-all duration-300 hover:scale-110 rounded-full"
            onClick={() => api?.scrollPrev()}
          >
            <ChevronUp className="h-4 w-4" />
          </Button>
          
          <Button
            variant="outline" 
            size="sm"
            className="w-10 h-10 bg-white/95 border-2 border-gray-200 hover:border-primary hover:bg-primary hover:text-white shadow-xl backdrop-blur-sm transition-all duration-300 hover:scale-110 rounded-full"
            onClick={() => api?.scrollNext()}
          >
            <ChevronDown className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Product Count */}
      <div className="mt-4 text-center">
        <p className="text-xs text-muted-foreground">
          {displayProducts.length} products
        </p>
      </div>
    </div>
  );
};

export default VerticalProductSlider;