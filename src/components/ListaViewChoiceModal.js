import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import './ListaViewChoiceModal.css';

export default function ListaViewChoiceModal({ isOpen, onClose, onSelectModal, lista }) {
  const navigate = useNavigate();
  const { t } = useLanguage();

  if (!isOpen || !lista) return null;

  const handleSelectPage = () => {
    onClose();
    navigate(`/lista/${lista.id}`);
  };

  const handleSelectModal = () => {
    onClose();
    onSelectModal(lista);
  };

  return (
    <div className="lista-view-choice-overlay" onClick={onClose}>
      <div className="lista-view-choice-modal" onClick={e => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>
          ×
        </button>
        
        <div className="modal-header">
          <h2>{t('lists.howToView', '¿Cómo quieres ver esta lista?')}</h2>
          <p className="lista-name">"{lista.nombre}"</p>
        </div>

        <div className="view-options">
          <div className="view-option" onClick={handleSelectPage}>
            <div className="option-icon page-icon">📄</div>
            <div className="option-content">
              <h3>{t('lists.viewAsPage', 'Ver como página')}</h3>
              <p>{t('lists.pageDescription', 'Experiencia completa con búsqueda y gestión avanzada')}</p>
            </div>
            <div className="option-arrow">→</div>
          </div>

          <div className="view-option" onClick={handleSelectModal}>
            <div className="option-icon modal-icon">⚡</div>
            <div className="option-content">
              <h3>{t('lists.viewAsModal', 'Ver como modal')}</h3>
              <p>{t('lists.modalDescription', 'Vista rápida sin salir de la página actual')}</p>
            </div>
            <div className="option-arrow">→</div>
          </div>
        </div>

        <div className="modal-footer">
          <p className="tip-text">
            {t('lists.viewTip', 'Puedes cambiar esta preferencia en cualquier momento')}
          </p>
        </div>
      </div>
    </div>
  );
}
