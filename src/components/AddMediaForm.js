import React, { useState, useEffect } from 'react';
import './AddMediaForm.css';
import { useNotification } from '../context/NotificationContext';
import TagsModal from './TagsModal';
import TmdbIdConflictModal from './TmdbIdConflictModal';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API_URL = BACKEND_URL + '/medias';
const TMDB_URL = BACKEND_URL + '/tmdb';

export default function AddMediaForm({ onAdded }) {
  const { showNotification } = useNotification();
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
  const [resultMsg, setResultMsg] = useState('');
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
    fetch(BACKEND_URL + '/tags')
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
      errors.push('El título es obligatorio');
    }
  
    if (formData.anio) {
      const year = Number(formData.anio);
      if (isNaN(year) || year < 1888 || year > new Date().getFullYear()) {
        errors.push('El año no es válido');
      }
    }
  
    if (formData.nota_personal) {
      const rating = Number(formData.nota_personal);
      if (isNaN(rating) || rating < 0 || rating > 10) {
        errors.push('La nota personal debe estar entre 0 y 10');
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
      titulo_ingles: form.titulo_ingles || '',
      tags: selectedTags
    };

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      if (response.ok) {
        const nuevoMedia = await response.json(); // Capturar el nuevo medio
        const tipoTexto = (form.tipo && form.tipo.toLowerCase().includes('serie')) ? 'Serie' : 'Película';
        setResultMsg(tipoTexto + ' añadida con éxito');
        showNotification(tipoTexto + ' añadida con éxito', 'success');
        onAdded && onAdded(nuevoMedia); // Pasar el nuevo medio a onAdded
        setForm({
          titulo: '', anio: '', genero: '', sinopsis: '', director: '', elenco: '', imagen: '', estado: '', tipo: '', temporadas: '', episodios: '', nota_personal: '', tmdb_id: ''
        });
        setSelectedTags([]);
      } else {
        const err = await response.json();
        let custom = null;
        try {
          custom = typeof err.detail === 'string' && err.detail.startsWith('{') ? JSON.parse(err.detail.replace(/'/g,'"')) : err.detail;
        } catch {}
        // Manejo de errores de validación de FastAPI (array de objetos)
        if (Array.isArray(err.detail)) {
          const msg = err.detail.map(e => e.msg).join('\n');
          setResultMsg(msg);
          showNotification(msg, 'error');
          return;
        }
        if (custom && custom.custom_type === 'tmdb_id_exists') {
  setTmdbConflict({
    open: true,
    titulo: custom.titulo,
    tipo: custom.tipo,
    onConfirm: async () => {
      setTmdbConflict(conf => ({ ...conf, open: false }));
      const response2 = await fetch(API_URL + '?forzar=true', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      if (response2.ok) {
        const nuevoMedia = await response2.json();
        const tipoTexto = (form.tipo && form.tipo.toLowerCase().includes('serie')) ? 'Serie' : 'Película';
        setResultMsg(tipoTexto + ' añadida con éxito');
        showNotification(tipoTexto + ' añadida con éxito', 'success');
        onAdded && onAdded(nuevoMedia);
        setForm({
          titulo: '', anio: '', genero: '', sinopsis: '', director: '', elenco: '', imagen: '', estado: '', tipo: '', temporadas: '', episodios: '', nota_personal: '', tmdb_id: ''
        });
        setSelectedTags([]);
        return;
      } else {
        setSubmitStatus({type: 'error', msg: 'Error al forzar el guardado'});
        showNotification('Error al forzar el guardado', 'error');
        return;
      }
    },
    onCancel: () => {
      setTmdbConflict(conf => ({ ...conf, open: false }));
      setSubmitStatus({type: 'warn', msg: custom.message});
      showNotification(custom.message, 'warning');
    }
  });
  return;
}
        if (Array.isArray(err.detail)) {
          const msg = err.detail.map(e => e.msg).join('\n');
          setSubmitStatus({type: 'error', msg});
          showNotification(msg, 'error');
        } else {
          setSubmitStatus({type: 'error', msg: err.detail || 'Error al añadir'});
          showNotification(err.detail || 'Error al añadir', 'error');
        }
      }
    } catch {
      setSubmitStatus({type: 'error', msg: 'Error de conexión'});
      showNotification('Error de conexión', 'error');
    }
  };

  const handleTmdbSearch = async e => {
    e.preventDefault();
    setLoadingTmdb(true);
    setTmdbError('');
    setTmdbOptions([]);
    setTmdbDetails(null);
    try {
      const tipoPreferido = form.tipo?.toLowerCase() === 'serie' ? 'serie' : (form.tipo?.toLowerCase() === 'película' ? 'película' : '');
      const url = tipoPreferido ? `${TMDB_URL}?title=${encodeURIComponent(searchTitle)}&tipo_preferido=${encodeURIComponent(tipoPreferido)}&listar=true` : `${TMDB_URL}?title=${encodeURIComponent(searchTitle)}&listar=true`;
      const res = await fetch(url);
      if (!res.ok) {
        const err = await res.json();
        setTmdbError(err.detail || 'No encontrado');
        setLoadingTmdb(false);
        return;
      }
      const data = await res.json();
      if (data.opciones && data.opciones.length > 1) {
        setTmdbOptions(data.opciones);
        setTmdbError('Elige la opción correcta:');
      } else if (data.opciones && data.opciones.length === 1) {
        handleTmdbSelect(data.opciones[0]);
      } else {
        setTmdbError('No se encontraron opciones válidas.');
      }
    } catch (err) {
      setTmdbError('Error de conexión');
    }
    setLoadingTmdb(false);
  };

  const handleTmdbSelect = async (opcion) => {
    setLoadingTmdb(true);
    setTmdbError('');
    setTmdbOptions([]);
    setTmdbDetails(null);
    try {
      const url = `${TMDB_URL}?id=${encodeURIComponent(opcion.id)}&media_type=${encodeURIComponent(opcion.media_type)}`;
      const res = await fetch(url);
      if (!res.ok) {
        const err = await res.json();
        setTmdbError(err.detail || 'No encontrado');
        setLoadingTmdb(false);
        return;
      }
      const data = await res.json();

      console.log('[AddMediaForm] Opción seleccionada:', opcion);
      console.log('[AddMediaForm] Respuesta completa de la API:', data);
      const formToSet = {
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
        nota_imdb: data.nota_tmdb || '', // mapeo TMDb -> IMDb
        tmdb_id: opcion.id || '',
      };
      console.log('[AddMediaForm] Formulario tras seleccionar TMDb:', formToSet);
      setForm(formToSet);
      setTmdbDetails(data);
      setTmdbError('');
    } catch (err) {
      setTmdbError('Error de conexión');
    }
    setLoadingTmdb(false);
  };

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
        showNotification('Etiqueta creada con éxito', 'success');
      }
    } catch (err) {
      showNotification('Error creando etiqueta', 'error');
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
        showNotification('Etiqueta eliminada con éxito', 'success');
      }
    } catch (err) {
      showNotification('Error eliminando etiqueta', 'error');
    }
  };

  const handleTagChange = (tagIds) => {
    setSelectedTags(tagIds);
  };

  return (
    <>
      <TmdbIdConflictModal
        open={tmdbConflict.open}
        titulo={tmdbConflict.titulo}
        tipo={tmdbConflict.tipo}
        onConfirm={tmdbConflict.onConfirm}
        onCancel={tmdbConflict.onCancel}
      />
      <div className="addmedia-container addmedia-visual">
      <h2 className="addmedia-title">Añadir Película o Serie</h2>
      <div className="addmedia-content">
        <form onSubmit={handleSubmit} className="addmedia-form">
          <div className="add-tmdb-row">
            <input
              className="add-tmdb-input"
              type="text"
              value={searchTitle}
              onChange={e => setSearchTitle(e.target.value)}
              placeholder="Buscar en TMDb..."
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleTmdbSearch(e);
                }
              }}
            />
            <button onClick={handleTmdbSearch} disabled={loadingTmdb || !searchTitle} type="button" className="add-tmdb-btn">
              {loadingTmdb ? <span className="spinner"></span> : <span><img src="https://img.icons8.com/ios-filled/20/ffffff/search--v1.png" alt="Buscar" style={{verticalAlign:'middle',marginRight:4}}/>Buscar TMDb</span>}
            </button>
          </div>

          <div className="addmedia-fields">

          </div>
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
                    <div className="add-tmdb-type">{op.media_type === 'movie' ? '🎬 Película' : '📺 Serie'}</div>
                    <div className="add-tmdb-rating">{op.nota_tmdb ? `⭐ ${op.nota_tmdb.toFixed(1)}` : ''} {op.votos_tmdb ? `(${op.votos_tmdb} votos)` : ''}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {tmdbDetails && (
            <>
              <div className="addmedia-fields">
                <input name="titulo" value={form.titulo} onChange={handleChange} placeholder="Título" required className="addmedia-field" />
                <input name="titulo_ingles" value={form.titulo_ingles} onChange={handleChange} placeholder="Título original / en inglés" className="addmedia-field" />
                <input name="anio" value={form.anio} onChange={handleChange} placeholder="Año" type="number" required className="addmedia-field" />
                <input name="genero" value={form.genero} onChange={handleChange} placeholder="Género" className="addmedia-field" />
                <input name="tipo" value={form.tipo} onChange={handleChange} placeholder="Tipo (película o serie)" required className="addmedia-field" />
                <input name="director" value={form.director} onChange={handleChange} placeholder="Director" className="addmedia-field" />
                <input name="elenco" value={form.elenco} onChange={handleChange} placeholder="Reparto principal" className="addmedia-field" />
                <input name="imagen" value={form.imagen} onChange={handleChange} placeholder="URL de la imagen" className="addmedia-field" />
                <input name="tmdb_id" value={form.tmdb_id} onChange={handleChange} placeholder="ID de TMDb" className="addmedia-field" />
                <input name="temporadas" value={form.temporadas} onChange={handleChange} placeholder="Temporadas (solo series)" type="number" className="addmedia-field" />
                <input name="episodios" value={form.episodios} onChange={handleChange} placeholder="Episodios (solo series)" type="number" className="addmedia-field" />
                <input name="nota_personal" value={form.nota_personal} onChange={handleChange} placeholder="Nota personal (0-10)" type="number" step="0.1" className="addmedia-field" />
                {tmdbDetails && tmdbDetails.nota_tmdb && (
                  <div className="addmedia-tmdb-rating">
                    Nota TMDb: <strong>{tmdbDetails.nota_tmdb.toFixed(1)}</strong>
                  </div>
                )}
                <textarea name="sinopsis" value={form.sinopsis} onChange={handleChange} placeholder="Sinopsis" className="addmedia-field addmedia-textarea" />
                <input name="estado" value={form.estado} onChange={handleChange} placeholder="Estado (vista, pendiente, etc.)" className="addmedia-field" />
              </div>
              <div className="addmedia-tags-section">
                <button 
                  type="button" 
                  className="addmedia-tags-btn"
                  onClick={() => setShowTagsModal(true)}
                >
                  Gestionar Etiquetas
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
              <button type="submit" className="addmedia-submit-btn">Añadir</button>
            </>
          )}
        </form>
      </div>
      {showTagsModal && (
        <TagsModal
          tags={tags}
          selectedTags={selectedTags}
          onTagChange={handleTagChange}
          onCreateTag={handleCreateTag}
          onDeleteTag={handleDeleteTag}
          onClose={() => setShowTagsModal(false)}
        />
      )}
    </div>
    </>
  );
}
