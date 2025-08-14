import React, { useEffect, useState, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { useLanguage } from '../context/LanguageContext';
import { useTranslatedContent } from '../hooks/useTranslatedContent';
import { useDynamicPoster } from '../hooks/useDynamicPoster';
import PosterSkeleton from './PosterSkeleton';
import './DetailModal.css';
import './DetailModal.similares.css';
import FavoriteButton from './FavoriteButton';
import PendingButton from './PendingButton';
import ListasModal from './ListasModal';
import { getPlatformLink } from './platformLinks';
import { getRatingColors } from './SectionRow';

// Componente para mostrar plataformas de streaming
function getPlatformHome(providerName) {
  if (!providerName) return null;
  const name = providerName.trim().toLowerCase();
  switch (name) {
    case 'netflix': return 'https://www.netflix.com/es/';
    case 'amazon prime video': return 'https://www.primevideo.com/es/';
    case 'prime video': return 'https://www.primevideo.com/es/';
    case 'disney plus': return 'https://www.disneyplus.com/es/';
    case 'disney+': return 'https://www.disneyplus.com/es/';
    case 'apple tv plus': return 'https://tv.apple.com/es/';
    case 'apple tv+': return 'https://tv.apple.com/es/';
    case 'hbo max': return 'https://play.hbomax.com/';
    case 'filmin': return 'https://www.filmin.es/';
    case 'movistar plus': return 'https://ver.movistarplus.es/';
    case 'rakuten tv': return 'https://rakuten.tv/es/';
    case 'google play movies': return 'https://play.google.com/store/movies';
    case 'microsoft store': return 'https://www.microsoft.com/es-es/store/movies-and-tv';
    case 'atresplayer': return 'https://www.atresplayer.com/es/';
    case 'atres player': return 'https://www.atresplayer.com/';
    case 'rtve play': return 'https://www.rtve.es/play/';
    case 'flixolé': return 'https://flixole.com/es/';
    case 'flixole': return 'https://flixole.com/';
    case 'vodafone tv': return 'https://vodafone.tv/';
    case 'orange tv': return 'https://orangetv.orange.es/';
    case 'skyshowtime': return 'https://www.skyshowtime.com/es/';
    case 'youtube': return 'https://www.youtube.com/';
    case 'youtube movies': return 'https://www.youtube.com/movies';
    case 'tivify': return 'https://www.tivify.tv/';
    case 'pluto tv': return 'https://pluto.tv/';
    default: return null;
  }
}

function StreamingAvailability({ tmdbId, mediaType, country = 'ES' }) {
  const [providers, setProviders] = useState(null);
  const [externalIds, setExternalIds] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { t } = useLanguage();

  useEffect(() => {
    if (!tmdbId || !mediaType) return;
    setLoading(true);
    setError('');
    // 1. Cargar plataformas
  fetch(`${BACKEND_URL}/tmdb/${mediaType}/${tmdbId}/watch/providers`)
      .then(res => res.ok ? res.json() : res.json().then(err => { throw new Error(err.status_message || 'Error TMDb'); }))
      .then(data => {
        setProviders(data.results && data.results[country] ? data.results[country] : null);
      })
      .catch(() => setError('No se pudo obtener disponibilidad en streaming.'));
    // 2. Cargar external_ids para enlaces directos
  fetch(`${BACKEND_URL}/tmdb/${mediaType}/${tmdbId}/external_ids`)
      .then(res => res.ok ? res.json() : {})
      .then(setExternalIds)
      .catch(() => setExternalIds(null))
      .finally(() => setLoading(false));
  }, [tmdbId, mediaType, country]);

  if (!tmdbId || !mediaType) return null;

  // Renderiza los iconos de plataformas con nombre y enlace directo si es posible
  const renderProviders = (arr, tipo) => (
    <div className="streaming-provider-row">
      <span className="streaming-provider-label" style={{color: tipo==='flat' ? '#1db954' : tipo==='rent' ? '#ff9800' : '#1976d2'}}>
        {tipo==='flat' ? t('detailModal.subscription') : tipo==='rent' ? t('detailModal.rental') : t('detailModal.purchase')}
      </span>
      <div className="streaming-provider-icons">
        {arr.map(p => {
          const directLink = getPlatformLink(p, externalIds, mediaType);
          let homeLink = null;
          if (!directLink) {
            homeLink = getPlatformHome(p.provider_name);
          }
          if (directLink || homeLink) {
            return (
              <a
                key={p.provider_id}
                href={directLink || homeLink}
                target="_blank"
                rel="noopener noreferrer"
                title={p.provider_name}
                className="streaming-provider-icon-link"
              >
                <img
                  src={`https://image.tmdb.org/t/p/w45${p.logo_path}`}
                  alt={p.provider_name}
                  className="streaming-provider-icon"
                />
              </a>
            );
          } else {
            return (
              <span
                key={p.provider_id}
                title={p.provider_name}
                className="streaming-provider-icon-link disabled"
                style={{cursor:'not-allowed', opacity:0.5}}
              >
                <img
                  src={`https://image.tmdb.org/t/p/w45${p.logo_path}`}
                  alt={p.provider_name}
                  className="streaming-provider-icon"
                />
              </span>
            );
          }
        })}      
      </div>
    </div>
  );

  return (
    <div className="streaming-availability-block">
      <b>{t('detailModal.streamingAvailabilityTitle')}</b>
      {loading && <span style={{marginLeft:8}}>{t('detailModal.loading')}</span>}
      {error && <span style={{color:'#c00', marginLeft:8}}>{error}</span>}
      {!loading && !error && providers && (
        <div className="streaming-providers-list">
          {providers.flatrate && providers.flatrate.length > 0 && renderProviders(providers.flatrate, 'flat')}
          {providers.rent && providers.rent.length > 0 && renderProviders(providers.rent, 'rent')}
          {providers.buy && providers.buy.length > 0 && renderProviders(providers.buy, 'buy')}
          {!providers.flatrate && !providers.rent && !providers.buy && (
            <span style={{color:'#888'}}>{t('detailModal.notAvailableOnPlatforms')}</span>
          )}
        </div>
      )}
      {!loading && !error && !providers && (
        <span style={{color:'#888', marginLeft:8}}>{t('detailModal.notAvailableOnPlatforms')}</span>
      )}
    </div>
  );
}


const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "https://mi-catalogo-backend.onrender.com";
const TMDB_URL = BACKEND_URL + '/tmdb';

// Componente para cada item similar con su propia portada dinámica
function SimilarItem({ item, onUpdate, isDraggingRef, isMobile }) {
  const mediaType = item.tipo?.toLowerCase().includes('serie') ? 'tv' : 'movie';
  const { posterUrl, loading } = useDynamicPoster(item.tmdb_id, mediaType, item.imagen);

  const handleClick = () => {
    // En móvil, permitir click directo; en desktop, verificar si no está dragging
    if (isMobile || !isDraggingRef.current) {
      onUpdate(item);
    }
  };

  return (
    <div className="similares-item">
      {loading ? (
        <PosterSkeleton width="100%" height="100%" />
      ) : (
        <img
          src={posterUrl}
          alt={item.titulo}
          className="similares-img"
          onClick={handleClick}
          style={{ cursor: 'pointer' }}
        />
      )}
    </div>
  );
}

function DetailModal({ 
  isOpen, 
  media, 
  onClose, 
  onUpdate, 
  onFavorite, 
  onPendiente, 
  onDelete, 
  etiquetas, 
  onTagAdded, 
  onTagToggle, 
  listas, 
  onListaToggle,
  tags,
  // Compatibilidad con props usados desde App.js
  onToggleFavorite,
  onTogglePending,
  onAddTag,
  onRemoveTag
}) {
  // --- Similares ---
  const [similares, setSimilares] = useState([]);
  const [loadingSimilares, setLoadingSimilares] = useState(false);
  const [errorSimilares, setErrorSimilares] = useState('');
  const carouselRef = useRef(null);
  const isDraggingRef = useRef(false);
  
  // Detectar si es dispositivo móvil
  const isMobile = window.innerWidth <= 768;
const startXRef = useRef(0);
const scrollLeftRef = useRef(0);

  const [tmdbDetails, setTmdbDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showDelete, setShowDelete] = useState(false);
  const [favorito, setFavorito] = useState(false);
  const [pendiente, setPendiente] = useState(false);
  const [localTags, setLocalTags] = useState([]);
  // Estados para gestión de listas
  const [showListasModal, setShowListasModal] = useState(false);
  const [listasDeMedia, setListasDeMedia] = useState([]);
  const [listasFeedback, setListasFeedback] = useState('');
  // Nuevo diseño de tags: modal + búsqueda
  const [showTagsManager, setShowTagsManager] = useState(false);
  const [tagSearch, setTagSearch] = useState('');
  const [tempSelectedTagIds, setTempSelectedTagIds] = useState([]);
  const [showAllTags, setShowAllTags] = useState(false);
  const { t, currentLanguage } = useLanguage();

  // Hook para portada dinámica
  const mediaType = media?.tipo?.toLowerCase().includes('serie') ? 'tv' : 'movie';
  const { posterUrl } = useDynamicPoster(media?.tmdb_id, mediaType, media?.imagen);

  // Mapear idioma para TMDb API
  const getTmdbLanguage = (lang) => {
    switch (lang) {
      case 'en': return 'en-US';
      case 'es': return 'es-ES';
      default: return 'en-US';
    }
  };

  // ✨ NUEVO: Usar contenido traducido automáticamente
  const { translatedMedia, isTranslating } = useTranslatedContent(media);
  
  // Usar translatedMedia en lugar de media directamente para mostrar
  const displayMedia = translatedMedia || media;

  useEffect(() => {
    if (!media) return;
    setFavorito(media.favorito || false);
    setPendiente(media.pendiente || false);
    setLocalTags(Array.isArray(media.tags) ? media.tags : []);
    setTagSearch('');
    setShowTagsManager(false);

    // Usar media original para operaciones de backend, displayMedia para mostrar
    const tipo = typeof media.tipo === 'string' && media.tipo.toLowerCase() === 'serie' ? 'serie' : 'película';
    const tmdbLang = getTmdbLanguage(currentLanguage);
    setLoading(true);

    if (media.tmdb_id && media.tipo) {
      const mediaType = media.tipo.toLowerCase() === 'serie' ? 'tv' : 'movie';
      fetch(`${TMDB_URL}?id=${media.tmdb_id}&media_type=${mediaType}&language=${tmdbLang}`)
        .then(res => res.ok ? res.json() : res.json().then(err => { throw new Error(err.detail); }))
        .then(setTmdbDetails)
        .catch(() => setError('No se pudo cargar detalles avanzados TMDb'))
        .finally(() => setLoading(false));
    } else {
      fetch(`${TMDB_URL}?title=${encodeURIComponent(media.titulo)}&tipo_preferido=${encodeURIComponent(tipo)}&language=${tmdbLang}`)
        .then(res => res.ok ? res.json() : res.json().then(err => { throw new Error(err.detail); }))
        .then(setTmdbDetails)
        .catch(() => setError('No se pudo cargar detalles avanzados TMDb'))
        .finally(() => setLoading(false));
    }

    // Solo cargar listas de medias si listas están disponibles como prop
    if (listas && Array.isArray(listas)) {
      setListasDeMedia(
        listas.filter(lista => Array.isArray(lista.medias) && lista.medias.some(m => m.id === media.id)).map(l => l.id)
      );
    }
  }, [media, currentLanguage]);

  useEffect(() => {
    if (!media || !media.id) {
      setSimilares([]);
      return;
    }
    setLoadingSimilares(true);
    setErrorSimilares('');
    const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "https://mi-catalogo-backend.onrender.com";
    const jwtToken = localStorage.getItem('jwt_token');
    fetch(`${BACKEND_URL}/medias/${media.id}/similares`, {
      headers: {
        ...(jwtToken ? { 'Authorization': `Bearer ${jwtToken}` } : {})
      }
    })
      .then(res => res.ok ? res.json() : res.json().then(err => { throw new Error(err.detail || 'Error'); }))
      .then(data => setSimilares(Array.isArray(data) ? data : []))
      .catch(() => setErrorSimilares('No se pudieron cargar similares.'))
      .finally(() => setLoadingSimilares(false));
  }, [media]);

  // refreshListas is now handled by parent component through listas prop

  if (!media) return null;

  // LOG DE DEPURACIÓN PARA SIMILARES
  

  const safeTags = Array.isArray(tags) ? tags : [];

  // Normalizador para búsqueda
  const normalize = (s) => (s || '').toString().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

  // Quitar tag rápidamente desde chip
  const handleRemoveExistingTag = async (tagId) => {
    if (!media || !tagId) return;
    try {
      if (typeof onRemoveTag === 'function') {
        await onRemoveTag(media.id, tagId);
      } else if (typeof onTagToggle === 'function') {
        onTagToggle(media.id, tagId);
      }
      // Actualización optimista
      setLocalTags(prev => prev.filter(t => t.id !== tagId));
      // Confirmar con backend y sincronizar estado seleccionado
      try {
        const jwtToken = localStorage.getItem('jwt_token');
        const res = await fetch(`${BACKEND_URL}/medias/${media.id}`, {
          headers: {
            ...(jwtToken ? { 'Authorization': `Bearer ${jwtToken}` } : {})
          }
        });
        if (res.ok) {
          const updated = await res.json();
          setLocalTags(Array.isArray(updated.tags) ? updated.tags : []);
          onUpdate?.(updated);
        }
      } catch (_) { /* noop */ }
    } catch (_) {}
  };

  // Modal de gestión de tags
  const openTagsManager = () => {
    setTempSelectedTagIds((Array.isArray(localTags) ? localTags : []).map(t => t.id));
    setTagSearch('');
    setShowTagsManager(true);
  };

  const toggleTempTag = (id) => {
    setTempSelectedTagIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const applyTagsChanges = async () => {
    const currentIds = new Set((localTags || []).map(t => t.id));
    const nextIds = new Set(tempSelectedTagIds);
    const toAdd = [...nextIds].filter(id => !currentIds.has(id));
    const toRemove = [...currentIds].filter(id => !nextIds.has(id));

    try {
      for (const id of toAdd) {
        if (typeof onAddTag === 'function') {
          // eslint-disable-next-line no-await-in-loop
          await onAddTag(media.id, id);
        } else if (typeof onTagToggle === 'function') {
          onTagToggle(media.id, id);
        }
      }
      for (const id of toRemove) {
        if (typeof onRemoveTag === 'function') {
          // eslint-disable-next-line no-await-in-loop
          await onRemoveTag(media.id, id);
        } else if (typeof onTagToggle === 'function') {
          onTagToggle(media.id, id);
        }
      }

      // Reconsultar el media para asegurar persistencia y sincronizar selección
      try {
        const jwtToken = localStorage.getItem('jwt_token');
        const res = await fetch(`${BACKEND_URL}/medias/${media.id}`, {
          headers: {
            ...(jwtToken ? { 'Authorization': `Bearer ${jwtToken}` } : {})
          }
        });
        if (res.ok) {
          const updated = await res.json();
          setLocalTags(Array.isArray(updated.tags) ? updated.tags : []);
          onUpdate?.(updated);
        } else {
          // Fallback: calcular localmente
          const finalTags = safeTags.filter(t => nextIds.has(t.id));
          setLocalTags(finalTags);
        }
      } catch (_) {
        const fallback = safeTags.filter(t => nextIds.has(t.id));
        setLocalTags(fallback);
      }

      setShowTagsManager(false);
    } catch (_) {
      // En caso de error, no cerrar para reintentar
    }
  };

  // Lista filtrada en el modal
  const filteredAllTags = (tagSearch ? safeTags.filter(t => normalize(t.nombre).includes(normalize(tagSearch))) : safeTags);

  return (
    <div>
      <div className="detail-modal-bg" onClick={e => { if (e.target.classList.contains('detail-modal-bg')) onClose(); }}>
        <div className="detail-modal wide" onClick={e => e.stopPropagation()}>
          <button className="close-btn" onClick={onClose}>&times;</button>

          {/* Mostrar indicador de traducción si está cargando */}
          {isTranslating && (
            <div className="translation-indicator" style={{
              position: 'absolute',
              top: '10px',
              right: '50px',
              background: 'rgba(25, 118, 210, 0.9)',
              color: 'white',
              padding: '4px 8px',
              borderRadius: '4px',
              fontSize: '0.8rem',
              zIndex: 1001
            }}>
              🌐 {t('messages.translating')}...
            </div>
          )}

          <div className="detail-modal-content">
            <div className="detail-modal-poster-container-with-actions">
              <div className="detail-modal-poster-container">
                <img src={posterUrl} alt={displayMedia.titulo} className="detail-modal-poster" />
                {/* Badges de nota TMDb y personal, igual que en SectionRow */}
                {displayMedia.nota_imdb !== undefined && displayMedia.nota_imdb !== null && displayMedia.nota_imdb !== '' && (
                  <div 
                    className={`nota-imdb-badge-card ${getRatingColors(displayMedia.nota_imdb).isPremium ? 'premium' : ''}`}
                    style={{ 
                      '--progress': `${Math.round(parseFloat(displayMedia.nota_imdb) * 10)}%`,
                      '--rating-color': getRatingColors(displayMedia.nota_imdb).color,
                      '--rating-color-dark': getRatingColors(displayMedia.nota_imdb).darkColor,
                      '--text-color': getRatingColors(displayMedia.nota_imdb).textColor,
                      '--rating-shadow': getRatingColors(displayMedia.nota_imdb).shadow,
                      '--rating-border': getRatingColors(displayMedia.nota_imdb).border
                    }}
                    title={t('tooltips.tmdbRating')}
                  >
                    <span className="nota-imdb-num-card">{Number(displayMedia.nota_imdb).toFixed(1)}</span>
                  </div>
                )}
                {displayMedia.nota_personal && displayMedia.nota_personal > 0 ? (
                  <div 
                    className={`nota-personal-badge-card ${getRatingColors(displayMedia.nota_personal).isPremium ? 'premium' : ''}`}
                    style={{ 
                      '--progress': `${Math.round(parseFloat(displayMedia.nota_personal) * 10)}%`,
                      '--rating-color': getRatingColors(displayMedia.nota_personal).color,
                      '--rating-color-dark': getRatingColors(displayMedia.nota_personal).darkColor,
                      '--text-color': getRatingColors(displayMedia.nota_personal).textColor,
                      '--rating-shadow': getRatingColors(displayMedia.nota_personal).shadow,
                      '--rating-border': getRatingColors(displayMedia.nota_personal).border
                    }}
                    title={t('tooltips.personalRating')}
                  >
                    <span className="nota-personal-num-card">{Number(displayMedia.nota_personal).toFixed(1)}</span>
                  </div>
                ) : (
                  <div 
                    className="nota-personal-badge-card nota-personal-empty"
                    title={t('tooltips.noPersonalRating')}
                  >
                    <span className="nota-personal-num-card">?</span>
                  </div>
                )}
              </div>

              <div className="detail-modal-actions-under-poster">
                <PendingButton isPending={pendiente} onToggle={() => { (onPendiente || onTogglePending)?.(media.id); setPendiente(p => !p); }} />
                <FavoriteButton isFavorite={favorito} onToggle={() => { (onFavorite || onToggleFavorite)?.(media.id); setFavorito(f => !f); }} small />
                <button className="mini-action-btn" title={t('detailModal.addToList')} onClick={() => setShowListasModal(true)}>
                  <span role="img" aria-label="listas">📂</span>
                </button>
                {listasFeedback && <span className="listas-feedback-detail">{listasFeedback}</span>}
                <button className="mini-action-btn delete-btn" title={t('detailModal.delete')} onClick={() => setShowDelete(true)}>
                  <span role="img" aria-label="Eliminar">🗑️</span>
                </button>
              </div>
            </div>

            <div className="detail-modal-info">
              <h2>
                {displayMedia.titulo} 
                <span className="detail-modal-year">({displayMedia.anio})</span>
              </h2>
              <p><strong>{t('detailModal.genre')}</strong> {displayMedia.genero}</p>
              <p><strong>{t('detailModal.director')}</strong> {displayMedia.director}</p>
              <p><strong>{t('detailModal.cast')}</strong> {displayMedia.elenco}</p>
              <p><strong>{t('detailModal.synopsis')}</strong> {displayMedia.sinopsis}</p>
              <p><strong>{t('detailModal.status')}</strong> {displayMedia.estado}</p>

              {/* TAGS: diseño mejorado */}
              <div className="media-tags-block">
                <div className="media-tags-header">
                  <div className="tags-title-row">
                    <strong className="tags-title">{t('detailModal.tags')}</strong>
                  </div>
                  <button className="tags-manage-btn" onClick={openTagsManager}>
                    <span className="manage-icon">🏷️</span>
                    {t('detailModal.manage', 'Gestionar')}
                  </button>
                </div>

                <div className="media-tags-container">
                  {(!localTags || localTags.length === 0) ? (
                    <div className="no-tags-placeholder" onClick={openTagsManager}>
                      <span className="no-tags-icon">➕</span>
                      <span className="no-tags-text">{t('detailModal.addFirstTag', 'Añadir primer tag')}</span>
                    </div>
                  ) : (
                    <div className="media-tags-grid">
                      {(showAllTags ? localTags : localTags.slice(0, 6)).map(tag => (
                        <div className="tag-chip" key={tag.id}>
                          <span className="tag-name">{tag.nombre}</span>
                        </div>
                      ))}
                      {localTags.length > 6 && (
                        <button 
                          className="show-more-tags-btn" 
                          onClick={() => setShowAllTags(!showAllTags)}
                        >
                          {showAllTags 
                            ? `${t('detailModal.showLess', 'Mostrar menos')}`
                            : `+${localTags.length - 6} ${t('detailModal.more', 'más')}`
                          }
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="similares-block">
                <h3>{t('detailModal.similar')}</h3>
                {loadingSimilares && (
                  <div className="similares-cargando">
                    <div className="similares-spinner"></div>
                    <div style={{marginTop: 10, fontWeight: 500, color: '#1976d2'}}>{t('detailModal.searchingMatches')}</div>
                  </div>
                )}
                {errorSimilares && (
                  <div className="similares-error">{errorSimilares}</div>
                )}
                {!loadingSimilares && similares.length === 0 && !errorSimilares && (
                  <div className="similares-vacio">{t('detailModal.noSimilarTitles')}</div>
                )}
                {!loadingSimilares && similares.length > 0 && (
                  <div
                    className="similares-carousel"
                    ref={carouselRef}
                    {...(!isMobile && {
                      onMouseDown: e => {
                        isDraggingRef.current = true;
                        startXRef.current = e.pageX - (carouselRef.current?.offsetLeft || 0);
                        scrollLeftRef.current = carouselRef.current?.scrollLeft || 0;
                      },
                      onMouseMove: e => {
                        if (!isDraggingRef.current) return;
                        e.preventDefault();
                        const x = e.pageX - (carouselRef.current?.offsetLeft || 0);
                        const walk = x - startXRef.current;
                        if (carouselRef.current) carouselRef.current.scrollLeft = scrollLeftRef.current - walk;
                      },
                      onMouseUp: () => { isDraggingRef.current = false; },
                      onMouseLeave: () => { isDraggingRef.current = false; }
                    })}
                  >
                    {similares.map(item => (
                      <SimilarItem 
                        key={item.id} 
                        item={item} 
                        onUpdate={onUpdate}
                        isDraggingRef={isDraggingRef}
                        isMobile={isMobile}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="detail-modal-info">
            <div className="tmdb-extra-info-modal">
              {loading && <div>{t('detailModal.loadingAdvancedDetails')}</div>}
              {error && <div style={{ color: '#ff4c4c' }}>{error}</div>}
              {tmdbDetails && <TMDBDetails tmdbDetails={tmdbDetails} media={media} />}
              {tmdbDetails && (
                <div className="trailer-block-embed-outer">
                  {tmdbDetails.trailer && (tmdbDetails.trailer.includes('youtube.com') || tmdbDetails.trailer.includes('youtu.be')) ? (() => {
                    let videoId = null;
                    const ytMatch = tmdbDetails.trailer.match(/(?:youtube\.com\/(?:watch\?.*v=|embed\/)|youtu.be\/)([\w-]{11})/);
                    if (ytMatch && ytMatch[1]) videoId = ytMatch[1];
                    if (!videoId) {
                      const vMatch = tmdbDetails.trailer.match(/[?&]v=([\w-]{11})/);
                      if (vMatch && vMatch[1]) videoId = vMatch[1];
                    }
                    return videoId ? (
                      <iframe
                        width="320"
                        height="180"
                        src={`https://www.youtube.com/embed/${videoId}`}
                        title="Tráiler de YouTube"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        style={{ display: 'block', margin: '18px auto 0 auto', borderRadius: '8px', boxShadow: '0 2px 12px #0007' }}
                      />
                    ) : (
                      <div style={{color:'#ff4c4c', textAlign:'center', marginTop:'16px'}}>{t('detailModal.couldNotExtractVideo')}</div>
                    );
                  })() : (
                    <div style={{color:'#ff4c4c', textAlign:'center', marginTop:'16px'}}>{t('detailModal.noTrailerAvailable')}</div>
                  )}
                </div>
              )}
            </div>

            {/* Apartado de anotaciones personales debajo del bloque avanzado */}
            <PersonalNotes media={media} onUpdate={onUpdate} onClose={onClose} />
              {/* Apartado de disponibilidad en streaming debajo de las anotaciones */}
                {media.tmdb_id && media.tipo && (
                <StreamingAvailability tmdbId={media.tmdb_id} mediaType={media.tipo.toLowerCase() === 'serie' ? 'tv' : 'movie'} country="ES" />
              )}
            </div>

            {showDelete && (
              <div className="delete-confirm-modal-bg">
                <div className="delete-confirm-modal">
                  <div className="delete-confirm-title">{t('detailModal.deleteConfirmTitle')} {media.tipo} {t('detailModal.deleteFromDatabase')}</div>
                  <div className="delete-confirm-buttons">
                    <button className="delete-confirm-btn delete-confirm-btn-danger" onClick={() => { onDelete(media); setShowDelete(false); }}>{t('detailModal.delete')}</button>
                    <button className="delete-confirm-btn" onClick={() => setShowDelete(false)}>{t('detailModal.cancel')}</button>
                  </div>
                </div>
              </div>
            )}

            {showListasModal && (
              <ListasModal
                mediaId={media.id}
                listas={listas}
                listasDeMedia={listasDeMedia}
                onClose={() => setShowListasModal(false)}
                onListasChange={() => {
                  // refreshListas is now handled by parent component
                  setListasFeedback(t('detailModal.listsUpdated'));
                  setTimeout(() => setListasFeedback(''), 1500);
                }}
              />
            )}

            {/* Modal de gestión de tags mejorado */}
            {showTagsManager && (
              <div className="tags-modal-overlay" onClick={(e) => { if (e.target.classList.contains('tags-modal-overlay')) setShowTagsManager(false); }}>
                <div className="tags-modal" onClick={(e) => e.stopPropagation()}>
                  <div className="tags-modal-header">
                    <div className="tags-modal-title">
                      <span className="tags-modal-icon">🏷️</span>
                      <h3>{t('detailModal.manageTags', 'Gestionar Tags')}</h3>
                    </div>
                    <button className="tags-modal-close" onClick={() => setShowTagsManager(false)}>×</button>
                  </div>
                  
                  <div className="tags-modal-content">
                    <div className="tags-search-section">
                      <div className="tags-search-container">
                        <span className="search-icon">🔍</span>
                        <input
                          type="text"
                          value={tagSearch}
                          onChange={(e) => setTagSearch(e.target.value)}
                          placeholder={t('detailModal.searchTags', 'Buscar tags...')}
                          className="tags-search-input"
                        />
                        {tagSearch && (
                          <button className="clear-search-btn" onClick={() => setTagSearch('')}>×</button>
                        )}
                      </div>
                    </div>

                    <div className="tags-selection-area">
                      {filteredAllTags.length > 0 ? (
                        <div className="tags-grid">
                          {filteredAllTags.map(tg => (
                            <label key={tg.id} className={`tag-option ${tempSelectedTagIds.includes(tg.id) ? 'selected' : ''}`}>
                              <input
                                type="checkbox"
                                checked={tempSelectedTagIds.includes(tg.id)}
                                onChange={() => toggleTempTag(tg.id)}
                                className="tag-checkbox"
                              />
                              <span className="tag-option-text">{tg.nombre}</span>
                              <span className="tag-check-mark">✓</span>
                            </label>
                          ))}
                        </div>
                      ) : (
                        <div className="no-tags-found">
                          <span className="no-results-icon">😕</span>
                          <p>{t('detailModal.noTagsFound', 'No hay tags que coincidan')}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="tags-modal-footer">
                    <div className="selected-count">
                      <span className="count-icon">📊</span>
                      {t('detailModal.selected', 'Seleccionados')}: <strong>{tempSelectedTagIds.length}</strong>
                    </div>
                    <div className="tags-modal-actions">
                      <button className="tags-cancel-btn" onClick={() => setShowTagsManager(false)}>
                        {t('actions.cancel')}
                      </button>
                      <button className="tags-save-btn" onClick={applyTagsChanges}>
                        <span className="save-icon">💾</span>
                        {t('actions.save')}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}

// Componente de bloc de notas simple y minimalista
function PersonalNotes({ media, onUpdate, onClose }) {
  const [editMode, setEditMode] = useState(false);
  const [note, setNote] = useState(media.anotacion_personal || '');
  const [tempNote, setTempNote] = useState(note);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const { t } = useLanguage();

  const handleEdit = () => {
    setEditMode(true);
    setTempNote(note);
    setError('');
  };

  const handleCancel = () => {
    setTempNote(note);
    setEditMode(false);
    setError('');
  };

  const handleSave = async () => {
    if (saving) return;
    
    setSaving(true);
    setError('');

    try {
      const jwtToken = localStorage.getItem('jwt_token');
      const response = await fetch(`${BACKEND_URL}/medias/${media.id}/anotacion_personal`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(jwtToken ? { 'Authorization': `Bearer ${jwtToken}` } : {})
        },
        // Backend expects a plain JSON string
        body: JSON.stringify(tempNote)
      });
      
      if (!response.ok) throw new Error('Error al guardar');
      
      const updatedMedia = await response.json();
      setNote(tempNote);
      setEditMode(false);
      onUpdate(updatedMedia);
    } catch (error) {
      setError('Error al guardar las notas. Inténtalo de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  const hasContent = note && note.trim() !== '';
  const hasNewContent = tempNote && tempNote.trim() !== '';
  const wordCount = hasContent ? note.trim().split(/\s+/).length : 0;

  return (
    <div className="notes-block">
      {/* Header */}
      <div className="notes-header">
        <div className="notes-title-section">
          <div className="notes-icon">📝</div>
          <h3 className="notes-title">{t('detailModal.personalNotes', 'Notas Personales')}</h3>
          {hasContent && !editMode && (
            <span className="notes-stats">{wordCount} palabras</span>
          )}
        </div>
        
        {!editMode && (
          <button className="notes-action-btn" onClick={handleEdit}>
            <span className="btn-icon">✏️</span>
            {hasContent ? t('detailModal.edit', 'Editar') : t('detailModal.addNotes', 'Añadir')}
          </button>
        )}
      </div>

      {/* Content */}
      <div className="notes-content">
        {editMode ? (
          <div className="notes-editor">
            <textarea
              className="notes-textarea"
              value={tempNote}
              onChange={(e) => setTempNote(e.target.value)}
              placeholder={t('detailModal.personalNotesPlaceholder', 'Escribe tus pensamientos, reseñas o cualquier detalle que quieras recordar...')}
              rows={6}
              autoFocus
            />
            
            <div className="notes-editor-footer">
              <div className="notes-editor-info">
                {error && (
                  <span className="notes-error">
                    <span className="error-icon">⚠️</span>
                    {error}
                  </span>
                )}
                {hasNewContent && (
                  <span className="notes-word-count">
                    {tempNote.trim().split(/\s+/).length} palabras
                  </span>
                )}
              </div>
              
              <div className="notes-editor-actions">
                <button 
                  className="notes-btn notes-btn-cancel" 
                  onClick={handleCancel}
                  disabled={saving}
                >
                  {t('actions.cancel', 'Cancelar')}
                </button>
                <button 
                  className="notes-btn notes-btn-save"
                  onClick={handleSave}
                  disabled={!hasNewContent || saving}
                >
                  {saving ? (
                    <>
                      <span className="btn-spinner"></span>
                      {t('actions.saving', 'Guardando...')}
                    </>
                  ) : (
                    <>
                      <span className="btn-icon">💾</span>
                      {t('actions.save', 'Guardar')}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="notes-display">
            {hasContent ? (
              <div className="notes-text-content">
                <div className="notes-text">
                  {note.split('\n').map((line, index) => (
                    <p key={index} className="notes-paragraph">
                      {line || '\u00A0'}
                    </p>
                  ))}
                </div>
                <div className="notes-metadata">
                  <span className="notes-updated">
                    {t('detailModal.lastUpdated', 'Última actualización')}: {new Date().toLocaleDateString()}
                  </span>
                </div>
              </div>
            ) : (
              <div className="notes-empty" onClick={handleEdit}>
                <div className="empty-icon">📄</div>
                <div className="empty-title">
                  {t('detailModal.noNotesYet', 'Sin notas')}
                </div>
                <div className="empty-subtitle">
                  {t('detailModal.clickToAdd', 'Haz clic para añadir tus primeras notas')}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default DetailModal;

const TMDBDetails = ({ tmdbDetails, media }) => {
  const { t } = useLanguage();
  
  return (
    <>
      {tmdbDetails.titulo_original && <div><b>{t('detailModal.originalTitle')}:</b> {tmdbDetails.titulo_original}</div>}
      {tmdbDetails.idioma_original && <div><b>{t('detailModal.originalLanguage')}:</b> {tmdbDetails.idioma_original.toUpperCase()}</div>}
      {tmdbDetails.generos && <div><b>{t('detailModal.genres')}:</b> {tmdbDetails.generos}</div>}
      {tmdbDetails.pais && <div><b>{t('detailModal.country')}:</b> {tmdbDetails.pais}</div>}
      {tmdbDetails.duracion && <div><b>{t('detailModal.duration')}:</b> {tmdbDetails.duracion} min</div>}
      {media.tipo === 'película' && (
        <>
          {tmdbDetails.presupuesto !== undefined && tmdbDetails.presupuesto !== null && (
            <div><b>{t('detailModal.budget')}:</b> {tmdbDetails.presupuesto > 0 ? `$${tmdbDetails.presupuesto.toLocaleString('es-ES')}` : t('detailModal.notAvailable')}</div>
          )}
          {tmdbDetails.recaudacion !== undefined && tmdbDetails.recaudacion !== null && (
            <div><b>{t('detailModal.revenue')}:</b> {tmdbDetails.recaudacion > 0 ? `$${tmdbDetails.recaudacion.toLocaleString('es-ES')}` : t('detailModal.notAvailable')}</div>
          )}
        </>
      )}
      {media.tipo === 'serie' && tmdbDetails.temporadas_detalle?.length > 0 && (
        <div className="tmdb-seasons-block">
          <h4>{t('detailModal.seasonsAndEpisodes')}</h4>
          {tmdbDetails.temporadas_detalle.map(season => (
            <details key={season.numero} className="tmdb-season">
              <summary>{season.nombre} ({season.episodios.length} {t('detailModal.episodes')})</summary>
              <ul className="tmdb-episode-list">
                {season.episodios.map(ep => (
                  <li key={ep.numero} className="tmdb-episode-item">
                    <b>{ep.numero}. {ep.titulo}</b>
                    {ep.fecha && <span> | <i>{ep.fecha}</i></span>}
                    {ep.resumen && <div className="tmdb-episode-overview">{ep.resumen}</div>}
                  </li>
                ))}
              </ul>
            </details>
          ))}
        </div>
      )}
    </>
  );
};
