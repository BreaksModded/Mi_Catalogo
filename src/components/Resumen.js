import React, { useEffect, useState, useMemo, useCallback } from 'react';
import './Resumen.css';
import GeneroChart, { YearChart } from './GeneroChart';
import { useLanguage } from '../context/LanguageContext';
import { useTranslatedContent } from '../hooks/useTranslatedContent';
import { contentTranslationService } from '../utils/contentTranslation';

// Professional icons for different sections
const SECTION_ICONS = {
  totals: '📊',
  stats: '📈',
  top5: '🏆',
  worst: '⚠️',
  people: '🌟',
  genres: '🎭',
  yearly: '📅'
};

// Componente auxiliar para mostrar títulos traducidos
// Professional translated title component
const TranslatedTitle = ({ media, getTranslatedTitle }) => {
  const [translatedTitle, setTranslatedTitle] = useState(media?.titulo || '');
  
  useEffect(() => {
    const translateTitle = async () => {
      if (media && getTranslatedTitle) {
        const title = await getTranslatedTitle(media);
        setTranslatedTitle(title);
      }
    };
    
    translateTitle();
  }, [media, getTranslatedTitle]);
  
  return <span className="translated-title">{translatedTitle}</span>;
};

// Professional metric card component
const MetricCard = ({ value, label, icon, trend, color = 'primary' }) => (
  <div className={`metric-card metric-card--${color}`}>
    <div className="metric-card__icon">{icon}</div>
    <div className="metric-card__content">
      <div className="metric-card__value">{value}</div>
      <div className="metric-card__label">{label}</div>
      {trend && <div className="metric-card__trend">{trend}</div>}
    </div>
  </div>
);

// Enhanced loading component
const LoadingState = ({ message }) => (
  <div className="resumen-loading">
    <div className="loading-spinner"></div>
    <p className="loading-message">{message}</p>
    <div className="loading-dots">
      <span></span>
      <span></span>
      <span></span>
    </div>
  </div>
);

// Professional error component
const ErrorState = ({ error, onRetry, t }) => (
  <div className="resumen-error">
    <div className="error-icon">⚠️</div>
    <h3 className="error-title">{t('messages.error', 'Error')}</h3>
    <p className="error-message">{error}</p>
    <button onClick={onRetry} className="retry-button">
      <span className="retry-icon">🔄</span>
      {t('summary.retry', 'Reintentar')}
    </button>
  </div>
);

