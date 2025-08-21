import { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "https://mi-catalogo-backend.onrender.com";

/**
 * Hook híbrido que obtiene contenido desde cache local primero, con fallback a TMDb
 * Reemplaza la funcionalidad de useDynamicPoster con capacidades extendidas
 */
export const useHybridContent = (tmdbId, mediaType, fallbackImage = null, skipCache = false) => {
  const { currentLanguage } = useLanguage();
  const [content, setContent] = useState({
    posterUrl: fallbackImage,
    backdropUrl: null,
    title: null,
    synopsis: null,
    tagline: null,
    loading: true,
    cached: false,
    error: null
  });

  useEffect(() => {
    if (!tmdbId) {
      setContent(prev => ({
        ...prev,
        loading: false,
        posterUrl: fallbackImage
      }));
      return;
    }

    const fetchHybridContent = async () => {
      try {
        // 1. INTENTAR OBTENER DESDE CACHE LOCAL PRIMERO (solo si no se omite el cache)
        if (!skipCache) {
          const cacheResponse = await fetch(
            `${BACKEND_URL}/content-cache/${tmdbId}/${currentLanguage}`,
            {
              headers: {
                'Content-Type': 'application/json',
              },
            }
          );

          if (cacheResponse.ok) {
            const cachedData = await cacheResponse.json();
            
            // Verificar si tenemos datos útiles en cache
            const hasUsefulCache = 
              cachedData.poster_url || 
              cachedData.backdrop_url || 
              cachedData.title || 
              cachedData.synopsis ||
              cachedData.tagline;

            if (hasUsefulCache) {
              setContent({
                posterUrl: cachedData.poster_url || fallbackImage,
                backdropUrl: cachedData.backdrop_url,
                title: cachedData.title,
                synopsis: cachedData.synopsis,
                tagline: cachedData.tagline,
                loading: false,
                cached: true,
                error: null
              });
              return; // Usar solo cache si tenemos datos útiles
            }
          }
        }

        // 2. FALLBACK A TMDB SI NO HAY CACHE O ESTÁ INCOMPLETO (o si se omite el cache)
        if (skipCache) {
          // Omitiendo cache, consultando TMDb directamente
        } else {
          // Cache incompleto, consultando TMDb
        }
        
        const languageMapping = {
          'es': 'es-ES',
          'en': 'en-US',
          'fr': 'fr-FR',
          'de': 'de-DE',
          'pt': 'pt-PT'
        };
        
        const tmdbLanguage = languageMapping[currentLanguage] || 'es-ES';
        const endpoint = mediaType === 'tv' ? 'tv' : 'movie';
        
        const tmdbResponse = await fetch(
          `${BACKEND_URL}/tmdb/${endpoint}/${tmdbId}?language=${tmdbLanguage}`
        );

        if (tmdbResponse.ok) {
          const tmdbData = await tmdbResponse.json();
          
          setContent({
            posterUrl: tmdbData.poster_path 
              ? `https://image.tmdb.org/t/p/w500${tmdbData.poster_path}` 
              : fallbackImage,
            backdropUrl: tmdbData.backdrop_path 
              ? `https://image.tmdb.org/t/p/w1280${tmdbData.backdrop_path}` 
              : null,
            title: tmdbData.title || tmdbData.name,
            synopsis: tmdbData.overview,
            tagline: tmdbData.tagline,
            loading: false,
            cached: false,
            error: null
          });
          
          // 3. GUARDAR EN CACHE PARA FUTURAS CONSULTAS (opcional, fire-and-forget, solo si no se omitió el cache)
          if (!skipCache && (tmdbData.poster_path || tmdbData.backdrop_path || tmdbData.overview)) {
            fetch(`${BACKEND_URL}/content-cache`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                tmdb_id: tmdbId,
                media_type: mediaType,
                language_code: currentLanguage,
                poster_url: tmdbData.poster_path 
                  ? `https://image.tmdb.org/t/p/w500${tmdbData.poster_path}` 
                  : null,
                backdrop_url: tmdbData.backdrop_path 
                  ? `https://image.tmdb.org/t/p/w1280${tmdbData.backdrop_path}` 
                  : null,
                title: tmdbData.title || tmdbData.name,
                synopsis: tmdbData.overview,
                tagline: tmdbData.tagline
              })
            }).catch(() => {}); // Ignorar errores de guardado en cache
          }
        } else {
          throw new Error(`TMDb API error: ${tmdbResponse.status}`);
        }

      } catch (error) {
        console.error(`[HybridContent] Error obteniendo contenido para ${tmdbId}:`, error);
        setContent({
          posterUrl: fallbackImage,
          backdropUrl: null,
          title: null,
          synopsis: null,
          tagline: null,
          loading: false,
          cached: false,
          error: error.message
        });
      }
    };

    fetchHybridContent();
  }, [tmdbId, mediaType, currentLanguage, fallbackImage, skipCache]);

  return content;
};

/**
 * Hook simplificado para solo poster (compatibilidad con useDynamicPoster)
 */
export const useHybridPoster = (tmdbId, mediaType, fallbackImage = null, skipCache = false) => {
  const hybridContent = useHybridContent(tmdbId, mediaType, fallbackImage, skipCache);
  
  return {
    posterUrl: hybridContent.posterUrl,
    loading: hybridContent.loading,
    cached: hybridContent.cached,
    error: hybridContent.error
  };
};

/**
 * Hook para múltiples elementos (optimizado para listas)
 */
export const useHybridContentBatch = (mediaList) => {
  const { currentLanguage } = useLanguage();
  const [contentMap, setContentMap] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!mediaList || mediaList.length === 0) {
      setLoading(false);
      return;
    }

    const fetchBatchContent = async () => {
      setLoading(true);
      const newContentMap = {};

      try {
        // Obtener contenido en lotes para mejor rendimiento
        const tmdbIds = mediaList
          .filter(media => media.tmdb_id)
          .map(media => media.tmdb_id);

        if (tmdbIds.length > 0) {
          const batchResponse = await fetch(
            `${BACKEND_URL}/content-cache/batch`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                tmdb_ids: tmdbIds,
                language_code: currentLanguage
              })
            }
          );

          if (batchResponse.ok) {
            const batchData = await batchResponse.json();
            
            // Mapear datos por tmdb_id
            batchData.forEach(item => {
              newContentMap[item.tmdb_id] = {
                posterUrl: item.poster_url,
                backdropUrl: item.backdrop_url,
                title: item.title,
                synopsis: item.synopsis,
                tagline: item.tagline,
                cached: true
              };
            });
          }
        }

        // Para elementos sin cache, usar imagen fallback
        mediaList.forEach(media => {
          if (media.tmdb_id && !newContentMap[media.tmdb_id]) {
            newContentMap[media.tmdb_id] = {
              posterUrl: media.imagen,
              backdropUrl: null,
              title: media.titulo,
              synopsis: media.sinopsis,
              tagline: null,
              cached: false
            };
          }
        });

        setContentMap(newContentMap);
      } catch (error) {
        console.error('[HybridContent] Error en lote:', error);
        
        // Fallback: usar datos originales
        mediaList.forEach(media => {
          if (media.tmdb_id) {
            newContentMap[media.tmdb_id] = {
              posterUrl: media.imagen,
              backdropUrl: null,
              title: media.titulo,
              synopsis: media.sinopsis,
              tagline: null,
              cached: false
            };
          }
        });
        setContentMap(newContentMap);
      } finally {
        setLoading(false);
      }
    };

    fetchBatchContent();
  }, [mediaList, currentLanguage]);

  return { contentMap, loading };
};

export default useHybridContent;
