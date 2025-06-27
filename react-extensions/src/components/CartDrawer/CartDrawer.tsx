import React, { useState, useEffect } from 'react';
import { ShoppingBag } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetFooter 
} from '../ui/sheet';
import { useCartManager } from '../../hooks/useCartManager';
import { useCartProgress } from '../../hooks/useCartProgress';
import { SeedingProgressBar } from './SeedingProgressBar';
import { CartItemsList } from './CartItemsList';
import { formatPrice } from '../../utils/format-helpers';
import { isCartEmpty } from '../../helpers/cart.helpers';

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
    isUpdating,
    handleQuantityUpdate,
    handleCheckout,
    handleClearCart,
    refreshCart
  } = useCartManager();

  const { progress, isActive, startProgress, stopProgress } = useCartProgress();
  const [showSeeding, setShowSeeding] = useState(true);

  // Start seeding animation when drawer opens
  useEffect(() => {
    if (isOpen && showSeeding) {
      startProgress();
      
      // Auto-complete seeding after 3 seconds
      const timer = setTimeout(() => {
        handleSkipSeeding();
      }, 3000);
      
      return () => clearTimeout(timer);
    } else {
      stopProgress();
    }
  }, [isOpen, showSeeding, startProgress, stopProgress]);

  const handleSkipSeeding = () => {
    stopProgress();
    setShowSeeding(false);
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => {
      if (!open) {
        onClose();
        // Reset seeding state when closing
        setShowSeeding(true);
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
          {showSeeding ? (
            <SeedingProgressBar 
              progress={progress}
              onSkip={handleSkipSeeding}
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
          ) : !cart || isCartEmpty(cart) ? (
            <EmptyCart onClose={onClose} />
          ) : (
            <CartItemsList 
              items={cart.items}
              onQuantityUpdate={handleQuantityUpdate}
              isUpdating={isUpdating}
            />
          )}
        </div>

        {/* Footer */}
        {cart && !isCartEmpty(cart) && !showSeeding && (
          <SheetFooter className="p-6 pt-4 border-t flex-col space-y-4">
            <CartFooter 
              cart={cart}
              onCheckout={handleCheckout}
              onClearCart={handleClearCart}
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