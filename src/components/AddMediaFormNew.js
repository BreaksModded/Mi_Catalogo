import React, { useState, useEffect, useCallback } from 'react';
import './AddMediaForm_new.css';
import { useLanguage } from '../context/LanguageContext';
import { useNotification } from '../context/NotificationContext';
import TagsModalNew from './TagsModalNew';
import TmdbIdConflictModal from './TmdbIdConflictModal';
import RelatedMedia from './RelatedMedia';
import { useHybridPoster, useHybridContent } from '../hooks/useHybridContent';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "https://mi-catalogo-backend.onrender.com";
const API_URL = BACKEND_URL + '/medias';
const TMDB_URL = BACKEND_URL + '/tmdb';

// Componente auxiliar para mostrar el estado del catálogo con título traducido
function CatalogStatusDisplay({ existStatus, translateMediaType }) {
  const { t } = useLanguage();
  
  // Determinar el tipo de media para el hook (siempre llamar el hook)
  const mediaType = existStatus?.tipo?.toLowerCase().includes('película') || 
                   existStatus?.tipo?.toLowerCase().includes('pelicula') ? 'movie' : 'tv';
  
  // Obtener contenido híbrido para el título traducido (siempre llamar el hook)
  const { content } = useHybridContent(existStatus?.tmdb_id, mediaType, null, true); // skipCache = true
  
  // Early return después de llamar todos los hooks
  if (!existStatus || (!existStatus.inPersonalCatalog && !existStatus.exists)) return null;
  
  // Usar el título traducido si está disponible, sino usar el original
  const displayTitle = content.title || existStatus.titulo;
  
  return (
    <div className="addmedia-catalog-status" style={{
      margin: '16px 0',
      padding: '12px 16px',
      borderRadius: '8px',
      fontSize: '0.9rem',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      backgroundColor: existStatus.inPersonalCatalog ? 'rgba(255, 193, 7, 0.1)' : 'rgba(40, 167, 69, 0.1)',
      border: existStatus.inPersonalCatalog ? '1px solid rgba(255, 193, 7, 0.3)' : '1px solid rgba(40, 167, 69, 0.3)',
      color: existStatus.inPersonalCatalog ? '#ffc107' : '#28a745'
    }}>
      <i className={`fas ${existStatus.inPersonalCatalog ? 'fa-exclamation-triangle' : 'fa-check-circle'}`}></i>
      {existStatus.inPersonalCatalog ? (
        <span>
          <strong>{t('addMedia.alreadyInCatalog', 'Ya en tu catálogo:')}</strong>
          {` ${displayTitle} (${translateMediaType(existStatus.tipo)})`}
          {existStatus.fechaAgregado && (
            <span style={{ opacity: 0.8, marginLeft: '8px' }}>
              - {t('addMedia.addedOn', 'Añadido el')} {new Date(existStatus.fechaAgregado).toLocaleDateString()}
            </span>
          )}
          {existStatus.favorito && (
            <i className="fas fa-heart" style={{ marginLeft: '8px', color: '#e74c3c' }} title={t('addMedia.favorite', 'Favorito')}></i>
          )}
          {existStatus.pendiente && (
            <i className="fas fa-clock" style={{ marginLeft: '8px', color: '#f39c12' }} title={t('addMedia.pending', 'Pendiente')}></i>
          )}
        </span>
      ) : (
        <span>
          <strong>{t('addMedia.newContent', 'Contenido nuevo')}</strong>
          {` - ${t('addMedia.willBeAdded', 'Se añadirá a tu catálogo personal')}`}
        </span>
      )}
    </div>
  );
}

// Componente para cada resultado de búsqueda TMDB
function TMDBResultCard({ item, onSelect, loading }) {
  const mediaType = item.media_type === 'movie' ? 'movie' : 'tv';
  const { posterUrl, loading: posterLoading, cached } = useHybridPoster(item.id, mediaType, item.imagen, true); // skipCache = true
  const { t } = useLanguage();

  const handleClick = () => {
    if (!loading) {
      onSelect(item);
    }
  };

  return (
    <div 
      className={`addmedia-tmdb-card ${loading ? 'loading' : ''}`}
      onClick={handleClick}
      style={{ cursor: loading ? 'not-allowed' : 'pointer' }}
    >
      <div className="addmedia-tmdb-poster">
        {posterLoading ? (
          <div className="addmedia-loading-spinner"></div>
        ) : posterUrl ? (
          <div className="poster-container">
            <img 
              src={posterUrl} 
              alt={item.titulo}
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.parentNode.innerHTML = '<i class="fas fa-film"></i>';
              }}
            />
            {cached && (
              <div className="cache-indicator" title="Cargado desde caché">
                <i className="fas fa-bolt"></i>
              </div>
            )}
          </div>
        ) : (
          <i className="fas fa-film"></i>
        )}
      </div>
      <div className="addmedia-tmdb-info">
        <h3 className="addmedia-tmdb-info-title">{item.titulo}</h3>
        <div className="addmedia-tmdb-info-details">
          <span className="addmedia-tmdb-detail">
            <i className="fas fa-calendar"></i>
            {item.anio || t('addMedia.comingSoon', 'Próximamente')}
          </span>
          <span className="addmedia-tmdb-type">
            {item.media_type === 'movie' ? t('general.movie', 'Película') : t('general.series', 'Serie')}
          </span>
          {item.nota_tmdb && (
            <span className="addmedia-tmdb-detail addmedia-tmdb-rating">
              <i className="fas fa-star"></i>
              {item.nota_tmdb.toFixed(1)}
              {item.votos_tmdb && (
                <span style={{marginLeft: '4px', fontSize: '0.85em', color: '#999'}}>
                  ({item.votos_tmdb})
                </span>
              )}
            </span>
          )}
        </div>
      </div>
      {loading && (
        <div className="addmedia-tmdb-loading-overlay">
          <div className="addmedia-spinner"></div>
        </div>
      )}
    </div>
  );
}

