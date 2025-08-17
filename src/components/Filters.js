import React, { useState } from 'react';
import Select from 'react-select';
import { useLanguage } from '../context/LanguageContext';
import { useGenreTranslation } from '../utils/genreTranslation';
import TagsModalNew from './TagsModalNew';
import './Filters.css';

function Filters({ tipos, generos, selectedTipo, selectedGeneros, onTipo, onGeneros, minYear, maxYear, onYear, minNota, maxNota, onNota, minNotaPersonal, maxNotaPersonal, onNotaPersonal, showFavs, showPendings, onShowFavs, onShowPendings, tags, selectedTags, onTagChange, onCreateTag, onDeleteTag, orderBy, onOrder }) {
  const [showTagsModal, setShowTagsModal] = useState(false);
  const [showFilters, setShowFilters] = useState(window.innerWidth > 768);
  const { t } = useLanguage();
  const { translateGenre } = useGenreTranslation();

  // Toggle filters on mobile
  React.useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) setShowFilters(true);
      else setShowFilters(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Estilos personalizados para react-select
  const customSelectStyles = {
    control: (base, state) => ({
      ...base,
      backgroundColor: 'transparent',
      background: 'linear-gradient(135deg, #2a2a2a 0%, #353535 100%)',
      borderColor: state.isFocused ? '#00e2c7' : 'rgba(0, 226, 199, 0.15)',
      minHeight: '36px',
      height: '36px',
      borderRadius: '12px',
      boxShadow: state.isFocused 
        ? '0 0 0 2px rgba(0, 226, 199, 0.2), 0 8px 24px rgba(0, 226, 199, 0.15)'
        : 'inset 0 1px 0 rgba(255, 255, 255, 0.05)',
      backdropFilter: 'blur(10px)',
      transition: 'all 0.3s ease',
      cursor: 'pointer',
      '&:hover': { 
        borderColor: 'rgba(0, 226, 199, 0.3)',
        boxShadow: '0 4px 16px rgba(0, 226, 199, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        transform: 'translateY(-2px)'
      }
    }),
    valueContainer: (base) => ({
      ...base,
      padding: '0 8px 0 12px',
      height: '36px'
    }),
    placeholder: (base) => ({
      ...base,
      color: 'rgba(255, 255, 255, 0.4)',
      fontStyle: 'italic',
      fontWeight: '500'
    }),
    singleValue: (base) => ({
      ...base,
      color: '#fff',
      fontWeight: '500'
    }),
    input: (base) => ({
      ...base,
      color: '#fff',
      margin: 0,
      padding: 0
    }),
    indicatorsContainer: (base) => ({
      ...base,
      height: '36px'
    }),
    dropdownIndicator: (base) => ({
      ...base,
      padding: '0 8px',
      color: '#00e2c7',
      transition: 'color 0.3s ease',
      '&:hover': {
        color: '#00b8a5'
      }
    }),
    clearIndicator: (base) => ({
      ...base,
      padding: '0 8px',
      color: '#00e2c7'
    }),
    menu: (base) => ({
      ...base,
      background: 'linear-gradient(135deg, #2a2a2a 0%, #353535 100%)',
      border: '1px solid rgba(0, 226, 199, 0.2)',
      borderRadius: '12px',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
      backdropFilter: 'blur(20px)',
      zIndex: 9999
    }),
    menuPortal: (base) => ({
      ...base,
      zIndex: 9999
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isFocused || state.isSelected 
        ? 'linear-gradient(135deg, #00e2c7 0%, #00b8a5 100%)' 
        : 'transparent',
      color: state.isFocused || state.isSelected ? '#181818' : '#fff',
      padding: '8px 12px',
      transition: 'all 0.2s ease',
      fontWeight: state.isSelected ? '600' : '500',
      cursor: 'pointer',
      // Corregir bordes redondeados para primera y última opción
      '&:first-of-type': {
        borderTopLeftRadius: '12px',
        borderTopRightRadius: '12px'
      },
      '&:last-of-type': {
        borderBottomLeftRadius: '12px',
        borderBottomRightRadius: '12px'
      }
    }),
    indicatorSeparator: () => ({
      display: 'none'
    })
  };

  // Opciones para tipo de media
  const tipoOptions = [
    { value: '', label: t('filters.all') },
    ...tipos.map(tipo => ({
      value: tipo,
      label: tipo.toLowerCase() === 'película' ? t('general.movie', 'Película') : 
             tipo.toLowerCase() === 'serie' ? t('general.series', 'Serie') : 
             tipo.charAt(0).toUpperCase() + tipo.slice(1)
    }))
  ];

  // Opciones para géneros
  const generoOptions = generos.map(g => ({ 
    value: g, // Mantener el valor original para filtros
    label: translateGenre(g) // Mostrar la traducción
  }));

  // Opciones para ordenar
  const orderOptions = [
    { value: '', label: t('filters.orderBy') },
    { value: 'fecha', label: t('filters.date') },
    { value: 'nota_personal', label: t('filters.myScore') },
    { value: 'nota_tmdb', label: t('filters.tmdbScore') }
  ];

  return (
    <div>
      <button
        className="filters-toggle-btn"
        onClick={() => setShowFilters(f => !f)}
        style={{ 
          display: window.innerWidth <= 768 ? 'block' : 'none', 
          margin: '0 auto 16px auto', 
          padding: '14px 24px', 
          width: '96%', 
          fontSize: '1.1em', 
          borderRadius: '12px', 
          background: 'linear-gradient(135deg, #00e2c7 0%, #00b8a5 100%)', 
          color: '#181818', 
          border: 'none', 
          fontWeight: 700, 
          letterSpacing: '0.5px',
          textTransform: 'uppercase',
          boxShadow: '0 4px 16px rgba(0, 226, 199, 0.3)',
          transition: 'all 0.3s ease',
          cursor: 'pointer'
        }}
        onMouseDown={(e) => e.currentTarget.style.transform = 'translateY(2px) scale(0.98)'}
        onMouseUp={(e) => e.currentTarget.style.transform = 'translateY(0) scale(1)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0) scale(1)'}
      >
        <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          {t('actions.filter')}
          <span style={{ 
            transition: 'transform 0.3s ease',
            transform: showFilters ? 'rotate(180deg)' : 'rotate(0deg)'
          }}>
            ▼
          </span>
        </span>
      </button>
      <div className="filters-bar" style={{ display: showFilters ? 'flex' : 'none' }}>
        {/* ...existing filter bar content, without the modal... */}
        <Select
          options={tipoOptions}
          value={tipoOptions.find(opt => opt.value === selectedTipo) || tipoOptions[0]}
          onChange={selected => onTipo(selected ? selected.value : '')}
          placeholder={t('filters.all')}
          classNamePrefix="react-select"
          menuPortalTarget={typeof window !== 'undefined' ? document.body : null}
          menuPosition="fixed"
          isSearchable={false}
          styles={customSelectStyles}
        />
        <Select
          isMulti
          options={generoOptions}
          value={generoOptions.filter(opt => selectedGeneros.includes(opt.value))}
          onChange={selected => onGeneros(selected ? selected.map(opt => opt.value) : [])}
          placeholder={t('filters.genres')}
          classNamePrefix="react-select"
          menuPortalTarget={typeof window !== 'undefined' ? document.body : null}
          menuPosition="fixed"
          hideSelectedOptions={false}
          closeMenuOnSelect={false}
          isSearchable={false}
          styles={customSelectStyles}
          components={{
            MultiValue: () => null,
            MultiValueContainer: () => null,
            IndicatorSeparator: () => null,
            ValueContainer: ({ children, getValue, hasValue }) => {
              const selectedValues = getValue();
              return (
                <div style={{ display: 'flex', alignItems: 'center', height: '36px', padding: '0 8px 0 12px' }}>
                  {hasValue && selectedValues.length > 0 ? (
                    <div style={{ 
                      color: '#fff', 
                      fontWeight: '500',
                      overflow: 'hidden', 
                      textOverflow: 'ellipsis', 
                      whiteSpace: 'nowrap' 
                    }}>
                      {selectedValues.map(option => option.label).join(', ')}
                    </div>
                  ) : (
                    <div style={{ 
                      color: '#fff', 
                      fontStyle: 'italic',
                      fontWeight: '500'
                    }}>
                      {t('filters.genres')}
                    </div>
                  )}
                  {children[1]}
                </div>
              );
            }
          }}
        />
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
            onChange={e => onNota(e.target.value, maxNota)} 
            placeholder={t('filters.min')} 
          />
          <input 
            type="number" 
            min="0" 
            max="10" 
            step="0.1" 
            value={maxNota} 
            onChange={e => onNota(minNota, e.target.value)} 
            placeholder={t('filters.max')} 
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
            onChange={e => onNotaPersonal(e.target.value, maxNotaPersonal)}
            placeholder={t('filters.min')}
          />
          <input
            type="number"
            min="0"
            max="10"
            step="0.1"
            value={maxNotaPersonal}
            onChange={e => onNotaPersonal(minNotaPersonal, e.target.value)}
            placeholder={t('filters.max')}
          />
        </div>
        {/* Ordenar por */}
        <Select
          options={orderOptions}
          value={orderOptions.find(opt => opt.value === orderBy) || orderOptions[0]}
          onChange={selected => onOrder(selected ? selected.value : '')}
          placeholder={t('filters.orderBy')}
          classNamePrefix="react-select"
          menuPortalTarget={typeof window !== 'undefined' ? document.body : null}
          menuPosition="fixed"
          isSearchable={false}
          styles={customSelectStyles}
        />
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
      </div>
      {/* Modal fuera de la barra de filtros */}
      <TagsModalNew
        open={showTagsModal}
        tags={tags}
        selectedTags={selectedTags}
        onTagChange={onTagChange}
        onCreateTag={onCreateTag}
        onDeleteTag={onDeleteTag}
        onClose={() => setShowTagsModal(false)}
      />
    </div>
  );
}

export default Filters;
