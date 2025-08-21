import { es } from './languages/es';
import { en } from './languages/en';
import { pt } from './languages/pt';
import { fr } from './languages/fr';
import { de } from './languages/de';
import { detectLanguageByLocation } from '../utils/geoLocationService';

export const languages = {
  es,
  en,
  pt,
  fr,
  de
};

export const getLanguageList = () => [
  { code: 'es', name: 'Español', flag: 'ES' },
  { code: 'en', name: 'English', flag: 'US' },
  { code: 'pt', name: 'Português', flag: 'PT' },
  { code: 'fr', name: 'Français', flag: 'FR' },
  { code: 'de', name: 'Deutsch', flag: 'DE' }
];

export const defaultLanguage = 'es';

// Función helper para obtener texto anidado usando dot notation
export const getNestedTranslation = (obj, path) => {
  return path.split('.').reduce((curr, key) => curr?.[key], obj);
};

// Función para detectar el idioma del navegador
export const detectBrowserLanguage = () => {
  const browserLang = navigator.language || navigator.userLanguage;
  const langCode = browserLang.substring(0, 2);
  
  // Verificar si el idioma detectado está disponible
  if (languages[langCode]) {
    return langCode;
  }
  
  return defaultLanguage;
};

// Función para detectar el idioma basado en múltiples fuentes con prioridad
export const detectPreferredLanguage = async () => {
  try {
    // 1. Intentar detectar por ubicación geográfica
    const locationLanguage = await detectLanguageByLocation();
    if (locationLanguage && languages[locationLanguage]) {
      console.log(`Idioma detectado por ubicación: ${locationLanguage}`);
      return locationLanguage;
    }
    
    // 2. Fallback al idioma del navegador
    const browserLanguage = detectBrowserLanguage();
    console.log(`Idioma detectado por navegador: ${browserLanguage}`);
    return browserLanguage;
    
  } catch (error) {
    console.error('Error detectando idioma preferido:', error);
    
    // 3. Fallback final al idioma del navegador
    return detectBrowserLanguage();
  }
};
