# Sistema de Internacionalización (i18n)

Este proyecto incluye un sistema completo de internacionalización que permite cambiar entre castellano e inglés, con la capacidad de añadir fácilmente más idiomas en el futuro.

## Características

- ✅ Soporte para castellano (es) e inglés (en)
- ✅ Selector de idioma en la barra de navegación
- ✅ Persistencia del idioma seleccionado en localStorage
- ✅ Detección automática del idioma del navegador
- ✅ Sistema extensible para añadir más idiomas
- ✅ Hook personalizado para usar traducciones
- ✅ Contexto React para gestión global del estado

## Estructura del sistema

```
src/
├── i18n/
│   ├── index.js              # Configuración principal
│   └── languages/
│       ├── es.js             # Traducciones en castellano
│       └── en.js             # Traducciones en inglés
├── context/
│   └── LanguageContext.js    # Contexto React para idioma
├── components/
│   └── LanguageSelector.js   # Componente selector de idioma
└── hooks/
    └── useTranslations.js    # Hooks personalizados
```

## Uso básico

### 1. Usar traducciones en un componente

```javascript
import { useLanguage } from '../context/LanguageContext';

function MiComponente() {
  const { t } = useLanguage();
  
  return (
    <div>
      <h1>{t('navbar.title')}</h1>
      <button>{t('actions.save')}</button>
    </div>
  );
}
```

### 2. Usar hooks personalizados

```javascript
import { useFormTranslations } from '../hooks/useTranslations';

function MiFormulario() {
  const { save, cancel, loading } = useFormTranslations();
  
  return (
    <form>
      <button type="submit">{save}</button>
      <button type="button">{cancel}</button>
    </form>
  );
}
```

### 3. Cambiar idioma programáticamente

```javascript
import { useLanguage } from '../context/LanguageContext';

function MiComponente() {
  const { changeLanguage, currentLanguage } = useLanguage();
  
  const handleLanguageChange = () => {
    changeLanguage(currentLanguage === 'es' ? 'en' : 'es');
  };
  
  return (
    <button onClick={handleLanguageChange}>
      Cambiar idioma
    </button>
  );
}
```

## Añadir un nuevo idioma

### 1. Crear archivo de traducciones

Crear `src/i18n/languages/fr.js` para francés:

```javascript
export const fr = {
  navbar: {
    title: 'Mon Catalogue',
    movies: 'Films',
    series: 'Séries',
    // ... más traducciones
  },
  // ... resto de secciones
};
```

### 2. Registrar el idioma

En `src/i18n/index.js`:

```javascript
import { fr } from './languages/fr';

export const languages = {
  es,
  en,
  fr  // Añadir aquí
};

export const getLanguageList = () => [
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' }  // Añadir aquí
];
```

### 3. Listo

El nuevo idioma aparecerá automáticamente en el selector y estará disponible para usar.

## Estructura de las traducciones

Las traducciones están organizadas en secciones lógicas:

- `navbar`: Elementos de la barra de navegación
- `filters`: Filtros y búsqueda
- `sections`: Nombres de secciones
- `homeSections`: Secciones de la página de inicio
- `detailModal`: Modal de detalles de media
- `actions`: Botones y acciones comunes
- `messages`: Mensajes del sistema
- `summary`: Página de resumen
- `lists`: Gestión de listas
- `tags`: Sistema de etiquetas
- `addMedia`: Formulario de añadir media
- `form`: Campos de formulario comunes
- `general`: Términos generales

## Funciones del contexto

### `useLanguage()`

Devuelve un objeto con:

- `currentLanguage`: Idioma actual (ej: 'es', 'en')
- `changeLanguage(code)`: Función para cambiar idioma
- `t(key, fallback)`: Función para traducir una clave
- `availableLanguages`: Array con códigos de idiomas disponibles

### Función `t()`

```javascript
// Uso básico
t('navbar.title')  // -> 'Mi Catálogo' o 'My Catalog'

// Con fallback
t('clave.inexistente', 'Texto por defecto')

// Claves anidadas
t('detailModal.addToFavorites')
```

## Componentes incluidos

### `LanguageSelector`

Selector desplegable que se muestra en la barra de navegación:

- Muestra bandera y código del idioma actual
- Lista desplegable con todos los idiomas disponibles
- Se cierra automáticamente al hacer clic fuera
- Responsive y accesible

## Persistencia

- El idioma seleccionado se guarda en `localStorage` como `catalog_language`
- Se detecta automáticamente el idioma del navegador al primer uso
- Fallback al castellano si no se puede detectar el idioma

## Consideraciones técnicas

- Todas las traducciones se cargan al inicio (no lazy loading)
- El contexto se actualiza automáticamente cuando cambia el idioma
- Los componentes se re-renderizan automáticamente con las nuevas traducciones
- Sistema optimizado para rendimiento con React.memo donde sea necesario

## Ejemplo completo

```javascript
import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useFormTranslations } from '../hooks/useTranslations';

function EjemploCompleto() {
  const { t, currentLanguage, changeLanguage } = useLanguage();
  const { save, cancel } = useFormTranslations();
  
  return (
    <div>
      <h1>{t('navbar.title')}</h1>
      <p>Idioma actual: {currentLanguage}</p>
      
      <button onClick={() => changeLanguage('es')}>
        Español
      </button>
      <button onClick={() => changeLanguage('en')}>
        English
      </button>
      
      <form>
        <input placeholder={t('navbar.search')} />
        <button type="submit">{save}</button>
        <button type="button">{cancel}</button>
      </form>
    </div>
  );
}
```
