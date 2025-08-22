// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { Toaster } from 'react-hot-toast';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
    <Toaster // 
      position="top-right"
      toastOptions={{
        // Estilos por defecto para los toasts
        success: {
          style: {
            background: '#d1fae5', // Un verde claro
            color: '#065f46',
          },
        },
        error: {
          style: {
            background: '#fee2e2', // Un rojo claro
            color: '#991b1b',
          },
        },
      }}
    />
  </React.StrictMode>,
);
