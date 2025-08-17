// Utilidad para traducción inteligente de géneros
// Esta función maneja géneros nuevos que no están en los diccionarios de traducción

import { useLanguage } from '../context/LanguageContext';

/**
 * Traduce un género de forma inteligente con múltiples estrategias de fallback
 * @param {string} genre - El género a traducir
 * @param {function} t - Función de traducción de i18n
 * @param {string} currentLanguage - Idioma actual
 * @returns {string} - Género traducido o procesado
 */
export const translateGenreIntelligent = (genre, t, currentLanguage) => {
  if (!genre) return '';
  
  const originalGenre = genre;
  const lowerGenre = genre.toLowerCase().trim();
  
  // 1. Intentar traducción directa desde el diccionario
  const directTranslation = t(`genres.${lowerGenre}`, null);
  if (directTranslation && directTranslation !== `genres.${lowerGenre}`) {
    return directTranslation;
  }
  
  // 2. Intentar normalizar y traducir partes comunes
  const normalizedGenre = normalizeGenre(lowerGenre, currentLanguage);
  if (normalizedGenre !== originalGenre) {
    const normalizedTranslation = t(`genres.${normalizedGenre.toLowerCase()}`, null);
    if (normalizedTranslation && normalizedTranslation !== `genres.${normalizedGenre.toLowerCase()}`) {
      return normalizedTranslation;
    }
  }
  
  // 3. Si tiene múltiples géneros separados por comas, traducir cada uno
  if (genre.includes(',')) {
    const genreParts = genre.split(',').map(part => part.trim());
    const translatedParts = genreParts.map(part => 
      translateGenreIntelligent(part, t, currentLanguage)
    );
    return translatedParts.join(', ');
  }
  
  // 4. Si tiene "&" o "and", traducir cada parte
  if (genre.includes('&') || genre.includes(' and ')) {
    const separator = genre.includes('&') ? '&' : ' and ';
    const connector = getConnector(currentLanguage);
    const parts = genre.split(separator).map(part => part.trim());
    const translatedParts = parts.map(part => 
      translateGenreIntelligent(part, t, currentLanguage)
    );
    return translatedParts.join(` ${connector} `);
  }
  
  // 5. Aplicar reglas de capitalización según el idioma
  return capitalizeForLanguage(originalGenre, currentLanguage);
};

/**
 * Normaliza géneros comunes a formas más estándar
 */
const normalizeGenre = (genre, language) => {
  const normalizations = {
    // Normalizaciones comunes en inglés
    'sci-fi': 'science fiction',
    'scifi': 'science fiction',
    'rom-com': 'romantic comedy',
    'romcom': 'romantic comedy',
    'action/adventure': 'action & adventure',
    'action-adventure': 'action & adventure',
    'war/politics': 'war & politics',
    'war-politics': 'war & politics',
    
    // Normalizaciones en español
    'ciencia-ficción': 'ciencia ficción',
    'ciencia-ficcion': 'ciencia ficción',
    'comedia-romantica': 'comedia romántica',
    'accion': 'acción',
    
    // Normalizaciones en portugués
    'ficção-científica': 'ficção científica',
    'ficção-cientifica': 'ficção científica',
    'comédia-romântica': 'comédia romântica',
    'ação': 'ação',
  };
  
  return normalizations[genre] || genre;
};

/**
 * Obtiene el conector apropiado para el idioma
 */
const getConnector = (language) => {
  const connectors = {
    'es': 'y',
    'en': '&',
    'fr': 'et',
    'de': '&',
    'pt': 'e'
  };
  
  return connectors[language] || '&';
};

/**
 * Aplica capitalización apropiada según el idioma
 */
