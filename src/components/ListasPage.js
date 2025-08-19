import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Select from 'react-select';
import { useLanguage } from '../context/LanguageContext';
import { useGenreTranslation } from '../utils/genreTranslation';
import { useDynamicPosters, getDynamicPosterUrl, useDynamicPoster } from '../hooks/useDynamicPoster';
import { useTranslatedMediaList } from '../hooks/useTranslatedContent';
import Navbar from './Navbar';
import DetailModal from './DetailModal';
import SectionRow from './SectionRow';
import './ListasPage.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "https://mi-catalogo-backend.onrender.com";

// Función para obtener backdrop de TMDB a través del backend
const getTMDBBackdrop = async (tmdbId, tipo) => {
  if (!tmdbId) return null;
  
  try {
    const mediaType = tipo.toLowerCase() === 'película' ? 'movie' : 'tv';
    
    // Usar el backend como proxy para la API de TMDB
    const response = await fetch(`${BACKEND_URL}/tmdb/${mediaType}/${tmdbId}`);
    
    if (!response.ok) {
      console.error('Error al obtener backdrop desde el backend:', response.status);
      return null;
    }
    
    const data = await response.json();
    
    if (data.backdrop_path) {
      return `https://image.tmdb.org/t/p/original${data.backdrop_path}`;
    }
    return null;
  } catch (error) {
    console.error('Error fetching TMDB backdrop:', error);
    return null;
  }
};

// Componente individual para cada preview poster con su propia portada dinámica
function PreviewPoster({ media, index }) {
  const mediaType = media.tipo?.toLowerCase().includes('serie') ? 'tv' : 'movie';
  const { posterUrl, loading } = useDynamicPoster(media.tmdb_id, mediaType, media.imagen);
  
  return (
    <div className="preview-poster" style={{ zIndex: 4 - index }}>
      <img 
        src={posterUrl} 
        alt={media.titulo}
        style={loading ? { opacity: 0.7 } : {}}
      />
    </div>
  );
}

// Componente individual para cada resultado de búsqueda con poster dinámico
function SearchResultItem({ media, onAdd, adding, t }) {
  const mediaType = media.tipo?.toLowerCase().includes('serie') ? 'tv' : 'movie';
  const { posterUrl, loading } = useDynamicPoster(media.tmdb_id, mediaType, media.imagen);
  const { translateGenre } = useGenreTranslation();
  
  // Función para traducir múltiples géneros separados por comas
  const translateGenres = (genresString) => {
    if (!genresString) return '';
    return genresString
      .split(',')
      .map(genre => translateGenre(genre.trim()))
      .join(', ');
  };
  
  return (
    <div className="lista-resultado-item">
      <img 
        src={posterUrl} 
        alt={media.titulo} 
        className="lista-resultado-poster"
        style={loading ? { opacity: 0.7 } : {}}
        onError={(e) => {
          e.target.src = 'https://via.placeholder.com/40x60/333/fff?text=N/A';
        }}
      />
      <div className="lista-resultado-info">
        <span className="lista-resultado-titulo">{media.titulo}</span>
        <span className="lista-resultado-detalles">
          {media.anio && `${media.anio}`}
          {media.anio && media.genero && ' • '}
          {translateGenres(media.genero)}
        </span>
      </div>
      <button
        className="lista-btn-add-item"
        onClick={() => onAdd(media)}
        disabled={adding}
      >
        <i className="fas fa-plus"></i>
        {t('lists.addToList')}
      </button>
    </div>
  );
}

