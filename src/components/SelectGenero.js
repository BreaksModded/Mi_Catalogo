import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import Select from 'react-select';

export default function SelectGenero({ generos, selectedGeneros, onChange }) {
  const selectRef = useRef(null);
  const [menuIsOpen, setMenuIsOpen] = useState(false);
  const { t } = useLanguage();
  
  // Función para traducir géneros
  const translateGenre = (genre) => {
    const lowerGenre = genre.toLowerCase();
    // Buscar en las traducciones de géneros
    const translation = t(`genres.${lowerGenre}`, genre);
    return translation;
  };
  
  // Crear opciones con géneros traducidos
  const options = generos.map(g => ({ 
    value: g, // Mantener el valor original para filtros
    label: translateGenre(g) // Mostrar la traducción
  }));
  
  // Efecto para manejar clics fuera del componente
  useEffect(() => {
    function handleClickOutside(event) {
      // Si el menú está abierto y el clic fue fuera del componente Select
      if (menuIsOpen && selectRef.current && !selectRef.current.contains(event.target)) {
        setMenuIsOpen(false);
      }
    }
    
    // Añadir event listener cuando el menú está abierto
    if (menuIsOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    // Cleanup
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuIsOpen]);
  
  const handleMenuOpen = () => {
    setMenuIsOpen(true);
  };
  
  const handleMenuClose = () => {
    setMenuIsOpen(false);
  };
  
  // Estilo personalizado para react-select
  const customStyles = {
    control: (base) => ({
      ...base,
      backgroundColor: '#2a2a2a',
      borderColor: '#444',
      minHeight: '36px',
      height: '36px',
      borderRadius: '6px',
      boxShadow: 'none',
      '&:hover': { borderColor: '#666' }
    }),
    valueContainer: (base) => ({
      ...base,
      padding: '0 8px 0 12px',
      height: '36px'
    }),
    placeholder: (base) => ({
      ...base,
      color: '#aaa'
    }),
    singleValue: (base) => ({
      ...base,
      color: '#fff'
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
      color: '#fff'
    }),
    clearIndicator: (base) => ({
      ...base,
      padding: '0 8px',
      color: '#fff'
    }),
    multiValue: (base) => ({
      ...base,
      display: 'none'
    }),
    multiValueLabel: (base) => ({
      ...base,
      display: 'none'
    }),
    multiValueRemove: (base) => ({
      ...base,
      display: 'none'
    }),
    menu: (base) => ({
      ...base,
      backgroundColor: '#232323',
      zIndex: 9999
    }),
    menuPortal: (base) => ({
      ...base,
      zIndex: 9999
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isFocused ? '#1976d2' : '#232323',
      color: '#fff'
    }),
    indicatorSeparator: () => ({
      display: 'none'
    })
  };

  // Componentes personalizados
  const customComponents = {
    MultiValue: () => null,
    MultiValueContainer: () => null,
    IndicatorSeparator: () => null,
    ValueContainer: ({ children, getValue, hasValue }) => {
      const selectedValues = getValue();
      return (
        <div style={{ display: 'flex', alignItems: 'center', height: '36px', padding: '0 8px 0 12px' }}>
          {hasValue && selectedValues.length > 0 ? (
            <div style={{ color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {selectedValues.map(option => option.label).join(', ')}
            </div>
          ) : (
            <div style={{ color: '#aaa' }}>{t('filters.genres')}</div>
          )}
          {children[1]}
        </div>
      );
    }
  };

  return (
    <div ref={selectRef} style={{ position: 'relative' }}>
      <Select
        isMulti
        options={options}
        value={options.filter(opt => selectedGeneros.includes(opt.value))}
        onChange={selected => onChange(selected ? selected.map(opt => opt.value) : [])}
        placeholder={t('filters.genres')}
        classNamePrefix="react-select"
        menuPortalTarget={typeof window !== 'undefined' ? document.body : null}
        menuPosition="fixed"
        hideSelectedOptions={false}
        closeMenuOnSelect={false}
        menuIsOpen={menuIsOpen}
        onMenuOpen={handleMenuOpen}
        onMenuClose={handleMenuClose}
        isSearchable={false}
        styles={customStyles}
        components={customComponents}
      />
    </div>
  );
}