const capitalizeForLanguage = (text, language) => {
  if (!text) return '';
  
  // Para idiomas que capitalizan títulos (inglés)
  if (language === 'en') {
    return text.split(' ').map(word => {
      // No capitalizar artículos, preposiciones cortas, etc.
      const lowerWords = ['and', 'of', 'the', 'in', 'on', 'at', 'to', 'for', 'with'];
      if (lowerWords.includes(word.toLowerCase())) {
        return word.toLowerCase();
      }
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    }).join(' ');
  }
  
  // Para otros idiomas, solo capitalizar la primera letra
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

/**
 * Hook personalizado para traducción de géneros
 */
export const useGenreTranslation = () => {
  const { t, currentLanguage } = useLanguage();
  
  const translateGenre = (genre) => {
    return translateGenreIntelligent(genre, t, currentLanguage);
  };
  
  return { translateGenre };
};

/**
 * Obtiene géneros únicos de un array de medias
 */
export const extractUniqueGenres = (medias) => {
  const genresSet = new Set();
  
  medias.forEach(media => {
    if (media.genero) {
      // Separar por comas y limpiar
      const genres = media.genero.split(',').map(g => g.trim());
      genres.forEach(genre => {
        if (genre) genresSet.add(genre);
      });
    }
  });
  
  return Array.from(genresSet).sort();
};

/**
 * Función para sugerir traducciones automáticas para géneros nuevos
 * (Esta función podría expandirse para usar APIs de traducción)
 */
export const suggestGenreTranslations = (genre, targetLanguages = ['es', 'en', 'fr', 'de', 'pt']) => {
  // Diccionario básico de patrones comunes
  const patterns = {
    // Términos que terminan en -tion (inglés) -> -ción (español)
    'action': { es: 'acción', pt: 'ação', fr: 'action', de: 'action' },
    'fiction': { es: 'ficción', pt: 'ficção', fr: 'fiction', de: 'fiktion' },
    'animation': { es: 'animación', pt: 'animação', fr: 'animation', de: 'animation' },
    
    // Términos comunes
    'comedy': { es: 'comedia', pt: 'comédia', fr: 'comédie', de: 'komödie' },
    'drama': { es: 'drama', pt: 'drama', fr: 'drame', de: 'drama' },
    'horror': { es: 'terror', pt: 'terror', fr: 'horreur', de: 'horror' },
    'romance': { es: 'romance', pt: 'romance', fr: 'romance', de: 'romantik' },
    'adventure': { es: 'aventura', pt: 'aventura', fr: 'aventure', de: 'abenteuer' },
    'thriller': { es: 'thriller', pt: 'thriller', fr: 'thriller', de: 'thriller' },
    'mystery': { es: 'misterio', pt: 'mistério', fr: 'mystère', de: 'mystery' },
    'crime': { es: 'crimen', pt: 'crime', fr: 'crime', de: 'krimi' },
    'fantasy': { es: 'fantasía', pt: 'fantasia', fr: 'fantaisie', de: 'fantasy' },
    'documentary': { es: 'documental', pt: 'documentário', fr: 'documentaire', de: 'dokumentation' },
    'biography': { es: 'biografía', pt: 'biografia', fr: 'biographie', de: 'biografie' },
    'history': { es: 'historia', pt: 'história', fr: 'histoire', de: 'geschichte' },
    'war': { es: 'guerra', pt: 'guerra', fr: 'guerre', de: 'krieg' },
    'western': { es: 'western', pt: 'western', fr: 'western', de: 'western' },
    'musical': { es: 'musical', pt: 'musical', fr: 'musical', de: 'musical' },
    'family': { es: 'familia', pt: 'família', fr: 'famille', de: 'familie' },
    'sport': { es: 'deporte', pt: 'esporte', fr: 'sport', de: 'sport' },
    'music': { es: 'música', pt: 'música', fr: 'musique', de: 'musik' }
  };
  
  const suggestions = {};
  const lowerGenre = genre.toLowerCase();
  
  // Buscar coincidencias exactas
  if (patterns[lowerGenre]) {
    return patterns[lowerGenre];
  }
  
  // Buscar coincidencias parciales
  for (const [pattern, translations] of Object.entries(patterns)) {
    if (lowerGenre.includes(pattern)) {
      targetLanguages.forEach(lang => {
        if (translations[lang]) {
          suggestions[lang] = genre.replace(new RegExp(pattern, 'gi'), translations[lang]);
        }
      });
    }
  }
  
  return suggestions;
};
