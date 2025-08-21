import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import LanguageSelector from "./LanguageSelector";
import AuthModal from "./AuthModal";
import "./Navbar.css";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:8000";

function Navbar({ onSection, onSearch, searchValue, onAuthChange }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [user, setUser] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  // Evita que el onClick navegue tras un clic medio
  const skipNextClickRef = useRef(false);
  const { t } = useLanguage();

  // Comprobar si hay sesión activa (JWT token)
  useEffect(() => {
    async function fetchUser() {
      try {
        // Verificar si hay JWT token antes de hacer la petición
        const jwtToken = localStorage.getItem('jwt_token');
        
        if (!jwtToken) {
          setUser(null);
          if (onAuthChange) {
            onAuthChange(false);
          }
          return;
        }

        const res = await fetch(`${BACKEND_URL}/users/me`, {
          headers: {
            'Authorization': `Bearer ${jwtToken}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          setUser(data);
          // Notificar al componente padre si hay usuario autenticado
          if (data && onAuthChange) {
            onAuthChange(true);
          }
        } else {
          // Token inválido o expirado, limpiar localStorage
          localStorage.removeItem('jwt_token');
          setUser(null);
          if (onAuthChange) {
            onAuthChange(false);
          }
        }
      } catch (error) {
        // Error de red u otro problema, usuario no autenticado
        setUser(null);
        if (onAuthChange) {
          onAuthChange(false);
        }
      }
    }
    fetchUser();
  }, []); // Solo ejecutar una vez al montar el componente

  // Permitir abrir el modal de auth desde otros componentes vía evento global
  useEffect(() => {
    const handler = (evt) => {
      try {
        const mode = evt?.detail?.mode === 'register' ? 'register' : 'login';
        setIsLogin(mode !== 'register');
        setShowAuth(true);
      } catch (_) {
        setIsLogin(true);
        setShowAuth(true);
      }
    };
    window.addEventListener('open-auth', handler);
    return () => window.removeEventListener('open-auth', handler);
  }, []);

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [dropdownOpen]);

  const handleLogout = async () => {
    // Simplemente eliminar el JWT token del localStorage
    localStorage.removeItem('jwt_token');
    setUser(null);
    setDropdownOpen(false);
    // Notificar al componente padre que el usuario se ha desautenticado
    if (onAuthChange) {
      onAuthChange(false);
    }
  };

  const handleAuthSuccess = () => {
    // Refrescar usuario tras login/registro
    const jwtToken = localStorage.getItem('jwt_token');
    if (jwtToken) {
      fetch(`${BACKEND_URL}/users/me`, { 
        headers: {
          'Authorization': `Bearer ${jwtToken}`
        }
      })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          setUser(data);
          // Notificar al componente padre que el usuario se ha autenticado
          if (data && onAuthChange) {
            onAuthChange(true);
          }
        })
        .catch((error) => {
          console.error("Error obteniendo usuario:", error);
        });
    }
    setShowAuth(false);
  };

  // Cierra el menú al navegar
  const handleNav = (section) => {
    // Si ya estamos en la página principal, solo cambiar la sección
    if (location.pathname === '/') {
      onSection(section);
    } else {
      // Si estamos en otra página, navegar a la principal con la sección como estado
      navigate('/', { 
        replace: true,
        state: { section: section }
      });
    }
    setMenuOpen(false);
  };

  // Maneja click: intercepta solo click izquierdo simple; deja nativo ctrl/shift/alt/middle
  const handleNavClick = (e, section) => {
    // Permitir comportamiento nativo para abrir nueva pestaña/ventana
    if (e.ctrlKey || e.metaKey || e.shiftKey || e.altKey || e.button !== 0) return;
    // Interceptar solo click normal izquierdo
    e.preventDefault();
    handleNav(section);
  };

  const sectionToHref = (section) => {
    // Todas las secciones principales viven en la página principal '/'
    return '/';
  };

  return (
    <nav className="navbar">
      <a 
        href={sectionToHref('inicio')}
        className="navbar-logo" 
        onClick={(e) => handleNavClick(e, "inicio")}
        style={{ cursor: 'pointer', textDecoration: 'none', color: 'inherit' }}
        rel="noopener noreferrer"
      >
        <span className="cinema-icon">🎬</span>{" "}
        <span className="navbar-title">{t("navbar.title")}</span>
      </a>
      <div className="navbar-links">
        <a 
          href={sectionToHref('catalogo')}
          onClick={(e) => handleNavClick(e, "catalogo")}
          rel="noopener noreferrer"
        >
          {t("navbar.catalog")}
        </a>
        <a 
          href={sectionToHref('resumen')}
          onClick={(e) => handleNavClick(e, "resumen")}
          rel="noopener noreferrer"
        >
          {t("navbar.summary")}
        </a>
        <a 
          href={sectionToHref('favoritos')}
          onClick={(e) => handleNavClick(e, "favoritos")}
          rel="noopener noreferrer"
        >
          {t("navbar.favorites")}
        </a>
        <a 
          href={sectionToHref('pendientes')}
          onClick={(e) => handleNavClick(e, "pendientes")}
          rel="noopener noreferrer"
        >
          {t("navbar.pending")}
        </a>
        <a 
          href={sectionToHref('listas')}
          onClick={(e) => handleNavClick(e, "listas")}
          rel="noopener noreferrer"
        >
          {t("navbar.lists")}
        </a>
        <a 
          href={sectionToHref('add')}
          className="navbar-add-btn" 
          onClick={(e) => handleNavClick(e, "add")}
          rel="noopener noreferrer"
        >
          {t("navbar.add")}
        </a>
      </div>
      <div className="navbar-right">
        <LanguageSelector />
        <div className="navbar-search">
          <input
            type="text"
            placeholder={t("navbar.search")}
            value={searchValue}
            onChange={(e) => onSearch(e.target.value)}
          />
        </div>
        {/* Moved user-dropdown here, right next to search */}
        <div className="user-dropdown" ref={dropdownRef}>
          <button
            className="user-dropdown-trigger"
            onClick={() => setDropdownOpen((v) => !v)}
          >
            <div className="user-info">
              <div className="user-avatar">
                {user ? (
                  user.username?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path 
                      d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    />
                    <circle 
                      cx="12" 
                      cy="7" 
                      r="4" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </div>
              <span className="user-name">
                {user ? (user.username || user.email) : t('navbar.account')}
              </span>
              <svg 
                className={`dropdown-arrow ${dropdownOpen ? 'open' : ''}`} 
                width="12" 
                height="12" 
                viewBox="0 0 12 12" 
                fill="none"
              >
                <path 
                  d="M3 4.5L6 7.5L9 4.5" 
                  stroke="currentColor" 
                  strokeWidth="1.5" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </button>
          {dropdownOpen && (
            <div className="dropdown-menu">
              {user ? (
                <>
                  <div className="dropdown-header">
                    <div className="user-avatar-large">
                      {user.username?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
                    </div>
                    <div className="user-details">
                      <div className="user-display-name">
                        {user.nombre && user.apellidos 
                          ? `${user.nombre} ${user.apellidos}` 
                          : user.username || user.email
                        }
                      </div>
                      <div className="user-email">{user.email}</div>
                    </div>
                  </div>
                  <div className="dropdown-divider"></div>
                  <button className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                    <i className="fas fa-user"></i>
                    {t('navbar.profile')}
                  </button>
                  <button className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                    <i className="fas fa-cog"></i>
                    {t('navbar.settings')}
                  </button>
                  <div className="dropdown-divider"></div>
                  <button className="dropdown-item logout-item" onClick={handleLogout}>
                    <i className="fas fa-sign-out-alt"></i>
                    {t('navbar.logout')}
                  </button>
                </>
              ) : (
                <>
                  <button
                    className="dropdown-item"
                    onClick={() => {
                      setIsLogin(true);
                      setShowAuth(true);
                      setDropdownOpen(false);
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M15 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <polyline points="10,17 15,12 10,7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <line x1="15" y1="12" x2="3" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    {t('navbar.login')}
                  </button>
                  <button
                    className="dropdown-item"
                    onClick={() => {
                      setIsLogin(false);
                      setShowAuth(true);
                      setDropdownOpen(false);
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M16 21V19C16 17.9391 15.5786 16.9217 14.8284 16.1716C14.0783 15.4214 13.0609 15 12 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <circle cx="8.5" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <line x1="20" y1="8" x2="20" y2="14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <line x1="23" y1="11" x2="17" y2="11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    {t('navbar.register')}
                  </button>
                </>
              )}
            </div>
          )}
        </div>
        {/* Keep hamburger at the end */}
        <button
          className="navbar-hamburger"
          aria-label={t("navbar.openMenu")}
          onClick={() => setMenuOpen((open) => !open)}
        >
          ☰
        </button>
      </div>
      <AuthModal
        show={showAuth}
        onClose={() => setShowAuth(false)}
        onAuthSuccess={handleAuthSuccess}
        isLogin={isLogin}
      />
      {/* Menú móvil */}
      <div className={`navbar-mobile-menu${menuOpen ? " open" : ""}`}>
        <a 
          href={sectionToHref('catalogo')}
          onClick={(e) => handleNavClick(e, "catalogo")}
          rel="noopener noreferrer"
        >
          {t("navbar.catalog")}
        </a>
        <a 
          href={sectionToHref('resumen')}
          onClick={(e) => handleNavClick(e, "resumen")}
          rel="noopener noreferrer"
        >
          {t("navbar.summary")}
        </a>
        <a 
          href={sectionToHref('favoritos')}
          onClick={(e) => handleNavClick(e, "favoritos")}
          rel="noopener noreferrer"
        >
          {t("navbar.favorites")}
        </a>
        <a 
          href={sectionToHref('pendientes')}
          onClick={(e) => handleNavClick(e, "pendientes")}
          rel="noopener noreferrer"
        >
          {t("navbar.pending")}
        </a>
        <a 
          href={sectionToHref('listas')}
          onClick={(e) => handleNavClick(e, "listas")}
          rel="noopener noreferrer"
        >
          {t("navbar.lists")}
        </a>
        <a 
          href={sectionToHref('add')}
          className="navbar-add-btn" 
          onClick={(e) => handleNavClick(e, "add")}
          rel="noopener noreferrer"
        >
          {t("navbar.add")}
        </a>
      </div>
    </nav>
  );
}

export default Navbar;
