// Visualizador de uma lista pública (somente leitura) + copiar para a conta.
import { useEffect, useState } from 'react';
import type { Item, SharedList } from '../types';
import { loadListDoc } from '../lib/lists';
import { typeEmoji, POSTER_FALLBACK } from '../lib/contentTypes';

interface PublicListViewerProps {
  listId: string;
  canCopy: boolean;
  onClose: () => void;
  onCopy: (nome: string, biblioteca: Item[]) => void;
}

export default function PublicListViewer({ listId, canCopy, onClose, onCopy }: PublicListViewerProps) {
  const [meta, setMeta] = useState<SharedList | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true);
    loadListDoc(listId)
      .then((res) => {
        if (!active) return;
        if (!res || !res.meta.publico) {
          setError('Esta lista não está disponível ou não é mais pública.');
        } else {
          setMeta(res.meta);
          setItems(res.biblioteca);
        }
      })
      .catch(() => { if (active) setError('Não foi possível carregar a lista.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [listId]);

  return (
    <div className="fixed inset-0 z-[95] bg-slate-950 overflow-y-auto">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🔗</span>
            <div>
              <h1 className="text-lg font-black text-white">{meta?.nome || 'Lista pública'}</h1>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Lista pública · somente leitura</p>
            </div>
          </div>
          <button onClick={onClose} className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700">
            Fechar
          </button>
        </div>

        {loading ? (
          <div className="py-20 text-center">
            <div className="w-8 h-8 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-xs text-slate-400">Carregando lista…</p>
          </div>
        ) : error ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 text-center">
            <p className="text-sm text-slate-400">{error}</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs text-slate-400 font-semibold">{items.length} título(s)</span>
              {canCopy ? (
                <button
                  onClick={() => onCopy(meta?.nome || 'Lista', items)}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-lg"
                >
                  📥 Copiar para minha conta
                </button>
              ) : (
                <span className="text-[11px] text-slate-500">Entre com a sua conta para copiar esta lista.</span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {items.map((it) => (
                <div key={it.id} className="bg-slate-900/70 border border-slate-800 rounded-2xl p-3 flex gap-3 items-start">
                  <img
                    src={it.poster_url || POSTER_FALLBACK}
                    alt={it.titulo}
                    className="w-12 h-16 object-cover rounded-lg bg-slate-950 border border-slate-800 flex-shrink-0"
                    onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = POSTER_FALLBACK; }}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] text-slate-500 font-bold">{typeEmoji(it.tipo)} {it.ano || 's/ ano'}</p>
                    <p className="text-xs font-bold text-white leading-tight line-clamp-2">{it.titulo}</p>
                    {Array.isArray(it.generos) && it.generos.length > 0 && (
                      <p className="text-[10px] text-slate-500 truncate">{it.generos.slice(0, 3).join(', ')}</p>
                    )}
                  </div>
                </div>
              ))}
              {items.length === 0 && <p className="text-xs text-slate-500 italic col-span-full">Esta lista está vazia.</p>}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