function Resumen({ medias }) {
  const { t, currentLanguage } = useLanguage();
  
  // JWT authentication function
  const authenticatedFetch = useCallback((url, options = {}) => {
    const jwtToken = localStorage.getItem('jwt_token');
    return fetch(url, {
      ...options,
      headers: {
        ...(options.headers || {}),
        ...(jwtToken ? { 'Authorization': `Bearer ${jwtToken}` } : {})
      }
    });
  }, []);
  
  // Professional title translation function
  const getTranslatedTitle = useCallback(async (media) => {
    if (!media || currentLanguage === 'es') {
      return media?.titulo || '';
    }
    
    try {
      const translatedContent = await contentTranslationService.getTranslatedContent(media, currentLanguage);
      return translatedContent.titulo || media.titulo;
    } catch (error) {
      console.error('Error translating title:', error);
      return media.titulo;
    }
  }, [currentLanguage]);

  // Genre translation function
  const translateGenre = useCallback((genre) => {
    if (!genre) return '';
    const lowerGenre = genre.toLowerCase();
    return t(`genres.${lowerGenre}`, genre);
  }, [t]);

  // Enhanced state management
  const [state, setState] = useState({
    peliculasVistas: null,
    seriesVistas: null,
    loading: true,
    error: null,
    peorPelicula: null,
    peorSerie: null,
    loadingPeor: true,
    errorPeor: null,
    topPeliculasBD: [],
    topSeriesBD: [],
    generoStatsBD: { masVisto: null, masVistoCount: null, mejorValorado: null, mejorValoradoMedia: null },
    generosVistos: {},
    topPersonas: { top_actores: [], top_directores: [] },
    favoritosGlobales: [],
    vistosPorAnio: {}
  });

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "https://mi-catalogo-backend.onrender.com";

  // Professional data fetching with error handling
  const fetchWithErrorHandling = useCallback(async (url, errorMessage = 'Error fetching data') => {
    try {
      const response = await authenticatedFetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`${errorMessage}:`, error);
      throw error;
    }
  }, [authenticatedFetch]);

  // Enhanced fetch counts function
  const fetchCounts = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const [peliculasData, seriesData] = await Promise.all([
        fetchWithErrorHandling(`${BACKEND_URL}/medias/count?pendiente=false&tipo=pelicula`, 'Error fetching movies count'),
        fetchWithErrorHandling(`${BACKEND_URL}/medias/count?pendiente=false&tipo=serie`, 'Error fetching series count')
      ]);

      setState(prev => ({
        ...prev,
        peliculasVistas: peliculasData.count,
        seriesVistas: seriesData.count,
        loading: false
      }));
    } catch (err) {
      setState(prev => ({
        ...prev,
        error: `${t('messages.errorLoadingMovies', 'Error loading data')}: ${err.message}`,
        loading: false
      }));
    }
  }, [BACKEND_URL, fetchWithErrorHandling, t]);

  // Enhanced data loading effects
  useEffect(() => {
    if (!BACKEND_URL) {
      setState(prev => ({
        ...prev,
        error: t('messages.connectionError', 'Backend URL not configured'),
        loading: false
      }));
      return;
    }

    fetchCounts();
    
    // Fetch worst rated content
    const fetchWorstRated = async () => {
      setState(prev => ({ ...prev, loadingPeor: true, errorPeor: null }));
      
      try {
        const [peorPeliData, peorSerieData] = await Promise.all([
          fetchWithErrorHandling(`${BACKEND_URL}/medias/peor_pelicula`, 'Error fetching worst movie'),
          fetchWithErrorHandling(`${BACKEND_URL}/medias/peor_serie`, 'Error fetching worst series')
        ]);

        setState(prev => ({
          ...prev,
          peorPelicula: peorPeliData,
          peorSerie: peorSerieData,
          loadingPeor: false
        }));
      } catch (err) {
        setState(prev => ({
          ...prev,
          errorPeor: t('messages.errorLoadingRelated', 'Could not load worst rated content'),
          loadingPeor: false
        }));
      }
    };

    fetchWorstRated();
  }, [BACKEND_URL, fetchCounts, fetchWithErrorHandling, t]);

  // Fetch top 5 content
  useEffect(() => {
    if (!BACKEND_URL) return;

    const fetchTopContent = async () => {
      try {
        const [topPeliculas, topSeries] = await Promise.all([
          fetchWithErrorHandling(`${BACKEND_URL}/medias/top5?tipo=pelicula`, 'Error fetching top movies'),
          fetchWithErrorHandling(`${BACKEND_URL}/medias/top5?tipo=serie`, 'Error fetching top series')
        ]);

        setState(prev => ({
          ...prev,
          topPeliculasBD: topPeliculas,
          topSeriesBD: topSeries
        }));
      } catch (err) {
        console.error('Error fetching top content:', err);
      }
    };

    fetchTopContent();
  }, [BACKEND_URL, fetchWithErrorHandling]);

  // Fetch additional statistics
  useEffect(() => {
    if (!BACKEND_URL) return;

    const fetchAdditionalStats = async () => {
      try {
        const [
          generosVistosData,
          topPersonasData,
          favoritosData,
          vistosPorAnioData,
          generoStatsData
        ] = await Promise.all([
          fetchWithErrorHandling(`${BACKEND_URL}/medias/distribucion_generos`, 'Error fetching genre distribution'),
          fetchWithErrorHandling(`${BACKEND_URL}/medias/top_personas`, 'Error fetching top people'),
          fetchWithErrorHandling(`${BACKEND_URL}/medias?favorito=true&limit=5&order_by=nota_personal_desc`, 'Error fetching favorites'),
          fetchWithErrorHandling(`${BACKEND_URL}/medias/vistos_por_anio`, 'Error fetching yearly stats'),
          fetchWithErrorHandling(`${BACKEND_URL}/medias/generos_vistos`, 'Error fetching genre stats')
        ]);

        setState(prev => ({
          ...prev,
          generosVistos: generosVistosData || {},
          topPersonas: topPersonasData || { top_actores: [], top_directores: [] },
          favoritosGlobales: favoritosData || [],
          vistosPorAnio: vistosPorAnioData || {},
          generoStatsBD: {
            masVisto: generoStatsData.mas_visto,
            masVistoCount: generoStatsData.mas_visto_count,
            mejorValorado: generoStatsData.mejor_valorado,
            mejorValoradoMedia: generoStatsData.mejor_valorado_media
          }
        }));
      } catch (err) {
        console.error('Error fetching additional stats:', err);
      }
    };

    fetchAdditionalStats();
  }, [BACKEND_URL, fetchWithErrorHandling]);

  // Memoized calculations
  const vistos = useMemo(() => {
    if (!medias) return [];
    return medias.filter(m => !m.pendiente);
  }, [medias]);

  const mediaNotaPersonal = useMemo(() => {
    const notas = vistos.map(m => m.nota_personal).filter(n => typeof n === 'number');
    if (!notas.length) return null;
    return (notas.reduce((x, y) => x + y, 0) / notas.length).toFixed(1);
  }, [vistos]);

  // Safe data accessors
  const safeData = useMemo(() => ({
    generosVistos: state.generosVistos && typeof state.generosVistos === 'object' && !Array.isArray(state.generosVistos) ? state.generosVistos : {},
    topActores: state.topPersonas && Array.isArray(state.topPersonas.top_actores) ? state.topPersonas.top_actores : [],
    topDirectores: state.topPersonas && Array.isArray(state.topPersonas.top_directores) ? state.topPersonas.top_directores : [],
    favoritosGlobales: Array.isArray(state.favoritosGlobales) ? state.favoritosGlobales : [],
    vistosPorAnio: state.vistosPorAnio && typeof state.vistosPorAnio === 'object' && !Array.isArray(state.vistosPorAnio) ? state.vistosPorAnio : {}
  }), [state]);

  // Loading state
  if (state.loading) {
    return (
      <div className="resumen-container">
        <LoadingState message={t('actions.loading', 'Loading your cinema summary...')} />
      </div>
    );
  }

  // Error state
  if (state.error) {
    return (
      <div className="resumen-container">
        <ErrorState error={state.error} onRetry={fetchCounts} t={t} />
      </div>
    );
  }

  return (
    <div className="resumen-container">
      {/* Professional Header */}
      <header className="resumen-header">
        <h1>{t('summary.title', 'Cinema Analytics Dashboard')}</h1>
      </header>

      {/* Enhanced Totals Section */}
      <section className="resumen-section totals-section">
        <h2>
          {SECTION_ICONS.totals} {t('summary.totals', 'Overview Metrics')}
        </h2>
        <div className="totals-grid">
          <MetricCard
            value={state.peliculasVistas !== null ? state.peliculasVistas.toLocaleString() : '-'}
            label={t('summary.moviesWatched', 'Movies Watched')}
            icon="🎬"
            color="primary"
          />
          <MetricCard
            value={state.seriesVistas !== null ? state.seriesVistas.toLocaleString() : '-'}
            label={t('summary.seriesWatched', 'Series Watched')}
            icon="📺"
            color="secondary"
          />
          <MetricCard
            value={mediaNotaPersonal ? (
              <>
                <span className="metric-number">{mediaNotaPersonal}</span>
                <span className="metric-star">⭐</span>
              </>
            ) : '-'}
            label={t('summary.averageRating', 'Average Rating')}
            icon="🌟"
            color="accent"
          />
        </div>
      </section>

      {/* Enhanced Statistics Section */}
      <section className="resumen-section stats-section">
        <h2>
          {SECTION_ICONS.stats} {t('summary.outstandingStats', 'Key Insights')}
        </h2>
        <div className="stats-grid">
          <div className="stat-item">
            <div className="stat-icon">🎭</div>
            <div className="stat-content">
              <span className="stat-value">
                {state.generoStatsBD.masVisto ? translateGenre(state.generoStatsBD.masVisto) : 'N/A'}
              </span>
              <span className="stat-secondary">
                {state.generoStatsBD.masVistoCount 
                  ? `${state.generoStatsBD.masVistoCount} ${t('general.title', 'title')}${state.generoStatsBD.masVistoCount === 1 ? '' : 's'}`
                  : ''
                }
              </span>
              <span className="stat-label">{t('summary.mostWatchedGenre', 'Most Watched Genre')}</span>
            </div>
          </div>
          <div className="stat-item">
            <div className="stat-icon">⭐</div>
            <div className="stat-content">
              <span className="stat-value">
                {state.generoStatsBD.mejorValorado ? translateGenre(state.generoStatsBD.mejorValorado) : 'N/A'}
              </span>
              <span className="stat-secondary">
                {state.generoStatsBD.mejorValoradoMedia && `${state.generoStatsBD.mejorValoradoMedia}⭐`}
              </span>
              <span className="stat-label">{t('summary.bestRatedGenre', 'Best Rated Genre')}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Top 5 Section */}
      <section className="resumen-section top-lists-section">
        <h2>
          {SECTION_ICONS.top5} {t('summary.top5', 'Excellence Rankings')}
        </h2>
        <div className="top-lists-grid">
          <div className="top-list">
            <h3>🎬 {t('summary.movies', 'Movies')}</h3>
            {state.topPeliculasBD.length > 0 ? (
              <ol>
                {state.topPeliculasBD.map((m, index) => (
                  <li key={m.id} className={`top-item top-item--rank-${index + 1}`}>
                    <div className="top-item__content">
                      <TranslatedTitle media={m} getTranslatedTitle={getTranslatedTitle} />
                    </div>
                    <div className="top-item__rating">
                      <span className="nota">{m.nota_personal ?? '-'}</span>
                    </div>
                  </li>
                ))}
              </ol>
            ) : (
              <div className="no-data-message">
                <div className="no-data-icon">📽️</div>
                <p>{t('summary.noRatedMovies', 'No rated movies available')}</p>
              </div>
            )}
          </div>
          <div className="top-list">
            <h3>📺 {t('summary.series', 'Series')}</h3>
            {state.topSeriesBD.length > 0 ? (
              <ol>
                {state.topSeriesBD.map((m, index) => (
                  <li key={m.id} className={`top-item top-item--rank-${index + 1}`}>
                    <div className="top-item__content">
                      <TranslatedTitle media={m} getTranslatedTitle={getTranslatedTitle} />
                    </div>
                    <div className="top-item__rating">
                      <span className="nota">{m.nota_personal ?? '-'}</span>
                    </div>
                  </li>
                ))}
              </ol>
            ) : (
              <div className="no-data-message">
                <div className="no-data-icon">📺</div>
                <p>{t('summary.noRatedSeries', 'No rated series available')}</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Professional Worst Rated Section */}
      <section className="resumen-section worst-rated-section">
        <h2>
          {SECTION_ICONS.worst} {t('summary.worstRated', 'Areas for Improvement')}
        </h2>
        {state.loadingPeor ? (
          <div className="section-loading">
            <div className="loading-spinner"></div>
            <p>{t('actions.loadingWorstRated', 'Loading worst rated content...')}</p>
          </div>
        ) : state.errorPeor ? (
          <div className="section-error">
            <p>{state.errorPeor}</p>
          </div>
        ) : (
          <div className="peor-valoradas-grid">
            <div className="peor-card">
              <div className="peor-icon">🎬</div>
              <div className="peor-content">
                <h4 className="peor-category">{t('summary.movies', 'Movies')}</h4>
                <div className="peor-titulo">
                  {state.peorPelicula ? (
                    <TranslatedTitle media={state.peorPelicula} getTranslatedTitle={getTranslatedTitle} />
                  ) : (
                    <span className="no-data-message">{t('summary.noRatedMovies', 'No rated movies')}</span>
                  )}
                </div>
                <div className="peor-nota-badge">
                  {state.peorPelicula?.nota_personal ?? '-'}
                </div>
              </div>
            </div>
            <div className="peor-card">
              <div className="peor-icon">📺</div>
              <div className="peor-content">
                <h4 className="peor-category">{t('summary.series', 'Series')}</h4>
                <div className="peor-titulo">
                  {state.peorSerie ? (
                    <TranslatedTitle media={state.peorSerie} getTranslatedTitle={getTranslatedTitle} />
                  ) : (
                    <span className="no-data-message">{t('summary.noRatedSeries', 'No rated series')}</span>
                  )}
                </div>
                <div className="peor-nota-badge">
                  {state.peorSerie?.nota_personal ?? '-'}
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Enhanced People Section */}
      <section className="resumen-section personas-section">
        <h2>
          {SECTION_ICONS.people} {t('summary.topActorsDirectors', 'Industry Collaborators')}
        </h2>
        <div className="personas-grid">
          <div className="personas-list">
            <h3>🎭 {t('summary.actors', 'Top Actors')}</h3>
            {safeData.topActores.length > 0 ? (
              <ol>
                {safeData.topActores.map(([nombre, count], index) => (
                  <li key={nombre} className={`persona-item persona-item--rank-${index + 1}`}>
                    <div className="personas-badge">{count}</div>
                    <div className="personas-content">
                      <span className="personas-nombre">{nombre}</span>
                      <span className="personas-subtitle">
                        {count} {count === 1 ? t('summary.collaboration', 'collaboration') : t('summary.collaborations', 'collaborations')}
                      </span>
                    </div>
                  </li>
                ))}
              </ol>
            ) : (
              <div className="no-data-message">
                <div className="no-data-icon">🎭</div>
                <p>{t('summary.noData', 'No actor data available')}</p>
              </div>
            )}
          </div>
          <div className="personas-list">
            <h3>🎬 {t('summary.directors', 'Top Directors')}</h3>
            {safeData.topDirectores.length > 0 ? (
              <ol>
                {safeData.topDirectores.map(([nombre, count], index) => (
                  <li key={nombre} className={`persona-item persona-item--rank-${index + 1}`}>
                    <div className="personas-badge">{count}</div>
                    <div className="personas-content">
                      <span className="personas-nombre">{nombre}</span>
                      <span className="personas-subtitle">
                        {count} {count === 1 ? t('summary.work', 'work') : t('summary.works', 'works')}
                      </span>
                    </div>
                  </li>
                ))}
              </ol>
            ) : (
              <div className="no-data-message">
                <div className="no-data-icon">🎬</div>
                <p>{t('summary.noData', 'No director data available')}</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Enhanced Genre Distribution Section */}
      <section className="resumen-section genero-chart-section">
        <h2>
          {SECTION_ICONS.genres} {t('summary.genreDistribution', 'Genre Analytics')}
        </h2>
        <div className="chart-container">
          <GeneroChart data={safeData.generosVistos} />
        </div>
      </section>

      {/* Enhanced Yearly Analysis Section */}
      <section className="resumen-section yearly-chart-section">
        <h2>
          {SECTION_ICONS.yearly} {t('summary.yearlyChart', 'Temporal Distribution')}
        </h2>
        <div className="chart-container">
          <YearChart data={safeData.vistosPorAnio} />
        </div>
      </section>
    </div>
  );
}

export default Resumen;