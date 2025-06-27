import React, { useState, useEffect } from 'react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from '../ui/carousel';
import { ProductCard } from './ProductCard';
import { cn } from '../../lib/utils';
import type { ShopifyProduct } from '../../types/shopify.types';

interface ProductCarouselWithDotsProps {
  products: ShopifyProduct[];
  onAddToCart: (variantId: number, quantity: number) => Promise<boolean>;
  isAdding: boolean;
  lastAddedItem: string | null;
  themeColor?: string;
  autoPlay?: boolean;
  autoPlayInterval?: number;
}

/**
 * Product Carousel with Dot Navigation
 * Features: dot indicators, auto-play, smooth transitions
 */
export function ProductCarouselWithDots({
  products,
  onAddToCart,
  isAdding,
  lastAddedItem,
  themeColor = '#007bff',
  autoPlay = false,
  autoPlayInterval = 3000,
}: ProductCarouselWithDotsProps) {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);

  // Calculate number of slides based on visible items
  const itemsPerSlide = 4; // Responsive: will be adjusted by CSS
  const totalSlides = Math.ceil(products.length / itemsPerSlide);

  useEffect(() => {
    if (!api) return;

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap() + 1);

    api.on('select', () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });
  }, [api]);

  // Auto-play functionality
  useEffect(() => {
    if (!api || !autoPlay) return;

    const interval = setInterval(() => {
      if (current >= count) {
        api.scrollTo(0);
      } else {
        api.scrollNext();
      }
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [api, autoPlay, autoPlayInterval, current, count]);

  const goToSlide = (index: number) => {
    api?.scrollTo(index);
  };

  if (products.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No products to display</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
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
          {products.map((product) => (
            <CarouselItem 
              key={product.id} 
              className="pl-4 md:basis-1/2 lg:basis-1/3 xl:basis-1/4"
            >
              <ProductCard
                product={product}
                onAddToCart={onAddToCart}
                isAdding={isAdding}
                lastAddedItem={lastAddedItem}
                themeColor={themeColor}
                showQuickActions={true}
                compact={false}
              />
            </CarouselItem>
          ))}
        </CarouselContent>
        
        <CarouselPrevious className="left-2 bg-white/95 backdrop-blur-sm border-0 shadow-lg hover:bg-white" />
        <CarouselNext className="right-2 bg-white/95 backdrop-blur-sm border-0 shadow-lg hover:bg-white" />
      </Carousel>

      {/* Dot Navigation */}
      <div className="flex items-center justify-center space-x-2">
        {Array.from({ length: count }, (_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={cn(
              "w-3 h-3 rounded-full transition-all duration-300 border-2",
              current === index + 1
                ? "bg-primary border-primary scale-125 shadow-lg"
                : "bg-gray-200 border-gray-300 hover:bg-gray-300 hover:border-gray-400"
            )}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Slide Counter */}
      <div className="text-center">
        <p className="text-sm text-gray-500">
          {current} of {count} slides • {products.length} products
        </p>
      </div>

      {/* Auto-play Indicator */}
      {autoPlay && (
        <div className="flex items-center justify-center">
          <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full text-xs text-primary">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            Auto-playing
          </div>
        </div>
      )}
    </div>
  );
} 