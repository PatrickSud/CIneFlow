// Gerenciador de tags: renomear/apagar em toda a biblioteca.
import { useState } from 'react';
import type { Item } from '../types';

interface TagManagerModalProps {
  open: boolean;
  allTags: string[];
  items: Item[];
  onRename: (oldLabel: string, newLabel: string) => void;
  onDelete: (label: string) => void;
  onClose: () => void;
}

export default function TagManagerModal({
  open,
  allTags,
  items,
  onRename,
  onDelete,
  onClose,
}: TagManagerModalProps) {
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  if (!open) return null;

  const countFor = (key: string) =>
    items.filter((i) => Array.isArray(i.tags) && i.tags.some((x) => x.toLowerCase() === key)).length;

  return (
    <div className="fixed inset-0 z-[70] flex items-start justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto" onClick={onClose}>
      <div className="relative bg-slate-900 rounded-3xl border border-slate-800 max-w-md w-full p-6 shadow-2xl my-8" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onClose}
          aria-label="Fechar"
          className="absolute top-4 right-4 p-1.5 bg-slate-950 hover:bg-slate-800 text-slate-400 rounded-lg border border-slate-800"
        >
          ✕
        </button>
        <h3 className="text-sm font-black uppercase tracking-wider text-white mb-1">⚙️ Gerenciar Tags</h3>
        <p className="text-xs text-slate-400 mb-4">Renomear ou apagar afeta todos os títulos que usam a tag.</p>
        {allTags.length === 0 ? (
          <p className="text-xs text-slate-500 italic">Ainda não há tags. Crie-as ao adicionar ou editar um título.</p>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
            {allTags.map((t) => {
              const key = t.toLowerCase();
              const draft = drafts[key] ?? t;
              return (
                <div key={t} className="flex items-center gap-2 bg-slate-950/60 border border-slate-800 rounded-xl p-2">
                  <input
                    type="text"
                    value={draft}
                    onChange={(e) => setDrafts((prev) => ({ ...prev, [key]: e.target.value }))}
                    className="flex-1 min-w-0 py-1.5 px-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 text-xs focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                  <span className="text-[9px] text-slate-500 font-bold flex-shrink-0">{countFor(key)}×</span>
                  <button
                    onClick={() => { onRename(t, draft); setDrafts((prev) => { const n = { ...prev }; delete n[key]; return n; }); }}
                    disabled={draft.trim() === '' || draft.trim().toLowerCase() === t.toLowerCase()}
                    className="text-[10px] font-bold text-purple-300 disabled:text-slate-700 disabled:cursor-default bg-slate-950 border border-slate-800 px-2 py-1 rounded-lg hover:border-purple-500/40"
                  >
                    Renomear
                  </button>
                  <button
                    onClick={() => onDelete(t)}
                    aria-label={`Apagar tag ${t}`}
                    className="text-[10px] font-bold text-red-400 bg-slate-950 border border-slate-800 px-2 py-1 rounded-lg hover:border-red-500/40"
                  >
                    Apagar
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
