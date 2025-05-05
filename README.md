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
