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
import { ShoppingCart, Heart, Star, ArrowLeft, ArrowRight } from 'lucide-react';

interface CenteredTitleSliderProps {
  title: string;
  subtitle?: string;
  maxProducts?: number;
  accentColor?: string;
  showRating?: boolean;
  className?: string;
}

/**
 * Product Slider with Centered Title and Flanking Arrows - Elegant symmetrical design
 */
const CenteredTitleSlider: React.FC<CenteredTitleSliderProps> = ({
  title,
  subtitle,
  maxProducts = 8,
  accentColor = "from-purple-600 to-blue-600",
  showRating = true,
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
        {/* Loading header */}
        <div className="flex items-center justify-center gap-8 mb-12">
          <div className="w-12 h-12 bg-muted rounded-full animate-pulse" />
          <div className="text-center space-y-2">
            <div className="h-10 bg-muted rounded w-64 mx-auto animate-pulse" />
            <div className="h-4 bg-muted rounded w-48 mx-auto animate-pulse" />
          </div>
          <div className="w-12 h-12 bg-muted rounded-full animate-pulse" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array(4).fill(0).map((_, i) => (
            <div key={i} className="h-96 bg-muted rounded-xl animate-pulse" />
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
      {/* Centered Header with Flanking Arrows */}
      <div className="flex items-center justify-center gap-8 mb-12">
        {/* Left Arrow */}
        <Button
          variant="outline"
          className="w-16 h-16 border-2 bg-gradient-to-r from-gray-100 to-white hover:from-primary hover:to-primary hover:text-white shadow-lg transition-all duration-500 hover:scale-110 hover:rotate-12"
          onClick={() => api?.scrollPrev()}
        >
          <ArrowLeft className="h-6 w-6" />
        </Button>

        {/* Center Title */}
        <div className="text-center space-y-3">
          <h2 className={cn(
            "text-4xl font-extrabold bg-gradient-to-r bg-clip-text text-transparent",
            accentColor
          )}>
            {title}
          </h2>
          {subtitle && (
            <p className="text-lg text-muted-foreground font-medium">
              {subtitle}
            </p>
          )}
          <div className="flex justify-center">
            <div className={cn(
              "h-1 w-24 bg-gradient-to-r rounded-full",
              accentColor
            )} />
          </div>
        </div>

        {/* Right Arrow */}
        <Button
          variant="outline"
          className="w-16 h-16 border-2 bg-gradient-to-r from-white to-gray-100 hover:from-primary hover:to-primary hover:text-white shadow-lg transition-all duration-500 hover:scale-110 hover:-rotate-12"
          onClick={() => api?.scrollNext()}
        >
          <ArrowRight className="h-6 w-6" />
        </Button>
      </div>

      {/* Carousel */}
      <Carousel
        setApi={setApi}
        opts={{
          align: "start",
          loop: true,
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
                  
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  {/* Floating Heart Button */}
                  <Button
                    size="sm"
                    variant="secondary"
                    className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/90 hover:bg-red-50 hover:scale-110 transition-all duration-300 opacity-0 group-hover:opacity-100"
                    onClick={(e) => {
                      e.stopPropagation();
                      console.log(`Wishlist ${product.title}`);
                    }}
                  >
                    <Heart className="h-4 w-4 text-red-500" />
                  </Button>

                  {/* Featured Badge */}
                  {index < 3 && (
                    <Badge className={cn(
                      "absolute top-4 left-4 bg-gradient-to-r text-white font-bold",
                      accentColor
                    )}>
                      Featured
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
                    <h3 className="text-lg font-semibold line-clamp-2 group-hover:text-primary transition-colors">
                      {product.title}
                    </h3>

                    {/* Rating */}
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
                          (4.{Math.floor(Math.random() * 9) + 1})
                        </span>
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

      {/* Bottom Stats */}
      <div className="mt-8 text-center">
        <p className="text-muted-foreground">
          Explore {displayProducts.length} carefully curated products
        </p>
      </div>
    </div>
  );
};

export default CenteredTitleSlider;