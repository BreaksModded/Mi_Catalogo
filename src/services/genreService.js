// Mapeo de géneros locales a IDs de TMDB
const GENRE_TO_TMDB_ID = {
  action: 28,
  adventure: 12,
  animation: 16,
  comedy: 35,
  crime: 80,
  documentary: 99,
  drama: 18,
  family: 10751,
  fantasy: 14,
  history: 36,
  horror: 27,
  music: 10402,
  musical: 10402, // Mismo que music
  mystery: 9648,
  romance: 10749,
  sciFi: 878,
  thriller: 53,
  war: 10752,
  western: 37,
  biography: 18, // Clasificado como drama
  noir: 80, // Clasificado como crime
  sport: 99, // Clasificado como documentary
  // Géneros adicionales para mayor cobertura
  suspense: 53, // Mismo que thriller
  terror: 27, // Mismo que horror
  ficcion: 878, // Mismo que sciFi
  aventura: 12, // Mismo que adventure
  comedia: 35, // Mismo que comedy
  drama_romantico: 10749, // Mismo que romance
  ciencia_ficcion: 878 // Mismo que sciFi
};

class GenreService {
  constructor() {
    this.cache = new Map();
    this.cacheTime = 24 * 60 * 60 * 1000; // 24 horas
    this.tmdbApiKey = process.env.REACT_APP_TMDB_API_KEY || 'tu_api_key_aqui';
    this.baseUrl = 'https://api.themoviedb.org/3';
  }

  /**
   * Limpia la cache para forzar recálculo con nuevos criterios
   */
  clearCache() {
    this.cache.clear();
  }

  /**
   * Obtiene estadísticas de TMDB para un género específico
   */
  async getTMDBStats(genreKey) {
    const tmdbId = GENRE_TO_TMDB_ID[genreKey];
    if (!tmdbId) {
      console.warn(`No TMDB ID found for genre: ${genreKey}`);
      return null;
    }

    try {
      // Obtener películas populares del género
      const moviesResponse = await fetch(
        `${this.baseUrl}/discover/movie?api_key=${this.tmdbApiKey}&with_genres=${tmdbId}&sort_by=popularity.desc&vote_count.gte=100&page=1`
      );

      // Obtener series populares del género
      const tvResponse = await fetch(
        `${this.baseUrl}/discover/tv?api_key=${this.tmdbApiKey}&with_genres=${tmdbId}&sort_by=popularity.desc&vote_count.gte=50&page=1`
      );

      if (!moviesResponse.ok || !tvResponse.ok) {
        throw new Error('Error fetching data from TMDB');
      }

      const movies = await moviesResponse.json();
      const tv = await tvResponse.json();

      return this.calculateGenreStats(movies, tv);
    } catch (error) {
      console.error(`Error fetching TMDB stats for ${genreKey}:`, error);
      return null;
    }
  }

  /**
   * Calcula estadísticas basadas en los datos de TMDB
   */
  calculateGenreStats(movies, tv) {
    const allContent = [...(movies.results || []), ...(tv.results || [])];
    
    if (allContent.length === 0) {
      return {
        totalContent: 0,
        avgPopularity: 0,
        recentReleases: 0,
        avgRating: 0,
        popularityScore: 0,
        trendingScore: 0
      };
    }

    // Calcular estadísticas
    const totalContent = movies.total_results + tv.total_results;
    const avgPopularity = allContent.reduce((sum, item) => sum + (item.popularity || 0), 0) / allContent.length;
    const avgRating = allContent.reduce((sum, item) => sum + (item.vote_average || 0), 0) / allContent.length;
    
    // Contar lanzamientos recientes (último año)
    const currentYear = new Date().getFullYear();
    const recentReleases = allContent.filter(item => {
      const releaseDate = item.release_date || item.first_air_date;
      if (!releaseDate) return false;
      const releaseYear = new Date(releaseDate).getFullYear();
      return releaseYear >= currentYear - 1;
    }).length;

    // Calcular scores para popular y trending
    const popularityScore = this.calculatePopularityScore(totalContent, avgRating, avgPopularity);
    const trendingScore = this.calculateTrendingScore(recentReleases, avgPopularity);

    return {
      totalContent,
      avgPopularity: Math.round(avgPopularity * 100) / 100,
      recentReleases,
      avgRating: Math.round(avgRating * 100) / 100,
      popularityScore,
      trendingScore
    };
  }

