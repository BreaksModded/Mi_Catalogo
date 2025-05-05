import React from 'react';
import './TmdbIdConflictModal.css';

export default function TmdbIdConflictModal({ open, titulo, tipo, onConfirm, onCancel }) {
  if (!open) return null;
  return (
    <div className="tmdbid-modal-overlay">
      <div className="tmdbid-modal">
        <div className="tmdbid-modal-title">TMDb ID en uso</div>
        <div className="tmdbid-modal-msg">
          <span>Este TMDb ID ya está en uso por:</span>
          <div className="tmdbid-modal-titulo">{titulo} <span className="tmdbid-modal-tipo">({tipo})</span></div>
          <div className="tmdbid-modal-pregunta">¿Quieres añadir este contenido igualmente?</div>
        </div>
        <div className="tmdbid-modal-btns">
          <button className="tmdbid-btn-confirm" onClick={onConfirm}>Confirmar</button>
          <button className="tmdbid-btn-cancel" onClick={onCancel}>Cancelar</button>
        </div>
      </div>
    </div>
  );
}
