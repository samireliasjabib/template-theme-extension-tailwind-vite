import React from 'react';
import { Plus, Minus, Trash2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { formatPrice, formatVariantTitle } from '../../utils/format-helpers';

interface CartItemCardProps {
  item: any;
  onQuantityUpdate: (variantId: number, quantity: number) => void;
  isUpdating: boolean;
}

/**
 * Individual Cart Item Card Component
 * Displays product info, quantity controls, and remove button
 */
export function CartItemCard({ item, onQuantityUpdate, isUpdating }: CartItemCardProps) {
  const variantTitle = formatVariantTitle(item.variant_title || '');
  
  return (
    <Card className="p-4">
      <div className="flex gap-4">
        {/* Product Image */}
        <div className="flex-shrink-0">
          <img
            src={item.image || item.featured_image?.url || '/placeholder-product.png'}
            alt={item.product_title || item.title || 'Product'}
            className="w-16 h-16 object-cover rounded-md"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/placeholder-product.png';
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