// Modal para adicionar um título a uma ou mais listas.
import { useState } from 'react';
import type { SharedList } from '../types';

interface AddToListModalProps {
  open: boolean;
  itemTitulo: string;
  lists: SharedList[];
  onClose: () => void;
  onConfirm: (listIds: string[]) => void;
  onCreateNew: () => void;
}

export default function AddToListModal({
  open,
  itemTitulo,
  lists,
  onClose,
  onConfirm,
  onCreateNew,
}: AddToListModalProps) {
  const [selected, setSelected] = useState<string[]>([]);
  if (!open) return null;

  const toggle = (id: string) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  return (
    <div className="fixed inset-0 z-[76] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={onClose}>
      <div className="relative bg-slate-900 rounded-3xl border border-slate-800 max-w-sm w-full p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} aria-label="Fechar" className="absolute top-4 right-4 p-1.5 bg-slate-950 hover:bg-slate-800 text-slate-400 rounded-lg border border-slate-800">✕</button>
        <h3 className="text-sm font-black text-white mb-1">Adicionar a listas</h3>
        <p className="text-xs text-slate-400 mb-4 truncate">"{itemTitulo}"</p>

        {lists.length === 0 ? (
          <p className="text-xs text-slate-500 italic mb-4">Você ainda não tem listas. Crie uma para começar a organizar.</p>
        ) : (
          <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1 mb-4">
            {lists.map((l) => {
              const on = selected.includes(l.id);
              return (
                <button
                  key={l.id}
                  onClick={() => toggle(l.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-colors ${
                    on ? 'bg-purple-600/20 border-purple-500/50 text-white' : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-purple-500/40'
                  }`}
                >
                  <span className={`w-4 h-4 rounded flex items-center justify-center border ${on ? 'bg-purple-600 border-purple-500' : 'border-slate-600'}`}>
                    {on && <span className="text-[9px] text-white">✓</span>}
                  </span>
                  <span className="truncate flex-1 text-left">👥 {l.nome}</span>
                  <span className="text-[9px] text-slate-500">{l.memberEmails.length > 1 ? 'compart.' : 'pessoal'}</span>
                </button>
              );
            })}
          </div>
        )}

        <button
          onClick={onCreateNew}
          className="w-full mb-3 py-2 text-xs font-bold text-purple-300 border border-dashed border-slate-700 hover:border-purple-500/50 rounded-xl transition-colors"
        >
          ＋ Criar nova lista
        </button>

        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 py-2 bg-slate-950 border border-slate-800 hover:bg-slate-800 text-slate-300 text-xs font-bold uppercase tracking-wider rounded-xl">
            Cancelar
          </button>
          <button
            onClick={() => onConfirm(selected)}
            disabled={selected.length === 0}
            className="flex-1 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-xs font-bold uppercase tracking-wider rounded-xl"
          >
            Adicionar
          </button>
        </div>
      </div>
    </div>
  );
}
