import React, { useEffect, useState } from 'react';
import './ListasView.css';
import ListaDetalleModal from './ListaDetalleModal';
import { useLanguage } from '../context/LanguageContext';
import { useDynamicPosters, getDynamicPosterUrl } from '../hooks/useDynamicPoster';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "https://mi-catalogo-backend.onrender.com";
const API_URL = BACKEND_URL + '/listas';

const ListaIcon = () => (
  <span style={{fontSize:'2.5em',color:'#2d6da3',marginRight:12,verticalAlign:'middle'}}>📚</span>
);
const EmptyIcon = () => (
  <span style={{fontSize:'2.7em',color:'#444'}}>🗂️</span>
);
const DeleteIcon = () => (
  <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m2 0v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6h16zM10 11v6M14 11v6"/></svg>
);
const EyeIcon = () => (
  <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3.2"/><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z"/></svg>
);

export default function ListasView() {
  const { t } = useLanguage();
  const [listas, setListas] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [error, setError] = useState('');
  const [detalleLista, setDetalleLista] = useState(null);
  const [loading, setLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState({ open: false, lista: null });

  // Obtener todas las medias de todas las listas para el hook de portadas dinámicas
  const allMedias = React.useMemo(() => {
    const medias = [];
    listas.forEach(lista => {
      if (lista.medias && Array.isArray(lista.medias)) {
        medias.push(...lista.medias);
      }
    });
    return medias;
  }, [listas]);

  // Hook para portadas dinámicas
  const postersMap = useDynamicPosters(allMedias);

  const fetchListas = () => {
    setLoading(true);
    fetch(API_URL)
      .then(res => res.json())
      .then(data => setListas(data))
      .catch(() => setListas([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchListas();
  }, []);

  const handleCrearLista = async (e) => {
    e.preventDefault();
    setError('');
    if (!nombre.trim()) {
      setError(t('lists.nameRequired', 'El nombre es obligatorio'));
      return;
    }
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, descripcion })
      });
      if (!res.ok) throw new Error(t('lists.errorCreatingGeneric', 'Error al crear la lista'));
      const nueva = await res.json();
      setListas(listas => [...listas, nueva]);
      setNombre('');
      setDescripcion('');
      setShowForm(false);
    } catch {
      setError(t('lists.errorCreating', 'No se pudo crear la lista'));
    }
  };

  const handleEliminarLista = async (listaId) => {
    try {
      const res = await fetch(`${API_URL}/${listaId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      setListas(listas => listas.filter(l => l.id !== listaId));
    } catch {
      alert(t('lists.errorDeleting', 'No se pudo eliminar la lista'));
    }
  };

  const openDeleteModal = (lista) => setConfirmDelete({ open: true, lista });
  const closeDeleteModal = () => setConfirmDelete({ open: false, lista: null });
  const confirmDeleteAction = () => {
    if (confirmDelete.lista) handleEliminarLista(confirmDelete.lista.id);
    closeDeleteModal();
  };

  return (
    <div className="listas-view">
      <div className="listas-header">
        <h2>{t('lists.title', 'Listas')}</h2>
        <div style={{display: 'flex', gap: '1rem'}}>
          <button className="crear-lista-btn" onClick={() => setShowForm(f => !f)}>
            {t('lists.createList', '+ Crear lista')}
          </button>
          <button className="crear-lista-btn" onClick={fetchListas} disabled={loading} title={t('lists.reload', 'Recargar listas')}>
            &#x21bb;
          </button>
        </div>
      </div>
      {showForm && (
        <form className="crear-lista-form" onSubmit={handleCrearLista}>
          <input
            type="text"
            value={nombre}
            onChange={e => setNombre(e.target.value)}
            placeholder={t('lists.placeholder', 'Nombre de la lista')}
            required
          />
          <input
            type="text"
            value={descripcion}
            onChange={e => setDescripcion(e.target.value)}
            placeholder={t('lists.descriptionPlaceholder', 'Descripción (opcional)')}
          />
          <button type="submit">{t('lists.create', 'Crear')}</button>
          {error && <div className="crear-lista-error">{error}</div>}
        </form>
      )} 
      {listas.length === 0 && !loading && (
        <div className="listas-vacio">{t('lists.noLists', 'No tienes ninguna lista creada todavía.')}</div>
      )} 
      <div className="listas-galeria">
        {listas.filter(lista => lista && lista.nombre && Array.isArray(lista.medias)).map(lista => (
          <div key={lista.id} className="lista-card" style={{cursor: 'pointer', position: 'relative'}} onClick={() => setDetalleLista(lista)}>
            <div className="lista-covers">
              {lista.medias.slice(0, 6).map(media => (
                <img key={media.id} src={getDynamicPosterUrl(media, postersMap)} alt={media.titulo} className="lista-cover" />
              ))}
            </div>
            <div className="lista-nombre">{lista.nombre}</div>
            {lista.descripcion && <div className="lista-desc">{lista.descripcion}</div>}
            <button 
              className="mini-action-btn delete-btn" 
              title={t('lists.deleteTitle', 'Eliminar lista')} 
              style={{position: 'absolute', top: 10, right: 10}} 
              onClick={e => { e.stopPropagation(); openDeleteModal(lista); }}
            >🗑️</button>
          </div>
        ))}
      </div> 
      {detalleLista && (
        <ListaDetalleModal lista={detalleLista} onClose={() => setDetalleLista(null)} />
      )}
      {confirmDelete.open && (
        <div className="listas-modal-bg" style={{zIndex: 50}}>
          <div className="listas-modal" style={{maxWidth: 390, textAlign: 'center', padding: '2.1rem 2.1rem 1.6rem 2.1rem'}}>
            <h3 style={{color: '#e50914', marginBottom: 18}}>{t('lists.confirmDelete', '¿Eliminar lista?')}</h3>
            <div style={{color: '#fff', fontSize: '1.08em', marginBottom: 22}}>
              {t('lists.confirmDeleteMessage', '¿Seguro que quieres eliminar la lista')} <b>"{confirmDelete.lista?.nombre}"</b>?
            </div>
            <div style={{display: 'flex', gap: 20, justifyContent: 'center', marginTop: 10}}>
              <button onClick={closeDeleteModal} style={{background:'#232323', color:'#bbb', border:'none', borderRadius:6, padding:'10px 24px', fontWeight:600, fontSize:'1em', cursor:'pointer'}}>{t('lists.cancelButton', 'Cancelar')}</button>
              <button onClick={confirmDeleteAction} style={{background:'#e50914', color:'#fff', border:'none', borderRadius:6, padding:'10px 24px', fontWeight:600, fontSize:'1em', cursor:'pointer'}}>{t('lists.deleteButton', 'Eliminar')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}