
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
      
      // Скрываем splash screen как только React начал рендеринг App
      // Мы не ждем полной инициализации данных внутри App, чтобы пользователь сразу видел Welcome screen
      setTimeout(() => {
        const loader = document.getElementById('initial-loader');
        if (loader) {
          loader.style.opacity = '0';
          setTimeout(() => loader.style.display = 'none', 500);
        }
      }, 100);
    }
  } catch (err) {
    console.error("Critical Render Error:", err);
    const loader = document.getElementById('initial-loader');
    if (loader) loader.innerHTML = '<div style="color:red; font-size:10px; font-weight:bold;">BOOT_ERROR: RESTART APP</div>';
  }
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startApp);
} else {
  startApp();
}
