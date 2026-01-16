
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

const startApp = () => {
  try {
    const container = document.getElementById('root');
    if (container) {
      const root = createRoot(container);
      root.render(
        <React.StrictMode>
          <App />
        </React.StrictMode>
      );
      
      // Скрываем спиннер только после успешной инициализации рендера
      const spinner = document.getElementById('loading-spinner');
      if (spinner) spinner.style.display = 'none';
    }
  } catch (err) {
    console.error("Critical Render Error:", err);
    const fallback = document.getElementById('fallback-error');
    if (fallback) fallback.style.display = 'flex';
    const spinner = document.getElementById('loading-spinner');
    if (spinner) spinner.style.display = 'none';
  }
};

// Запуск приложения
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startApp);
} else {
  startApp();
}
