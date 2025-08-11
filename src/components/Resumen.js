import React, { useEffect, useState, useMemo, useCallback } from 'react';
import './Resumen.css';
import GeneroChart, { YearChart } from './GeneroChart';
import { useLanguage } from '../context/LanguageContext';
import { useTranslatedContent } from '../hooks/useTranslatedContent';
import { contentTranslationService } from '../utils/contentTranslation';

// Componente auxiliar para mostrar títulos traducidos (definido fuera del componente principal)
const TranslatedTitle = ({ media, useTranslatedTitle }) => {
  const translatedTitle = useTranslatedTitle(media);
  return translatedTitle;
};

function Resumen({ medias }) { // Eliminamos 'pendientes' si no se usa directamente aquí
  const { t, currentLanguage } = useLanguage();
  
  // Hook personalizado para traducir títulos
  const useTranslatedTitle = (media) => {
    const [translatedTitle, setTranslatedTitle] = useState(media?.titulo || '');
    
    useEffect(() => {
      const translateTitle = async () => {
        if (!media || currentLanguage === 'es') {
          setTranslatedTitle(media?.titulo || '');
          return;
        }
        
        try {
          const translatedContent = await contentTranslationService.getTranslatedContent(media, currentLanguage);
          setTranslatedTitle(translatedContent?.titulo || media?.titulo || '');
        } catch (error) {
          console.error('Error translating title:', error);
          setTranslatedTitle(media?.titulo || '');
        }
      };
      
      translateTitle();
    }, [media, currentLanguage]);
    
    return translatedTitle;
  };

  const [peliculasVistas, setPeliculasVistas] = useState(null);
  const [seriesVistas, setSeriesVistas] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estado para peor valoradas
  const [peorPelicula, setPeorPelicula] = useState(null);
  const [peorSerie, setPeorSerie] = useState(null);
  const [loadingPeor, setLoadingPeor] = useState(true);
  const [errorPeor, setErrorPeor] = useState(null);

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "https://mi-catalogo-backend.onrender.com";

  // Definir fetchCounts fuera de useEffect y con useCallback
  const fetchCounts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [resPelis, resSeries] = await Promise.all([
        fetch(`${BACKEND_URL}/medias/count?pendiente=false&tipo=pelicula`, { credentials: 'include' }),
        fetch(`${BACKEND_URL}/medias/count?pendiente=false&tipo=serie`, { credentials: 'include' }),
      ]);

      if (!resPelis.ok || !resSeries.ok) {
        throw new Error(t('messages.errorLoadingMovies', 'Error al conectar con el backend o respuesta no válida.'));
      }

      const dataPelis = await resPelis.json();
      const dataSeries = await resSeries.json();

      setPeliculasVistas(dataPelis.count);
      setSeriesVistas(dataSeries.count);
    } catch (err) {
      console.error('Error detallado al cargar los totales:', err);
      setError(`${t('messages.errorLoadingMovies', 'Error cargando los totales')}: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [BACKEND_URL]); // setPeliculasVistas, setSeriesVistas, setLoading, setError son estables

  useEffect(() => {
    if (BACKEND_URL) {
      fetchCounts();
      // Fetch peor valoradas
      const fetchPeores = async () => {
        setLoadingPeor(true);
        setErrorPeor(null);
        try {
          const [resPeorPeli, resPeorSerie] = await Promise.all([
            fetch(`${BACKEND_URL}/medias/peor_pelicula`),
            fetch(`${BACKEND_URL}/medias/peor_serie`)
          ]);
          let peli = null;
          let serie = null;
          if (resPeorPeli.ok) peli = await resPeorPeli.json();
          if (resPeorSerie.ok) serie = await resPeorSerie.json();
          setPeorPelicula(peli);
          setPeorSerie(serie);
        } catch (err) {
          setErrorPeor(t('messages.errorLoadingRelated', 'No se pudieron cargar las peor valoradas'));
        } finally {
          setLoadingPeor(false);
        }
      };
      fetchPeores();
    } else {
      setError(t('messages.connectionError', 'La URL del backend no está configurada.'));
      setLoading(false);
    }
  }, [BACKEND_URL, fetchCounts, setError, setLoading]); // Añadir fetchCounts y las setters usadas en el else

  // --- Memoized calculations (similar to your previous logic, but cleaned up) ---
  const vistos = useMemo(() => {
    if (!medias) return [];
    return medias.filter(m => !m.pendiente);
  }, [medias]);

  // Nota: Eliminamos el cálculo local de vistosPorAnioMemo, ahora usamos solo vistosPorAnio del backend

  // Estados para los top 5 globales
const [topPeliculasBD, setTopPeliculasBD] = useState([]);
const [topSeriesBD, setTopSeriesBD] = useState([]);

// Cargar top 5 globales desde el backend
useEffect(() => {
  const fetchTop = async (tipo, setter) => {
    try {
      const res = await fetch(`${BACKEND_URL}/medias/top5?tipo=${tipo}`);
      if (res.ok) {
        const data = await res.json();
        setter(data);
      }
    } catch (err) {
      // Opcional: podrías mostrar un error específico para el top
    }
  };
  if (BACKEND_URL) {
    fetchTop('pelicula', setTopPeliculasBD);
    fetchTop('serie', setTopSeriesBD);
  }
}, [BACKEND_URL]);


  // Estado para los géneros destacados globales
  const [generoStatsBD, setGeneroStatsBD] = useState({ masVisto: null, masVistoCount: null, mejorValorado: null, mejorValoradoMedia: null });
  const [generosVistos, setGenerosVistos] = useState({});
  const [topPersonas, setTopPersonas] = useState({ top_actores: [], top_directores: [] });
  const [favoritosGlobales, setFavoritosGlobales] = useState([]);

  // Comprobaciones defensivas para render seguro
  const safeGenerosVistos = generosVistos && typeof generosVistos === 'object' && !Array.isArray(generosVistos) ? generosVistos : {};
  const safeTopActores = topPersonas && Array.isArray(topPersonas.top_actores) ? topPersonas.top_actores : [];
  const safeTopDirectores = topPersonas && Array.isArray(topPersonas.top_directores) ? topPersonas.top_directores : [];
  const safeFavoritosGlobales = Array.isArray(favoritosGlobales) ? favoritosGlobales : [];

  // Estado para los títulos vistos por año (global)
  const [vistosPorAnio, setVistosPorAnio] = useState({});
  // Seguridad para gráficos por año
  const safeVistosPorAnio = vistosPorAnio && typeof vistosPorAnio === 'object' && !Array.isArray(vistosPorAnio) ? vistosPorAnio : {};

  useEffect(() => {
    const fetchVistosPorAnio = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/medias/vistos_por_anio`);
        if (res.ok) {
          const data = await res.json();
          if (data && typeof data === 'object' && !Array.isArray(data)) {
            setVistosPorAnio(data);
          } else {
            setVistosPorAnio({});
          }
        }
      } catch (err) {
        // Opcional: manejar error
      }
    };
    if (BACKEND_URL) {
      fetchVistosPorAnio();
    }
  }, [BACKEND_URL]);

  useEffect(() => {
    // --- Gráfico de géneros vistos ---
    const fetchGenerosVistos = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/medias/distribucion_generos`);
        if (res.ok) {
          const data = await res.json();
          
          setGenerosVistos(data);
        }
      } catch {}
    };
    // --- Top actores/directores ---
    const fetchTopPersonas = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/medias/top_personas`);
        if (res.ok) setTopPersonas(await res.json());
      } catch {}
    };
    fetchGenerosVistos();
    fetchTopPersonas();
    // --- Favoritos globales ---
    const fetchFavoritosGlobales = async () => {
      try {
        // Puedes ajustar el endpoint según tu backend
        const res = await fetch(`${BACKEND_URL}/medias?favorito=true&limit=5&order_by=nota_personal_desc`, {
          credentials: 'include'
        });
        if (res.ok) setFavoritosGlobales(await res.json());
      } catch {}
    };
    fetchFavoritosGlobales();
    // --- Género stats ---
    const fetchGeneroStats = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/medias/generos_vistos`);
        if (res.ok) {
          const data = await res.json();
          setGeneroStatsBD({
            masVisto: data.mas_visto,
            masVistoCount: data.mas_visto_count,
            mejorValorado: data.mejor_valorado,
            mejorValoradoMedia: data.mejor_valorado_media
          });
        }
      } catch (err) {
        // Opcional: manejar error
      }
    };
    if (BACKEND_URL) {
      fetchGeneroStats();
    }
  }, [BACKEND_URL]);

  const porAño = useMemo(() => {
    const stats = {};
    vistos.forEach(m => {
      let year;
      if (m.anio) year = String(m.anio);
      else if (m.año) year = String(m.año);
      else if (m.fecha) year = String(new Date(m.fecha).getFullYear());
      else if (m.fecha_creacion) year = String(new Date(m.fecha_creacion).getFullYear());

      if (!year || year === 'NaN' || year === 'undefined' || year.length !== 4) return; // Validar que sea un año
      stats[year] = (stats[year] || 0) + 1;
    });
    // Ordenar por año descendente (más reciente primero)
    return Object.entries(stats).sort((a, b) => b[0].localeCompare(a[0]));
  }, [vistos]);

  const mediaNotaPersonal = useMemo(() => {
    const notas = vistos.map(m => m.nota_personal).filter(n => typeof n === 'number');
    if (!notas.length) return null;
    return (notas.reduce((x, y) => x + y, 0) / notas.length).toFixed(2);
  }, [vistos]);

  // --- Renderizado --- 
  if (loading) {
    return (
      <div className="resumen-container resumen-loading">
        <div className="loading-spinner"></div>
        <p>{t('actions.loading', 'Cargando resumen de tu cinemateca...')}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="resumen-container resumen-error">
        <span role="img" aria-label="error-icon" style={{fontSize: '2rem'}}>⚠️</span>
        <p><strong>{t('messages.error', 'Oops! Algo salió mal')}:</strong></p>
        <p>{error}</p>
        <button onClick={fetchCounts} className="retry-button"> {/* Llama directamente a fetchCounts */}
          {t('summary.retry', 'Reintentar')}
        </button>
      </div>
    );
  }

  return (
    <div className="resumen-container">
      <header className="resumen-header">
        <h1>{t('summary.title', 'Mi Cinemateca: Resumen')}</h1>
      </header>

      <section className="resumen-section totals-section">
        <h2>{t('summary.totals', 'Totales')}</h2>
        <div className="totals-grid">
          <div className="total-item">
            <span className="total-number">{peliculasVistas !== null ? peliculasVistas : '-'}</span>
            <span className="total-label">{t('summary.moviesWatched', 'Películas vistas')}</span>
          </div>
          <div className="total-item">
            <span className="total-number">{seriesVistas !== null ? seriesVistas : '-'}</span>
            <span className="total-label">{t('summary.seriesWatched', 'Series vistas')}</span>
          </div>
          <div className="total-item">
            <span className="total-number">{mediaNotaPersonal ?? '-'}⭐</span>
            <span className="total-label">{t('summary.averageRating', 'Nota media')}</span>
          </div>
        </div>
      </section>

      <section className="resumen-section stats-section">
        <h2>{t('summary.outstandingStats', 'Estadísticas destacadas')}</h2>
        <div className="stats-grid">
          <div className="stat-item">
            <span className="stat-value">
              {generoStatsBD.masVisto
                ? `${generoStatsBD.masVisto} (${generoStatsBD.masVistoCount || 0} ${t('general.title', 'título')}${generoStatsBD.masVistoCount === 1 ? '' : 's'})`
                : 'N/A'}
            </span>
            <span className="stat-label">🎬 {t('summary.mostWatchedGenre', 'Género más visto')}</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">
              {generoStatsBD.mejorValorado || 'N/A'}
              {generoStatsBD.mejorValoradoMedia && ` (${generoStatsBD.mejorValoradoMedia} ⭐)`}
            </span>
            <span className="stat-label">🌟 {t('summary.bestRatedGenre', 'Género mejor valorado')}</span>
          </div>
        </div>
      </section>

      {/* Top 5 */}
      <section className="resumen-section top-lists-section">
        <h2>{t('summary.top5', 'Top 5')}</h2>
        <div className="top-lists-grid">
          <div className="top-list">
            <h3>🎬 {t('summary.movies', 'Películas')}</h3>
            {topPeliculasBD.length > 0 ? (
              <ol>
                {topPeliculasBD.map(m => (
                  <li key={m.id}>
                    <TranslatedTitle media={m} useTranslatedTitle={useTranslatedTitle} /> <span className="nota">({m.nota_personal ?? '-'})</span>
                  </li>
                ))}
              </ol>
            ) : <p className="no-data-message">{t('summary.noRatedMovies', 'No hay películas valoradas.')}</p>}
          </div>
          <div className="top-list">
            <h3>📺 {t('summary.series', 'Series')}</h3>
            {topSeriesBD.length > 0 ? (
              <ol>
                {topSeriesBD.map(m => (
                  <li key={m.id}>
                    <TranslatedTitle media={m} useTranslatedTitle={useTranslatedTitle} /> <span className="nota">({m.nota_personal ?? '-'})</span>
                  </li>
                ))}
              </ol>
            ) : <p className="no-data-message">{t('summary.noRatedSeries', 'No hay series valoradas.')}</p>}
          </div>
        </div>
      </section>

      {/* Peor valoradas - DISEÑO MEJORADO */}
      <section className="resumen-section peor-valoradas-section">
        <h2>{t('summary.worstRated', 'Peor valoradas')}</h2>
        {loadingPeor ? (
          <div className="loading-spinner" style={{margin:'1rem auto'}}></div>
        ) : errorPeor ? (
          <div className="error-message">{errorPeor}</div>
        ) : (
          <div className="peor-valoradas-grid">
            {/* Tarjeta Peor Película */}
            <div className="peor-card" style={{background:'#ffeaea'}}>
              <div className="peor-icon" style={{fontSize:'2.5rem', color:'#e74c3c'}}>🎬</div>
              <div className="peor-titulo">
                {peorPelicula ? <TranslatedTitle media={peorPelicula} useTranslatedTitle={useTranslatedTitle} /> : <span className="no-data-message">{t('summary.noRatedMovies', 'No hay películas valoradas.')}</span>}
              </div>
              <div className="peor-nota-badge" style={{background:'#e74c3c', color:'#fff'}}>
                {peorPelicula && peorPelicula.nota_personal !== null ? peorPelicula.nota_personal : '-'}
              </div>
            </div>
            {/* Tarjeta Peor Serie */}
            <div className="peor-card" style={{background:'#eaf7ff'}}>
              <div className="peor-icon" style={{fontSize:'2.5rem', color:'#2980b9'}}>📺</div>
              <div className="peor-titulo">
                {peorSerie ? <TranslatedTitle media={peorSerie} useTranslatedTitle={useTranslatedTitle} /> : <span className="no-data-message">{t('summary.noRatedSeries', 'No hay series valoradas.')}</span>}
              </div>
              <div className="peor-nota-badge" style={{background:'#2980b9', color:'#fff'}}>
                {peorSerie && peorSerie.nota_personal !== null ? peorSerie.nota_personal : '-'}
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Top Actores y Directores */}
      <section className="resumen-section personas-section">
        <h2>{t('summary.topActorsDirectors', 'Top actores y directores más frecuentes')}</h2>
        <div className="personas-grid">
          <div className="personas-list">
            <h3>🎭 {t('summary.actors', 'Actores')}</h3>
            {safeTopActores.length > 0 ? (
              <ol>
                {safeTopActores.map(([nombre, count]) => (
                  <li key={nombre}>
                    <span className="personas-badge">{count}</span>
                    <span className="personas-nombre">{nombre}</span>
                  </li>
                ))}
              </ol>
            ) : <p className="no-data-message">{t('summary.noData', 'No hay datos')}</p>} 
          </div>
          <div className="personas-list">
            <h3>🎬 {t('summary.directors', 'Directores')}</h3>
            {safeTopDirectores.length > 0 ? (
              <ol>
                {safeTopDirectores.map(([nombre, count]) => (
                  <li key={nombre}>
                    <span className="personas-badge">{count}</span>
                    <span className="personas-nombre">{nombre}</span>
                  </li>
                ))}
              </ol>
            ) : <p className="no-data-message">{t('summary.noData', 'No hay datos')}</p>} 
          </div>
        </div>
      </section>

      {/* Gráfico de Géneros Vistos */}
      <section className="resumen-section genero-chart-section">
        <h2>{t('summary.genreDistribution', 'Distribución de géneros vistos')}</h2>
        <GeneroChart data={safeGenerosVistos} />
      </section>
      <section className="resumen-section yearly-chart-section">
        <h2>{t('summary.yearlyChart', 'Títulos vistos por año de lanzamiento')}</h2>
        <YearChart data={vistosPorAnio} />
      </section>

  </div>
)}

export default Resumen;