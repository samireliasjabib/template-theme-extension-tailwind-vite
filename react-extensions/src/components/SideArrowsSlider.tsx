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
        <CarouselContent className="-ml-4">
          {displayProducts.map((product, index) => (
            <CarouselItem key={product.id} className={cn(
              "pl-4",
              compact ? "md:basis-1/2 lg:basis-1/3" : "md:basis-1/2 lg:basis-1/3 xl:basis-1/4"
            )}>
              <Card className="group overflow-hidden border shadow-sm bg-white transition-all duration-300 hover:shadow-xl hover:border-primary/50 h-full">
                {/* Product Image */}
                <div className="relative overflow-hidden">
                  <img
                    src={getImageSrc(product.image)}
                    alt={product.title}
                    className="h-56 w-full object-cover transition-transform duration-300 group-hover:scale-105"
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

                </div>

                {/* Product Info */}
                <CardContent className="p-4 flex flex-col h-full">
                  <div className="flex-1 space-y-3">
                    {product.vendor && (
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">
                        {product.vendor}
                      </p>
                    )}
                    {showTitle && (
                      <h3 className="text-lg font-semibold line-clamp-2 group-hover:text-primary transition-colors">
                        {product.title}
                      </h3>
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

                    {/* Price */}
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
                      {product.available && (
                        <Badge variant="secondary" className="bg-green-100 text-green-700 text-xs">
                          Available
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Add to Cart Button */}
                  <Button 
                    className="w-full h-10 mt-4 bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300"
                    onClick={async () => {
                      await addToCart(product.variants[0]?.id || product.id, 1);
                    }}
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Add to Cart
                  </Button>
                </CardContent>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>

        {/* Enhanced Large Custom Side Arrows */}
        <Button
          variant="outline"
          className="absolute -left-4 top-1/2 transform -translate-y-1/2 w-16 h-16 bg-white/95 border-2 border-gray-200 hover:border-primary hover:bg-primary hover:text-white shadow-2xl backdrop-blur-sm transition-all duration-300 hover:scale-110 rounded-full z-10"
          onClick={() => api?.scrollPrev()}
        >
          <ChevronLeft className="h-7 w-7" />
        </Button>
        
        <Button
          variant="outline"
          className="absolute -right-4 top-1/2 transform -translate-y-1/2 w-16 h-16 bg-white/95 border-2 border-gray-200 hover:border-primary hover:bg-primary hover:text-white shadow-2xl backdrop-blur-sm transition-all duration-300 hover:scale-110 rounded-full z-10"
          onClick={() => api?.scrollNext()}
        >
          <ChevronRight className="h-7 w-7" />
        </Button>
      </Carousel>

      {/* Background Decoration */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-blue-50/50 via-purple-50/50 to-pink-50/50 rounded-3xl" />
    </div>
  );
};

export default SideArrowsSlider;