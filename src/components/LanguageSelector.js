import React, { useState, useRef, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import { getLanguageList } from '../i18n';
import './LanguageSelector.css';

const LanguageSelector = () => {
  const { currentLanguage, changeLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const selectorRef = useRef(null);
  const buttonRef = useRef(null);

  const languageList = getLanguageList();
  const currentLangData = languageList.find(lang => lang.code === currentLanguage);

  // Cerrar el selector al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectorRef.current && !selectorRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLanguageChange = (langCode) => {
    changeLanguage(langCode);
    setIsOpen(false);
    // Devuelve el foco al botón para mejor accesibilidad
    if (buttonRef.current) buttonRef.current.focus();
  };

  const onKeyDown = useCallback((e) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      if (buttonRef.current) buttonRef.current.focus();
    }
    if ((e.key === 'Enter' || e.key === ' ') && !isOpen) {
      e.preventDefault();
      setIsOpen(true);
    }
  }, [isOpen]);

  const menuVariants = {
    hidden: { opacity: 0, y: -6, scale: 0.98 },
    visible: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: -6, scale: 0.98 }
  };

  return (
    <div className={`language-selector ${isOpen ? 'open' : ''}`} ref={selectorRef}>
      <button
        ref={buttonRef}
        className="language-selector-button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Cambiar idioma / Change language"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-controls="language-menu"
        onKeyDown={onKeyDown}
        title={`${currentLangData?.name || 'Cambiar idioma'}`}
      >
        <span className="language-flag">{currentLangData?.flag || '🌐'}</span>
        <span className={`language-arrow ${isOpen ? 'open' : ''}`} aria-hidden>▼</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="language-menu"
            role="menu"
            className="language-dropdown"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={menuVariants}
            transition={{ type: 'spring', stiffness: 420, damping: 30, mass: 0.6 }}
          >
            <div className="language-grid">
              {languageList.map((lang) => {
                const active = currentLanguage === lang.code;
                return (
                  <button
                    key={lang.code}
                    className={`language-option ${active ? 'active' : ''}`}
                    onClick={() => handleLanguageChange(lang.code)}
                    role="menuitemradio"
                    aria-checked={active}
                    title={lang.name}
                  >
                    <span className="language-flag">{lang.flag}</span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LanguageSelector;
