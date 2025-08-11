import { useState, useEffect, useMemo, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { contentTranslationService } from '../utils/contentTranslation';

export const useTranslatedContent = (media) => {
  const { currentLanguage } = useLanguage();
  const [translatedMedia, setTranslatedMedia] = useState(media);
  const [isTranslating, setIsTranslating] = useState(false);

  useEffect(() => {
    const translateContent = async () => {
      if (!media || currentLanguage === 'es') {
        // Si es español o no hay media, usar contenido original
        setTranslatedMedia(media);
        return;
      }

      setIsTranslating(true);
      try {
        const translated = await contentTranslationService.getTranslatedContent(
          media, 
          currentLanguage
        );
        setTranslatedMedia(translated);
      } catch (error) {
        console.error('Error translating content:', error);
        setTranslatedMedia(media); // Fallback al original
      } finally {
        setIsTranslating(false);
      }
    };

    translateContent();
  }, [media, currentLanguage]);

  return { translatedMedia, isTranslating };
};

// Hook para listas de media
export const useTranslatedMediaList = (mediaList, mode = 'all') => {
  const { currentLanguage } = useLanguage();
  const [translatedList, setTranslatedList] = useState([]);
  const [isTranslating, setIsTranslating] = useState(false);
  
  // Usar JSON.stringify para una comparación estable de arrays
  const mediaListKey = useMemo(() => {
    if (!Array.isArray(mediaList)) return '[]';
    return JSON.stringify(mediaList.map(item => ({ id: item?.id, titulo: item?.titulo })));
  }, [mediaList]);

  useEffect(() => {
    const translateList = async () => {
      const safeList = Array.isArray(mediaList) ? mediaList : [];
      
      if (!safeList.length || currentLanguage === 'es') {
        setTranslatedList(safeList);
        return;
      }

      setIsTranslating(true);
      try {
        const translatedPromises = safeList.map(media => 
          contentTranslationService.getTranslatedContent(media, currentLanguage)
        );
        const translated = await Promise.all(translatedPromises);
        setTranslatedList(translated);
      } catch (error) {
        console.error('Error translating media list:', error);
        setTranslatedList(safeList);
      } finally {
        setIsTranslating(false);
      }
    };

    translateList();
  }, [mediaListKey, currentLanguage]);

  return { 
    translatedList, 
    isTranslating,
    displayData: translatedList // For compatibility with existing code
  };
};
