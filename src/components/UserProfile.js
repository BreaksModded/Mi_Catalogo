import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useNotification } from '../context/NotificationContext';
import { useGenreTranslation } from '../utils/genreTranslation';
import GenreService from '../services/genreService';
import Navbar from './Navbar';
import { 
  FaExplosion, FaMapLocationDot, FaHatWizard, FaRocket, FaHorse,
  FaMasksTheater, FaUser, FaLandmark, FaVideo, FaFaceLaughSquint,
  FaSkull, FaGhost, FaMagnifyingGlass, FaGun, FaMoon,
  FaHeart, FaHouse, FaPalette, FaMusic, FaGuitar, FaFootball,
  FaKhanda, FaFilm
} from "react-icons/fa6";
import './UserProfile.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:8000";

// Datos para los selectores de países (copiado de AuthModal.js)
const PAISES_KEYS = [
  "spain", "mexico", "argentina", "colombia", "chile", "peru", "venezuela", "ecuador", 
  "bolivia", "paraguay", "uruguay", "costaRica", "panama", "guatemala", "honduras",
  "elSalvador", "nicaragua", "dominicanRepublic", "cuba", "puertoRico", "usa",
  "canada", "brazil", "france", "italy", "germany", "uk", "portugal", 
  "netherlands", "belgium", "sweden", "norway", "denmark", "finland", "poland", 
  "czechRepublic", "austria", "switzerland", "australia", "newZealand", "japan", 
  "southKorea", "china", "india", "thailand", "singapore", "malaysia", "indonesia", 
  "philippines", "vietnam", "southAfrica", "turkey", "israel", "russia", "ukraine", 
  "other"
];

// Mapeo de nombres de países a códigos ISO para las plataformas
const COUNTRY_TO_ISO = {
  "spain": "ES",
  "mexico": "MX", 
  "argentina": "AR",
  "colombia": "CO",
  "chile": "CL",
  "peru": "PE",
  "venezuela": "VE",
  "ecuador": "EC",
  "bolivia": "BO",
  "paraguay": "PY",
  "uruguay": "UY",
  "costaRica": "CR",
  "panama": "PA",
  "guatemala": "GT",
  "honduras": "HN",
  "elSalvador": "SV",
  "nicaragua": "NI",
  "dominicanRepublic": "DO",
  "cuba": "CU",
  "puertoRico": "PR",
  "usa": "US",
  "canada": "CA",
  "brazil": "BR",
  "france": "FR",
  "italy": "IT",
  "germany": "DE",
  "uk": "GB",
  "portugal": "PT",
  "netherlands": "NL",
  "belgium": "BE",
  "sweden": "SE",
  "norway": "NO",
  "denmark": "DK",
  "finland": "FI",
  "poland": "PL",
  "czechRepublic": "CZ",
  "austria": "AT",
  "switzerland": "CH",
  "australia": "AU",
  "newZealand": "NZ",
  "japan": "JP",
  "southKorea": "KR",
  "china": "CN",
  "india": "IN",
  "thailand": "TH",
  "singapore": "SG",
  "malaysia": "MY",
  "indonesia": "ID",
  "philippines": "PH",
  "vietnam": "VN",
  "southAfrica": "ZA",
  "turkey": "TR",
  "israel": "IL",
  "russia": "RU",
  "ukraine": "UA"
};

// Mapeo de géneros a iconos de Font Awesome (copiado de AuthModal.js)
const getGenreIcon = (genreKey) => {
  const iconMap = {
    action: FaExplosion,
    adventure: FaMapLocationDot,
    fantasy: FaHatWizard,
    sciFi: FaRocket,
    western: FaHorse,
    drama: FaMasksTheater,
    biography: FaUser,
    history: FaLandmark,
    documentary: FaVideo,
    comedy: FaFaceLaughSquint,
    thriller: FaSkull,
    horror: FaGhost,
    mystery: FaMagnifyingGlass,
    crime: FaGun,
    noir: FaMoon,
    romance: FaHeart,
    family: FaHouse,
    animation: FaPalette,
    music: FaMusic,
    musical: FaGuitar,
    sport: FaFootball,
    war: FaKhanda
  };
  
  return iconMap[genreKey] || FaFilm;
};

