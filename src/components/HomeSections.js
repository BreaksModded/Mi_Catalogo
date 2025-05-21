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
  const [sectionData, setSectionData] = useState({});
  const [loading, setLoading] = useState({});
  const [errores, setErrores] = useState({});

  // Rotar SECTIONS según el día del año
  const today = new Date();
  const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
  const rotatedSections = useMemo(() => rotateArray(SECTIONS, dayOfYear), [dayOfYear]);
  const INITIAL_SECTIONS = 6;
  const ITEMS_PER_ROW = 20;
  const [visibleCount, setVisibleCount] = useState(INITIAL_SECTIONS);

  // Evita múltiples fetch simultáneos de la misma sección
  const fetchingRef = useRef({});

  useEffect(() => {
    const toLoad = rotatedSections.slice(0, visibleCount).find(section =>
      !sectionData[section.genero] && !errores[section.genero] && !fetchingRef.current[section.genero]
    );
    if (!toLoad) return;
    fetchingRef.current[toLoad.genero] = true;
    setLoading(prev => ({ ...prev, [toLoad.genero]: true }));
    fetch(`${BACKEND_URL}/medias?genero=${encodeURIComponent(toLoad.genero)}&limit=${ITEMS_PER_ROW}&order_by=random`)
      .then(res => {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.json();
      })
      .then(data => {
        setSectionData(prev => ({ ...prev, [toLoad.genero]: data }));
      })
      .catch(error => {
        console.error("Error fetching data:", error);
        setErrores(prev => ({ ...prev, [toLoad.genero]: true }));
        setLoading(prev => ({ ...prev, [toLoad.genero]: false }));
      })
      .finally(() => {
        setLoading(prev => ({ ...prev, [toLoad.genero]: false }));
        fetchingRef.current[toLoad.genero] = false;
      });
  }, [visibleCount, rotatedSections, sectionData, errores]);

  const [selectedMedia, setSelectedMedia] = useState(null);

  function handleSelect(item) {
    setSelectedMedia(item);
  }

  function handleCloseModal() {
    setSelectedMedia(null);
  }

  return (
    <>
      {rotatedSections.slice(0, visibleCount).map(section => {
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
        return (
          <SectionRow
            key={section.genero}
            title={section.title}
            items={sectionData[section.genero] || []}
            carousel={true}
            loading={loading[section.genero]}
            error={errores[section.genero]}
            onSelect={handleSelect}
          />
        );
      })}
      {selectedMedia && (
        <DetailModal
          media={selectedMedia}
          onClose={handleCloseModal}
        />
      )}
    </>
  );
}
