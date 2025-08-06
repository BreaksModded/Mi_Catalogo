# 🎬 Mi Catálogo de Películas y Series

**Catálogo personal** para registrar, organizar y gestionar todas las películas y series que has visto, con funcionalidades avanzadas de puntuación, anotaciones y estadísticas personales.

**🔗 Frontend en vivo:** [https://mi-catalogo-oguv.vercel.app](https://mi-catalogo-oguv.vercel.app)  
**🔗 API Backend en vivo:** [https://mi-catalogo-backend.onrender.com](https://mi-catalogo-backend.onrender.com)

> Solo necesitas acceder al frontend. Las llamadas a la API ya están integradas en la web.

---

## 🚀 Tecnologías utilizadas

- **Frontend:** React + Vite
- **Backend:** FastAPI + SQLite
- **Librerías:** React Router, Chart.js, React-Select, React-Markdown
- **Despliegue:**
  - Frontend en [Vercel](https://vercel.com)
  - Backend en [Render](https://render.com)

---

## 📚 Características

### 🎬 **Interfaz y Navegación**
- **Interfaz tipo galería**: Diseño visual atractivo con carruseles para navegar tu colección
- **📱 Responsive**: Diseño completamente adaptativo para escritorio y móvil
- **🌍 Multiidioma**: Soporte completo para castellano e inglés con selector en navbar
- **🔄 Contenido dinámico**: Homepage con secciones que rotan automáticamente cada día

### 🔍 **Búsqueda y Filtrado**
- **Búsqueda avanzada**: Por título, actor, director o género
- **🎯 Filtros múltiples**: 
  - Por año de lanzamiento (rango)
  - Por género (selección múltiple)
  - Por nota TMDb y nota personal
  - Por tipo (película/serie)
  - Por estado (favoritos/pendientes)
- **📊 Ordenación**: Por fecha, nota personal, nota TMDb

### 💖 **Organización Personal**
- **Favoritos y Pendientes**: Marca títulos como favoritos o pendientes de ver
- **🏷️ Tags personalizadas**: Etiquetas completamente editables para organización
- **📋 Listas personalizadas**: Crear y gestionar colecciones temáticas de títulos vistos
- **📝 Anotaciones**: Notas personales con soporte completo para Markdown en cada título
- **⭐ Puntuación personal**: Sistema de calificación propio independiente de TMDb

### 📊 **Estadísticas y Análisis**
- **Resumen visual**: Gráficos de distribución por géneros y años de tu colección vista
- **Top rankings**: Mejores actores, directores y géneros según tu historial
- **Estadísticas globales**: Recuento de películas/series vistas, favoritas y pendientes
- **Análisis personal**: Tendencias de visualización y patrones de consumo

### 🎭 **Integración TMDb Avanzada**
- **Portadas dinámicas**: Imágenes que se adaptan al idioma seleccionado
- **Información detallada**: Sinopsis, reparto, director, temporadas, géneros oficiales
- **Datos enriquecidos**: Puntuaciones oficiales de TMDb complementando tus valoraciones
- **Contenido relacionado**: Sugerencias de películas/series similares para descubrir

### ⚡ **Rendimiento y UX**
- **Carga paginada**: Navegación eficiente por tu extensa colección
- **Cacheo inteligente**: Optimización de peticiones a APIs
- **Notificaciones**: Feedback visual para todas las acciones de gestión
- **Interfaz moderna**: Diseño oscuro intuitivo con animaciones suaves

---

## 📦 Estructura del proyecto

```
catalog/
├── src/
│   ├── components/          # Componentes React
│   │   ├── Navbar.js       # Barra de navegación con selector de idioma
│   │   ├── SectionRow.js   # Carruseles de contenido
│   │   ├── DetailModal.js  # Modal de detalles de película/serie
│   │   ├── Filters.js      # Sistema de filtros avanzados
│   │   ├── ListasView.js   # Gestión de listas personalizadas
│   │   ├── Resumen.js      # Estadísticas y gráficos
│   │   ├── HomeSections.js # Secciones dinámicas del inicio
│   │   └── ...
│   ├── context/            # Contextos React
│   │   ├── LanguageContext.js    # Gestión multiidioma
│   │   └── NotificationContext.js # Sistema de notificaciones
│   ├── hooks/              # Hooks personalizados
│   │   ├── useTranslations.js    # Hook para traducciones
│   │   ├── useDynamicPoster.js   # Portadas dinámicas TMDb
│   │   └── useTranslatedContent.js # Contenido traducido
│   ├── i18n/               # Sistema de internacionalización
│   │   ├── index.js        # Configuración i18n
│   │   └── languages/      # Archivos de traducción
│   │       ├── es.js       # Español
│   │       └── en.js       # Inglés
│   └── styles/             # Estilos CSS
└── backend/                # API FastAPI (carpeta separada)
```

---

## 💻 Desarrollo local (opcional)

### Frontend

1. Entra en la carpeta `catalog`.
2. Instala las dependencias con `npm install`.
3. Configura las variables de entorno (opcional):
   ```bash
   # Crear archivo .env.local
   REACT_APP_BACKEND_URL=http://localhost:8000
   ```
4. Lanza el servidor con `npm start`.
5. Accede a `http://localhost:3000` en el navegador.

### Backend

1. Entra en la carpeta `backend`.
2. Crea y activa un entorno virtual:
   ```bash
   python -m venv venv
   # Windows:
   venv\Scripts\activate
   # Linux/Mac:
   source venv/bin/activate
   ```
3. Instala las dependencias con `pip install -r requirements.txt`.
4. Lanza el servidor con `uvicorn main:app --reload`.
5. La API estará disponible en `http://localhost:8000`.
6. Documentación automática en `http://localhost:8000/docs`.

---

## 📌 Notas finales

- **Arquitectura**: Proyecto dividido en dos servicios independientes pero conectados
- **API REST**: El backend expone endpoints completos para CRUD de películas, series, listas y tags
- **Gestión completa**: El frontend permite visualizar Y gestionar todo el contenido
- **Multiidioma**: Interfaz completamente traducida a castellano e inglés
- **Datos enriquecidos**: Integración automática con TMDb para portadas e información adicional
- **Personalización**: Sistema completo de organización personal con favoritos, tags y listas

### 🎯 Características principales

- ✅ **Catalogación**: Registra y organiza todas las películas y series que has visto
- ✅ **Gestión completa**: Añadir, editar, eliminar y organizar tu contenido visto
- ✅ **Búsqueda avanzada**: Sistema de filtros para encontrar títulos en tu colección
- ✅ **Personalización**: Favoritos, pendientes, tags y listas personalizadas
- ✅ **Puntuación personal**: Califica cada título con tu propia valoración
- ✅ **Anotaciones**: Escribe reseñas y notas personales sobre cada título
- ✅ **Estadísticas**: Gráficos y análisis de tus hábitos de visualización
- ✅ **Multiidioma**: Soporte completo para castellano e inglés
- ✅ **Responsive**: Funciona perfectamente en móviles y tablets

¡Lleva un registro completo de todo lo que has visto! 🍿

**NOTA: Esta web te permite gestionar tu catálogo personal de películas y series vistas, con puntuaciones y anotaciones personales, enriquecido con información detallada de TMDb. No incluye reproducción de contenido.** 