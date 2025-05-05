import React from 'react';
import './PendingButton.css';

function PendingButton({ isPending, onToggle }) {
  return (
    <button
      className={isPending ? 'pending-btn marked' : 'pending-btn'}
      onClick={onToggle}
      title={isPending ? 'Quitar de pendientes' : 'Añadir a pendientes'}
      tabIndex={0}
      type="button"
    >
      <span role="img" aria-label="pendientes">{isPending ? '🕒' : '🕓'}</span>
    </button>
  );
}

export default PendingButton;
