import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
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
import { ShoppingCart, ArrowLeft, ArrowRight, Zap } from 'lucide-react';

interface TitleArrowsSliderProps {
  title: string;
  description?: string;
  maxProducts?: number;
  accentColor?: string;
  className?: string;
}

/**
 * Product Slider with Title and Side Arrows - Professional layout
 */
const TitleArrowsSlider: React.FC<TitleArrowsSliderProps> = ({
  title,
  description,
  maxProducts = 8,
  accentColor = "text-blue-500",
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
        <div className="flex items-center justify-between mb-6">
          <div className="space-y-2">
            <div className="h-8 bg-muted rounded w-64 animate-pulse" />
            <div className="h-4 bg-muted rounded w-96 animate-pulse" />
          </div>
          <div className="flex gap-2">
            <div className="w-10 h-10 bg-muted rounded-full animate-pulse" />
            <div className="w-10 h-10 bg-muted rounded-full animate-pulse" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array(4).fill(0).map((_, i) => (
            <div key={i} className="h-80 bg-muted rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!hasProducts) {
    return null;
  }

  return (
    <div className={cn("w-full", className)}>
      {/* Header with Title and Navigation */}
      <div className="flex items-center justify-between mb-10">
        <div className="space-y-3">
          <div className="flex items-center gap-4">
            <div className={cn("p-3 rounded-xl bg-primary/10", accentColor)}>
              <Zap className="h-7 w-7" />
            </div>
            <h2 className="text-3xl font-bold text-foreground">{title}</h2>
          </div>
          {description && (
            <p className="text-muted-foreground text-lg ml-16 max-w-lg">{description}</p>
          )}
        </div>

        {/* Custom Navigation Buttons */}
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            className="h-14 w-14 border-2 hover:border-primary hover:bg-primary hover:text-white transition-all duration-300 hover:scale-110 shadow-lg"
            onClick={() => api?.scrollPrev()}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-14 w-14 border-2 hover:border-primary hover:bg-primary hover:text-white transition-all duration-300 hover:scale-110 shadow-lg"
            onClick={() => api?.scrollNext()}
          >
            <ArrowRight className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Carousel */}
      <Carousel
        setApi={setApi}
        opts={{
          align: "start",
          loop: false,
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-4">
          {displayProducts.map((product, index) => (
            <CarouselItem key={product.id} className="pl-4 md:basis-1/2 lg:basis-1/4">
              <Card className="group overflow-hidden border shadow-sm bg-white transition-all duration-300 hover:shadow-xl hover:border-primary/50 h-full">
                {/* Product Image */}
                <div className="relative overflow-hidden">
                  <img
                    src={getImageSrc(product.image)}
                    alt={product.title}
                    className="h-56 w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  
                  {/* Quick Actions Overlay */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <Button
                      size="sm"
                      className="bg-white text-black hover:bg-primary hover:text-white transition-all duration-300"
                      onClick={async (e) => {
                        e.stopPropagation();
                        await addToCart(product.variants[0]?.id || product.id, 1);
                      }}
                    >
                      Quick Add
                    </Button>
                  </div>

                  {/* Product Index */}
                  <Badge 
                    className="absolute top-3 left-3 bg-white/90 text-black font-bold"
                  >
                    #{index + 1}
                  </Badge>
                </div>

                {/* Product Info */}
                <CardContent className="p-4 flex flex-col h-full">
                  <div className="flex-1 space-y-3">
                    {product.vendor && (
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">
                        {product.vendor}
                      </p>
                    )}
                    <h3 className="text-lg font-semibold line-clamp-2 group-hover:text-primary transition-colors">
                      {product.title}
                    </h3>

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
                          In Stock
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
      </Carousel>

      {/* Product Count */}
      <div className="mt-6 text-center">
        <p className="text-sm text-muted-foreground">
          Showing {displayProducts.length} products
        </p>
      </div>
    </div>
  );
};

export default TitleArrowsSlider;