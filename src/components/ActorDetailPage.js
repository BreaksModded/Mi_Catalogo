import React, { useEffect, useMemo, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import Navbar from './Navbar';
import SectionRow from './SectionRow';
import useActorMedias from '../hooks/useActorMedias';
import './ActorDetailPage.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'https://mi-catalogo-backend.onrender.com';

function getLangCode(lang) {
  switch (lang) {
    case 'es': return 'es-ES';
    case 'en': return 'en-US';
    case 'pt': return 'pt-PT';
    case 'fr': return 'fr-FR';
    case 'de': return 'de-DE';
    default: return 'en-US';
  }
}

export default function ActorDetailPage() {
  const { personId } = useParams();
  const { t, currentLanguage } = useLanguage();
  const [person, setPerson] = useState(null);
  const [credits, setCredits] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showFullBio, setShowFullBio] = useState(false);
  const lang = useMemo(() => getLangCode(currentLanguage), [currentLanguage]);
  const navigate = useNavigate();
  const { medias: userMedias, loading: loadingUserMedias, error: errorUserMedias } = useActorMedias(personId);

  // Minimal handlers for Navbar
  const handleNavigation = (section) => {
    switch (section) {
      case 'inicio': navigate('/'); break;
      case 'peliculas': navigate('/?tipo=pelicula'); break;
      case 'series': navigate('/?tipo=serie'); break;
      case 'resumen': navigate('/resumen'); break;
      case 'favoritos': navigate('/favoritos'); break;
      case 'pendientes': navigate('/pendientes'); break;
      case 'listas': navigate('/listas'); break;
      case 'add': navigate('/add'); break;
      default: navigate('/');
    }
  };
  const handleSearch = (searchTerm) => {
    if (searchTerm && searchTerm.trim()) {
      navigate(`/?q=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  useEffect(() => {
    if (!personId) return;
    let abort = false;
    async function fetchAll() {
      try {
        setLoading(true);
        setError('');
        const [personRes, creditsRes, externalRes] = await Promise.all([
          fetch(`${BACKEND_URL}/tmdb/person/${personId}?language=${lang}`),
          fetch(`${BACKEND_URL}/tmdb/person/${personId}/combined_credits?language=${lang}`),
          fetch(`${BACKEND_URL}/tmdb/person/${personId}/external_ids`)
        ]);
        const [personData, creditsData, externalIds] = await Promise.all([
          personRes.ok ? personRes.json() : Promise.reject(new Error('person')),
          creditsRes.ok ? creditsRes.json() : Promise.reject(new Error('credits')),
          externalRes.ok ? externalRes.json() : Promise.resolve(null)
        ]);
        if (!abort) {
          setPerson({ ...personData, external_ids: externalIds || {} });
          setCredits(creditsData);
        }
      } catch (e) {
        if (!abort) setError(t('errors.couldNotLoadPerson', 'No se pudo cargar la información del actor'));
      } finally {
        if (!abort) setLoading(false);
      }
    }
    fetchAll();
    return () => { abort = true; };
  }, [personId, lang, t]);

  const knownFor = useMemo(() => {
    if (!credits || !Array.isArray(credits.cast)) return [];
    return [...credits.cast]
      .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
      .slice(0, 12);
  }, [credits]);

  const filmography = useMemo(() => {
    if (!credits || !Array.isArray(credits.cast)) return [];
    return [...credits.cast]
      .map(c => ({
        id: c.id,
        year: (c.release_date || c.first_air_date || '').slice(0, 4),
        title: c.title || c.name,
        role: c.character,
        mediaType: c.media_type,
        poster: c.poster_path,
        tmdb_id: c.id
      }))
      .sort((a, b) => (b.year || '').localeCompare(a.year || ''));
  }, [credits]);

  const [showFilmography, setShowFilmography] = useState(false);

  if (loading) {
    return (
      <div className="actor-page">
        <Navbar onSection={handleNavigation} onSearch={handleSearch} searchValue="" />
        <div className="loading-actor">
          <div className="loading-spinner-small" />
          <span>{t('detailModal.loading')}</span>
        </div>
      </div>
    );
  }

  if (error || !person) {
    return (
      <div className="actor-page" style={{ padding: 20 }}>
        <Navbar onSection={handleNavigation} onSearch={handleSearch} searchValue="" />
        <div style={{ color: '#ff6b6b' }}>{error || t('errors.couldNotLoadPerson', 'No se pudo cargar la información del actor')}</div>
        <div style={{ marginTop: 12 }}>
          <Link to="/" style={{ color: '#00e2c7', textDecoration: 'none', fontWeight: 700 }}>
            ← {t('actions.goBack', 'Volver')}
          </Link>
        </div>
      </div>
    );
  }

  const photoUrl = person.profile_path
    ? `https://image.tmdb.org/t/p/w300${person.profile_path}`
    : null;

  const twitter = person.external_ids?.twitter_id ? `https://twitter.com/${person.external_ids.twitter_id}` : null;
  const instagram = person.external_ids?.instagram_id ? `https://instagram.com/${person.external_ids.instagram_id}` : null;
  const facebook = person.external_ids?.facebook_id ? `https://facebook.com/${person.external_ids.facebook_id}` : null;

  // Selección de biografía según idioma
  function getBiography(person, currentLanguage) {
    if (!person) return '';
    // Si la biografía es un objeto multilenguaje
    if (typeof person.biography === 'object' && person.biography !== null) {
      if (person.biography[currentLanguage]) return person.biography[currentLanguage];
      if (person.biography['en']) return person.biography['en'];
      // Devuelve la primera disponible
      const first = Object.values(person.biography).find(Boolean);
      if (first) return first;
      return '';
    }
    // Si es string, devuelve tal cual
    return person.biography || '';
  }

  const biographyText = getBiography(person, currentLanguage);
  const shortBio = biographyText && biographyText.length > 500
    ? biographyText.slice(0, 500) + '…'
    : biographyText;

  return (
    <div className="actor-page">
      <Navbar onSection={handleNavigation} onSearch={handleSearch} searchValue="" />
      {/* Banner eliminado por preferencia del usuario */}
      <div className="actor-hero">
        <div className="actor-photo">
          {photoUrl ? (
            <img src={photoUrl} alt={person.name} />
          ) : (
            <div className="placeholder">👤</div>
          )}
        </div>
        <div className="actor-header">
          <div className="actor-name">{person.name}</div>
          <div className="actor-meta">
            {person.known_for_department && <span className="badge">{person.known_for_department}</span>}
            {person.birthday && <span>{t('person.born', 'Nacido')}: {person.birthday}</span>}
            {person.place_of_birth && <span>· {person.place_of_birth}</span>}
          </div>
        </div>
      </div>

      {biographyText && (
        <div className="actor-biography">
          <div>{showFullBio ? biographyText : shortBio}</div>
          {biographyText.length > 500 && (
            <button className="bio-toggle" onClick={() => setShowFullBio(v => !v)}>
              {showFullBio ? t('actions.showLess', 'Mostrar menos') : t('actions.showMore', 'Mostrar más')}
            </button>
          )}
        </div>
      )}


      {(twitter || instagram || facebook) && (
        <div className="actor-social">
          {twitter && (
            <a href={twitter} target="_blank" rel="noreferrer">
              <span className="social-icon">
                {/* Twitter SVG */}
                <svg viewBox="0 0 24 24" fill="currentColor" width="1em" height="1em" style={{display:'block'}}><path d="M22.46 5.92c-.8.36-1.66.6-2.56.71a4.48 4.48 0 0 0 1.97-2.48 8.94 8.94 0 0 1-2.83 1.08 4.48 4.48 0 0 0-7.64 4.08A12.7 12.7 0 0 1 3.1 4.86a4.48 4.48 0 0 0 1.39 5.98c-.7-.02-1.36-.21-1.94-.53v.05a4.48 4.48 0 0 0 3.6 4.4c-.33.09-.68.14-1.04.14-.25 0-.5-.02-.74-.07a4.48 4.48 0 0 0 4.18 3.11A9 9 0 0 1 2 19.54a12.7 12.7 0 0 0 6.88 2.02c8.26 0 12.78-6.84 12.78-12.78 0-.2 0-.39-.01-.58a9.1 9.1 0 0 0 2.24-2.32z"/></svg>
              </span>
              Twitter
            </a>
          )}
          {instagram && (
            <a href={instagram} target="_blank" rel="noreferrer">
              <span className="social-icon">
                {/* Instagram SVG */}
                <svg viewBox="0 0 24 24" fill="currentColor" width="1em" height="1em" style={{display:'block'}}><path d="M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 2 16.25v-8.5A5.75 5.75 0 0 1 7.75 2zm0 1.5A4.25 4.25 0 0 0 3.5 7.75v8.5A4.25 4.25 0 0 0 7.75 20.5h8.5A4.25 4.25 0 0 0 20.5 16.25v-8.5A4.25 4.25 0 0 0 16.25 3.5h-8.5zm4.25 3.25a5.25 5.25 0 1 1 0 10.5 5.25 5.25 0 0 1 0-10.5zm0 1.5a3.75 3.75 0 1 0 0 7.5 3.75 3.75 0 0 0 0-7.5zm5.13.88a1.13 1.13 0 1 1-2.25 0 1.13 1.13 0 0 1 2.25 0z"/></svg>
              </span>
              Instagram
            </a>
          )}
          {facebook && (
            <a href={facebook} target="_blank" rel="noreferrer">
              <span className="social-icon">
                {/* Facebook SVG */}
                <svg viewBox="0 0 24 24" fill="currentColor" width="1em" height="1em" style={{display:'block'}}><path d="M22 12a10 10 0 1 0-11.5 9.95v-7.05h-2.1V12h2.1V9.8c0-2.07 1.23-3.2 3.12-3.2.9 0 1.84.16 1.84.16v2.02h-1.04c-1.03 0-1.35.64-1.35 1.3V12h2.3l-.37 2.9h-1.93v7.05A10 10 0 0 0 22 12z"/></svg>
              </span>
              Facebook
            </a>
          )}
        </div>
      )}

      {knownFor.length > 0 && (
        <>
          <div className="section-title">{t('person.knownFor', 'Conocido por')}</div>
          <div className="known-for-grid">
            {knownFor.map((item, idx) => (
              <div key={`${item.media_type}-${item.id}-${idx}`} className="known-card">
                <img
                  className="known-poster"
                  src={item.poster_path ? `https://image.tmdb.org/t/p/w300${item.poster_path}` : person.profile_path ? `https://image.tmdb.org/t/p/w300${person.profile_path}` : ''}
                  alt={item.title || item.name}
                  loading="lazy"
                />
                <div className="known-meta">
                  <div className="known-title">{item.title || item.name}</div>
                  {item.character && <div className="known-role">{item.character}</div>}
                </div>
              </div>
            ))}
          </div>
          {/* Títulos del actor que el usuario ha visto */}
          <div style={{ marginTop: 24 }}>
            <SectionRow
              title={t('person.yourWatchedTitles', 'Tus títulos vistos con este actor')}
              items={userMedias}
              onSelect={item => navigate(`/detail/${item.id}`)}
              carousel={true}
            />
            {loadingUserMedias && <div style={{ color: '#00e2c7', marginTop: 8 }}>{t('detailModal.loading')}</div>}
            {errorUserMedias && <div style={{ color: '#ff6b6b', marginTop: 8 }}>{errorUserMedias}</div>}
          </div>
        </>
      )}

      {filmography.length > 0 && (
        <div className="filmography filmography-collapsible">
          <button
            className="filmography-toggle"
            onClick={() => setShowFilmography(v => !v)}
            aria-expanded={showFilmography}
          >
            {showFilmography ? '▼' : '▶'} {t('person.full_filmography', 'Filmografía completa')} ({filmography.length})
          </button>
          {showFilmography && (
            <div className="filmography-list">
              {filmography.map((row, idx) => (
                <div
                  key={`${row.mediaType}-${row.id}-${row.role || ''}-${idx}`}
                  className="filmography-item redesigned"
                  onClick={() => navigate(`/detalle/${row.tmdb_id}`)}
                  title={row.title}
                >
                  <div className="filmography-poster">
                    {row.poster ? (
                      <img src={`https://image.tmdb.org/t/p/w92${row.poster}`} alt={row.title} loading="lazy" />
                    ) : (
                      <div className="filmography-poster-placeholder">🎬</div>
                    )}
                  </div>
                  <div className="filmography-info">
                    <div className="filmography-title">{row.title}</div>
                    <div className="filmography-meta">
                      <span className="filmography-year">{row.year || '—'}</span>
                      {row.role && <span className="filmography-role">{row.role}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
