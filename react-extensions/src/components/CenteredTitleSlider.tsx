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

  const displayProducts = convertedProducts.slice(0, maxProducts);

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
        <CarouselContent className="-ml-6">
          {displayProducts.map((product, index) => (
            <CarouselItem key={product.id} className="pl-6 md:basis-1/2 lg:basis-1/4">
              <Card className="group relative overflow-hidden border-0 shadow-xl bg-white transition-all duration-700 hover:shadow-2xl hover:-translate-y-4 hover:rotate-1">
                {/* Product Image */}
                <div className="relative overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.title}
                    className="h-56 w-full object-cover transition-all duration-700 group-hover:scale-125 group-hover:brightness-105"
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

                  {/* Quick Add Button (appears on hover) */}
                  <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-4 group-hover:translate-y-0">
                    <Button 
                      className="w-full bg-white/95 text-black hover:bg-white hover:scale-105 transition-all duration-300 font-semibold shadow-lg"
                      onClick={() => {
                        console.log(`Adding ${product.title} to cart`);
                      }}
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Quick Add
                    </Button>
                  </div>
                </div>

                {/* Product Info */}
                <CardContent className="p-6 space-y-4">
                  <div className="space-y-2">
                    <h3 className="font-bold text-lg line-clamp-2 group-hover:text-primary transition-colors">
                      {product.title}
                    </h3>
                    
                    {product.vendor && (
                      <p className="text-sm text-muted-foreground uppercase tracking-wide font-medium">
                        {product.vendor}
                      </p>
                    )}

                    {/* Rating */}
                    {showRating && (
                      <div className="flex items-center gap-1">
                        {Array(5).fill(0).map((_, i) => (
                          <Star 
                            key={i} 
                            className={cn(
                              "h-4 w-4",
                              i < 4 ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                            )} 
                          />
                        ))}
                        <span className="text-sm text-muted-foreground ml-1">
                          (4.{Math.floor(Math.random() * 9) + 1})
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Price */}
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-primary">
                          {product.price}
                        </span>
                        {product.compareAtPrice && (
                          <span className="text-lg text-muted-foreground line-through">
                            {product.compareAtPrice}
                          </span>
                        )}
                      </div>
                      {product.priceVaries && product.priceMax && (
                        <p className="text-sm text-muted-foreground">
                          Up to {product.priceMax}
                        </p>
                      )}
                    </div>

                    {product.available && (
                      <Badge variant="secondary" className="bg-green-100 text-green-700">
                        In Stock
                      </Badge>
                    )}
                  </div>

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