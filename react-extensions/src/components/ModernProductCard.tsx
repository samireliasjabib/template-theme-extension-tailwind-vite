import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { cn } from '../lib/utils';
import { Heart, ShoppingCart, Star } from 'lucide-react';

interface ModernProductCardProps {
  product: {
    id: string;
    title: string;
    price: string;
    description: string;
    image: string;
    variants?: Array<{
      id: string;
      title: string;
      price: string;
      available: boolean;
    }>;
  };
  themeColor?: string;
  onAddToCart?: (variantId: string, quantity: number) => Promise<void>;
  animationEnabled?: boolean;
}

const ModernProductCard: React.FC<ModernProductCardProps> = ({
  product,
  themeColor = '#6366f1',
  onAddToCart,
  animationEnabled = true,
}) => {
  const [selectedVariant, setSelectedVariant] = useState(product.variants?.[0]?.id || product.id);
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleAddToCart = async () => {
    if (!onAddToCart) return;
    
    setIsLoading(true);
    try {
      await onAddToCart(selectedVariant, quantity);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
    } catch (error) {
      console.error('Failed to add to cart:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleLike = () => {
    setIsLiked(!isLiked);
  };

  const incrementQuantity = () => setQuantity(prev => prev + 1);
  const decrementQuantity = () => setQuantity(prev => Math.max(1, prev - 1));

  return (
    <Card 
      className={cn(
        "group relative overflow-hidden transition-all duration-300 hover:shadow-lg",
        animationEnabled && "hover:-translate-y-1",
        showSuccess && "ring-2 ring-green-500 ring-opacity-50"
      )}
      style={{ '--theme-color': themeColor } as React.CSSProperties}
    >
      {/* Product Image */}
      <div className="relative overflow-hidden">
        <img
          src={'https://www.google.com/url?sa=i&url=https%3A%2F%2Fwww.goodhousekeeping.com%2Flife%2Fpets%2Fg4531%2Fcutest-dog-breeds%2F&psig=AOvVaw3qglI8ET_NmRbbxffH92v4&ust=1750924739543000&source=images&cd=vfe&opi=89978449&ved=0CBQQjRxqFwoTCLCKyoqNjI4DFQAAAAAdAAAAABAE'}
          alt={product.title}
          className={cn(
            "h-48 w-full object-cover transition-transform duration-300",
            animationEnabled && "group-hover:scale-105"
          )}
        />
        
        {/* Like Button */}
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "absolute top-2 right-2 h-8 w-8 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white",
            isLiked && "text-red-500"
          )}
          onClick={toggleLike}
        >
          <Heart className={cn("h-4 w-4", isLiked && "fill-current")} />
        </Button>

        {/* Success Badge */}
        {showSuccess && (
          <div className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium animate-in slide-in-from-left">
            Added to cart!
          </div>
        )}
      </div>

      {/* Product Info */}
      <CardHeader className="pb-2">
        <CardTitle className="text-lg line-clamp-2">{product.title}</CardTitle>
        <CardDescription className="line-clamp-2">{product.description}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Price */}
        <div className="text-2xl font-bold" style={{ color: themeColor }}>
          {product.price}
        </div>

        {/* Variant Selector */}
        {product.variants && product.variants.length > 1 && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Variant:</label>
            <select
              value={selectedVariant}
              onChange={(e) => setSelectedVariant(e.target.value)}
              className="w-full p-2 border border-input rounded-md bg-background"
            >
              {product.variants.map((variant) => (
                <option key={variant.id} value={variant.id} disabled={!variant.available}>
                  {variant.title} - {variant.price} {!variant.available && '(Out of stock)'}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Quantity Selector */}
        <div className="flex items-center space-x-3">
          <span className="text-sm font-medium">Quantity:</span>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={decrementQuantity}
              disabled={quantity <= 1}
            >
              -
            </Button>
            <span className="w-8 text-center font-medium">{quantity}</span>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={incrementQuantity}
            >
              +
            </Button>
          </div>
        </div>
      </CardContent>

      <CardFooter>
        <Button 
          className="w-full"
          onClick={handleAddToCart}
          disabled={isLoading}
          style={{ backgroundColor: themeColor }}
        >
          {isLoading ? (
            <div className="flex items-center space-x-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              <span>Adding...</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <ShoppingCart className="h-4 w-4" />
              <span>Add to Cart</span>
            </div>
          )}
        </Button>
      </CardFooter>

      {/* Rating stars (decorative) */}
      <div className="absolute top-2 left-2 flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className="h-3 w-3 fill-yellow-400 text-yellow-400"
          />
        ))}
      </div>
    </Card>
  );
};

export default ModernProductCard;