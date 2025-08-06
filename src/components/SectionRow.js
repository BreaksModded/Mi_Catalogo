import React, { useRef, useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useTranslatedMediaList } from '../hooks/useTranslatedContent';
import './SectionRow.css';

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
      const scrollAmount = scrollContainerRef.current.clientWidth * 0.8;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
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
          {items.map(item => (
            <div
              key={item.id}
              className="section-row-card"
              onClick={() => onSelect(item)}
              title={item.titulo}
            >
              <div className="section-row-poster-container">
                <img 
                  src={item.imagen} 
                  alt={item.titulo} 
                  className="section-row-poster"
                  loading="lazy"
                />
                {item.favorito && (
                  <span className="favorite-badge">{t('detailModal.favorite')}</span>
                )}
                {item.pendiente && (
                  <span className="pending-badge">{t('detailModal.pending')}</span>
                )}
                {item.nota_imdb !== undefined && item.nota_imdb !== null && item.nota_imdb !== '' && (
                  <div className="nota-imdb-badge-card">
                    <span className="nota-imdb-num-card">{parseFloat(item.nota_imdb).toFixed(1)}</span>
                    <span className="nota-imdb-star-card">★</span>
                  </div>
                )}
                <div className="nota-personal-badge-card">
                  {item.nota_personal && item.nota_personal > 0 ? (
                    <span className="nota-personal-num-card">{parseFloat(item.nota_personal).toFixed(1)}</span>
                  ) : (
                    <span className="nota-personal-num-card">-</span>
                  )}
                  <span className="nota-personal-star-card">★</span>
                </div>
              </div>
              <div className="section-row-name">{item.titulo}</div>
            </div>
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