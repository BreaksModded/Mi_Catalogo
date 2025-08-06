import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import './FavoriteButton.css';

function FavoriteButton({ isFavorite, onToggle, small }) {
  const { t } = useLanguage();
  
  return (
    <button
      className={
        (small ? 'fav-btn-mini' : 'fav-btn') + (isFavorite ? ' fav' : '')
      }
      onClick={onToggle}
      title={isFavorite ? t('detailModal.removeFromFavorites') : t('detailModal.addToFavorites')}
      tabIndex={0}
      type="button"
    >
      <span role="img" aria-label={t('general.favorite')}>{isFavorite ? '❤️' : '🤍'}</span>
    </button>
  );
}

export default FavoriteButton;
