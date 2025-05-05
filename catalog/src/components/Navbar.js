import React from 'react';
import './Navbar.css';

function Navbar({ onSection, onSearch, searchValue }) {
  return (
    <nav className="navbar">
      <div className="navbar-logo" onClick={() => onSection('inicio')}>
        <span className="cinema-icon">🎬</span> <span className="navbar-title">Mi Catálogo</span>
      </div>
      <div className="navbar-links">
        <button onClick={() => onSection('peliculas')}>Películas</button>
        <button onClick={() => onSection('series')}>Series</button>
        <button onClick={() => onSection('favoritos')}>Favoritos</button>
        <button onClick={() => onSection('pendientes')}>Pendientes</button>
        <button onClick={() => onSection('listas')}>Listas</button>
        <button className="navbar-add-btn" onClick={() => onSection('add')}>+ Añadir</button>
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