export default function AddMediaFormNew({ onAdded }) {
  const { t, currentLanguage } = useLanguage();
  
  // Helper function to translate media type from database values
  const translateMediaType = (tipo) => {
    if (!tipo) return '';
    
    // Convert to lowercase for consistent mapping
    const tipoLower = tipo.toLowerCase();
    
    // Map common database values to translation keys
    if (tipoLower.includes('película') || tipoLower.includes('pelicula') || tipoLower === 'movie') {
      return t('movie', 'Película');
    } else if (tipoLower.includes('serie') || tipoLower === 'series' || tipoLower === 'tv') {
      return t('series', 'Serie');
    }
    
    // Fallback to original value if no mapping found
    return tipo;
  };
  const { showNotification } = useNotification();
  
  // Estados principales
  const [form, setForm] = useState({
    titulo: '',
    original_title: '',
    anio: '',
    genero: '',
    sinopsis: '',
    director: '',
    elenco: '',
    imagen: '',
    status: '',  // Cambiado de estado a status
    tipo: '',
    temporadas: '',
    episodios: '',
    nota_personal: '',
    tmdb_id: ''
  });

  const [notifications, setNotifications] = useState([]);
  const [searchTitle, setSearchTitle] = useState('');
  const [loadingTmdb, setLoadingTmdb] = useState(false);
  const [tmdbError, setTmdbError] = useState('');
  const [tmdbOptions, setTmdbOptions] = useState([]);
  const [tmdbDetails, setTmdbDetails] = useState(null);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [tags, setTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [showTagsModal, setShowTagsModal] = useState(false);
  const [tmdbConflict, setTmdbConflict] = useState({ 
    open: false, 
    titulo: '', 
    tipo: '', 
    onConfirm: null,
    onCancel: null 
  });
  const [existStatus, setExistStatus] = useState(null);
  const [selectingTmdb, setSelectingTmdb] = useState(null);

  // Mapear idioma para TMDb API
  const getTmdbLanguage = (lang) => {
    switch (lang) {
      case 'es': return 'es-ES';
      case 'en': return 'en-US';
      case 'de': return 'de-DE';
      case 'fr': return 'fr-FR';
      case 'pt': return 'pt-PT';
      default: return 'es-ES';
    }
  };

  // Agregar notificación
  const addNotification = useCallback((message, type = 'info') => {
    const id = Date.now();
    const newNotification = { id, message, type };
    setNotifications(prev => [...prev, newNotification]);
    
    // Auto-remover después de 5 segundos
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  }, []);

  // Remover notificación
  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // Chequeo de existencia en catálogo personal
  const checkExistenceInPersonalCatalog = async (tmdb_id, tipo) => {
    if (!tmdb_id) return;
    
    setExistStatus(null);
    
    try {
      const jwtToken = localStorage.getItem('jwt_token');
      const headers = jwtToken ? { 'Authorization': `Bearer ${jwtToken}` } : {};
      
      const response = await fetch(`${API_URL}/check-personal-catalog/${tmdb_id}`, { headers });
      
      if (response.ok) {
        const data = await response.json();
        if (data.exists && data.in_personal_catalog) {
          setExistStatus({ 
            exists: true, 
            inPersonalCatalog: true,
            tmdb_id: tmdb_id,
            titulo: data.titulo,
            tipo: data.tipo,
            fechaAgregado: data.fecha_agregado,
            favorito: data.favorito,
            pendiente: data.pendiente
          });
          // No mostrar notificación duplicada - solo el indicador visual
        } else if (data.exists_in_general) {
          setExistStatus({ 
            exists: false, 
            inPersonalCatalog: false,
            existsInGeneral: true,
            tmdb_id: tmdb_id,
            titulo: data.titulo,
            tipo: data.tipo
          });
          // No mostrar notificación duplicada - solo el indicador visual
        } else {
          setExistStatus({ exists: false, inPersonalCatalog: false });
        }
      }
    } catch (err) {
      // Error checking personal catalog
    }
  };

  // Cargar etiquetas
  useEffect(() => {
    const loadTags = async () => {
      try {
        const jwtToken = localStorage.getItem('jwt_token');
        const headers = jwtToken ? { 'Authorization': `Bearer ${jwtToken}` } : {};
        
        const response = await fetch(BACKEND_URL + '/tags', { headers });
        if (response.ok) {
          const data = await response.json();
          setTags(data);
        }
      } catch (err) {
        // Error loading tags
      }
    };

    loadTags();
  }, []);

  // Verificar existencia cuando cambian campos relevantes
  useEffect(() => {
    if (form.tmdb_id && form.tipo) {
      checkExistenceInPersonalCatalog(form.tmdb_id, form.tipo);
    } else {
      setExistStatus(null);
    }
  }, [form.tmdb_id, form.tipo]);

  // Auto-seleccionar si hay solo 1 resultado
  useEffect(() => {
    if (tmdbOptions.length === 1 && !tmdbDetails && !selectingTmdb) {
      handleTmdbSelect(tmdbOptions[0]);
    }
  }, [tmdbOptions, tmdbDetails, selectingTmdb]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validateForm = (formData) => {
    const errors = [];
    
    if (!formData.titulo.trim()) {
      errors.push(t('addMedia.titleRequired', 'El título es obligatorio'));
    }
    
    if (formData.anio) {
      const year = Number(formData.anio);
      if (isNaN(year) || year < 1800 || year > new Date().getFullYear() + 5) {
        errors.push(t('addMedia.invalidYear', 'Año inválido'));
      }
    }
    
    if (formData.nota_personal) {
      const rating = Number(formData.nota_personal);
      if (isNaN(rating) || rating < 0 || rating > 10) {
        errors.push(t('addMedia.invalidRating', 'La nota personal debe estar entre 0 y 10'));
      }
    }
    
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitStatus('loading');
    
    const errors = validateForm(form);
    if (errors.length > 0) {
      errors.forEach(error => addNotification(error, 'error'));
      setSubmitStatus(null);
      return;
    }

    let formDataToSave = { ...form };

    // Mapear nota_tmdb a nota_imdb si existe en tmdbDetails
    if (tmdbDetails && tmdbDetails.nota_tmdb !== undefined && tmdbDetails.nota_tmdb !== null) {
      formDataToSave.nota_imdb = tmdbDetails.nota_tmdb;
    }

    // Si el idioma actual no es español y tenemos tmdb_id, obtener datos en español para guardar
    if (currentLanguage !== 'es' && form.tmdb_id && tmdbDetails) {
      try {
        // Usar el media_type correcto del tmdbDetails
        const mediaType = tmdbDetails.media_type || (form.tipo?.toLowerCase().includes('serie') ? 'tv' : 'movie');
        
        const params = new URLSearchParams({
          id: form.tmdb_id,
          media_type: mediaType,
          language: 'es-ES'
        });
        
        const spanishUrl = `${TMDB_URL}?${params.toString()}`;
        const spanishRes = await fetch(spanishUrl);
        
        if (spanishRes.ok) {
          const spanishData = await spanishRes.json();
          
          // Reemplazar los campos de texto con la versión en español para guardar
          formDataToSave = {
            ...formDataToSave,
            titulo: spanishData.titulo || form.titulo,
            sinopsis: spanishData.sinopsis || form.sinopsis,
            // Mantener el título original si existe en los datos españoles
            original_title: spanishData.titulo_original || spanishData.original_title || form.original_title
          };
        } else {
          // Could not obtain Spanish data, using current data
        }
      } catch (error) {
        // Error obtaining Spanish data
        // If it fails, continue with current data
      }
    }

    const body = {
      ...formDataToSave,
      anio: Number(formDataToSave.anio),
      temporadas: formDataToSave.temporadas ? Number(formDataToSave.temporadas) : null,
      episodios: formDataToSave.episodios ? Number(formDataToSave.episodios) : null,
      nota_personal: formDataToSave.nota_personal ? Number(formDataToSave.nota_personal) : null,
      tmdb_id: formDataToSave.tmdb_id || null,
      original_title: formDataToSave.original_title || '',
      tags: selectedTags
    };

    try {
      const jwtToken = localStorage.getItem('jwt_token');
      const headers = { 
        'Content-Type': 'application/json',
        ...(jwtToken ? { 'Authorization': `Bearer ${jwtToken}` } : {})
      };
      
      const response = await fetch(API_URL, {
        method: 'POST',
        headers,
        body: JSON.stringify(body)
      });

      if (response.ok) {
        const newMedia = await response.json();
        setSubmitStatus('success');
        
        // Verificar traducciones creadas automáticamente
        if (form.tmdb_id) {
          try {
            const jwtToken = localStorage.getItem('jwt_token');
            const headers = jwtToken ? { 'Authorization': `Bearer ${jwtToken}` } : {};
            
            const translationsResponse = await fetch(`${API_URL}/${newMedia.id}/translations`, { headers });
            if (translationsResponse.ok) {
              const translationSummary = await translationsResponse.json();
              // addNotification(
              //   t('addMedia.addedSuccessfully', '{{title}} se ha añadido correctamente')
              //     .replace('{{title}}', form.titulo),
              //   'success'
              // );
              
              // Mostrar información de traducciones
              if (translationSummary.total > 0) {
                // addNotification(
                //   t('addMedia.translationsCreated', 'Traducciones automáticas creadas: {{count}} idiomas ({{synopsis}} con sinopsis)')
                //     .replace('{{count}}', translationSummary.total)
                //     .replace('{{synopsis}}', translationSummary.with_synopsis),
                //   'info'
                // );
              }
            }
          } catch (err) {
            // Could not verify translations
          }
        } else {
          // addNotification(
          //   t('addMedia.addedSuccessfully', '{{title}} se ha añadido correctamente')
          //     .replace('{{title}}', form.titulo),
          //   'success'
          // );
        }
        
        // Reset form
        setForm({
          titulo: '',
          original_title: '',
          anio: '',
          genero: '',
          sinopsis: '',
          director: '',
          elenco: '',
          imagen: '',
          status: '',  // Cambiado de estado a status
          tipo: '',
          temporadas: '',
          episodios: '',
          nota_personal: '',
          tmdb_id: ''
        });
        setSelectedTags([]);
        setTmdbDetails(null);
        setTmdbOptions([]);
        setSearchTitle('');
        setExistStatus(null);
        
        if (onAdded) onAdded(newMedia);
        
      } else {
        const errorData = await response.json();
        throw new Error(errorData.detail || t('addMedia.errorAdding', 'Error al añadir el medio'));
      }
    } catch (error) {
      setSubmitStatus('error');
      addNotification(error.message, 'error');
    }
  };

  const handleTmdbSearch = useCallback(async (e) => {
    e.preventDefault();
    if (!searchTitle.trim()) return;
    
    setLoadingTmdb(true);
    setTmdbError('');
    setTmdbOptions([]);
    
    // Limpiar el formulario actual si hay uno mostrado
    if (tmdbDetails) {
      setTmdbDetails(null);
      setForm({
        titulo: '',
        original_title: '',
        anio: '',
        genero: '',
        sinopsis: '',
        director: '',
        elenco: '',
        imagen: '',
        status: '',  // Cambiado de estado a status
        tipo: '',
        temporadas: '',
        episodios: '',
        nota_personal: '',
        tmdb_id: ''
      });
      setExistStatus(null);
    }
    
    try {
      const jwtToken = localStorage.getItem('jwt_token');
      const headers = jwtToken ? { 'Authorization': `Bearer ${jwtToken}` } : {};
      
      // Determinar tipo preferido basado en el formulario
      let tipoPreferido = '';
      if (form.tipo?.toLowerCase() === 'serie') {
        tipoPreferido = 'serie';
      } else if (form.tipo?.toLowerCase() === 'película') {
        tipoPreferido = 'película';
      }
      
      const tmdbLang = getTmdbLanguage(currentLanguage);
      
      // Construir URL con parámetros optimizados
      const params = new URLSearchParams({
        title: searchTitle,
        listar: 'true',
        language: tmdbLang
      });
      
      if (tipoPreferido) {
        params.append('tipo_preferido', tipoPreferido);
      }
      
      const url = `${TMDB_URL}?${params.toString()}`;
      
      const response = await fetch(url, { headers });
      
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.detail || t('addMedia.tmdbSearchError', 'Error en la búsqueda de TMDb'));
      }
      
      const data = await response.json();
      
      if (data.opciones && data.opciones.length > 0) {
        // Mejorar los datos de las opciones con información del media_type
        const opcionesEnriquecidas = data.opciones.map(opcion => ({
          ...opcion,
          // Asegurar que media_type esté presente y sea correcto
          media_type: opcion.media_type || (opcion.tipo === 'serie' ? 'tv' : 'movie'),
          // Agregar información de depuración
          debug_info: {
            original_media_type: opcion.media_type,
            inferred_type: opcion.tipo,
            final_media_type: opcion.media_type || (opcion.tipo === 'serie' ? 'tv' : 'movie')
          }
        }));
        
        setTmdbOptions(opcionesEnriquecidas);
        setTmdbError('');
        
        // Los resultados se procesarán en un useEffect separado para auto-selección
      } else {
        setTmdbError(t('addMedia.noTmdbResults', 'No se encontraron resultados en TMDb'));
      }
    } catch (err) {
      setTmdbError(err.message);
    } finally {
      setLoadingTmdb(false);
    }
  }, [searchTitle, form.tipo, currentLanguage, t, tmdbDetails]);

  const handleTmdbSelect = useCallback(async (opcion) => {
    setSelectingTmdb(opcion.id);
    
    try {
      const jwtToken = localStorage.getItem('jwt_token');
      const headers = jwtToken ? { 'Authorization': `Bearer ${jwtToken}` } : {};
      
      const tmdbLang = getTmdbLanguage(currentLanguage);
      
      // Asegurar que tenemos el media_type correcto
      const mediaType = opcion.media_type || (opcion.tipo === 'serie' ? 'tv' : 'movie');
      
      // Construir URL con parámetros correctos
      const params = new URLSearchParams({
        id: opcion.id,
        media_type: mediaType,
        language: tmdbLang
      });
      
      const url = `${TMDB_URL}?${params.toString()}`;
      
      const response = await fetch(url, { headers });
      
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.detail || t('addMedia.tmdbDetailsError', 'Error al obtener detalles de TMDb'));
      }
      
      const details = await response.json();
      
      // Preservar media_type de la opción original y asegurar consistencia
      const detailsWithMediaType = {
        ...details,
        media_type: mediaType,
        // Información de depuración
        debug_selection: {
          original_media_type: opcion.media_type,
          final_media_type: mediaType,
          backend_tipo: details.tipo,
          selected_from: 'tmdb_search'
        }
      };
      
      setTmdbDetails(detailsWithMediaType);
      setForm(prev => ({
        ...prev,
        titulo: details.titulo || '',
        original_title: details.titulo_original || details.original_title || '',
        anio: details.anio || '',
        genero: details.genero || '',
        sinopsis: details.sinopsis || '',
        director: details.director || '',
        elenco: details.elenco || '',
        imagen: details.imagen || '',
        status: details.status || '',  // Cambiado de estado a status
        tipo: details.tipo || '',
        temporadas: details.temporadas || '',
        episodios: details.episodios || '',
        nota_personal: '',
        tmdb_id: opcion.id || ''
      }));
      
      // addNotification(
      //   t('addMedia.tmdbDataLoaded', 'Datos cargados desde TMDb'),
      //   'success'
      // );
      
      // Chequear existencia en catálogo personal
      if (opcion.id && details.tipo) {
        await checkExistenceInPersonalCatalog(opcion.id, details.tipo);
      }
      
    } catch (err) {
      addNotification(err.message, 'error');
    } finally {
      setSelectingTmdb(null);
    }
  }, [currentLanguage, t, checkExistenceInPersonalCatalog, addNotification]);

  const handleCreateTag = async (nombre) => {
    try {
      const jwtToken = localStorage.getItem('jwt_token');
      const headers = { 
        'Content-Type': 'application/json',
        ...(jwtToken ? { 'Authorization': `Bearer ${jwtToken}` } : {})
      };
      
      const response = await fetch(BACKEND_URL + '/tags', {
        method: 'POST',
        headers,
        body: JSON.stringify({ nombre })
      });
      
      if (response.ok) {
        const newTag = await response.json();
        setTags(prev => [...prev, newTag]);
        return newTag;
      }
    } catch (err) {
      // Error creating tag
    }
    return null;
  };

  const handleDeleteTag = async (tagId) => {
    try {
      const jwtToken = localStorage.getItem('jwt_token');
      const headers = jwtToken ? { 'Authorization': `Bearer ${jwtToken}` } : {};
      
      const response = await fetch(`${BACKEND_URL}/tags/${tagId}`, {
        method: 'DELETE',
        headers
      });
      
      if (response.ok) {
        setTags(prev => prev.filter(tag => tag.id !== tagId));
        setSelectedTags(prev => prev.filter(id => id !== tagId));
      }
    } catch (err) {
      // Error deleting tag
    }
  };

  const handleTagChange = (tagsData) => {
    // Manejar tanto objetos de tags como IDs
    if (Array.isArray(tagsData)) {
      const processedTags = tagsData.map(item => {
        // Si es un objeto tag, extraer el ID
        if (typeof item === 'object' && item.id) {
          return item.id;
        }
        // Si ya es un ID, devolverlo tal como está
        return item;
      });
      setSelectedTags(processedTags);
    } else {
      setSelectedTags(tagsData);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success': return 'fas fa-check-circle';
      case 'warning': return 'fas fa-exclamation-triangle';
      case 'error': return 'fas fa-times-circle';
      default: return 'fas fa-info-circle';
    }
  };

  return (
    <div className="addmedia-page">
      <div className="addmedia-container">
        {/* Hero Section */}
        <div className="addmedia-hero addmedia-visual-effect">
          <div className="addmedia-hero__content">
            <div className="addmedia-hero__header">
              <h1 className="addmedia-hero__title">
                <i className="addmedia-hero__icon fas fa-plus-circle"></i>
                {t('addMedia.title', 'Añadir Contenido')}
              </h1>
            </div>
            <p className="addmedia-hero__subtitle">
              {t('addMedia.subtitle', 'Busca y añade películas o series a tu catálogo personal desde la base de datos de TMDb con información completa y actualizada.')}
            </p>
          </div>
        </div>

        {/* Notifications */}
        {notifications.length > 0 && (
          <div className="addmedia-notifications">
            {notifications.map(notification => (
              <div 
                key={notification.id}
                className={`addmedia-notification ${notification.type}`}
                onClick={() => removeNotification(notification.id)}
                style={{ cursor: 'pointer' }}
              >
                <i className={`addmedia-notification-icon ${getNotificationIcon(notification.type)}`}></i>
                <span>{notification.message}</span>
                <i className="fas fa-times" style={{ marginLeft: 'auto', opacity: 0.7 }}></i>
              </div>
            ))}
          </div>
        )}

        {/* TMDb Search Section */}
        <div className="addmedia-tmdb-section addmedia-visual-effect">
          <div className="addmedia-tmdb-header">
            <h2 className="addmedia-tmdb-title">
              <i className="fas fa-search" style={{ color: '#00e2c7', marginRight: '8px' }}></i>
              {t('addMedia.tmdbSearch', 'Búsqueda en TMDb')}
            </h2>
            <span className="addmedia-tmdb-badge">
              {t('addMedia.recommended', 'Recomendado')}
            </span>
          </div>
          
          <form onSubmit={handleTmdbSearch}>
            <div className="addmedia-search-container">
              <input
                className="addmedia-search-input"
                type="text"
                value={searchTitle}
                onChange={e => setSearchTitle(e.target.value)}
                placeholder={t('addMedia.searchPlaceholder', 'Buscar películas o series en TMDb...')}
              />
              <button 
                type="submit"
                className="addmedia-search-btn"
                disabled={loadingTmdb || !searchTitle.trim()}
              >
                {loadingTmdb ? (
                  <>
                    <div className="addmedia-spinner"></div>
                    {t('addMedia.searching', 'Buscando...')}
                  </>
                ) : (
                  <>
                    <i className="fas fa-search"></i>
                    {t('addMedia.searchButton', 'Buscar')}
                  </>
                )}
              </button>
            </div>
          </form>

          {/* TMDb Results */}
          {tmdbError && (
            <div className="addmedia-tmdb-results">
              <div className="addmedia-tmdb-error">
                <i className="fas fa-exclamation-triangle"></i>
                {tmdbError}
              </div>
            </div>
          )}

          {tmdbOptions.length > 0 && !tmdbDetails && (
            <div className="addmedia-tmdb-results">
              <div className="addmedia-tmdb-grid">
                {tmdbOptions.map((option, index) => (
                  <TMDBResultCard
                    key={`${option.id}-${option.media_type}-${index}`}
                    item={option}
                    onSelect={handleTmdbSelect}
                    loading={selectingTmdb === option.id}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Form Section */}
        {tmdbDetails && (
          <div className="addmedia-form-section addmedia-visual-effect">
            <div className="addmedia-form-header">
              <h2 className="addmedia-form-title">
                <i className="fas fa-edit" style={{ color: '#00e2c7', marginRight: '8px' }}></i>
                {t('addMedia.formTitle', 'Detalles del Contenido')}
              </h2>
              {tmdbOptions.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setTmdbDetails(null);
                    setForm({
                      titulo: '',
                      original_title: '',
                      anio: '',
                      genero: '',
                      sinopsis: '',
                      director: '',
                      elenco: '',
                      imagen: '',
                      status: '',  // Cambiado de estado a status
                      tipo: '',
                      temporadas: '',
                      episodios: '',
                      nota_personal: '',
                      tmdb_id: ''
                    });
                  }}
                  className="addmedia-back-btn"
                  style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '8px',
                    color: '#ffffff',
                    padding: '8px 16px',
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                  onMouseOver={(e) => {
                    e.target.style.background = 'rgba(255, 255, 255, 0.15)';
                    e.target.style.borderColor = 'rgba(0, 226, 199, 0.5)';
                  }}
                  onMouseOut={(e) => {
                    e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                    e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                  }}
                >
                  <i className="fas fa-arrow-left"></i>
                  {t('addMedia.backToResults', 'Volver a resultados')}
                </button>
              )}
            </div>

            {/* Personal Catalog Status Indicator */}
            <CatalogStatusDisplay existStatus={existStatus} translateMediaType={translateMediaType} />

            <form onSubmit={handleSubmit}>
              <div className="addmedia-form-grid">
                <div className="addmedia-field-group">
                  <label className="addmedia-field-label">
                    {t('addMedia.titleField', 'Título')} *
                  </label>
                  <input
                    name="titulo"
                    value={form.titulo}
                    onChange={handleChange}
                    placeholder={t('addMedia.titlePlaceholder', 'Título principal')}
                    className="addmedia-field addmedia-field-readonly"
                    required
                    readOnly
                  />
                </div>

                <div className="addmedia-field-group">
                  <label className="addmedia-field-label">
                    {t('addMedia.originalTitleField', 'Título Original')}
                  </label>
                  <input
                    name="original_title"
                    value={form.original_title}
                    onChange={handleChange}
                    placeholder={t('addMedia.originalTitlePlaceholder', 'Título en idioma original')}
                    className="addmedia-field addmedia-field-readonly"
                    readOnly
                  />
                </div>

                <div className="addmedia-field-group">
                  <label className="addmedia-field-label">
                    {t('addMedia.yearField', 'Año')} *
                  </label>
                  <input
                    name="anio"
                    value={form.anio}
                    onChange={handleChange}
                    placeholder={t('addMedia.yearPlaceholder', 'Año de estreno')}
                    type="number"
                    className="addmedia-field addmedia-field-readonly"
                    required
                    readOnly
                  />
                </div>

                <div className="addmedia-field-group">
                  <label className="addmedia-field-label">
                    {t('addMedia.genreField', 'Género')}
                  </label>
                  <input
                    name="genero"
                    value={form.genero}
                    onChange={handleChange}
                    placeholder={t('addMedia.genrePlaceholder', 'Género principal')}
                    className="addmedia-field addmedia-field-readonly"
                    readOnly
                  />
                </div>

                <div className="addmedia-field-group">
                  <label className="addmedia-field-label">
                    {t('addMedia.typeField', 'Tipo')} *
                  </label>
                  <input
                    name="tipo"
                    value={translateMediaType(form.tipo)}
                    onChange={handleChange}
                    placeholder={t('addMedia.typePlaceholder', 'película o serie')}
                    className="addmedia-field addmedia-field-readonly"
                    required
                    readOnly
                  />
                </div>

                <div className="addmedia-field-group">
                  <label className="addmedia-field-label">
                    {t('addMedia.directorField', 'Director')}
                  </label>
                  <input
                    name="director"
                    value={form.director}
                    onChange={handleChange}
                    placeholder={t('addMedia.directorPlaceholder', 'Director principal')}
                    className="addmedia-field addmedia-field-readonly"
                    readOnly
                  />
                </div>

                <div className="addmedia-field-group">
                  <label className="addmedia-field-label">
                    {t('addMedia.castField', 'Reparto')}
                  </label>
                  <input
                    name="elenco"
                    value={form.elenco}
                    onChange={handleChange}
                    placeholder={t('addMedia.castPlaceholder', 'Actores principales')}
                    className="addmedia-field addmedia-field-readonly"
                    readOnly
                  />
                </div>

                <div className="addmedia-field-group">
                  <label className="addmedia-field-label">
                    {t('addMedia.imageField', 'URL de Imagen')}
                  </label>
                  <input
                    name="imagen"
                    value={form.imagen}
                    onChange={handleChange}
                    placeholder={t('addMedia.imagePlaceholder', 'URL del póster')}
                    className="addmedia-field addmedia-field-readonly"
                    readOnly
                  />
                </div>

                <div className="addmedia-field-group">
                  <label className="addmedia-field-label">
                    {t('addMedia.tmdbIdField', 'ID de TMDb')}
                  </label>
                  <input
                    name="tmdb_id"
                    value={form.tmdb_id}
                    onChange={handleChange}
                    placeholder={t('addMedia.tmdbIdPlaceholder', 'ID en TMDb')}
                    className="addmedia-field addmedia-field-readonly"
                    readOnly
                  />
                </div>

                <div className="addmedia-field-group">
                  <label className="addmedia-field-label">
                    {t('addMedia.seasonsField', 'Temporadas')}
                  </label>
                  <input
                    name="temporadas"
                    value={form.temporadas}
                    onChange={handleChange}
                    placeholder={t('addMedia.seasonsPlaceholder', 'Solo para series')}
                    type="number"
                    className="addmedia-field addmedia-field-readonly"
                    readOnly
                  />
                </div>

                <div className="addmedia-field-group">
                  <label className="addmedia-field-label">
                    {t('addMedia.episodesField', 'Episodios')}
                  </label>
                  <input
                    name="episodios"
                    value={form.episodios}
                    onChange={handleChange}
                    placeholder={t('addMedia.episodesPlaceholder', 'Solo para series')}
                    type="number"
                    className="addmedia-field addmedia-field-readonly"
                    readOnly
                  />
                </div>

                <div className="addmedia-field-group addmedia-field-group-editable">
                  <label className="addmedia-field-label addmedia-field-label-editable">
                    <i className="fas fa-edit" style={{marginRight: '6px', color: '#00e2c7'}}></i>
                    {t('addMedia.personalRatingField', 'Nota Personal')}
                  </label>
                  <input
                    name="nota_personal"
                    value={form.nota_personal}
                    onChange={handleChange}
                    placeholder={t('addMedia.personalRatingPlaceholder', '0-10')}
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    className="addmedia-field addmedia-field-editable"
                  />
                  
                  {tmdbDetails && tmdbDetails.nota_tmdb && (
                    <div className="addmedia-tmdb-rating">
                      {t('addMedia.tmdbRatingLabel', 'Nota TMDb:')} <strong>{tmdbDetails.nota_tmdb.toFixed(1)}</strong>
                      {tmdbDetails.votos_tmdb && (
                        <span style={{marginLeft: '8px', color: '#999', fontSize: '0.9em'}}>
                          ({tmdbDetails.votos_tmdb} {t('addMedia.votes', 'votos')})
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="addmedia-field-group addmedia-field-wide">
                  <label className="addmedia-field-label">
                    {t('addMedia.synopsisField', 'Sinopsis')}
                  </label>
                  <textarea
                    name="sinopsis"
                    value={form.sinopsis}
                    onChange={handleChange}
                    placeholder={t('addMedia.synopsisPlaceholder', 'Descripción del contenido')}
                    className="addmedia-textarea addmedia-field-readonly"
                    readOnly
                  />
                </div>

                <div className="addmedia-field-group addmedia-field-wide">
                  <label className="addmedia-field-label">
                    {t('addMedia.statusField', 'Estado')}
                  </label>
                  <input
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                    placeholder={t('addMedia.statusPlaceholder', 'vista, pendiente, etc.')}
                    className="addmedia-field addmedia-field-readonly"
                    readOnly
                  />
                </div>
              </div>

              {/* Tags Section */}
              <div className="addmedia-tags-section">
                <div className="addmedia-tags-header">
                  <h3 className="addmedia-tags-title">
                    <i className="fas fa-tags"></i>
                    {t('addMedia.tags', 'Etiquetas')}
                  </h3>
                  <button
                    type="button"
                    className="addmedia-tags-btn"
                    onClick={() => setShowTagsModal(true)}
                  >
                    <i className="fas fa-plus"></i>
                    {t('addMedia.manageTags', 'Gestionar')}
                  </button>
                </div>
                
                {selectedTags.length > 0 && (
                  <div className="addmedia-selected-tags">
                    {selectedTags.map(tagId => {
                      const tag = tags.find(t => t.id === tagId);
                      return tag ? (
                        <div key={tagId} className="addmedia-tag">
                          {tag.nombre}
                          <button
                            type="button"
                            className="addmedia-tag-remove"
                            onClick={() => setSelectedTags(prev => prev.filter(id => id !== tagId))}
                          >
                            ×
                          </button>
                        </div>
                      ) : null;
                    })}
                  </div>
                )}
              </div>

              {/* Submit Section */}
              <div className="addmedia-submit-section">
                <button
                  type="submit"
                  className="addmedia-submit-btn"
                  disabled={submitStatus === 'loading'}
                >
                  {submitStatus === 'loading' ? (
                    <>
                      <div className="addmedia-spinner"></div>
                      {t('addMedia.adding', 'Añadiendo...')}
                    </>
                  ) : (
                    <>
                      <i className="fas fa-plus"></i>
                      {t('addMedia.addButton', 'Añadir al Catálogo')}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Related Media Section */}
        {form.tmdb_id && tmdbDetails && (
          <div className="addmedia-related-section">
            <div className="addmedia-related-header">
              <h2 className="addmedia-related-title">
                <i className="fas fa-film" style={{ color: '#00e2c7', marginRight: '8px' }}></i>
                {t('addMedia.relatedContent', 'Contenido Relacionado')}
              </h2>
            </div>
            <RelatedMedia
              tmdbId={form.tmdb_id.toString()}
              mediaType={tmdbDetails.media_type || (form.tipo?.toLowerCase().includes('serie') ? 'tv' : 'movie')}
              onSelectMedia={async (item) => {
                setSelectingTmdb(item.id);
                setTmdbError('');
                
                try {
                  const jwtToken = localStorage.getItem('jwt_token');
                  const headers = jwtToken ? { 'Authorization': `Bearer ${jwtToken}` } : {};
                  
                  const tmdbLang = getTmdbLanguage(currentLanguage);
                  
                  // Determinar media_type correcto
                  const mediaType = item.media_type || (item.tipo === 'serie' ? 'tv' : 'movie');
                  
                  const params = new URLSearchParams({
                    id: item.id,
                    media_type: mediaType,
                    language: tmdbLang
                  });
                  
                  const url = `${TMDB_URL}?${params.toString()}`;
                  const res = await fetch(url, { headers });
                  
                  if (!res.ok) {
                    const err = await res.json();
                    setTmdbError(err.detail || t('addMedia.tmdbDetailsError', 'Error al obtener detalles de TMDb'));
                    return;
                  }
                  
                  const data = await res.json();
                  
                  // Preservar media_type del item original
                  const dataWithMediaType = {
                    ...data,
                    media_type: mediaType,
                    debug_selection: {
                      selected_from: 'related_media',
                      original_media_type: item.media_type,
                      final_media_type: mediaType
                    }
                  };
                  
                  // Actualizar formulario con los nuevos datos
                  setForm({
                    titulo: data.titulo || '',
                    original_title: data.titulo_original || data.original_title || '',
                    anio: data.anio || '',
                    genero: data.genero || '',
                    sinopsis: data.sinopsis || '',
                    director: data.director || '',
                    elenco: data.elenco || '',
                    imagen: data.imagen || '',
                    status: data.status || '',  // Cambiado de estado a status
                    tipo: data.tipo || '',
                    temporadas: data.temporadas || '',
                    episodios: data.episodios || '',
                    nota_personal: '',
                    tmdb_id: item.id.toString()
                  });
                  
                  // Limpiar tags seleccionados al seleccionar desde RelatedMedia
                  setSelectedTags([]);
                  setTmdbDetails(dataWithMediaType);
                  setTmdbError('');
                  
                  // Mostrar notificación
                  // addNotification(
                  //   t('addMedia.relatedSelected', 'Contenido relacionado seleccionado'),
                  //   'success'
                  // );
                  
                  // Chequear existencia en catálogo personal
                  if (item.id && data.tipo) {
                    await checkExistenceInPersonalCatalog(item.id.toString(), data.tipo);
                  }
                } catch (err) {
                  setTmdbError(t('addMedia.connectionError', 'Error de conexión'));
                  addNotification(
                    t('addMedia.connectionError', 'Error de conexión'),
                    'error'
                  );
                } finally {
                  setSelectingTmdb(null);
                }
              }}
            />
          </div>
        )}

        {/* Modals */}
        <TagsModalNew
          open={showTagsModal}
          tags={tags}
          selectedTags={selectedTags}
          onSave={handleTagChange}
          onTagChange={handleTagChange}
          onCreateTag={handleCreateTag}
          onDeleteTag={handleDeleteTag}
          onClose={() => setShowTagsModal(false)}
        />

        <TmdbIdConflictModal
          open={tmdbConflict.open}
          titulo={tmdbConflict.titulo}
          tipo={tmdbConflict.tipo}
          onConfirm={tmdbConflict.onConfirm}
          onCancel={tmdbConflict.onCancel}
        />
      </div>
    </div>
  );
}
