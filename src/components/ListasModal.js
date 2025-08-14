import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useLanguage } from '../context/LanguageContext';
import './ListasModal.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "https://mi-catalogo-backend.onrender.com";

export default function ListasModal({ isOpen, onClose, mediaId, onListChange }) {
  const { t } = useLanguage();
  
  // Estados principales
  const [listas, setListas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState('');
  const [updating, setUpdating] = useState(false);
  
  // Estados para nueva lista
  const [showNewListForm, setShowNewListForm] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [newListDesc, setNewListDesc] = useState('');
  const [creatingList, setCreatingList] = useState(false);

  // Helper para verificar si el token JWT es válido
  const isTokenValid = (token) => {
    if (!token) return false;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const now = Math.floor(Date.now() / 1000);
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
      localStorage.removeItem('jwt_token');
      throw new Error('No valid authentication token');
    }
    
    const headers = {
      ...(options.headers || {}),
      Authorization: `Bearer ${jwtToken}`,
    };
    
    const response = await fetch(url, { ...options, headers });
    
    if (response.status === 401) {
      localStorage.removeItem('jwt_token');
      throw new Error('Authentication expired');
    }
    
    return response;
  };

  // Cargar listas del usuario
  useEffect(() => {
    if (!isOpen || !mediaId) return;

    const loadListas = async () => {
      try {
        setLoading(true);
        setError('');
        
        const response = await authenticatedFetch(`${BACKEND_URL}/listas`);
        
        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        // Marcar qué listas contienen el media actual y obtener el total de medias
        const listasConEstado = data.map(lista => {
          // Usar los datos que ya vienen del backend
          const totalMedias = lista.total_medias || lista.medias?.length || 0;
          const contieneMedia = lista.medias && Array.isArray(lista.medias) 
            ? lista.medias.some(m => m.id === mediaId)
            : false;
          
          return {
            ...lista,
            contieneMedia,
            total_medias: totalMedias
          };
        });
        
        setListas(listasConEstado);
        
      } catch (err) {
        console.error('Error loading lists:', err);
        setError(err.message || t('lists.errorLoadingLists'));
      } finally {
        setLoading(false);
      }
    };

    loadListas();
  }, [isOpen, mediaId, t]);

  // Manejar toggle de lista
  const handleToggleList = async (listaId, currentlyInList) => {
    if (updating) return;
    
    try {
      setUpdating(true);
      setError('');
      setFeedback('');
      
      const method = currentlyInList ? 'DELETE' : 'POST';
      const response = await authenticatedFetch(`${BACKEND_URL}/listas/${listaId}/medias/${mediaId}`, {
        method
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      // Actualizar estado local
      setListas(prev => prev.map(lista => 
        lista.id === listaId 
          ? { 
              ...lista, 
              contieneMedia: !currentlyInList,
              total_medias: currentlyInList 
                ? Math.max(0, (lista.total_medias || 0) - 1)  // Decrementar si se quita
                : (lista.total_medias || 0) + 1               // Incrementar si se añade
            }
          : lista
      ));
      
      // Mostrar feedback
      const action = currentlyInList ? t('lists.removedFromList') : t('lists.addedToList');
      setFeedback(action);
      
      // Notificar al componente padre
      if (onListChange) {
        onListChange();
      }
      
      // Limpiar feedback después de 3 segundos
      setTimeout(() => setFeedback(''), 3000);
      
    } catch (err) {
      console.error('Error toggling list:', err);
      setError(err.message || t('lists.errorUpdatingList'));
    } finally {
      setUpdating(false);
    }
  };

  // Crear nueva lista
  const handleCreateList = async (e) => {
    e.preventDefault();
    
    if (!newListName.trim() || creatingList) return;
    
    try {
      setCreatingList(true);
      setError('');
      
      const response = await authenticatedFetch(`${BACKEND_URL}/listas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: newListName.trim(),
          descripcion: newListDesc.trim() || null
        })
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const nuevaLista = await response.json();
      
      // Agregar la nueva lista al estado con total_medias = 0
      setListas(prev => [...prev, { 
        ...nuevaLista, 
        contieneMedia: false,
        total_medias: 0
      }]);
      
      // Limpiar formulario y cerrar
      setNewListName('');
      setNewListDesc('');
      setShowNewListForm(false);
      
      setFeedback(t('lists.listCreated'));
      setTimeout(() => setFeedback(''), 3000);
      
    } catch (err) {
      console.error('Error creating list:', err);
      setError(err.message || t('lists.errorCreatingList'));
    } finally {
      setCreatingList(false);
    }
  };

  // Manejar cierre del modal
  const handleClose = () => {
    setShowNewListForm(false);
    setNewListName('');
    setNewListDesc('');
    setError('');
    setFeedback('');
    onClose();
  };

  // Manejar click en overlay
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  // Manejar tecla Escape
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <div className="listas-modal-new-overlay" onClick={handleOverlayClick}>
      <div className="listas-modal-new">
        {/* Header */}
        <div className="listas-modal-new__header">
          <div className="listas-modal-new__title">
            <i className="fas fa-list"></i>
            <h2>{t('lists.manageListsTitle')}</h2>
          </div>
          <button 
            className="listas-modal-new__close"
            onClick={handleClose}
            title={t('common.close')}
          >
            <i className="fas fa-times"></i>
            <span>{t('common.close')}</span>
          </button>
        </div>

        {/* Content */}
        <div className="listas-modal-new__content">
          {/* Feedback Messages */}
          {feedback && (
            <div className="listas-modal-new__feedback listas-modal-new__feedback--success">
              <i className="fas fa-check-circle"></i>
              <span>{feedback}</span>
            </div>
          )}
          
          {error && (
            <div className="listas-modal-new__feedback listas-modal-new__feedback--error">
              <i className="fas fa-exclamation-triangle"></i>
              <span>{error}</span>
            </div>
          )}

          {/* Loading State */}
          {loading ? (
            <div className="listas-modal-new__loading">
              <div className="listas-modal-new__spinner"></div>
              <p>{t('common.loading')}</p>
            </div>
          ) : (
            <>
              {/* Existing Lists Section */}
              <div className="listas-modal-new__section">
                <div className="listas-modal-new__section-header">
                  <i className="fas fa-folder-open"></i>
                  <h3>{t('lists.yourLists')}</h3>
                  <span className="listas-modal-new__count">({listas.length})</span>
                </div>

                {listas.length > 0 ? (
                  <div className="listas-modal-new__lists">
                    {listas.map(lista => (
                      <div 
                        key={lista.id} 
                        className={`listas-modal-new__list-item ${lista.contieneMedia ? 'listas-modal-new__list-item--active' : ''}`}
                      >
                        <div className="listas-modal-new__list-checkbox">
                          <div className={`listas-modal-new__checkbox ${lista.contieneMedia ? 'listas-modal-new__checkbox--checked' : ''}`}>
                            {lista.contieneMedia && <i className="fas fa-check"></i>}
                          </div>
                        </div>
                        
                        <div className="listas-modal-new__list-info">
                          <h4 className="listas-modal-new__list-name">{lista.nombre}</h4>
                          {lista.descripcion && (
                            <p className="listas-modal-new__list-desc">{lista.descripcion}</p>
                          )}
                          <div className="listas-modal-new__list-meta">
                            <i className="fas fa-film"></i>
                            <span>{lista.total_medias || 0} {t('lists.titles')}</span>
                          </div>
                        </div>
                        
                        <button
                          className={`listas-modal-new__list-action ${lista.contieneMedia ? 'listas-modal-new__list-action--remove' : 'listas-modal-new__list-action--add'}`}
                          onClick={() => handleToggleList(lista.id, lista.contieneMedia)}
                          disabled={updating}
                          title={lista.contieneMedia ? t('lists.removeFromList') : t('lists.addToList')}
                        >
                          <i className={`fas ${lista.contieneMedia ? 'fa-minus' : 'fa-plus'}`}></i>
                          {lista.contieneMedia ? t('lists.remove') : t('lists.add')}
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="listas-modal-new__empty">
                    <i className="fas fa-folder-plus"></i>
                    <h4>{t('lists.noListsYet')}</h4>
                    <p>{t('lists.createFirstList')}</p>
                  </div>
                )}
              </div>

              {/* Divider */}
              <div className="listas-modal-new__divider"></div>

              {/* New List Section */}
              <div className="listas-modal-new__section">
                {!showNewListForm ? (
                  <button
                    className="listas-modal-new__new-list-toggle"
                    onClick={() => setShowNewListForm(true)}
                  >
                    <i className="fas fa-plus"></i>
                    <span>{t('lists.createNewList')}</span>
                  </button>
                ) : (
                  <div className="listas-modal-new__new-list-form">
                    <div className="listas-modal-new__section-header">
                      <i className="fas fa-plus-circle"></i>
                      <h3>{t('lists.createNewList')}</h3>
                    </div>
                    
                    <form onSubmit={handleCreateList}>
                      <div className="listas-modal-new__form-group">
                        <label htmlFor="newListName">
                          <i className="fas fa-tag"></i>
                          {t('lists.listName')}
                        </label>
                        <input
                          id="newListName"
                          type="text"
                          value={newListName}
                          onChange={(e) => setNewListName(e.target.value)}
                          placeholder={t('lists.listNamePlaceholder')}
                          maxLength={100}
                          required
                        />
                      </div>
                      
                      <div className="listas-modal-new__form-group">
                        <label htmlFor="newListDesc">
                          <i className="fas fa-align-left"></i>
                          {t('lists.listDescription')} ({t('common.optional')})
                        </label>
                        <input
                          id="newListDesc"
                          type="text"
                          value={newListDesc}
                          onChange={(e) => setNewListDesc(e.target.value)}
                          placeholder={t('lists.listDescriptionPlaceholder')}
                          maxLength={255}
                        />
                      </div>
                      
                      <div className="listas-modal-new__form-actions">
                        <button
                          type="submit"
                          className="listas-modal-new__btn listas-modal-new__btn--primary"
                          disabled={!newListName.trim() || creatingList}
                        >
                          <i className="fas fa-plus"></i>
                          {creatingList ? t('common.creating') : t('lists.createList')}
                        </button>
                        <button
                          type="button"
                          className="listas-modal-new__btn listas-modal-new__btn--secondary"
                          onClick={() => setShowNewListForm(false)}
                          disabled={creatingList}
                        >
                          <i className="fas fa-times"></i>
                          {t('common.cancel')}
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
