// Passo a passo para obter a chave de API do TMDB (para leigos).
import type { ReactNode } from 'react';

interface TmdbHelpModalProps {
  open: boolean;
  onClose: () => void;
}

const STEPS: { n: number; content: ReactNode }[] = [
  { n: 1, content: <>Abra <a href="https://www.themoviedb.org/signup" target="_blank" rel="noreferrer" className="text-purple-400 underline">themoviedb.org/signup</a> e crie uma conta gratuita (nome de usuário, email e senha).</> },
  { n: 2, content: <>Confirme a conta pelo email que o site enviar (verifique também o spam).</> },
  { n: 3, content: <>Já com sessão iniciada, abra <a href="https://www.themoviedb.org/settings/api" target="_blank" rel="noreferrer" className="text-purple-400 underline">themoviedb.org/settings/api</a>.</> },
  { n: 4, content: <>Clique em <strong>“Criar”</strong> e escolha a opção <strong>“Developer”</strong> (uso pessoal).</> },
  { n: 5, content: <>Aceite os termos e preencha o formulário. Pode usar dados simples: tipo <em>Website</em>, nome “CineFlow”, URL <em>http://localhost</em> e uma descrição como “uso pessoal”.</> },
  { n: 6, content: <>Na página que aparece, copie o valor <strong>“Chave da API (v3 auth)”</strong> — uma sequência de letras e números.</> },
  { n: 7, content: <>Volte aqui, cole a chave no campo e toque em <strong>Salvar</strong>. Pronto! 🎉</> },
];

export default function TmdbHelpModal({ open, onClose }: TmdbHelpModalProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto" onClick={onClose}>
      <div className="relative bg-slate-900 rounded-3xl border border-slate-800 max-w-md w-full p-6 shadow-2xl my-8" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onClose}
          aria-label="Fechar"
          className="absolute top-4 right-4 p-1.5 bg-slate-950 hover:bg-slate-800 text-slate-400 rounded-lg border border-slate-800"
        >
          ✕
        </button>
        <h3 className="text-sm font-black uppercase tracking-wider text-white mb-1">🔑 Obter a chave de API (grátis)</h3>
        <p className="text-xs text-slate-400 mb-4">
          A chave serve para o app buscar filmes e séries automaticamente. É gratuita e leva uns 3 minutos. Siga os passos:
        </p>
        <ol className="space-y-3 text-xs text-slate-300">
          {STEPS.map((s) => (
            <li key={s.n} className="flex gap-2.5">
              <span className="flex-shrink-0 w-5 h-5 bg-purple-600 text-white rounded-full flex items-center justify-center text-[10px] font-black">{s.n}</span>
              <span>{s.content}</span>
            </li>
          ))}
        </ol>
        <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] text-slate-500">
          Dica: use a <strong>“Chave da API”</strong>, e não o “Token de Leitura” (aquele texto bem longo).
        </div>
        <button
          onClick={onClose}
          className="mt-4 w-full py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all"
        >
          Entendi
        </button>
      </div>
    </div>
  );
}
