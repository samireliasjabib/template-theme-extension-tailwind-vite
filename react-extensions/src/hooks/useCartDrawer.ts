import { useState, useCallback } from 'react';

/**
 * Hook for managing cart drawer state
 * Centralizes drawer open/close logic
 */
export function useCartDrawer() {
  const [isOpen, setIsOpen] = useState(false);

  const openDrawer = useCallback(() => {
    console.log('🛒 useCartDrawer: Opening drawer, current state:', isOpen);
    setIsOpen(true);
  }, [isOpen]);

  const closeDrawer = useCallback(() => {
    console.log('🛒 useCartDrawer: Closing drawer, current state:', isOpen);
    setIsOpen(false);
  }, [isOpen]);

  const toggleDrawer = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  return {
    isOpen,
    openDrawer,
    closeDrawer,
    toggleDrawer,
  };
} 