import { useEffect } from 'react';
import { imagenDeCarta } from '../utils/cartas';

export const usePreloadDeck = () => {
  useEffect(() => {
    // Preload all 54 card images in the background
    // This ensures that when the "baraja" starts dealing, images are already cached
    const preloadImages = async () => {
      // Small delay to allow the main UI to render first
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      for (let i = 1; i <= 54; i++) {
        const src = imagenDeCarta(i);
        if (src) {
          const img = new Image();
          img.src = src;
        }
      }
    };
    
    void preloadImages();
  }, []);
};
