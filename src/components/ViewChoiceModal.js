import React from 'react';
import './ViewChoiceModal.css';

const ViewChoiceModal = ({ isOpen, onClose, onSelectModal, onSelectPage, mediaTitle }) => {
  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="view-choice-overlay" onClick={handleOverlayClick}>
      <div className="view-choice-modal">
        <div className="view-choice-header">
          <h3>¿Cómo quieres ver los detalles?</h3>
          <p>Elige la vista que prefieras para <strong>{mediaTitle}</strong></p>
        </div>
        
        <div className="view-choice-options">
          <div className="view-option modal-option" onClick={onSelectModal}>
            <div className="option-icon">🪟</div>
            <div className="option-content">
              <h4>Vista Modal</h4>
              <p>Vista compacta en ventana emergente</p>
              <ul>
                <li>Rápido y directo</li>
                <li>No abandona la página actual</li>
                <li>Ideal para consultas rápidas</li>
              </ul>
            </div>
            <div className="option-arrow">→</div>
          </div>
          
          <div className="view-option page-option" onClick={onSelectPage}>
            <div className="option-icon">📄</div>
            <div className="option-content">
              <h4>Página Completa</h4>
              <p>Vista expandida con más espacio</p>
              <ul>
                <li>Más espacio para la información</li>
                <li>Experiencia inmersiva</li>
                <li>Mejor para edición de notas</li>
              </ul>
            </div>
            <div className="option-arrow">→</div>
          </div>
        </div>
        
        <div className="view-choice-footer">
          <button className="cancel-btn" onClick={onClose}>
            Cancelar
          </button>
          <div className="preference-note">
            <small>💡 Puedes cambiar esta preferencia en cualquier momento</small>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewChoiceModal;