// Componente para elementos editables con drag and drop
function EditableMediaItem({ media, index, onRemove, onDragStart, onDragOver, onDrop, isDragging, t }) {
  const mediaType = media.tipo?.toLowerCase().includes('serie') ? 'tv' : 'movie';
  const { posterUrl, loading } = useDynamicPoster(media.tmdb_id, mediaType, media.imagen);
  const { translateGenre } = useGenreTranslation();
  
  // Función para traducir múltiples géneros separados por comas
  const translateGenres = (genresString) => {
    if (!genresString) return '';
    return genresString
      .split(',')
      .map(genre => translateGenre(genre.trim()))
      .join(', ');
  };
  
  return (
    <div 
      className={`editable-media-item ${isDragging ? 'dragging' : ''}`}
      draggable
      onDragStart={(e) => onDragStart(e, index)}
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, index)}
    >
      <div className="editable-media-drag-handle">
        <i className="fas fa-grip-vertical"></i>
      </div>
      <img 
        src={posterUrl} 
        alt={media.titulo} 
        className="editable-media-poster"
        style={loading ? { opacity: 0.7 } : {}}
      />
      <div className="editable-media-info">
        <h4 className="editable-media-title" title={media.titulo}>{media.titulo}</h4>
        <p className="editable-media-details">
          {media.anio && `${media.anio}`}
          {media.anio && media.genero && ' • '}
          {translateGenres(media.genero)}
        </p>
      </div>
      <button
        className="editable-media-remove"
        onClick={() => onRemove(media.id)}
        title={t('lists.removeFromList')}
      >
        <i className="fas fa-trash"></i>
      </button>
    </div>
  );
}

