import { useState, useEffect } from 'react';
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
export const useTranslatedMediaList = (mediaList) => {
  const { currentLanguage } = useLanguage();
  const safeList = Array.isArray(mediaList) ? mediaList : [];
  const [translatedList, setTranslatedList] = useState(safeList);
  const [isTranslating, setIsTranslating] = useState(false);

  useEffect(() => {
    const translateList = async () => {
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
  }, [mediaList, currentLanguage]); // Use mediaList instead of safeList

  return { 
    translatedList, 
    isTranslating,
    displayData: translatedList // For compatibility with existing code
  };
};
