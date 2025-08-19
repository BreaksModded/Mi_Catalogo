import React, { useRef, useState, useEffect } from 'react';
import { useHybridPoster } from '../hooks/useHybridContent';
import { useLanguage } from '../context/LanguageContext';
import { useTranslatedMediaList } from '../hooks/useTranslatedContent';
import PosterSkeleton from './PosterSkeleton';
import './SectionRow.css';

// Función para obtener colores según la puntuación
export const getRatingColors = (rating) => {
  const numRating = parseFloat(rating);
  if (numRating >= 9.0) {
    return { 
      color: '#FFD60A', 
      darkColor: '#996300', 
      textColor: '#FFD60A',
      isPremium: true,
      shadow: `
        0 0 8px #FFD60A,
        0 0 16px #FFD60A,
        0 0 24px #FFD60A,
        0 2px 6px rgba(0,0,0,0.5)
      `,
      border: '2px solid #FFF'
    };
  } else if (numRating >= 7.0) {
    return { 
      color: '#21d07a', 
      darkColor: '#204529', 
      textColor: '#fff',
      isPremium: false,
      shadow: '0 2px 6px rgba(0,0,0,0.5)',
      border: 'none'
    };
  } else if (numRating >= 5.0) {
    return { 
      color: '#FFC107', 
      darkColor: '#FF8F00', 
      textColor: '#fff',
      isPremium: false,
      shadow: '0 2px 6px rgba(0,0,0,0.5)',
      border: 'none'
    };
  } else {
    return { 
      color: '#F44336', 
      darkColor: '#C62828', 
      textColor: '#fff',
      isPremium: false,
      shadow: '0 2px 6px rgba(0,0,0,0.5)',
      border: 'none'
    };
  }
};

// Componente individual para cada card con su propia portada híbrida (cache + TMDb fallback)
function SectionRowCard({ item, onSelect, t }) {
  const mediaType = item.tipo?.toLowerCase().includes('serie') ? 'tv' : 'movie';
  const { posterUrl, loading, cached } = useHybridPoster(item.tmdb_id, mediaType, item.imagen);
  const href = `/detail/${item.id}`;

  const handleClick = (e) => {
    // Permitir gestos de nueva pestaña (Ctrl/Cmd/Shift/Alt o no-left click)
    if (e.ctrlKey || e.metaKey || e.shiftKey || e.altKey || e.button !== 0) return;
    // Interceptar solo clic normal izquierdo para abrir modal interno
    e.preventDefault();
    onSelect(item);
  };

  return (
    <a
      href={href}
      className="section-row-card"
      onClick={handleClick}
      title={`${item.titulo}${cached ? ' (🚀 Cache)' : ''}`}
      style={{ cursor: 'pointer', textDecoration: 'none', color: 'inherit', display: 'block' }}
      rel="noopener noreferrer"
    >
      <div className="section-row-poster-container">
        {loading ? (
          <PosterSkeleton size="normal" className="section-row-poster" />
        ) : (
          <img 
            src={posterUrl} 
            alt={item.titulo} 
            className={`section-row-poster poster-transition ${loading ? 'poster-loading' : 'poster-loaded'}`}
            loading="lazy"
          />
        )}
        {cached && (
          <div className="cache-indicator" title="Cargado desde cache local">🚀</div>
        )}
        {item.favorito && (
          <span className="favorite-badge">{t('detailModal.favorite')}</span>
        )}
        {item.pendiente && (
          <span className="pending-badge">{t('detailModal.pending')}</span>
        )}
        {item.nota_imdb !== undefined && item.nota_imdb !== null && item.nota_imdb !== '' && (
          <div 
            className={`nota-imdb-badge-card ${getRatingColors(item.nota_imdb).isPremium ? 'premium' : ''}`}
            style={{ 
              '--progress': `${Math.round(parseFloat(item.nota_imdb) * 10)}%`,
              '--rating-color': getRatingColors(item.nota_imdb).color,
              '--rating-color-dark': getRatingColors(item.nota_imdb).darkColor,
              '--text-color': getRatingColors(item.nota_imdb).textColor,
              '--rating-shadow': getRatingColors(item.nota_imdb).shadow,
              '--rating-border': getRatingColors(item.nota_imdb).border
            }}
            title={t('tooltips.tmdbRating')}
          >
            <span className="nota-imdb-num-card">{Number(item.nota_imdb).toFixed(1)}</span>
          </div>
        )}
        {item.nota_personal && item.nota_personal > 0 ? (
          <div 
            className={`nota-personal-badge-card ${getRatingColors(item.nota_personal).isPremium ? 'premium' : ''}`}
            style={{ 
              '--progress': `${Math.round(parseFloat(item.nota_personal) * 10)}%`,
              '--rating-color': getRatingColors(item.nota_personal).color,
              '--rating-color-dark': getRatingColors(item.nota_personal).darkColor,
              '--text-color': getRatingColors(item.nota_personal).textColor,
              '--rating-shadow': getRatingColors(item.nota_personal).shadow,
              '--rating-border': getRatingColors(item.nota_personal).border
            }}
            title={t('tooltips.personalRating')}
          >
            <span className="nota-personal-num-card">{Number(item.nota_personal).toFixed(1)}</span>
          </div>
        ) : (
          <div 
            className="nota-personal-badge-card nota-personal-empty"
            title={t('tooltips.noPersonalRating')}
          >
            <span className="nota-personal-num-card">?</span>
          </div>
        )}
      </div>
      <div className="section-row-name">{item.titulo}</div>
  </a>
  );
}

