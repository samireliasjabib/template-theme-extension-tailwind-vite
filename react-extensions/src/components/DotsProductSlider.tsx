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
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold text-foreground mb-2">{title}</h2>
        {description && (
          <p className="text-muted-foreground text-lg">{description}</p>
        )}
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
        <CarouselContent>
          {displayProducts.map((product, index) => (
            <CarouselItem key={product.id} className="md:basis-1/2 lg:basis-1/3">
              <Card className="group overflow-hidden border-0 shadow-lg bg-white transition-all duration-500 hover:shadow-2xl hover:-translate-y-3">
                {/* Product Image */}
                <div className="relative overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.title}
                    className="h-72 w-full object-cover transition-transform duration-700 group-hover:scale-110"
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
                <CardHeader className="pb-4">
                  <div className="space-y-2">
                    {product.vendor && (
                      <p className="text-sm text-muted-foreground uppercase tracking-wide">
                        {product.vendor}
                      </p>
                    )}
                    <CardTitle className="text-xl line-clamp-2 group-hover:text-primary transition-colors">
                      {product.title}
                    </CardTitle>
                    
                    {/* Rating */}
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
                  </div>
                </CardHeader>

                <CardContent className="pt-0">
                  {/* Price */}
                  <div className="flex items-center justify-between mb-4">
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
                  </div>

                  {/* Add to Cart Button */}
                  <Button 
                    className="w-full h-12 text-lg font-semibold bg-black text-white hover:bg-gray-800 transition-all duration-300 transform group-hover:scale-105"
                    onClick={async () => {
                      await addToCart(product.variants[0]?.id || product.id, 1);
                    }}
                  >
                    <ShoppingCart className="h-5 w-5 mr-2" />
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