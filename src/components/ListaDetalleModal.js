import React, { useState } from 'react';
import './ListaDetalleModal.css';
import DetailModal from './DetailModal';
import SectionRow from './SectionRow';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API_SEARCH = BACKEND_URL + '/search?q='; // Busca por título, actor o director
const API_ADD = BACKEND_URL + '/listas';

export default function ListaDetalleModal({ lista, onClose }) {
  const [search, setSearch] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState('');
  const [adding, setAdding] = useState(false);
  const [detalleMedia, setDetalleMedia] = useState(null);
  const [medias, setMedias] = useState(lista.medias || []);
  const [pageSize, setPageSize] = useState(0);

  // Búsqueda reactiva con debounce y resultados por título, actor o director
  React.useEffect(() => {
    if (!search.trim()) {
      setResults([]);
      setError('');
      return;
    }
    setSearching(true);
    setError('');
    const handler = setTimeout(async () => {
      try {
        const res = await fetch(API_SEARCH + encodeURIComponent(search));
        if (!res.ok) throw new Error('Error en la búsqueda');
        let data = await res.json();
        // data[] puede tener un campo match_type: ["title", "actor", "director"]
        if (!Array.isArray(data) || data.length === 0) {
          setResults([]);
          setError('No se encontraron resultados en tu catálogo');
        } else {
          setResults(data);
          setError('');
        }
      } catch (err) {
        setResults([]);
        setError('No se pudo buscar en tu catálogo');
      }
      setSearching(false);
    }, 400);
    return () => clearTimeout(handler);
  }, [search]);

  // Eliminar handleSearch y el submit del formulario, el botón solo para feedback visual
  // (no funcional)



  const handleAdd = async media => {
    setAdding(true);
    setError('');
    try {
      const res = await fetch(`${API_ADD}/${lista.id}/add_media/${media.id}`, { method: 'POST' });
      if (!res.ok) throw new Error();
      setMedias(prev => [...prev, media]);
    } catch {
      setError('No se pudo añadir a la lista');
    }
    setAdding(false);
  };

  return (
    <div className="lista-detalle-modal-bg" onClick={e => { if (e.target.classList.contains('lista-detalle-modal-bg')) onClose(); }}>
      <div className="lista-detalle-modal" onClick={e => e.stopPropagation()}>
        <button className="lista-detalle-modal-close" onClick={onClose} aria-label="Cerrar">
          <span aria-hidden="true">×</span>
        </button>
        <div className="lista-detalle-modal-content">
          <h2>{lista.nombre}</h2>
          {lista.descripcion && <div className="lista-detalle-desc">{lista.descripcion}</div>}
          {/* Buscador de películas/series */}
          <form className="lista-detalle-busqueda-form" onSubmit={e => e.preventDefault()}>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar película o serie para añadir..."
              className="lista-detalle-busqueda-input"
              style={{flex: 1}}
              autoFocus
            />
            <button type="button" className="crear-lista-btn" disabled>
              Buscar
            </button>
          </form>
          {searching && <div className="listas-feedback">Buscando...</div>}
          {error && <div className="listas-error">{error}</div>}
          {results.length > 0 && (
            <div className="lista-detalle-busqueda-resultados">
              {results.map(media => (
                <div key={media.id} className="lista-detalle-busqueda-resultado">
                  <img src={media.imagen} alt={media.titulo} style={{width:40, height:60, borderRadius:6, marginRight:12}} />
                  <span style={{color:'#fff', fontWeight:500}}>{media.titulo}</span>
                  <button className="crear-lista-btn" style={{marginLeft: 'auto'}} onClick={() => handleAdd(media)} disabled={adding || medias.some(m => m.id === media.id)}>
                    Añadir
                  </button>
                </div>
              ))}
            </div>
          )}
          {/* Grid de carátulas de la lista usando SectionRow para filas completas */}
          <div style={{marginTop: 24}}>
            <SectionRow
              title={null}
              items={pageSize > 0 ? medias.slice(0, pageSize) : medias}
              onSelect={media => {
                // Lógica de abrir detalle igual que antes
                if (media.sinopsis && media.director && media.genero && media.anio) {
                  setDetalleMedia(media);
                } else {
                  fetch(`${BACKEND_URL}/medias/${media.id}`)
                    .then(res => res.ok ? res.json() : media)
                    .then(fullMedia => setDetalleMedia(fullMedia))
                    .catch(() => setDetalleMedia(media));
                }
              }}
              carousel={false}
              onPageSizeChange={size => setPageSize(size)}
            />
            {medias.length === 0 && <div className="lista-detalle-vacio">Esta lista está vacía.</div>}
          </div>
          {detalleMedia && (
            <div className="detail-modal-from-list">
              <DetailModal
                media={detalleMedia}
                onClose={() => setDetalleMedia(null)}
                onUpdate={setDetalleMedia}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
