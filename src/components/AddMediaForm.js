
import React, { useState, useEffect, useCallback } from 'react';
import './AddMediaForm.css';
import { useNotification } from '../context/NotificationContext';
import { useLanguage } from '../context/LanguageContext';
import TagsModalNew from './TagsModalNew';
import TmdbIdConflictModal from './TmdbIdConflictModal';
import RelatedMedia from './RelatedMedia';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "https://mi-catalogo-backend.onrender.com";
const API_URL = BACKEND_URL + '/medias';
const TMDB_URL = BACKEND_URL + '/tmdb';

export default function AddMediaForm({ onAdded }) {
  const { t, currentLanguage } = useLanguage();
  const { showNotification } = useNotification();
  
  // Mapear idioma para TMDb API
  const getTmdbLanguage = (lang) => {
    switch (lang) {
      case 'en': return 'en-US';
      case 'es': return 'es-ES';
      default: return 'en-US';
    }
  };
  
  // Chequeo de existencia en catálogo
  async function checkExistenceInCatalog(tmdb_id, tipo) {
    setExistStatus(null);
    setExistMsg('');
    try {
      const jwtToken = localStorage.getItem('jwt_token');
      const headers = jwtToken ? {
        'Authorization': `Bearer ${jwtToken}`
      } : {};
      
      const url = `${API_URL}?tmdb_id=${encodeURIComponent(tmdb_id)}&tipo=${encodeURIComponent(tipo)}`;
      const res = await fetch(url, { headers });
      if (!res.ok) throw new Error('Error al comprobar existencia');
      const data = await res.json();
      // Se espera que el backend devuelva un array de medias
      if (Array.isArray(data) && data.length > 0) {
        setExistStatus({ exists: true, tipo });
        setExistMsg(
          tipo.toLowerCase().includes('serie')
            ? t('addMedia.seriesExistsInCatalog', 'Esta serie ya existe en tu catálogo')
            : t('addMedia.movieExistsInCatalog', 'Esta película ya existe en tu catálogo')
        );
      } else {
        setExistStatus({ exists: false, tipo });
        setExistMsg(
          tipo.toLowerCase().includes('serie')
            ? t('addMedia.seriesNotInCatalog', 'Esta serie no existe en tu catálogo')
            : t('addMedia.movieNotInCatalog', 'Esta película no existe en tu catálogo')
        );
      }
    } catch (err) {
      setExistStatus(null);
      setExistMsg(t('addMedia.checkingExistence', 'No se pudo comprobar la existencia'));
    }
  }
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
  const [resultMsg, setResultMsg] = useState('');
const [existStatus, setExistStatus] = useState(null); // { exists: bool, tipo: 'película'|'serie' }
const [existMsg, setExistMsg] = useState('');

  // Actualizar aviso de existencia cuando cambian los campos relevantes
  useEffect(() => {
    // Solo chequear si hay datos válidos
    if (form.tmdb_id && form.tipo) {
      checkExistenceInCatalog(form.tmdb_id, form.tipo);
    } else {
      setExistStatus(null);
      setExistMsg('');
    }
    // Limpiar aviso si cambia la selección
    // eslint-disable-next-line
  }, [form.tmdb_id, form.tipo]);
  const [searchTitle, setSearchTitle] = useState('');
  const [loadingTmdb, setLoadingTmdb] = useState(false);
  const [tmdbError, setTmdbError] = useState('');
  const [tmdbOptions, setTmdbOptions] = useState([]);
  const [tmdbDetails, setTmdbDetails] = useState(null);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [tags, setTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [showTagsModal, setShowTagsModal] = useState(false);
  // Estado para el modal de conflicto TMDb ID
  const [tmdbConflict, setTmdbConflict] = useState({ open: false, titulo: '', tipo: '', onConfirm: null });

  useEffect(() => {
    // Cargar etiquetas al montar el componente
    const jwtToken = localStorage.getItem('jwt_token');
    const headers = jwtToken ? {
      'Authorization': `Bearer ${jwtToken}`
    } : {};
    
    fetch(BACKEND_URL + '/tags', { headers })
      .then(res => res.json())
      .then(data => setTags(data))
      .catch(err => console.error('Error cargando etiquetas:', err));
  }, []);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validateForm = (formData) => {
    const errors = [];
    
    if (!formData.titulo.trim()) {
      errors.push(t('addMedia.titleRequired', 'El título es obligatorio'));
    }
  
    if (formData.anio) {
      const year = Number(formData.anio);
      if (isNaN(year) || year < 1888 || year > new Date().getFullYear()) {
        errors.push(t('addMedia.invalidYear', 'El año no es válido'));
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
    setSubmitStatus(null);
    setResultMsg('');

    const errors = validateForm(form);
    if (errors.length > 0) {
      setResultMsg(errors.join('\n'));
      return;
    }

    const body = {
      ...form,
      anio: Number(form.anio),
      temporadas: form.temporadas ? Number(form.temporadas) : null,
      episodios: form.episodios ? Number(form.episodios) : null,
      nota_personal: form.nota_personal ? Number(form.nota_personal) : null,
      tmdb_id: form.tmdb_id || null,
      original_title: form.original_title || '',
      tags: selectedTags
    };

    try {
      const jwtToken = localStorage.getItem('jwt_token');
      if (!jwtToken) {
        setResultMsg(t('auth.loginRequired', 'Debes iniciar sesión para añadir contenido'));
        showNotification(t('auth.loginRequired', 'Debes iniciar sesión para añadir contenido'), 'error');
        return;
      }

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwtToken}`
        },
        body: JSON.stringify(body)
      });
      if (response.ok) {
        const nuevoMedia = await response.json(); // Capturar el nuevo medio
        const tipoTexto = (form.tipo && form.tipo.toLowerCase().includes('serie')) ? t('general.series', 'Serie') : t('general.movie', 'Película');
        const successMsg = (form.tipo && form.tipo.toLowerCase().includes('serie')) ? t('addMedia.seriesAddedSuccess', 'Serie añadida con éxito') : t('addMedia.movieAddedSuccess', 'Película añadida con éxito');
        setResultMsg(successMsg);
        showNotification(successMsg, 'success');
        onAdded && onAdded(nuevoMedia); // Pasar el nuevo medio a onAdded
        // No limpiar el formulario ni los tags para mantener colección y recomendaciones visibles
      } else {
        const err = await response.json();
        let custom = null;
        // Si err.detail es un string que parece un objeto, parsea y extrae el mensaje limpio
        if (typeof err.detail === 'string' && err.detail.trim().startsWith('{')) {
          try {
            custom = JSON.parse(err.detail.replace(/'/g, '"'));
            if (custom && custom.custom_type === 'tmdb_id_exists') {
              let msg = '';
              if (typeof custom.message === 'string') {
                msg = custom.message;
              } else {
                const nombre = custom.titulo || 'este título';
                const tipo = custom.tipo || '';
                msg = `${t('addMedia.duplicateMessage', 'Ya tienes')} "${nombre}"${tipo ? ` (${tipo})` : ''} ${t('addMedia.inCatalog', 'en tu catálogo.')}`;
              }
              setResultMsg(msg);
              showNotification(msg, 'error');
              return;
            } else {
              setResultMsg(t('addMedia.unexpectedError', 'Error inesperado.'));
              showNotification(t('addMedia.unexpectedError', 'Error inesperado.'), 'error');
              return;
            }
          } catch {
            setResultMsg(t('addMedia.duplicateEntry', 'Ya existe una entrada con este TMDb ID en tu catálogo.'));
            showNotification(t('addMedia.duplicateEntry', 'Ya existe una entrada con este TMDb ID en tu catálogo.'), 'error');
            return;
          }
        }
        // Manejo de errores de validación de FastAPI (array de objetos)
        if (Array.isArray(err.detail)) {
          const msg = err.detail.map(e => e.msg).join('\n');
          setResultMsg(msg);
          showNotification(msg, 'error');
          return;
        }
        // Si err.detail es un objeto (no string ni array), muestra solo el campo message si existe
        if (typeof err.detail === 'object' && err.detail !== null && !Array.isArray(err.detail)) {
          if (err.detail.custom_type === 'tmdb_id_exists') {
            let msg = '';
            if (typeof err.detail.message === 'string') {
              msg = err.detail.message;
            } else {
              const nombre = err.detail.titulo || 'este título';
              const tipo = err.detail.tipo || '';
              msg = `${t('addMedia.duplicateMessage', 'Ya tienes')} "${nombre}"${tipo ? ` (${tipo})` : ''} ${t('addMedia.inCatalog', 'en tu catálogo.')}`;
            }
            setResultMsg(msg);
            showNotification(msg, 'error');
            return;
          } else if (err.detail.message) {
            setResultMsg(err.detail.message);
            showNotification(err.detail.message, 'error');
            return;
          }
        }
        if (Array.isArray(err.detail)) {
          const msg = err.detail.map(e => e.msg).join('\n');
          setSubmitStatus({type: 'error', msg});
          showNotification(msg, 'error');
        } else {
          setSubmitStatus({type: 'error', msg: err.detail || t('addMedia.errorAdding', 'Error al añadir')});
          showNotification(err.detail || t('addMedia.errorAdding', 'Error al añadir'), 'error');
        }
      }
    } catch {
      setSubmitStatus({type: 'error', msg: t('addMedia.connectionError', 'Error de conexión')});
      showNotification(t('addMedia.connectionError', 'Error de conexión'), 'error');
    }
  };

  const handleTmdbSearch = useCallback(async (e) => {
    e.preventDefault();
    setLoadingTmdb(true);
    setTmdbError('');
    setTmdbOptions([]);
    // setTmdbDetails(null);
    try {
      const tipoPreferido = form.tipo?.toLowerCase() === 'serie' ? 'serie' : (form.tipo?.toLowerCase() === 'película' ? 'película' : '');
      const tmdbLang = getTmdbLanguage(currentLanguage);
      const url = tipoPreferido ? `${TMDB_URL}?title=${encodeURIComponent(searchTitle)}&tipo_preferido=${encodeURIComponent(tipoPreferido)}&listar=true&language=${tmdbLang}` : `${TMDB_URL}?title=${encodeURIComponent(searchTitle)}&listar=true&language=${tmdbLang}`;
      const res = await fetch(url);
      if (!res.ok) {
        const err = await res.json();
        setTmdbError(err.detail || t('addMedia.notFound', 'No encontrado'));
        setLoadingTmdb(false);
        return;
      }
      const data = await res.json();
      if (data.opciones && data.opciones.length > 1) {
        setTmdbOptions(data.opciones);
        setTmdbError(t('addMedia.chooseCorrectOption', 'Elige la opción correcta:'));
      } else if (data.opciones && data.opciones.length === 1) {
        // Llamar handleTmdbSelect directamente sin dependencia circular
        const opcion = data.opciones[0];
        setExistStatus(null);
        setExistMsg('');
        
        setLoadingTmdb(true);
        setTmdbError('');
        setTmdbOptions([]);
        
        try {
          const tmdbLang = getTmdbLanguage(currentLanguage);
          const selectUrl = `${TMDB_URL}?id=${encodeURIComponent(opcion.id)}&media_type=${encodeURIComponent(opcion.media_type)}&language=${tmdbLang}`;
          const selectRes = await fetch(selectUrl);
          if (!selectRes.ok) {
            const selectErr = await selectRes.json();
            setTmdbError(selectErr.detail || t('addMedia.notFound', 'No encontrado'));
            setLoadingTmdb(false);
            return;
          }
          const selectData = await selectRes.json();
          
          const formToSet = {
            titulo: selectData.titulo || '',
            original_title: selectData.titulo_original || selectData.original_title || '',
            anio: selectData.anio || '',
            genero: selectData.genero || '',
            sinopsis: selectData.sinopsis || '',
            director: selectData.director || '',
            elenco: selectData.elenco || '',
            imagen: selectData.imagen || '',
            status: selectData.status || '',  // Cambiado de estado a status
            tipo: selectData.tipo || '',
            temporadas: selectData.temporadas || '',
            episodios: selectData.episodios || '',
            nota_personal: '',
            nota_imdb: selectData.nota_tmdb || '',
            tmdb_id: opcion.id || '',
          };
          
          setSelectedTags([]);
          setForm(formToSet);
          setTmdbDetails(selectData);
          setTmdbError('');
          
          if (opcion.id && selectData.tipo) {
            checkExistenceInCatalog(opcion.id, selectData.tipo);
          }
        } catch (selectErr) {
          setTmdbError(t('addMedia.connectionError', 'Error de conexión'));
        }
        setLoadingTmdb(false);
      } else {
        setTmdbError(t('addMedia.noValidOptions', 'No se encontraron opciones válidas.'));
      }
    } catch (err) {
      setTmdbError(t('addMedia.connectionError', 'Error de conexión'));
    }
    setLoadingTmdb(false);
  }, [searchTitle, form.tipo, currentLanguage, t]);

  const handleTmdbSelect = useCallback(async (opcion) => {
  setExistStatus(null);
  setExistMsg('');
  // Limpiar aviso al seleccionar una nueva opción

    setLoadingTmdb(true);
    setTmdbError('');
    setTmdbOptions([]);
    // setTmdbDetails(null);
    try {
      const tmdbLang = getTmdbLanguage(currentLanguage);
      const url = `${TMDB_URL}?id=${encodeURIComponent(opcion.id)}&media_type=${encodeURIComponent(opcion.media_type)}&language=${tmdbLang}`;
      const res = await fetch(url);
      if (!res.ok) {
        const err = await res.json();
        setTmdbError(err.detail || t('addMedia.notFound', 'No encontrado'));
        setLoadingTmdb(false);
        return;
      }
      const data = await res.json();

      
      
      const formToSet = {
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
        nota_imdb: data.nota_tmdb || '', // mapeo TMDb -> IMDb
        tmdb_id: opcion.id || '',
      };
      // Limpiar tags seleccionados al cambiar de película/serie
      setSelectedTags([]);
      setForm(formToSet);
      setTmdbDetails(data);
      setTmdbError('');
      // Chequear existencia en catálogo
      if (opcion.id && data.tipo) {
        checkExistenceInCatalog(opcion.id, data.tipo);
      }
    } catch (err) {
      setTmdbError(t('addMedia.connectionError', 'Error de conexión'));
    }
    setLoadingTmdb(false);
  }, [currentLanguage, t]);

  const handleCreateTag = async (nombre) => {
    try {
      const res = await fetch(BACKEND_URL + '/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre })
      });
      if (res.ok) {
        const newTag = await res.json();
        setTags(tags => [...tags, newTag]);
        showNotification(t('addMedia.tagCreatedSuccess', 'Etiqueta creada con éxito'), 'success');
      }
    } catch (err) {
      showNotification(t('addMedia.errorCreatingTag', 'Error creando etiqueta'), 'error');
    }
  };

  const handleDeleteTag = async (tagId) => {
    try {
      const res = await fetch(`${BACKEND_URL}/tags/${tagId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setTags(tags => tags.filter(t => t.id !== tagId));
        setSelectedTags(selected => selected.filter(id => id !== tagId));
        showNotification(t('addMedia.tagDeletedSuccess', 'Etiqueta eliminada con éxito'), 'success');
      }
    } catch (err) {
      showNotification(t('addMedia.errorDeletingTag', 'Error eliminando etiqueta'), 'error');
    }
  };

  const handleTagChange = (tagIds) => {
    setSelectedTags(tagIds);
  };

  return (
    <div className="addmedia-container addmedia-visual">
      {/* Aviso de existencia en catálogo */}
      {existMsg && (
        <div className={`addmedia-exist-floating ${existStatus?.exists ? 'addmedia-exist-warning' : 'addmedia-exist-success'}`}>
          {existMsg}
        </div>
      )}

      <TmdbIdConflictModal
        open={tmdbConflict.open}
        titulo={tmdbConflict.titulo}
        tipo={tmdbConflict.tipo}
        onConfirm={tmdbConflict.onConfirm}
        onCancel={tmdbConflict.onCancel}
      />

      <h2 className="addmedia-title">{t('addMedia.title', 'Añadir Película o Serie')}</h2>
      <div className="addmedia-content">
        <form onSubmit={handleSubmit} className="addmedia-form">
          <div className="add-tmdb-row">
            <input
              className="add-tmdb-input"
              type="text"
              value={searchTitle}
              onChange={e => setSearchTitle(e.target.value)}
              placeholder={t('addMedia.searchPlaceholder', 'Buscar en TMDb...')}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleTmdbSearch(e);
                }
              }}
            />
            <button onClick={handleTmdbSearch} disabled={loadingTmdb || !searchTitle} type="button" className="add-tmdb-btn">
              {loadingTmdb ? <span className="spinner"></span> : <span><img src="https://img.icons8.com/ios-filled/20/ffffff/search--v1.png" alt={t('actions.search', 'Buscar')} style={{verticalAlign:'middle',marginRight:4}}/>{t('addMedia.searchButton', 'Buscar TMDb')}</span>}
            </button>
          </div>

          <div className="addmedia-fields"></div>
          {tmdbError && <div className="addmedia-error">{tmdbError}</div>}
          {tmdbOptions.length > 0 && (
            <div className="add-tmdb-options">
              {tmdbOptions.map((op, idx) => (
                <div
                  key={op.id + '-' + op.media_type + '-' + idx}
                  className="add-tmdb-option-card"
                  onMouseDown={e => e.preventDefault()}
                  onClick={() => handleTmdbSelect(op)}
                  tabIndex={0}
                  role="button"
                  aria-label={`Seleccionar ${op.titulo} (${op.anio})`}
                >
                  <div className="add-tmdb-img-wrap">
                    <img src={op.imagen || 'https://via.placeholder.com/80x120?text=No+img'} alt="poster" className="add-tmdb-img-large" />
                  </div>
                  <div className="add-tmdb-info">
                    <div className="add-tmdb-title">{op.titulo} <span className="add-tmdb-year">({op.anio})</span></div>
                    <div className="add-tmdb-type">{op.media_type === 'movie' ? `🎬 ${t('general.movie', 'Película')}` : `📺 ${t('general.series', 'Serie')}`}</div>
                    <div className="add-tmdb-rating">{op.nota_tmdb ? `⭐ ${op.nota_tmdb.toFixed(1)}` : ''} {op.votos_tmdb ? `(${op.votos_tmdb} ${t('addMedia.votes', 'votos')})` : ''}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {tmdbDetails && (
            <>
              <div className="addmedia-fields">
                <input name="titulo" value={form.titulo} onChange={handleChange} placeholder={t('addMedia.titleField', 'Título')} required className="addmedia-field" />
                <input name="original_title" value={form.original_title} onChange={handleChange} placeholder={t('addMedia.originalTitleField', 'Título original')} className="addmedia-field" />
                <input name="anio" value={form.anio} onChange={handleChange} placeholder={t('addMedia.yearField', 'Año')} type="number" required className="addmedia-field" />
                <input name="genero" value={form.genero} onChange={handleChange} placeholder={t('addMedia.genreField', 'Género')} className="addmedia-field" />
                <input name="tipo" value={form.tipo} onChange={handleChange} placeholder={t('addMedia.typeField', 'Tipo (película o serie)')} required className="addmedia-field" />
                <input name="director" value={form.director} onChange={handleChange} placeholder={t('addMedia.directorField', 'Director')} className="addmedia-field" />
                <input name="elenco" value={form.elenco} onChange={handleChange} placeholder={t('addMedia.castField', 'Reparto principal')} className="addmedia-field" />
                <input name="imagen" value={form.imagen} onChange={handleChange} placeholder={t('addMedia.imageField', 'URL de la imagen')} className="addmedia-field" />
                <input name="tmdb_id" value={form.tmdb_id} onChange={handleChange} placeholder={t('addMedia.tmdbIdField', 'ID de TMDb')} className="addmedia-field" />
                <input name="temporadas" value={form.temporadas} onChange={handleChange} placeholder={t('addMedia.seasonsField', 'Temporadas (solo series)')} type="number" className="addmedia-field" />
                <input name="episodios" value={form.episodios} onChange={handleChange} placeholder={t('addMedia.episodesField', 'Episodios (solo series)')} type="number" className="addmedia-field" />
                <input name="nota_personal" value={form.nota_personal} onChange={handleChange} placeholder={t('addMedia.personalRatingField', 'Nota personal (0-10)')} type="number" step="0.1" min="0" max="10" className="addmedia-field" />
                {tmdbDetails && tmdbDetails.nota_tmdb && (
                  <div className="addmedia-tmdb-rating">
                    {t('addMedia.tmdbRatingLabel', 'Nota TMDb:')} <strong>{tmdbDetails.nota_tmdb.toFixed(1)}</strong>
                  </div>
                )}
                <textarea name="sinopsis" value={form.sinopsis} onChange={handleChange} placeholder={t('addMedia.synopsisField', 'Sinopsis')} className="addmedia-field addmedia-textarea" />
                <input name="status" value={form.status} onChange={handleChange} placeholder={t('addMedia.statusField', 'Estado (vista, pendiente, etc.)')} className="addmedia-field" />
              </div>
              <div className="addmedia-tags-section">
                <button 
                  type="button" 
                  className="addmedia-tags-btn"
                  onClick={() => setShowTagsModal(true)}
                >
                  {t('addMedia.manageTags', 'Gestionar Tags')}
                </button>
                {selectedTags.length > 0 && (
                  <div className="selected-tags">
                    {selectedTags.map(tagId => {
                      const tag = tags.find(t => t.id === tagId);
                      return tag ? (
                        <span key={tag.id} className="selected-tag">
                          {tag.nombre}
                        </span>
                      ) : null;
                    })}
                  </div>
                )}
              </div>
              <button type="submit" className="addmedia-submit-btn">{t('addMedia.addButton', 'Añadir')}</button>
              {form.tmdb_id && tmdbDetails && (
                <RelatedMedia 
                  tmdbId={form.tmdb_id.toString()} 
                  mediaType={tmdbDetails.media_type || (form.tipo?.toLowerCase().includes('serie') ? 'tv' : 'movie')}
                  onSelectMedia={async (item) => {
                    setLoadingTmdb(true);
                    setTmdbError('');
                    setTmdbOptions([]);
                    try {
                      const tmdbLang = getTmdbLanguage(currentLanguage);
                      const url = `${TMDB_URL}?id=${encodeURIComponent(item.id)}&media_type=${encodeURIComponent(item.media_type || (form.tipo?.toLowerCase().includes('serie') ? 'tv' : 'movie'))}&language=${tmdbLang}`;
                      const res = await fetch(url);
                      if (!res.ok) {
                        const err = await res.json();
                        setTmdbError(err.detail || t('addMedia.notFound', 'No encontrado'));
                        setLoadingTmdb(false);
                        return;
                      }
                      const data = await res.json();
                      const formToSet = {
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
                        nota_imdb: data.nota_tmdb || '',
                        tmdb_id: item.id || '',
                      };
                      // Limpiar tags seleccionados al seleccionar desde RelatedMedia
                      setSelectedTags([]);
                      setForm(formToSet);
                      setTmdbDetails(data);
                      setTmdbError('');
                    } catch (err) {
                      setTmdbError(t('addMedia.connectionError', 'Error de conexión'));
                    }
                    setLoadingTmdb(false);
                  }}
                />
              )}
            </>
          )}
        </form>
      </div>
      <TagsModalNew
        open={showTagsModal}
        tags={tags}
        selectedTags={selectedTags}
        onTagChange={handleTagChange}
        onCreateTag={handleCreateTag}
        onDeleteTag={handleDeleteTag}
        onClose={() => setShowTagsModal(false)}
      />
    </div>
  );
}