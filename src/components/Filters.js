import React, { useState } from 'react';
import TagsModal from './TagsModal';
import './Filters.css';

function Filters({ tipos, generos, selectedTipo, selectedGenero, onTipo, onGenero, minYear, maxYear, onYear, minNota, maxNota, onNota, minNotaPersonal, onNotaPersonal, showFavs, showPendings, onShowFavs, onShowPendings, tags, selectedTags, onTagChange, onCreateTag, onDeleteTag, orderBy, onOrder }) {
  const [showTagsModal, setShowTagsModal] = useState(false);
  return (
    <div className="filters-bar">
      <select value={selectedTipo} onChange={e => onTipo(e.target.value)}>
        <option value="">Todos</option>
        {tipos.map(tipo => <option key={tipo} value={tipo}>{tipo.charAt(0).toUpperCase() + tipo.slice(1)}</option>)}
      </select>
      <select value={selectedGenero} onChange={e => onGenero(e.target.value)}>
        <option value="">Todos los géneros</option>
        {generos.map(g => <option key={g} value={g}>{g}</option>)}
      </select>
      <div className="input-group">
        <label>Año:</label>
        <input 
          type="number" 
          min="1900" 
          max="2100" 
          value={minYear} 
          onChange={e => onYear(e.target.value, maxYear)} 
          placeholder="Desde" 
        />
        <input 
          type="number" 
          min="1900" 
          max="2100" 
          value={maxYear} 
          onChange={e => onYear(minYear, e.target.value)} 
          placeholder="Hasta" 
        />
      </div>
      <div className="input-group">
        <label>Nota TMDb</label>
        <input 
          type="number" 
          min="0" 
          max="10" 
          step="0.1" 
          value={minNota} 
          onChange={e => onNota(e.target.value, null)} 
          placeholder="Min" 
        />
      </div>
      <div className="input-group">
        <label>Mi nota</label>
        <input
          type="number"
          min="0"
          max="10"
          step="0.1"
          value={minNotaPersonal}
          onChange={e => onNotaPersonal(e.target.value)}
          placeholder="Min"
        />
      </div>
      {/* Ordenar por */}
      <select value={orderBy} onChange={e => onOrder(e.target.value)} className="filters-order-select" style={{marginLeft:'1rem'}}>
        <option value="">Ordenar por</option>
        <option value="fecha">Fecha</option>
        <option value="nota_personal">Mi nota</option>
        <option value="nota_tmdb">Nota TMDb</option>
      </select>
      <button className={showFavs ? 'filter-btn filter-btn-active' : 'filter-btn'} onClick={onShowFavs} title="Mostrar solo favoritos">Favoritos</button>
      <button className={showPendings ? 'filter-btn filter-btn-active' : 'filter-btn'} onClick={onShowPendings} title="Mostrar solo pendientes">Pendientes</button>
      {/* Selector múltiple de tags */}
      <button 
        className={selectedTags.length > 0 ? 'filter-btn filter-btn-active' : 'filter-btn'} 
        onClick={() => setShowTagsModal(true)} 
        title="Gestionar tags"
      >
        Tags ({selectedTags.length})
      </button>
      {showTagsModal && (
        <TagsModal
          tags={tags}
          selectedTags={selectedTags}
          onTagChange={onTagChange}
          onCreateTag={onCreateTag}
          onDeleteTag={onDeleteTag}
          onClose={() => setShowTagsModal(false)}
        />
      )}
    </div>
  );
}

export default Filters;
