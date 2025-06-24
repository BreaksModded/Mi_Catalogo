import React, { useEffect, useState, useMemo, useRef } from 'react';
import SectionRow from './SectionRow';
import DetailModal from './DetailModal';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const SECTIONS = [
  { title: 'Tendencias', especial: 'tendencias' },
  { title: 'Añadidas recientemente', especial: 'recientes' },
  { title: 'Acción', genero: 'Acción' },
  { title: 'Crimen', genero: 'Crimen' },
  { title: 'Comedia', genero: 'Comedia' },
  { title: 'Aventura', genero: 'Aventura' },
  { title: 'Animación', genero: 'Animación' },
  { title: 'Terror', genero: 'Terror' },
  { title: 'Ciencia ficción', genero: 'Ciencia ficción' },
  { title: 'Drama', genero: 'Drama' },
  { title: 'Documental', genero: 'Documental' },
  { title: 'Romance', genero: 'Romance' },
  { title: 'Fantasía', genero: 'Fantasía' },
  { title: 'Misterio', genero: 'Misterio' },
  { title: 'Suspense', genero: 'Suspense' },
  { title: 'Bélico', genero: 'Bélico' },
  { title: 'Historia', genero: 'Historia' },
  { title: 'Familia', genero: 'Familia' },
  { title: 'Música', genero: 'Música' },
  { title: 'Western', genero: 'Western' },
  { title: 'Deporte', genero: 'Deporte' },
  { title: 'Biografía', genero: 'Biografía' },
  { title: 'Aventura espacial', genero: 'Aventura espacial' },
  { title: 'Superhéroes', genero: 'Superhéroes' },
  { title: 'Policíaco', genero: 'Policíaco' },
  { title: 'Cine negro', genero: 'Cine negro' },
  { title: 'Corto', genero: 'Corto' },
  { title: 'Reality', genero: 'Reality' }
];

function rotateArray(arr, shift) {
  const n = arr.length;
  const s = shift % n;
  return arr.slice(s).concat(arr.slice(0, s));
}

// HomeSections ahora recibe 'medias' como prop
export default function HomeSections({ medias }) {
  // Estado para medias extra por género
  const [extraMediasPorGenero, setExtraMediasPorGenero] = useState({});
  // Agrupación de medias por género individual
  const mediasPorGenero = useMemo(() => {
    const agrupado = {};
    if (!medias || !medias.length) return agrupado;
    medias.forEach(media => {
      if (!media.genero) return;
      // Divide por coma y quita espacios
      media.genero.split(',').map(g => g.trim()).forEach(genero => {
        if (!agrupado[genero]) agrupado[genero] = [];
        agrupado[genero].push(media);
      });
    });
    return agrupado;
  }, [medias]);

  // Efecto para cargar más títulos si faltan en cada género
  useEffect(() => {
    SECTIONS.forEach(section => {
      if (!section.genero) return;
      const base = mediasPorGenero[section.genero] || [];
      const extra = extraMediasPorGenero[section.genero]?.items || [];
      const total = base.length + extra.length;
      if (
        base.length > 0 &&
        total < ITEMS_PER_ROW &&
        !(extraMediasPorGenero[section.genero]?.loading) &&
        !(extraMediasPorGenero[section.genero]?.allLoaded)
      ) {
        setExtraMediasPorGenero(prev => ({
          ...prev,
          [section.genero]: { loading: true, items: extra, allLoaded: false }
        }));
        fetch(`${BACKEND_URL}/medias?genero=${encodeURIComponent(section.genero)}&skip=${total}&limit=${ITEMS_PER_ROW - total}`)
          .then(res => res.json())
          .then(nuevos => setExtraMediasPorGenero(prev => ({
            ...prev,
            [section.genero]: {
              loading: false,
              items: [...extra, ...nuevos],
              allLoaded: nuevos.length === 0
            }
          })))
          .catch(() => setExtraMediasPorGenero(prev => ({
            ...prev,
            [section.genero]: { loading: false, items: extra, allLoaded: true }
          })));
      }
    });
    // eslint-disable-next-line
  }, [mediasPorGenero, BACKEND_URL]);

  // Combina medias locales y extra para cada sección
  function getItemsForSection(genero) {
    const base = mediasPorGenero[genero] || [];
    const extra = extraMediasPorGenero[genero]?.items || [];
    return [...base, ...extra].slice(0, ITEMS_PER_ROW);
  }

  // Rotar SECTIONS según el día del año
  const today = new Date();
  const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
  const rotatedSections = useMemo(() => rotateArray(SECTIONS, dayOfYear), [dayOfYear]);
  const INITIAL_SECTIONS = 6;
  const ITEMS_PER_ROW = 20;
  const [visibleCount, setVisibleCount] = useState(INITIAL_SECTIONS);

  const [selectedMedia, setSelectedMedia] = useState(null);

  function handleSelect(item) {
    setSelectedMedia(item);
  }

  function handleCloseModal() {
    setSelectedMedia(null);
  }

  return (
    <>
      {rotatedSections.map(section => {
        // Secciones especiales: tendencias y recientes
        if (section.especial === 'tendencias') {
          // Tendencias: combinación de favorita, nota y reciente
          const ahora = new Date();
          const haceUnMes = new Date();
          haceUnMes.setDate(ahora.getDate() - 30);
          const items = (medias || [])
            .slice()
            .map(m => ({
              ...m,
              tendenciaScore:
                (m.favorito ? 15 : 0) +
                (m.nota_personal ? m.nota_personal * 2 : 0) +
                (m.nota_imdb ? m.nota_imdb : 0) +
                (m.fecha_creacion && new Date(m.fecha_creacion) > haceUnMes ? 5 : 0)
            }))
            .sort((a, b) => b.tendenciaScore - a.tendenciaScore)
            .slice(0, ITEMS_PER_ROW);
          if (!items.length) return null;
          return (
            <SectionRow
              key={section.title}
              title={section.title}
              items={items}
              carousel={true}
              onSelect={handleSelect}
            />
          );
        }
        if (section.especial === 'recientes') {
          // Ordena por fecha_creacion descendente, mismo límite
          const items = (medias || [])
            .slice()
            .sort((a, b) => new Date(b.fecha_creacion) - new Date(a.fecha_creacion))
            .slice(0, ITEMS_PER_ROW);
          if (!items.length) return null;
          return (
            <SectionRow
              key={section.title}
              title={section.title}
              items={items}
              carousel={true}
              onSelect={handleSelect}
            />
          );
        }
        // Secciones normales por género
        if (section.genero) {
          return (
            <SectionRow
              key={section.genero}
              title={section.title}
              items={getItemsForSection(section.genero)}
              carousel={true}
              loading={false}
              error={false}
              onSelect={handleSelect}
            />
          );
        }
      })}
      {selectedMedia && (
        <DetailModal
          media={selectedMedia}
          onClose={handleCloseModal}
          onUpdate={setSelectedMedia}
        />
      )}
    </>
  );
}
