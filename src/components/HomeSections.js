import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useTranslatedMediaList } from '../hooks/useTranslatedContent';
import { useDynamicPosters, getDynamicPosterUrl } from '../hooks/useDynamicPoster';
import SectionRow from './SectionRow';
import DetailModal from './DetailModal';
import './HomeSections.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || (
  (typeof window !== 'undefined' && window.location.hostname === 'localhost')
    ? 'http://localhost:8000'
    : 'https://mi-catalogo-backend.onrender.com'
);

function rotateArray(arr, shift) {
  const n = arr.length;
  const s = shift % n;
  return arr.slice(s).concat(arr.slice(0, s));
}

// HomeSections ahora recibe 'medias' como prop y 'onMediaClick' para la selección
export default function HomeSections({ medias, onMediaClick }) {
  const { t } = useLanguage();
  
  // Hook para traducir listas de medios - DEBE IR ANTES que otros useMemo que lo usen
  const translatedMedias = useTranslatedMediaList(medias || [], 'all');
  
  // Hook para portadas dinámicas
  const postersMap = useDynamicPosters(translatedMedias.displayData || []);
  
  // Función para normalizar géneros usando el sistema de traducción existente
  const normalizeGenre = (genero) => {
    if (!genero) return '';
    const generoLower = genero.toLowerCase().trim();
    // Usar el sistema de traducción para normalizar
    const translated = t(`genres.${generoLower}`);
    // Si no encuentra traducción, devolver el género original
    return translated === `genres.${generoLower}` ? genero : translated;
  };  // Definir las secciones de forma dinámica para poder traducirlas
  const getSections = () => [
    { titleKey: 'homeSections.trends', especial: 'tendencias' },
    { titleKey: 'homeSections.recentlyAdded', especial: 'recientes' },
    { titleKey: 'homeSections.action', genero: 'Acción' },
    { titleKey: 'homeSections.crime', genero: 'Crimen' },
    { titleKey: 'homeSections.comedy', genero: 'Comedia' },
    { titleKey: 'homeSections.adventure', genero: 'Aventura' },
    { titleKey: 'homeSections.animation', genero: 'Animación' },
    { titleKey: 'homeSections.horror', genero: 'Terror' },
    { titleKey: 'homeSections.sciFi', genero: 'Ciencia ficción' },
    { titleKey: 'homeSections.drama', genero: 'Drama' }
  ];
  // Estado para medias extra por género
  const [extraMediasPorGenero, setExtraMediasPorGenero] = useState({});
  // Agrupación de medias por género individual usando normalización consistente
  const mediasPorGenero = useMemo(() => {
    const agrupado = {};
    const displayData = translatedMedias.displayData || [];
    if (!displayData.length) return agrupado;
    
    displayData.forEach(media => {
      if (!media.genero) return;
      // Divide por coma y quita espacios, luego normaliza cada género
      media.genero.split(',').map(g => g.trim()).forEach(genero => {
        const normalizedGenre = normalizeGenre(genero);
        if (!agrupado[normalizedGenre]) agrupado[normalizedGenre] = [];
        agrupado[normalizedGenre].push(media);
      });
    });
    return agrupado;
  }, [translatedMedias.displayData]);

  // Efecto para cargar más títulos si faltan en cada género
  useEffect(() => {
    const loadMoreTitles = async () => {
      for (const section of getSections()) {
        if (!section.genero) continue;
        const normalizedGenre = normalizeGenre(section.genero);
        const base = mediasPorGenero[normalizedGenre] || [];
        const extra = extraMediasPorGenero[normalizedGenre]?.items || [];
        const total = base.length + extra.length;
        
    // Cargar más películas si:
    // 1. No hemos llegado a 20 películas (aunque base sea 0, intentamos rellenar desde backend)
    // 2. No estamos cargando actualmente
    // 3. No hemos marcado como "todas cargadas"
        if (
          total < ITEMS_PER_ROW &&
          !(extraMediasPorGenero[normalizedGenre]?.loading) &&
          !(extraMediasPorGenero[normalizedGenre]?.allLoaded)
        ) {
          setExtraMediasPorGenero(prev => ({
            ...prev,
            [normalizedGenre]: { loading: true, items: extra, allLoaded: false }
          }));
          
          // Cargar chunks más grandes para completar hasta 20 rápidamente
    const chunkSize = Math.min(ITEMS_PER_ROW - total, 20);
    const extraSkip = extra.length; // paginar por extras ya cargados, no por base+extra
          
          const jwtToken = localStorage.getItem('jwt_token');
          const excludeIds = [...(base || []), ...(extra || [])].map(m => m.id).filter(Boolean);
          const qs = new URLSearchParams({
            genero: normalizedGenre,
            skip: String(extraSkip),
            limit: String(chunkSize),
            ...(excludeIds.length ? { exclude_ids: excludeIds.join(',') } : {})
          }).toString();
          
          try {
            const response = await fetch(`${BACKEND_URL}/medias?${qs}`, {
              credentials: 'include',
              headers: {
                ...(jwtToken ? { 'Authorization': `Bearer ${jwtToken}` } : {})
              }
            });
            
            if (!response.ok) {
              throw new Error(`HTTP ${response.status}`);
            }
            
            const nuevos = await response.json();
            // Deduplicar por id contra extras existentes y base del género
            const baseIds = new Set((base || []).map(m => m.id));
            const seen = new Set((extra || []).map(m => m.id));
            const dedupNuevos = [];
            for (const m of (nuevos || [])) {
              if (m && !seen.has(m.id) && !baseIds.has(m.id)) { seen.add(m.id); dedupNuevos.push(m); }
            }
            const merged = [...extra, ...dedupNuevos];
            const reached = (base.length + merged.length) >= ITEMS_PER_ROW;
            // Solo marcamos allLoaded si no añadimos ningún único nuevo; si hubo duplicados, seguiremos pidiendo más
            const noMore = (dedupNuevos.length === 0);
            setExtraMediasPorGenero(prev => ({
              ...prev,
              [normalizedGenre]: {
                loading: false,
                items: merged,
                allLoaded: reached || noMore
              }
            }));
          } catch (error) {
            setExtraMediasPorGenero(prev => ({
              ...prev,
              [normalizedGenre]: { loading: false, items: extra, allLoaded: true }
            }));
          }
        }
      }
    };
    
    loadMoreTitles();
    // eslint-disable-next-line
  }, [mediasPorGenero, BACKEND_URL, extraMediasPorGenero]);

  // Combina medias locales y extra para cada sección
  function getItemsForSection(genero) {
    const normalizedGenre = normalizeGenre(genero);
    const base = mediasPorGenero[normalizedGenre] || [];
    const extra = extraMediasPorGenero[normalizedGenre]?.items || [];
    
    // Deduplicar por ID antes de combinar
    const seen = new Set();
    const deduplicatedItems = [];
    
    // Primero agregar las medias base (del prop)
    for (const item of base) {
      if (item && item.id && !seen.has(item.id)) {
        seen.add(item.id);
        deduplicatedItems.push(item);
      }
    }
    
    // Luego agregar las medias extra (del backend) que no estén duplicadas
    for (const item of extra) {
      if (item && item.id && !seen.has(item.id)) {
        seen.add(item.id);
        deduplicatedItems.push(item);
      }
    }
    
    const items = deduplicatedItems.slice(0, ITEMS_PER_ROW);
    
    // Aplicar portadas dinámicas
    return items.map(item => ({
      ...item,
      imagen: getDynamicPosterUrl(item, postersMap)
    }));
  }

  // Rotar secciones según el día del año
  const today = new Date();
  const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
  const rotatedSections = useMemo(() => rotateArray(getSections(), dayOfYear), [dayOfYear, t]);
  const INITIAL_SECTIONS = 6;
  const ITEMS_PER_ROW = 20;
  const [visibleCount, setVisibleCount] = useState(INITIAL_SECTIONS);

  // Si no se proporciona onMediaClick, usar un manejador por defecto
  const handleSelect = onMediaClick || function(item) {
    // Fallback por si no se pasa onMediaClick
  };

  return (
    <>
      {rotatedSections
        .slice(0, visibleCount) // Limitar secciones visibles
        .map((section, index) => {
        // Secciones especiales: tendencias y recientes
        if (section.especial === 'tendencias') {
          // Tendencias: combinación de favorita, nota y reciente
          const ahora = new Date();
          const haceUnMes = new Date();
          haceUnMes.setDate(ahora.getDate() - 30);
          const items = (translatedMedias.displayData || [])
            .slice()
            .map(m => ({
              ...m,
              tendenciaScore:
                (m.favorito ? 15 : 0) +
                (m.nota_personal ? m.nota_personal * 2 : 0) +
                (m.nota_imdb ? m.nota_imdb : 0) +
                (m.fecha_agregado && new Date(m.fecha_agregado) > haceUnMes ? 5 : 0),
              imagen: getDynamicPosterUrl(m, postersMap)
            }))
            .sort((a, b) => b.tendenciaScore - a.tendenciaScore)
            .slice(0, ITEMS_PER_ROW);
          if (!items.length) return null;
          return (
            <SectionRow
              key={section.titleKey}
              title={t(section.titleKey)}
              items={items}
              carousel={true}
              onSelect={handleSelect}
            />
          );
        }
        if (section.especial === 'recientes') {
          // Ordena por fecha_agregado descendente, mismo límite
          const items = (translatedMedias.displayData || [])
            .slice()
            .map(m => ({
              ...m,
              imagen: getDynamicPosterUrl(m, postersMap)
            }))
            .sort((a, b) => new Date(b.fecha_agregado || 0) - new Date(a.fecha_agregado || 0))
            .slice(0, ITEMS_PER_ROW);
          if (!items.length) return null;
          return (
            <SectionRow
              key={section.titleKey}
              title={t(section.titleKey)}
              items={items}
              carousel={true}
              onSelect={handleSelect}
            />
          );
        }
        // Secciones normales por género
        if (section.genero) {
          const items = getItemsForSection(section.genero);
          // No mostrar la sección si tiene menos de 3 películas
          if (items.length < 3) return null;
          
          return (
            <SectionRow
              key={section.genero}
              title={t(section.titleKey)}
              items={items}
              carousel={true}
              loading={false}
              error={false}
              onSelect={handleSelect}
            />
          );
        }
        return null;
      }).filter(Boolean)} {/* Filtrar elementos null */}
      
      {visibleCount < rotatedSections.length && (
        <div style={{ textAlign: 'center', margin: '2rem 0' }}>
          <button 
            onClick={() => setVisibleCount(prev => Math.min(prev + 3, rotatedSections.length))}
            className="load-more-sections-btn"
          >
            {t('common.loadMore')}
          </button>
        </div>
      )}
    </>
  );
}
