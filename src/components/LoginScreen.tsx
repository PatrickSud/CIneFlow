// Tela de login (Entrar com Google).
import { useState } from 'react';
import { useAuth } from '../auth/AuthContext';

export default function LoginScreen() {
  const { signIn } = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setBusy(true);
    setError('');
    try {
      await signIn();
    } catch (e: any) {
      if (e?.code === 'auth/popup-closed-by-user' || e?.code === 'auth/cancelled-popup-request') {
        setError('');
      } else {
        setError('Não foi possível entrar. Tente novamente.');
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6">
      <div className="w-full max-w-sm text-center">
        {/* Logo */}
        <div className="w-16 h-16 mx-auto bg-gradient-to-tr from-purple-600 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/20 mb-5">
          <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
          </svg>
        </div>

        <h1 className="text-2xl font-black tracking-wider bg-gradient-to-r from-white to-purple-400 bg-clip-text text-transparent uppercase">
          CineFlow
        </h1>
        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">A Sua Biblioteca de Filmes e Séries</p>

        <p className="text-sm text-slate-400 mt-6 mb-6 leading-relaxed">
          Entre com a sua conta Google para acessar a sua biblioteca em qualquer dispositivo.
        </p>

        <button
          onClick={handleLogin}
          disabled={busy}
          className="w-full flex items-center justify-center gap-3 bg-white hover:bg-slate-100 disabled:opacity-70 text-slate-800 font-bold text-sm py-3 rounded-xl shadow-lg transition-all"
        >
          {busy ? (
            <span className="w-5 h-5 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin"></span>
          ) : (
            <svg className="w-5 h-5" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
            </svg>
          )}
          <span>Entrar com Google</span>
        </button>

        {error && <p className="text-xs text-red-400 mt-3">{error}</p>}

        <p className="text-[10px] text-slate-600 mt-8">
          Os seus dados ficam salvos de forma segura na sua conta.
        </p>
      </div>
    </div>
  );
}
