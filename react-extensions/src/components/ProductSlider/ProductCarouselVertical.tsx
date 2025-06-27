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
import { Button } from '../ui/button';
import { ChevronUp, ChevronDown, RotateCcw } from 'lucide-react';
import { cn } from '../../lib/utils';
import type { ShopifyProduct } from '../../types/shopify.types';

interface ProductCarouselVerticalProps {
  products: ShopifyProduct[];
  onAddToCart: (variantId: number, quantity: number) => Promise<boolean>;
  isAdding: boolean;
  lastAddedItem: string | null;
  themeColor?: string;
  height?: number;
  itemsVisible?: number;
}

/**
 * Vertical Product Carousel
 * Features: vertical scrolling, custom height, up/down navigation
 */
export function ProductCarouselVertical({
  products,
  onAddToCart,
  isAdding,
  lastAddedItem,
  themeColor = '#007bff',
  height = 600,
  itemsVisible = 2,
}: ProductCarouselVerticalProps) {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  useEffect(() => {
    if (!api) return;

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap() + 1);
    setCanScrollPrev(api.canScrollPrev());
    setCanScrollNext(api.canScrollNext());

    api.on('select', () => {
      setCurrent(api.selectedScrollSnap() + 1);
      setCanScrollPrev(api.canScrollPrev());
      setCanScrollNext(api.canScrollNext());
    });
  }, [api]);

  const scrollToPrevious = () => {
    api?.scrollPrev();
  };

  const scrollToNext = () => {
    api?.scrollNext();
  };

  const scrollToTop = () => {
    api?.scrollTo(0);
  };

  if (products.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No products to display</p>
      </div>
    );
  }

  const itemHeight = height / itemsVisible;

  return (
    <div className="space-y-4">
      {/* Header Controls */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          Vertical Product Browser
        </h3>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={scrollToTop}
            disabled={!canScrollPrev}
            className="h-8"
          >
            <RotateCcw className="h-3 w-3 mr-1" />
            Top
          </Button>
          <span className="text-sm text-gray-500">
            {current} of {count}
          </span>
        </div>
      </div>

      {/* Vertical Carousel Container */}
      <div className="relative bg-gray-50 rounded-lg overflow-hidden border">
        {/* Up Arrow */}
        <div className="absolute top-2 left-1/2 transform -translate-x-1/2 z-10">
          <Button
            variant="secondary"
            size="sm"
            onClick={scrollToPrevious}
            disabled={!canScrollPrev}
            className="w-10 h-8 bg-white/95 backdrop-blur-sm shadow-lg border-0 hover:bg-white"
          >
            <ChevronUp className="h-4 w-4" />
          </Button>
        </div>

        {/* Carousel */}
        <Carousel
          setApi={setApi}
          orientation="vertical"
          opts={{
            align: "start",
            loop: false,
          }}
          className="w-full"
          style={{ height: `${height}px` }}
        >
          <CarouselContent 
            className="-mt-4 h-full"
            style={{ height: `${height}px` }}
          >
            {products.map((product) => (
              <CarouselItem 
                key={product.id} 
                className="pt-4 basis-auto"
                style={{ height: `${itemHeight}px` }}
              >
                <div className="px-4 h-full">
                  <ProductCard
                    product={product}
                    onAddToCart={onAddToCart}
                    isAdding={isAdding}
                    lastAddedItem={lastAddedItem}
                    themeColor={themeColor}
                    showQuickActions={true}
                    compact={true}
                  />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>

        {/* Down Arrow */}
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 z-10">
          <Button
            variant="secondary"
            size="sm"
            onClick={scrollToNext}
            disabled={!canScrollNext}
            className="w-10 h-8 bg-white/95 backdrop-blur-sm shadow-lg border-0 hover:bg-white"
          >
            <ChevronDown className="h-4 w-4" />
          </Button>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 z-10">
          <div className="bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-lg">
            <div className="flex flex-col space-y-1">
              {Array.from({ length: Math.min(count, 5) }, (_, index) => (
                <div
                  key={index}
                  className={cn(
                    "w-1 h-3 rounded-full transition-all duration-300",
                    current === index + 1
                      ? "bg-primary"
                      : "bg-gray-300"
                  )}
                />
              ))}
              {count > 5 && (
                <div className="text-xs text-gray-500 text-center">
                  +{count - 5}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="flex items-center justify-between text-sm text-gray-500">
        <span>Showing {Math.min(itemsVisible, products.length)} of {products.length} products</span>
        <span>Scroll vertically to browse</span>
      </div>

      {/* Navigation Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="flex items-center gap-2 text-sm text-blue-700">
          <div className="flex items-center gap-1">
            <ChevronUp className="h-3 w-3" />
            <ChevronDown className="h-3 w-3" />
          </div>
          <span>Use arrow buttons or mouse wheel to scroll through products vertically</span>
        </div>
      </div>
    </div>
  );
} 