import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { cn } from '../lib/utils';
import { ShoppingCart, Heart, Eye, Star, ChevronDown } from 'lucide-react';
import type { ProductCardProps, ShopifyVariant } from '../types/shopify.types';

/**
 * Enhanced Product Card Component
 * Uses validated Shopify product data with Zod types
 */
export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToCart,
  isAdding,
  lastAddedItem,
  themeColor = '#007bff',
  showQuickActions = true,
  compact = false,
}) => {
  const [selectedVariantId, setSelectedVariantId] = useState<number>(
    product.variants[0]?.id || product.id
  );
  const [quantity, setQuantity] = useState<number>(1);
  const [isLiked, setIsLiked] = useState<boolean>(false);

  const selectedVariant: ShopifyVariant | undefined = product.variants.find(
    v => v.id === selectedVariantId
  ) || product.variants[0];
  
  const formatMoney = (price: string): string => {
    const amount = parseFloat(price);
    return `$${amount.toFixed(2)}`;
  };

  const getProductImage = (): string => {
    return selectedVariant?.featured_image?.src || 
           product.featured_image?.src || 
           product.images[0]?.src || 
           'https://via.placeholder.com/300x300?text=No+Image';
  };

  const handleAddToCart = async (): Promise<void> => {
    if (selectedVariant?.available) {
      await onAddToCart(selectedVariant.id, quantity);
    }
  };

  const handleVariantChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    setSelectedVariantId(parseInt(event.target.value, 10));
  };

  const handleQuantityChange = (delta: number): void => {
    setQuantity(prev => Math.max(1, prev + delta));
  };

  const isJustAdded: boolean = lastAddedItem === selectedVariant?.id?.toString();

  if (!selectedVariant) {
    return null; // Guard clause for missing variant
  }

  return (
    <Card 
      className={cn(
        "group relative overflow-hidden border shadow-sm bg-white transition-all duration-300 hover:shadow-xl hover:border-primary/50 h-full",
        compact && "max-w-sm"
      )}
    >
      {/* Product Image */}
      <div className="relative overflow-hidden">
        <img
          src={getProductImage()}
          alt={selectedVariant.featured_image?.alt || product.title}
          className={cn(
            "w-full object-cover transition-transform duration-300 group-hover:scale-105",
            compact ? "h-40" : "h-56"
          )}
        />
        
        {/* Overlay Actions */}
        {showQuickActions && (
          <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Button
              size="sm"
              variant="secondary"
              className="w-10 h-10 rounded-full bg-white/90 hover:bg-white shadow-lg"
              onClick={() => setIsLiked(!isLiked)}
            >
              <Heart className={cn("h-4 w-4", isLiked ? "text-red-500 fill-current" : "text-gray-500")} />
            </Button>
            <Button
              size="sm"
              variant="secondary"
              className="w-10 h-10 rounded-full bg-white/90 hover:bg-white shadow-lg"
            >
              <Eye className="h-4 w-4 text-gray-500" />
            </Button>
          </div>
        )}

        {/* Sale Badge */}
        {selectedVariant.compare_at_price && (
          <Badge className="absolute top-4 left-4 bg-red-500 text-white font-semibold">
            SALE
          </Badge>
        )}
      </div>

      {/* Product Info */}
      <CardContent className="p-4 flex flex-col h-full">
        <div className="flex-1 space-y-3">
          {/* Vendor */}
          {product.vendor && (
            <p className="text-xs text-muted-foreground uppercase tracking-wide">
              {product.vendor}
            </p>
          )}

          {/* Title */}
          <CardTitle className={cn(
            "line-clamp-2 group-hover:text-primary transition-colors",
            compact ? "text-base" : "text-lg"
          )}>
            {product.title}
          </CardTitle>
          
          {/* Rating */}
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }, (_, i) => (
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

          {/* Variant Selector */}
          {product.variants.length > 1 && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Variant:
              </label>
              <div className="relative">
                <select
                  value={selectedVariantId}
                  onChange={handleVariantChange}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md bg-white appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  {product.variants.map((variant) => (
                    <option key={variant.id} value={variant.id}>
                      {variant.title} - {formatMoney(variant.price)}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
          )}

          {/* Price */}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className={cn(
                "font-bold text-primary",
                compact ? "text-lg" : "text-xl"
              )}>
                {formatMoney(selectedVariant.price)}
              </span>
              {selectedVariant.compare_at_price && (
                <span className="text-sm text-muted-foreground line-through">
                  {formatMoney(selectedVariant.compare_at_price)}
                </span>
              )}
            </div>
            {selectedVariant.available && (
              <Badge variant="secondary" className="bg-green-100 text-green-700 text-xs">
                In Stock
              </Badge>
            )}
          </div>

          {/* Tags */}
          {product.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {product.tags.slice(0, 2).map((tag: string) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Quantity Selector */}
          {!compact && (
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium">Qty:</span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1}
                >
                  -
                </Button>
                <span className="w-8 text-center font-medium">{quantity}</span>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => handleQuantityChange(1)}
                >
                  +
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Add to Cart Button */}
        <Button 
          className={cn(
            "w-full mt-4 font-semibold transition-all duration-300",
            compact ? "h-10" : "h-12",
            isJustAdded
              ? "bg-green-600 hover:bg-green-700 text-white"
              : "bg-primary text-primary-foreground hover:bg-primary/90"
          )}
          disabled={isAdding || !selectedVariant.available}
          onClick={handleAddToCart}
          style={{ backgroundColor: isJustAdded ? '#16a34a' : themeColor }}
        >
          {isAdding && lastAddedItem === selectedVariant.id.toString() ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
              Adding...
            </>
          ) : isJustAdded ? (
            <>
              ✓ Added to Cart!
            </>
          ) : !selectedVariant.available ? (
            'Out of Stock'
          ) : (
            <>
              <ShoppingCart className="h-4 w-4 mr-2" />
              Add to Cart {compact ? '' : `(${quantity})`}
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}; 