// Componente para renderizar iconos de géneros
const GenreIcon = ({ genreKey }) => {
  const IconComponent = getGenreIcon(genreKey);
  return <IconComponent />;
};

// Datos de géneros (copiado de AuthModal.js)
const GENEROS_KEYS = [
  { key: "action", icon: "💥", color: "#ff4757", popular: true, trending: true },
  { key: "adventure", icon: "🗺️", color: "#2ed573", popular: false, trending: true },
  { key: "fantasy", icon: "🧙‍♂️", color: "#a55eea", popular: true, trending: true },
  { key: "sciFi", icon: "🚀", color: "#40739e", category: "adventure" },
  { key: "western", icon: "🤠", color: "#d63031", category: "adventure" },
  { key: "drama", icon: "🎭", color: "#3742fa", category: "drama" },
  { key: "biography", icon: "👤", color: "#70a1ff", category: "drama" },
  { key: "history", icon: "🏛️", color: "#8854d0", category: "drama" },
  { key: "documentary", icon: "📹", color: "#57606f", category: "drama" },
  { key: "comedy", icon: "😂", color: "#ffa502", category: "comedy" },
  { key: "thriller", icon: "😱", color: "#c44569", category: "thriller" },
  { key: "horror", icon: "👻", color: "#2f3542", category: "thriller" },
  { key: "mystery", icon: "🔍", color: "#5352ed", category: "thriller" },
  { key: "crime", icon: "🔫", color: "#2f3542", category: "thriller" },
  { key: "noir", icon: "🌙", color: "#2d3436", category: "thriller" },
  { key: "romance", icon: "❤️", color: "#ff3838", category: "romance" },
  { key: "family", icon: "👨‍👩‍👧‍👦", color: "#2ed573", category: "family" },
  { key: "animation", icon: "🎨", color: "#ff9ff3", category: "family" },
  { key: "music", icon: "🎵", color: "#ff6b81", category: "entertainment" },
  { key: "musical", icon: "🎼", color: "#fd79a8", category: "entertainment" },
  { key: "sport", icon: "⚽", color: "#44bd32", category: "entertainment" },
  { key: "war", icon: "⚔️", color: "#8b7355", popular: false, trending: false }
];