  /**
   * Calcula el score de popularidad basado en contenido total, rating y popularidad
   */
  calculatePopularityScore(totalContent, avgRating, avgPopularity) {
    let score = 0;
    
    // Peso por cantidad de contenido (30%) - Criterios más estrictos
    if (totalContent > 2000) score += 0.3;
    else if (totalContent > 1500) score += 0.25;
    else if (totalContent > 1000) score += 0.2;
    else if (totalContent > 700) score += 0.15;
    else if (totalContent > 500) score += 0.1;
    else if (totalContent > 300) score += 0.05;
    
    // Peso por rating promedio (40%) - Criterios más estrictos
    if (avgRating >= 8.0) score += 0.4;
    else if (avgRating >= 7.7) score += 0.3;
    else if (avgRating >= 7.3) score += 0.25;
    else if (avgRating >= 7.0) score += 0.2;
    else if (avgRating >= 6.8) score += 0.15;
    else if (avgRating >= 6.5) score += 0.1;
    
    // Peso por popularidad promedio (30%) - Criterios más estrictos
    if (avgPopularity >= 70) score += 0.3;
    else if (avgPopularity >= 55) score += 0.25;
    else if (avgPopularity >= 45) score += 0.2;
    else if (avgPopularity >= 35) score += 0.15;
    else if (avgPopularity >= 25) score += 0.1;
    else if (avgPopularity >= 18) score += 0.05;
    
    return Math.round(score * 100) / 100;
  }

  /**
   * Calcula el score de trending basado en lanzamientos recientes y popularidad
   */
  calculateTrendingScore(recentReleases, avgPopularity) {
    let score = 0;
    
    // Peso por lanzamientos recientes (60%) - Criterios más estrictos
    if (recentReleases >= 30) score += 0.6;
    else if (recentReleases >= 25) score += 0.5;
    else if (recentReleases >= 20) score += 0.4;
    else if (recentReleases >= 15) score += 0.3;
    else if (recentReleases >= 12) score += 0.25;
    else if (recentReleases >= 8) score += 0.15;
    else if (recentReleases >= 5) score += 0.1;
    
    // Peso por popularidad actual (40%) - Criterios más estrictos
    if (avgPopularity >= 60) score += 0.4;
    else if (avgPopularity >= 50) score += 0.35;
    else if (avgPopularity >= 42) score += 0.3;
    else if (avgPopularity >= 35) score += 0.25;
    else if (avgPopularity >= 28) score += 0.2;
    else if (avgPopularity >= 22) score += 0.15;
    else if (avgPopularity >= 15) score += 0.1;
    
    return Math.round(score * 100) / 100;
  }

  /**
   * Mejora un género con datos de TMDB
   */
  async enhanceGenre(genre) {
    const cacheKey = `genre_${genre.key}`;
    const cached = this.cache.get(cacheKey);
    
    // Verificar cache
    if (cached && Date.now() - cached.timestamp < this.cacheTime) {
      return cached.data;
    }

    try {
      const tmdbStats = await this.getTMDBStats(genre.key);
      
      let enhanced = { ...genre };
      
      if (tmdbStats) {
        // Umbrales más estrictos para determinar popular y trending
        const POPULAR_THRESHOLD = 0.75;  // Solo el top 25% más popular
        const TRENDING_THRESHOLD = 0.70; // Solo el top 30% más trending
        
        enhanced = {
          ...genre,
          popular: tmdbStats.popularityScore >= POPULAR_THRESHOLD,
          trending: tmdbStats.trendingScore >= TRENDING_THRESHOLD,
          tmdbStats,
          lastUpdated: new Date().toISOString(),
          source: 'tmdb'
        };
      } else {
        // Fallback a valores originales si falla TMDB
        enhanced = {
          ...genre,
          source: 'static',
          lastUpdated: new Date().toISOString()
        };
      }

      // Guardar en cache
      this.cache.set(cacheKey, {
        data: enhanced,
        timestamp: Date.now()
      });

      return enhanced;
    } catch (error) {
      console.error(`Error enhancing genre ${genre.key}:`, error);
      return {
        ...genre,
        source: 'static',
        error: error.message,
        lastUpdated: new Date().toISOString()
      };
    }
  }

  /**
   * Obtiene todos los géneros mejorados con datos de TMDB
   */
  async getEnhancedGenres(staticGenres) {
    const cacheKey = 'enhanced_genres_all';
    const cached = this.cache.get(cacheKey);
    
    // Verificar cache global
    if (cached && Date.now() - cached.timestamp < this.cacheTime) {
      return cached.data;
    }

    try {
      console.log('Fetching enhanced genres from TMDB...');
      
      // Procesar géneros en paralelo pero con límite para no sobrecargar la API
      const enhancedGenres = [];
      const batchSize = 5;
      
      for (let i = 0; i < staticGenres.length; i += batchSize) {
        const batch = staticGenres.slice(i, i + batchSize);
        const batchResults = await Promise.all(
          batch.map(genre => this.enhanceGenre(genre))
        );
        enhancedGenres.push(...batchResults);
        
        // Pequeña pausa entre batches para ser respetuoso con la API
        if (i + batchSize < staticGenres.length) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

      // Guardar en cache global
      this.cache.set(cacheKey, {
        data: enhancedGenres,
        timestamp: Date.now()
      });

      console.log('Enhanced genres loaded successfully:', enhancedGenres.length);
      return enhancedGenres;
    } catch (error) {
      console.error('Error getting enhanced genres:', error);
      return staticGenres; // Fallback a géneros estáticos
    }
  }

  

  /**
   * Obtiene información del cache
   */
  getCacheInfo() {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.keys()),
      cacheTime: this.cacheTime
    };
  }
}

export default GenreService;
