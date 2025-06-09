import React, { useState, useEffect } from 'react';
import './RelatedMedia.css';

const TMDB_API_KEY = 'ffac9eb544563d4d36980ea638fca7ce';
const TMDB_URL = `https://api.themoviedb.org/3`;

function RelatedMedia({ tmdbId, mediaType, onSelectMedia = () => {} }) {
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
        const collectionRes = await fetch(`${TMDB_URL}/movie/${tmdbId}?api_key=${TMDB_API_KEY}&language=es-ES`);
        const movieData = await collectionRes.json();

        // Si hay colección, obtener sus partes
        if (movieData.belongs_to_collection) {
          const collectionId = movieData.belongs_to_collection.id;
          const collectionPartsRes = await fetch(`${TMDB_URL}/collection/${collectionId}?api_key=${TMDB_API_KEY}&language=es-ES`);
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

        // Obtener recomendaciones según el tipo
        let recommendationsUrl = '';
        if (mediaType === 'tv') {
          recommendationsUrl = `${TMDB_URL}/tv/${tmdbId}/recommendations?api_key=${TMDB_API_KEY}&language=es-ES&page=1`;
        } else {
          recommendationsUrl = `${TMDB_URL}/movie/${tmdbId}/recommendations?api_key=${TMDB_API_KEY}&language=es-ES&page=1`;
        }
        const recommendationsRes = await fetch(recommendationsUrl);
        const recommendationsData = await recommendationsRes.json();
        let filteredRecommendations = recommendationsData.results || [];
        if (collectionIds.length > 0) {
          filteredRecommendations = filteredRecommendations.filter(item => !collectionIds.includes(item.id));
        }
        if (filteredRecommendations.length > 0) {
          groups.push({
            type: 'recommendations',
            title: 'Similares - Puede que también hayas visto',
            items: filteredRecommendations.slice(0, 10)
          });
        }
        setRelatedMedia(groups);
        
      } catch (err) {
        console.error('Error fetching related media:', err);
        setError('No se pudieron cargar los títulos relacionados');
      } finally {
        setLoading(false);
      }
    };

    fetchRelatedMedia();
  }, [tmdbId, mediaType]);

  if (loading) {
    return <div className="related-media-loading">Buscando títulos relacionados...</div>;
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
              const title = item.title || item.name || 'Sin título';
              const year = item.release_date || item.first_air_date
                ? new Date(item.release_date || item.first_air_date).getFullYear()
                : 'Año desconocido';
              const posterUrl = item.poster_path
                ? `https://image.tmdb.org/t/p/w200${item.poster_path}`
                : 'https://via.placeholder.com/200x300?text=No+disponible';

              return (
                <div key={item.id} className="related-media-item" style={{cursor:'pointer'}} onClick={() => onSelectMedia && onSelectMedia(item)}>
                  <img 
                    src={posterUrl}
                    alt={title} 
                    className="related-media-poster"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/200x300?text=No+disponible';
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
