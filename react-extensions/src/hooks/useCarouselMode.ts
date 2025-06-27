import { useState } from 'react';

export type CarouselMode = 'grid' | 'carousel' | 'carousel-dots' | 'carousel-vertical';

/**
 * Hook for managing carousel/grid display modes
 * Centralizes view mode state and provides mode-specific configurations
 */
export function useCarouselMode(initialMode: CarouselMode = 'carousel') {
  const [viewMode, setViewMode] = useState<CarouselMode>(initialMode);
  const [autoPlay, setAutoPlay] = useState(false);
  const [showDots, setShowDots] = useState(true);
  const [showArrows, setShowArrows] = useState(true);

  // Mode-specific configurations
  const getCarouselConfig = () => {
    const baseConfig = {
      align: "start" as const,
      loop: true,
    };

    switch (viewMode) {
      case 'carousel':
        return {
          ...baseConfig,
          orientation: 'horizontal' as const,
        };
      case 'carousel-dots':
        return {
          ...baseConfig,
          orientation: 'horizontal' as const,
        };
      case 'carousel-vertical':
        return {
          ...baseConfig,
          orientation: 'vertical' as const,
        };
      default:
        return baseConfig;
    }
  };

  // Get responsive breakpoints for current mode
  const getResponsiveBreakpoints = () => {
    switch (viewMode) {
      case 'carousel':
      case 'carousel-dots':
        return {
          sm: { basis: '1/2' },
          md: { basis: '1/3' },
          lg: { basis: '1/4' },
          xl: { basis: '1/5' },
        };
      case 'carousel-vertical':
        return {
          sm: { basis: '1' },
          md: { basis: '1' },
          lg: { basis: '1' },
          xl: { basis: '1' },
        };
      default:
        return {};
    }
  };

  return {
    // State
    viewMode,
    autoPlay,
    showDots,
    showArrows,
    
    // Actions
    setViewMode,
    setAutoPlay,
    setShowDots,
    setShowArrows,
    
    // Computed
    isCarouselMode: viewMode !== 'grid',
    config: getCarouselConfig(),
    breakpoints: getResponsiveBreakpoints(),
    
    // Mode checks
    isGrid: viewMode === 'grid',
    isCarousel: viewMode === 'carousel',
    isCarouselWithDots: viewMode === 'carousel-dots',
    isVerticalCarousel: viewMode === 'carousel-vertical',
  };
} 