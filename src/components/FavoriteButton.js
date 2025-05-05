import React from 'react';
import './FavoriteButton.css';

function FavoriteButton({ isFavorite, onToggle, small }) {
  return (
    <button
      className={
        (small ? 'fav-btn-mini' : 'fav-btn') + (isFavorite ? ' fav' : '')
      }
      onClick={onToggle}
      title={isFavorite ? 'Quitar de favoritos' : 'Añadir a favoritos'}
      tabIndex={0}
      type="button"
    >
      <span role="img" aria-label="favorito">{isFavorite ? '❤️' : '🤍'}</span>
    </button>
  );
}

export default FavoriteButton;
