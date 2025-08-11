import React, { useState, useEffect } from "react";
import { useLanguage } from "../context/LanguageContext";
import LanguageSelector from "./LanguageSelector";
import AuthModal from "./AuthModal";
import "./Navbar.css";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:8000";

function Navbar({ onSection, onSearch, searchValue, onAuthChange }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [user, setUser] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { t } = useLanguage();

  // Comprobar si hay sesión activa (cookie)
  useEffect(() => {
    async function fetchUser() {
      try {
        // Verificar si hay cookie de autenticación antes de hacer la petición
        const hasAuthCookie = document.cookie.split(';').some(cookie => 
          cookie.trim().startsWith('auth=')
        );
        
        if (!hasAuthCookie) {
          setUser(null);
          if (onAuthChange) {
            onAuthChange(false);
          }
          return;
        }

        const res = await fetch(`${BACKEND_URL}/users/me`, {
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          setUser(data);
          // Notificar al componente padre si hay usuario autenticado
          if (data && onAuthChange) {
            onAuthChange(true);
          }
        } else {
          // Usuario no autenticado, sin mostrar error en consola
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

  const handleLogout = async () => {
    await fetch(`${BACKEND_URL}/auth/jwt/logout`, {
      method: "POST",
      credentials: "include",
    });
    setUser(null);
    setDropdownOpen(false);
    // Notificar al componente padre que el usuario se ha desautenticado
    if (onAuthChange) {
      onAuthChange(false);
    }
  };

  const handleAuthSuccess = () => {
    // Refrescar usuario tras login/registro
    fetch(`${BACKEND_URL}/users/me`, { credentials: "include" })
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
    setShowAuth(false);
  };

  // Cierra el menú al navegar
  const handleNav = (section) => {
    onSection(section);
    setMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-logo" onClick={() => handleNav("inicio")}>
        <span className="cinema-icon">🎬</span>{" "}
        <span className="navbar-title">{t("navbar.title")}</span>
      </div>
      <div className="navbar-links">
        <button onClick={() => handleNav("peliculas")}>{t("navbar.movies")}</button>
        <button onClick={() => handleNav("series")}>{t("navbar.series")}</button>
        <button onClick={() => handleNav("resumen")}>{t("navbar.summary")}</button>
        <button onClick={() => handleNav("favoritos")}>{t("navbar.favorites")}</button>
        <button onClick={() => handleNav("pendientes")}>{t("navbar.pending")}</button>
        <button onClick={() => handleNav("listas")}>{t("navbar.lists")}</button>
        <button className="navbar-add-btn" onClick={() => handleNav("add")}>
          {t("navbar.add")}
        </button>
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
        <button
          className="navbar-hamburger"
          aria-label={t("navbar.openMenu")}
          onClick={() => setMenuOpen((open) => !open)}
        >
          ☰
        </button>
      </div>
      <div className="user-dropdown" style={{ position: "relative", marginLeft: 16 }}>
        <button
          className="add-btn"
          onClick={() => setDropdownOpen((v) => !v)}
          style={{ minWidth: 120 }}
        >
          {user ? user.email : "Cuenta"} &#x25BC;
        </button>
        {dropdownOpen && (
          <div
            className="dropdown-menu"
            style={{
              position: "absolute",
              right: 0,
              top: "100%",
              background: "#fff",
              border: "1px solid #ccc",
              borderRadius: 6,
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              minWidth: 180,
              zIndex: 1000,
            }}
          >
            {user ? (
              <button
                className="dropdown-item"
                style={{
                  width: "100%",
                  textAlign: "left",
                  padding: 12,
                  border: "none",
                  background: "none",
                }}
                onClick={handleLogout}
              >
                Cerrar sesión
              </button>
            ) : (
              <>
                <button
                  className="dropdown-item"
                  style={{
                    width: "100%",
                    textAlign: "left",
                    padding: 12,
                    border: "none",
                    background: "none",
                  }}
                  onClick={() => {
                    setIsLogin(true);
                    setShowAuth(true);
                    setDropdownOpen(false);
                  }}
                >
                  Iniciar sesión
                </button>
                <button
                  className="dropdown-item"
                  style={{
                    width: "100%",
                    textAlign: "left",
                    padding: 12,
                    border: "none",
                    background: "none",
                  }}
                  onClick={() => {
                    setIsLogin(false);
                    setShowAuth(true);
                    setDropdownOpen(false);
                  }}
                >
                  Registrarse
                </button>
              </>
            )}
          </div>
        )}
      </div>
      <AuthModal
        show={showAuth}
        onClose={() => setShowAuth(false)}
        onAuthSuccess={handleAuthSuccess}
        isLogin={isLogin}
      />
      {/* Menú móvil */}
      <div className={`navbar-mobile-menu${menuOpen ? " open" : ""}`}>
        <button onClick={() => handleNav("peliculas")}>{t("navbar.movies")}</button>
        <button onClick={() => handleNav("series")}>{t("navbar.series")}</button>
        <button onClick={() => handleNav("resumen")}>{t("navbar.summary")}</button>
        <button onClick={() => handleNav("favoritos")}>{t("navbar.favorites")}</button>
        <button onClick={() => handleNav("pendientes")}>{t("navbar.pending")}</button>
        <button onClick={() => handleNav("listas")}>{t("navbar.lists")}</button>
        <button className="navbar-add-btn" onClick={() => handleNav("add")}>
          {t("navbar.add")}
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
