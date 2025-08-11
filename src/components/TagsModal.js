import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useNotification } from '../context/NotificationContext';
import './TagsModal.css';

function TagsModal({ open, tags, selectedTags, onTagChange, onCreateTag, onDeleteTag, onClose }) {
  const [newTagName, setNewTagName] = useState('');
  const [error, setError] = useState('');
  const [deleteMode, setDeleteMode] = useState(false);
  const [tagsToDelete, setTagsToDelete] = useState([]);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [tagSearch, setTagSearch] = useState('');
  const { t } = useLanguage();
  const { showNotification } = useNotification();

  // Normalizador para búsqueda
  const normalize = (s) => (s || '').toString().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

  // Filtrar tags basado en la búsqueda
  const filteredTags = tagSearch 
    ? tags.filter(tag => normalize(tag.nombre).includes(normalize(tagSearch)))
    : tags;

  const handleCreateTag = async () => {
    const trimmedName = newTagName.trim();
    if (!trimmedName) {
      const msg = t('tags.nameRequired', 'El nombre del tag no puede estar vacío');
      setError(msg);
      showNotification(msg, 'error');
      return;
    }
    if (tags.some(tg => tg.nombre.toLowerCase() === trimmedName.toLowerCase())) {
      const msg = t('tags.nameExists', 'Ya existe un tag con ese nombre');
      setError(msg);
      showNotification(msg, 'error');
      return;
    }
    try {
      await Promise.resolve(onCreateTag(trimmedName));
      setNewTagName('');
      setError('');
      showNotification(t('tags.created'), 'success');
    } catch (e) {
      const msg = (e && e.message) || t('tags.createFailed', 'No se pudo crear el tag');
      setError(msg);
      showNotification(msg, 'error');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleCreateTag();
    }
  };

  if (!open) return null;

  return (
    <div className="tags-modal-overlay" onClick={onClose}>
      <div className="tags-modal" onClick={e => e.stopPropagation()}>
        <div className="tags-modal-header">
          <div className="tags-modal-title">
            <span className="tags-modal-icon">🏷️</span>
            <h3>{t('filters.manageTags', 'Gestionar Tags')}</h3>
          </div>
          <button className="tags-modal-close" onClick={onClose}>×</button>
        </div>
        
        <div className="tags-modal-content">
          {/* Sección de creación de tags */}
          <div className="tags-creation-section">
            <h4 className="section-title">
              <span className="section-icon">➕</span>
              {t('tags.createTag', 'Crear Tag')}
            </h4>
            <div className="tags-input-container">
              <input
                type="text"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={t('tags.tagNamePlaceholder', 'Nombre del nuevo tag')}
                className="tags-input"
              />
              <button 
                className="tags-create-btn"
                onClick={handleCreateTag}
              >
                <span className="create-icon">✨</span>
                {t('actions.create', 'Crear')}
              </button>
            </div>
            {error && <div className="tags-error-message">{error}</div>}
          </div>

          {/* Sección de búsqueda */}
          <div className="tags-search-section">
            <div className="tags-search-container">
              <span className="search-icon">🔍</span>
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

          {/* Sección de selección de tags */}
          <div className="tags-selection-section">
            <div className="tags-selection-header">
              <h4 className="section-title">
                <span className="section-icon">📋</span>
                {t('tags.existingTags', 'Tags Existentes')}
              </h4>
              <button 
                className={`tags-mode-btn ${deleteMode ? 'delete-mode' : ''}`}
                onClick={() => {
                  setDeleteMode(!deleteMode);
                  setTagsToDelete([]);
                }}
              >
                <span className="mode-icon">{deleteMode ? '❌' : '🗑️'}</span>
                {deleteMode ? t('actions.cancel', 'Cancelar') : t('tags.deleteMode', 'Modo Borrado')}
              </button>
            </div>
            
            {deleteMode && tagsToDelete.length > 0 && (
              <div className="delete-preview">
                <div className="delete-count">
                  <span className="count-icon">🗑️</span>
                  {t('tags.confirmDelete', 'Se eliminarán')} <strong>{tagsToDelete.length}</strong> {t('tags.permanently', 'tags permanentemente.')}
                </div>
                <button 
                  className="tags-delete-btn"
                  onClick={() => setShowConfirmDialog(true)}
                >
                  <span className="delete-icon">💥</span>
                  {t('tags.deleteSelected', 'Eliminar Seleccionados')}
                </button>
              </div>
            )}

            <div className="tags-selection-area">
              {filteredTags.length > 0 ? (
                <div className="tags-grid">
                  {filteredTags.map(tag => (
                    <label key={tag.id} className={`tag-option ${
                      deleteMode 
                        ? (Array.isArray(tagsToDelete) && tagsToDelete.includes(String(tag.id)) ? 'selected delete-mode' : 'delete-mode')
                        : (Array.isArray(selectedTags) && selectedTags.includes(String(tag.id)) ? 'selected' : '')
                    }`}>
                      <input
                        type="checkbox"
                        checked={deleteMode 
                          ? Array.isArray(tagsToDelete) && tagsToDelete.includes(String(tag.id))
                          : Array.isArray(selectedTags) && selectedTags.includes(String(tag.id))
                        }
                        onChange={(e) => {
                          if (deleteMode) {
                            setTagsToDelete(current => 
                              e.target.checked
                                ? [...current, String(tag.id)]
                                : current.filter(id => id !== String(tag.id))
                            );
                          } else {
                            if (e.target.checked) {
                              onTagChange([...(Array.isArray(selectedTags) ? selectedTags : []), String(tag.id)]);
                            } else {
                              onTagChange((Array.isArray(selectedTags) ? selectedTags : []).filter(id => id !== String(tag.id)));
                            }
                          }
                        }}
                        className="tag-checkbox"
                      />
                      <span className="tag-option-text">{tag.nombre}</span>
                      <span className="tag-check-mark">{deleteMode ? '🗑️' : '✓'}</span>
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
        </div>

        <div className="tags-modal-footer">
          <div className="selected-count">
            <span className="count-icon">📊</span>
            {deleteMode 
              ? `${t('tags.selected', 'Seleccionados')}: ${tagsToDelete.length}`
              : `${t('detailModal.selected', 'Seleccionados')}: ${Array.isArray(selectedTags) ? selectedTags.length : 0}`
            }
          </div>
          <div className="tags-modal-actions">
            <button className="tags-cancel-btn" onClick={onClose}>
              {t('actions.cancel', 'Cancelar')}
            </button>
          </div>
        </div>

        {showConfirmDialog && (
          <div className="tags-confirm-overlay">
            <div className="tags-confirm-modal">
              <div className="confirm-header">
                <span className="confirm-icon">⚠️</span>
                <h4>{t('tags.confirmTitle', '¿Estás seguro?')}</h4>
              </div>
              <p>{t('tags.confirmDelete', 'Se eliminarán')} <strong>{tagsToDelete.length}</strong> {t('tags.permanently', 'tags permanentemente.')}</p>
              <div className="confirm-actions">
                <button 
                  className="confirm-cancel-btn"
                  onClick={() => setShowConfirmDialog(false)}
                >
                  {t('actions.cancel', 'Cancelar')}
                </button>
                <button 
                  className="confirm-delete-btn"
                  onClick={() => {
                    tagsToDelete.forEach(tagId => onDeleteTag(Number(tagId)));
                    setTagsToDelete([]);
                    setDeleteMode(false);
                    setShowConfirmDialog(false);
                  }}
                >
                  <span className="confirm-delete-icon">💥</span>
                  {t('actions.confirm', 'Confirmar')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default TagsModal;
