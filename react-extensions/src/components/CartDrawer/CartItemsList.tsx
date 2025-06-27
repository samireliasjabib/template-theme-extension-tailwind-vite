import React from 'react';
import { CartItemCard } from './CartItemCard';
import { sortCartItems } from '../../helpers/cart.helpers';

interface CartItemsListProps {
  items: any[];
  onQuantityUpdate: (variantId: number, quantity: number) => void;
  isUpdating: string | null;
}

/**
 * Cart Items List Component
 * Renders a list of cart items using CartItemCard components
 */
export function CartItemsList({ items, onQuantityUpdate, isUpdating }: CartItemsListProps) {
  // Sort items for consistent display order
  const sortedItems = sortCartItems(items);

  return (
    <div className="space-y-4">
      {sortedItems.map((item) => (
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