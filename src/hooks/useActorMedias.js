import { useEffect, useState } from 'react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'https://mi-catalogo-backend.onrender.com';

export default function useActorMedias(personId) {
  const [medias, setMedias] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!personId) return;
    setLoading(true);
    setError('');
    fetch(`${BACKEND_URL}/medias/by_actor/${personId}`)
      .then(res => res.ok ? res.json() : Promise.reject(res))
      .then(data => {
        // Elimina duplicados por id (puede haber ids iguales de películas y series)
        const seen = new Set();
        const unique = [];
        for (const m of data) {
          const key = `${m.id || m.tmdb_id || ''}-${m.tipo || m.mediaType || ''}`;
          if (!seen.has(key)) {
            seen.add(key);
            unique.push(m);
          }
        }
        setMedias(unique);
      })
      .catch(() => setError('Error al cargar tus títulos con este actor'))
      .finally(() => setLoading(false));
  }, [personId]);

  return { medias, loading, error };
}
