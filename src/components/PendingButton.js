import React from 'react';
import { MdBookmark, MdBookmarkBorder } from 'react-icons/md';
import './PendingButton.css';

function PendingButton({ isPending, onToggle }) {
  return (
    <button
      className={isPending ? 'pending-btn marked' : 'pending-btn'}
      onClick={onToggle}
      title={isPending ? 'Quitar de pendientes' : 'Añadir a pendientes'}
      tabIndex={0}
      type="button"
      style={{ background: 'none', border: 'none', cursor: 'pointer', outline: 'none', padding: 0 }}
    >
      {isPending ? (
        <MdBookmark size={28} color="#00e2c7" />
      ) : (
        <MdBookmarkBorder size={28} color="#00e2c7" />
      )}
    </button>
  );
}

export default PendingButton;
