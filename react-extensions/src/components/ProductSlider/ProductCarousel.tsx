import React from 'react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '../ui/carousel';
import { ProductCard } from './ProductCard';
import { LayoutGrid } from 'lucide-react';
import type { ShopifyProduct } from '../../types/shopify.types';

interface ProductCarouselProps {
  products: ShopifyProduct[];
  themeColor?: string;
}

/**
 * Independent Product Carousel Component
 * Features: horizontal scrolling, arrow navigation, responsive breakpoints
 */
export function ProductCarousel({
  products,
  themeColor = '#007bff',
}: ProductCarouselProps) {

  if (products.length === 0) {
    return (
      <div className="text-center py-8">
        <LayoutGrid className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No products available</h3>
        <p className="text-gray-500">Products will appear here once they're added to your store.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Carousel Header */}
      <div className="flex items-center gap-2">
        <LayoutGrid className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold text-gray-900">
          Product Carousel
        </h3>
        <span className="text-sm text-gray-500">
          ({products.length} items)
        </span>
      </div>

      {/* Carousel */}
      <Carousel
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

      {/* Carousel Footer */}
      <div className="text-center">
        <p className="text-sm text-gray-500">
          Scroll horizontally to view more products
        </p>
      </div>
    </div>
  );
} 