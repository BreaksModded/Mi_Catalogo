import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import LanguageSelector from './LanguageSelector';
import './Navbar.css';

function Navbar({ onSection, onSearch, searchValue }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { t } = useLanguage();

  // Cierra el menú al navegar
  const handleNav = (section) => {
    onSection(section);
    setMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-logo" onClick={() => handleNav('inicio')}>
        <span className="cinema-icon">🎬</span> <span className="navbar-title">{t('navbar.title')}</span>
      </div>
      <div className="navbar-links">
        <button onClick={() => handleNav('peliculas')}>{t('navbar.movies')}</button>
        <button onClick={() => handleNav('series')}>{t('navbar.series')}</button>
        <button onClick={() => handleNav('resumen')}>{t('navbar.summary')}</button>
        <button onClick={() => handleNav('favoritos')}>{t('navbar.favorites')}</button>
        <button onClick={() => handleNav('pendientes')}>{t('navbar.pending')}</button>
        <button onClick={() => handleNav('listas')}>{t('navbar.lists')}</button>
        <button className="navbar-add-btn" onClick={() => handleNav('add')}>{t('navbar.add')}</button>
      </div>
      <div className="navbar-right">
        <LanguageSelector />
        <div className="navbar-search">
          <input
            type="text"
            placeholder={t('navbar.search')}
            value={searchValue}
            onChange={e => onSearch(e.target.value)}
          />
        </div>
        <button
          className="navbar-hamburger"
          aria-label={t('navbar.openMenu')}
          onClick={() => setMenuOpen((open) => !open)}
        >
          ☰
        </button>
      </div>
      {/* Menú móvil */}
      <div className={`navbar-mobile-menu${menuOpen ? ' open' : ''}`}>
        <button onClick={() => handleNav('peliculas')}>{t('navbar.movies')}</button>
        <button onClick={() => handleNav('series')}>{t('navbar.series')}</button>
        <button onClick={() => handleNav('resumen')}>{t('navbar.summary')}</button>
        <button onClick={() => handleNav('favoritos')}>{t('navbar.favorites')}</button>
        <button onClick={() => handleNav('pendientes')}>{t('navbar.pending')}</button>
        <button onClick={() => handleNav('listas')}>{t('navbar.lists')}</button>
        <button className="navbar-add-btn" onClick={() => handleNav('add')}>{t('navbar.add')}</button>
      </div>
    </nav>
  );
}

export default Navbar;
