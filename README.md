<<<<<<< HEAD
# Catálogo de Películas y Series

Esta es la web de visualización tipo Netflix para tu colección personal. Permite ver todas las películas y series añadidas desde la app de gestión, con portadas grandes y ficha detallada al hacer clic en cada una.

## ¿Cómo se usa?

1. Instala las dependencias:
   ```sh
   npm install
   ```
2. Arranca el servidor de desarrollo:
   ```sh
   npm start
   ```
3. Accede a [http://localhost:3000](http://localhost:3000) para ver tu catálogo en modo galería.

## Características
- Vista tipo cuadrícula estilo Netflix.
- Fichas detalladas con sinopsis, reparto, director, temporadas, etc.
- Solo visualización (no edición).
- Responsive para móvil y escritorio.

> Recuerda: la gestión y alta de películas/series se realiza desde la otra web (`frontend`).
=======
# Home Cinema

Proyecto web personal para gestionar tu colección de películas y series, similar a un "Netflix" privado.

## Estructura del proyecto

- `/backend`: API REST con FastAPI, base de datos SQLite.
- `/frontend`: Aplicación React (por crear).

## Cómo iniciar el backend

1. Ve a la carpeta `backend`:
   ```sh
   cd backend
   ```
2. Activa el entorno virtual (Windows):
   ```sh
   venv\Scripts\activate
   ```
3. Instala las dependencias (si no lo hiciste):
   ```sh
   pip install -r requirements.txt
   ```
4. Ejecuta el servidor:
   ```sh
   uvicorn main:app --reload
   ```

## Endpoints principales
- `/medias` (GET, POST): Listar y crear películas/series
- `/medias/{media_id}` (GET, DELETE): Obtener y borrar por ID

---

## Próximos pasos
- Crear el frontend con React
- Mejorar la documentación
- Añadir autenticación
- Desplegar en la nube
>>>>>>> 973881fdebd00ae36d9c48d4711bafbf0f7c6d90
