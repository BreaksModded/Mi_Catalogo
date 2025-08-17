import React, { useState, useEffect, useCallback } from 'react';
import './AddMediaForm_new.css';
import { useLanguage } from '../context/LanguageContext';
import { useNotification } from '../context/NotificationContext';
import TagsModalNew from './TagsModalNew';
import TmdbIdConflictModal from './TmdbIdConflictModal';
import RelatedMedia from './RelatedMedia';
import { useDynamicPoster } from '../hooks/useDynamicPoster';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "https://mi-catalogo-backend.onrender.com";
const API_URL = BACKEND_URL + '/medias';
const TMDB_URL = BACKEND_URL + '/tmdb';

// Componente para cada resultado de búsqueda TMDB
function TMDBResultCard({ item, onSelect, loading }) {
  const mediaType = item.media_type === 'movie' ? 'movie' : 'tv';
  const { posterUrl, loading: posterLoading } = useDynamicPoster(item.id, mediaType, item.imagen);
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
          <img 
            src={posterUrl} 
            alt={item.titulo}
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.parentNode.innerHTML = '<i class="fas fa-film"></i>';
            }}
          />
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
  const { showNotification } = useNotification();
  
  // Estados principales
  const [form, setForm] = useState({
    titulo: '',
    titulo_ingles: '',
    anio: '',
    genero: '',
    sinopsis: '',
    director: '',
    elenco: '',
    imagen: '',
    estado: '',
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

  // Chequeo de existencia en catálogo
  const checkExistenceInCatalog = async (tmdb_id, tipo) => {
    if (!tmdb_id) return;
    
    setExistStatus(null);
    
    try {
      const jwtToken = localStorage.getItem('jwt_token');
      const headers = jwtToken ? { 'Authorization': `Bearer ${jwtToken}` } : {};
      
      const response = await fetch(`${API_URL}/check-tmdb/${tmdb_id}`, { headers });
      
      if (response.ok) {
        const data = await response.json();
        if (data.exists) {
          setExistStatus({ exists: true, tipo: data.tipo });
          addNotification(
            t('addMedia.existsInCatalog', 'Esta {{type}} ya existe en tu catálogo')
              .replace('{{type}}', data.tipo),
            'warning'
          );
        } else {
          setExistStatus({ exists: false });
        }
      }
    } catch (err) {
      console.error('Error checking existence:', err);
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
        console.error('Error cargando etiquetas:', err);
      }
    };

    loadTags();
  }, []);

  // Verificar existencia cuando cambian campos relevantes
  useEffect(() => {
    if (form.tmdb_id && form.tipo) {
      checkExistenceInCatalog(form.tmdb_id, form.tipo);
    } else {
      setExistStatus(null);
    }
  }, [form.tmdb_id, form.tipo]);

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
    if (currentLanguage !== 'es' && form.tmdb_id) {
      try {
        const spanishUrl = `${TMDB_URL}?id=${encodeURIComponent(form.tmdb_id)}&media_type=${encodeURIComponent(tmdbDetails?.media_type || (form.tipo?.toLowerCase().includes('serie') ? 'tv' : 'movie'))}&language=es-ES`;
        const spanishRes = await fetch(spanishUrl);
        
        if (spanishRes.ok) {
          const spanishData = await spanishRes.json();
          
          // Reemplazar los campos de texto con la versión en español para guardar
          formDataToSave = {
            ...formDataToSave,
            titulo: spanishData.title || spanishData.name || form.titulo,
            sinopsis: spanishData.overview || form.sinopsis,
            // Mantener el título en inglés si existe en los datos originales
            titulo_ingles: spanishData.original_title || spanishData.original_name || form.titulo_ingles
          };
        }
      } catch (error) {
        console.warn('No se pudieron obtener datos en español, usando datos actuales:', error);
        // Si falla, continuar con los datos actuales
      }
    }

    const body = {
      ...formDataToSave,
      anio: Number(formDataToSave.anio),
      temporadas: formDataToSave.temporadas ? Number(formDataToSave.temporadas) : null,
      episodios: formDataToSave.episodios ? Number(formDataToSave.episodios) : null,
      nota_personal: formDataToSave.nota_personal ? Number(formDataToSave.nota_personal) : null,
      tmdb_id: formDataToSave.tmdb_id || null,
      titulo_ingles: formDataToSave.titulo_ingles || '',
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
        addNotification(
          t('addMedia.addedSuccessfully', '{{title}} se ha añadido correctamente')
            .replace('{{title}}', form.titulo),
          'success'
        );
        
        // Reset form
        setForm({
          titulo: '',
          titulo_ingles: '',
          anio: '',
          genero: '',
          sinopsis: '',
          director: '',
          elenco: '',
          imagen: '',
          estado: '',
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
    
    try {
      const jwtToken = localStorage.getItem('jwt_token');
      const headers = jwtToken ? { 'Authorization': `Bearer ${jwtToken}` } : {};
      
      const tipoPreferido = form.tipo?.toLowerCase() === 'serie' ? 'serie' : (form.tipo?.toLowerCase() === 'película' ? 'película' : '');
      const tmdbLang = getTmdbLanguage(currentLanguage);
      const url = tipoPreferido ? 
        `${TMDB_URL}?title=${encodeURIComponent(searchTitle)}&tipo_preferido=${encodeURIComponent(tipoPreferido)}&listar=true&language=${tmdbLang}` : 
        `${TMDB_URL}?title=${encodeURIComponent(searchTitle)}&listar=true&language=${tmdbLang}`;
      
      const response = await fetch(url, { headers });
      
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.detail || t('addMedia.tmdbSearchError', 'Error en la búsqueda de TMDb'));
      }
      
      const data = await response.json();
      
      if (data.opciones && data.opciones.length > 0) {
        setTmdbOptions(data.opciones);
        setTmdbError('');
      } else {
        setTmdbError(t('addMedia.noTmdbResults', 'No se encontraron resultados en TMDb'));
      }
    } catch (err) {
      setTmdbError(err.message);
    } finally {
      setLoadingTmdb(false);
    }
  }, [searchTitle, form.tipo, currentLanguage, t]);

  const handleTmdbSelect = useCallback(async (opcion) => {
    setSelectingTmdb(opcion.id);
    
    try {
      const jwtToken = localStorage.getItem('jwt_token');
      const headers = jwtToken ? { 'Authorization': `Bearer ${jwtToken}` } : {};
      
      const tmdbLang = getTmdbLanguage(currentLanguage);
      const url = `${TMDB_URL}?id=${encodeURIComponent(opcion.id)}&media_type=${encodeURIComponent(opcion.media_type)}&language=${tmdbLang}`;
      const response = await fetch(url, { headers });
      
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.detail || t('addMedia.tmdbDetailsError', 'Error al obtener detalles de TMDb'));
      }
      
      const details = await response.json();
      
      // Preservar media_type de la opción original
      const detailsWithMediaType = {
        ...details,
        media_type: opcion.media_type
      };
      
      setTmdbDetails(detailsWithMediaType);
      setForm(prev => ({
        ...prev,
        titulo: details.titulo || '',
        titulo_ingles: details.titulo_original || details.original_title || '',
        anio: details.anio || '',
        genero: details.genero || '',
        sinopsis: details.sinopsis || '',
        director: details.director || '',
        elenco: details.elenco || '',
        imagen: details.imagen || '',
        estado: details.estado || '',
        tipo: details.tipo || '',
        temporadas: details.temporadas || '',
        episodios: details.episodios || '',
        nota_personal: '',
        tmdb_id: opcion.id || ''
      }));
      
      addNotification(
        t('addMedia.tmdbDataLoaded', 'Datos cargados desde TMDb'),
        'success'
      );
      
      // Chequear existencia en catálogo
      if (opcion.id && details.tipo) {
        checkExistenceInCatalog(opcion.id, details.tipo);
      }
      
    } catch (err) {
      addNotification(err.message, 'error');
    } finally {
      setSelectingTmdb(null);
    }
  }, [currentLanguage, t]);

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
      console.error('Error creating tag:', err);
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
      console.error('Error deleting tag:', err);
    }
  };

  const handleTagChange = (tagIds) => {
    setSelectedTags(tagIds);
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
                      titulo_ingles: '',
                      anio: '',
                      genero: '',
                      sinopsis: '',
                      director: '',
                      elenco: '',
                      imagen: '',
                      estado: '',
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
                    name="titulo_ingles"
                    value={form.titulo_ingles}
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
                    value={form.tipo}
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
                    name="estado"
                    value={form.estado}
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
                  const tmdbLang = getTmdbLanguage(currentLanguage);
                  const url = `${TMDB_URL}?id=${encodeURIComponent(item.id)}&media_type=${encodeURIComponent(item.media_type || (form.tipo?.toLowerCase().includes('serie') ? 'tv' : 'movie'))}&language=${tmdbLang}`;
                  
                  const res = await fetch(url);
                  
                  if (!res.ok) {
                    const err = await res.json();
                    setTmdbError(err.detail || t('addMedia.tmdbDetailsError', 'Error al obtener detalles de TMDb'));
                    return;
                  }
                  
                  const data = await res.json();
                  
                  // Preservar media_type del item original
                  const dataWithMediaType = {
                    ...data,
                    media_type: item.media_type || (form.tipo?.toLowerCase().includes('serie') ? 'tv' : 'movie')
                  };
                  
                  // Actualizar formulario con los nuevos datos
                  setForm({
                    titulo: data.titulo || '',
                    titulo_ingles: data.titulo_original || data.original_title || '',
                    anio: data.anio || '',
                    genero: data.genero || '',
                    sinopsis: data.sinopsis || '',
                    director: data.director || '',
                    elenco: data.elenco || '',
                    imagen: data.imagen || '',
                    estado: data.estado || '',
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
                  addNotification(
                    t('addMedia.relatedSelected', 'Contenido relacionado seleccionado'),
                    'success'
                  );
                  
                  // Chequear existencia en catálogo
                  if (item.id && data.tipo) {
                    await checkExistenceInCatalog(item.id.toString(), data.tipo);
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
