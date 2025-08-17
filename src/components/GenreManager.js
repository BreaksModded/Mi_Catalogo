import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { extractUniqueGenres, suggestGenreTranslations } from '../utils/genreTranslation';
import './GenreManager.css';

const GenreManager = ({ medias }) => {
  const { t, currentLanguage } = useLanguage();
  const [missingGenres, setMissingGenres] = useState([]);
  const [suggestions, setSuggestions] = useState({});
  const [showManager, setShowManager] = useState(false);

  useEffect(() => {
    if (!medias || medias.length === 0) return;

    // Extraer géneros únicos de las medias
    const allGenres = extractUniqueGenres(medias);
    
    // Verificar cuáles no tienen traducción
    const missing = [];
    allGenres.forEach(genre => {
      const lowerGenre = genre.toLowerCase();
      const translation = t(`genres.${lowerGenre}`, null);
      
      // Si la traducción es la misma que la clave, significa que no existe
      if (!translation || translation === `genres.${lowerGenre}`) {
        missing.push(genre);
      }
    });

    setMissingGenres(missing);

    // Generar sugerencias para géneros faltantes
    if (missing.length > 0) {
      const genreSuggestions = {};
      missing.forEach(genre => {
        genreSuggestions[genre] = suggestGenreTranslations(genre);
      });
      setSuggestions(genreSuggestions);
    }
  }, [medias, t, currentLanguage]);

  // Solo mostrar en desarrollo o para administradores
  if (process.env.NODE_ENV === 'production' && !showManager) {
    return null;
  }

  if (missingGenres.length === 0) {
    return (
      <div className="genre-manager genre-manager--success">
        <h4>✅ Todas las traducciones de géneros están completas</h4>
        <p>Se encontraron {extractUniqueGenres(medias || []).length} géneros únicos, todos con traducciones.</p>
      </div>
    );
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Código copiado al portapapeles');
  };

  const generateLanguageCode = (language) => {
    const languageNames = {
      'es': 'Español',
      'en': 'English', 
      'fr': 'Français',
      'de': 'Deutsch',
      'pt': 'Português'
    };

    let code = `// Géneros faltantes para ${languageNames[language] || language}\n`;
    
    missingGenres.forEach(genre => {
      const key = genre.toLowerCase();
      const suggestion = suggestions[genre] && suggestions[genre][language] 
        ? suggestions[genre][language] 
        : genre;
      
      code += `'${key}': '${suggestion}',\n`;
    });

    return code;
  };

  return (
    <div className="genre-manager">
      <div className="genre-manager__header">
        <h3>⚠️ Géneros sin traducir detectados</h3>
        <p>Se encontraron {missingGenres.length} géneros que necesitan traducciones:</p>
      </div>

      <div className="genre-manager__missing-list">
        {missingGenres.map(genre => (
          <div key={genre} className="missing-genre">
            <span className="missing-genre__name">{genre}</span>
            <div className="missing-genre__suggestions">
              {Object.entries(suggestions[genre] || {}).map(([lang, suggestion]) => (
                <span key={lang} className="suggestion">
                  <strong>{lang.toUpperCase()}:</strong> {suggestion}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="genre-manager__actions">
        <h4>Código para añadir a los archivos de idiomas:</h4>
        <div className="language-codes">
          {['es', 'en', 'fr', 'de', 'pt'].map(lang => (
            <div key={lang} className="language-code">
              <div className="language-code__header">
                <h5>{lang}.js</h5>
                <button 
                  onClick={() => copyToClipboard(generateLanguageCode(lang))}
                  className="copy-button"
                >
                  📋 Copiar
                </button>
              </div>
              <pre className="language-code__content">
                {generateLanguageCode(lang)}
              </pre>
            </div>
          ))}
        </div>
      </div>

      <div className="genre-manager__instructions">
        <h4>Instrucciones:</h4>
        <ol>
          <li>Copia el código del idioma correspondiente</li>
          <li>Abre el archivo <code>src/i18n/languages/[idioma].js</code></li>
          <li>Busca el objeto <code>genres</code></li>
          <li>Añade las nuevas traducciones</li>
          <li>Guarda y recarga la aplicación</li>
        </ol>
      </div>
    </div>
  );
};

export default GenreManager;
