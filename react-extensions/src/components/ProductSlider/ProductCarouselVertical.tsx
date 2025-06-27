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
import { ChevronUp, ChevronDown, RotateCcw, Layers } from 'lucide-react';
import { cn } from '../../lib/utils';
import type { ShopifyProduct } from '../../types/shopify.types';

interface ProductCarouselVerticalProps {
  products: ShopifyProduct[];
  themeColor?: string;
  height?: number;
  itemsPerRow?: number;
}

/**
 * Vertical Carousel with Horizontal Card Layout
 * Each slide shows multiple cards in a row, scrolls vertically
 */
export function ProductCarouselVertical({
  products,
  themeColor = '#007bff',
  height = 500,
  itemsPerRow = 1,
}: ProductCarouselVerticalProps) {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  // Group products into rows
  const productRows = React.useMemo(() => {
    const rows = [];
    for (let i = 0; i < products.length; i += itemsPerRow) {
      rows.push(products.slice(i, i + itemsPerRow));
    }
    return rows;
  }, [products, itemsPerRow]);

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
      <div className="flex flex-col items-center justify-center py-16 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl">
        <Layers className="h-12 w-12 text-gray-400 mb-4" />
        <p className="text-lg text-gray-500 font-medium">No products to display</p>
        <p className="text-sm text-gray-400 mt-1">Products will appear here when loaded</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Enhanced Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <div className="p-2 bg-gradient-to-br from-primary/10 to-purple-500/10 rounded-lg">
            <Layers className="h-6 w-6 text-primary" />
          </div>
          <h3 className="text-2xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            Vertical Gallery
          </h3>
        </div>
        
        <div className="flex items-center justify-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={scrollToTop}
            disabled={!canScrollPrev}
            className="h-9 px-4 bg-white border-gray-200 hover:bg-gray-50 shadow-sm"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Back to Top
          </Button>
          <div className="bg-white border border-gray-200 rounded-lg px-4 py-2 shadow-sm">
            <span className="text-sm font-medium text-gray-600">
              {current} of {count} rows
            </span>
          </div>
        </div>
      </div>

      {/* Main Carousel Container - Centered and Responsive */}
      <div className="relative bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-xl">
        
        {/* Top Navigation */}
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20">
          <Button
            variant="secondary"
            size="sm"
            onClick={scrollToPrevious}
            disabled={!canScrollPrev}
            className="w-12 h-10 bg-white/95 backdrop-blur-sm shadow-lg border border-gray-200 hover:bg-white hover:shadow-xl transition-all duration-300 rounded-xl"
          >
            <ChevronUp className="h-5 w-5 text-gray-700" />
          </Button>
        </div>

        {/* Carousel with Horizontal Card Layout */}
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
            className="h-full"
            style={{ height: `${height}px` }}
          >
            {productRows.map((row, rowIndex) => (
              <CarouselItem 
                key={rowIndex} 
                className="basis-auto flex items-center justify-center"
                style={{ 
                  height: `${height - 80}px`, // Account for navigation buttons
                  paddingTop: '40px',
                  paddingBottom: '40px'
                }}
              >
                {/* Horizontal Grid Layout for Cards */}
                <div className="w-full max-w-5xl px-8">
                  <div className={cn(
                    "grid gap-6 h-full items-center",
                    itemsPerRow === 1 && "grid-cols-1 max-w-md mx-auto",
                    itemsPerRow === 2 && "grid-cols-1 md:grid-cols-2",
                    itemsPerRow === 3 && "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
                    itemsPerRow >= 4 && "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                  )}>
                    {row.map((product) => (
                      <div key={product.id} className="flex justify-center">
                        <div className="w-full max-w-sm">
                          <ProductCard
                            product={product}
                            themeColor={themeColor}
                            showQuickActions={true}
                            compact={true}
                            layout="row"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>

        {/* Bottom Navigation */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20">
          <Button
            variant="secondary"
            size="sm"
            onClick={scrollToNext}
            disabled={!canScrollNext}
            className="w-12 h-10 bg-white/95 backdrop-blur-sm shadow-lg border border-gray-200 hover:bg-white hover:shadow-xl transition-all duration-300 rounded-xl"
          >
            <ChevronDown className="h-5 w-5 text-gray-700" />
          </Button>
        </div>

        {/* Progress Indicator - Right side */}
        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20">
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-3 shadow-lg border border-gray-200">
            <div className="flex flex-col space-y-2">
              {Array.from({ length: Math.min(count, 6) }, (_, index) => (
                <div
                  key={index}
                  className={cn(
                    "w-1.5 h-4 rounded-full transition-all duration-500",
                    current === index + 1
                      ? "bg-gradient-to-b from-primary to-purple-500 shadow-sm"
                      : "bg-gray-200 hover:bg-gray-300"
                  )}
                />
              ))}
              {count > 6 && (
                <div className="text-xs text-gray-500 text-center font-medium mt-1">
                  +{count - 6}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Gradient overlays for depth */}
        <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-white via-white/80 to-transparent pointer-events-none z-10" />
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white via-white/80 to-transparent pointer-events-none z-10" />
      </div>

      {/* Enhanced Footer Info */}
      <div className="text-center space-y-3">
        <div className="flex items-center justify-center gap-6 text-sm">
          <div className="bg-white border border-gray-200 rounded-lg px-4 py-2 shadow-sm">
            <span className="text-gray-600">
              <span className="font-semibold text-primary">{itemsPerRow}</span> cards per row
            </span>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg px-4 py-2 shadow-sm">
            <span className="text-gray-600">
              <span className="font-semibold text-primary">{productRows.length}</span> total rows
            </span>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg px-4 py-2 shadow-sm">
            <span className="text-gray-600">Scroll to browse</span>
          </div>
        </div>

        {/* Navigation Instructions */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 max-w-md mx-auto">
          <div className="flex items-center justify-center gap-3 text-sm text-blue-700">
            <div className="flex items-center gap-1 bg-white rounded-lg px-2 py-1 border border-blue-200">
              <ChevronUp className="h-3 w-3" />
              <ChevronDown className="h-3 w-3" />
            </div>
            <span className="font-medium">Scroll vertically through rows of products</span>
          </div>
        </div>
      </div>
    </div>
  );
} 