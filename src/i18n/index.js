import { es } from './languages/es';
import { en } from './languages/en';

export const languages = {
  es,
  en
};

export const getLanguageList = () => [
  { code: 'es', name: 'Español', flag: 'ES' },
  { code: 'en', name: 'English', flag: 'US' }
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
