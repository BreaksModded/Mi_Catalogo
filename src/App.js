import React, { useEffect, useState, useMemo } from 'react';
import Navbar from './components/Navbar';
import SectionRow from './components/SectionRow';
import Resumen from './components/Resumen';
import Filters from './components/Filters';
import DetailModal from './components/DetailModal';
import AddMediaForm from './components/AddMediaForm';
import ListasView from './components/ListasView';
import DatabaseSleepNotice from './components/DatabaseSleepNotice';
import './App.css';
import './components/Resumen.css';
import { useNotification, NotificationProvider } from './context/NotificationContext';
import cacheFetch from './components/cacheFetch';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API_URL = BACKEND_URL + '/medias';

function getAllGenres(medias) {
  const set = new Set();
  medias.forEach(m => m.genero && m.genero.split(',').forEach(g => set.add(g.trim())));
  return Array.from(set).filter(Boolean).sort();
}

function App() {
  
  const { showNotification } = useNotification();

  const [medias, setMedias] = useState([]); 
  const [filteredItems, setFilteredItems] = useState([]); 
  const [section, setSection] = useState(() => {
    // Intenta leer la sección guardada en localStorage
    const saved = localStorage.getItem('catalogo_section');
    return saved || "inicio";
  });

  // Guardar la sección actual en localStorage cada vez que cambie
  React.useEffect(() => {
    localStorage.setItem('catalogo_section', section);
  }, [section]);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selected, setSelected] = useState(null);
  const [favorites, setFavorites] = useState([]); 
  const [pendings, setPendings] = useState([]); 
  const [showFavs, setShowFavs] = useState(false);
  const [showPendings, setShowPendings] = useState(false);
  const [tipo, setTipo] = useState("");
  const [selectedGeneros, setSelectedGeneros] = useState([]);
  const [minYear, setMinYear] = useState("");
  const [maxYear, setMaxYear] = useState("");
  const [minNota, setMinNota] = useState("");
  const [maxNota, setMaxNota] = useState("");
  const [minNotaPersonal, setMinNotaPersonal] = useState("");
  const [notaPersonal, setNotaPersonal] = useState(null); // Nuevo estado para nota personal
  const [tags, setTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [tendencias, setTendencias] = useState([]); 
  const [favoritasInicio, setFavoritasInicio] = useState([]); 
  const [porGeneroInicio, setPorGeneroInicio] = useState([]); 
  const [peliculas, setPeliculas] = useState([]); 
  const [series, setSeries] = useState([]); 
  const [favoritos, setFavoritos] = useState([]); 
  const [pendientes, setPendientes] = useState([]); 
  const [loading, setLoading] = useState(false);
  const [isFiltering, setIsFiltering] = useState(false);
  const [noResultsMessage, setNoResultsMessage] = useState('');
  const [showNoResults, setShowNoResults] = useState(false);
  const [recientes, setRecientes] = useState([]);
  const [orderBy, setOrderBy] = useState(''); // Por defecto vacío, el usuario elige
  const [showDbSleep, setShowDbSleep] = useState(false);


  // Paginación para la sección principal
  const PAGE_SIZE = 36;
  // Principal
  const [mainOffset, setMainOffset] = useState(0);
  const [mainHasMore, setMainHasMore] = useState(true);
  const [mainLoadingMore, setMainLoadingMore] = useState(false);
  // Películas
  const [pelisOffset, setPelisOffset] = useState(0);
  const [pelisHasMore, setPelisHasMore] = useState(true);
  const [pelisLoadingMore, setPelisLoadingMore] = useState(false);
  const [pelis, setPelis] = useState([]);
  // Series
  const [seriesOffset, setSeriesOffset] = useState(0);
  const [seriesHasMore, setSeriesHasMore] = useState(true);
  const [seriesLoadingMore, setSeriesLoadingMore] = useState(false);
  const [seriesList, setSeriesList] = useState([]);

  // Actualizar paginación cuando cambian los filtros y la sección
  useEffect(() => {
    // Solo mostrar el indicador de filtrado si hay filtros activos
    const hayFiltrosActivos = 
      (selectedGeneros && selectedGeneros.length > 0) || 
      minYear || 
      maxYear || 
      minNota || 
      minNotaPersonal || 
      orderBy;
    
    // Establecer el estado de filtrado basado en si hay filtros activos
    setIsFiltering(hayFiltrosActivos);

    // Ocultar el mensaje de no resultados cuando se cambian los filtros
    setShowNoResults(false);
    
    // Solo mostrar el mensaje de "Aplicando filtros..." si hay filtros activos
    // y no cuando solo cambia la sección
    if (hayFiltrosActivos) {
      // Mostrar mensaje de 'Aplicando filtros...' mientras se carga
      setNoResultsMessage('Aplicando filtros...');
      setShowNoResults(true);
      setIsSearching(true); // Indicar que se está realizando una búsqueda
    }
    
    if (section === 'peliculas') {
      setPelis([]);
      setPelisOffset(0);
      setPelisHasMore(true);
      setPelisLoadingMore(false);
      fetchPelis(0, true).finally(() => {
        setIsFiltering(false);
        // Solo ocultar el mensaje si no hay filtros activos o si la búsqueda ha terminado
        if (!hayFiltrosActivos) {
          setShowNoResults(false);
          setIsSearching(false);
        }
      });
    }
    else if (section === 'series') {
      setSeriesList([]);
      setSeriesOffset(0);
      setSeriesHasMore(true);
      setSeriesLoadingMore(false);
      fetchSeries(0, true).finally(() => {
        setIsFiltering(false);
        // Solo ocultar el mensaje si no hay filtros activos o si la búsqueda ha terminado
        if (!hayFiltrosActivos) {
          setShowNoResults(false);
          setIsSearching(false);
        }
      });
    }
    else {
      setIsFiltering(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [section, selectedGeneros, minYear, maxYear, minNota, minNotaPersonal, orderBy]);

  // Nuevo efecto para filtrar favoritos/pendientes/tags usando el backend
  useEffect(() => {
    // Si hay filtros activos, nunca mostrar el aviso de base de datos dormida
    if (showFavs || showPendings || selectedTags.length > 0) {
      setShowDbSleep(false);
      let controller = new AbortController();
      const fetchFiltered = async () => {
        setLoading(true);
        try {
          const params = new URLSearchParams();
          params.append('skip', 0);
          params.append('limit', PAGE_SIZE);
          if (showFavs) params.append('favorito', 'true');
          if (showPendings) params.append('pendiente', 'true');
          if (selectedTags.length === 1) params.append('tag_id', selectedTags[0]);
          // Si estamos en sección películas o series y hay filtro activo, forzar tipo
          if ((showFavs || showPendings || selectedTags.length > 0) && (section === 'peliculas' || section === 'series')) {
            params.append('tipo', section === 'peliculas' ? 'película' : 'serie');
          } else if (tipo) {
            params.append('tipo', tipo);
          }
          if (selectedGeneros && selectedGeneros.length > 0) params.append('genero', selectedGeneros.join(','));
          if (minYear) params.append('min_year', minYear);
          if (maxYear) params.append('max_year', maxYear);
          if (minNota) params.append('min_nota', minNota);
          if (minNotaPersonal) params.append('min_nota_personal', minNotaPersonal);
          if (orderBy) params.append('order_by', orderBy);
          const res = await fetch(`${BACKEND_URL}/medias?${params.toString()}`, { signal: controller.signal });
          const data = await res.json();
          setMedias(data);
        } catch (err) {
          if (err.name !== 'AbortError') {
            showNotification('Error filtrando datos', 'error');
          }
        } finally {
          setLoading(false);
        }
      };
      fetchFiltered();
      return () => controller.abort();
    }
    // Si no hay filtros, mostrar el aviso solo si la carga tarda más de 5 segundos
    setShowDbSleep(false); // Oculta el aviso antes de cargar
    let timer = setTimeout(() => setShowDbSleep(true), 5000); // 5 segundos
    const fetchAllData = async () => {
      try {
        // Carga inicial limitada
        const [medias, favs, pends, tags] = await Promise.all([
          cacheFetch(`${BACKEND_URL}/medias?skip=0&limit=${PAGE_SIZE}`),
          cacheFetch(`${BACKEND_URL}/medias?favorito=true`),
          cacheFetch(`${BACKEND_URL}/medias?pendiente=true`),
          cacheFetch(BACKEND_URL + '/tags')
        ]);
        setMedias(medias);
        setFavorites(favs.map(m => m.id));
        setPendings(pends.map(m => m.id));
        setTags(tags);
        setShowDbSleep(false); // Oculta el mensaje cuando termina de cargar
        clearTimeout(timer); // Cancela el timeout si la carga termina antes
      } catch (error) {
        console.error('Error loading data:', error);
        showNotification('Error cargando datos', 'error');
        clearTimeout(timer); // Cancela el timeout también si hay error
      }
    };
    fetchAllData();
    return () => clearTimeout(timer);
  }, [showFavs, showPendings, selectedTags, tipo, selectedGeneros, minYear, maxYear, minNota, minNotaPersonal, orderBy]);

  // Sincronizar showFavs y showPendings con section
  useEffect(() => {
    if (section === 'favoritos') {
      setShowFavs(true);
      setShowPendings(false);
    } else if (section === 'pendientes') {
      setShowFavs(false);
      setShowPendings(true);
    } else {
      setShowFavs(false);
      setShowPendings(false);
    }
  }, [section]);

  // Función para cargar más en la página principal
  const handleLoadMoreMain = async () => {
    setMainLoadingMore(true);
    const res = await fetch(`${BACKEND_URL}/medias?skip=${mainOffset + PAGE_SIZE}&limit=${PAGE_SIZE}`);
    const data = await res.json();
    
    // Filtrar duplicados antes de concatenar
    setMedias(prev => {
      // Obtener los IDs de los elementos actuales
      const existingIds = new Set(prev.map(item => item.id));
      // Filtrar los nuevos elementos para eliminar duplicados
      const uniqueNewItems = data.filter(item => !existingIds.has(item.id));
      
      // Mostrar notificación si no hay más resultados nuevos
      if (uniqueNewItems.length === 0) {
        showNotification('No hay más contenido para cargar', 'info');
      }
      
      // Concatenar sin duplicados
      return [...prev, ...uniqueNewItems];
    });
    
    setMainOffset(prev => prev + PAGE_SIZE);
    setMainHasMore(data.length === PAGE_SIZE);
    setMainLoadingMore(false);
  };

  // Paginación para películas con filtros
  // ESTE BLOQUE useEffect SE ELIMINA (originalmente alrededor de la línea 211)
  // useEffect(() => {
  //   if (section === 'peliculas') {
  //     setPelis([]);
  //     setPelisOffset(0);
  //     setPelisHasMore(true);
  //     setPelisLoadingMore(false);
  //     fetchPelis(0, true);
  //   }
  //   // eslint-disable-next-line
  // }, [section, selectedGeneros, minYear, maxYear, minNota, minNotaPersonal, orderBy]);

  const fetchPelis = async (offset, reset = false) => {
    if (pelisLoadingMore && !reset) return;
    
    setPelisLoadingMore(true);
    // Indicar que estamos buscando
    setIsSearching(true);
    // Mostrar mensaje de 'Aplicando filtros...' mientras se procesa
    if (offset === 0) {
      setNoResultsMessage('Aplicando filtros...');
      setShowNoResults(true);
    }
    
    try {
      // Construir query string con filtros
      const params = new URLSearchParams();
      params.append('skip', offset);
      params.append('limit', PAGE_SIZE);
      params.append('tipo', 'película');
      
      // Mejora en el manejo de géneros seleccionados
      if (selectedGeneros && selectedGeneros.length > 0) {
        // Enviamos los géneros como un parámetro separado por comas
        params.append('genero', selectedGeneros.join(','));
      }
      
      if (minYear) params.append('min_year', minYear);
      if (maxYear) params.append('max_year', maxYear);
      if (minNota) params.append('min_nota', minNota);
      if (minNotaPersonal) params.append('min_nota_personal', minNotaPersonal);
      if (orderBy) params.append('order_by', orderBy);
      
      console.log('Fetching películas con parámetros:', params.toString());
      
      const res = await fetch(`${BACKEND_URL}/medias?${params.toString()}`);
      let data = await res.json();
      console.log(`Recibidas ${data.length} películas del backend`);
      
      // Solo aplicamos filtrado adicional en el cliente si hay múltiples géneros seleccionados
      // y queremos que coincidan TODOS los géneros (comportamiento AND en lugar de OR)
      if (selectedGeneros && selectedGeneros.length > 1) {
        // Mantener el mensaje de "Aplicando filtros..." mientras se realiza el filtrado en el cliente
        setNoResultsMessage('Aplicando filtros...');
        setShowNoResults(true);
        
        console.log('Aplicando filtrado adicional para múltiples géneros');
        const dataFiltrada = data.filter(pelicula => {
          if (!pelicula.genero) return false;
          
          // Normalizar los géneros de la película (eliminar espacios, convertir a minúsculas)
          const generosArray = pelicula.genero.split(',').map(g => g.trim().toLowerCase());
          
          // Normalizar los géneros seleccionados
          const generosSeleccionados = selectedGeneros.map(g => g.trim().toLowerCase());
          
          // Verificar si todos los géneros seleccionados están presentes
          const coinciden = generosSeleccionados.every(genero => 
            generosArray.some(g => g === genero || g.includes(genero) || genero.includes(g))
          );
          
          // Mostrar solo las películas que coinciden con todos los géneros
          if (coinciden) {
            console.log('COINCIDE - Película:', pelicula.titulo, 'Géneros:', generosArray);
          }
          
          return coinciden;
        });
        
        console.log('Películas filtradas:', dataFiltrada.length);
        data = dataFiltrada; // Asignar los resultados filtrados a data
      }
      
      // Verificar si hay resultados DESPUÉS de todo el procesamiento
      console.log('Verificando resultados finales, cantidad:', data.length, 'offset:', offset);
      
      // Pequeña pausa para asegurar que la UI se actualice correctamente
      await new Promise(resolve => setTimeout(resolve, 300));
      
      if (data.length === 0 && offset === 0) {
        // Solo establecer las películas y el estado de 'has more'
        setPelis([]);
        setPelisHasMore(false);
        setNoResultsMessage('No se encontraron películas con los filtros seleccionados');
        setShowNoResults(true);
      } else {
        // Si hay resultados, establecer el estado de filtrado
        setIsFiltering(false);
        setShowNoResults(false);
        
        setPelis(prev => {
          if (reset || offset === 0) {
            return data;
          } else {
            // Obtener los IDs de los elementos actuales
            const existingIds = new Set(prev.map(item => item.id));
            // Filtrar los nuevos elementos para eliminar duplicados
            const uniqueNewItems = data.filter(item => !existingIds.has(item.id));
            
            // Mostrar notificación si no hay más resultados nuevos
            if (uniqueNewItems.length === 0) {
              showNotification('No hay más películas para cargar', 'info');
            }
            
            // Concatenar sin duplicados
            return [...prev, ...uniqueNewItems];
          }
        });
      }
      
      setPelisOffset(offset + data.length);
      setPelisHasMore(data.length === PAGE_SIZE);
    } catch (error) {
      console.error('Error al cargar películas:', error);
      setNoResultsMessage('Error al cargar películas');
      setShowNoResults(true);
    } finally {
      setPelisLoadingMore(false);
      setIsSearching(false);
    }
  };

  const handleLoadMorePelis = () => {
    fetchPelis(pelisOffset);
  };

  // Paginación para series con filtros
  // ESTE BLOQUE useEffect SE ELIMINA (originalmente alrededor de la línea 308)
  // useEffect(() => {
  //   if (section === 'series') {
  //     setSeriesList([]);
  //     setSeriesOffset(0);
  //     setSeriesHasMore(true);
  //     setSeriesLoadingMore(false);
  //     fetchSeries(0, true);
  //   }
  //   // eslint-disable-next-line
  // }, [section, selectedGeneros, minYear, maxYear, minNota, minNotaPersonal, orderBy]);

  const fetchSeries = async (offset, reset = false) => {
    if (seriesLoadingMore && !reset) return;
    
    setSeriesLoadingMore(true);
    setIsSearching(true);
    if (offset === 0) {
      setNoResultsMessage('Aplicando filtros...');
      setShowNoResults(true);
    }
    
    try {
      const params = new URLSearchParams();
      params.append('skip', offset);
      params.append('limit', PAGE_SIZE);
      params.append('tipo', 'serie');
      
      // Enviamos los géneros al backend, pero solo pedimos que coincida con AL MENOS UNO
      if (selectedGeneros && selectedGeneros.length > 0) {
        params.append('genero', selectedGeneros.join(','));
      }
      
      if (minYear) params.append('min_year', minYear);
      if (maxYear) params.append('max_year', maxYear);
      if (minNota) params.append('min_nota', minNota);
      if (minNotaPersonal) params.append('min_nota_personal', minNotaPersonal);
      if (orderBy) params.append('order_by', orderBy);
      
      console.log('Fetching series con parámetros:', params.toString());
      
      const res = await fetch(`${BACKEND_URL}/medias?${params.toString()}`);
      let data = await res.json();
      console.log(`Recibidas ${data.length} series del backend`);
      
      // Filtrado adicional para múltiples géneros (comportamiento AND)
      if (selectedGeneros && selectedGeneros.length > 1) {
        // Mantener el mensaje de "Aplicando filtros..." mientras se realiza el filtrado en el cliente
        setNoResultsMessage('Aplicando filtros...');
        setShowNoResults(true);
        
        console.log('Aplicando filtrado adicional para múltiples géneros (modo AND)');
        const dataFiltrada = data.filter(serie => {
          if (!serie.genero) return false;
          
          const generosArray = serie.genero.split(',').map(g => g.trim().toLowerCase());
          
          return selectedGeneros.every(genero => {
            const generoLower = genero.toLowerCase();
            return generosArray.some(g => g === generoLower);
          });
        });
        
        console.log(`Filtrado AND: De ${data.length} series, quedan ${dataFiltrada.length}`);
        data = dataFiltrada;
      }
      
      // Pequeña pausa para asegurar que la UI se actualice correctamente
      await new Promise(resolve => setTimeout(resolve, 300));
      
      if (data.length === 0 && offset === 0) {
        setSeriesList([]);
        setSeriesHasMore(false);
        setNoResultsMessage('No se encontraron series con todos los géneros seleccionados');
        setShowNoResults(true);
      } else {
        if (reset || offset === 0) {
          setSeriesList(data);
        } else {
          setSeriesList(prev => [...prev, ...data]);
        }
        setSeriesHasMore(data.length === PAGE_SIZE);
        setSeriesOffset(offset + data.length);
        setShowNoResults(false);
      }
    } catch (error) {
      console.error('Error al cargar series:', error);
      setNoResultsMessage('Error al cargar series');
      setShowNoResults(true);
    } finally {
      setSeriesLoadingMore(false);
      setIsSearching(false);
    }
  };

  const handleLoadMoreSeries = () => {
    fetchSeries(seriesOffset);
  };

  // Búsqueda directa a la base de datos
  useEffect(() => {
    let abort = false;
    const fetchSearch = async () => {
      if (searchQuery.length > 0) {
        setIsSearching(true);
        try {
          const res = await fetch(`${BACKEND_URL}/search?q=${encodeURIComponent(searchQuery)}`);
          const data = await res.json();
          if (!abort) setSearchResults(data);
        } catch (e) {
          if (!abort) setSearchResults([]);
        }
        // Ocultar el mensaje de búsqueda después de un breve retraso
        setTimeout(() => {
          if (!abort) setIsSearching(false);
        }, 800); // Retraso para asegurar visibilidad del mensaje
      } else {
        setSearchResults([]);
        setIsSearching(false);
      }
    };
    fetchSearch();
    return () => { abort = true; };
  }, [searchQuery, BACKEND_URL]);

  useEffect(() => {
    let results = [...medias];
    
    // Filtro por nota personal (nuevo)
    if (notaPersonal !== null && notaPersonal !== undefined) {
      results = results.filter(media => {
        return media.nota_personal !== null && 
               media.nota_personal !== undefined && 
               media.nota_personal >= notaPersonal;
      });
    }
    
    // Filtrado por sección
    if (section === 'peliculas') results = results.filter(m => m.tipo === 'película');
    if (section === 'series') results = results.filter(m => m.tipo === 'serie');
    // El filtrado por favoritos, pendientes y tags ahora se hace en el backend
    // if (section === 'favoritos') results = results.filter(m => favorites.includes(m.id));
    // if (section === 'pendientes') results = results.filter(m => pendings.includes(m.id));
    // ¡Sin límite! Se muestran todas las películas y series en sus respectivas secciones.
    
    // Normalización para búsqueda
    function normalize(str) {
      return (str || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    }
    
    // Filtrado por búsqueda
    if (searchQuery) {
      const searchNorm = normalize(searchQuery);
      results = results.filter(m => {
        const tituloNorm = m.titulo ? normalize(m.titulo) : "";
        const tituloInglesNorm = m.titulo_ingles ? normalize(m.titulo_ingles) : "";
        const elencoNorm = m.elenco ? normalize(m.elenco) : "";
        const directorNorm = m.director ? normalize(m.director) : "";
        const generoNorm = m.genero ? normalize(m.genero) : "";
        return (
          tituloNorm.includes(searchNorm) ||
          tituloInglesNorm.includes(searchNorm) ||
          elencoNorm.includes(searchNorm) ||
          directorNorm.includes(searchNorm) ||
          generoNorm.includes(searchNorm)
        );
      });
    }
    
    // Filtros adicionales
    if (selectedGeneros && selectedGeneros.length > 0) {
  results = results.filter(m => {
    const mediaGeneros = m.genero?.split(',').map(g => g.trim()) || [];
    return selectedGeneros.every(g => mediaGeneros.includes(g));
  });
}
    if (minYear) results = results.filter(m => m.anio >= minYear);
    if (maxYear) results = results.filter(m => m.anio <= maxYear);
    if (minNota) results = results.filter(m => m.nota_imdb >= minNota);
    // El filtrado por favoritos y pendientes ahora se hace en el backend
    // if (showFavs) results = results.filter(m => favorites.includes(m.id));
    // if (showPendings) results = results.filter(m => pendings.includes(m.id));

    // Ordenar según orderBy
    if (orderBy === 'nota_personal') {
      results.sort((a, b) => (b.nota_personal || 0) - (a.nota_personal || 0));
    } else if (orderBy === 'nota_tmdb') {
      results.sort((a, b) => (b.nota_imdb || 0) - (a.nota_imdb || 0));
    } else if (orderBy === 'fecha') {
      results.sort((a, b) => {
        // Usa el año de salida (anio) para ordenar
        if (a.anio && b.anio) return Number(a.anio) - Number(b.anio);
        if (a.anio) return -1;
        if (b.anio) return 1;
        return 0;
      });
    }


    // El filtrado por tags ahora se hace en el backend (solo 1 tag soportada por ahora)
    // if (selectedTags.length > 0) {
    //   results = results.filter(m => 
    //     Array.isArray(m.tags) && 
    //     selectedTags.every(tid => 
    //       m.tags.some(tag => String(tag.id) === String(tid))
    //     )
    //   );
    // }
    // Filtro por nota personal
    if (minNotaPersonal) {
      results = results.filter(m => m.nota_personal && Number(m.nota_personal) >= Number(minNotaPersonal));
    }
    setFilteredItems(results);
  }, [medias, section, selectedGeneros, minYear, maxYear, minNota, minNotaPersonal, favorites, pendings, showFavs, showPendings, selectedTags, notaPersonal, orderBy]);

  useEffect(() => {
    const tendencias = [...filteredItems].sort((a, b) => b.nota_imdb - a.nota_imdb);
    const favoritas = filteredItems.filter(m => m.favorito);
    const generos = getAllGenres(medias);
    const porGenero = generos.map(g => ({
      genero: g,
      items: filteredItems.filter(m => m.genero?.includes(g))
    }));
    
    setTendencias(tendencias);
    setFavoritasInicio(favoritas);
    setPorGeneroInicio(porGenero.filter(g => g.items.length > 0));
  }, [filteredItems, medias]);

  useEffect(() => {
    if (section === "inicio" && medias.length > 0) {
      // 1. Recientes (últimos 10 añadidos)
      const recientes = [...medias]
        .sort((a, b) => new Date(b.fecha_creacion) - new Date(a.fecha_creacion))
        .slice(0, 10);
      
      // 2. Tendencias (mejor valoradas)
      const tendencias = [...medias].sort((a, b) => b.nota_imdb - a.nota_imdb);
      
      // 3. Favoritas
      const favoritas = medias.filter(m => m.favorito);
      
      // 4. Por género
      const generosDisponibles = getAllGenres(medias);
      const porGenero = generosDisponibles.map(g => ({
        genero: g,
        items: medias.filter(m => m.genero?.includes(g))
      }));
      
      // Actualizar estados
      setRecientes(recientes);
      setTendencias(tendencias);
      setFavoritasInicio(favoritas);
      setPorGeneroInicio(porGenero.filter(g => g.items.length > 0));
    }
  }, [medias, section]);

  // Efecto para resetear filtros al cambiar de sección
  useEffect(() => {
    // Resetear filtros al cambiar de sección
    setSearchQuery('');
    setSelectedGeneros([]);
    setMinYear('');
    setMaxYear('');
    setMinNota('');
    setMaxNota('');
    setNotaPersonal(null); // Resetear nota personal
    setMinNotaPersonal('');
    setOrderBy(''); // Resetear orden
  }, [section]);

  // Función para cargar más elementos en secciones paginadas
  const handleLoadMore = () => {
    // Implementar carga de más elementos
  };

  // Resto del código (tipos, generos, tendencias, favoritas, porGenero, handlers...) sin cambios significativos por ahora
  // ... (Código existente para tipos, generos, tendencias, etc.) ...

  const tipos = Array.from(new Set(medias.map(m => m.tipo))).filter(Boolean);

  // Handlers (handleToggleFavorite, handleTogglePending, handleDeleteMedia, etc.)
  // Necesitan actualizar `medias` Y `sectionItems` si el elemento modificado está en la sección paginada actual
  // Handler para favoritos: tras actualizar, recarga la lista de favoritos y refresca si es necesario

  const handleTogglePending = async (id) => {
    const mediaIndex = medias.findIndex(m => m.id === id);
    const currentMedia = mediaIndex !== -1 ? medias[mediaIndex] : null;
    if (!currentMedia) return;

    const nuevo = !currentMedia.pendiente;
    try {
      const res = await fetch(`${API_URL}/${id}/pendiente?pendiente=${nuevo}`, { method: "PATCH" });
      if (!res.ok) throw new Error("Error al actualizar pendiente");
      const updatedMedia = await res.json();

      setMedias(prevMedias => prevMedias.map(m => m.id === id ? updatedMedia : m));
      setPendings(pends => nuevo ? [...pends, id] : pends.filter(p => p !== id));
    } catch (err) {
      console.error("Error:", err);
    }
  };

  const handleDeleteMedia = async (mediaToDelete) => {
    if (!mediaToDelete || !mediaToDelete.id) return;
    const id = mediaToDelete.id;
    try {
      const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("No se pudo eliminar");
      setMedias(prevMedias => prevMedias.filter(m => m.id !== id));
      setSelected(null);
      showNotification("Medio eliminado correctamente", "success");
    } catch (err) {
      showNotification("Error eliminando la película o serie", "error");
    }
  };

  // ... (Resto de handlers: handleTagChange, handleCreateTag, handleDeleteTag, handleAddTag, handleRemoveTag, handleUpdateNota)
  // Estos también podrían necesitar actualizar sectionItems si modifican un item visible en la sección paginada
  // Por simplicidad, por ahora solo actualizan `medias` y `tags`. Se puede refinar si es necesario.

  // Handler para favoritos: tras actualizar, recarga la lista de favoritos y refresca si es necesario
  // Handler para favoritos: tras actualizar, recarga la lista de favoritos y refresca si es necesario
const handleToggleFavorite = async (id) => {
    const mediaIndex = medias.findIndex(m => m.id === id);
    const currentMedia = mediaIndex !== -1 ? medias[mediaIndex] : null;
    if (!currentMedia) return;
    const nuevo = !currentMedia.favorito;
    try {
      const res = await fetch(`${API_URL}/${id}/favorito?favorito=${nuevo}`, { method: "PATCH" });
      if (!res.ok) throw new Error("Error al actualizar favorito");
      const updatedMedia = await res.json();
      setMedias(prevMedias => prevMedias.map(m => m.id === id ? updatedMedia : m));
      // Recargar lista de favoritos
      const favs = await cacheFetch(BACKEND_URL + '/favoritos');
      setFavorites(favs.map(m => m.id));
      // Si hay filtro de favoritos activo, recargar lista filtrada
      if (showFavs) {
        // Forzar recarga de filtro
        setShowFavs(false);
        setTimeout(() => setShowFavs(true), 0);
      }
    } catch (err) {
      console.error("Error:", err);
    }
  };
// --- Eliminar cualquier declaración previa/duplicada de handleToggleFavorite ---


  const handleTagChange = (tagIds) => setSelectedTags(tagIds);

  const handleCreateTag = async (nombre) => {
    try {
      const res = await fetch(BACKEND_URL + '/tags', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre })
      });
      if (res.ok) {
        const newTag = await res.json();
        setTags(tags => [...tags, newTag]);
      }
    } catch (err) {
      alert("Error creando tag");
    }
  };

  const handleDeleteTag = async (tagId) => {
    try {
      const res = await fetch(`${BACKEND_URL}/tags/${tagId}`, { method: "DELETE" });
      if (res.ok) {
        setTags(tags => tags.filter(t => t.id !== tagId));
        setSelectedTags(selected => selected.filter(id => id !== String(tagId)));
        // Actualizar medias para quitar la tag eliminada
        const updateMediaTags = (mediaList) => mediaList.map(m => ({
          ...m,
          tags: Array.isArray(m.tags) ? m.tags.filter(t => t.id !== tagId) : m.tags
        }));
        setMedias(updateMediaTags);
      }
    } catch (err) {
      alert("Error eliminando tag");
    }
  };

  const handleAddTag = async (mediaId, tagId) => {
    try {
      const res = await fetch(`${API_URL}/${mediaId}/tags/${tagId}`, { method: "POST" });
      if (res.ok) {
        const updated = await res.json();
        setMedias(medias => medias.map(m => m.id === updated.id ? updated : m));
      }
    } catch (err) {
      alert("Error añadiendo tag");
    }
  };

  const handleRemoveTag = async (mediaId, tagId) => {
    try {
      const res = await fetch(`${API_URL}/${mediaId}/tags/${tagId}`, { method: "DELETE" });
      if (res.ok) {
        const updated = await res.json();
        setMedias(medias => medias.map(m => m.id === updated.id ? updated : m));
      }
    } catch (err) {
      alert("Error quitando tag");
    }
  };

  const handleUpdateNota = async (mediaId, nota) => {
    try {
      const res = await fetch(`${API_URL}/${mediaId}/nota`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nota })
      });
      if (res.ok) {
        const updated = await res.json();
        setMedias(medias => medias.map(m => m.id === updated.id ? updated : m));
      }
    } catch (err) {
      alert("Error actualizando nota");
    }
  };

  // Modificación de onAdded para actualizar también sectionItems si aplica
  const handleMediaAdded = (nuevoMedia) => {
    if (nuevoMedia) {
      // Actualizar lista general añadiendo el nuevo al principio
      setMedias(prevMedias => [nuevoMedia, ...prevMedias]);
      const tipoTexto = (nuevoMedia.tipo && nuevoMedia.tipo.toLowerCase().includes('serie')) ? 'Serie' : (nuevoMedia.tipo && nuevoMedia.tipo.toLowerCase().includes('película')) ? 'Película' : 'Medio';
showNotification(tipoTexto + ' añadida con éxito', "success");
    } else {
      console.error("Error: No se recibió el nuevo medio en onAdded para actualizar el estado.");
      showNotification("Error al actualizar la interfaz tras añadir", "error");
    }
  };

  const fetchMediaDetails = async (id) => {
    try {
      const response = await fetch(`${API_URL}/${id}`);
      const media = await response.json();
      
      // Obtener puntuación IMDB si existe ID
      if (media.imdb_id) {
        const imdbResponse = await fetch(`${BACKEND_URL}/imdb_rating/${media.imdb_id}`);
        const {imdb_rating} = await imdbResponse.json();
        return {...media, imdb_rating};
      }
      return media;
    } catch (error) {
      console.error('Error:', error);
      return null;
    }
  };

  return (
    <>
      <Navbar 
        onSection={(section) => { setSection(section); setSearchQuery(''); }} 
        onSearch={setSearchQuery} 
        searchValue={searchQuery} 
      />
      {section === 'add' ? (
        <AddMediaForm onAdded={handleMediaAdded} />
      ) : section === 'resumen' ? (
        <Resumen medias={medias} pendientes={pendientes} />
      ) : section === 'listas' ? (
        <ListasView />
      ) : (
        <>
          <Filters
            tipos={tipos}
            generos={getAllGenres(medias)}
            selectedTipo={tipo}
            selectedGeneros={selectedGeneros}
            onTipo={setTipo}
            onGeneros={setSelectedGeneros}
            minYear={minYear}
            maxYear={maxYear}
            onYear={(min, max) => { setMinYear(min); setMaxYear(max); }}
            minNota={minNota}
            onNota={min => setMinNota(min)}
            minNotaPersonal={minNotaPersonal}
            onNotaPersonal={setMinNotaPersonal}
            showFavs={showFavs}
            showPendings={showPendings}
            onShowFavs={() => setShowFavs(f => !f)}
            onShowPendings={() => setShowPendings(p => !p)}
            tags={tags}
            selectedTags={selectedTags}
            onTagChange={handleTagChange}
            onCreateTag={handleCreateTag}
            onDeleteTag={handleDeleteTag}
            orderBy={orderBy}
            onOrder={setOrderBy}
          />
          <DatabaseSleepNotice visible={showDbSleep} />
          {/* Mensaje permanente de no resultados o carga */}
          {showNoResults && (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                margin: '3rem 0',
                fontSize: '1.25rem',
                background: 'rgba(0,0,0,0.40)',
                borderRadius: '18px',
                padding: '2.5rem 1.5rem',
                boxShadow: '0 2px 18px 0 #0004',
                maxWidth: 420,
                marginLeft: 'auto',
                marginRight: 'auto',
                border: '2px solid #00e2c7'
              }}
            >
              {noResultsMessage === 'Aplicando filtros...' ? (
                <>
                  <div className="loader" style={{ marginBottom: '1rem', width: '40px', height: '40px' }}></div>
                  <div>
                    <b>{noResultsMessage}</b>
                  </div>
                  <div style={{ marginTop: 8, opacity: 0.85, textAlign: 'center' }}>
                    Buscando contenido que coincida con tus filtros...
                  </div>
                </>
              ) : (
                <>
                  <span style={{ fontSize: '3rem', marginBottom: '0.6rem' }}>🔍</span>
                  <div>
                    <b>{noResultsMessage}</b>
                  </div>
                  <div style={{ marginTop: 8, opacity: 0.85, textAlign: 'center' }}>
                    Prueba a cambiar o eliminar algunos filtros para ver más resultados.
                  </div>
                </>
              )}
            </div>
          )}
          {selected && (
            <div className="modal">
              <div className="modal-content">
                {/* ... otros detalles ... */}
                <div className="rating-container">
                  <div>
                    <span className="rating-label">Tu nota:</span>
                    <span className="rating-value">{selected.nota_usuario || '-'}</span>
                  </div>
                  <div>
                    <span className="rating-label">IMDb:</span>
                    <span className="rating-value">
                      {selected.imdb_rating ?? 'No disponible'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
          {selected && (
  <DetailModal
    media={selected}
    onClose={() => setSelected(null)}
    onDelete={handleDeleteMedia}
    onToggleFavorite={handleToggleFavorite}
    onTogglePending={handleTogglePending}
    tags={tags}
    onAddTag={handleAddTag}
    onRemoveTag={handleRemoveTag}
    onUpdate={setSelected} // Pass setSelected as onUpdate
  />
)}
          {/* Los mensajes de filtrado y búsqueda ahora se muestran con el spinner */}
           {/* Mensaje de búsqueda */}
           {searchQuery && isSearching && (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                margin: '3rem 0',
                fontSize: '1.25rem',
                background: 'rgba(0,0,0,0.40)',
                padding: '2rem',
                borderRadius: '12px',
                width: '90%',
                maxWidth: '500px',
                marginLeft: 'auto',
                marginRight: 'auto',
                border: '2px solid #00e2c7'
              }}
            >
              <div className="loader" style={{ marginBottom: '1rem', width: '40px', height: '40px' }}></div>
              <div>
                <b>Realizando búsqueda...</b>
              </div>
              <div style={{ marginTop: 8, opacity: 0.85, textAlign: 'center' }}>
                Buscando contenido que coincida con "{searchQuery}"...
              </div>
            </div>
           )}
           {searchQuery && !isSearching && (
              searchResults.length > 0 ? (
                <SectionRow 
                  title={`Resultados de "${searchQuery}"`}
                  items={searchResults}
                  onSelect={setSelected}
                />
              ) : (
                <div
  style={{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    margin: '3rem 0',
    fontSize: '1.25rem',
    background: 'rgba(0,0,0,0.40)',
    borderRadius: '18px',
    padding: '2.5rem 1.5rem',
    boxShadow: '0 2px 18px 0 #0004',
    maxWidth: 420,
    marginLeft: 'auto',
    marginRight: 'auto',
    border: '2px solid #00e2c7'
  }}
>
  <span style={{ fontSize: '3rem', marginBottom: '0.6rem' }}>🔍</span>
  <div>
    <b>No se han encontrado resultados</b>
  </div>
  <div style={{ marginTop: 8, opacity: 0.85, textAlign: 'center' }}>
    No hay películas ni series que coincidan con <span style={{ color: '#00e2c7', fontWeight: 700 }}>&quot;{searchQuery}&quot;</span>.
  </div>
</div>
              )
            )}
           {!searchQuery && section === "inicio" && (
            <>
              {filteredItems.length > 0 && (
                <SectionRow 
                  title="Añadidas recientemente"
                  items={[...filteredItems]
                    .sort((a, b) => new Date(b.fecha_creacion) - new Date(a.fecha_creacion))
                    .slice(0, 20)}
                  carousel={true}
                  onSelect={setSelected}
                />
              )}
              {tendencias.length > 0 && <SectionRow title="Tendencias" items={tendencias.slice(0, 30)} carousel={true} onSelect={setSelected} />}
              {favoritasInicio.length > 0 && <SectionRow title="Tus favoritas" items={favoritasInicio.slice(0, 30)} carousel={true} onSelect={setSelected} />}
              {porGeneroInicio.map((grupo, i) => 
                grupo.items.length > 0 && <SectionRow key={i} title={grupo.genero} items={grupo.items.slice(0, 30)} carousel={true} onSelect={setSelected} />
              )}
            </>
          )}
           {!searchQuery && section === "peliculas" && (
  <>
    <SectionRow 
      title="Películas"
      items={(showFavs || showPendings || selectedTags.length > 0) ? medias : pelis}
      onSelect={setSelected}
    />
    {!(showFavs || showPendings || selectedTags.length > 0) && pelis.length > 0 && pelisHasMore && (
      <div style={{ display: 'flex', justifyContent: 'center', margin: '2rem 0' }}>
        <button
          className="btn-cargar-mas"
          onClick={handleLoadMorePelis}
          disabled={pelisLoadingMore}
          style={{
            background: '#00e2c7',
            color: '#181818',
            fontWeight: 'bold',
            border: 'none',
            borderRadius: '8px',
            padding: '12px 32px',
            fontSize: '1.1rem',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
          }}
        >
          {pelisLoadingMore ? 'Cargando...' : 'Cargar más'}
        </button>
      </div>
    )}
  </>
)}
           {!searchQuery && section === "series" && (
  <>
    <SectionRow 
      title="Series"
      items={(showFavs || showPendings || selectedTags.length > 0) ? medias : seriesList}
      onSelect={setSelected}
    />
    {!(showFavs || showPendings || selectedTags.length > 0) && seriesList.length > 0 && seriesHasMore && (
      <div style={{ display: 'flex', justifyContent: 'center', margin: '2rem 0' }}>
        <button
          className="btn-cargar-mas"
          onClick={handleLoadMoreSeries}
          disabled={seriesLoadingMore}
          style={{
            background: '#00e2c7',
            color: '#181818',
            fontWeight: 'bold',
            border: 'none',
            borderRadius: '8px',
            padding: '12px 32px',
            fontSize: '1.1rem',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
          }}
        >
          {seriesLoadingMore ? 'Cargando...' : 'Cargar más'}
        </button>
      </div>
    )}
  </>
)}
           {!searchQuery && section !== "inicio" && section !== "peliculas" && section !== "series" && (
             <SectionRow 
               title={section === 'favoritos' ? 'Favoritos' : 
                      section === 'pendientes' ? 'Pendientes' : 
                      section.charAt(0).toUpperCase() + section.slice(1)}
               items={filteredItems}
               onSelect={setSelected}
             />
           )}
           {/* Renderizado anterior para secciones no paginadas (si fuera necesario, pero ahora todas las principales son paginadas o inicio) */}
           {/* {section !== "inicio" && !isPaginatedSection && ( ... )} */}
           {/* Botón Cargar más para la página principal */}
           {!searchQuery && section === "inicio" && mainHasMore && filteredItems.length > 0 && (
             <div style={{ display: 'flex', justifyContent: 'center', margin: '2rem 0' }}>
               <button
                 className="btn-cargar-mas"
                 onClick={handleLoadMoreMain}
                 disabled={mainLoadingMore}
                 style={{
                   background: '#00e2c7',
                   color: '#181818',
                   fontWeight: 'bold',
                   border: 'none',
                   borderRadius: '8px',
                   padding: '12px 32px',
                   fontSize: '1.1rem',
                   cursor: 'pointer',
                   boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                 }}
               >
                 {mainLoadingMore ? 'Cargando...' : 'Cargar más'}
               </button>
             </div>
           )}
         </>
       )}
     </>
   );
 }

function AppWrapper() {
  return (
    <NotificationProvider>
      <App />
    </NotificationProvider>
  );
}

export default AppWrapper;
