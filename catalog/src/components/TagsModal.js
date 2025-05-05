import React, { useState } from 'react';
import './TagsModal.css';

function TagsModal({ tags, selectedTags, onTagChange, onCreateTag, onDeleteTag, onClose }) {
  const [newTagName, setNewTagName] = useState('');
  const [error, setError] = useState('');
  const [deleteMode, setDeleteMode] = useState(false);
  const [tagsToDelete, setTagsToDelete] = useState([]);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const handleCreateTag = () => {
    const trimmedName = newTagName.trim();
    if (!trimmedName) {
      setError('El nombre del tag no puede estar vacío');
      return;
    }
    if (tags.some(t => t.nombre.toLowerCase() === trimmedName.toLowerCase())) {
      setError('Ya existe un tag con ese nombre');
      return;
    }
    onCreateTag(trimmedName);
    setNewTagName('');
    setError('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleCreateTag();
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="tags-modal" onClick={e => e.stopPropagation()}>
        <div className="tags-modal-header">
          <h2>Gestionar Tags</h2>
          <button className="close-button" onClick={onClose}>&times;</button>
        </div>
        
        <div className="tags-modal-content">
          <div className="tags-creation-section">
            <div className="input-group">
              <input
                type="text"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Nombre del nuevo tag"
                className="tag-input"
              />
              <button 
                className="create-tag-button"
                onClick={handleCreateTag}
              >
                Crear Tag
              </button>
            </div>
            {error && <div className="error-message">{error}</div>}
          </div>

          <div className="tags-list-section">
            <div className="tags-header">
              <h3>Tags Existentes</h3>
              <button 
                className={`mode-button ${deleteMode ? 'mode-button-active' : ''}`}
                onClick={() => {
                  setDeleteMode(!deleteMode);
                  setTagsToDelete([]);
                }}
              >
                {deleteMode ? 'Cancelar' : 'Modo Borrado'}
              </button>
            </div>
            
            {deleteMode && tagsToDelete.length > 0 && (
              <div className="delete-actions">
                <span className="selected-count">{tagsToDelete.length} tags seleccionados</span>
                <button 
                  className="delete-confirm-button"
                  onClick={() => setShowConfirmDialog(true)}
                >
                  Eliminar Seleccionados
                </button>
              </div>
            )}

            <div className="tags-grid">
              {tags.map(tag => (
                <label key={tag.id} className="tag-checkbox">
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
                  />
                  <span>{tag.nombre}</span>
                </label>
              ))}
            </div>
          </div>

          {showConfirmDialog && (
            <div className="confirm-dialog">
              <div className="confirm-dialog-content">
                <h4>¿Estás seguro?</h4>
                <p>Se eliminarán {tagsToDelete.length} tags permanentemente.</p>
                <div className="confirm-dialog-buttons">
                  <button 
                    className="cancel-button"
                    onClick={() => setShowConfirmDialog(false)}
                  >
                    Cancelar
                  </button>
                  <button 
                    className="confirm-button"
                    onClick={() => {
                      tagsToDelete.forEach(tagId => onDeleteTag(Number(tagId)));
                      setTagsToDelete([]);
                      setDeleteMode(false);
                      setShowConfirmDialog(false);
                    }}
                  >
                    Confirmar
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default TagsModal;
