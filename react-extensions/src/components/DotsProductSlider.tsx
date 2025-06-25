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
import { ShoppingCart, Star, Heart, Eye } from 'lucide-react';

interface DotsProductSliderProps {
  title: string;
  description?: string;
  maxProducts?: number;
  autoplay?: boolean;
  className?: string;
}

/**
 * Product Slider with Dots Navigation - Clean minimal design
 */
const DotsProductSlider: React.FC<DotsProductSliderProps> = ({
  title,
  description,
  maxProducts = 6,
  autoplay = true,
  className,
}) => {
  const [api, setApi] = React.useState<CarouselApi>();
  const [current, setCurrent] = React.useState(0);
  const [count, setCount] = React.useState(0);

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

  React.useEffect(() => {
    if (!api) {
      return;
    }

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap() + 1);

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });
  }, [api]);

  // Auto-play functionality
  React.useEffect(() => {
    if (!api || !autoplay) return;

    const interval = setInterval(() => {
      api.scrollNext();
    }, 4000);

    return () => clearInterval(interval);
  }, [api, autoplay]);

  if (loading) {
    return (
      <div className={cn("w-full", className)}>
        <div className="mb-8 text-center">
          <div className="h-8 bg-muted rounded w-64 mx-auto mb-2 animate-pulse" />
          <div className="h-4 bg-muted rounded w-96 mx-auto animate-pulse" />
        </div>
        <div className="h-96 bg-muted rounded-lg animate-pulse" />
        <div className="flex justify-center mt-6 gap-2">
          {Array(3).fill(0).map((_, i) => (
            <div key={i} className="w-2 h-2 rounded-full bg-muted animate-pulse" />
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
      {/* Header */}
      <div className="mb-10 text-center">
        <h2 className="text-3xl font-bold text-foreground mb-3">{title}</h2>
        {description && (
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">{description}</p>
        )}
        <div className="w-20 h-1 bg-gradient-to-r from-primary to-purple-500 mx-auto mt-4 rounded-full" />
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
            <CarouselItem key={product.id} className="pl-4 md:basis-1/2 lg:basis-1/3">
              <Card className="group overflow-hidden border shadow-sm bg-white transition-all duration-300 hover:shadow-xl hover:border-primary/50 h-full">
                {/* Product Image */}
                <div className="relative overflow-hidden">
                  <img
                    src={getImageSrc(product.image)}
                    alt={product.title}
                    className="h-56 w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  
                  {/* Floating Action Buttons */}
                  <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <Button
                      size="sm"
                      variant="secondary"
                      className="w-10 h-10 rounded-full bg-white/90 hover:bg-white shadow-lg"
                      onClick={(e) => {
                        e.stopPropagation();
                        console.log(`Wishlist ${product.title}`);
                      }}
                    >
                      <Heart className="h-4 w-4 text-red-500" />
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      className="w-10 h-10 rounded-full bg-white/90 hover:bg-white shadow-lg"
                      onClick={(e) => {
                        e.stopPropagation();
                        console.log(`Quick view ${product.title}`);
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Sale Badge */}
                  {product.compareAtPrice && (
                    <Badge className="absolute top-4 left-4 bg-red-500 text-white font-semibold">
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
                    <h3 className="text-lg font-semibold line-clamp-2 group-hover:text-primary transition-colors">
                      {product.title}
                    </h3>
                    
                    {/* Rating */}
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
                      {product.priceVaries && product.priceMax && (
                        <p className="text-xs text-muted-foreground">
                          Up to {product.priceMax}
                        </p>
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

      {/* Dots Navigation */}
      <div className="flex justify-center mt-8 gap-3">
        {Array.from({ length: count }).map((_, index) => (
          <button
            key={index}
            className={cn(
              "w-3 h-3 rounded-full transition-all duration-300",
              index === current - 1
                ? "bg-primary scale-125 shadow-lg"
                : "bg-muted hover:bg-primary/50"
            )}
            onClick={() => api?.scrollTo(index)}
          />
        ))}
      </div>

      {/* Slide Counter */}
      <div className="text-center mt-4">
        <p className="text-sm text-muted-foreground">
          {current} / {count}
        </p>
      </div>
    </div>
  );
};

export default DotsProductSlider;