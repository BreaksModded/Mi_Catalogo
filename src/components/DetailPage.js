import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { useLanguage } from '../context/LanguageContext';
import { useTranslatedContent } from '../hooks/useTranslatedContent';
import { useDynamicPoster } from '../hooks/useDynamicPoster';
import PosterSkeleton from './PosterSkeleton';
import ListasModal from './ListasModal';
import Navbar from './Navbar';
import { getPlatformLink } from './platformLinks';
import { getRatingColors } from './SectionRow';
import './DetailPage.css';
import './SectionRow.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "https://mi-catalogo-backend.onrender.com";
const TMDB_URL = BACKEND_URL + '/tmdb';

// Componente para mostrar el reparto con imágenes
function CastSection({ tmdbId, mediaType, fallbackCast }) {
  const [cast, setCast] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showAll, setShowAll] = useState(false);
  const { t } = useLanguage();
  const navigate = useNavigate();

  useEffect(() => {
    if (!tmdbId || !mediaType) {
      if (fallbackCast) {
        const castArray = fallbackCast.split(',').map((actor, index) => ({
          id: index,
          name: actor.trim(),
          character: null,
          profile_path: null
        })).slice(0, 10);
        setCast(castArray);
      }
      return;
    }
    setLoading(true);
    setError('');
    const type = mediaType.toLowerCase() === 'serie' ? 'tv' : 'movie';
    const creditsUrl = `${BACKEND_URL}/tmdb/${type}/${tmdbId}/credits`;
    fetch(creditsUrl)
      .then(res => res.json())
      .then(data => {
        if (data.cast && Array.isArray(data.cast) && data.cast.length > 0) {
          setCast(data.cast.slice(0, 8));
          setError('');
        } else if (fallbackCast && fallbackCast.trim()) {
          const actorNames = fallbackCast.split(',').map(name => name.trim()).filter(Boolean);
          const enhancedCast = actorNames.map((name, index) => {
            const parenthesisMatch = name.match(/^(.+?)\s*\((.+?)\)$/);
            if (parenthesisMatch) {
              return {
                id: `fallback-${index}`,
                name: parenthesisMatch[1].trim(),
                character: parenthesisMatch[2].trim(),
                profile_path: null
              };
            }
            return {
              id: `fallback-${index}`,
              name: name,
              character: null,
              profile_path: null
            };
          });
          setCast(enhancedCast);
          setError('');
        } else {
          setError('No se pudo cargar información del reparto desde TMDb');
        }
      })
      .catch(() => {
        if (fallbackCast && fallbackCast.trim()) {
          const actorNames = fallbackCast.split(',').map(name => name.trim()).filter(Boolean);
          const enhancedCast = actorNames.map((name, index) => {
            const parenthesisMatch = name.match(/^(.+?)\s*\((.+?)\)$/);
            if (parenthesisMatch) {
              return {
                id: `fallback-${index}`,
                name: parenthesisMatch[1].trim(),
                character: parenthesisMatch[2].trim(),
                profile_path: null
              };
            }
            return {
              id: `fallback-${index}`,
              name: name,
              character: null,
              profile_path: null
            };
          });
          setCast(enhancedCast);
          setError('');
        } else {
          setError('No se pudo cargar información del reparto desde TMDb');
        }
      })
      .finally(() => setLoading(false));
  }, [tmdbId, mediaType, fallbackCast]);

  // Si no hay ningún reparto disponible
  if (!loading && !error && cast.length === 0 && !fallbackCast) {
    return (
      <div className="cast-section">
        <div className="cast-header">
          <span className="info-label">{t('detailModal.cast')}:</span>
        </div>
        <span className="info-value">No disponible</span>
      </div>
    );
  }

  const displayCast = showAll ? cast : cast.slice(0, 4);

  return (
    <div className="cast-section">
      <div className="cast-header">
        <span className="info-label">{t('detailModal.cast')}:</span>
        {cast.length > 4 && (
          <button 
            className="show-more-cast-btn"
            onClick={() => setShowAll(!showAll)}
          >
            {showAll ? 'Ver menos' : `Ver todos (${cast.length})`}
          </button>
        )}
      </div>
      
      {loading && (
        <div className="cast-loading">
          <div className="loading-spinner-small"></div>
          <span>Cargando reparto...</span>
        </div>
      )}
      
      {error && !fallbackCast && (
        <div className="cast-error">
          <span className="info-value">{error}</span>
        </div>
      )}
      
      {!loading && cast.length > 0 && (
        <div className="cast-grid">
          {displayCast.map((actor, index) => (
            <div key={actor.id || index} className="cast-member">
              <div className="cast-photo">
                {actor.profile_path ? (
                  <img
                    src={`https://image.tmdb.org/t/p/w185${actor.profile_path}`}
                    alt={actor.name}
                    className="actor-image"
                    loading="lazy"
                    onError={(e) => {
                      // ...
                      e.target.style.display = 'none';
                      e.target.parentNode.querySelector('.actor-placeholder').style.display = 'flex';
                    }}
                  />
                ) : null}
                <div 
                  className="actor-placeholder" 
                  style={{ display: actor.profile_path ? 'none' : 'flex' }}
                >
                  <span className="placeholder-icon">👤</span>
                </div>
              </div>
              <div className="cast-info">
                <div className="actor-name" title={actor.name}>
                  {Number.isInteger(actor.id) ? (
                    <span
                      onClick={() => navigate(`/actor/${actor.id}`)}
                      style={{ color: '#00e2c7', cursor: 'pointer', textDecoration: 'none' }}
                    >
                      {actor.name || t('person.unknown', 'Actor desconocido')}
                    </span>
                  ) : (
                    actor.name || t('person.unknown', 'Actor desconocido')
                  )}
                </div>
                {actor.character && (
                  <div className="character-name" title={actor.character}>
                    {actor.character}
                  </div>
                )}
                {!actor.character && actor.id && actor.id.toString().startsWith('fallback-') && (
                  <div className="character-name fallback-note" title="Información limitada">
                    <em>Personaje no disponible</em>
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {/* Si es fallback, no mostrar aviso, solo mostrar los datos disponibles */}
        </div>
      )}
    </div>
  );
}

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
  const [selectedCountry, setSelectedCountry] = useState(country);
  const [availableCountries, setAvailableCountries] = useState([]);
  const [showAllProviders, setShowAllProviders] = useState(false);
  const { t } = useLanguage();

  // Países disponibles con sus códigos y nombres
  const countries = {
    'ES': { name: t('countries.spain', 'España'), flag: '🇪🇸' },
    'US': { name: t('countries.unitedStates', 'Estados Unidos'), flag: '🇺🇸' },
    'GB': { name: t('countries.unitedKingdom', 'Reino Unido'), flag: '🇬🇧' },
    'FR': { name: t('countries.france', 'Francia'), flag: '🇫🇷' },
    'DE': { name: t('countries.germany', 'Alemania'), flag: '🇩🇪' },
    'IT': { name: t('countries.italy', 'Italia'), flag: '🇮🇹' },
    'PT': { name: t('countries.portugal', 'Portugal'), flag: '🇵🇹' },
    'BR': { name: t('countries.brazil', 'Brasil'), flag: '🇧🇷' },
    'MX': { name: t('countries.mexico', 'México'), flag: '🇲🇽' },
    'AR': { name: t('countries.argentina', 'Argentina'), flag: '🇦🇷' },
    'CA': { name: t('countries.canada', 'Canadá'), flag: '🇨🇦' },
    'AU': { name: t('countries.australia', 'Australia'), flag: '🇦🇺' },
    'JP': { name: t('countries.japan', 'Japón'), flag: '🇯🇵' },
    'KR': { name: t('countries.southKorea', 'Corea del Sur'), flag: '🇰🇷' }
  };

  useEffect(() => {
    if (!tmdbId || !mediaType) return;
    setLoading(true);
    setError('');
    
    // Cargar plataformas para todos los países disponibles
    fetch(`${BACKEND_URL}/tmdb/${mediaType}/${tmdbId}/watch/providers`)
      .then(res => res.ok ? res.json() : res.json().then(err => { throw new Error(err.status_message || 'Error TMDb'); }))
      .then(data => {
        const results = data.results || {};
        setAvailableCountries(Object.keys(results));
        setProviders(results[selectedCountry] || null);
      })
      .catch(() => setError(t('streaming.errorLoading', 'No se pudo obtener disponibilidad en streaming.')));
    
    // Cargar external_ids para enlaces directos
    fetch(`${BACKEND_URL}/tmdb/${mediaType}/${tmdbId}/external_ids`)
      .then(res => res.ok ? res.json() : {})
      .then(setExternalIds)
      .catch(() => setExternalIds(null))
      .finally(() => setLoading(false));
  }, [tmdbId, mediaType]);

  // Actualizar providers cuando cambie el país seleccionado
  useEffect(() => {
    if (!tmdbId || !mediaType) return;
    
    fetch(`${BACKEND_URL}/tmdb/${mediaType}/${tmdbId}/watch/providers`)
      .then(res => res.ok ? res.json() : {})
      .then(data => {
        const results = data.results || {};
        setProviders(results[selectedCountry] || null);
      })
      .catch(() => setProviders(null));
  }, [selectedCountry, tmdbId, mediaType]);

  if (!tmdbId || !mediaType) return null;

  // Función para obtener información de calidad de streaming
  const getStreamingQuality = (provider) => {
    const hdProviders = ['netflix', 'amazon prime video', 'disney plus', 'apple tv plus', 'hbo max'];
    const provider_name = provider.provider_name?.toLowerCase() || '';
    
    if (hdProviders.some(hd => provider_name.includes(hd))) {
      return { quality: 'HD/4K', badge: '4K' };
    }
    return { quality: 'HD', badge: 'HD' };
  };

  // Función para obtener el precio real de la plataforma
  const getProviderPrice = (provider, tipo) => {
    // Si el provider tiene información de precio de TMDb
    if (provider.price) {
      const currency = selectedCountry === 'ES' ? '€' : selectedCountry === 'US' ? '$' : '$';
      return `${provider.price}${currency}`;
    }
    
    // Precios conocidos por plataforma y país (datos reales aproximados)
    const realPrices = {
      'netflix': { 
        flat: { ES: '12.99€/mes', US: '$15.49/mo', default: '~$12/mo' }
      },
      'amazon prime video': { 
        flat: { ES: '4.99€/mes', US: '$8.99/mo', default: '~$8/mo' },
        rent: { ES: '3.99€', US: '$3.99', default: '~$4' },
        buy: { ES: '9.99€', US: '$14.99', default: '~$12' }
      },
      'prime video': { 
        flat: { ES: '4.99€/mes', US: '$8.99/mo', default: '~$8/mo' },
        rent: { ES: '3.99€', US: '$3.99', default: '~$4' },
        buy: { ES: '9.99€', US: '$14.99', default: '~$12' }
      },
      'disney plus': { 
        flat: { ES: '8.99€/mes', US: '$7.99/mo', default: '~$8/mo' }
      },
      'disney+': { 
        flat: { ES: '8.99€/mes', US: '$7.99/mo', default: '~$8/mo' }
      },
      'apple tv plus': { 
        flat: { ES: '6.99€/mes', US: '$6.99/mo', default: '~$7/mo' }
      },
      'apple tv+': { 
        flat: { ES: '6.99€/mes', US: '$6.99/mo', default: '~$7/mo' }
      },
      'hbo max': { 
        flat: { ES: '8.99€/mes', US: '$9.99/mo', default: '~$9/mo' }
      },
      'filmin': { 
        flat: { ES: '7.99€/mes', US: '$7.99/mo', default: '~$8/mo' }
      },
      'movistar plus': { 
        flat: { ES: '8€/mes', US: '$8/mo', default: '~$8/mo' }
      },
      'rakuten tv': { 
        rent: { ES: '3.99€', US: '$3.99', default: '~$4' },
        buy: { ES: '9.99€', US: '$12.99', default: '~$10' }
      },
      'google play movies': { 
        rent: { ES: '3.99€', US: '$3.99', default: '~$4' },
        buy: { ES: '9.99€', US: '$12.99', default: '~$10' }
      },
      'microsoft store': { 
        rent: { ES: '3.99€', US: '$3.99', default: '~$4' },
        buy: { ES: '9.99€', US: '$12.99', default: '~$10' }
      },
      'youtube': { 
        rent: { ES: '3.99€', US: '$3.99', default: '~$4' },
        buy: { ES: '9.99€', US: '$12.99', default: '~$10' }
      },
      'youtube movies': { 
        rent: { ES: '3.99€', US: '$3.99', default: '~$4' },
        buy: { ES: '9.99€', US: '$12.99', default: '~$10' }
      }
    };
    
    const providerName = provider.provider_name?.toLowerCase();
    const providerPrices = realPrices[providerName];
    
    if (providerPrices && providerPrices[tipo]) {
      const typePrices = providerPrices[tipo];
      return typePrices[selectedCountry] || typePrices.default || t('streaming.priceNotAvailable', 'Precio no disponible');
    }
    
    // Fallback a precios genéricos si no tenemos datos específicos
    const fallbackPrices = {
      'flat': { ES: '~8€/mes', US: '~$8/mo', default: '~$8/mo' },
      'rent': { ES: '~4€', US: '~$4', default: '~$4' },
      'buy': { ES: '~10€', US: '~$10', default: '~$10' }
    };
    
    const fallback = fallbackPrices[tipo];
    return fallback[selectedCountry] || fallback.default;
  };

  // Renderiza los iconos de plataformas con funcionalidad mejorada
  const renderProviders = (arr, tipo) => {
    const displayProviders = showAllProviders ? arr : arr.slice(0, 6);
    const hasMore = arr.length > 6;

    return (
      <div className="streaming-category-enhanced">
        <div className="streaming-category-header-enhanced">
          <div className="category-info">
            <span className="streaming-category-icon-enhanced">
              {tipo === 'flat' ? '📺' : tipo === 'rent' ? '💰' : '🛒'}
            </span>
            <div className="category-details">
              <span className="streaming-category-label-enhanced">
                {tipo === 'flat' ? t('detailModal.subscription') : tipo === 'rent' ? t('detailModal.rental') : t('detailModal.purchase')}
              </span>
            </div>
          </div>
          <div className="category-count">
            {arr.length} {arr.length === 1 ? t('streaming.platform', 'plataforma') : t('streaming.platforms', 'plataformas')}
          </div>
        </div>
        
        <div className="streaming-provider-grid-enhanced">
          {displayProviders.map(p => {
            const directLink = getPlatformLink(p, externalIds, mediaType);
            const homeLink = !directLink ? getPlatformHome(p.provider_name) : null;
            const quality = getStreamingQuality(p);
            const hasLink = directLink || homeLink;
            
            return (
              <div key={p.provider_id} className={`streaming-provider-card ${!hasLink ? 'disabled' : ''}`}>
                {hasLink ? (
                  <a
                    href={directLink || homeLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="provider-link-enhanced"
                  >
                    <div className="provider-image-container">
                      <img
                        src={`https://image.tmdb.org/t/p/w92${p.logo_path}`}
                        alt={p.provider_name}
                        className="streaming-provider-icon-enhanced"
                        loading="lazy"
                      />
                      <div className="quality-badge">{quality.badge}</div>
                      {directLink && <div className="direct-link-indicator">🔗</div>}
                    </div>
                    <div className="provider-info">
                      <span className="provider-name">{p.provider_name}</span>
                      <div className="provider-details">
                        <span className="provider-type">
                          {tipo === 'flat' ? t('detailModal.subscription') : tipo === 'rent' ? t('detailModal.rental') : t('detailModal.purchase')}
                        </span>
                        <span className="provider-price">
                          {getProviderPrice(p, tipo)}
                        </span>
                      </div>
                    </div>
                  </a>
                ) : (
                  <div className="provider-link-enhanced disabled">
                    <div className="provider-image-container">
                      <img
                        src={`https://image.tmdb.org/t/p/w92${p.logo_path}`}
                        alt={p.provider_name}
                        className="streaming-provider-icon-enhanced"
                        loading="lazy"
                      />
                      <div className="quality-badge">{quality.badge}</div>
                      <div className="no-link-indicator">❌</div>
                    </div>
                    <div className="provider-info">
                      <span className="provider-name">{p.provider_name}</span>
                      <div className="provider-details">
                        <span className="provider-type">{t('streaming.noLink', 'Sin enlace')}</span>
                        <span className="provider-price">
                          {getProviderPrice(p, tipo)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        
        {hasMore && (
          <button
            className="show-more-providers-btn"
            onClick={() => setShowAllProviders(!showAllProviders)}
          >
            <i className={`fas ${showAllProviders ? 'fa-chevron-up' : 'fa-chevron-down'}`}></i>
            {showAllProviders 
              ? ` ${t('streaming.showLess', 'Mostrar menos')}` 
              : ` ${t('streaming.seeMore', 'Ver {{count}} más').replace('{{count}}', arr.length - 6)}`
            }
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="streaming-availability-enhanced">
      {/* Selector de país */}
      {availableCountries.length > 1 && (
        <div className="country-selector">
          <div className="selector-label">
            <span className="selector-icon"><i className="fas fa-globe"></i></span>
            <span>{t('streaming.availabilityByRegion', 'Disponibilidad por región')}:</span>
          </div>
          <select
            value={selectedCountry}
            onChange={(e) => setSelectedCountry(e.target.value)}
            className="country-dropdown"
          >
            {availableCountries
              .filter(code => countries[code])
              .map(code => (
                <option key={code} value={code}>
                  {countries[code].flag} {countries[code].name}
                </option>
              ))
            }
          </select>
        </div>
      )}

      <div className="streaming-content-enhanced">
        {loading && (
          <div className="streaming-loading-enhanced">
            <div className="loading-spinner-enhanced"></div>
            <span><i className="fas fa-sync-alt fa-spin"></i> {t('detailModal.loading')}</span>
          </div>
        )}
        
        {error && (
          <div className="streaming-error-enhanced">
            <span className="error-icon-enhanced">⚠️</span>
            <span>{error}</span>
          </div>
        )}
        
        {!loading && !error && providers && (
          <div className="streaming-providers-container">
            {providers.flatrate && providers.flatrate.length > 0 && renderProviders(providers.flatrate, 'flat')}
            {providers.rent && providers.rent.length > 0 && renderProviders(providers.rent, 'rent')}
            {providers.buy && providers.buy.length > 0 && renderProviders(providers.buy, 'buy')}
            
            {!providers.flatrate && !providers.rent && !providers.buy && (
              <div className="streaming-none-enhanced">
                <div className="none-icon">🚫</div>
                <div className="none-content">
                  <h4>{t('streaming.notAvailableOnPlatforms', 'No disponible en plataformas')}</h4>
                  <p>{t('streaming.notAvailableInRegion', 'Este contenido no está disponible en plataformas de streaming en {{region}}.').replace('{{region}}', countries[selectedCountry]?.name || t('streaming.thisRegion', 'esta región'))}</p>
                  {availableCountries.length > 1 && (
                    <p className="suggestion">💡 {t('streaming.tryChangingRegion', 'Prueba cambiando a otra región arriba')}</p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
        
        {!loading && !error && !providers && (
          <div className="streaming-none-enhanced">
            <div className="none-icon"><i className="fas fa-ban"></i></div>
            <div className="none-content">
              <h4>{t('streaming.notAvailable', 'No disponible')}</h4>
              <p>{t('streaming.noStreamingInfoFound', 'No se encontró información de streaming para {{region}}.').replace('{{region}}', countries[selectedCountry]?.name || t('streaming.thisRegion', 'esta región'))}</p>
            </div>
          </div>
        )}

        {/* Información adicional */}
        {!loading && providers && (
          <div className="streaming-footer-info">
            <div className="info-item-small">
              <span className="info-icon"><i className="fas fa-info-circle"></i></span>
              <span>{t('streaming.pricesEstimated', 'Los precios son estimados y pueden variar')}</span>
            </div>
            <div className="info-item-small">
              <span className="info-icon">🔗</span>
              <span>{t('streaming.directLinksOpen', 'Los enlaces directos abren en la plataforma correspondiente')}</span>
            </div>
            <div className="info-item-small">
              <span className="info-icon">📱</span>
              <span>{t('streaming.availabilityUpdated', 'Disponibilidad actualizada desde TMDb')}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

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
    <div className="similares-item-page">
      {loading ? (
        <PosterSkeleton width="100%" height="100%" />
      ) : (
        <img
          src={posterUrl}
          alt={item.titulo}
          className="similares-img-page"
          onClick={handleClick}
          style={{ cursor: 'pointer' }}
        />
      )}
    </div>
  );
}

function DetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Función auxiliar para peticiones autenticadas con JWT
  const authenticatedFetch = (url, options = {}) => {
    const jwtToken = localStorage.getItem('jwt_token');
    return fetch(url, {
      ...options,
      headers: {
        ...(options.headers || {}),
        ...(jwtToken ? { 'Authorization': `Bearer ${jwtToken}` } : {})
      }
    });
  };
  
  const [media, setMedia] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  // Estados para TMDb
  const [tmdbDetails, setTmdbDetails] = useState(null);
  const [tmdbLoading, setTmdbLoading] = useState(false);
  const [tmdbError, setTmdbError] = useState('');
  
  // Estados para similares
  const [similares, setSimilares] = useState([]);
  const [loadingSimilares, setLoadingSimilares] = useState(false);
  const [errorSimilares, setErrorSimilares] = useState('');
  const carouselRef = useRef(null);
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);
  const isMobile = window.innerWidth <= 768;
  
  // Estados para notas
  const [editingNotes, setEditingNotes] = useState(false);
  const [notes, setNotes] = useState('');
  const [tempNotes, setTempNotes] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);
  const [notesError, setNotesError] = useState('');
  
  // Estados para rating personal
  const [editingRating, setEditingRating] = useState(false);
  const [personalRating, setPersonalRating] = useState('');
  const [tempRating, setTempRating] = useState('');
  const [savingRating, setSavingRating] = useState(false);
  
  // Estados para favoritos/pendientes
  const [favorito, setFavorito] = useState(false);
  const [pendiente, setPendiente] = useState(false);
  
  // Estados para listas
  const [showListasModal, setShowListasModal] = useState(false);
  const [listas, setListas] = useState([]);
  const [listasDeMedia, setListasDeMedia] = useState([]);
  
  // Estados para tags
  const [showTagsManager, setShowTagsManager] = useState(false);
  const [allTags, setAllTags] = useState([]);
  const [localTags, setLocalTags] = useState([]);
  const [tagSearch, setTagSearch] = useState('');
  const [tempSelectedTagIds, setTempSelectedTagIds] = useState([]);
  const [showAllTags, setShowAllTags] = useState(false);
  
  const { t, currentLanguage } = useLanguage();
  
  // Hook para contenido traducido
  const { translatedMedia, isTranslating } = useTranslatedContent(media);
  const displayMedia = translatedMedia || media;
  
  // Hook para portada dinámica
  const mediaType = media?.tipo?.toLowerCase().includes('serie') ? 'tv' : 'movie';
  const { posterUrl } = useDynamicPoster(media?.tmdb_id, mediaType, media?.imagen);
  
  // Función para traducir el estado
  const translateStatus = (status) => {
    if (!status) return '';
    const statusKey = status.toLowerCase().replace(/\s+/g, '');
    return t(`status.${statusKey}`, status);
  };
  
  // Mapear idioma para TMDb API
  const getTmdbLanguage = (lang) => {
    switch (lang) {
      case 'en': return 'en-US';
      case 'es': return 'es-ES';
      default: return 'en-US';
    }
  };

  // Cargar datos del media
  useEffect(() => {
    const fetchMedia = async () => {
      try {
        setLoading(true);
        const response = await authenticatedFetch(`${BACKEND_URL}/medias/${id}`);
        if (!response.ok) {
          throw new Error(t('errors.mediaNotFound', 'Media no encontrado'));
        }
        const data = await response.json();
        setMedia(data);
        setFavorito(data.favorito || false);
        setPendiente(data.pendiente || false);
        setNotes(data.anotacion_personal || '');
        setTempNotes(data.anotacion_personal || '');
        setPersonalRating(data.nota_personal || '');
        setTempRating(data.nota_personal || '');
        setLocalTags(Array.isArray(data.tags) ? data.tags : []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchMedia();
    }
  }, [id]);

  // Cargar detalles de TMDb
  useEffect(() => {
    if (!media) return;
    
    const tmdbLang = getTmdbLanguage(currentLanguage);
    setTmdbLoading(true);
    setTmdbError('');

    if (media.tmdb_id && media.tipo) {
      const mediaType = media.tipo.toLowerCase() === 'serie' ? 'tv' : 'movie';
      fetch(`${TMDB_URL}?id=${media.tmdb_id}&media_type=${mediaType}&language=${tmdbLang}`)
        .then(res => res.ok ? res.json() : res.json().then(err => { throw new Error(err.detail); }))
        .then(setTmdbDetails)
        .catch(() => setTmdbError(t('errors.couldNotLoadTmdbDetails', 'No se pudo cargar detalles avanzados TMDb')))
        .finally(() => setTmdbLoading(false));
    } else {
      const tipo = typeof media.tipo === 'string' && media.tipo.toLowerCase() === 'serie' ? 'serie' : 'película';
      fetch(`${TMDB_URL}?title=${encodeURIComponent(media.titulo)}&tipo_preferido=${encodeURIComponent(tipo)}&language=${tmdbLang}`)
        .then(res => res.ok ? res.json() : res.json().then(err => { throw new Error(err.detail); }))
        .then(setTmdbDetails)
        .catch(() => setTmdbError(t('errors.couldNotLoadTmdbDetails', 'No se pudo cargar detalles avanzados TMDb')))
        .finally(() => setTmdbLoading(false));
    }
  }, [media, currentLanguage]);

  // Cargar similares
  useEffect(() => {
    if (!media || !media.id) {
      setSimilares([]);
      return;
    }
    
    setLoadingSimilares(true);
    setErrorSimilares('');
    
    authenticatedFetch(`${BACKEND_URL}/medias/${media.id}/similares`)
      .then(res => res.ok ? res.json() : res.json().then(err => { throw new Error(err.detail || 'Error'); }))
      .then(data => setSimilares(Array.isArray(data) ? data : []))
      .catch(() => setErrorSimilares(t('errors.couldNotLoadSimilar', 'No se pudieron cargar similares.')))
      .finally(() => setLoadingSimilares(false));
  }, [media]);

  // Cargar tags y listas
  useEffect(() => {
    // Cargar todos los tags
    authenticatedFetch(`${BACKEND_URL}/tags`)
      .then(res => res.ok ? res.json() : [])
      .then(setAllTags)
      .catch(() => setAllTags([]));
      
    // Cargar listas
    authenticatedFetch(`${BACKEND_URL}/listas`)
      .then(res => res.ok ? res.json() : [])
      .then(data => {
        setListas(data);
        if (media) {
          setListasDeMedia(
            data.filter(lista => Array.isArray(lista.medias) && lista.medias.some(m => m.id === media.id)).map(l => l.id)
          );
        }
      })
      .catch(() => setListas([]));
  }, [media]);

  // Funciones para manejo de favoritos/pendientes
  const handleToggleFavorite = async () => {
    try {
      const response = await authenticatedFetch(`${BACKEND_URL}/medias/${media.id}/favorito?favorito=${!favorito}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' }
      });
      if (response.ok) {
        setFavorito(!favorito);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const handleTogglePending = async () => {
    try {
      const response = await authenticatedFetch(`${BACKEND_URL}/medias/${media.id}/pendiente?pendiente=${!pendiente}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' }
      });
      if (response.ok) {
        setPendiente(!pendiente);
      }
    } catch (error) {
      console.error('Error toggling pending:', error);
    }
  };

  // Funciones para manejo de notas
  const handleSaveNotes = async () => {
    if (savingNotes) return;
    
    setSavingNotes(true);
    setNotesError('');

    try {
      const response = await authenticatedFetch(`${BACKEND_URL}/medias/${media.id}/anotacion_personal`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        // Backend expects a plain JSON string, not an object wrapper
        body: JSON.stringify(tempNotes)
      });
      
      if (!response.ok) throw new Error(t('errors.errorSaving', 'Error al guardar'));
      
      const updatedMedia = await response.json();
      setNotes(tempNotes);
      setEditingNotes(false);
      setMedia(updatedMedia);
    } catch (error) {
      setNotesError(t('errors.errorSavingNotes', 'Error al guardar las notas. Inténtalo de nuevo.'));
    } finally {
      setSavingNotes(false);
    }
  };

  // Funciones para manejo de rating
  const handleSaveRating = async () => {
    if (savingRating) return;
    
    setSavingRating(true);

    try {
      const response = await authenticatedFetch(`${BACKEND_URL}/medias/${media.id}/nota_personal`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parseFloat(tempRating) || null)
      });
      
      if (!response.ok) throw new Error(t('errors.errorSaving', 'Error al guardar'));
      
      const updatedMedia = await response.json();
      setPersonalRating(tempRating);
      setEditingRating(false);
      setMedia(updatedMedia);
    } catch (error) {
      console.error('Error saving rating:', error);
    } finally {
      setSavingRating(false);
    }
  };

  // Funciones para tags
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
        await authenticatedFetch(`${BACKEND_URL}/medias/${media.id}/tags`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tag_id: id })
        });
      }
      for (const id of toRemove) {
        await authenticatedFetch(`${BACKEND_URL}/medias/${media.id}/tags/${id}`, {
          method: 'DELETE'
        });
      }

      // Reconsultar el media
      const res = await authenticatedFetch(`${BACKEND_URL}/medias/${media.id}`);
      if (res.ok) {
        const updated = await res.json();
        setLocalTags(Array.isArray(updated.tags) ? updated.tags : []);
        setMedia(updated);
      }

      setShowTagsManager(false);
    } catch (error) {
      console.error('Error managing tags:', error);
    }
  };

  // Función para eliminar media
  const handleDelete = async () => {
    try {
      const response = await authenticatedFetch(`${BACKEND_URL}/medias/${media.id}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        navigate('/');
      }
    } catch (error) {
      console.error('Error deleting media:', error);
    }
  };

  // Funciones de navegación del navbar
  const handleNavigation = (section) => {
    navigate(`/?section=${section}`);
  };

  const handleSearch = (searchTerm) => {
    navigate(`/?search=${encodeURIComponent(searchTerm)}`);
  };

  // Función para actualizar similares cuando se hace click
  const handleSimilarClick = (similarItem) => {
    navigate(`/detail/${similarItem.id}`);
  };

  // Filtros para tags
  const normalize = (s) => (s || '').toString().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const filteredAllTags = tagSearch ? allTags.filter(t => normalize(t.nombre).includes(normalize(tagSearch))) : allTags;

  if (loading) {
    return (
      <div className="detail-page">
        <Navbar onSection={handleNavigation} onSearch={handleSearch} searchValue="" />
        <div className="detail-page-loading">
          <div className="loading-spinner"></div>
          <h2><i className="fas fa-sync-alt fa-spin"></i> {t('detailModal.loadingAdvancedDetails')}</h2>
        </div>
      </div>
    );
  }

  if (error || !media) {
    return (
      <div className="detail-page">
        <Navbar onSection={handleNavigation} onSearch={handleSearch} searchValue="" />
        <div className="detail-page-error">
          <h2>Error</h2>
          <p>{error || t('errors.mediaNotFound', 'Media no encontrado')}</p>
          <button className="back-btn" onClick={() => navigate('/')}>
            ← {t('actions.backToHome', 'Volver al inicio')}
          </button>
        </div>
      </div>
    );
  }

  const hasNotes = notes && notes.trim() !== '';
  const hasNewNotes = tempNotes && tempNotes.trim() !== '';
  const wordCount = hasNotes ? notes.trim().split(/\s+/).length : 0;

  return (
    <div className="detail-page">
      {/* Navbar */}
      <Navbar onSection={handleNavigation} onSearch={handleSearch} searchValue="" />
      
      {/* Indicador de traducción */}
      {isTranslating && (
        <div className="translation-indicator" style={{
          position: 'fixed',
          top: '80px',
          right: '20px',
          background: 'rgba(25, 118, 210, 0.9)',
          color: 'white',
          padding: '8px 16px',
          borderRadius: '8px',
          fontSize: '0.9rem',
          zIndex: 1001,
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
        }}>
          🌐 {t('messages.translating')}...
        </div>
      )}

      {/* Contenido principal */}
      <div className="detail-page-content">
        <div className="detail-page-main">
          {/* Información principal */}
          <div className="detail-page-info">
            <div className="poster-section">
              <div className="poster-container">
                <img src={posterUrl} alt={displayMedia.titulo} className="detail-poster" />
                
                {/* Badges de nota TMDb y personal (clases unificadas tipo "card") */}
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

              {/* Acciones del poster */}
              <div className="poster-actions">
                <button 
                  className={`action-btn ${pendiente ? 'pending-active' : ''}`} 
                  onClick={handleTogglePending}
                >
                  <i className={`fas ${pendiente ? 'fa-check-circle' : 'fa-clock'}`}></i> {pendiente ? t('detailModal.removeFromPending') : t('detailModal.addToPending')}
                </button>
                
                <button 
                  className={`action-btn ${favorito ? 'favorite-active' : ''}`} 
                  onClick={handleToggleFavorite}
                >
                  <i className="fas fa-heart" style={{color: favorito ? '#e91e63' : '#fff'}}></i> {favorito ? t('detailModal.removeFromFavorites') : t('detailModal.addToFavorites')}
                </button>
                
                <button className="action-btn" onClick={() => setShowListasModal(true)}>
                  <i className="fas fa-folder-plus"></i> {t('detailModal.addToList')}
                </button>
                
                {/* Editor de nota personal */}
                {editingRating ? (
                  <div className="nota-editor">
                    <input
                      type="number"
                      className="nota-input"
                      value={tempRating}
                      onChange={(e) => setTempRating(e.target.value)}
                      placeholder="0-10"
                      min="0"
                      max="10"
                      step="0.1"
                    />
                    <button 
                      className="action-btn"
                      onClick={handleSaveRating}
                      disabled={savingRating}
                    >
                      <i className={`fas ${savingRating ? 'fa-spinner fa-spin' : 'fa-save'}`}></i>
                    </button>
                    <button 
                      className="action-btn"
                      onClick={() => {
                        setTempRating(personalRating);
                        setEditingRating(false);
                      }}
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                ) : (
                  <button className="action-btn" onClick={() => setEditingRating(true)}>
                    <i className="fas fa-star" style={{color: '#f1c708ff'}}></i> {t('detailModal.rate', 'Valorar')}
                  </button>
                )}
                
                <button className="action-btn delete-btn" onClick={() => setShowDeleteConfirm(true)}>
                  <i className="fas fa-trash-alt"></i> {t('detailModal.delete')}
                </button>
              </div>
            </div>

            <div className="media-info">
              <h2 className="media-title">
                {displayMedia.titulo}
              </h2>
              <div className="media-year">({displayMedia.anio})</div>

              {/* Información completa en un solo bloque como DetailModal */}
              <div className="media-info-complete">
                <div className="info-row">
                  <span className="info-label">{t('detailModal.genre')}:</span>
                  <span className="info-value">{displayMedia.genero}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">{t('detailModal.director')}:</span>
                  <span className="info-value">{displayMedia.director}</span>
                </div>
                <div className="info-row cast-row">
                  <CastSection 
                    tmdbId={media.tmdb_id} 
                    mediaType={media.tipo} 
                    fallbackCast={displayMedia.elenco}
                  />
                </div>
                <div className="info-row">
                  <span className="info-label">{t('detailModal.status')}:</span>
                  <span className="info-value">{translateStatus(displayMedia.estado)}</span>
                </div>
              </div>

              {displayMedia.sinopsis && (
                <div className="media-description">
                  <h3>{t('detailModal.synopsis')}</h3>
                  <p>{displayMedia.sinopsis}</p>
                </div>
              )}

              {/* Disponibilidad en streaming */}
              {media.tmdb_id && media.tipo && (
                <div className="streaming-block-main">
                  <h4>📺 {t('detailModal.streamingAvailabilityTitle')}</h4>
                  <StreamingAvailability tmdbId={media.tmdb_id} mediaType={media.tipo.toLowerCase() === 'serie' ? 'tv' : 'movie'} country="ES" />
                </div>
              )}
            </div>
          </div>

          {/* Sección de similares */}
          <div className="similares-block-page">
            <h3><i className="fas fa-film"></i> {t('detailModal.similar')}</h3>
            {loadingSimilares && (
              <div className="similares-cargando-page">
                <div className="similares-spinner-page"></div>
                <div style={{marginTop: 10, fontWeight: 500, color: '#1976d2'}}><i className="fas fa-search"></i> {t('detailModal.searchingMatches')}</div>
              </div>
            )}
            {errorSimilares && (
              <div className="similares-error-page"><i className="fas fa-exclamation-triangle"></i> {errorSimilares}</div>
            )}
            {!loadingSimilares && similares.length === 0 && !errorSimilares && (
              <div className="similares-vacio-page"><i className="fas fa-info-circle"></i> {t('detailModal.noSimilarTitles')}</div>
            )}
            {!loadingSimilares && similares.length > 0 && (
              <div
                className="similares-carousel-page"
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
                    onUpdate={handleSimilarClick}
                    isDraggingRef={isDraggingRef}
                    isMobile={isMobile}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="detail-page-sidebar">
          {/* Información de TMDb */}
          {(tmdbLoading || tmdbDetails) && (
            <div className="tmdb-info-block-page">
              <h4>{t('detailModal.additionalInfo', 'Información adicional')}</h4>
              
              {tmdbLoading && <div>{t('detailModal.loadingAdvancedDetails')}</div>}
              {tmdbError && <div style={{ color: '#ff4c4c' }}>{tmdbError}</div>}
              {tmdbDetails && <TMDBDetails tmdbDetails={tmdbDetails} media={media} />}
              
              {tmdbDetails && tmdbDetails.trailer && (
                <div className="trailer-block-page">
                  <div className="info-item">
                    <span className="label">{t('detailModal.trailer')}:</span>
                    {tmdbDetails.trailer.includes('youtube.com') || tmdbDetails.trailer.includes('youtu.be') ? (() => {
                      let videoId = null;
                      const ytMatch = tmdbDetails.trailer.match(/(?:youtube\.com\/(?:watch\?.*v=|embed\/)|youtu.be\/)([\w-]{11})/);
                      if (ytMatch && ytMatch[1]) videoId = ytMatch[1];
                      if (!videoId) {
                        const vMatch = tmdbDetails.trailer.match(/[?&]v=([\w-]{11})/);
                        if (vMatch && vMatch[1]) videoId = vMatch[1];
                      }
                      return videoId ? (
                        <iframe
                          width="100%"
                          height="200"
                          src={`https://www.youtube.com/embed/${videoId}`}
                          title={t('detailModal.youtubeTrailer')}
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          style={{ borderRadius: '8px', marginTop: '10px' }}
                        />
                      ) : (
                        <div style={{color:'#ff4c4c', marginTop:'10px'}}>{t('detailModal.couldNotExtractVideo')}</div>
                      );
                    })() : (
                      <div style={{color:'#ff4c4c', marginTop:'10px'}}>{t('detailModal.noTrailerAvailable')}</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tags */}
          <div className="tags-block-page">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <h4 style={{ margin: 0 }}>{t('detailModal.tags')}</h4>
              <button 
                className="action-btn"
                onClick={openTagsManager}
                style={{ padding: '6px 12px', fontSize: '0.8em' }}
              >
                🏷️ {t('detailModal.manage', 'Gestionar')}
              </button>
            </div>
            
            {(!localTags || localTags.length === 0) ? (
              <div style={{ textAlign: 'center', color: '#888', padding: '20px' }}>
                <div onClick={openTagsManager} style={{ cursor: 'pointer' }}>
                  <span style={{ fontSize: '2em' }}>➕</span>
                  <div>{t('detailModal.addFirstTag', 'Añadir primer tag')}</div>
                </div>
              </div>
            ) : (
              <div className="tags-grid-page">
                {(showAllTags ? localTags : localTags.slice(0, 8)).map(tag => (
                  <div className="tag-chip-page" key={tag.id}>
                    {typeof tag === 'string' ? tag : tag.nombre}
                  </div>
                ))}
                {localTags.length > 8 && (
                  <button 
                    className="tag-chip-page" 
                    onClick={() => setShowAllTags(!showAllTags)}
                    style={{ background: 'rgba(255,255,255,0.1)', cursor: 'pointer' }}
                  >
                    {showAllTags 
                      ? `${t('detailModal.showLess', 'Mostrar menos')}`
                      : `+${localTags.length - 8} ${t('detailModal.more', 'más')}`
                    }
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Notas personales en el sidebar */}
          <div className="notes-section-sidebar">
            <div className="notes-block-sidebar">
              <div className="notes-header-sidebar">
                <div className="notes-title-section-sidebar">
                  <div className="notes-icon">📝</div>
                  <h4 className="notes-title-sidebar">{t('detailModal.personalNotes', 'Notas Personales')}</h4>
                </div>
                
                {!editingNotes && (
                  <button className="notes-action-btn-sidebar" onClick={() => setEditingNotes(true)}>
                    <span className="btn-icon">✏️</span>
                    {hasNotes ? t('detailModal.edit', 'Editar') : t('detailModal.addNotes', 'Añadir')}
                  </button>
                )}
              </div>

              <div className="notes-content-sidebar">
                {editingNotes ? (
                  <div className="notes-editor-sidebar">
                    <textarea
                      className="notes-textarea-sidebar"
                      value={tempNotes}
                      onChange={(e) => setTempNotes(e.target.value)}
                      placeholder={t('detailModal.personalNotesPlaceholder', 'Escribe tus pensamientos, reseñas o cualquier detalle que quieras recordar...')}
                      rows={4}
                      autoFocus
                    />
                    
                    <div className="notes-editor-footer-sidebar">
                      {notesError && (
                        <span className="notes-error-sidebar">
                          <span className="error-icon">⚠️</span>
                          {notesError}
                        </span>
                      )}
                      
                      <div className="notes-editor-actions-sidebar">
                        <button 
                          className="notes-btn-sidebar notes-btn-cancel-sidebar" 
                          onClick={() => {
                            setTempNotes(notes);
                            setEditingNotes(false);
                            setNotesError('');
                          }}
                          disabled={savingNotes}
                        >
                          ❌
                        </button>
                        <button 
                          className="notes-btn-sidebar notes-btn-save-sidebar"
                          onClick={handleSaveNotes}
                          disabled={!hasNewNotes || savingNotes}
                        >
                          {savingNotes ? (
                            <span className="btn-spinner"></span>
                          ) : (
                            '💾'
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="notes-display-sidebar">
                    {hasNotes ? (
                      <div className="notes-text-content-sidebar">
                        <div className="notes-text-sidebar">
                          {notes.split('\n').slice(0, 3).map((line, index) => (
                            <p key={index} className="notes-paragraph-sidebar">
                              {line || '\u00A0'}
                            </p>
                          ))}
                          {notes.split('\n').length > 3 && (
                            <p className="notes-more-sidebar">... y {notes.split('\n').length - 3} líneas más</p>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="notes-empty-sidebar" onClick={() => setEditingNotes(true)}>
                        <div className="empty-icon-sidebar">📄</div>
                        <div className="empty-title-sidebar">
                          {t('detailModal.noNotesYet', 'Sin notas')}
                        </div>
                        <div className="empty-subtitle-sidebar">
                          {t('detailModal.clickToAdd', 'Haz clic para añadir')}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de confirmación de eliminación */}
      {showDeleteConfirm && (
        <div className="delete-confirm-overlay">
          <div className="delete-confirm-modal">
            <h3><i className="fas fa-exclamation-triangle"></i> {t('detailModal.deleteConfirmTitle')} {media.tipo}</h3>
            <p>{t('detailModal.deleteConfirmMessage', { tipo: media.tipo.toLowerCase() })}</p>
            <div className="delete-confirm-actions">
              <button className="btn-cancel" onClick={() => setShowDeleteConfirm(false)}>
                <i className="fas fa-times"></i> {t('detailModal.cancel')}
              </button>
              <button className="btn-delete" onClick={() => { handleDelete(); setShowDeleteConfirm(false); }}>
                <i className="fas fa-trash-alt"></i> {t('detailModal.delete')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de listas */}
      {showListasModal && (
        <ListasModal
          isOpen={showListasModal}
          onClose={() => setShowListasModal(false)}
          mediaId={media.id}
          onListChange={() => {
            // Recargar listas
            authenticatedFetch(`${BACKEND_URL}/listas`)
              .then(res => res.ok ? res.json() : [])
              .then(data => {
                setListas(data);
                setListasDeMedia(
                  data.filter(lista => Array.isArray(lista.medias) && lista.medias.some(m => m.id === media.id)).map(l => l.id)
                );
              });
          }}
        />
      )}

      {/* Modal de gestión de tags */}
      {showTagsManager && (
        <div className="tags-modal-overlay" onClick={(e) => { if (e.target.classList.contains('tags-modal-overlay')) setShowTagsManager(false); }}>
          <div className="tags-modal" onClick={(e) => e.stopPropagation()}>
            <div className="tags-modal-header">
              <div className="tags-modal-title">
                <span className="tags-modal-icon"><i className="fas fa-tags"></i></span>
                <h3>{t('detailModal.manageTags', 'Gestionar Tags')}</h3>
              </div>
              <button className="tags-modal-close" onClick={() => setShowTagsManager(false)}><i className="fas fa-times"></i></button>
            </div>
            
            <div className="tags-modal-content">
              <div className="tags-search-section">
                <div className="tags-search-container">
                  <span className="search-icon"><i className="fas fa-search"></i></span>
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
  );
}

// Componente TMDBDetails
const TMDBDetails = ({ tmdbDetails, media }) => {
  const { t } = useLanguage();
  
  return (
    <>
      {tmdbDetails.titulo_original && (
        <div className="info-item">
          <span className="label">{t('detailModal.originalTitle')}:</span>
          <span className="value">{tmdbDetails.titulo_original}</span>
        </div>
      )}
      {tmdbDetails.idioma_original && (
        <div className="info-item">
          <span className="label">{t('detailModal.originalLanguage')}:</span>
          <span className="value">{tmdbDetails.idioma_original.toUpperCase()}</span>
        </div>
      )}
      {tmdbDetails.generos && (
        <div className="info-item">
          <span className="label"><i className="fas fa-tags"></i> {t('detailModal.genres')}:</span>
          <span className="value">{tmdbDetails.generos}</span>
        </div>
      )}
      {tmdbDetails.pais && (
        <div className="info-item">
          <span className="label"><i className="fas fa-globe"></i> {t('detailModal.country')}:</span>
          <span className="value">{tmdbDetails.pais}</span>
        </div>
      )}
      {tmdbDetails.duracion && (
        <div className="info-item">
          <span className="label"><i className="fas fa-clock"></i> {t('detailModal.duration')}:</span>
          <span className="value">{tmdbDetails.duracion} min</span>
        </div>
      )}
      {media.tipo === 'película' && (
        <>
          {tmdbDetails.presupuesto !== undefined && tmdbDetails.presupuesto !== null && (
            <div className="info-item">
              <span className="label"><i className="fas fa-dollar-sign"></i> {t('detailModal.budget')}:</span>
              <span className="value">{tmdbDetails.presupuesto > 0 ? `$${tmdbDetails.presupuesto.toLocaleString('es-ES')}` : t('detailModal.notAvailable')}</span>
            </div>
          )}
          {tmdbDetails.recaudacion !== undefined && tmdbDetails.recaudacion !== null && (
            <div className="info-item">
              <span className="label"><i className="fas fa-chart-line"></i> {t('detailModal.revenue')}:</span>
              <span className="value">{tmdbDetails.recaudacion > 0 ? `$${tmdbDetails.recaudacion.toLocaleString('es-ES')}` : t('detailModal.notAvailable')}</span>
            </div>
          )}
        </>
      )}
      {media.tipo === 'serie' && tmdbDetails.temporadas_detalle?.length > 0 && (
        <div className="tmdb-seasons-block-page">
          <div className="info-item">
            <span className="label"><i className="fas fa-list-ol"></i> {t('detailModal.seasonsAndEpisodes')}:</span>
            <div className="seasons-list">
              {tmdbDetails.temporadas_detalle.map(season => (
                <details key={season.numero} className="season-detail">
                  <summary>{season.nombre} ({season.episodios.length} {t('detailModal.episodes')})</summary>
                  <ul className="episodes-list">
                    {season.episodios.map(ep => (
                      <li key={ep.numero} className="episode-item">
                        <strong>{ep.numero}. {ep.titulo}</strong>
                        {ep.fecha && <span> | <em>{ep.fecha}</em></span>}
                        {ep.resumen && <div className="episode-overview">{ep.resumen}</div>}
                      </li>
                    ))}
                  </ul>
                </details>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DetailPage;
