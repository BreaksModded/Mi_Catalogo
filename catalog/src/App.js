import React, { useEffect, useState, useMemo } from 'react';
import Navbar from './components/Navbar';
import SectionRow from './components/SectionRow';
import Filters from './components/Filters';
import DetailModal from './components/DetailModal';
import AddMediaForm from './components/AddMediaForm';
import ListasView from './components/ListasView';
import './App.css';
import { useNotification, NotificationProvider } from './context/NotificationContext';

const API_URL = 'http://localhost:8000/medias';

function getAllGenres(medias) {
  const set = new Set();
  medias.forEach(m => m.genero && m.genero.split(',').forEach(g => set.add(g.trim())));
  return Array.from(set).filter(Boolean).sort();
}

function App() {
  
  const { showNotification } = useNotification();
  const [medias, setMedias] = useState([]); 
  const [filteredItems, setFilteredItems] = useState([]); 
  const [section, setSection] = useState("inicio");
  const [searchQuery, setSearchQuery] = useState("");
  const [selected, setSelected] = useState(null);
  const [favorites, setFavorites] = useState([]); 
  const [pendings, setPendings] = useState([]); 
  const [showFavs, setShowFavs] = useState(false);
  const [showPendings, setShowPendings] = useState(false);
  const [tipo, setTipo] = useState("");
  const [genero, setGenero] = useState("");
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
  const [recientes, setRecientes] = useState([]);
  const [orderBy, setOrderBy] = useState(''); // Por defecto vacío, el usuario elige


  useEffect(() => {
    
    const fetchAllData = async () => {
      try {
        const [mediasRes, favRes, pendRes, tagsRes] = await Promise.all([
          fetch(API_URL),
          fetch('http://localhost:8000/favoritos'),
          fetch('http://localhost:8000/pendientes'),
          fetch('http://localhost:8000/tags')
        ]);
        
        const [medias, favs, pends, tags] = await Promise.all([
          mediasRes.json(),
          favRes.json(),
          pendRes.json(),
          tagsRes.json()
        ]);
        
        setMedias(medias);
        setFavorites(favs.map(m => m.id));
        setPendings(pends.map(m => m.id));
        setTags(tags);
        
      } catch (error) {
        console.error('Error loading data:', error);
        showNotification('Error cargando datos', 'error');
      }
    };
    
    fetchAllData();
  }, []);

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
    if (section === 'favoritos') results = results.filter(m => favorites.includes(m.id));
    if (section === 'pendientes') results = results.filter(m => pendings.includes(m.id));
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
    if (genero) results = results.filter(m => m.genero?.split(',').map(g => g.trim()).includes(genero));
    if (minYear) results = results.filter(m => m.anio >= minYear);
    if (maxYear) results = results.filter(m => m.anio <= maxYear);
    if (minNota) results = results.filter(m => m.nota_imdb >= minNota);
    if (showFavs) results = results.filter(m => favorites.includes(m.id));
    if (showPendings) results = results.filter(m => pendings.includes(m.id));

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


    if (selectedTags.length > 0) {
      results = results.filter(m => 
        Array.isArray(m.tags) && 
        selectedTags.every(tid => 
          m.tags.some(tag => String(tag.id) === String(tid))
        )
      );
    }
    // Filtro por nota personal
    if (minNotaPersonal) {
      results = results.filter(m => m.nota_personal && Number(m.nota_personal) >= Number(minNotaPersonal));
    }
    setFilteredItems(results);
  }, [medias, section, searchQuery, genero, minYear, maxYear, minNota, minNotaPersonal, favorites, pendings, showFavs, showPendings, selectedTags, notaPersonal, orderBy]);

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
    setGenero('');
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
  const handleToggleFavorite = async (id) => {
    const mediaIndex = medias.findIndex(m => m.id === id);
    const currentMedia = mediaIndex !== -1 ? medias[mediaIndex] : null;
    if (!currentMedia) return;

    const nuevo = !currentMedia.favorito;
    try {
      const res = await fetch(`${API_URL}/${id}/favorito?favorito=${nuevo}`, { method: "PATCH" });
      if (!res.ok) throw new Error("Error al actualizar favorito");
      const updatedMedia = await res.json();

      // Actualizar estado `medias`
      setMedias(prevMedias => prevMedias.map(m => m.id === id ? updatedMedia : m));
      // Actualizar lista de IDs de favoritos
      setFavorites(favs => nuevo ? [...favs, id] : favs.filter(f => f !== id));
    } catch (err) {
      console.error("Error:", err);
      // Revertir visualmente si falla (opcional)
    }
  };

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
  const handleTagChange = (tagIds) => setSelectedTags(tagIds);

  const handleCreateTag = async (nombre) => {
    try {
      const res = await fetch("http://localhost:8000/tags", {
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
      const res = await fetch(`http://localhost:8000/tags/${tagId}`, { method: "DELETE" });
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
        const imdbResponse = await fetch(`http://localhost:8000/imdb_rating/${media.imdb_id}`);
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
      <Navbar onSection={setSection} onSearch={setSearchQuery} searchValue={searchQuery} />
      {section === "add" ? (
        <AddMediaForm onAdded={handleMediaAdded} />
      ) : section === "listas" ? (
        <ListasView />
      ) : (
        <>
          <Filters
            tipos={tipos}
            generos={getAllGenres(medias)}
            selectedTipo={tipo}
            selectedGenero={genero}
            onTipo={setTipo}
            onGenero={setGenero}
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
              onCreateTag={handleCreateTag}
              onUpdateNota={handleUpdateNota}
            />
          )}
          {section === "inicio" && (
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
          {section !== "inicio" && (
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
