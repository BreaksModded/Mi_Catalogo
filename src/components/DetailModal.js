import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import './DetailModal.css';
import FavoriteButton from './FavoriteButton';
import PendingButton from './PendingButton';
import ListasModal from './ListasModal';
import { getPlatformLink } from './platformLinks';

// Componente para mostrar plataformas de streaming
function getPlatformHome(providerName) {
  if (!providerName) return null;
  const name = providerName.trim().toLowerCase();
  switch (name) {
    case 'netflix': return 'https://www.netflix.com/';
    case 'amazon prime video':
    case 'prime video': return 'https://www.primevideo.com/';
    case 'disney plus':
    case 'disney+': return 'https://www.disneyplus.com/';
    case 'apple tv plus':
    case 'apple tv+': return 'https://tv.apple.com/';
    case 'hbo max': return 'https://play.hbomax.com/';
    case 'filmin': return 'https://www.filmin.es/';
    case 'movistar plus': return 'https://ver.movistarplus.es/';
    case 'rakuten tv': return 'https://rakuten.tv/es/';
    case 'google play movies': return 'https://play.google.com/store/movies';
    case 'microsoft store': return 'https://www.microsoft.com/es-es/store/movies-and-tv';
    case 'atresplayer':
    case 'atres player': return 'https://www.atresplayer.com/';
    case 'rtve play': return 'https://www.rtve.es/play/';
    case 'flixolé':
    case 'flixole': return 'https://flixole.com/';
    case 'vodafone tv': return 'https://vodafone.tv/';
    case 'orange tv': return 'https://orangetv.orange.es/';
    case 'skyshowtime': return 'https://www.skyshowtime.com/es/';
    case 'youtube':
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

  useEffect(() => {
    if (!tmdbId || !mediaType) return;
    setLoading(true);
    setError('');
    // 1. Cargar plataformas
    fetch(`https://api.themoviedb.org/3/${mediaType}/${tmdbId}/watch/providers?api_key=ffac9eb544563d4d36980ea638fca7ce`)
      .then(res => res.ok ? res.json() : res.json().then(err => { throw new Error(err.status_message || 'Error TMDb'); }))
      .then(data => {
        setProviders(data.results && data.results[country] ? data.results[country] : null);
      })
      .catch(() => setError('No se pudo obtener disponibilidad en streaming.'));
    // 2. Cargar external_ids para enlaces directos
    fetch(`https://api.themoviedb.org/3/${mediaType}/${tmdbId}/external_ids?api_key=ffac9eb544563d4d36980ea638fca7ce`)
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
        {tipo==='flat' ? 'Suscripción:' : tipo==='rent' ? 'Alquiler:' : 'Compra:'}
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
      <b>Disponibilidad en streaming:</b>
      {loading && <span style={{marginLeft:8}}>Cargando...</span>}
      {error && <span style={{color:'#c00', marginLeft:8}}>{error}</span>}
      {!loading && !error && providers && (
        <div className="streaming-providers-list">
          {providers.flatrate && providers.flatrate.length > 0 && renderProviders(providers.flatrate, 'flat')}
          {providers.rent && providers.rent.length > 0 && renderProviders(providers.rent, 'rent')}
          {providers.buy && providers.buy.length > 0 && renderProviders(providers.buy, 'buy')}
          {!providers.flatrate && !providers.rent && !providers.buy && (
            <span style={{color:'#888'}}>No disponible en plataformas conocidas.</span>
          )}
        </div>
      )}
      {!loading && !error && !providers && (
        <span style={{color:'#888', marginLeft:8}}>No disponible en plataformas conocidas.</span>
      )}
    </div>
  );
}


const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const TMDB_URL = BACKEND_URL + '/tmdb';

function DetailModal({ media, onClose, onDelete, onToggleFavorite, onTogglePending, tags, onAddTag, onRemoveTag, onUpdate }) {
  const [tmdbDetails, setTmdbDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showDelete, setShowDelete] = useState(false);
  const [favorito, setFavorito] = useState(false);
  const [pendiente, setPendiente] = useState(false);
  const [localTags, setLocalTags] = useState([]);
  const [selectingTags, setSelectingTags] = useState(false);
  const [selectedTags, setSelectedTags] = useState([]);
  const [showListasModal, setShowListasModal] = useState(false);
  const [listas, setListas] = useState([]);
  const [listasDeMedia, setListasDeMedia] = useState([]);
  const [listasFeedback, setListasFeedback] = useState('');

  useEffect(() => {
    if (!media) return;
    setFavorito(media.favorito || false);
    setPendiente(media.pendiente || false);
    setLocalTags(Array.isArray(media.tags) ? media.tags : []);

    const tipo = typeof media.tipo === 'string' && media.tipo.toLowerCase() === 'serie' ? 'serie' : 'película';
    setLoading(true);

    if (media.tmdb_id && media.tipo) {
      const mediaType = media.tipo.toLowerCase() === 'serie' ? 'tv' : 'movie';
      fetch(`${TMDB_URL}?id=${media.tmdb_id}&media_type=${mediaType}`)
        .then(res => res.ok ? res.json() : res.json().then(err => { throw new Error(err.detail); }))
        .then(setTmdbDetails)
        .catch(() => setError('No se pudo cargar detalles avanzados TMDb'))
        .finally(() => setLoading(false));
    } else {
      fetch(`${TMDB_URL}?title=${encodeURIComponent(media.titulo)}&tipo_preferido=${encodeURIComponent(tipo)}`)
        .then(res => res.ok ? res.json() : res.json().then(err => { throw new Error(err.detail); }))
        .then(setTmdbDetails)
        .catch(() => setError('No se pudo cargar detalles avanzados TMDb'))
        .finally(() => setLoading(false));
    }

    const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "https://mi-catalogo-backend.onrender.com";
fetch(BACKEND_URL + '/listas')
      .then(res => res.json())
      .then(data => {
        setListas(data);
        setListasDeMedia(
          data.filter(lista => Array.isArray(lista.medias) && lista.medias.some(m => m.id === media.id)).map(l => l.id)
        );
      });
  }, [media]);

  const refreshListas = () => {
    const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "https://mi-catalogo-backend.onrender.com";
fetch(BACKEND_URL + '/listas')
      .then(res => res.json())
      .then(data => {
        setListas(data);
        setListasDeMedia(
          data.filter(lista => lista.medias.some(m => m.id === media.id)).map(l => l.id)
        );
      });
  };

  if (!media) return null;

  const safeTags = Array.isArray(tags) ? tags : [];
  const availableTags = safeTags.filter(t => !localTags.some(lt => lt.id === t.id));

  const handleTagChange = (tagId, checked) => {
    setSelectedTags(prev => checked ? [...prev, tagId] : prev.filter(id => id !== tagId));
  };

  const addSelectedTags = () => {
    selectedTags.forEach(id => {
      onAddTag(media.id, parseInt(id));
      const tag = availableTags.find(t => t.id === parseInt(id));
      if (tag) setLocalTags(prev => [...prev, tag]);
    });
    setSelectedTags([]);
    setSelectingTags(false);
  };

  return (
    <div>
      <div className="detail-modal-bg" onClick={e => { if (e.target.classList.contains('detail-modal-bg')) onClose(); }}>
        <div className="detail-modal wide" onClick={e => e.stopPropagation()}>
          <button className="close-btn" onClick={onClose}>&times;</button>

          <div className="detail-modal-content">
            <div className="detail-modal-poster-container-with-actions">
              <div className="detail-modal-poster-container">
                <img src={media.imagen} alt={media.titulo} className="detail-modal-poster" />
                {media.nota_imdb && (
                  <div className="nota-imdb-badge-card">
                    <span className="nota-imdb-num-card">{Number(media.nota_imdb).toFixed(1)}</span>
                    <span className="nota-imdb-star-card">★</span>
                  </div>
                )}
                <div className="nota-personal-badge-card">
                  <span className="nota-personal-num-card">
                    {media.nota_personal > 0 ? media.nota_personal.toFixed(1) : '-'}
                  </span>
                  <span className="nota-personal-star-card">★</span>
                </div>
              </div>

              <div className="detail-modal-actions-under-poster">
                <PendingButton isPending={pendiente} onToggle={() => { onTogglePending(media.id); setPendiente(p => !p); }} />
                <FavoriteButton isFavorite={favorito} onToggle={() => { onToggleFavorite(media.id); setFavorito(f => !f); }} small />
                <button className="mini-action-btn" title="Añadir a lista" onClick={() => setShowListasModal(true)}>
                  <span role="img" aria-label="listas">📂</span>
                </button>
                {listasFeedback && <span className="listas-feedback-detail">{listasFeedback}</span>}
                <button className="mini-action-btn delete-btn" title="Eliminar" onClick={() => setShowDelete(true)}>
                  <span role="img" aria-label="Eliminar">🗑️</span>
                </button>
              </div>
            </div>

            <div className="detail-modal-info">
              <h2>{media.titulo} <span className="detail-modal-year">({media.anio})</span></h2>
              <p><strong>Género:</strong> {media.genero}</p>
              <p><strong>Director:</strong> {media.director}</p>
              <p><strong>Reparto:</strong> {media.elenco}</p>
              <p><strong>Sinopsis:</strong> {media.sinopsis}</p>
              <p><strong>Estado:</strong> {media.estado}</p>

              <div className="media-tags-block">
                <div className="media-tags-header">
                  <strong>Etiquetas</strong>
                  <button 
                    className={`tags-toggle-btn ${selectingTags ? 'active' : ''}`}
                    onClick={() => { setSelectingTags(!selectingTags); setSelectedTags([]); }}
                  >
                    {selectingTags ? 'Cancelar' : 'Gestionar'}
                  </button>
                </div>
                {localTags.map(tag => (
                  <span className="media-tag" key={tag.id}>
                    {tag.nombre}
                    <button className="remove-tag-btn" onClick={() => {
                      onRemoveTag(media.id, tag.id);
                      setLocalTags(prev => prev.filter(t => t.id !== tag.id));
                    }}>×</button>
                  </span>
                ))}
                {selectingTags && (
                  <div className="tags-selector">
                    <div className="available-tags-list">
                      {availableTags.map(tag => (
                        <label key={tag.id} className="tag-checkbox">
                          <input
                            type="checkbox"
                            value={tag.id}
                            checked={selectedTags.includes(tag.id.toString())}
                            onChange={e => handleTagChange(e.target.value, e.target.checked)}
                          />
                          <span>{tag.nombre}</span>
                        </label>
                      ))}
                    </div>
                    {selectedTags.length > 0 && (
                      <button className="add-tags-btn" onClick={addSelectedTags}>
                        Añadir {selectedTags.length} {selectedTags.length === 1 ? 'etiqueta' : 'etiquetas'}
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="detail-modal-info">
            <div className="tmdb-extra-info-modal">
              {loading && <div>Cargando detalles avanzados TMDb...</div>}
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
                      <div style={{color:'#ff4c4c', textAlign:'center', marginTop:'16px'}}>No se pudo extraer el vídeo de YouTube.</div>
                    );
                  })() : (
                    <div style={{color:'#ff4c4c', textAlign:'center', marginTop:'16px'}}>No hay tráiler disponible para este título.</div>
                  )}
                </div>
              )}
            </div>

            {/* Apartado de anotaciones personales debajo del bloque avanzado */}
            <div className="personal-notes-block">
              <PersonalNotes media={media} onUpdate={onUpdate} onClose={onClose} />
            </div>
              {/* Apartado de disponibilidad en streaming debajo de las anotaciones */}
                {media.tmdb_id && media.tipo && (
                <StreamingAvailability tmdbId={media.tmdb_id} mediaType={media.tipo.toLowerCase() === 'serie' ? 'tv' : 'movie'} country="ES" />
              )}
            </div>

            {showDelete && (
              <div className="delete-confirm-modal-bg">
                <div className="delete-confirm-modal">
                  <div className="delete-confirm-title">¿Seguro que quieres eliminar esta {media.tipo} de la base de datos?</div>
                  <div className="delete-confirm-buttons">
                    <button className="delete-confirm-btn delete-confirm-btn-danger" onClick={() => { onDelete(media); setShowDelete(false); }}>Eliminar</button>
                    <button className="delete-confirm-btn" onClick={() => setShowDelete(false)}>Cancelar</button>
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
                  refreshListas();
                  setListasFeedback('¡Listas actualizadas!');
                  setTimeout(() => setListasFeedback(''), 1500);
                }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Componente de anotaciones personales
function PersonalNotes({ media, onUpdate, onClose }) {
  const [editMode, setEditMode] = useState(false);
  const [note, setNote] = useState(media.anotacion_personal || '');
  const [tempNote, setTempNote] = useState(note);

  const handleSave = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/media/${media.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...media,
          nota_personal: media.nota_personal || null, // Asegurar valor nulo si está vacío
          anotaciones: media.anotaciones || '' // Campo de anotaciones
        })
      });
      
      if (!response.ok) throw new Error('Error al guardar');
      
      const updatedMedia = await response.json();
      onUpdate(updatedMedia);
      onClose();
    } catch (error) {
      console.error('Error:', error);
      setError('Error al guardar los cambios');
    }
  };

  return (
    <div className="personal-notes-container">
      <div className="personal-notes-header">
        <span role="img" aria-label="nota">📝</span> <b>Anotaciones personales</b>
        {!editMode && (
          <button className="personal-notes-edit-btn" onClick={() => setEditMode(true)}>Editar</button>
        )}
      </div>
      {editMode ? (
        <div className="personal-notes-edit-block">
          <textarea
            className="personal-notes-textarea"
            value={tempNote}
            onChange={e => setTempNote(e.target.value)}
            rows={4}
            placeholder="Escribe aquí tus anotaciones personales sobre este título..."
            autoFocus
          />
          <div style={{marginTop: 8, display: 'flex', gap: 10}}>
            <button className="personal-notes-save-btn" onClick={handleSave}>Guardar</button>
            <button className="personal-notes-cancel-btn" onClick={() => { setTempNote(note); setEditMode(false); }}>Cancelar</button>
          </div>
        </div>
      ) : (
         <div className="personal-notes-view-block">
          {note && note.trim() !== '' ? (
            <ReactMarkdown>{note}</ReactMarkdown>
          ) : (
            <span style={{color: '#888'}}>No hay anotaciones personales.</span>
          )}
        </div>
      )}
    </div>
  );
}

