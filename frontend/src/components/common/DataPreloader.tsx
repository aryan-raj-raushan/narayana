'use client';

import { useEffect, useRef } from 'react';
import { useDataStore } from '@/store/dataStore';

/**
 * DataPreloader - Preloads essential app data once on initial mount
 * This component should be placed in the root layout to ensure data is loaded once
 * and shared across all pages via the global store
 */
export default function DataPreloader() {
  const { preloadEssentialData } = useDataStore();
  const hasPreloaded = useRef(false);

  useEffect(() => {
    // Only preload once on app startup
    if (!hasPreloaded.current) {
      hasPreloaded.current = true;
      preloadEssentialData().catch((err) => {
        console.error('Failed to preload essential data:', err);
      });
    }
  }, [preloadEssentialData]);

  // This component doesn't render anything
  return null;
}
