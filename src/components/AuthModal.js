import React, { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import "./DetailModal.css";
import "./AuthModal.css";
import { useLanguage } from '../context/LanguageContext';
import { useGenreTranslation } from '../utils/genreTranslation';
import GenreService from '../services/genreService';
import { 
  FaExplosion, FaMapLocationDot, FaHatWizard, FaRocket, FaHorse,
  FaMasksTheater, FaUser, FaLandmark, FaVideo, FaFaceLaughSquint,
  FaSkull, FaGhost, FaMagnifyingGlass, FaGun, FaMoon,
  FaHeart, FaHouse, FaPalette, FaMusic, FaGuitar, FaFootball,
  FaKhanda, FaFilm,
  FaTv, FaMasksTheater as FaTheaterMasks
} from "react-icons/fa6";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:8000";

// Mapeo de géneros a iconos de Font Awesome
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
  
  return iconMap[genreKey] || FaFilm; // FaFilm como icono por defecto
};

// Componente para renderizar iconos de géneros
const GenreIcon = ({ genreKey }) => {
  const IconComponent = getGenreIcon(genreKey);
  return <IconComponent />;
};

// Datos para los selectores (claves de traducción)
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

const GENEROS_KEYS = [
  // Acción y Aventura
  { key: "action", icon: "💥", color: "#ff4757", popular: true, trending: true },
  { key: "adventure", icon: "🗺️", color: "#2ed573", popular: false, trending: true },
  { key: "fantasy", icon: "🧙‍♂️", color: "#a55eea", popular: true, trending: true },
  { key: "sciFi", icon: "�", color: "#40739e", category: "adventure" },
  { key: "western", icon: "🤠", color: "#d63031", category: "adventure" },
  
  // Drama y Narrativa Seria
  { key: "drama", icon: "🎭", color: "#3742fa", category: "drama" },
  { key: "biography", icon: "�", color: "#70a1ff", category: "drama" },
  { key: "history", icon: "�️", color: "#8854d0", category: "drama" },
  { key: "documentary", icon: "�️", color: "#57606f", category: "drama" },
  
  // Comedia
  { key: "comedy", icon: "😂", color: "#ffa502", category: "comedy" },
  
  // Suspenso, Terror y Crimen
  { key: "thriller", icon: "😱", color: "#c44569", category: "thriller" },
  { key: "horror", icon: "👻", color: "#2f3542", category: "thriller" },
  { key: "mystery", icon: "🔍", color: "#5352ed", category: "thriller" },
  { key: "crime", icon: "�️", color: "#2f3542", category: "thriller" },
  { key: "noir", icon: "�️", color: "#2d3436", category: "thriller" },
  
  // Romance y Drama Romántico
  { key: "romance", icon: "�", color: "#ff3838", category: "romance" },
  
  // Familiar y para Toda la Familia
  { key: "family", icon: "👨‍👩‍👧‍👦", color: "#2ed573", category: "family" },
  { key: "animation", icon: "🎨", color: "#ff9ff3", category: "family" },
  
  // Entretenimiento y Espectáculos
  { key: "music", icon: "🎵", color: "#ff6b81", category: "entertainment" },
  { key: "musical", icon: "🎼", color: "#fd79a8", category: "entertainment" },
  { key: "sport", icon: "⚽", color: "#44bd32", category: "entertainment" },
  
  // Bélico y Conflicto
  { key: "war", icon: "⚔️", color: "#8b7355", popular: false, trending: false }
];

