import { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

// Cache para evitar peticiones repetidas
const posterCache = new Map();

export function useDynamicPoster(tmdbId, mediaType, fallbackImage = '') {
  const { currentLanguage } = useLanguage();
  const [posterUrl, setPosterUrl] = useState(fallbackImage);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Mapear idioma para TMDb API
  const getTmdbLanguage = (lang) => {
    switch (lang) {
      case 'en': return 'en-US';
      case 'es': return 'es-ES';
      default: return 'en-US';
    }
  };

  useEffect(() => {
    // Si no hay tmdb_id, usar imagen de fallback
    if (!tmdbId || !mediaType) {
      setPosterUrl(fallbackImage);
      return;
    }

    const tmdbLang = getTmdbLanguage(currentLanguage);
    const cacheKey = `${tmdbId}-${mediaType}-${tmdbLang}`;

    // Verificar cache primero
    if (posterCache.has(cacheKey)) {
      setPosterUrl(posterCache.get(cacheKey));
      return;
    }

    // Si ya hay una petición en curso para esta clave, no hacer otra
    if (loading) return;

    setLoading(true);
    setError(null);

    const fetchPoster = async () => {
      try {
        const response = await fetch(
          `${BACKEND_URL}/poster/${tmdbId}?media_type=${encodeURIComponent(mediaType)}&language=${encodeURIComponent(tmdbLang)}`
        );
        
        if (response.ok) {
          const data = await response.json();
          const newPosterUrl = data.poster_url || fallbackImage;
          
          // Guardar en cache
          posterCache.set(cacheKey, newPosterUrl);
          setPosterUrl(newPosterUrl);
        } else {
          // Si falla, usar imagen de fallback
          setPosterUrl(fallbackImage);
        }
      } catch (err) {
        console.error('Error fetching dynamic poster:', err);
        setError(err);
        setPosterUrl(fallbackImage);
      } finally {
        setLoading(false);
      }
    };

    fetchPoster();
  }, [tmdbId, mediaType, currentLanguage, fallbackImage, loading]);

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

  const getTmdbLanguage = (lang) => {
    switch (lang) {
      case 'en': return 'en-US';
      case 'es': return 'es-ES';
      default: return 'en-US';
    }
  };

  useEffect(() => {
    if (!mediaList || mediaList.length === 0) return;

    const tmdbLang = getTmdbLanguage(currentLanguage);
    const newPostersMap = new Map();

    // Procesar cada media
    const fetchPosters = async () => {
      const promises = mediaList.map(async (media) => {
        if (!media.tmdb_id) {
          newPostersMap.set(media.id, media.imagen || '');
          return;
        }

        const mediaType = media.tipo?.toLowerCase().includes('serie') ? 'tv' : 'movie';
        const cacheKey = `${media.tmdb_id}-${mediaType}-${tmdbLang}`;

        // Verificar cache
        if (posterCache.has(cacheKey)) {
          newPostersMap.set(media.id, posterCache.get(cacheKey));
          return;
        }

        try {
          const response = await fetch(
            `${BACKEND_URL}/poster/${media.tmdb_id}?media_type=${encodeURIComponent(mediaType)}&language=${encodeURIComponent(tmdbLang)}`
          );
          
          if (response.ok) {
            const data = await response.json();
            const posterUrl = data.poster_url || media.imagen || '';
            
            // Guardar en cache
            posterCache.set(cacheKey, posterUrl);
            newPostersMap.set(media.id, posterUrl);
          } else {
            newPostersMap.set(media.id, media.imagen || '');
          }
        } catch (err) {
          console.error(`Error fetching poster for media ${media.id}:`, err);
          newPostersMap.set(media.id, media.imagen || '');
        }
      });

      await Promise.all(promises);
      setPostersMap(newPostersMap);
    };

    fetchPosters();
  }, [mediaList, currentLanguage]);

  return postersMap;
}

// Función helper para obtener la portada dinámica de un medio específico
export function getDynamicPosterUrl(media, postersMap) {
  if (!media) return '';
  
  // Si hay mapa de portadas dinámicas, usarlo
  if (postersMap && postersMap.has(media.id)) {
    return postersMap.get(media.id);
  }
  
  // Fallback a la imagen original
  return media.imagen || '';
}
