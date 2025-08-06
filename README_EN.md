# 🎬 My Movie and Series Catalog

**Personal catalog** to register, organize, and manage all the movies and series you have watched, with advanced features for rating, annotations, and personal statistics.

**🔗 Live Frontend:** [https://mi-catalogo-oguv.vercel.app](https://mi-catalogo-oguv.vercel.app)  
**🔗 Live Backend API:** [https://mi-catalogo-backend.onrender.com](https://mi-catalogo-backend.onrender.com)

> You only need to access the frontend. API calls are already integrated into the web.

---

## 🚀 Technologies Used

- **Frontend:** React + Vite
- **Backend:** FastAPI + SQLite
- **Libraries:** React Router, Chart.js, React-Select, React-Markdown
- **Deployment:**
  - Frontend on [Vercel](https://vercel.com)
  - Backend on [Render](https://render.com)

---

## 📚 Features

### 🎬 **Interface and Navigation**
- **Gallery-style interface**: Attractive visual design with carousels to browse your collection
- **📱 Responsive**: Fully adaptive design for desktop and mobile
- **🌍 Multilingual**: Complete support for Spanish and English with navbar selector
- **🔄 Dynamic content**: Homepage with sections that automatically rotate daily

### 🔍 **Search and Filtering**
- **Advanced search**: By title, actor, director, or genre
- **🎯 Multiple filters**: 
  - By release year (range)
  - By genre (multiple selection)
  - By TMDb rating and personal rating
  - By type (movie/series)
  - By status (favorites/pending)
- **📊 Sorting**: By date, personal rating, TMDb rating

### 💖 **Personal Organization**
- **Favorites and Pending**: Mark titles as favorites or pending to watch
- **🏷️ Custom tags**: Fully editable labels for organization
- **📋 Custom lists**: Create and manage thematic collections of watched titles
- **📝 Annotations**: Personal notes with full Markdown support for each title
- **⭐ Personal rating**: Own scoring system independent of TMDb

### 📊 **Statistics and Analysis**
- **Visual summary**: Distribution charts by genres and years of your watched collection
- **Top rankings**: Best actors, directors, and genres according to your history
- **Global statistics**: Count of watched, favorite, and pending movies/series
- **Personal analysis**: Viewing trends and consumption patterns

### 🎭 **Advanced TMDb Integration**
- **Dynamic posters**: Images that adapt to selected language
- **Detailed information**: Synopsis, cast, director, seasons, official genres
- **Enriched data**: Official TMDb ratings complementing your personal ratings
- **Related content**: Suggestions for similar movies/series to discover

### ⚡ **Performance and UX**
- **Paginated loading**: Efficient navigation through your extensive collection
- **Smart caching**: API request optimization
- **Notifications**: Visual feedback for all management actions
- **Modern interface**: Intuitive dark design with smooth animations

---

## 📦 Project Structure

```
catalog/
├── src/
│   ├── components/          # React components
│   │   ├── Navbar.js       # Navigation bar with language selector
│   │   ├── SectionRow.js   # Content carousels
│   │   ├── DetailModal.js  # Movie/series detail modal
│   │   ├── Filters.js      # Advanced filtering system
│   │   ├── ListasView.js   # Custom lists management
│   │   ├── Resumen.js      # Statistics and charts
│   │   ├── HomeSections.js # Dynamic homepage sections
│   │   └── ...
│   ├── context/            # React contexts
│   │   ├── LanguageContext.js    # Multilingual management
│   │   └── NotificationContext.js # Notification system
│   ├── hooks/              # Custom hooks
│   │   ├── useTranslations.js    # Translation hook
│   │   ├── useDynamicPoster.js   # TMDb dynamic posters
│   │   └── useTranslatedContent.js # Translated content
│   ├── i18n/               # Internationalization system
│   │   ├── index.js        # i18n configuration
│   │   └── languages/      # Translation files
│   │       ├── es.js       # Spanish
│   │       └── en.js       # English
│   └── styles/             # CSS styles
└── backend/                # FastAPI API (separate folder)
```

---

## 💻 Local Development (optional)

### Frontend

1. Enter the `catalog` folder.
2. Install dependencies with `npm install`.
3. Configure environment variables (optional):
   ```bash
   # Create .env.local file
   REACT_APP_BACKEND_URL=http://localhost:8000
   ```
4. Start the server with `npm start`.
5. Access `http://localhost:3000` in the browser.

### Backend

1. Enter the `backend` folder.
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   # Windows:
   venv\Scripts\activate
   # Linux/Mac:
   source venv/bin/activate
   ```
3. Install dependencies with `pip install -r requirements.txt`.
4. Start the server with `uvicorn main:app --reload`.
5. The API will be available at `http://localhost:8000`.
6. Automatic documentation at `http://localhost:8000/docs`.

---

## 📌 Final Notes

- **Architecture**: Project divided into two independent but connected services
- **REST API**: Backend exposes complete endpoints for CRUD operations on movies, series, lists, and tags
- **Complete management**: Frontend allows viewing AND managing all content
- **Multilingual**: Interface fully translated to Spanish and English
- **Enriched data**: Automatic TMDb integration for posters and additional information
- **Personalization**: Complete personal organization system with favorites, tags, and lists

### 🎯 Main Features

- ✅ **Cataloging**: Register and organize all movies and series you have watched
- ✅ **Complete management**: Add, edit, delete, and organize your watched content
- ✅ **Advanced search**: Filter system to find titles in your collection
- ✅ **Personalization**: Favorites, pending, tags, and custom lists
- ✅ **Personal rating**: Rate each title with your own evaluation
- ✅ **Annotations**: Write reviews and personal notes about each title
- ✅ **Statistics**: Charts and analysis of your viewing habits
- ✅ **Multilingual**: Complete support for Spanish and English
- ✅ **Responsive**: Works perfectly on mobile and tablets

Keep a complete record of everything you've watched! 🍿

**NOTE: This web allows you to manage your personal catalog of watched movies and series, with personal ratings and annotations, enriched with detailed TMDb information. Does not include content playback.**
