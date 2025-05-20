import React, { useState } from 'react';
import './Navbar.css';

function Navbar({ onSection, onSearch, searchValue }) {
  const [menuOpen, setMenuOpen] = useState(false);

  // Cierra el menú al navegar
  const handleNav = (section) => {
    onSection(section);
    setMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-header">
        <div className="navbar-logo" onClick={() => handleNav('inicio')}>
          <span className="cinema-icon">🎬</span> <span className="navbar-title">Mi Catálogo</span>
        </div>
        <button
          className="navbar-hamburger"
          aria-label="Abrir menú"
          onClick={() => setMenuOpen((open) => !open)}
        >
          ☰
        </button>
      </div>
      <div className={`navbar-links${menuOpen ? ' open' : ''}`}>
        <button onClick={() => handleNav('peliculas')}>Películas</button>
        <button onClick={() => handleNav('series')}>Series</button>
        <button onClick={() => handleNav('resumen')}>Resumen</button>
        <button onClick={() => handleNav('favoritos')}>Favoritos</button>
        <button onClick={() => handleNav('pendientes')}>Pendientes</button>
        <button onClick={() => handleNav('listas')}>Listas</button>
        <button className="navbar-add-btn" onClick={() => handleNav('add')}>+ Añadir</button>
      </div>
      <div className="navbar-search">
        <input
          type="text"
          placeholder="Buscar..."
          value={searchValue}
          onChange={e => onSearch(e.target.value)}
        />
      </div>
    </nav>
  );
}

export default Navbar;
