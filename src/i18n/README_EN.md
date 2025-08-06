# Internationalization System (i18n)

This project includes a complete internationalization system that allows switching between Spanish and English, with the ability to easily add more languages in the future.

## Features

- ✅ Support for Spanish (es) and English (en)
- ✅ Language selector in the navigation bar
- ✅ Persistence of selected language in localStorage
- ✅ Automatic browser language detection
- ✅ Extensible system to add more languages
- ✅ Custom hook to use translations
- ✅ React context for global state management

## System Structure

```
src/
├── i18n/
│   ├── index.js              # Main configuration
│   └── languages/
│       ├── es.js             # Spanish translations
│       └── en.js             # English translations
├── context/
│   └── LanguageContext.js    # React context for language
├── components/
│   └── LanguageSelector.js   # Language selector component
└── hooks/
    └── useTranslations.js    # Custom hooks
```

## Basic Usage

### 1. Use translations in a component

```javascript
import { useLanguage } from '../context/LanguageContext';

function MyComponent() {
  const { t } = useLanguage();
  
  return (
    <div>
      <h1>{t('navbar.title')}</h1>
      <button>{t('actions.save')}</button>
    </div>
  );
}
```

### 2. Use custom hooks

```javascript
import { useFormTranslations } from '../hooks/useTranslations';

function MyForm() {
  const { save, cancel, loading } = useFormTranslations();
  
  return (
    <form>
      <button type="submit">{save}</button>
      <button type="button">{cancel}</button>
    </form>
  );
}
```

### 3. Change language programmatically

```javascript
import { useLanguage } from '../context/LanguageContext';

function MyComponent() {
  const { changeLanguage, currentLanguage } = useLanguage();
  
  const handleLanguageChange = () => {
    changeLanguage(currentLanguage === 'es' ? 'en' : 'es');
  };
  
  return (
    <button onClick={handleLanguageChange}>
      Change language
    </button>
  );
}
```

## Adding a New Language

### 1. Create translation file

Create `src/i18n/languages/fr.js` for French:

```javascript
export const fr = {
  navbar: {
    title: 'Mon Catalogue',
    movies: 'Films',
    series: 'Séries',
    // ... more translations
  },
  // ... rest of sections
};
```

### 2. Register the language

In `src/i18n/index.js`:

```javascript
import { fr } from './languages/fr';

export const languages = {
  es,
  en,
  fr  // Add here
};

export const getLanguageList = () => [
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' }  // Add here
];
```

### 3. Ready

The new language will automatically appear in the selector and be available for use.

## Translation Structure

Translations are organized in logical sections:

- `navbar`: Navigation bar elements
- `filters`: Filters and search
- `sections`: Section names
- `homeSections`: Home page sections
- `detailModal`: Media detail modal
- `actions`: Common buttons and actions
- `messages`: System messages
- `summary`: Summary page
- `lists`: List management
- `tags`: Tag system
- `addMedia`: Add media form
- `form`: Common form fields
- `general`: General terms

## Context Functions

### `useLanguage()`

Returns an object with:

- `currentLanguage`: Current language (e.g.: 'es', 'en')
- `changeLanguage(code)`: Function to change language
- `t(key, fallback)`: Function to translate a key
- `availableLanguages`: Array with available language codes

### Function `t()`

```javascript
// Basic usage
t('navbar.title')  // -> 'Mi Catálogo' or 'My Catalog'

// With fallback
t('nonexistent.key', 'Default text')

// Nested keys
t('detailModal.addToFavorites')
```

## Included Components

### `LanguageSelector`

Dropdown selector displayed in the navigation bar:

- Shows flag and code of current language
- Dropdown list with all available languages
- Automatically closes when clicking outside
- Responsive and accessible

## Persistence

- Selected language is saved in `localStorage` as `catalog_language`
- Browser language is automatically detected on first use
- Fallback to Spanish if language cannot be detected

## Technical Considerations

- All translations are loaded at startup (no lazy loading)
- Context updates automatically when language changes
- Components re-render automatically with new translations
- Performance-optimized system with React.memo where necessary

## Complete Example

```javascript
import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useFormTranslations } from '../hooks/useTranslations';

function CompleteExample() {
  const { t, currentLanguage, changeLanguage } = useLanguage();
  const { save, cancel } = useFormTranslations();
  
  return (
    <div>
      <h1>{t('navbar.title')}</h1>
      <p>Current language: {currentLanguage}</p>
      
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
