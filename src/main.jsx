import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AuthProvider, useAuth } from './auth/AuthContext';
import LoginScreen from './components/LoginScreen';
import './index.css';

// Decide entre a tela de login e a aplicação, conforme o estado de autenticação.
function Gate() {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
      </div>
    );
  }
  return user ? <App /> : <LoginScreen />;
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <Gate />
    </AuthProvider>
  </React.StrictMode>
);

// Registro do service worker (PWA) — habilita instalação e uso offline.
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    const swUrl = `${import.meta.env.BASE_URL}sw.js`;
    navigator.serviceWorker.register(swUrl).catch((err) => {
      console.warn('Falha ao registar o service worker:', err);
    });
  });
}
