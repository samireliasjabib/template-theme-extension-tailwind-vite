import React, { useState } from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { cn } from '../../lib/utils';
import { 
  ShoppingCart, 
  Heart, 
  Eye, 
  Star, 
  ChevronDown, 
  Plus, 
  Minus,
  Zap,
  CheckCircle
} from 'lucide-react';
import type { ShopifyProduct, ShopifyVariant } from '../../types/shopify.types';
import { useShopifyCart } from '../../hooks/useShopifyCart';
import { 
  formatMoney, 
  getProductImage, 
  getProductImageAlt, 
  getDiscountPercentage, 
  isProductOnSale,
  getVariantTitle,
  generateDemoRating,
  hasMultipleVariants
} from '../../helpers/product.helpers';

interface ProductCardProps {
  product: ShopifyProduct;
  themeColor?: string;
  showQuickActions?: boolean;
  compact?: boolean;
}

/**
 * Independent Product Card Component
 * Each card manages its own cart loading state and API calls
 */
export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  themeColor = '#007bff',
  showQuickActions = true,
  compact = false,
}) => {
  const [selectedVariantId, setSelectedVariantId] = useState<number>(
    product.variants[0]?.id || product.id
  );
  const [quantity, setQuantity] = useState<number>(1);
  const [isLiked, setIsLiked] = useState<boolean>(false);
  const [isHovered, setIsHovered] = useState<boolean>(false);

  // Each card has its own cart management
  const { addToCart, isItemAdding, lastAddedItem } = useShopifyCart();

  const selectedVariant: ShopifyVariant | undefined = product.variants.find(
    v => v.id === selectedVariantId
  ) || product.variants[0];

  const rating = generateDemoRating();
  const discountPercentage = getDiscountPercentage(
    selectedVariant?.price || '0', 
    selectedVariant?.compare_at_price || undefined
  );

  // Check if this specific variant is being added to cart
  const isThisVariantAdding = selectedVariant ? isItemAdding(selectedVariant.id) : false;
  const isJustAdded = selectedVariant ? lastAddedItem === selectedVariant.id.toString() : false;

  const handleAddToCart = async (): Promise<void> => {
    if (selectedVariant?.available) {
      console.log(`🛒 ProductCard: Adding variant ${selectedVariant.id} to cart`);
      await addToCart(selectedVariant.id, quantity);
    }
  };

  const handleVariantChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    setSelectedVariantId(parseInt(event.target.value, 10));
  };

  const handleQuantityChange = (delta: number): void => {
    setQuantity(prev => Math.max(1, prev + delta));
  };

  if (!selectedVariant) {
    return null;
  }

  return (
    <Card 
      className={cn(
        "group relative overflow-hidden border-0 shadow-md bg-white transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 h-full",
        "transform hover:-translate-y-2 hover:scale-[1.02]",
        compact && "max-w-sm"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ 
        '--theme-color': themeColor,
      } as React.CSSProperties}
    >
      {/* Product Image Container */}
      <div className="relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
        <img
          src={getProductImage(product, selectedVariant, compact ? '400x400' : '600x600')}
          alt={getProductImageAlt(product, selectedVariant)}
          className={cn(
            "w-full object-cover transition-all duration-700 group-hover:scale-110",
            compact ? "h-48" : "h-64"
          )}
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Quick Actions Overlay */}
        {showQuickActions && (
          <div className={cn(
            "absolute top-4 right-4 flex flex-col gap-2 transition-all duration-300",
            isHovered ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4"
          )}>
            <Button
              size="sm"
              variant="secondary"
              className="w-10 h-10 rounded-full bg-white/95 backdrop-blur-sm hover:bg-white shadow-lg border-0"
              onClick={() => setIsLiked(!isLiked)}
            >
              <Heart className={cn(
                "h-4 w-4 transition-colors", 
                isLiked ? "text-red-500 fill-current" : "text-gray-600"
              )} />
            </Button>
            <Button
              size="sm"
              variant="secondary"
              className="w-10 h-10 rounded-full bg-white/95 backdrop-blur-sm hover:bg-white shadow-lg border-0"
            >
              <Eye className="h-4 w-4 text-gray-600" />
            </Button>
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          {isProductOnSale(selectedVariant) && (
            <Badge className="bg-red-500 text-white font-bold shadow-lg border-0 animate-pulse">
              -{discountPercentage}%
            </Badge>
          )}
          {!selectedVariant.available && (
            <Badge variant="secondary" className="bg-gray-800 text-white border-0">
              Sold Out
            </Badge>
          )}
          {product.tags.includes('new') && (
            <Badge className="bg-green-500 text-white border-0">
              New
            </Badge>
          )}
        </div>

        {/* Quick Add to Cart (Hover State) */}
        {selectedVariant.available && (
          <div className={cn(
            "absolute bottom-4 left-4 right-4 transition-all duration-300",
            isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          )}>
            <Button
              onClick={handleAddToCart}
              disabled={isThisVariantAdding}
              className="w-full bg-primary hover:bg-primary/90 text-white font-semibold shadow-lg border-0 h-11"
            >
              {isThisVariantAdding ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  Adding...
                </div>
              ) : isJustAdded ? (
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Added!
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <ShoppingCart className="h-4 w-4" />
                  Quick Add
                </div>
              )}
            </Button>
          </div>
        )}
      </div>

      {/* Product Info */}
      <CardContent className="p-5 flex flex-col h-full space-y-4">
        {/* Vendor */}
        {product.vendor && (
          <p className="text-xs text-primary font-semibold uppercase tracking-widest">
            {product.vendor}
          </p>
        )}

        {/* Title */}
        <h3 className={cn(
          "font-bold line-clamp-2 group-hover:text-primary transition-colors leading-tight",
          compact ? "text-base" : "text-lg"
        )}>
          {product.title}
        </h3>
        
        {/* Rating */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }, (_, i) => (
              <Star 
                key={i} 
                className={cn(
                  "h-3.5 w-3.5 transition-colors",
                  i < Math.floor(rating.rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                )} 
              />
            ))}
            <span className="text-xs text-gray-600 ml-1 font-medium">
              {rating.rating} ({rating.reviews})
            </span>
          </div>
        </div>

        {/* Variant Selector */}
        {hasMultipleVariants(product) && (
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">
              Options:
            </label>
            <div className="relative">
              <select
                value={selectedVariantId}
                onChange={handleVariantChange}
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-white appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
              >
                {product.variants.map((variant) => (
                  <option key={variant.id} value={variant.id}>
                    {getVariantTitle(variant)} - {formatMoney(variant.price)}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
        )}

        {/* Price */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <span className={cn(
              "font-bold text-primary",
              compact ? "text-xl" : "text-2xl"
            )}>
              {formatMoney(selectedVariant.price)}
            </span>
            {selectedVariant.compare_at_price && (
              <span className="text-sm text-gray-500 line-through">
                {formatMoney(selectedVariant.compare_at_price)}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {selectedVariant.available ? (
              <Badge variant="secondary" className="bg-green-100 text-green-700 text-xs border-0">
                ✓ In Stock
              </Badge>
            ) : (
              <Badge variant="secondary" className="bg-red-100 text-red-700 text-xs border-0">
                ✗ Out of Stock
              </Badge>
            )}
            {isProductOnSale(selectedVariant) && (
              <Badge className="bg-orange-100 text-orange-700 text-xs border-0">
                <Zap className="h-3 w-3 mr-1" />
                Sale
              </Badge>
            )}
          </div>
        </div>

        {/* Quantity & Add to Cart */}
        <div className="space-y-3 mt-auto">
          {/* Quantity Selector */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-700">Quantity:</span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0 rounded-full"
                onClick={() => handleQuantityChange(-1)}
                disabled={quantity <= 1}
              >
                <Minus className="h-3 w-3" />
              </Button>
              
              <span className="text-sm font-semibold min-w-[2rem] text-center bg-gray-50 px-3 py-1 rounded-lg">
                {quantity}
              </span>
              
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0 rounded-full"
                onClick={() => handleQuantityChange(1)}
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>
          </div>

          {/* Add to Cart Button */}
          <Button
            onClick={handleAddToCart}
            disabled={!selectedVariant.available || isThisVariantAdding}
            className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border-0"
          >
            {isThisVariantAdding ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                Adding to Cart...
              </div>
            ) : isJustAdded ? (
              <div className="flex items-center gap-2 text-green-100">
                <CheckCircle className="h-5 w-5" />
                Added to Cart!
              </div>
            ) : !selectedVariant.available ? (
              'Out of Stock'
            ) : (
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-4 w-4" />
                Add to Cart - {formatMoney(parseFloat(selectedVariant.price) * quantity)}
              </div>
            )}
          </Button>
        </div>

        {/* Tags */}
        {product.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-2 border-t border-gray-100">
            {product.tags.slice(0, 3).map((tag: string) => (
              <Badge key={tag} variant="outline" className="text-xs border-gray-200 text-gray-600">
                {tag}
              </Badge>
            ))}
            {product.tags.length > 3 && (
              <Badge variant="outline" className="text-xs border-gray-200 text-gray-500">
                +{product.tags.length - 3} more
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}; 