import { useState, useEffect } from 'react';

/**
 * Simple infinite progress hook for cart drawer seeding animation
 * Creates a smooth 0→100→0 loop animation
 */
export function useCartProgress() {
  const [progress, setProgress] = useState(40);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      setProgress(prev => {
        // Create smooth 0→100→0 loop
        const newValue = prev + 2; // Increment by 2% each step
        
        if (newValue >= 100) {
          return 0; // Reset to 0 when reaching 100
        }
        
        return newValue;
      });
    }, 50); // Update every 50ms for smooth animation

    return () => clearInterval(interval);
  }, [isActive]);

  const startProgress = () => {
    setIsActive(true);
    setProgress(0);
  };

  const stopProgress = () => {
    setIsActive(false);
    setProgress(0);
  };

  return {
    progress,
    isActive,
    startProgress,
    stopProgress,
  };
} 