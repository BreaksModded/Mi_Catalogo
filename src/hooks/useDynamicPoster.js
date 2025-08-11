import { useState, useEffect, useMemo } from 'react';
import { useLanguage } from '../context/LanguageContext';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "https://mi-catalogo-backend.onrender.com";

// Cache frontend para evitar peticiones repetidas durante la sesión
const posterFrontendCache = new Map();
const FRONTEND_CACHE_TTL = 5 * 60 * 1000; // 5 minutos en milliseconds

// Función para obtener del cache frontend
function getFrontendCache(key) {
  const cached = posterFrontendCache.get(key);
  if (cached && (Date.now() - cached.timestamp) < FRONTEND_CACHE_TTL) {
    return cached.value;
  }
  if (cached) {
    posterFrontendCache.delete(key); // Eliminar expirado
  }
  return null;
}

// Función para guardar en cache frontend
function setFrontendCache(key, value) {
  posterFrontendCache.set(key, {
    value,
    timestamp: Date.now()
  });
  
  // Limpiar cache si crece mucho (mantener solo últimas 500 entradas)
  if (posterFrontendCache.size > 500) {
    const entries = Array.from(posterFrontendCache.entries());
    entries.sort((a, b) => b[1].timestamp - a[1].timestamp);
    posterFrontendCache.clear();
    entries.slice(0, 400).forEach(([key, value]) => {
      posterFrontendCache.set(key, value);
    });
  }
}

export function useDynamicPoster(tmdbId, mediaType, fallbackImage = '') {
  const { currentLanguage } = useLanguage();
  const [posterUrl, setPosterUrl] = useState(fallbackImage);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Mapear idioma para el endpoint optimizado (añadidos pt, fr, de)
  const getLanguageCode = (lang) => {
    switch (lang) {
      case 'es':
      case 'en':
      case 'pt':
      case 'fr':
      case 'de':
        return lang;
      default:
        return 'en';
    }
  };

  useEffect(() => {
    // Si no hay tmdb_id, usar imagen de fallback inmediatamente
    if (!tmdbId || !mediaType) {
      setPosterUrl(fallbackImage);
      setLoading(false);
      setError(null);
      return;
    }

    const langCode = getLanguageCode(currentLanguage);
    const languageParamMap = {
      es: 'es-ES',
      en: 'en-US',
      pt: 'pt-PT',
      fr: 'fr-FR',
      de: 'de-DE'
    };
    const languageParam = languageParamMap[langCode] || 'en-US';
    const cacheKey = `${tmdbId}-${mediaType}-${langCode}`;

    // Verificar cache frontend primero
    const cachedPoster = getFrontendCache(cacheKey);
    if (cachedPoster) {
      setPosterUrl(cachedPoster);
      setLoading(false);
      setError(null);
      return;
    }

    // Si no está en cache, hacer petición
    setLoading(true);
    setError(null);

    const fetchPoster = async () => {
      try {
        // Usar el endpoint optimizado que incluye cache backend
        const response = await fetch(
          `${BACKEND_URL}/poster/${tmdbId}?media_type=${encodeURIComponent(mediaType)}&language=${languageParam}`
        );
        
        if (response.ok) {
          const data = await response.json();
          const newPosterUrl = data.poster_url || fallbackImage;
          
          // Guardar en cache frontend
          setFrontendCache(cacheKey, newPosterUrl);
          setPosterUrl(newPosterUrl);
        } else {
          // Si falla, usar imagen de fallback
          setPosterUrl(fallbackImage);
        }
      } catch {
        setPosterUrl(fallbackImage);
      } finally {
        setLoading(false);
      }
    };

    fetchPoster();
  }, [tmdbId, mediaType, currentLanguage, fallbackImage]);

  return {
    posterUrl,
    loading,
    error
  };
}

