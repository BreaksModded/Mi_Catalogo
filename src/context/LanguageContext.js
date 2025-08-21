import React, { createContext, useContext, useState, useEffect } from 'react';
import { languages, defaultLanguage, detectBrowserLanguage, detectPreferredLanguage, getNestedTranslation } from '../i18n';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState(() => {
    // 1. Verificar si hay idioma guardado en localStorage (alta prioridad)
    const savedLanguage = localStorage.getItem('catalog_language');
    if (savedLanguage && languages[savedLanguage]) {
      return savedLanguage;
    }
    
    // 2. Si no hay idioma guardado, usar idioma por defecto temporalmente
    // La detección automática se hará en segundo plano
    return defaultLanguage;
  });
  
  const [isLanguageInitialized, setIsLanguageInitialized] = useState(true);

  // Detección automática de idioma en segundo plano (solo si no hay idioma guardado)
  useEffect(() => {
    const initializeLanguageInBackground = async () => {
      try {
        // Solo detectar automáticamente si no hay idioma guardado en localStorage
        const savedLanguage = localStorage.getItem('catalog_language');
        if (savedLanguage && languages[savedLanguage]) {
          // Ya tenemos un idioma guardado, no hacer detección automática
          return;
        }
        
        console.log('No hay idioma guardado, detectando automáticamente en segundo plano...');
        const detectedLanguage = await detectPreferredLanguage();
        
        if (detectedLanguage && languages[detectedLanguage] && detectedLanguage !== defaultLanguage) {
          console.log(`Cambiando a idioma detectado: ${detectedLanguage}`);
          setCurrentLanguage(detectedLanguage);
          // No guardamos automáticamente en localStorage para que el usuario tome la decisión
        } else {
          console.log(`Manteniendo idioma por defecto: ${defaultLanguage}`);
        }
        
      } catch (error) {
        console.error('Error en detección automática de idioma:', error);
        // Mantener el idioma por defecto en caso de error
      }
    };

    // Ejecutar la detección automática sin bloquear la UI
    initializeLanguageInBackground();
  }, []);

  // Guardar el idioma en localStorage cuando cambie (solo si se cambió manualmente)
  const changeLanguage = (languageCode) => {
    if (languages[languageCode]) {
      setCurrentLanguage(languageCode);
      localStorage.setItem('catalog_language', languageCode);
      console.log(`Idioma cambiado manualmente a: ${languageCode}`);
    }
  };

  const t = (path, params = {}, fallback = '') => {
    const currentTranslations = languages[currentLanguage];
    if (!currentTranslations) {
      return fallback || path;
    }

    let translation = getNestedTranslation(currentTranslations, path);
    if (!translation) {
      return fallback || path;
    }

    // Reemplazar variables en el formato {variable}
    if (typeof params === 'object' && params !== null) {
      Object.keys(params).forEach(key => {
        const placeholder = `{${key}}`;
        translation = translation.replace(new RegExp(placeholder, 'g'), params[key]);
      });
    }

    return translation;
  };

  const value = {
    currentLanguage,
    changeLanguage,
    t,
    availableLanguages: Object.keys(languages)
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage debe ser usado dentro de un LanguageProvider');
  }
  return context;
};
