import React from 'react';
import ReactDOM from 'react-dom/client';
import AppWrapper from './App';
import { NotificationProvider } from './context/NotificationContext';
import { LanguageProvider } from './context/LanguageContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <LanguageProvider>
      <NotificationProvider>
        <AppWrapper />
      </NotificationProvider>
    </LanguageProvider>
  </React.StrictMode>
);

