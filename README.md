# 🎬 Mi Catálogo de Películas y Series

Proyecto web tipo **Netflix personal** para visualizar y gestionar tu colección de películas y series.

**🔗 Frontend en vivo:** [https://mi-catalogo-oguv.vercel.app](https://mi-catalogo-oguv.vercel.app)  
**🔗 API Backend en vivo:** [https://mi-catalogo-backend.onrender.com](https://mi-catalogo-backend.onrender.com)

> Solo necesitas acceder al frontend. Las llamadas a la API ya están integradas en la web.

---

## 🚀 Tecnologías utilizadas

- **Frontend:** React + Vite
- **Backend:** FastAPI + SQLite
- **Despliegue:**
  - Frontend en [Vercel](https://vercel.com)
  - Backend en [Render](https://render.com)

---

## 📚 Características

- Interfaz tipo galería estilo Netflix.
- Fichas detalladas con sinopsis, reparto, director, temporadas, etc.
- Responsive para escritorio y móvil.
- Visualización de contenido (no edición desde la web pública).
- Backend con API REST para gestionar los datos.

---

## 📦 Estructura del proyecto

- `/frontend`: Aplicación React (visualización)
- `/backend`: API REST con FastAPI (gestión)

---

## 💻 Desarrollo local (opcional)

### Frontend

1. Entra en la carpeta `frontend`.
2. Instala las dependencias con `npm install`.
3. Lanza el servidor con `npm run dev`.
4. Accede a `http://localhost:3000` en el navegador.

### Backend

1. Entra en la carpeta `backend`.
2. Crea y activa un entorno virtual.
3. Instala las dependencias con `pip install -r requirements.txt`.
4. Lanza el servidor con `uvicorn main:app --reload`.
5. La API estará disponible en `http://localhost:8000`.

---

## 📌 Notas finales

- Este proyecto está dividido en dos servicios independientes pero conectados.
- El backend expone endpoints para consultar, agregar y eliminar películas/series.
- El frontend consume automáticamente estos endpoints.

¡Disfruta de tu propio Netflix casero! 🍿