export default function AuthModal({ show, onClose, onAuthSuccess, isLogin: isLoginProp }) {
  const { t, currentLanguage, changeLanguage } = useLanguage();
  const { translateGenre } = useGenreTranslation();
  const [isLogin, setIsLogin] = useState(isLoginProp ?? true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [isResetPassword, setIsResetPassword] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");

  // Estados para las plataformas dinámicas
  const [availablePlatforms, setAvailablePlatforms] = useState([]); // Plataformas disponibles por país
  const [loadingPlatforms, setLoadingPlatforms] = useState(false); // Estado de carga
  const [showAllPlatforms, setShowAllPlatforms] = useState(false);
  
  // Estados para la búsqueda y filtrado mejorado
  const [genreSearch, setGenreSearch] = useState("");
  const [platformSearch, setPlatformSearch] = useState("");

  const [platformFilter, setPlatformFilter] = useState("all"); // all, free, paid, popular
  const [genreFilter, setGenreFilter] = useState('all'); // 'all', 'popular', 'trending'
  
  // Estados del carrusel
  const [carouselScrollPosition, setCarouselScrollPosition] = useState(0);
  const [maxScrollPosition, setMaxScrollPosition] = useState(0);
  const carouselRef = useRef(null);

  // Datos básicos
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [usernameAvailable, setUsernameAvailable] = useState(null);
  const [checkingUsername, setCheckingUsername] = useState(false);
  
  // Información personal
  const [nombre, setNombre] = useState("");
  const [apellidos, setApellidos] = useState("");
  const [fechaNacimiento, setFechaNacimiento] = useState("");
  const [pais, setPais] = useState("");
  const [idioma, setIdioma] = useState("es");
  
  // Preferencias de entretenimiento
  const [generosFavoritos, setGenerosFavoritos] = useState([]);
  const [plataformas, setPlataformas] = useState([]);
  const [tipoContenido, setTipoContenido] = useState("");
  
  // Estados para géneros mejorados con TMDB
  const [enhancedGenres, setEnhancedGenres] = useState(GENEROS_KEYS);
  const [loadingGenres, setLoadingGenres] = useState(false);
  const [genreService] = useState(() => new GenreService());
  
  // Información demográfica (simplificada)
  // Removido: ocupacion y nivelEstudios para hacer el registro menos invasivo
  
  // Configuración de privacidad
  const [compartirEstadisticas, setCompartirEstadisticas] = useState(true);
  const [perfilPublico, setPerfilPublico] = useState(false);

  // Refs para manejo seguro de inputs
  const modalRef = useRef(null);
  const mounted = useRef(true);

  // Handlers seguros para evitar errores de dataset
  const safeSetValue = useCallback((setter, value) => {
    if (mounted.current) {
      setter(value || "");
    }
  }, []);

  const safeBooleanSetValue = useCallback((setter, value) => {
    if (mounted.current) {
      setter(Boolean(value));
    }
  }, []);

  // Si cambia la prop isLogin, sincronizar estado
  useEffect(() => {
    mounted.current = true;
    setIsLogin(isLoginProp ?? true);
    setIsForgotPassword(false);
    setIsResetPassword(false);
    setCurrentStep(1);
    resetForm();
    
    return () => {
      mounted.current = false;
    };
  }, [isLoginProp, show]);

  // Hook de limpieza al desmontar el componente
  useEffect(() => {
    return () => {
      mounted.current = false;
    };
  }, []);

  // Hook para cargar géneros mejorados con TMDB API
  useEffect(() => {
    const loadEnhancedGenres = async () => {
      if (!show) return; // Solo cargar cuando el modal esté visible
      
      setLoadingGenres(true);
      try {
        console.log('Loading enhanced genres with TMDB data...');
        // Limpiar cache para aplicar nuevos criterios de popularidad/trending
        genreService.clearCache();
        const enhanced = await genreService.getEnhancedGenres(GENEROS_KEYS);
        
        if (mounted.current) {
          setEnhancedGenres(enhanced);
          console.log('Enhanced genres loaded:', enhanced.length);
        }
      } catch (error) {
        console.error('Error loading enhanced genres:', error);
        if (mounted.current) {
          setEnhancedGenres(GENEROS_KEYS); // Fallback a géneros estáticos
        }
      } finally {
        if (mounted.current) {
          setLoadingGenres(false);
        }
      }
    };

    loadEnhancedGenres();
  }, [show, genreService]);

  // Función para ordenar plataformas por popularidad usando datos de TMDb
  const sortPlatformsByPopularity = (platforms) => {
    console.log('Ordenando plataformas:', platforms.map(p => ({ 
      name: p.provider_name, 
      priority: p.display_priority 
    })));
    
    const sorted = platforms.sort((a, b) => {
      // Primer criterio: display_priority (menor número = más popular)
      // TMDb proporciona este campo que indica la popularidad en el país específico
      const aPriority = a.display_priority !== undefined ? a.display_priority : 999;
      const bPriority = b.display_priority !== undefined ? b.display_priority : 999;
      
      if (aPriority !== bPriority) {
        return aPriority - bPriority;
      }
      
      // Segundo criterio: prioridad manual para plataformas conocidas sin display_priority
      const popularPlatforms = [
        'Netflix', 'Amazon Prime Video', 'Disney Plus', 'HBO Max', 'Apple TV Plus',
        'Paramount Plus', 'Hulu', 'Peacock', 'Discovery+', 'Crunchyroll',
        'Movistar Plus+', 'Filmin', 'SkyShowtime', 'Rakuten TV'
      ];
      
      const aIndex = popularPlatforms.indexOf(a.provider_name);
      const bIndex = popularPlatforms.indexOf(b.provider_name);
      
      if (aIndex !== -1 && bIndex !== -1) {
        return aIndex - bIndex;
      } else if (aIndex !== -1) {
        return -1;
      } else if (bIndex !== -1) {
        return 1;
      }
      
      // Tercer criterio: ordenar alfabéticamente si tienen la misma prioridad
      return a.provider_name.localeCompare(b.provider_name);
    });
    
    console.log('Plataformas ordenadas:', sorted.slice(0, 6).map(p => ({ 
      name: p.provider_name, 
      priority: p.display_priority 
    })));
    
    return sorted;
  };

  // Funciones de filtrado y búsqueda
  const getFilteredGenres = () => {
    let genres = [...enhancedGenres];
    
    // Filtrar por tipo
    if (genreFilter === 'popular') {
      genres = genres.filter(genre => genre.popular);
    } else if (genreFilter === 'trending') {
      genres = genres.filter(genre => genre.trending);
    }
    
    // Filtrar por búsqueda
    if (genreSearch) {
      genres = genres.filter(genre => 
        translateGenre(genre.key).toLowerCase().includes(genreSearch.toLowerCase())
      );
    }
    
    return genres;
  };

  const getFilteredPlatforms = () => {
    let filtered = [...availablePlatforms];
    
    // Filtrar por búsqueda
    if (platformSearch) {
      filtered = filtered.filter(platform =>
        platform.provider_name.toLowerCase().includes(platformSearch.toLowerCase())
      );
    }
    
    // Filtrar por tipo
    if (platformFilter === 'popular') {
      filtered = filtered.slice(0, 20); // Top 20 más populares
    } else if (platformFilter === 'free') {
      // Plataformas típicamente gratuitas (con publicidad)
      const freePlatforms = ['Tubi', 'Crackle', 'Pluto TV', 'YouTube', 'Twitch'];
      filtered = filtered.filter(platform =>
        freePlatforms.some(free => platform.provider_name.toLowerCase().includes(free.toLowerCase()))
      );
    } else if (platformFilter === 'paid') {
      // Excluir plataformas gratuitas
      const freePlatforms = ['Tubi', 'Crackle', 'Pluto TV', 'YouTube', 'Twitch'];
      filtered = filtered.filter(platform =>
        !freePlatforms.some(free => platform.provider_name.toLowerCase().includes(free.toLowerCase()))
      );
    }
    
    return filtered;
  };

  const getGenresByCategory = (category) => {
    return enhancedGenres.filter(genre => genre.category === category);
  };

  // Cargar plataformas disponibles según el país seleccionado
  useEffect(() => {
    const loadPlatformsByCountry = async () => {
      if (!pais || !show) {
        setAvailablePlatforms([]);
        return;
      }

      // Mapear nombres de países a códigos ISO
      const countryCodeMap = {
        'spain': 'ES',
        'mexico': 'MX', 
        'argentina': 'AR',
        'colombia': 'CO',
        'chile': 'CL',
        'peru': 'PE',
        'venezuela': 'VE',
        'ecuador': 'EC',
        'bolivia': 'BO',
        'paraguay': 'PY',
        'uruguay': 'UY',
        'costaRica': 'CR',
        'panama': 'PA',
        'guatemala': 'GT',
        'honduras': 'HN',
        'elSalvador': 'SV',
        'nicaragua': 'NI',
        'dominicanRepublic': 'DO',
        'cuba': 'CU',
        'puertoRico': 'PR',
        'usa': 'US',
        'canada': 'CA',
        'brazil': 'BR',
        'uk': 'GB', // Cambiado de 'unitedKingdom' a 'uk' para coincidir con PAISES_KEYS
        'france': 'FR',
        'germany': 'DE',
        'italy': 'IT',
        'portugal': 'PT',
        'netherlands': 'NL',
        'belgium': 'BE',
        'sweden': 'SE',
        'norway': 'NO',
        'denmark': 'DK',
        'finland': 'FI',
        'poland': 'PL',
        'czechRepublic': 'CZ',
        'austria': 'AT',
        'switzerland': 'CH',
        'australia': 'AU',
        'newZealand': 'NZ',
        'japan': 'JP',
        'southKorea': 'KR',
        'china': 'CN',
        'india': 'IN',
        'thailand': 'TH',
        'singapore': 'SG',
        'malaysia': 'MY',
        'indonesia': 'ID',
        'philippines': 'PH',
        'vietnam': 'VN',
        'southAfrica': 'ZA',
        'turkey': 'TR',
        'israel': 'IL',
        'russia': 'RU',
        'ukraine': 'UA',
        'other': null // Agregar 'other' que está en PAISES_KEYS
      };

      const countryCode = countryCodeMap[pais];
      if (countryCode === undefined) {
        console.log(`Código de país no encontrado para: ${pais}`);
        setAvailablePlatforms([]);
        return;
      }

      // Si es "other" (countryCode es null), mostrar mensaje y no cargar plataformas
      if (countryCode === null) {
        console.log('País "Otro" seleccionado - no se cargarán plataformas específicas');
        setAvailablePlatforms([]);
        return;
      }

      setLoadingPlatforms(true);
      try {
        const response = await fetch(`${BACKEND_URL}/tmdb/watch/providers/regions/${countryCode}`);
        if (response.ok) {
          const data = await response.json();
          console.log(`Plataformas disponibles en ${countryCode}:`, data.results?.length || 0);
          
          // Ordenar plataformas por popularidad antes de establecerlas
          const sortedPlatforms = sortPlatformsByPopularity(data.results || []);
          setAvailablePlatforms(sortedPlatforms);
          
          // Limpiar plataformas seleccionadas cuando cambie el país
          // para evitar inconsistencias con plataformas no disponibles
          setPlataformas([]);
          setShowAllPlatforms(false); // Resetear vista compacta
        } else {
          console.error(`Error cargando plataformas para ${countryCode}:`, response.status);
          setAvailablePlatforms([]);
          setPlataformas([]);
          setShowAllPlatforms(false);
        }
      } catch (error) {
        console.error('Error cargando plataformas por país:', error);
        setAvailablePlatforms([]);
        setShowAllPlatforms(false);
      } finally {
        setLoadingPlatforms(false);
      }
    };

    loadPlatformsByCountry();
  }, [pais, show]);

  // Función para verificar disponibilidad del username
  const checkUsernameAvailability = async (usernameToCheck) => {
    if (!mounted.current || !usernameToCheck || usernameToCheck.length < 3) {
      if (mounted.current) setUsernameAvailable(null);
      return;
    }
    
    if (mounted.current) setCheckingUsername(true);
    try {
      const response = await fetch(`${BACKEND_URL}/auth/check-username/${encodeURIComponent(usernameToCheck)}`);
      const data = await response.json();
      
      if (response.ok && mounted.current) {
        setUsernameAvailable(data.available);
      } else if (mounted.current) {
        setUsernameAvailable(false);
        setValidationErrors(prev => ({
          ...prev,
          username: data.detail || t('auth.usernameCheckError')
        }));
      }
    } catch (error) {
      if (mounted.current) {
        setUsernameAvailable(false);
        setValidationErrors(prev => ({
          ...prev,
          username: t('auth.usernameCheckError')
        }));
      }
    } finally {
      if (mounted.current) setCheckingUsername(false);
    }
  };

  // Efecto para verificar username con debounce
  useEffect(() => {
    if (!isLogin && username && username.trim() && username.trim().length >= 3) {
      const timeoutId = setTimeout(() => {
        checkUsernameAvailability(username.trim());
      }, 500);
      
      return () => clearTimeout(timeoutId);
    } else if (!isLogin) {
      setUsernameAvailable(null);
    }
  }, [username, isLogin, checkUsernameAvailability]);

  const resetForm = () => {
    if (!mounted.current) return;
    
    setEmail("");
    setUsername("");
    setPassword("");
    setRepeatPassword("");
    setUsernameAvailable(null);
    setCheckingUsername(false);
    setNombre("");
    setApellidos("");
    setFechaNacimiento("");
    setPais("");
    setIdioma("es");
    setGenerosFavoritos([]);
    setPlataformas([]);
    setTipoContenido("");
    setCompartirEstadisticas(true);
    setPerfilPublico(false);
    setError("");
    setSuccessMessage("");
    setValidationErrors({});
    
    // Reset nuevos estados
    setGenreSearch("");
    setPlatformSearch("");
    setPlatformFilter("all");
    setGenreFilter('all');
  };

  const validateStep = (step) => {
    const errors = {};
    
    if (step === 1) {
      if (isLogin) {
        // Para login, permitir email o username
        if (!email || email.trim().length === 0) {
          errors.email = t('auth.emailRequired');
        }
      } else {
        // Para registro, validar formato de email
        if (!email || !/\S+@\S+\.\S+/.test(email)) {
          errors.email = t('auth.emailInvalid');
        }
      }
      if (!isLogin) {
        if (!username || username.trim().length < 3) {
          errors.username = t('auth.usernameRequired');
        } else if (username.trim().length > 50) {
          errors.username = t('auth.usernameTooLong');
        } else if (!username.replace('_', '').replace('-', '').replace('.', '').match(/^[a-zA-Z0-9_.-]+$/)) {
          errors.username = t('auth.usernameInvalidChars');
        } else if (usernameAvailable === false) {
          errors.username = t('auth.usernameNotAvailableError');
        } else if (usernameAvailable === null && username.trim()) {
          errors.username = t('auth.usernameVerifying');
        }
      }
      if (!password || password.length < 6) {
        errors.password = t('auth.passwordRequired');
      }
      if (!isLogin && password !== repeatPassword) {
        errors.repeatPassword = t('auth.passwordMismatch');
      }
    }
    
    if (step === 2 && !isLogin) {
      if (!nombre.trim()) {
        errors.nombre = t('auth.nameRequired');
      }
      if (!apellidos.trim()) {
        errors.apellidos = t('auth.lastNameRequired');
      }
      if (!fechaNacimiento) {
        errors.fechaNacimiento = t('auth.birthDateRequired');
      } else {
        const edad = new Date().getFullYear() - new Date(fechaNacimiento).getFullYear();
        if (edad < 13) {
          errors.fechaNacimiento = t('auth.tooYoung');
        }
      }
      if (!pais) {
        errors.pais = t('auth.countryRequired');
      }
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
      setError("");
      setSuccessMessage("");
    }
  };

  const handlePrev = () => {
    setCurrentStep(currentStep - 1);
    setValidationErrors({});
    setError("");
    setSuccessMessage("");
  };

  const toggleGenero = (genero) => {
    setGenerosFavoritos(prev => {
      if (!Array.isArray(prev)) prev = [];
      return prev.includes(genero) 
        ? prev.filter(g => g !== genero)
        : [...prev, genero];
    });
  };

  const togglePlataforma = (plataforma) => {
    setPlataformas(prev => {
      if (!Array.isArray(prev)) prev = [];
      return prev.includes(plataforma) 
        ? prev.filter(p => p !== plataforma)
        : [...prev, plataforma];
    });
  };

  // Funciones del carrusel
  const updateCarouselScrollLimits = useCallback(() => {
    if (carouselRef.current) {
      const carousel = carouselRef.current;
      const container = carousel.parentElement;
      
      // Calcular el ancho total del contenido
      const logoWidth = 44;
      const gap = 12;
      const padding = 24; // 12px cada lado
      const platformCount = Array.isArray(plataformas) ? plataformas.length : 0;
      
      if (platformCount === 0) {
        setMaxScrollPosition(0);
        return;
      }
      
      const totalContentWidth = (platformCount * logoWidth) + ((platformCount - 1) * gap) + padding;
      
      // Ancho disponible del contenedor
      const containerWidth = container.clientWidth;
      
      // Scroll máximo necesario - si el contenido es mayor que el contenedor
      const maxScroll = Math.max(0, totalContentWidth - containerWidth);
      setMaxScrollPosition(maxScroll);
      
      // Si el scroll actual excede el nuevo máximo, ajustarlo
      if (carouselScrollPosition > maxScroll) {
        const newPosition = maxScroll;
        carousel.style.transform = `translateX(-${newPosition}px)`;
        setCarouselScrollPosition(newPosition);
      }
    }
  }, [plataformas, carouselScrollPosition]);

  const scrollCarouselLeft = () => {
    if (carouselRef.current) {
      const logoWidth = 44 + 12; // 44px logo + 12px gap
      const scrollAmount = logoWidth * 2; // Scroll de 2 logos por vez
      
      const newPosition = Math.max(0, carouselScrollPosition - scrollAmount);
      carouselRef.current.style.transform = `translateX(-${newPosition}px)`;
      setCarouselScrollPosition(newPosition);
    }
  };

  const scrollCarouselRight = () => {
    if (carouselRef.current) {
      const logoWidth = 44 + 12; // 44px logo + 12px gap
      const scrollAmount = logoWidth * 2; // Scroll de 2 logos por vez
      
      const newPosition = Math.min(maxScrollPosition, carouselScrollPosition + scrollAmount);
      carouselRef.current.style.transform = `translateX(-${newPosition}px)`;
      setCarouselScrollPosition(newPosition);
    }
  };

  // Actualizar límites del carrusel cuando cambian las plataformas
  useEffect(() => {
    const timer = setTimeout(() => {
      updateCarouselScrollLimits();
    }, 100); // Pequeño delay para asegurar que el DOM se ha actualizado
    
    return () => clearTimeout(timer);
  }, [plataformas, updateCarouselScrollLimits]);

  // Actualizar límites del carrusel cuando se redimensiona la ventana
  useEffect(() => {
    const handleResize = () => {
      setTimeout(() => {
        updateCarouselScrollLimits();
      }, 100);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [updateCarouselScrollLimits]);

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    setLoading(true);
    
    try {
      const response = await fetch(`${BACKEND_URL}/auth/forgot-password-custom`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email_or_username: email,
          language: currentLanguage || 'es' // Enviar el idioma actual
        }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setSuccessMessage(data.message);
        setError("");
      } else {
        throw new Error(data.detail || t('auth.recoveryError'));
      }
    } catch (err) {
      setError(err.message);
      setSuccessMessage("");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    
    try {
      if (isLogin) {
        // Login
        if (!validateStep(1)) {
          setLoading(false);
          return;
        }
        
        // Determinar si el input es email o username
        let loginEmail = email;
        const isEmailFormat = email.includes('@');
        
        // Si no es formato email, buscar el email del username
        if (!isEmailFormat) {
          try {
            const userLookupRes = await fetch(`${BACKEND_URL}/users/lookup/${encodeURIComponent(email)}`);
            if (userLookupRes.ok) {
              const userData = await userLookupRes.json();
              loginEmail = userData.email;
            } else {
              throw new Error(t('auth.userNotFound'));
            }
          } catch (lookupError) {
            throw new Error(t('auth.userNotFound'));
          }
        }
        
        const loginUrl = `${BACKEND_URL}/auth/jwt/login`;
        const res = await fetch(loginUrl, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            username: loginEmail, // FastAPI Users siempre espera email en username
            password,
          }),
          credentials: "include",
        });
        
        if (!res.ok) {
          throw new Error(t('auth.invalidCredentials'));
        }
        
        // Obtener el token
        const authHeader = res.headers.get('Authorization');
        let token = null;
        if (authHeader && authHeader.startsWith('Bearer ')) {
          token = authHeader.replace('Bearer ', '');
        } else {
          try {
            const data = await res.json();
            token = data.access_token || null;
          } catch {}
        }
        
        if (token) {
          localStorage.setItem('jwt_token', token);
          
          // Obtener el idioma preferido del usuario tras el login
          try {
            const userResponse = await fetch(`${BACKEND_URL}/auth/me`, {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            });
            
            if (userResponse.ok) {
              const userData = await userResponse.json();
              if (userData.idioma_preferido && userData.idioma_preferido !== currentLanguage) {
                // Cambiar el idioma del frontend al idioma preferido del usuario
                changeLanguage(userData.idioma_preferido);
              }
            }
          } catch (error) {
            console.log('No se pudo obtener el idioma preferido del usuario:', error);
          }
        }
        setLoading(false);
        onAuthSuccess && onAuthSuccess(token);
        onClose();
      } else {
        // Register
        if (!validateStep(1) || !validateStep(2)) {
          setLoading(false);
          return;
        }
        
        // Validar que los arrays no estén vacíos para el registro
        if (safeGenerosFavoritos.length === 0) {
          setError(t('auth.genresRequired'));
          setLoading(false);
          return;
        }
        
        if (!tipoContenido) {
          setError(t('auth.contentTypeRequired'));
          setLoading(false);
          return;
        }
        
        const registerData = {
          email: email.trim(),
          username: username.trim(),
          password,
          nombre: nombre.trim(),
          apellidos: apellidos.trim(),
          fecha_nacimiento: fechaNacimiento, // Ya está en formato YYYY-MM-DD
          pais: pais.trim(),
          idioma_preferido: idioma,
          generos_favoritos: safeGenerosFavoritos,
          plataformas_streaming: safePlataformas.length > 0 ? safePlataformas : ["Otro"],
          tipo_contenido_preferido: tipoContenido,
          compartir_estadisticas: compartirEstadisticas,
          perfil_publico: perfilPublico,
          origen_registro: 'web'
        };
        
        const res = await fetch(`${BACKEND_URL}/auth/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(registerData),
        });
        
        if (!res.ok) {
          const data = await res.json();
          console.error("Error details:", data);
          console.error("Data enviada:", registerData);
          throw new Error(data.detail || JSON.stringify(data) || t('auth.registerError'));
        }
        
        setLoading(false);
        setIsLogin(true);
        setCurrentStep(1);
        setError(""); // Limpiar errores
        setSuccessMessage(t('auth.registerSuccess'));
      }
    } catch (err) {
      setError(err.message);
      setSuccessMessage(""); // Limpiar mensaje de éxito cuando hay error
      setLoading(false);
    }
  };

  if (!show) return null;

  // Usar un key único para forzar el remontaje del modal cuando cambia el estado
  const modalKey = `${isLogin ? 'login' : 'register'}-${currentStep}-${isForgotPassword ? 'forgot' : 'normal'}`;

  // Validaciones de seguridad adicionales para arrays
  const safeGenerosFavoritos = Array.isArray(generosFavoritos) ? generosFavoritos : [];
  const safePlataformas = Array.isArray(plataformas) ? plataformas : [];

  const renderForgotPassword = () => (
    <div className="auth-form-step">
      <h2 className="auth-title">{t('auth.forgotPasswordTitle')}</h2>
      <p className="auth-subtitle">
        {t('auth.forgotPasswordSubtitle')}
      </p>
      
      <div className="form-group">
        <label className="form-label">{t('auth.emailOrUsername')}</label>
        <input 
          type="text" 
          value={email || ""} 
          onChange={e => safeSetValue(setEmail, e.target?.value)}
          className={`form-input ${validationErrors.email ? 'error' : ''}`}
          placeholder={t('auth.emailOrUsernamePlaceholder')}
          required 
          autoFocus 
        />
        {validationErrors.email && <span className="error-text">{validationErrors.email}</span>}
      </div>
    </div>
  );

  const renderStep1 = () => (
    <div className="auth-form-step">
      <h2 className="auth-title">
        {isLogin ? t('auth.loginTitle') : t('auth.registerTitle')}
      </h2>
      <p className="auth-subtitle">
        {isLogin 
          ? t('auth.loginSubtitle')
          : t('auth.registerSubtitle')}
      </p>
      
      <div className="form-group">
        <label className="form-label">{isLogin ? t('auth.emailOrUsername') : t('auth.email')}</label>
        <input 
          type={isLogin ? "text" : "email"}
          value={email || ""} 
          onChange={e => safeSetValue(setEmail, e.target?.value)}
          className={`form-input ${validationErrors.email ? 'error' : ''}`}
          placeholder={isLogin ? t('auth.emailOrUsernamePlaceholder') : t('auth.emailPlaceholder')}
          required 
          autoFocus 
        />
        {validationErrors.email && <span className="error-text">{validationErrors.email}</span>}
      </div>
      
      {!isLogin && (
        <div className="form-group">
          <label className="form-label">{t('auth.username')}</label>
          <input 
            type="text" 
            value={username || ""} 
            onChange={e => safeSetValue(setUsername, e.target?.value)}
            className={`form-input ${validationErrors.username ? 'error' : ''} ${usernameAvailable === true ? 'success' : ''} ${usernameAvailable === false ? 'error' : ''}`}
            placeholder={t('auth.usernamePlaceholder')}
            required 
          />
          <div className="username-status">
            {checkingUsername && <span className="status-checking">{t('auth.usernameChecking')}</span>}
            {!checkingUsername && usernameAvailable === true && <span className="status-success">{t('auth.usernameAvailable')}</span>}
            {!checkingUsername && usernameAvailable === false && <span className="status-error">{t('auth.usernameNotAvailable')}</span>}
          </div>
          {validationErrors.username && <span className="error-text">{validationErrors.username}</span>}
          <small className="form-help">{t('auth.usernameHelp')}</small>
        </div>
      )}
      
      <div className="form-group">
        <label className="form-label">{t('auth.password')}</label>
        <input 
          type="password" 
          value={password || ""} 
          onChange={e => safeSetValue(setPassword, e.target?.value)}
          className={`form-input ${validationErrors.password ? 'error' : ''}`}
          placeholder={t('auth.passwordPlaceholder')}
          required 
        />
        {validationErrors.password && <span className="error-text">{validationErrors.password}</span>}
      </div>
      
      {!isLogin && (
        <div className="form-group">
          <label className="form-label">{t('auth.repeatPassword')}</label>
          <input 
            type="password" 
            value={repeatPassword || ""} 
            onChange={e => safeSetValue(setRepeatPassword, e.target?.value)}
            className={`form-input ${validationErrors.repeatPassword ? 'error' : ''}`}
            placeholder={t('auth.passwordPlaceholder')}
            required 
          />
          {validationErrors.repeatPassword && <span className="error-text">{validationErrors.repeatPassword}</span>}
        </div>
      )}
    </div>
  );

  const renderStep2 = () => (
    <div className="auth-form-step">
      <h2 className="auth-title">{t('auth.step2Title')}</h2>
      <p className="auth-subtitle">{t('auth.step2Subtitle')}</p>
      
      <div className="form-row">
        <div className="form-group half">
          <label className="form-label">{t('auth.name')}</label>
          <input 
            key={`nombre-${currentStep}`}
            type="text" 
            value={nombre || ""} 
            onChange={e => safeSetValue(setNombre, e.target?.value)}
            className={`form-input ${validationErrors.nombre ? 'error' : ''}`}
            placeholder={t('auth.namePlaceholder')}
            required 
          />
          {validationErrors.nombre && <span className="error-text">{validationErrors.nombre}</span>}
        </div>
        <div className="form-group half">
          <label className="form-label">{t('auth.lastName')}</label>
          <input 
            key={`apellidos-${currentStep}`}
            type="text" 
            value={apellidos || ""} 
            onChange={e => safeSetValue(setApellidos, e.target?.value)}
            className={`form-input ${validationErrors.apellidos ? 'error' : ''}`}
            placeholder={t('auth.lastNamePlaceholder')}
            required 
          />
          {validationErrors.apellidos && <span className="error-text">{validationErrors.apellidos}</span>}
        </div>
      </div>
      
      <div className="form-row">
        <div className="form-group half">
          <label className="form-label">{t('auth.birthDate')}</label>
          <input 
            key={`fecha-${currentStep}`}
            type="date" 
            value={fechaNacimiento || ""} 
            onChange={e => safeSetValue(setFechaNacimiento, e.target?.value)}
            className={`form-input ${validationErrors.fechaNacimiento ? 'error' : ''}`}
            required 
          />
          {validationErrors.fechaNacimiento && <span className="error-text">{validationErrors.fechaNacimiento}</span>}
        </div>
        <div className="form-group half">
          <label className="form-label">{t('auth.country')}</label>
          <select 
            key={`pais-${currentStep}`}
            value={pais || ""} 
            onChange={e => safeSetValue(setPais, e.target?.value)}
            className={`form-select ${validationErrors.pais ? 'error' : ''}`}
            required
          >
            <option value="">{t('auth.selectCountry')}</option>
            {PAISES_KEYS.map(paisKey => (
              <option key={paisKey} value={paisKey}>{t(`auth.countries.${paisKey}`)}</option>
            ))}
          </select>
          {validationErrors.pais && <span className="error-text">{validationErrors.pais}</span>}
        </div>
      </div>
      
      <div className="form-group">
        <label className="form-label">{t('auth.preferredLanguage')}</label>
        <select 
          value={idioma || "es"} 
          onChange={e => {
            const selectedLanguage = e.target?.value || "es";
            safeSetValue(setIdioma, selectedLanguage);
            // Cambiar inmediatamente el idioma del frontend para que el usuario vea el cambio
            changeLanguage(selectedLanguage);
          }}
          className="form-select"
        >
          <option value="es">Español</option>
          <option value="en">English</option>
          <option value="fr">Français</option>
          <option value="de">Deutsch</option>
          <option value="pt">Português</option>
        </select>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="auth-form-step">
      <h2 className="auth-title">{t('auth.step3Title')}</h2>
      <p className="auth-subtitle">{t('auth.step3Subtitle')}</p>
      
      {/* Sección de Géneros Mejorada */}
      <div className="form-group">
        <div className="section-header">
          <label className="form-label">{t('auth.favoriteGenres')}</label>
          <div className="genre-selection-summary">
            {safeGenerosFavoritos.length > 0 && (
              <span className="selection-count">
                {safeGenerosFavoritos.length} {t('auth.selected', 'seleccionados')}
              </span>
            )}
          </div>
        </div>
        
        {/* Filtros de géneros */}
        <div className="genre-filters">
          <div className="filter-tabs">
            <button
              type="button"
              className={`filter-btn ${genreFilter === 'all' ? 'active' : ''}`}
              onClick={() => setGenreFilter('all')}
            >
              <span className="icon">🎬</span>
              {t('auth.allGenres', 'Todos los géneros')}
            </button>
            
            <button
              type="button"
              className={`filter-btn ${genreFilter === 'popular' ? 'active' : ''}`}
              onClick={() => setGenreFilter('popular')}
            >
              <span className="icon">⭐</span>
              {t('auth.popularGenres', 'Populares')}
            </button>
            
            <button
              type="button"
              className={`filter-btn ${genreFilter === 'trending' ? 'active' : ''}`}
              onClick={() => setGenreFilter('trending')}
            >
              <span className="icon">🔥</span>
              {t('auth.trendingGenres', 'En tendencia')}
            </button>
          </div>
          
          <div className="quick-actions">
            <button
              type="button"
              className="quick-action-btn"
              onClick={() => {
                const filteredGenres = getFilteredGenres();
                const newGenres = filteredGenres.map(g => translateGenre(g.key));
                setGenerosFavoritos(prev => {
                  const newSelection = [...new Set([...prev, ...newGenres])];
                  return newSelection;
                });
              }}
            >
              <span className="icon">✓</span>
              {genreFilter === 'popular' 
                ? t('auth.selectAllPopular', 'Seleccionar populares')
                : genreFilter === 'trending' 
                  ? t('auth.selectAllTrending', 'Seleccionar tendencias')
                  : t('auth.selectAll', 'Seleccionar todos')
              }
            </button>
            
            <button
              type="button"
              className="quick-action-btn clear"
              onClick={() => setGenerosFavoritos([])}
            >
              <span className="icon">🗑️</span>
              {t('auth.deselectAll', 'Deseleccionar todos')}
            </button>
          </div>
        </div>

        {/* Búsqueda de géneros */}
        <div className="search-input-container">
          <input
            type="text"
            placeholder={t('auth.searchGenres', 'Buscar géneros...')}
            value={genreSearch}
            onChange={(e) => setGenreSearch(e.target.value)}
            className="search-input"
          />
          <span className="search-icon">🔍</span>
        </div>

        {/* Indicador de estado de géneros mejorados */}
        {loadingGenres && (
          <div className="loading-genres">
            <span className="loading-icon">⏳</span>
            <span className="loading-text">{t('auth.loadingEnhancedGenres', 'Cargando datos actualizados de géneros...')}</span>
          </div>
        )}

        {/* Grid de géneros */}
        <div className="visual-selector genres">
          {getFilteredGenres().map(genreObj => {
            const translatedGenre = translateGenre(genreObj.key);
            const isSelected = safeGenerosFavoritos.includes(translatedGenre);
            
            return (
              <div 
                key={genreObj.key} 
                className={`genre-item ${isSelected ? 'selected' : ''} ${genreObj.popular ? 'popular' : ''} ${genreObj.trending ? 'trending' : ''}`}
                onClick={() => toggleGenero(translatedGenre)}
              >
                <span className="icon"><GenreIcon genreKey={genreObj.key} /></span>
                <span className="name">{translatedGenre}</span>
                {genreObj.popular && <span className="badge popular">⭐</span>}
                {genreObj.trending && <span className="badge trending">🔥</span>}
              </div>
            );
          })}
        </div>
        
        {getFilteredGenres().length === 0 && (
          <div className="no-results">
            <p>{t('auth.noGenresFound', 'No se encontraron géneros con ese criterio')}</p>
          </div>
        )}
      </div>
      
      {/* Sección de Plataformas Mejorada */}
      <div className="form-group">
        <div className="section-header">
          <label className="form-label">{t('auth.streamingPlatforms')}</label>
          <div className="platform-selection-summary">
            {safePlataformas.length > 0 && (
              <span className="selection-count">
                {safePlataformas.length} {t('auth.selected', 'seleccionadas')}
              </span>
            )}
          </div>
        </div>
        
        {!pais && (
          <p className="form-hint">{t('auth.selectCountryFirst', 'Selecciona primero tu país para ver las plataformas disponibles')}</p>
        )}
        
        {pais && loadingPlatforms && (
          <div className="loading-platforms">
            <div className="loading-spinner-small"></div>
            <span>{t('auth.loadingPlatforms', 'Cargando plataformas disponibles...')}</span>
          </div>
        )}
        
        {pais && !loadingPlatforms && (
          <div className="platforms-container-enhanced">
            {/* Vista avanzada con filtros y búsqueda */}
            <div className="advanced-platform-selection">
              <div className="platform-controls">
                <div className="filter-buttons">
                  <button
                    type="button"
                    className={`filter-btn ${platformFilter === 'all' ? 'active' : ''}`}
                    onClick={() => setPlatformFilter('all')}
                  >
                    {t('auth.allPlatforms', 'Todas')}
                  </button>
                  <button
                    type="button"
                    className={`filter-btn ${platformFilter === 'popular' ? 'active' : ''}`}
                    onClick={() => setPlatformFilter('popular')}
                  >
                    {t('auth.popularOnly', 'Populares')}
                  </button>
                  <button
                    type="button"
                    className={`filter-btn ${platformFilter === 'free' ? 'active' : ''}`}
                    onClick={() => setPlatformFilter('free')}
                  >
                    {t('auth.freePlatforms', 'Gratis')}
                  </button>
                  <button
                    type="button"
                    className={`filter-btn ${platformFilter === 'paid' ? 'active' : ''}`}
                    onClick={() => setPlatformFilter('paid')}
                  >
                    {t('auth.paidPlatforms', 'De pago')}
                  </button>
                </div>
                
                <div className="quick-actions">
                  <button
                    type="button"
                    className="quick-action-btn"
                    onClick={() => {
                      const filteredPlatforms = getFilteredPlatforms();
                      const newPlatforms = filteredPlatforms.map(p => p.provider_name);
                      setPlataformas(prev => {
                        const newSelection = [...new Set([...prev, ...newPlatforms])];
                        return newSelection;
                      });
                    }}
                  >
                    <span className="icon">✓</span>
                    {platformFilter === 'popular' 
                      ? t('auth.selectAllPopularPlatforms', 'Seleccionar populares')
                      : platformFilter === 'free' 
                        ? t('auth.selectAllFreePlatforms', 'Seleccionar gratis')
                        : platformFilter === 'paid'
                          ? t('auth.selectAllPaidPlatforms', 'Seleccionar de pago')
                          : t('auth.selectAllPlatforms', 'Seleccionar todas')
                    }
                  </button>
                  
                  <button
                    type="button"
                    className="quick-action-btn clear"
                    onClick={() => setPlataformas([])}
                  >
                    <span className="icon">🗑️</span>
                    {t('auth.deselectAllPlatforms', 'Deseleccionar todas')}
                  </button>
                </div>
                
                <div className="search-input-container">
                  <input
                    type="text"
                    placeholder={t('auth.searchPlatforms', 'Buscar plataformas...')}
                    value={platformSearch}
                    onChange={(e) => setPlatformSearch(e.target.value)}
                    className="search-input"
                  />
                  <span className="search-icon">🔍</span>
                </div>
              </div>
              
              <div className={`selected-platforms-preview ${maxScrollPosition > 0 ? 'has-overflow' : ''}`}>
                {safePlataformas.length > 0 ? (
                  <div className="platforms-carousel-container">
                    <div className="platforms-carousel" ref={carouselRef}>
                      {safePlataformas.map((platformName, index) => {
                        const platformData = availablePlatforms.find(p => p.provider_name === platformName);
                        return (
                          <div 
                            key={`${platformName}-${index}`} 
                            className="selected-platform-logo"
                            onClick={() => togglePlataforma(platformName)}
                            title={platformName}
                          >
                            {platformData?.logo_path ? (
                              <img 
                                src={`https://image.tmdb.org/t/p/original${platformData.logo_path}`}
                                alt={platformName}
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.nextSibling.style.display = 'flex';
                                }}
                              />
                            ) : (
                              <span className="platform-initial">
                                {platformName.charAt(0)}
                              </span>
                            )}
                            <div className="remove-platform-overlay">
                              ×
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    {maxScrollPosition > 0 && (
                      <>
                        <button 
                          type="button"
                          className="carousel-nav prev"
                          onClick={scrollCarouselLeft}
                          disabled={carouselScrollPosition <= 0}
                        >
                          ‹
                        </button>
                        <button 
                          type="button"
                          className="carousel-nav next"
                          onClick={scrollCarouselRight}
                          disabled={carouselScrollPosition >= maxScrollPosition}
                        >
                          ›
                        </button>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="empty-selection-message">
                    {t('auth.selectPlatforms', 'Selecciona las plataformas donde ves contenido')}
                  </div>
                )}
              </div>
              
              <div className="platforms-grid-advanced">
                {getFilteredPlatforms().length > 0 ? (
                  getFilteredPlatforms().map(platform => (
                    <div 
                      key={platform.provider_id} 
                      className={`platform-item advanced ${safePlataformas.includes(platform.provider_name) ? 'selected' : ''}`}
                      onClick={() => togglePlataforma(platform.provider_name)}
                    >
                      {platform.logo_path ? (
                        <img 
                          src={`https://image.tmdb.org/t/p/w92${platform.logo_path}`}
                          alt={platform.provider_name}
                          className="logo"
                          loading="lazy"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div 
                        className="logo-placeholder" 
                        style={{ display: platform.logo_path ? 'none' : 'flex' }}
                      >
                        <span className="platform-initial">{platform.provider_name.charAt(0)}</span>
                      </div>
                      <span className="name">{platform.provider_name}</span>
                      {platform.display_priority && platform.display_priority <= 20 && (
                        <div className="popular-badge">⭐</div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="no-results-message">
                    <p>{t('auth.noResultsFound', 'No se encontraron resultados')}</p>
                  </div>
                )}
              </div>
            </div>
            
            {availablePlatforms.length === 0 && pais !== 'other' && (
              <div className="no-platforms-message">
                <p>{t('auth.noPlatformsAvailable', 'No se encontraron plataformas disponibles para tu país')}</p>
              </div>
            )}
            
            {pais === 'other' && (
              <div className="other-country-message">
                <p>{t('auth.otherCountrySelected', 'Has seleccionado "Otro país". Podrás especificar tus plataformas manualmente más tarde.')}</p>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Tipo de contenido */}
      <div className="form-group">
        <label className="form-label">{t('auth.contentType')}</label>
        <div className="radio-group visual-radio-group enhanced">
          <label className={`radio-item visual-radio ${(tipoContenido || "") === "peliculas" ? 'selected' : ''}`}>
            <input
              type="radio"
              name="tipoContenido"
              value="peliculas"
              checked={(tipoContenido || "") === "peliculas"}
              onChange={e => safeSetValue(setTipoContenido, e.target?.value)}
              className="visual-radio-input"
            />
            <div className="visual-content">
              <span className="visual-icon content-icon"><FaFilm /></span>
              <span className="radio-label">{t('auth.movies')}</span>
              <span className="radio-description">{t('auth.moviesDescription', 'Largometrajes y documentales')}</span>
            </div>
          </label>
          <label className={`radio-item visual-radio ${(tipoContenido || "") === "series" ? 'selected' : ''}`}>
            <input
              type="radio"
              name="tipoContenido"
              value="series"
              checked={(tipoContenido || "") === "series"}
              onChange={e => safeSetValue(setTipoContenido, e.target?.value)}
              className="visual-radio-input"
            />
            <div className="visual-content">
              <span className="visual-icon content-icon"><FaTv /></span>
              <span className="radio-label">{t('auth.series')}</span>
              <span className="radio-description">{t('auth.seriesDescription', 'Series y miniseries')}</span>
            </div>
          </label>
          <label className={`radio-item visual-radio ${(tipoContenido || "") === "ambos" ? 'selected' : ''}`}>
            <input
              type="radio"
              name="tipoContenido"
              value="ambos"
              checked={(tipoContenido || "") === "ambos"}
              onChange={e => safeSetValue(setTipoContenido, e.target?.value)}
              className="visual-radio-input"
            />
            <div className="visual-content">
              <span className="visual-icon content-icon"><FaTheaterMasks /></span>
              <span className="radio-label">{t('auth.both')}</span>
              <span className="radio-description">{t('auth.bothDescription', 'Todo tipo de contenido')}</span>
            </div>
          </label>
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="auth-form-step">
      <h2 className="auth-title">{t('auth.step4Title')}</h2>
      <p className="auth-subtitle">{t('auth.step4Subtitle')}</p>
      
      <div className="form-group">
        <h3 className="privacy-title">{t('auth.privacyTitle')}</h3>
        <div className="privacy-options">
          <label className="privacy-item">
            <input
              type="checkbox"
              checked={compartirEstadisticas === true}
              onChange={e => safeBooleanSetValue(setCompartirEstadisticas, e.target?.checked)}
            />
            <span className="privacy-label">
              {t('auth.shareStats')}
            </span>
          </label>
          <label className="privacy-item">
            <input
              type="checkbox"
              checked={perfilPublico === true}
              onChange={e => safeBooleanSetValue(setPerfilPublico, e.target?.checked)}
            />
            <span className="privacy-label">
              {t('auth.publicProfile')}
            </span>
          </label>
        </div>
      </div>
    </div>
  );

  const getStepContent = () => {
    if (isForgotPassword) return renderForgotPassword();
    if (isLogin) return renderStep1();
    
    switch (currentStep) {
      case 1: return renderStep1();
      case 2: return renderStep2();
      case 3: return renderStep3();
      case 4: return renderStep4();
      default: return renderStep1();
    }
  };

  const getStepTitle = () => {
    if (isForgotPassword) return "";
    if (isLogin) return `${t('auth.step').replace('{{current}}', '1').replace('{{total}}', '1')}`;
    return `${t('auth.step').replace('{{current}}', currentStep).replace('{{total}}', '4')}`;
  };

  const modalNode = (
    <div className="auth-modal-overlay" key={modalKey} role="dialog" aria-modal="true">
      <div className="auth-modal-content" ref={modalRef}>
        <button className="close-btn" onClick={onClose}>&times;</button>
        
        {!isLogin && !isForgotPassword && (
          <div className="progress-bar">
            <div className="progress-track">
              {[1, 2, 3, 4].map(step => (
                <div 
                  key={step} 
                  className={`progress-step ${currentStep >= step ? 'active' : ''}`}
                >
                  {step}
                </div>
              ))}
            </div>
            <div className="progress-text">{getStepTitle()}</div>
          </div>
        )}
        
        <form onSubmit={isForgotPassword ? handleForgotPassword : handleSubmit} className="auth-form">
          {getStepContent()}
          
          {error && <div className="form-error">{error}</div>}
          {successMessage && (
            <div className="success-message">
              <div className="success-icon">✓</div>
              <p>{successMessage}</p>
            </div>
          )}
          
          <div className="form-actions">
            {!isLogin && !isForgotPassword && currentStep > 1 && (
              <button 
                type="button" 
                className="btn-secondary" 
                onClick={handlePrev}
                disabled={loading}
              >
                {t('auth.previous')}
              </button>
            )}
            
            {isForgotPassword ? (
              <button 
                type="submit" 
                className="btn-primary" 
                disabled={loading || !email.trim()}
              >
                {loading ? t('auth.sending') : t('auth.sendRecoveryLink')}
              </button>
            ) : (isLogin || currentStep === 4) ? (
              <button 
                type="submit" 
                className="btn-primary" 
                disabled={loading}
              >
                {loading ? t('auth.loading') : isLogin ? t('auth.login') : t('auth.register')}
              </button>
            ) : (
              <button 
                type="button" 
                className="btn-primary" 
                onClick={handleNext}
                disabled={loading}
              >
                {t('auth.next')}
              </button>
            )}
          </div>
        </form>
        
        <div className="auth-switch">
          {isForgotPassword ? (
            <button 
              className="link-btn" 
              onClick={() => { 
                setIsForgotPassword(false); 
                setError(""); 
                setSuccessMessage("");
                setValidationErrors({});
              }}
            >
              {t('auth.backToLogin')}
            </button>
          ) : isLogin ? (
            <div className="auth-links">
              <button 
                className="link-btn" 
                onClick={() => { 
                  setIsLogin(false); 
                  setCurrentStep(1); 
                  setError(""); 
                  setSuccessMessage("");
                  setValidationErrors({});
                }}
              >
                {t('auth.noAccount')}
              </button>
              <button 
                className="link-btn forgot-link" 
                onClick={() => { 
                  setIsForgotPassword(true); 
                  setError(""); 
                  setSuccessMessage("");
                  setValidationErrors({});
                }}
              >
                {t('auth.forgotPassword')}
              </button>
            </div>
          ) : (
            <button 
              className="link-btn" 
              onClick={() => { 
                setIsLogin(true); 
                setCurrentStep(1); 
                setError(""); 
                setSuccessMessage("");
                setValidationErrors({});
              }}
            >
              {t('auth.hasAccount')}
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modalNode, document.body);
}
