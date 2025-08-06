import { useLanguage } from '../context/LanguageContext';

// Hook personalizado para traducir múltiples claves de una vez
export const useTranslations = (keys) => {
  const { t } = useLanguage();
  
  if (Array.isArray(keys)) {
    return keys.reduce((acc, key) => {
      acc[key] = t(key);
      return acc;
    }, {});
  }
  
  return Object.keys(keys).reduce((acc, alias) => {
    acc[alias] = t(keys[alias]);
    return acc;
  }, {});
};

// Hook para traducciones de formularios comunes
export const useFormTranslations = () => {
  const { t } = useLanguage();
  
  return {
    save: t('actions.save'),
    cancel: t('actions.cancel'),
    delete: t('actions.delete'),
    edit: t('actions.edit'),
    add: t('actions.add'),
    create: t('actions.create'),
    close: t('actions.close'),
    loading: t('actions.loading'),
    search: t('actions.search'),
    filter: t('actions.filter'),
    clear: t('actions.clear')
  };
};

// Hook para traducciones de secciones comunes
export const useSectionTranslations = () => {
  const { t } = useLanguage();
  
  return {
    home: t('sections.home'),
    movies: t('sections.movies'),
    series: t('sections.series'),
    favorites: t('sections.favorites'),
    pending: t('sections.pending'),
    lists: t('sections.lists'),
    summary: t('sections.summary')
  };
};

export default useTranslations;