export default function ListasPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentLanguage, t } = useLanguage();
  
  // Función para normalizar texto (insensible a tildes, mayúsculas, etc.)
  const normalize = (str) => {
    return (str || '').toString().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  };
  
  const [lista, setLista] = useState(null);
  const [medias, setMedias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [detalleMedia, setDetalleMedia] = useState(null);
  const [search, setSearch] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [adding, setAdding] = useState(false);
  const [sortBy, setSortBy] = useState('personal');
  const [viewMode, setViewMode] = useState('grid');
  const [heroBackdrop, setHeroBackdrop] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [savingOrder, setSavingOrder] = useState(false);
  const [draggedItem, setDraggedItem] = useState(null);

  // Opciones de ordenamiento con traducciones
  const sortOptions = [
    { value: 'personal', label: t('lists.sortByPersonal') },
    { value: 'recent', label: t('common.sortByRecent') },
    { value: 'title', label: t('common.sortByTitle') },
    { value: 'year', label: t('common.sortByYear') },
    { value: 'rating', label: t('common.sortByRating') }
  ];

  // Hook para contenido traducido
  const { translatedList: translatedMedias } = useTranslatedMediaList(medias);
  const { translatedList: translatedResults } = useTranslatedMediaList(results);
  
  // Hook para portadas dinámicas solo para la lista principal
  const { postersMap } = useDynamicPosters(translatedMedias || []);

  // Funciones de navegación
  const handleNavigation = (section) => {
    navigate('/');
  };

  const handleSearch = (query) => {
    // No implementamos búsqueda en esta página
  };

  // Helper para verificar si el token JWT es válido
  const isTokenValid = (token) => {
    if (!token) return false;
    
    try {
      // Decodificar el payload del JWT (sin verificar la firma)
      const payload = JSON.parse(atob(token.split('.')[1]));
      const now = Math.floor(Date.now() / 1000);
      
      // Verificar si el token ha expirado
      return payload.exp && payload.exp > now;
    } catch (e) {
      console.error('Error parsing JWT token:', e);
      return false;
    }
  };

  // Helper para peticiones autenticadas
  const authenticatedFetch = async (url, options = {}) => {
    const jwtToken = localStorage.getItem('jwt_token');
    
    if (!jwtToken || !isTokenValid(jwtToken)) {
      // Si no hay token o ha expirado, limpiar y redirigir
      localStorage.removeItem('jwt_token');
      console.log('Token inválido o expirado, redirigiendo...');
      navigate('/');
      return Promise.reject(new Error('No valid authentication token'));
    }
    
    const headers = {
      ...(options.headers || {}),
      Authorization: `Bearer ${jwtToken}`,
    };
    
    const response = await fetch(url, { ...options, headers });
    
    // Si obtenemos 401, el token ha expirado o es inválido
    if (response.status === 401) {
      localStorage.removeItem('jwt_token');
      console.log('Respuesta 401, token inválido, redirigiendo...');
      navigate('/');
      return Promise.reject(new Error('Authentication expired'));
    }
    
    return response;
  };

  // Aplicar portadas dinámicas y ordenamiento
  const finalMedias = React.useMemo(() => {
    // Siempre usar translatedMedias para obtener las traducciones
    // pero mantener la sincronización con el estado de medias para drag & drop
    const sourceMedias = translatedMedias;
    const positionMap = new Map((medias || []).map(m => [m.id, m.personal_position || 0]));
    
    if (!sourceMedias || !Array.isArray(sourceMedias)) return [];
    
    // En modo edición, reordenar translatedMedias según el orden actual de medias
    let sorted = sourceMedias;
    if (editMode && medias) {
      // Crear un mapa de orden basado en el estado actual de medias
      const orderMap = new Map(medias.map((media, index) => [media.id, index]));
      sorted = [...sourceMedias].sort((a, b) => {
        const orderA = orderMap.get(a.id) ?? Number.MAX_SAFE_INTEGER;
        const orderB = orderMap.get(b.id) ?? Number.MAX_SAFE_INTEGER;
        return orderA - orderB;
      });
    }
    
    // Aplicar portadas dinámicas
    sorted = sorted.map(media => {
      const dynamicUrl = getDynamicPosterUrl(media, postersMap);
      return {
        ...media,
        imagen: dynamicUrl
      };
    });

    // Si estamos en modo edición, no aplicar ordenamiento adicional (mantener orden actual para drag & drop)
    if (editMode) {
      return sorted;
    }

    switch (sortBy) {
      case 'personal':
  // Para orden personalizado, usar la posición actual desde el estado base
  sorted = sorted.sort((a, b) => (positionMap.get(a.id) || 0) - (positionMap.get(b.id) || 0));
        break;
      case 'title':
        sorted = sorted.sort((a, b) => (a.titulo || '').localeCompare(b.titulo || ''));
        break;
      case 'year':
        sorted = sorted.sort((a, b) => (b.anio || 0) - (a.anio || 0));
        break;
      case 'rating':
        sorted = sorted.sort((a, b) => (b.nota_personal || b.puntuacion || 0) - (a.nota_personal || a.puntuacion || 0));
        break;
      case 'recent':
      default:
        sorted = sorted.sort((a, b) => new Date(b.fecha_agregado || 0) - new Date(a.fecha_agregado || 0));
        break;
    }
    
    return sorted;
  }, [translatedMedias, postersMap, sortBy, editMode, medias]);

  // Cargar datos de la lista
  useEffect(() => {
    const loadLista = async () => {
      try {
  setLoading(true);
  setError(""); // limpiar errores previos para evitar parpadeos
        const response = await authenticatedFetch(`${BACKEND_URL}/listas/${id}`);

        if (response.ok) {
          const data = await response.json();
          setLista(data);
          setMedias(data.medias || []);
        } else {
          setError('Error al cargar la lista');
        }
      } catch (err) {
        setError('Error al cargar la lista');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadLista();
    }
  }, [id]);

  // Cargar backdrop para el hero
  useEffect(() => {
    const loadHeroBackdrop = async () => {
      if (finalMedias && finalMedias.length > 0) {
        const firstMedia = finalMedias[0];
        
        if (firstMedia.tmdb_id) {
          const backdrop = await getTMDBBackdrop(firstMedia.tmdb_id, firstMedia.tipo);
          setHeroBackdrop(backdrop || firstMedia.imagen);
        } else {
          setHeroBackdrop(firstMedia.imagen);
        }
      } else {
        setHeroBackdrop(null);
      }
    };

    loadHeroBackdrop();
  }, [finalMedias]);

  // Búsqueda de contenido del catálogo personal con normalización completa en frontend
  useEffect(() => {
    if (!search.trim()) {
      setResults([]);
      setSearching(false);
      return;
    }

    setSearching(true);
    
    const controller = new AbortController();
    const doSearch = async () => {
      try {
        // Obtener todo el catálogo del usuario para búsqueda local completa
        const url = `${BACKEND_URL}/medias?limit=1000`;
        const response = await authenticatedFetch(url, { signal: controller.signal });
        
        if (!response.ok) throw new Error('search_failed');
        
        const data = await response.json();
        const allMedias = Array.isArray(data) ? data : (data.items || []);
        
        // Filtrar completamente en el frontend con normalización robusta
        const currentMediaIds = new Set((medias || []).map(m => m.id));
        const searchNorm = normalize(search.trim());
        
        const filteredResults = allMedias.filter(media => {
          // Verificar que no esté ya en la lista actual
          if (currentMediaIds.has(media.id)) return false;
          
          // Buscar en múltiples campos con normalización completa
          const tituloNorm = normalize(media.titulo || '');
          const originalTitleNorm = normalize(media.original_title || '');
          const elencoNorm = normalize(media.elenco || '');
          const directorNorm = normalize(media.director || '');
          const generoNorm = normalize(media.genero || '');
          
          return tituloNorm.includes(searchNorm) || 
                 originalTitleNorm.includes(searchNorm) ||
                 elencoNorm.includes(searchNorm) ||
                 directorNorm.includes(searchNorm) ||
                 generoNorm.includes(searchNorm);
        });
        
        setResults(filteredResults);
      } catch (e) {
        if (e.name !== 'AbortError') {
          console.error('Error searching catalog:', e);
          setResults([]);
        }
      } finally {
        setSearching(false);
      }
    };

    const tId = setTimeout(doSearch, 450);
    return () => {
      controller.abort();
      clearTimeout(tId);
    };
  }, [search, medias]);

  // Función para agregar película/serie a la lista
  const handleAddToList = async (media) => {
    if (!id || !media || adding) return;
    
    try {
      setAdding(true);
      const response = await authenticatedFetch(`${BACKEND_URL}/listas/${id}/medias/${media.id}`, {
        method: 'POST',
      });
      
      if (!response.ok) throw new Error('add_failed');
      
      // Actualizar la lista local
      setMedias(prev => {
        const exists = prev.some(m => m.id === media.id);
        return exists ? prev : [...prev, media];
      });
      
      // Quitar de resultados de búsqueda
      setResults(prev => prev.filter(m => m.id !== media.id));
      
    } catch (e) {
      console.error('Error adding to list:', e);
    } finally {
      setAdding(false);
    }
  };

  // Función para eliminar película/serie de la lista
  const handleRemoveFromList = async (mediaId) => {
    if (!id || !mediaId || savingOrder) return;
    
    try {
      setSavingOrder(true);
      const response = await authenticatedFetch(`${BACKEND_URL}/listas/${id}/medias/${mediaId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) throw new Error('remove_failed');
      
      // Actualizar la lista local
      setMedias(prev => prev.filter(m => m.id !== mediaId));
      
    } catch (e) {
      console.error('Error removing from list:', e);
    } finally {
      setSavingOrder(false);
    }
  };

  // Función para reordenar elementos en la lista
  const handleReorder = (startIndex, endIndex) => {
    if (startIndex === endIndex) return;
    
    setMedias(prev => {
      const result = Array.from(prev);
      const [removed] = result.splice(startIndex, 1);
      result.splice(endIndex, 0, removed);
      return result;
    });
  };

  // Función para guardar el orden actual
  const handleSaveOrder = async () => {
    try {
      setSavingOrder(true);
      // Construir el orden a partir del estado actual (editMode usa 'medias' tal cual)
      const mediaIds = (medias || []).map(m => m.id);
      // Actualizar posiciones localmente para reflejar inmediatamente el nuevo orden
      const posMap = new Map(mediaIds.map((id, idx) => [id, idx + 1]));
      setMedias(prev => (prev || []).map(m => ({ ...m, personal_position: posMap.get(m.id) || 0 })));
      
      console.log('Enviando orden:', mediaIds);
      
      const response = await authenticatedFetch(`${BACKEND_URL}/listas/${id}/order`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mediaIds)
      });
      
      if (!response.ok) {
        console.error('Error response:', response.status, response.statusText);
        throw new Error('save_order_failed');
      }
      
      console.log('Orden guardado correctamente');
    } catch (e) {
      console.error('Error saving order:', e);
    } finally {
      setSavingOrder(false);
    }
  };

  // Función para toggle del modo edición
  const toggleEditMode = async () => {
    if (editMode) {
      // Al salir del modo edición, guardar el orden y esperar a que termine
      await handleSaveOrder();
      setEditMode(false);
      return;
    }
    setEditMode(true);
  };

  // Funciones para drag and drop
  const handleDragStart = (e, index) => {
    setDraggedItem(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    if (draggedItem !== null && draggedItem !== dropIndex) {
      handleReorder(draggedItem, dropIndex);
    }
    setDraggedItem(null);
  };

  // Estilos personalizados para react-select (iguales que en Filters.js)
  const customSelectStyles = {
    control: (base, state) => ({
      ...base,
      backgroundColor: 'transparent',
      background: 'linear-gradient(135deg, #2a2a2a 0%, #353535 100%)',
      borderColor: state.isFocused ? '#00e2c7' : 'rgba(0, 226, 199, 0.15)',
      minHeight: '44px',
      height: '44px',
      borderRadius: '12px',
      boxShadow: state.isFocused 
        ? '0 0 0 2px rgba(0, 226, 199, 0.2), 0 8px 24px rgba(0, 226, 199, 0.15)'
        : 'inset 0 1px 0 rgba(255, 255, 255, 0.05)',
      backdropFilter: 'blur(10px)',
      transition: 'all 0.3s ease',
      cursor: 'pointer',
      '&:hover': { 
        borderColor: 'rgba(0, 226, 199, 0.3)',
        boxShadow: '0 4px 16px rgba(0, 226, 199, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        transform: 'translateY(-2px)'
      }
    }),
    valueContainer: (base) => ({
      ...base,
      padding: '0 8px 0 12px',
      height: '44px'
    }),
    placeholder: (base) => ({
      ...base,
      color: 'rgba(255, 255, 255, 0.4)',
      fontStyle: 'italic',
      fontWeight: '500'
    }),
    singleValue: (base) => ({
      ...base,
      color: '#fff',
      fontWeight: '500'
    }),
    input: (base) => ({
      ...base,
      color: '#fff',
      margin: 0,
      padding: 0
    }),
    indicatorsContainer: (base) => ({
      ...base,
      height: '44px'
    }),
    dropdownIndicator: (base) => ({
      ...base,
      padding: '0 8px',
      color: '#00e2c7',
      transition: 'color 0.3s ease',
      '&:hover': {
        color: '#00b8a5'
      }
    }),
    clearIndicator: (base) => ({
      ...base,
      padding: '0 8px',
      color: '#00e2c7'
    }),
    menu: (base) => ({
      ...base,
      background: 'linear-gradient(135deg, #2a2a2a 0%, #353535 100%)',
      border: '1px solid rgba(0, 226, 199, 0.2)',
      borderRadius: '12px',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
      backdropFilter: 'blur(20px)',
      zIndex: 9999
    }),
    menuPortal: (base) => ({
      ...base,
      zIndex: 9999
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isFocused || state.isSelected 
        ? 'linear-gradient(135deg, #00e2c7 0%, #00b8a5 100%)' 
        : 'transparent',
      color: state.isFocused || state.isSelected ? '#181818' : '#fff',
      padding: '8px 12px',
      transition: 'all 0.2s ease',
      fontWeight: state.isSelected ? '600' : '500',
      cursor: 'pointer',
      // Corregir bordes redondeados para primera y última opción
      '&:first-of-type': {
        borderTopLeftRadius: '12px',
        borderTopRightRadius: '12px'
      },
      '&:last-of-type': {
        borderBottomLeftRadius: '12px',
        borderBottomRightRadius: '12px'
      }
    }),
    indicatorSeparator: () => ({
      display: 'none'
    })
  };

  if (loading) {
    return (
      <div className="listas-page">
        <Navbar onSection={handleNavigation} onSearch={handleSearch} searchValue="" />
        <div className="listas-page-container">
          <div className="listas-search-loading" style={{ padding: '40px 0' }}>
            <div className="loader"></div>
            <p>{t('common.loading')}</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="listas-page">
        <Navbar onSection={handleNavigation} onSearch={handleSearch} searchValue="" />
        <div className="listas-page-container">
          <div className="listas-error">
            <i className="fas fa-exclamation-triangle"></i>
            <h2>{t('common.error')}</h2>
            <p>{error || t('lists.notFound')}</p>
            <button className="lista-btn-back" onClick={() => navigate('/')} title={t('lists.backToCatalog')}>
              <i className="fas fa-arrow-left"></i>
              {t('lists.backToCatalog')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!lista) {
    return (
      <div className="listas-page">
        <Navbar onSection={handleNavigation} onSearch={handleSearch} searchValue="" />
        <div className="listas-page-container">
          <div className="listas-error">
            <i className="fas fa-exclamation-triangle"></i>
            <h2>{t('common.error')}</h2>
            <p>{t('lists.notFound')}</p>
            <button className="lista-btn-back" onClick={() => navigate('/')} title={t('lists.backToCatalog')}>
              <i className="fas fa-arrow-left"></i>
              {t('lists.backToCatalog')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="listas-page">
      <Navbar onSection={handleNavigation} onSearch={handleSearch} searchValue="" />
      
      <div className="listas-page-container">
        {/* Hero de la lista */}
        {(() => {
          return (
            <section className="lista-hero">
              <div className="lista-hero__bg" style={heroBackdrop ? { backgroundImage: `url(${heroBackdrop})` } : undefined} />
              <div className="lista-hero__overlay" />
              <div className="lista-hero__content">
                <div className="lista-hero__header">
                  <button className="lista-btn-back" onClick={() => navigate('/')} title={t('lists.backToCatalog')}>
                    <i className="fas fa-arrow-left"></i>
                    {t('lists.backToCatalog')}
                  </button>
                  <div className="lista-hero__breadcrumb">
                    <span className="breadcrumb-item">{t('lists.breadcrumbCatalog')}</span>
                    <i className="fas fa-chevron-right"></i>
                    <span className="breadcrumb-item current">{t('lists.breadcrumbLists')}</span>
                  </div>
                </div>
                <div className="lista-hero__main">
                  <div className="lista-hero__text">
                    <h1 className="lista-hero__title">{lista.nombre}</h1>
                    {lista.descripcion && (
                      <p className="lista-hero__subtitle">{lista.descripcion}</p>
                    )}
                    <div className="lista-hero__stats">
                      <div className="stat-item">
                        <i className="fas fa-film"></i>
                        <span className="stat-number">{finalMedias.length}</span>
                        <span className="stat-label">{t('lists.titles')}</span>
                      </div>
                      <div className="stat-separator"></div>
                      <div className="stat-item">
                        <i className="fas fa-calendar-alt"></i>
                        <span className="stat-text">{t('lists.created')} {new Date(lista.fecha_creacion).toLocaleDateString(currentLanguage === 'es' ? 'es-ES' : currentLanguage === 'en' ? 'en-US' : currentLanguage === 'pt' ? 'pt-PT' : currentLanguage === 'fr' ? 'fr-FR' : 'de-DE', { 
                          day: 'numeric', 
                          month: 'long', 
                          year: 'numeric' 
                        })}</span>
                      </div>
                    </div>
                  </div>
                  {finalMedias.length > 0 && (
                    <div className="lista-hero__metadata">
                      <div className="lista-hero__preview">
                        <div className="preview-posters">
                          {finalMedias.slice(0, 4).map((media, index) => (
                            <PreviewPoster 
                              key={media.id} 
                              media={media} 
                              index={index}
                            />
                          ))}
                          {finalMedias.length > 4 && (
                            <div className="preview-more">+{finalMedias.length - 4}</div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </section>
          );
        })()}

        {/* Toolbar: búsqueda + ordenación */}
        <div className="lista-toolbar">
          <div className="lista-toolbar__left">
            {finalMedias.length > 0 && (
              <button
                className={`lista-edit-toggle ${editMode ? 'active' : ''}`}
                onClick={toggleEditMode}
                disabled={savingOrder}
                title={editMode ? t('lists.exitEditMode') : t('lists.enterEditMode')}
              >
                <i className={`fas ${editMode ? 'fa-check' : 'fa-edit'}`}></i>
                {editMode ? t('lists.finishEditing') : t('lists.editList')}
              </button>
            )}
          </div>
          <div className="lista-toolbar__center">
            <div className="lista-toolbar-search">
              <i className="fas fa-search listas-search-icon"></i>
              <input
                type="text"
                className="listas-search-input"
                placeholder={t('lists.searchPlaceholder')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button
                  type="button"
                  className="listas-search-clear"
                  onClick={() => { setSearch(''); setResults([]); }}
                  aria-label={t('common.clear') || 'Clear search'}
                  title={t('common.clear') || 'Clear'}
                >
                  <i className="fas fa-times"></i>
                  <span className="listas-search-clear-label">{t('common.clear') || 'Clear'}</span>
                </button>
              )}
            </div>
          </div>
          <div className="lista-toolbar__right">
            <div className="listas-sort-container">
              <Select
                options={sortOptions}
                value={sortOptions.find(opt => opt.value === sortBy)}
                onChange={selected => setSortBy(selected ? selected.value : 'recent')}
                placeholder={t('lists.sortBy')}
                classNamePrefix="react-select"
                menuPortalTarget={typeof window !== 'undefined' ? document.body : null}
                menuPosition="fixed"
                isSearchable={false}
                styles={customSelectStyles}
              />
            </div>
          </div>
        </div>

        {/* Resultados de búsqueda */}
        {search && (
          <div className="listas-search-results">
            {searching ? (
              <div className="listas-search-loading">
                <div className="loader small"></div>
                <p>{t('lists.searching')}</p>
              </div>
            ) : translatedResults.length > 0 ? (
              <div className="listas-search-results-section">
                <h3 className="listas-search-title">
                  <i className="fas fa-search"></i>
                  {t('lists.searchResults')} ({translatedResults.length})
                </h3>
                <div className="listas-search-results-list">
                  {translatedResults.map(media => (
                    <SearchResultItem
                      key={media.id}
                      media={media}
                      onAdd={handleAddToList}
                      adding={adding}
                      t={t}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <div className="listas-no-results">
                <i className="fas fa-search"></i>
                <p>{t('lists.noResults')}</p>
              </div>
            )}
          </div>
        )}

        {/* Contenido de la lista */}
        <div className="listas-content">
          {finalMedias.length > 0 ? (
            editMode ? (
              <div className="editable-list-container">
                <div className="editable-list-header">
                  <h3 className="editable-list-title">
                    <i className="fas fa-edit"></i>
                    {t('lists.editingList')} ({finalMedias.length})
                  </h3>
                  <div className="editable-list-instructions">
                    <p>
                      <i className="fas fa-info-circle"></i>
                      {t('lists.editInstructions')}
                    </p>
                  </div>
                </div>
                <div className="editable-medias-grid">
                  {finalMedias.map((media, index) => (
                    <EditableMediaItem
                      key={media.id}
                      media={media}
                      index={index}
                      onRemove={handleRemoveFromList}
                      onDragStart={handleDragStart}
                      onDragOver={handleDragOver}
                      onDrop={handleDrop}
                      isDragging={draggedItem === index}
                      t={t}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <SectionRow
                title={`${t('lists.contentOfList')} (${finalMedias.length})`}
                items={finalMedias}
                onSelect={setDetalleMedia}
                carousel={false}
              />
            )
          ) : (
            <div className="listas-empty">
              <div className="listas-empty-icon">
                <i className="fas fa-list"></i>
              </div>
              <h3>{t('lists.emptyList')}</h3>
              <p>{t('lists.emptyListDesc')}</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal de detalles */}
      {detalleMedia && (
        <DetailModal 
          media={detalleMedia} 
          onClose={() => setDetalleMedia(null)}
        />
      )}
    </div>
  );
}
