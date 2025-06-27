import { useState, useEffect, useCallback } from 'react';
import { SeedingProgress, generateSeedingProgress } from '../helpers/cart.helpers';

/**
 * Hook for managing cart drawer seeding state
 * Handles the progressive loading simulation when initializing cart drawer
 */
export function useCartSeeding() {
  const [currentProgress, setCurrentProgress] = useState<SeedingProgress>(() => 
    generateSeedingProgress(0)
  );
  const [isSeeding, setIsSeeding] = useState(false);
  const [hasCompleted, setHasCompleted] = useState(false);

  /**
   * Start the seeding process
   */
  const startSeeding = useCallback(() => {
    if (isSeeding || hasCompleted) return;
    
    setIsSeeding(true);
    setHasCompleted(false);
    setCurrentProgress(generateSeedingProgress(0));
    
    console.log('🌱 Starting cart drawer seeding...');
    
    let step = 0;
    const maxSteps = 4; // 0-4 = 5 steps total
    
    const progressInterval = setInterval(() => {
      step++;
      const progress = generateSeedingProgress(step);
      setCurrentProgress(progress);
      
      console.log(`🌱 Seeding progress: ${progress.progress}% - ${progress.message}`);
      
      if (progress.isComplete || step >= maxSteps) {
        clearInterval(progressInterval);
        setIsSeeding(false);
        setHasCompleted(true);
        console.log('✅ Cart drawer seeding completed!');
      }
    }, 600); // 600ms per step for smooth progress

    return () => clearInterval(progressInterval);
  }, [isSeeding, hasCompleted]);

  /**
   * Reset seeding state
   */
  const resetSeeding = useCallback(() => {
    setIsSeeding(false);
    setHasCompleted(false);
    setCurrentProgress(generateSeedingProgress(0));
    console.log('🔄 Cart seeding state reset');
  }, []);

  /**
   * Skip to completion (for testing or instant load)
   */
  const completeSeeding = useCallback(() => {
    setIsSeeding(false);
    setHasCompleted(true);
    setCurrentProgress(generateSeedingProgress(4)); // Jump to final step
    console.log('⏭️ Cart seeding completed instantly');
  }, []);

  /**
   * Auto-start seeding on first mount
   */
  useEffect(() => {
    const autoStartTimer = setTimeout(() => {
      if (!hasCompleted && !isSeeding) {
        startSeeding();
      }
    }, 100); // Small delay to ensure smooth animation

    return () => clearTimeout(autoStartTimer);
  }, []); // Run only once on mount

  return {
    // State
    currentProgress,
    isSeeding,
    hasCompleted,
    
    // Computed values
    progressPercentage: currentProgress.progress,
    progressMessage: currentProgress.message,
    progressStage: currentProgress.stage,
    isInitializing: currentProgress.stage === 'initializing',
    isLoading: currentProgress.stage === 'loading',
    isSyncing: currentProgress.stage === 'syncing',
    isComplete: currentProgress.stage === 'complete',
    
    // Actions
    startSeeding,
    resetSeeding,
    completeSeeding,
  };
} 