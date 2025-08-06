// Sistema híbrido de traducción de contenido dinámico con caché en backend
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "https://mi-catalogo-backend.onrender.com";

export class ContentTranslationService {
  constructor() {
    this.memoryCache = new Map();
    this.pendingRequests = new Map();
  }

  // Método principal para obtener contenido traducido
  async getTranslatedContent(media, targetLanguage) {
    if (!media || !media.id) {
      return media;
    }

    // Retornar contenido original para español
    if (targetLanguage === 'es') {
      return {
        ...media,
        translationSource: 'original'
      };
    }

    const cacheKey = `${media.id}-${targetLanguage}`;
    
    // Verificar cache en memoria
    if (this.memoryCache.has(cacheKey)) {
      return this.memoryCache.get(cacheKey);
    }

    // Verificar si hay una petición pendiente
    if (this.pendingRequests.has(cacheKey)) {
      return this.pendingRequests.get(cacheKey);
    }

    // Crear y cachear la promesa
    const translationPromise = this.fetchTranslation(media, targetLanguage);
    this.pendingRequests.set(cacheKey, translationPromise);

    try {
      const result = await translationPromise;
      this.memoryCache.set(cacheKey, result);
      return result;
    } finally {
      this.pendingRequests.delete(cacheKey);
    }
  }

  async fetchTranslation(media, targetLanguage) {
    try {
      // Intentar obtener del caché del backend
      const response = await fetch(
        `${BACKEND_URL}/translations/${media.id}?language=${targetLanguage}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        const translatedData = await response.json();
        
        // Fusionar con datos originales
        return {
          ...media,
          titulo: translatedData.titulo || media.titulo,
          sinopsis: translatedData.sinopsis || media.sinopsis,
          descripcion: translatedData.descripcion || media.descripcion || media.sinopsis,
          director: translatedData.director || media.director,
          elenco: translatedData.elenco || media.elenco,
          genero: translatedData.genero || media.genero,
          titulo_original: media.titulo,
          translationSource: translatedData.translationSource || 'backend'
        };
      } else if (response.status === 404) {
        // No hay traducción en caché, intentar crear una si hay TMDb ID
        if (media.tmdb_id) {
          try {
            const cacheResponse = await fetch(
              `${BACKEND_URL}/translations/${media.id}/cache?language=${targetLanguage}`,
              {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
              }
            );

            if (cacheResponse.ok) {
              const cachedData = await cacheResponse.json();
              return {
                ...media,
                titulo: cachedData.data.translated_title || media.titulo,
                sinopsis: cachedData.data.translated_synopsis || media.sinopsis,
                descripcion: cachedData.data.translated_description || media.descripcion || media.sinopsis,
                director: cachedData.data.director || media.director,
                elenco: cachedData.data.cast_members || media.elenco,
                genero: cachedData.data.genres || media.genero,
                titulo_original: media.titulo,
                translationSource: 'tmdb'
              };
            }
          } catch (cacheError) {
            console.warn('Failed to cache translation:', cacheError);
          }
        }

        // Fallback al contenido original
        return {
          ...media,
          titulo_original: media.titulo,
          translationSource: 'original'
        };
      } else {
        throw new Error(`Translation service error: ${response.status}`);
      }
    } catch (error) {
      console.error('Error fetching translation:', error);
      
      // Fallback al contenido original
      return {
        ...media,
        titulo_original: media.titulo,
        translationSource: 'original'
      };
    }
  }

  // Método para precargar traducciones para una lista de medios
  async preloadTranslations(mediaList, targetLanguage) {
    if (!Array.isArray(mediaList) || targetLanguage === 'es') {
      return;
    }

    const promises = mediaList
      .filter(media => media && media.id)
      .map(media => this.getTranslatedContent(media, targetLanguage).catch(err => {
        console.warn(`Failed to preload translation for ${media.id}:`, err);
        return media;
      }));

    await Promise.allSettled(promises);
  }

  // Método para obtener estadísticas del caché
  async getCacheStats() {
    try {
      const response = await fetch(`${BACKEND_URL}/translations/cache/stats`);
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.error('Error getting cache stats:', error);
    }
    return null;
  }

  // Método para limpiar el caché
  async clearCache(language = null, olderThanDays = null) {
    try {
      const params = new URLSearchParams();
      if (language) params.append('language', language);
      if (olderThanDays) params.append('older_than_days', olderThanDays.toString());

      const response = await fetch(
        `${BACKEND_URL}/translations/cache/clear?${params.toString()}`,
        { method: 'DELETE' }
      );

      if (response.ok) {
        // Limpiar también el caché en memoria
        this.memoryCache.clear();
        return await response.json();
      }
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
    return null;
  }

  // Método para invalidar cache cuando se actualiza el idioma
  clearMemoryCache() {
    this.memoryCache.clear();
    this.pendingRequests.clear();
  }
}

// Export singleton instance
export const contentTranslationService = new ContentTranslationService();
