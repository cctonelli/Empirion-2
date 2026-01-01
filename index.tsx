
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './i18n'; // Activate internationalization

// Global error tracking for deployment diagnosis
window.addEventListener('error', (event) => {
  console.error('Empirion Global Error:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Empirion Promise Rejection:', event.reason);
});

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

try {
  const root = createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} catch (error) {
  console.error("Critical rendering error during initialization:", error);
  rootElement.innerHTML = `
    <div style="padding: 40px; text-align: center; font-family: sans-serif; background: #fff1f2; border: 2px solid #fda4af; border-radius: 20px; margin: 20px;">
      <h1 style="color: #be123c;">Empirion Engine Alert</h1>
      <p style="color: #4b5563;">The strategic simulation kernel failed to initialize. This is usually caused by a module resolution conflict in the browser environment.</p>
      <p style="color: #9ca3af; font-size: 12px;">Technical details have been sent to the system console.</p>
    </div>
  `;
}