// Hook para manejar múltiples portadas dinámicas de forma eficiente
export function useDynamicPosters(mediaList) {
  const { currentLanguage } = useLanguage();
  const [postersMap, setPostersMap] = useState(new Map());
  const [loading, setLoading] = useState(false);

  const getLanguageCode = (lang) => {
    switch (lang) {
      case 'es':
      case 'en':
      case 'pt':
      case 'fr':
      case 'de':
        return lang;
      default:
        return 'en';
    }
  };

  // Create a stable key for the media list to prevent unnecessary re-renders
  const mediaListKey = useMemo(() => {
    if (!Array.isArray(mediaList)) return '[]';
    return JSON.stringify(mediaList.map(media => ({ id: media?.id, tmdb_id: media?.tmdb_id })));
  }, [mediaList]);

  useEffect(() => {
    if (!mediaList || mediaList.length === 0) {
      setPostersMap(new Map());
      setLoading(false);
      return;
    }

    const langCode = getLanguageCode(currentLanguage);
    const languageParamMap = {
      es: 'es-ES',
      en: 'en-US',
      pt: 'pt-PT',
      fr: 'fr-FR',
      de: 'de-DE'
    };
    const languageParam = languageParamMap[langCode] || 'en-US';
    const newPostersMap = new Map();

    // Extraer IDs de medias válidas
    const mediaIds = mediaList
      .filter(media => media && media.id)
      .map(media => media.id)
      .filter(id => id);

    if (mediaIds.length === 0) {
      setPostersMap(new Map());
      setLoading(false);
      return;
    }

    // Verificar cache frontend para todos los medias
    const cacheKeys = mediaIds.map(id => `batch_${id}_${langCode}`);
    const cachedResults = cacheKeys.map(key => getFrontendCache(key));
    
    let needsFetch = false;
    let uncachedIds = [];

    // Procesar resultados de cache
    mediaIds.forEach((mediaId, index) => {
      const cached = cachedResults[index];
      if (cached) {
        newPostersMap.set(mediaId, cached);
      } else {
        needsFetch = true;
        uncachedIds.push(mediaId);
      }
    });

    // Si todo está en cache, usar esos resultados
    if (!needsFetch) {
      // Solo actualizar si el mapa realmente ha cambiado
      setPostersMap(prevMap => {
        // Comparar si hay cambios reales
        if (prevMap.size !== newPostersMap.size) {
          return newPostersMap;
        }
        
        let hasChanges = false;
        for (const [key, value] of newPostersMap) {
          if (prevMap.get(key) !== value) {
            hasChanges = true;
            break;
          }
        }
        
        return hasChanges ? newPostersMap : prevMap;
      });
      setLoading(false);
      return;
    }

    // Hacer fetch solo para los IDs que no están en cache
    setLoading(true);
    
    const fetchOptimizedPosters = async () => {
      try {
        const idsToFetch = uncachedIds.length > 0 ? uncachedIds : mediaIds;
        
        const url = `${BACKEND_URL}/posters-optimized?media_ids=${idsToFetch.join(',')}&language=${languageParam}`;
        const response = await fetch(url);
        
        if (response.ok) {
          const data = await response.json();
          const posters = data.posters || {};
          
          // Combinar resultados de cache con nuevos resultados
          mediaList.forEach(media => {
            if (media && media.id) {
              let posterUrl;
              
              // Si ya tenemos en cache, usar eso
              if (newPostersMap.has(media.id)) {
                posterUrl = newPostersMap.get(media.id);
              } else {
                // Usar resultado de la API o fallback
                posterUrl = posters[media.id.toString()] || media.imagen || '';
                
                // Guardar en cache frontend
                const cacheKey = `batch_${media.id}_${langCode}`;
                setFrontendCache(cacheKey, posterUrl);
              }
              
              newPostersMap.set(media.id, posterUrl);
            }
          });
        } else {
          // Fallback: usar imágenes originales para los no cacheados
          mediaList.forEach(media => {
            if (media && media.id && !newPostersMap.has(media.id)) {
              const fallbackPoster = media.imagen || '';
              newPostersMap.set(media.id, fallbackPoster);
              
              // Guardar fallback en cache también
              const cacheKey = `batch_${media.id}_${langCode}`;
              setFrontendCache(cacheKey, fallbackPoster);
            }
          });
        }
      } catch {
        mediaList.forEach(media => {
          if (media && media.id && !newPostersMap.has(media.id)) {
            const fallbackPoster = media.imagen || '';
            newPostersMap.set(media.id, fallbackPoster);
          }
        });
      } finally {
        setLoading(false);
      }
      
      // Solo actualizar si el mapa realmente ha cambiado
      setPostersMap(prevMap => {
        // Comparar si hay cambios reales
        if (prevMap.size !== newPostersMap.size) {
          return newPostersMap;
        }
        
        let hasChanges = false;
        for (const [key, value] of newPostersMap) {
          if (prevMap.get(key) !== value) {
            hasChanges = true;
            break;
          }
        }
        
        return hasChanges ? newPostersMap : prevMap;
      });
    };

    fetchOptimizedPosters();
  }, [mediaListKey, currentLanguage]);

  return { postersMap, loading };
}

// Función helper para obtener la portada dinámica de un medio específico
export function getDynamicPosterUrl(media, postersMap) {
  if (!media) return '';
  
  // Si hay mapa de portadas dinámicas, usarlo
  if (postersMap && postersMap.has && postersMap.has(media.id)) {
    const dynamicUrl = postersMap.get(media.id);
    return dynamicUrl;
  }
  
  // Fallback a la imagen original
  return media.imagen || '';
}

// Función para limpiar cache frontend (útil para desarrollo)
export function clearFrontendCache() {
  posterFrontendCache.clear();
}

// Función para obtener estadísticas del cache frontend
export function getFrontendCacheStats() {
  return {
    size: posterFrontendCache.size,
    entries: Array.from(posterFrontendCache.keys())
  };
}
