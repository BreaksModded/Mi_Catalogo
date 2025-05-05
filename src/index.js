import React from 'react';
import ReactDOM from 'react-dom/client';
import AppWrapper from './App';
import { NotificationProvider } from './context/NotificationContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <NotificationProvider>
      <AppWrapper />
    </NotificationProvider>
  </React.StrictMode>
);

import { useNotification } from './context/NotificationContext';