function SectionRow({ title, items, onSelect, carousel = false }) {
  const scrollContainerRef = useRef(null);
  const [showLeftButton, setShowLeftButton] = useState(false);
  const [showRightButton, setShowRightButton] = useState(true);
  const { t } = useLanguage();

  // Ensure items is always an array
  const safeItems = Array.isArray(items) ? items : [];

  // ✨ NUEVO: Usar contenido traducido automáticamente para la lista de items
  const { translatedList, isTranslating } = useTranslatedMediaList(safeItems);
  // Usar translatedList en lugar de items directamente, con fallback seguro
  const displayItems = Array.isArray(translatedList) ? translatedList : safeItems;

  // Only enable scroll logic if carousel is true
  useEffect(() => {
    if (!carousel) return;
    const handleScroll = () => {
      if (scrollContainerRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
        setShowLeftButton(scrollLeft > 0);
        setShowRightButton(scrollLeft < scrollWidth - clientWidth - 10);
      }
    };
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      setShowRightButton(container.scrollWidth > container.clientWidth);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [displayItems, carousel]); // Usar displayItems en lugar de items

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const scrollAmount = container.clientWidth * 0.75; // Reducir un poco para mejor control
      
      // Animación más suave y lenta
      const startPosition = container.scrollLeft;
      const targetPosition = startPosition + (direction === 'left' ? -scrollAmount : scrollAmount);
      const distance = Math.abs(targetPosition - startPosition);
      
      // Duración basada en la distancia, pero más lenta que antes
      const duration = Math.min(800, Math.max(400, distance * 0.8));
      
      let startTime = null;
      
      const animateScroll = (currentTime) => {
        if (startTime === null) startTime = currentTime;
        const timeElapsed = currentTime - startTime;
        const progress = Math.min(timeElapsed / duration, 1);
        
        // Función de easing suave (ease-out)
        const easeOut = 1 - Math.pow(1 - progress, 3);
        
        const currentPosition = startPosition + (targetPosition - startPosition) * easeOut;
        container.scrollLeft = currentPosition;
        
        if (progress < 1) {
          requestAnimationFrame(animateScroll);
        }
      };
      
      requestAnimationFrame(animateScroll);
    }
  };


  if (!displayItems || !displayItems.length) return null;

  return (
    <section className="section-row">
      {title && <h2 className="section-title">{title}</h2>}
      <div className="section-row-container">
        {carousel && showLeftButton && (
          <button 
            className="scroll-button scroll-left" 
            onClick={() => scroll('left')}
            aria-label="Scroll left"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
        )}
        <div 
          className={carousel ? "section-row-list" : "section-row-list-vertical"}
          ref={carousel ? scrollContainerRef : null}
        >
          {displayItems.map((item, idx) => (
            <SectionRowCard
              key={`${item.id || ''}-${item.tipo || item.mediaType || ''}-${idx}`}
              item={item}
              onSelect={onSelect}
              t={t}
            />
          ))}
        </div>
        {carousel && showRightButton && (
          <button 
            className="scroll-button scroll-right" 
            onClick={() => scroll('right')}
            aria-label="Scroll right"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        )}
      </div>
    </section>
  );
}

export default SectionRow;