function UserProfile() {
  const { t, currentLanguage, changeLanguage } = useLanguage();
  const { showNotification } = useNotification();
  const navigate = useNavigate();
  const { translateGenre } = useGenreTranslation();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userInfo, setUserInfo] = useState({
    username: '',
    email: '',
    nombre: '',
    apellidos: '',
    fecha_nacimiento: '',
    pais: '',
    idioma: 'es',
    compartir_estadisticas: true,
    perfil_publico: false,
    created_at: '',
    generos_favoritos: [],
    plataformas: []
  });

  const [editMode, setEditMode] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  
  // Estados para las plataformas dinámicas (como en AuthModal)
  const [availablePlatforms, setAvailablePlatforms] = useState([]); // Plataformas disponibles por país
  const [loadingPlatforms, setLoadingPlatforms] = useState(false); // Estado de carga

  // JWT authentication function
  const authenticatedFetch = useCallback((url, options = {}) => {
    const jwtToken = localStorage.getItem('jwt_token');
    return fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
        ...(jwtToken ? { 'Authorization': `Bearer ${jwtToken}` } : {})
      }
    });
  }, []);

  // Fetch user data
  const fetchUserData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await authenticatedFetch(`${BACKEND_URL}/users/me`);
      
      if (!response.ok) {
        throw new Error('Error fetching user data');
      }
      
      const userData = await response.json();
      
      // Debug: mostrar los datos recibidos del backend
      console.log('User data from backend:', userData);
      
      // Helper function para parsear JSON de forma segura
      const safeJsonParse = (jsonString, fallback = []) => {
        try {
          // Si es null o undefined, devolver fallback
          if (jsonString == null) {
            return fallback;
          }
          
          // Si ya es un array u objeto, devolverlo directamente
          if (typeof jsonString === 'object') {
            return Array.isArray(jsonString) ? jsonString : fallback;
          }
          
          // Si es string vacío, devolver fallback
          if (typeof jsonString === 'string' && jsonString.trim() === '') {
            return fallback;
          }
          
          // Si es string, intentar parsear el JSON
          if (typeof jsonString === 'string') {
            const parsed = JSON.parse(jsonString);
            return parsed || fallback;
          }
          
          // Para cualquier otro tipo, devolver fallback
          return fallback;
        } catch (error) {
          console.warn('Error parsing JSON:', error, 'Input:', jsonString);
          return fallback;
        }
      };
      
      setUserInfo({
        username: userData.username || '',
        email: userData.email || '',
        nombre: userData.nombre || '',
        apellidos: userData.apellidos || '',
        fecha_nacimiento: userData.fecha_nacimiento || '',
        pais: userData.pais || '',
        idioma: userData.idioma_preferido || 'es', // Mapear idioma_preferido -> idioma
        compartir_estadisticas: userData.compartir_estadisticas ?? true,
        perfil_publico: userData.perfil_publico ?? false,
        created_at: userData.fecha_registro || '',
        generos_favoritos: safeJsonParse(userData.generos_favoritos, []), // Parsear JSON string de forma segura
        plataformas: safeJsonParse(userData.plataformas_streaming, []) // Parsear JSON string de forma segura
      });
    } catch (error) {
      console.error('Error loading user data:', error);
      showNotification(t('profile.errorLoading', 'Error loading profile data'), 'error');
    } finally {
      setLoading(false);
    }
  }, [authenticatedFetch, showNotification, t]);

  // Save user data
  const handleSave = async () => {
    try {
      setSaving(true);
      
      // Validación básica
      if (!userInfo.username?.trim() || !userInfo.email?.trim()) {
        showNotification(t('profile.requiredFields', 'Username and email are required'), 'error');
        return;
      }
      
      // Helper function para convertir arrays a JSON de forma segura
      const safeJsonStringify = (data) => {
        try {
          if (!data || !Array.isArray(data)) {
            return JSON.stringify([]);
          }
          return JSON.stringify(data);
        } catch (error) {
          console.warn('Error stringifying data:', error);
          return JSON.stringify([]);
        }
      };
      
      // Mapear los datos al formato esperado por el backend
      const backendData = {
        username: userInfo.username?.trim() || undefined,
        email: userInfo.email?.trim() || undefined,
        nombre: userInfo.nombre?.trim() || undefined,
        apellidos: userInfo.apellidos?.trim() || undefined,
        fecha_nacimiento: userInfo.fecha_nacimiento || undefined,
        pais: userInfo.pais?.trim() || undefined,
        idioma_preferido: userInfo.idioma || 'es', // Mapear idioma -> idioma_preferido
        generos_favoritos: safeJsonStringify(userInfo.generos_favoritos), // Convertir array a JSON string de forma segura
        plataformas_streaming: safeJsonStringify(userInfo.plataformas), // Convertir array a JSON string de forma segura
        compartir_estadisticas: userInfo.compartir_estadisticas,
        perfil_publico: userInfo.perfil_publico
      };
      
      // Remover campos undefined para evitar enviar datos vacíos
      Object.keys(backendData).forEach(key => {
        if (backendData[key] === undefined || backendData[key] === '') {
          delete backendData[key];
        }
      });
      
      // Debug: mostrar los datos que se envían al backend
      console.log('Data being sent to backend:', backendData);
      
      const response = await authenticatedFetch(`${BACKEND_URL}/users/me`, {
        method: 'PATCH',
        body: JSON.stringify(backendData)
      });

      if (!response.ok) {
        // Obtener más detalles del error
        const errorData = await response.text();
        console.error('Backend error response:', errorData);
        throw new Error(`Error updating profile: ${response.status} ${response.statusText}`);
      }

      setEditMode(false);
      showNotification(t('profile.updateSuccess', 'Profile updated successfully'), 'success');
      
      // Update language if changed
      if (userInfo.idioma !== currentLanguage) {
        changeLanguage(userInfo.idioma);
      }
    } catch (error) {
      console.error('Error saving user data:', error);
      showNotification(t('profile.errorSaving', 'Error saving profile'), 'error');
    } finally {
      setSaving(false);
    }
  };

  // Change password
  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showNotification(t('profile.passwordMismatch', 'Passwords do not match'), 'error');
      return;
    }

    try {
      setSaving(true);
      const response = await authenticatedFetch(`${BACKEND_URL}/users/change-password`, {
        method: 'POST',
        body: JSON.stringify({
          current_password: passwordData.currentPassword,
          new_password: passwordData.newPassword
        })
      });

      if (!response.ok) {
        throw new Error('Error changing password');
      }

      setShowPasswordModal(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      showNotification(t('profile.passwordChanged', 'Password changed successfully'), 'success');
    } catch (error) {
      console.error('Error changing password:', error);
      showNotification(t('profile.errorChangingPassword', 'Error changing password'), 'error');
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  // Cargar plataformas disponibles según el país seleccionado
  useEffect(() => {
    const loadPlatforms = async () => {
      if (!userInfo.pais || !editMode) return;
      
      // Convertir el nombre del país al código ISO
      const countryCode = COUNTRY_TO_ISO[userInfo.pais];
      if (!countryCode) {
        console.warn('No ISO code found for country:', userInfo.pais);
        setAvailablePlatforms([]);
        return;
      }
      
      setLoadingPlatforms(true);
      try {
        const response = await fetch(`${BACKEND_URL}/tmdb/watch/providers/regions/${countryCode}`);
        if (response.ok) {
          const data = await response.json();
          console.log('Platform data received:', data); // Debug
          // El endpoint devuelve un objeto con 'results' que es un array de providers
          const platforms = (data.results || [])
            .filter(provider => provider.provider_id != null) // Filtrar providers sin ID válido
            .map(provider => ({
              provider_id: provider.provider_id,
              provider_name: provider.provider_name,
              logo_path: provider.logo_path
            }));
          console.log('Processed platforms:', platforms); // Debug
          setAvailablePlatforms(platforms);
        } else {
          console.warn('Error loading platforms for country:', userInfo.pais, 'ISO:', countryCode);
          setAvailablePlatforms([]);
        }
      } catch (error) {
        console.error('Error fetching platforms:', error);
        setAvailablePlatforms([]);
      } finally {
        setLoadingPlatforms(false);
      }
    };

    loadPlatforms();
  }, [userInfo.pais, editMode]);

  // Función para agregar una plataforma
  const togglePlataforma = (platform) => {
    const currentPlatforms = userInfo.plataformas || [];
    const isSelected = currentPlatforms.some(p => p.provider_id === platform.provider_id);
    
    const newPlatforms = isSelected
      ? currentPlatforms.filter(p => p.provider_id !== platform.provider_id)
      : [...currentPlatforms, platform];
    
    setUserInfo({...userInfo, plataformas: newPlatforms});
  };

  // Función para manejar cambios de sección desde el navbar
  const handleNavbarSection = (section) => {
    navigate('/');
    // Usar setTimeout para asegurar que la navegación se complete antes de cambiar la sección
    setTimeout(() => {
      // Se puede pasar state en la navegación si es necesario para comunicar la sección deseada
      window.location.href = `/?section=${section}`;
    }, 100);
  };

  // Función para manejar búsquedas desde el navbar
  const handleNavbarSearch = (query) => {
    navigate('/');
    setTimeout(() => {
      window.location.href = `/?search=${encodeURIComponent(query)}`;
    }, 100);
  };

  if (loading) {
    return (
      <>
        <Navbar 
          onSection={handleNavbarSection}
          onSearch={handleNavbarSearch}
          searchValue=""
        />
        <div className="profile-container">
          <div className="profile-loading">
            <div className="loading-spinner"></div>
            <p>{t('actions.loading', 'Loading...')}</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar 
        onSection={handleNavbarSection}
        onSearch={handleNavbarSearch}
        searchValue=""
      />
      <div className="profile-container">
      {/* Header */}
      <header className="profile-header">
        <div className="profile-header-content">
          <div className="profile-avatar">
            <i className="fas fa-user-circle"></i>
          </div>
          <div className="profile-header-info">
            <h1>{t('profile.title', 'My Profile')}</h1>
            <p className="profile-subtitle">
              {t('profile.subtitle', 'Manage your account settings and preferences')}
            </p>
          </div>
          <div className="profile-header-actions">
            {!editMode ? (
              <button 
                className="btn-primary"
                onClick={() => setEditMode(true)}
              >
                <i className="fas fa-edit"></i>
                {t('actions.edit', 'Edit')}
              </button>
            ) : (
              <div className="edit-actions">
                <button 
                  className="btn-secondary"
                  onClick={() => setEditMode(false)}
                  disabled={saving}
                >
                  <i className="fas fa-times"></i>
                  {t('actions.cancel', 'Cancel')}
                </button>
                <button 
                  className="btn-primary"
                  onClick={handleSave}
                  disabled={saving}
                >
                  <i className="fas fa-save"></i>
                  {saving ? t('actions.saving', 'Saving...') : t('actions.save', 'Save')}
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Profile Content */}
      <div className="profile-content">
        {/* Personal Information */}
        <section className="profile-section">
          <h2>
            <i className="fas fa-user"></i>
            {t('profile.personalInfo', 'Personal Information')}
          </h2>
          <div className="form-grid">
            <div className="form-group">
              <label>{t('auth.username', 'Username')}</label>
              <input
                type="text"
                value={userInfo.username || ''}
                onChange={(e) => setUserInfo({...userInfo, username: e.target.value})}
                disabled={!editMode}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label>{t('auth.email', 'Email')}</label>
              <input
                type="email"
                value={userInfo.email || ''}
                onChange={(e) => setUserInfo({...userInfo, email: e.target.value})}
                disabled={!editMode}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label>{t('auth.name', 'Name')}</label>
              <input
                type="text"
                value={userInfo.nombre || ''}
                onChange={(e) => setUserInfo({...userInfo, nombre: e.target.value})}
                disabled={!editMode}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label>{t('auth.lastName', 'Last Name')}</label>
              <input
                type="text"
                value={userInfo.apellidos || ''}
                onChange={(e) => setUserInfo({...userInfo, apellidos: e.target.value})}
                disabled={!editMode}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label>{t('auth.birthDate', 'Birth Date')}</label>
              <input
                type="date"
                value={userInfo.fecha_nacimiento || ''}
                onChange={(e) => setUserInfo({...userInfo, fecha_nacimiento: e.target.value})}
                disabled={!editMode}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label>{t('auth.country', 'Country')}</label>
              <select
                value={userInfo.pais || ''}
                onChange={(e) => setUserInfo({...userInfo, pais: e.target.value})}
                disabled={!editMode}
                className="form-select"
              >
                <option value="">{t('auth.selectCountry', 'Select Country')}</option>
                {PAISES_KEYS.map(paisKey => (
                  <option key={paisKey} value={paisKey}>
                    {t(`auth.countries.${paisKey}`, paisKey)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* Language & Preferences */}
        <section className="profile-section">
          <h2>
            <i className="fas fa-cog"></i>
            {t('profile.preferences', 'Preferences')}
          </h2>
          <div className="form-grid">
            <div className="form-group">
              <label>{t('auth.preferredLanguage', 'Preferred Language')}</label>
              <select
                value={userInfo.idioma || 'es'}
                onChange={(e) => setUserInfo({...userInfo, idioma: e.target.value})}
                disabled={!editMode}
                className="form-select"
              >
                <option value="es">Español</option>
                <option value="en">English</option>
                <option value="fr">Français</option>
                <option value="de">Deutsch</option>
                <option value="pt">Português</option>
              </select>
            </div>
            <div className="form-group checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={userInfo.compartir_estadisticas}
                  onChange={(e) => setUserInfo({...userInfo, compartir_estadisticas: e.target.checked})}
                  disabled={!editMode}
                />
                <span className="checkbox-text">
                  {t('profile.shareStats', 'Share statistics')}
                </span>
              </label>
            </div>
            <div className="form-group checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={userInfo.perfil_publico}
                  onChange={(e) => setUserInfo({...userInfo, perfil_publico: e.target.checked})}
                  disabled={!editMode}
                />
                <span className="checkbox-text">
                  {t('profile.publicProfile', 'Public profile')}
                </span>
              </label>
            </div>
          </div>
        </section>

        {/* Favorite Genres */}
        <section className="profile-section">
          <h2>
            <i className="fas fa-heart"></i>
            {t('profile.favoriteGenres', 'Favorite Genres')}
          </h2>
          <div className="genres-container">
            {editMode ? (
              <div className="genres-grid">
                {GENEROS_KEYS.map((genre) => {
                  const isSelected = userInfo.generos_favoritos?.includes(genre.key);
                  const genreTranslation = translateGenre(genre.key);
                  
                  return (
                    <div
                      key={`edit-genre-${genre.key}`}
                      className={`genre-card ${isSelected ? 'selected' : ''}`}
                      onClick={() => {
                        const currentGenres = userInfo.generos_favoritos || [];
                        const newGenres = isSelected
                          ? currentGenres.filter(g => g !== genre.key)
                          : [...currentGenres, genre.key];
                        setUserInfo({...userInfo, generos_favoritos: newGenres});
                      }}
                      style={{
                        '--genre-color': genre.color,
                        borderColor: isSelected ? genre.color : 'transparent'
                      }}
                    >
                      <div className="genre-icon">
                        <GenreIcon genreKey={genre.key} />
                      </div>
                      <span className="genre-name">{genreTranslation}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="genres-display">
                {userInfo.generos_favoritos?.length > 0 ? (
                  <div className="genres-list">
                    {userInfo.generos_favoritos.map((genreKey) => {
                      const genre = GENEROS_KEYS.find(g => g.key === genreKey);
                      const genreTranslation = translateGenre(genreKey);
                      
                      return (
                        <div
                          key={`display-genre-${genreKey}`}
                          className="genre-chip"
                          style={{ '--genre-color': genre?.color || '#666' }}
                        >
                          <div className="genre-icon">
                            <GenreIcon genreKey={genreKey} />
                          </div>
                          <span>{genreTranslation}</span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="no-data">
                    {t('profile.noGenresSelected', 'No favorite genres selected')}
                  </p>
                )}
              </div>
            )}
          </div>
        </section>

        {/* Streaming Platforms */}
        <section className="profile-section">
          <h2>
            <i className="fas fa-play-circle"></i>
            {t('profile.streamingPlatforms', 'Streaming Platforms')}
          </h2>
          <div className="platforms-container">
            {editMode ? (
              <div className="platforms-edit">
                <p className="platforms-description">
                  {t('profile.platformsDescription', 'Select your available streaming platforms')}
                </p>
                
                {/* Plataformas ya seleccionadas */}
                {userInfo.plataformas?.length > 0 && (
                  <div className="selected-platforms">
                    <h4>{t('profile.selectedPlatforms', 'Selected Platforms')}</h4>
                    <div className="platforms-grid">
                      {userInfo.plataformas.map((platform, index) => (
                        <div
                          key={`selected-${platform.provider_id || `fallback-${index}`}`}
                          className="platform-card selected"
                          onClick={() => togglePlataforma(platform)}
                        >
                          <img
                            src={`https://image.tmdb.org/t/p/w92${platform.logo_path}`}
                            alt={platform.provider_name}
                            className="platform-logo"
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                          <span className="platform-name">{platform.provider_name}</span>
                          <i className="fas fa-times platform-remove"></i>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Plataformas disponibles para agregar */}
                {userInfo.pais && (
                  <div className="available-platforms">
                    <h4>{t('profile.availablePlatforms', 'Available Platforms')} ({COUNTRY_TO_ISO[userInfo.pais] || userInfo.pais})</h4>
                    {loadingPlatforms ? (
                      <div className="loading-platforms">
                        <div className="loading-spinner-small"></div>
                        <span>{t('actions.loading', 'Loading...')}</span>
                      </div>
                    ) : availablePlatforms.length > 0 ? (
                      <div className="platforms-grid">
                        {availablePlatforms
                          .filter(platform => !userInfo.plataformas?.some(p => p.provider_id === platform.provider_id))
                          .map((platform, index) => (
                            <div
                              key={`available-${platform.provider_id || `fallback-${index}`}`}
                              className="platform-card available"
                              onClick={() => togglePlataforma(platform)}
                            >
                              <img
                                src={`https://image.tmdb.org/t/p/w92${platform.logo_path}`}
                                alt={platform.provider_name}
                                className="platform-logo"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                }}
                              />
                              <span className="platform-name">{platform.provider_name}</span>
                              <i className="fas fa-plus platform-add"></i>
                            </div>
                          ))
                        }
                      </div>
                    ) : (
                      <p className="no-platforms">
                        {t('profile.noPlatformsAvailable', 'No platforms available for this country')}
                      </p>
                    )}
                  </div>
                )}
                
                <p className="platforms-note">
                  {t('profile.platformsNote', 'Platform selection is based on your country. Update your country above to see different platforms.')}
                </p>
              </div>
            ) : (
              <div className="platforms-display">
                {userInfo.plataformas?.length > 0 ? (
                  <div className="platforms-list">
                    {userInfo.plataformas.map((platform, index) => (
                      <div key={`display-${platform.provider_id || `fallback-${index}`}`} className="platform-chip">
                        <img
                          src={`https://image.tmdb.org/t/p/w92${platform.logo_path}`}
                          alt={platform.provider_name}
                          className="platform-logo"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                        <span>{platform.provider_name}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="no-data">
                    {t('profile.noPlatformsSelected', 'No streaming platforms selected')}
                  </p>
                )}
              </div>
            )}
          </div>
        </section>

        {/* Security */}
        <section className="profile-section">
          <h2>
            <i className="fas fa-shield-alt"></i>
            {t('profile.security', 'Security')}
          </h2>
          <div className="security-content">
            <p className="security-description">
              {t('profile.securityDescription', 'Manage your account security settings')}
            </p>
            <button 
              className="btn-secondary"
              onClick={() => setShowPasswordModal(true)}
            >
              <i className="fas fa-key"></i>
              {t('profile.changePassword', 'Change Password')}
            </button>
          </div>
        </section>

        {/* Account Info */}
        <section className="profile-section">
          <h2>
            <i className="fas fa-info-circle"></i>
            {t('profile.accountInfo', 'Account Information')}
          </h2>
          <div className="account-info">
            <div className="info-item">
              <span className="info-label">{t('profile.memberSince', 'Member since')}:</span>
              <span className="info-value">
                {userInfo.created_at ? new Date(userInfo.created_at).toLocaleDateString() : '-'}
              </span>
            </div>
          </div>
        </section>
      </div>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="modal-overlay" onClick={() => setShowPasswordModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{t('profile.changePassword', 'Change Password')}</h3>
              <button 
                className="modal-close"
                onClick={() => setShowPasswordModal(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>{t('profile.currentPassword', 'Current Password')}</label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>{t('profile.newPassword', 'New Password')}</label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>{t('profile.confirmPassword', 'Confirm New Password')}</label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                  className="form-input"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="btn-secondary"
                onClick={() => setShowPasswordModal(false)}
              >
                {t('actions.cancel', 'Cancel')}
              </button>
              <button 
                className="btn-primary"
                onClick={handlePasswordChange}
                disabled={saving}
              >
                {saving ? t('actions.saving', 'Saving...') : t('actions.save', 'Save')}
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </>
  );
}

export default UserProfile;
