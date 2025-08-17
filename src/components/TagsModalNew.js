import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useNotification } from '../context/NotificationContext';
import './TagsModalNew.css';

function TagsModalNew({ open, tags, selectedTags, onTagChange, onCreateTag, onDeleteTag, onClose }) {
  const [newTagName, setNewTagName] = useState('');
  const [error, setError] = useState('');
  const [deleteMode, setDeleteMode] = useState(false);
  const [tagsToDelete, setTagsToDelete] = useState([]);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [tagSearch, setTagSearch] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [selectedBulkTags, setSelectedBulkTags] = useState(new Set());
  
  const { t } = useLanguage();
  const { showNotification } = useNotification();
  const searchInputRef = useRef(null);
  const newTagInputRef = useRef(null);

  // Normalizar texto para búsqueda
  const normalizeText = (text) => {
    return text.toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();
  };

  // Filtrar tags basado en la búsqueda
  const filteredTags = tagSearch 
    ? tags.filter(tag => normalizeText(tag.nombre).includes(normalizeText(tagSearch)))
    : tags;

  // Estadísticas
  const totalTags = tags.length;
  const selectedCount = Array.isArray(selectedTags) ? selectedTags.length : 0;
  const deleteCount = tagsToDelete.length;

  // Reset states when modal opens/closes
  useEffect(() => {
    if (open) {
      setNewTagName('');
      setError('');
      setDeleteMode(false);
      setTagsToDelete([]);
      setShowConfirmDialog(false);
      setTagSearch('');
      setSelectedBulkTags(new Set());
      // Focus search input after modal animation
      setTimeout(() => {
        if (searchInputRef.current) {
          searchInputRef.current.focus();
        }
      }, 200);
    }
  }, [open]);

  const handleCreateTag = async () => {
    const trimmedName = newTagName.trim();
    
    if (!trimmedName) {
      const msg = t('tags.nameRequired', 'El nombre del tag no puede estar vacío');
      setError(msg);
      showNotification(msg, 'error');
      return;
    }

    if (trimmedName.length < 2) {
      const msg = t('tags.nameTooShort', 'El nombre debe tener al menos 2 caracteres');
      setError(msg);
      showNotification(msg, 'error');
      return;
    }

    if (trimmedName.length > 30) {
      const msg = t('tags.nameTooLong', 'El nombre no puede tener más de 30 caracteres');
      setError(msg);
      showNotification(msg, 'error');
      return;
    }

    if (tags.some(tag => normalizeText(tag.nombre) === normalizeText(trimmedName))) {
      const msg = t('tags.nameExists', 'Ya existe un tag con ese nombre');
      setError(msg);
      showNotification(msg, 'error');
      return;
    }

    setIsCreating(true);
    try {
      await onCreateTag(trimmedName);
      setNewTagName('');
      setError('');
      showNotification(t('tags.created', 'Tag creado exitosamente'), 'success');
      // Focus back to input for quick creation
      setTimeout(() => {
        if (newTagInputRef.current) {
          newTagInputRef.current.focus();
        }
      }, 100);
    } catch (err) {
      const msg = err?.message || t('tags.createFailed', 'Error al crear el tag');
      setError(msg);
      showNotification(msg, 'error');
    } finally {
      setIsCreating(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !isCreating) {
      e.preventDefault();
      handleCreateTag();
    }
  };

  const handleTagToggle = (tagId) => {
    if (deleteMode) {
      setTagsToDelete(current => 
        current.includes(String(tagId))
          ? current.filter(id => id !== String(tagId))
          : [...current, String(tagId)]
      );
    } else {
      const tagIdStr = String(tagId);
      const currentSelected = Array.isArray(selectedTags) ? selectedTags : [];
      
      if (currentSelected.includes(tagIdStr)) {
        onTagChange(currentSelected.filter(id => id !== tagIdStr));
      } else {
        onTagChange([...currentSelected, tagIdStr]);
      }
    }
  };

  const handleBulkToggle = (tagId) => {
    const newSet = new Set(selectedBulkTags);
    if (newSet.has(tagId)) {
      newSet.delete(tagId);
    } else {
      newSet.add(tagId);
    }
    setSelectedBulkTags(newSet);
  };

  const handleSelectAll = () => {
    if (selectedBulkTags.size === filteredTags.length) {
      setSelectedBulkTags(new Set());
    } else {
      setSelectedBulkTags(new Set(filteredTags.map(tag => tag.id)));
    }
  };

  const handleApplyBulkSelection = () => {
    const currentSelected = Array.isArray(selectedTags) ? selectedTags : [];
    const newSelection = Array.from(selectedBulkTags).map(String);
    
    // Add bulk selected tags to current selection
    const combined = [...new Set([...currentSelected, ...newSelection])];
    onTagChange(combined);
    setSelectedBulkTags(new Set());
    showNotification(t('tags.bulkApplied', 'Selección aplicada'), 'success');
  };

  const handleConfirmDelete = () => {
    tagsToDelete.forEach(tagId => {
      onDeleteTag(Number(tagId));
    });
    setTagsToDelete([]);
    setDeleteMode(false);
    setShowConfirmDialog(false);
    showNotification(t('tags.deleted', 'Tags eliminados'), 'success');
  };

  const clearSearch = () => {
    setTagSearch('');
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  if (!open) return null;

  return (
    <div className="tags-modal-new-overlay" onClick={onClose}>
      <div className="tags-modal-new" onClick={e => e.stopPropagation()}>
        
        {/* Header */}
        <div className="tags-modal-new-header">
          <div className="tags-header-content">
            <div className="tags-header-left">
              <div className="tags-icon-wrapper">
                <i className="fas fa-tags"></i>
              </div>
              <div className="tags-header-info">
                <h2>{t('tags.manageTitle', 'Gestión de Tags')}</h2>
                <span className="tags-header-subtitle">
                  {totalTags} {t('tags.total', 'total')} • {selectedCount} {t('tags.selected', 'seleccionados')}
                </span>
              </div>
            </div>
            <button className="tags-close-btn" onClick={onClose}>
              <i className="fas fa-times"></i>
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="tags-modal-new-body">
          
          {/* Create New Tag Section */}
          <div className="tags-section tags-create-section">
            <div className="section-header">
              <h3>
                <i className="fas fa-plus-circle"></i>
                {t('tags.createNew', 'Crear Nuevo Tag')}
              </h3>
            </div>
            <div className="create-tag-form">
              <div className="input-group">
                <input
                  ref={newTagInputRef}
                  type="text"
                  value={newTagName}
                  onChange={(e) => {
                    setNewTagName(e.target.value);
                    if (error) setError('');
                  }}
                  onKeyPress={handleKeyPress}
                  placeholder={t('tags.enterName', 'Escribe el nombre del tag...')}
                  className={`tag-input ${error ? 'error' : ''}`}
                  maxLength={30}
                  disabled={isCreating}
                />
                <button 
                  className={`create-btn ${isCreating ? 'loading' : ''}`}
                  onClick={handleCreateTag}
                  disabled={isCreating || !newTagName.trim()}
                >
                  {isCreating ? (
                    <i className="fas fa-spinner fa-spin"></i>
                  ) : (
                    <i className="fas fa-plus"></i>
                  )}
                  {isCreating ? t('tags.creating', 'Creando...') : t('actions.create', 'Crear')}
                </button>
              </div>
              {error && (
                <div className="error-message">
                  <i className="fas fa-exclamation-circle"></i>
                  {error}
                </div>
              )}
              <div className="char-counter">
                {newTagName.length}/30
              </div>
            </div>
          </div>

          {/* Search and Filter Section */}
          <div className="tags-section tags-search-section">
            <div className="section-header">
              <h3>
                <i className="fas fa-search"></i>
                {t('tags.searchAndFilter', 'Buscar y Filtrar')}
              </h3>
              <div className="search-stats">
                {tagSearch && (
                  <span className="search-results">
                    {filteredTags.length} {t('tags.found', 'encontrados')}
                  </span>
                )}
              </div>
            </div>
            <div className="search-controls">
              <div className="search-input-wrapper">
                <i className="fas fa-search search-icon"></i>
                <input
                  ref={searchInputRef}
                  type="text"
                  value={tagSearch}
                  onChange={(e) => setTagSearch(e.target.value)}
                  placeholder={t('tags.searchPlaceholder', 'Buscar tags por nombre...')}
                  className="search-input"
                />
                {tagSearch && (
                  <button className="clear-search" onClick={clearSearch}>
                    <i className="fas fa-times"></i>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Tags Management Section */}
          <div className="tags-section tags-management-section">
            <div className="section-header">
              <h3>
                <i className="fas fa-layer-group"></i>
                {t('tags.manageTags', 'Gestionar Tags')} ({filteredTags.length})
              </h3>
              <div className="management-controls">
                {selectedBulkTags.size > 0 && !deleteMode && (
                  <button className="bulk-apply-btn" onClick={handleApplyBulkSelection}>
                    <i className="fas fa-check"></i>
                    {t('tags.applySelection', 'Aplicar')} ({selectedBulkTags.size})
                  </button>
                )}
                <button 
                  className={`mode-toggle-btn ${deleteMode ? 'delete-active' : ''}`}
                  onClick={() => {
                    setDeleteMode(!deleteMode);
                    setTagsToDelete([]);
                    setSelectedBulkTags(new Set());
                  }}
                >
                  <i className={`fas ${deleteMode ? 'fa-undo' : 'fa-trash-alt'}`}></i>
                  {deleteMode ? t('actions.cancel', 'Cancelar') : t('tags.deleteMode', 'Eliminar')}
                </button>
              </div>
            </div>

            {/* Bulk Selection Controls */}
            {!deleteMode && filteredTags.length > 0 && (
              <div className="bulk-controls">
                <button 
                  className="select-all-btn"
                  onClick={handleSelectAll}
                >
                  <i className={`fas ${selectedBulkTags.size === filteredTags.length ? 'fa-check-square' : 'fa-square'}`}></i>
                  {selectedBulkTags.size === filteredTags.length 
                    ? t('tags.deselectAll', 'Deseleccionar todo')
                    : t('tags.selectAll', 'Seleccionar todo')
                  }
                </button>
                {selectedBulkTags.size > 0 && (
                  <span className="bulk-info">
                    {selectedBulkTags.size} {t('tags.selected', 'seleccionados')}
                  </span>
                )}
              </div>
            )}

            {/* Delete Preview */}
            {deleteMode && deleteCount > 0 && (
              <div className="delete-preview">
                <div className="delete-info">
                  <i className="fas fa-exclamation-triangle"></i>
                  <span>
                    {t('tags.willDelete', 'Se eliminarán')} <strong>{deleteCount}</strong> {t('tags.tagsWord', 'tags')}
                  </span>
                </div>
                <button 
                  className="confirm-delete-btn"
                  onClick={() => setShowConfirmDialog(true)}
                >
                  <i className="fas fa-trash"></i>
                  {t('tags.confirmDelete', 'Confirmar Eliminación')}
                </button>
              </div>
            )}

            {/* Tags Grid */}
            <div className="tags-grid-container">
              {filteredTags.length > 0 ? (
                <div className="tags-grid">
                  {filteredTags.map(tag => {
                    const isSelected = deleteMode 
                      ? tagsToDelete.includes(String(tag.id))
                      : selectedBulkTags.size > 0 
                        ? selectedBulkTags.has(tag.id)
                        : Array.isArray(selectedTags) && selectedTags.includes(String(tag.id));
                    
                    return (
                      <div 
                        key={tag.id} 
                        className={`tag-item ${isSelected ? 'selected' : ''} ${deleteMode ? 'delete-mode' : ''}`}
                        onClick={() => {
                          if (selectedBulkTags.size > 0 && !deleteMode) {
                            handleBulkToggle(tag.id);
                          } else {
                            handleTagToggle(tag.id);
                          }
                        }}
                      >
                        <div className="tag-content">
                          <span className="tag-name">{tag.nombre}</span>
                          <div className="tag-indicator">
                            {deleteMode ? (
                              <i className={`fas ${isSelected ? 'fa-trash' : 'fa-trash-alt'}`}></i>
                            ) : selectedBulkTags.size > 0 ? (
                              <i className={`fas ${isSelected ? 'fa-check-square' : 'fa-square'}`}></i>
                            ) : (
                              <i className={`fas ${isSelected ? 'fa-check-circle' : 'fa-circle'}`}></i>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="no-tags-message">
                  <i className="fas fa-search"></i>
                  <h4>{t('tags.noTagsFound', 'No se encontraron tags')}</h4>
                  <p>
                    {tagSearch 
                      ? t('tags.tryDifferentSearch', 'Intenta con una búsqueda diferente')
                      : t('tags.createFirstTag', 'Crea tu primer tag usando el formulario de arriba')
                    }
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="tags-modal-new-footer">
          <div className="footer-stats">
            <div className="stat-item">
              <i className="fas fa-tags"></i>
              <span>{totalTags} {t('tags.total', 'total')}</span>
            </div>
            <div className="stat-item">
              <i className="fas fa-check-circle"></i>
              <span>{selectedCount} {t('tags.applied', 'aplicados')}</span>
            </div>
            {deleteMode && (
              <div className="stat-item delete">
                <i className="fas fa-trash"></i>
                <span>{deleteCount} {t('tags.toDelete', 'a eliminar')}</span>
              </div>
            )}
          </div>
          <div className="footer-actions">
            <button className="secondary-btn" onClick={onClose}>
              <i className="fas fa-times"></i>
              {t('actions.close', 'Cerrar')}
            </button>
          </div>
        </div>

        {/* Confirmation Dialog */}
        {showConfirmDialog && (
          <div className="confirm-dialog-overlay">
            <div className="confirm-dialog">
              <div className="confirm-header">
                <div className="confirm-icon">
                  <i className="fas fa-exclamation-triangle"></i>
                </div>
                <h3>{t('tags.confirmDeleteTitle', '¿Confirmar eliminación?')}</h3>
              </div>
              <div className="confirm-body">
                <p>
                  {t('tags.confirmDeleteMessage', 'Esta acción eliminará permanentemente')} <strong>{deleteCount}</strong> {t('tags.tagsWord', 'tags')}. 
                  {t('tags.cannotBeUndone', ' Esta acción no se puede deshacer.')}
                </p>
                <div className="tags-to-delete">
                  {tagsToDelete.slice(0, 5).map(tagId => {
                    const tag = tags.find(t => String(t.id) === tagId);
                    return tag ? (
                      <span key={tagId} className="tag-preview">{tag.nombre}</span>
                    ) : null;
                  })}
                  {deleteCount > 5 && (
                    <span className="more-tags">+{deleteCount - 5} {t('tags.more', 'más')}</span>
                  )}
                </div>
              </div>
              <div className="confirm-actions">
                <button 
                  className="cancel-btn"
                  onClick={() => setShowConfirmDialog(false)}
                >
                  <i className="fas fa-times"></i>
                  {t('actions.cancel', 'Cancelar')}
                </button>
                <button 
                  className="delete-btn"
                  onClick={handleConfirmDelete}
                >
                  <i className="fas fa-trash"></i>
                  {t('actions.delete', 'Eliminar')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default TagsModalNew;
