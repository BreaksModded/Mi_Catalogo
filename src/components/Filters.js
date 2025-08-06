import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import TagsModal from './TagsModal';
import SelectGenero from './SelectGenero';
import './Filters.css';

function Filters({ tipos, generos, selectedTipo, selectedGeneros, onTipo, onGeneros, minYear, maxYear, onYear, minNota, maxNota, onNota, minNotaPersonal, onNotaPersonal, showFavs, showPendings, onShowFavs, onShowPendings, tags, selectedTags, onTagChange, onCreateTag, onDeleteTag, orderBy, onOrder }) {
  const [showTagsModal, setShowTagsModal] = useState(false);
  const [showFilters, setShowFilters] = useState(window.innerWidth > 768);
  const { t } = useLanguage();

  // Toggle filters on mobile
  React.useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) setShowFilters(true);
      else setShowFilters(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div>
      <button
        className="filters-toggle-btn"
        onClick={() => setShowFilters(f => !f)}
        style={{ display: window.innerWidth <= 768 ? 'block' : 'none', margin: '0 auto 12px auto', padding: '11px 0', width: '98%', fontSize: '1.13em', borderRadius: '7px', background: '#1976d2', color: '#fff', border: 'none', fontWeight: 600, letterSpacing: '0.5px' }}
      >
        {showFilters ? t('actions.filter') + ' ▲' : t('actions.filter')}
      </button>
      <div className="filters-bar" style={{ display: showFilters ? 'flex' : 'none' }}>

      <select value={selectedTipo} onChange={e => onTipo(e.target.value)}>
        <option value="">{t('filters.all')}</option>
        {tipos.map(tipo => (
          <option key={tipo} value={tipo}>
            {tipo.toLowerCase() === 'película' ? t('general.movie', 'Película') : 
             tipo.toLowerCase() === 'serie' ? t('general.series', 'Serie') : 
             tipo.charAt(0).toUpperCase() + tipo.slice(1)}
          </option>
        ))}
      </select>
      <SelectGenero generos={generos} selectedGeneros={selectedGeneros} onChange={onGeneros} />
      <div className="input-group">
        <label>{t('filters.year')}</label>
        <input 
          type="number" 
          min="1900" 
          max="2100" 
          value={minYear} 
          onChange={e => onYear(e.target.value, maxYear)} 
          placeholder={t('filters.from')} 
        />
        <input 
          type="number" 
          min="1900" 
          max="2100" 
          value={maxYear} 
          onChange={e => onYear(minYear, e.target.value)} 
          placeholder={t('filters.to')} 
        />
      </div>
      <div className="input-group">
        <label>{t('filters.tmdbRating')}</label>
        <input 
          type="number" 
          min="0" 
          max="10" 
          step="0.1" 
          value={minNota} 
          onChange={e => onNota(e.target.value, null)} 
          placeholder={t('filters.min')} 
        />
      </div>
      <div className="input-group">
        <label>{t('filters.myRating')}</label>
        <input
          type="number"
          min="0"
          max="10"
          step="0.1"
          value={minNotaPersonal}
          onChange={e => onNotaPersonal(e.target.value)}
          placeholder={t('filters.min')}
        />
      </div>
      {/* Ordenar por */}
      <select value={orderBy} onChange={e => onOrder(e.target.value)} className="filters-order-select" style={{marginLeft:'1rem'}}>
        <option value="">{t('filters.orderBy')}</option>
        <option value="fecha">{t('filters.date')}</option>
        <option value="nota_personal">{t('filters.myScore')}</option>
        <option value="nota_tmdb">{t('filters.tmdbScore')}</option>
      </select>
      <button className={showFavs ? 'filter-btn filter-btn-active' : 'filter-btn'} onClick={onShowFavs} title={t('filters.showOnlyFavorites')}>{t('filters.favorites')}</button>
      <button className={showPendings ? 'filter-btn filter-btn-active' : 'filter-btn'} onClick={onShowPendings} title={t('filters.showOnlyPending')}>{t('filters.pending')}</button>
      {/* Selector múltiple de tags */}
      <button 
        className={selectedTags.length > 0 ? 'filter-btn filter-btn-active' : 'filter-btn'} 
        onClick={() => setShowTagsModal(true)} 
        title={t('filters.manageTags')}
      >
        {t('filters.tags')} ({selectedTags.length})
      </button>
      <TagsModal
        open={showTagsModal}
        tags={tags}
        selectedTags={selectedTags}
        onTagChange={onTagChange}
        onCreateTag={onCreateTag}
        onDeleteTag={onDeleteTag}
        onClose={() => setShowTagsModal(false)}
      />
      </div>
    </div>
  );
}

export default Filters;
