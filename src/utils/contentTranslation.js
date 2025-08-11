// Sistema híbrido de traducción de contenido dinámico con caché en backend
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "https://mi-catalogo-backend.onrender.com";

export class ContentTranslationService {
  constructor() {
    this.memoryCache = new Map();
    this.pendingRequests = new Map();
    // Circuit breaker para prevenir flood de requests cuando el backend está fallando
    this.circuitBreaker = {
      failures: 0,
      lastFailureTime: null,
      state: 'CLOSED', // CLOSED, OPEN, HALF_OPEN
      threshold: 5, // Número de fallos antes de abrir el circuito
      timeout: 30000, // 30 segundos antes de intentar de nuevo
      resetTimeout: 300000 // 5 minutos para reset completo
    };
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

  // Método para verificar el estado del circuit breaker
  isCircuitOpen() {
    if (this.circuitBreaker.state === 'CLOSED') {
      return false;
    }

    if (this.circuitBreaker.state === 'OPEN') {
      const now = Date.now();
      const timeSinceLastFailure = now - this.circuitBreaker.lastFailureTime;
      
      if (timeSinceLastFailure >= this.circuitBreaker.timeout) {
        this.circuitBreaker.state = 'HALF_OPEN';
        return false;
      }
      return true;
    }

    return false; // HALF_OPEN permite intentos
  }

  // Método para registrar un fallo en el circuit breaker
  recordFailure() {
    this.circuitBreaker.failures++;
    this.circuitBreaker.lastFailureTime = Date.now();

    if (this.circuitBreaker.failures >= this.circuitBreaker.threshold) {
      this.circuitBreaker.state = 'OPEN';
      console.warn('Circuit breaker OPEN - Translation service temporarily disabled due to repeated failures');
      
      // Reset automático después del timeout completo
      setTimeout(() => {
        this.circuitBreaker.failures = 0;
        this.circuitBreaker.state = 'CLOSED';
        console.info('Circuit breaker RESET - Translation service re-enabled');
      }, this.circuitBreaker.resetTimeout);
    }
  }

  // Método para registrar un éxito en el circuit breaker
  recordSuccess() {
    if (this.circuitBreaker.state === 'HALF_OPEN') {
      this.circuitBreaker.state = 'CLOSED';
      this.circuitBreaker.failures = 0;
    } else if (this.circuitBreaker.failures > 0) {
      this.circuitBreaker.failures = Math.max(0, this.circuitBreaker.failures - 1);
    }
  }

  async fetchTranslation(media, targetLanguage) {
    // Verificar circuit breaker antes de hacer la petición
    if (this.isCircuitOpen()) {
      console.warn(`Circuit breaker is OPEN - Skipping translation request for media ${media.id}`);
      return {
        ...media,
        titulo_original: media.titulo,
        translationSource: 'original'
      };
    }

    try {
      // Intentar obtener del caché del backend
      const response = await fetch(
        `${BACKEND_URL}/translations/${media.id}?language=${targetLanguage}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          // Timeout más agresivo para evitar requests colgados
          signal: AbortSignal.timeout(10000)
        }
      );

      if (response.ok) {
        const translatedData = await response.json();
        
        // Registrar éxito en circuit breaker
        this.recordSuccess();
        
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
        // 404 no es un error de sistema, no afecta circuit breaker
        // No hay traducción en caché, intentar crear una si hay TMDb ID
        if (media.tmdb_id && !this.isCircuitOpen()) {
          try {
            const cacheResponse = await fetch(
              `${BACKEND_URL}/translations/${media.id}/cache?language=${targetLanguage}`,
              {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                signal: AbortSignal.timeout(15000)
              }
            );

            if (cacheResponse.ok) {
              const cachedData = await cacheResponse.json();
              this.recordSuccess();
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
            } else if (cacheResponse.status >= 500) {
              this.recordFailure();
            }
          } catch (cacheError) {
            console.warn('Failed to cache translation:', cacheError);
            if (cacheError.name !== 'AbortError') {
              this.recordFailure();
            }
          }
        }

        // Fallback al contenido original
        return {
          ...media,
          titulo_original: media.titulo,
          translationSource: 'original'
        };
      } else if (response.status >= 500) {
        // Solo errores 5xx afectan el circuit breaker
        this.recordFailure();
        throw new Error(`Translation service error: ${response.status}`);
      } else {
        // Errores 4xx (excepto 404) no abren circuit breaker
        throw new Error(`Translation service error: ${response.status}`);
      }
    } catch (error) {
      // Solo registrar fallo si no es timeout o abort
      if (error.name === 'AbortError') {
        console.warn(`Translation request timeout for media ${media.id}`);
      } else if (error.message.includes('500')) {
        // Ya se registró el fallo arriba
      } else {
        // Errores de red general
        this.recordFailure();
      }
      
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

    // Si el circuit breaker está abierto, no hacer preloads
    if (this.isCircuitOpen()) {
      console.warn('Circuit breaker is OPEN - Skipping translation preload');
      return;
    }

    // Limitar la concurrencia para evitar sobrecargar el backend
    const BATCH_SIZE = 5;
    const batches = [];
    
    for (let i = 0; i < mediaList.length; i += BATCH_SIZE) {
      batches.push(mediaList.slice(i, i + BATCH_SIZE));
    }

    for (const batch of batches) {
      // Si el circuit breaker se abre durante el proceso, parar
      if (this.isCircuitOpen()) {
        console.warn('Circuit breaker opened during preload - Stopping remaining batches');
        break;
      }

      const promises = batch
        .filter(media => media && media.id)
        .map(media => this.getTranslatedContent(media, targetLanguage).catch(err => {
          console.warn(`Failed to preload translation for ${media.id}:`, err);
          return media;
        }));

      await Promise.allSettled(promises);
      
      // Pequeña pausa entre batches para evitar saturar el servidor
      await new Promise(resolve => setTimeout(resolve, 100));
    }
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

  // Método para obtener el estado del circuit breaker
  getCircuitBreakerStatus() {
    return {
      state: this.circuitBreaker.state,
      failures: this.circuitBreaker.failures,
      lastFailureTime: this.circuitBreaker.lastFailureTime,
      threshold: this.circuitBreaker.threshold,
      isOpen: this.isCircuitOpen()
    };
  }

  // Método para forzar el reset del circuit breaker (para debugging)
  resetCircuitBreaker() {
    this.circuitBreaker.failures = 0;
    this.circuitBreaker.lastFailureTime = null;
    this.circuitBreaker.state = 'CLOSED';
    console.info('Circuit breaker manually reset');
  }
}

// Export singleton instance
export const contentTranslationService = new ContentTranslationService();
