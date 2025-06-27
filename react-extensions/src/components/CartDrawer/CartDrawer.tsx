import React, { useState } from 'react';
import { ShoppingBag, Plus, Minus, Trash2, Loader2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';
import { Progress } from '../ui/progress';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetFooter 
} from '../ui/sheet';
import { useShopifyCart } from '../../hooks/useShopifyCart';
import { useCartSeeding } from '../../hooks/useCartSeeding';
import { formatPrice, formatVariantTitle } from '../../utils/format-helpers';
import { 
  formatCartItem, 
  generateCartItemKey, 
  sortCartItems,
  isCartEmpty 
} from '../../helpers/cart.helpers';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Custom Cart Drawer Component using shadcn Sheet
 * Replaces theme's default cart drawer with React-powered version
 */
export function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const {
    cart,
    loading,
    error,
    itemCount,
    updateQuantity,
    removeFromCart,
    clearCart,
    refreshCart
  } = useShopifyCart();

  const {
    isSeeding,
    hasCompleted,
    progressPercentage,
    progressMessage,
    progressStage,
    completeSeeding
  } = useCartSeeding();

  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  // Show seeding state when drawer first opens
  const showSeedingState = isOpen && !hasCompleted && isSeeding;

  const handleQuantityUpdate = async (variantId: number, newQuantity: number) => {
    if (newQuantity < 0) return;
    
    setIsUpdating(variantId.toString());
    
    try {
      if (newQuantity === 0) {
        await removeFromCart(variantId);
      } else {
        await updateQuantity(variantId, newQuantity);
      }
    } catch (error) {
      console.error('Failed to update quantity:', error);
    } finally {
      setIsUpdating(null);
    }
  };

  const handleCheckout = () => {
    window.location.href = '/checkout';
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => {
      if (!open) {
        onClose();
      }
    }}>
      <SheetContent side="right" className="w-full sm:max-w-lg flex flex-col p-0">
        {/* Header */}
        <SheetHeader className="space-y-0 p-6 pb-4 border-b">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            <SheetTitle className="text-left">
              AI CartDrawer Seedid.AI
              {itemCount > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {itemCount}
                </Badge>
              )}
            </SheetTitle>
          </div>
        </SheetHeader>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {showSeedingState ? (
            <SeedingState 
              progress={progressPercentage}
              message={progressMessage}
              stage={progressStage}
              onComplete={completeSeeding}
            />
          ) : loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : error ? (
            <div className="space-y-4">
              <div className="text-red-500 text-sm">{error}</div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={refreshCart}
              >
                Try Again
              </Button>
            </div>
          ) : !cart || cart.items.length === 0 ? (
            <EmptyCart onClose={onClose} />
          ) : (
            <CartItems 
              items={sortCartItems(cart.items)}
              onQuantityUpdate={handleQuantityUpdate}
              isUpdating={isUpdating}
            />
          )}
        </div>

        {/* Footer */}
        {cart && cart.items.length > 0 && (
          <SheetFooter className="p-6 pt-4 border-t flex-col space-y-4">
            <CartFooter 
              cart={cart}
              onCheckout={handleCheckout}
              onClearCart={clearCart}
              onClose={onClose}
            />
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}

/**
 * Empty Cart State
 */
function EmptyCart({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center">
      <ShoppingBag className="h-16 w-16 text-gray-300 mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        Your cart is empty
      </h3>
      <p className="text-gray-500 mb-6">
        Looks like you haven't added anything to your cart yet.
      </p>
      <Button onClick={onClose}>
        Continue Shopping
      </Button>
    </div>
  );
}

/**
 * Cart Items List
 */
interface CartItemsProps {
  items: any[];
  onQuantityUpdate: (variantId: number, quantity: number) => void;
  isUpdating: string | null;
}

function CartItems({ items, onQuantityUpdate, isUpdating }: CartItemsProps) {
  return (
    <div className="space-y-4">
      {items.map((item) => (
        <CartItemCard 
          key={item.id}
          item={item}
          onQuantityUpdate={onQuantityUpdate}
          isUpdating={isUpdating === item.variant_id?.toString()}
        />
      ))}
    </div>
  );
}

/**
 * Individual Cart Item Card
 */
interface CartItemCardProps {
  item: any;
  onQuantityUpdate: (variantId: number, quantity: number) => void;
  isUpdating: boolean;
}

function CartItemCard({ item, onQuantityUpdate, isUpdating }: CartItemCardProps) {
  const variantTitle = formatVariantTitle(item.variant_title || '');
  
  return (
    <Card className="p-4">
      <div className="flex gap-4">
        {/* Product Image */}
        <div className="flex-shrink-0">
          <img 
            src={item.image || 'https://via.placeholder.com/64x64/f8f9fa/6c757d?text=No+Image'}
            alt={item.title || 'Product'}
            className="w-16 h-16 object-cover rounded-md bg-gray-100"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = 'https://via.placeholder.com/64x64/f8f9fa/6c757d?text=No+Image';
            }}
          />
        </div>

        {/* Product Info */}
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-sm leading-tight mb-1">
            {item.product_title || item.title || 'Product'}
          </h4>
          {variantTitle && (
            <p className="text-xs text-gray-500 mb-2">{variantTitle}</p>
          )}
          
          {/* Price */}
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-medium">
              {formatPrice(item.price || 0)} × {item.quantity || 1}
            </div>
            <div className="text-sm font-semibold">
              {formatPrice(item.line_price || item.price || 0)}
            </div>
          </div>

          {/* Quantity Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => onQuantityUpdate(item.variant_id || item.id, (item.quantity || 1) - 1)}
                disabled={isUpdating || (item.quantity || 1) <= 1}
              >
                <Minus className="h-3 w-3" />
              </Button>
              
              <span className="text-sm font-medium min-w-[2rem] text-center">
                {isUpdating ? '...' : item.quantity || 1}
              </span>
              
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => onQuantityUpdate(item.variant_id || item.id, (item.quantity || 1) + 1)}
                disabled={isUpdating}
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>

            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
              onClick={() => onQuantityUpdate(item.variant_id || item.id, 0)}
              disabled={isUpdating}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}

/**
 * Cart Footer with totals and actions
 */
interface CartFooterProps {
  cart: any;
  onCheckout: () => void;
  onClearCart: () => void;
  onClose: () => void;
}

function CartFooter({ cart, onCheckout, onClearCart, onClose }: CartFooterProps) {
  return (
    <div className="w-full space-y-4">
      {/* Subtotal */}
      <div className="flex justify-between items-center text-lg font-semibold">
        <span>Subtotal</span>
        <span>{formatPrice(cart.total_price || 0)}</span>
      </div>

      {/* Shipping Notice */}
      <p className="text-xs text-gray-500 text-center">
        Shipping and taxes calculated at checkout
      </p>

      {/* Action Buttons */}
      <div className="space-y-2">
        <Button 
          onClick={onCheckout} 
          className="w-full"
          size="lg"
        >
          Proceed to Checkout
        </Button>
        
        <div className="grid grid-cols-2 gap-2">
          <Button 
            variant="outline" 
            onClick={onClose}
          >
            Continue Shopping
          </Button>
          
          <Button 
            variant="ghost" 
            onClick={onClearCart}
            className="text-red-500 hover:text-red-700"
          >
            Clear Cart
          </Button>
        </div>
      </div>
    </div>
  );
}

/**
 * Seeding State Component
 * Shows progress while cart drawer is initializing
 */
interface SeedingStateProps {
  progress: number;
  message: string;
  stage: string;
  onComplete: () => void;
}

function SeedingState({ progress, message, stage, onComplete }: SeedingStateProps) {
  return (
    <div className="flex flex-col items-center justify-center h-64 text-center space-y-6">
      {/* Logo/Icon */}
      <div className="relative">
        <ShoppingBag className="h-16 w-16 text-primary animate-pulse" />
        {stage === 'syncing' && (
          <div className="absolute -top-1 -right-1">
            <Loader2 className="h-6 w-6 text-primary animate-spin" />
          </div>
        )}
      </div>

      {/* Title */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-gray-900">
          Cart Drawer Seeding in Progress
        </h3>
        <p className="text-sm text-gray-600 max-w-xs">
          Setting up your personalized shopping experience...
        </p>
      </div>

      {/* Progress Bar */}
      <div className="w-full max-w-xs space-y-3">
        <Progress value={progress} className="h-2" />
        <div className="flex justify-between text-xs text-gray-500">
          <span>{progress}%</span>
          <span>{stage}</span>
        </div>
      </div>

      {/* Current Message */}
      <p className="text-sm font-medium text-primary">
        {message}
      </p>

      {/* Skip Button for Testing */}
      {progress < 100 && (
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onComplete}
          className="text-xs text-gray-400 hover:text-gray-600"
        >
          Skip Animation
        </Button>
      )}

      {/* Completion State */}
      {progress === 100 && (
        <div className="space-y-2">
          <div className="text-green-600 text-sm font-medium">
            ✅ Ready to shop!
          </div>
          <Button 
            size="sm" 
            onClick={onComplete}
            className="text-xs"
          >
            Continue
          </Button>
        </div>
      )}
    </div>
  );
} 