export default DetailModal;

const TMDBDetails = ({ tmdbDetails, media }) => {
  return (
    <>
      {tmdbDetails.titulo_original && <div><b>Título original:</b> {tmdbDetails.titulo_original}</div>}
      {tmdbDetails.idioma_original && <div><b>Idioma original:</b> {tmdbDetails.idioma_original.toUpperCase()}</div>}
      {tmdbDetails.generos && <div><b>Géneros:</b> {tmdbDetails.generos}</div>}
      {tmdbDetails.pais && <div><b>País:</b> {tmdbDetails.pais}</div>}
      {tmdbDetails.duracion && <div><b>Duración:</b> {tmdbDetails.duracion} min</div>}
      {media.tipo === 'película' && (
        <>
          {tmdbDetails.presupuesto !== undefined && tmdbDetails.presupuesto !== null && (
            <div><b>Presupuesto:</b> {tmdbDetails.presupuesto > 0 ? `$${tmdbDetails.presupuesto.toLocaleString('es-ES')}` : 'No disponible'}</div>
          )}
          {tmdbDetails.recaudacion !== undefined && tmdbDetails.recaudacion !== null && (
            <div><b>Recaudación:</b> {tmdbDetails.recaudacion > 0 ? `$${tmdbDetails.recaudacion.toLocaleString('es-ES')}` : 'No disponible'}</div>
          )}
        </>
      )}
      {media.tipo === 'serie' && tmdbDetails.temporadas_detalle?.length > 0 && (
        <div className="tmdb-seasons-block">
          <h4>Temporadas y episodios</h4>
          {tmdbDetails.temporadas_detalle.map(season => (
            <details key={season.numero} className="tmdb-season">
              <summary>{season.nombre} ({season.episodios.length} episodios)</summary>
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
