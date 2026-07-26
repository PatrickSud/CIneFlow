// Instruções de instalação do PWA no iPhone/iPad.
import type { ReactNode } from 'react';

interface IosInstallHelpProps {
  open: boolean;
  onClose: () => void;
}

const STEPS: { n: number; content: ReactNode }[] = [
  { n: 1, content: <>Toque no botão <strong>Compartilhar</strong> (o quadrado com a seta para cima), na barra do Safari.</> },
  { n: 2, content: <>Deslize e toque em <strong>“Adicionar à Tela de Início”</strong>.</> },
  { n: 3, content: <>Confirme em <strong>“Adicionar”</strong>. O CineFlow aparece como um app na sua tela.</> },
];

export default function IosInstallHelp({ open, onClose }: IosInstallHelpProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={onClose}>
      <div className="relative bg-slate-900 rounded-3xl border border-slate-800 max-w-sm w-full p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onClose}
          aria-label="Fechar"
          className="absolute top-4 right-4 p-1.5 bg-slate-950 hover:bg-slate-800 text-slate-400 rounded-lg border border-slate-800"
        >
          ✕
        </button>
        <h3 className="text-sm font-black uppercase tracking-wider text-white mb-3">📲 Instalar no iPhone / iPad</h3>
        <p className="text-xs text-slate-400 mb-4">No Safari, siga estes passos:</p>
        <ol className="space-y-3 text-xs text-slate-300">
          {STEPS.map((s) => (
            <li key={s.n} className="flex gap-2.5">
              <span className="flex-shrink-0 w-5 h-5 bg-purple-600 text-white rounded-full flex items-center justify-center text-[10px] font-black">{s.n}</span>
              <span>{s.content}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
