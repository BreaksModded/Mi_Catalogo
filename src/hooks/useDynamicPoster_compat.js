/**
 * ARCHIVO DE COMPATIBILIDAD - DEPRECATED
 * Este archivo es temporal para compatibilidad. 
 * Migrar gradualmente a useHybridContent para mejores características.
 */

import { useHybridPoster, useHybridContentBatch } from './useHybridContent';

/**
 * @deprecated Usar useHybridPoster en su lugar
 * Hook de compatibilidad que redirige a la nueva implementación
 */
export const useDynamicPoster = (tmdbId, mediaType, fallbackImage = null) => {
  const { posterUrl, loading, isFromCache } = useHybridPoster(tmdbId, mediaType, fallbackImage);
  
  return {
    imageUrl: posterUrl,
    loading,
    cached: isFromCache,
    error: null
  };
};

/**
 * @deprecated Usar useHybridContentBatch en su lugar
 * Hook de compatibilidad para múltiples posters
 */
export const useDynamicPosters = (mediaList) => {
  const contentMap = useHybridContentBatch(mediaList);
  
  // Convertir al formato esperado por el componente App.js
  const postersMap = {};
  Object.keys(contentMap).forEach(key => {
    const content = contentMap[key];
    postersMap[key] = {
      imageUrl: content.posterUrl,
      loading: content.loading,
      cached: content.cached,
      error: content.error
    };
  });
  
  return postersMap;
};

/**
 * @deprecated Usar useHybridPoster en su lugar
 * Función de compatibilidad para obtener URL de poster
 */
export const getDynamicPosterUrl = (tmdbId, mediaType, fallbackImage = null) => {
  // Esta función es síncrona y no puede usar hooks
  // Retornar la imagen de fallback por compatibilidad
  return fallbackImage;
};

export default useDynamicPoster;
