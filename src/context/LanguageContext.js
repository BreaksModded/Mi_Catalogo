import React, { createContext, useContext, useState, useEffect } from 'react';
import { languages, defaultLanguage, detectBrowserLanguage, getNestedTranslation } from '../i18n';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState(() => {
    // Intentar cargar el idioma desde localStorage
    const savedLanguage = localStorage.getItem('catalog_language');
    if (savedLanguage && languages[savedLanguage]) {
      return savedLanguage;
    }
    
    // Si no hay idioma guardado, detectar el del navegador
    return detectBrowserLanguage();
  });

  // Guardar el idioma en localStorage cuando cambie
  useEffect(() => {
    localStorage.setItem('catalog_language', currentLanguage);
  }, [currentLanguage]);

  const changeLanguage = (languageCode) => {
    if (languages[languageCode]) {
      setCurrentLanguage(languageCode);
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
