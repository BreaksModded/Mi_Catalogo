import React, { useState, useEffect } from 'react';
import './RelatedMedia.css';
import { useLanguage } from '../context/LanguageContext';

const API_URL = process.env.REACT_APP_BACKEND_URL || "https://mi-catalogo-backend.onrender.com";

function RelatedMedia({ tmdbId, mediaType, onSelectMedia = () => {} }) {
  const { t, currentLanguage } = useLanguage();
  const [relatedMedia, setRelatedMedia] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRelatedMedia = async () => {
      if (!tmdbId || !mediaType) return;
      setLoading(true);
      setError('');

      try {
        
        // Limpiar el estado anterior
        setRelatedMedia([]);

        let groups = [];
        let collectionIds = [];

        // Obtener información de la colección si existe
        const languageCode = currentLanguage === 'en' ? 'en-US' : 'es-ES';
        
        // Usar el endpoint correcto del backend
        const movieRes = await fetch(`${API_URL}/tmdb/${mediaType}/${tmdbId}?language=${languageCode}`);
        if (!movieRes.ok) {
          console.error('Error fetching movie data:', await movieRes.text());
          throw new Error('Failed to fetch movie data');
        }
        const movieData = await movieRes.json();

        // Si hay colección, obtener sus partes
        if (movieData.belongs_to_collection) {
          const collectionId = movieData.belongs_to_collection.id;
          
          // Usar endpoint de backend en lugar de TMDb directo
          try {
            const collectionPartsRes = await fetch(`${API_URL}/tmdb/collection/${collectionId}?language=${languageCode}`);
            if (!collectionPartsRes.ok) {
              console.error('Collection endpoint not available, skipping collection data');
            } else {
              const collectionPartsData = await collectionPartsRes.json();

              if (collectionPartsData.parts) {
                // Filtrar la película actual de la colección
                let parts = collectionPartsData.parts.filter(item => item.id !== parseInt(tmdbId));
                // Filtrar solo películas (media_type === 'movie' o no tiene media_type)
                parts = parts.filter(item => !item.media_type || item.media_type === 'movie');
                // Ordenar por año de salida ascendente
                parts = parts.sort((a, b) => {
                  const yearA = a.release_date ? parseInt(a.release_date.slice(0, 4)) : 0;
                  const yearB = b.release_date ? parseInt(b.release_date.slice(0, 4)) : 0;
                  return yearA - yearB;
                });
                groups.push({
                  type: 'collection',
                  title: movieData.belongs_to_collection.name,
                  items: parts
                });
                collectionIds = parts.map(item => item.id);
              }
            }
          } catch (err) {
            console.error('Error fetching collection data:', err);
          }
        }

        // Obtener recomendaciones según el tipo usando el backend
        let recommendationsUrl = '';
        if (mediaType === 'tv') {
          recommendationsUrl = `${API_URL}/tmdb/tv/${tmdbId}/recommendations?language=${languageCode}&page=1`;
        } else {
          recommendationsUrl = `${API_URL}/tmdb/movie/${tmdbId}/recommendations?language=${languageCode}&page=1`;
        }
        
        const recommendationsRes = await fetch(recommendationsUrl);
        
        let recommendationsData = {};
        try {
          recommendationsData = await recommendationsRes.json();
        } catch (err) {
          console.error('Error parsing recommendations JSON:', err);
          recommendationsData = { results: [] };
        }
        let filteredRecommendations = recommendationsData.results || [];
        if (collectionIds.length > 0) {
          filteredRecommendations = filteredRecommendations.filter(item => !collectionIds.includes(item.id));
        }
        if (filteredRecommendations.length > 0) {
          groups.push({
            type: 'recommendations',
            title: t('addMedia.similarTitles', 'Similares - Puede que también hayas visto'),
            items: filteredRecommendations.slice(0, 10)
          });
        }
        setRelatedMedia(groups);
        
      } catch (err) {
        console.error('Error fetching related media:', err);
        setError(t('messages.errorLoadingRelated', 'No se pudieron cargar los títulos relacionados'));
      } finally {
        setLoading(false);
      }
    };

    fetchRelatedMedia();
  }, [tmdbId, mediaType, currentLanguage]);

  if (loading) {
    return <div className="related-media-loading">{t('messages.searchingRelated', 'Buscando títulos relacionados...')}</div>;
  }

  if (error) {
    return <div className="related-media-error">{error}</div>;
  }

  if (relatedMedia.length === 0) {
    return null;
  }

  return (
    <div className="related-media">
      {relatedMedia.map((group, index) => (
        <div key={index} className="related-media-group">
          <h3>{group.title}</h3>
          <div className="related-media-items">
            {group.items.map((item) => {
              const title = item.title || item.name || t('addMedia.noTitle', 'Sin título');
              const year = item.release_date || item.first_air_date
                ? new Date(item.release_date || item.first_air_date).getFullYear()
                : t('addMedia.unknownYear', 'Año desconocido');
              const posterUrl = item.poster_path
                ? `https://image.tmdb.org/t/p/w200${item.poster_path}`
                : `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="200" height="300" viewBox="0 0 200 300"><rect width="200" height="300" fill="#333"/><text x="100" y="150" text-anchor="middle" fill="#666" font-family="Arial" font-size="14">${t('addMedia.notAvailable', 'No disponible')}</text></svg>`)}`;

              return (
                <div key={item.id} className="related-media-item" style={{cursor:'pointer'}} onClick={() => onSelectMedia && onSelectMedia(item)}>
                  <img 
                    src={posterUrl}
                    alt={title} 
                    className="related-media-poster"
                    onError={(e) => {
                      e.target.src = `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="200" height="300" viewBox="0 0 200 300"><rect width="200" height="300" fill="#333"/><text x="100" y="150" text-anchor="middle" fill="#666" font-family="Arial" font-size="14">${t('addMedia.notAvailable', 'No disponible')}</text></svg>`)}`;
                    }}
                  />
                  <div className="related-media-info">
                    <h4>{title}</h4>
                    <p>{year}</p>
                    {item.vote_average && (
                      <p className="rating">⭐ {item.vote_average.toFixed(1)}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

export default RelatedMedia;
