// Cartão compacto (grade de pôsteres) com ações rápidas para a visualização de alta densidade.
import { useState } from 'react';
import type { Item } from '../types';
import { typeEmoji, typeLabel, POSTER_FALLBACK, priorityInfo, PRIORITIES } from '../lib/contentTypes';

interface CompactCardProps {
  item: Item;
  onOpenDetail: (item: Item) => void;
  onToggleWatched: (id: string) => void;
  onAddToList: (item: Item) => void;
  onSetPriority: (id: string, value: number) => void;
  allTags: string[];
  onAddItemTag: (id: string, tag: string) => void;
  onRemoveItemTag: (id: string, tag: string) => void;
  selectionMode?: boolean;
  selected?: boolean;
  onToggleSelect?: (id: string) => void;
}

export default function CompactCard({
  item,
  onOpenDetail,
  onToggleWatched,
  onAddToList,
  onSetPriority,
  allTags,
  onAddItemTag,
  onRemoveItemTag,
  selectionMode = false,
  selected = false,
  onToggleSelect,
}: CompactCardProps) {
  const prio = priorityInfo(item.prioridade);
  const [prioOpen, setPrioOpen] = useState(false);
  const [tagOpen, setTagOpen] = useState(false);
  const [tagDraft, setTagDraft] = useState('');
  const itemTags = item.tags || [];
  const suggestTags = allTags.filter((t) => !itemTags.some((x) => x.toLowerCase() === t.toLowerCase()));
  const addTagFromDraft = () => {
    const v = tagDraft.trim();
    if (!v) return;
    onAddItemTag(item.id, v);
    setTagDraft('');
  };

  const statusRing =
    item.status_assistido === 'assistido' ? 'ring-emerald-500/70' :
    item.status_assistido === 'em_andamento' ? 'ring-blue-500/70' :
    'ring-transparent';

  const handlePoster = () => {
    if (selectionMode) onToggleSelect?.(item.id);
    else onOpenDetail(item);
  };

  const actBtn = 'h-7 flex items-center justify-center rounded-lg border text-[13px] transition-all active:scale-95';

  return (
    <div
      className={`relative rounded-xl bg-slate-950 border transition-all ${
        selected ? 'border-purple-500 ring-2 ring-purple-500/60' : 'border-slate-800 hover:border-purple-500/40'
      }`}
    >
      {/* Pôster (abre detalhes / seleciona) */}
      <button
        type="button"
        onClick={handlePoster}
        title={selectionMode ? 'Selecionar' : item.titulo}
        className="relative block w-full text-left rounded-t-xl overflow-hidden"
      >
        <div className="relative aspect-[2/3] bg-slate-900">
          <img
            src={item.poster_url || POSTER_FALLBACK}
            alt={item.titulo}
            loading="lazy"
            className={`w-full h-full object-cover ring-2 ring-inset ${statusRing}`}
            onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = POSTER_FALLBACK; }}
          />
          <span className="absolute top-1 left-1 bg-black/80 px-1.5 py-0.5 rounded text-[11px] font-bold text-slate-200" title={typeLabel(item.tipo)}>
            {typeEmoji(item.tipo)}
          </span>
          {prio.v > 0 && (
            <span className="absolute top-1 right-1 text-[12px]" title={`Prioridade: ${prio.label}`}>{prio.dot}</span>
          )}
          {item.nota > 0 && (
            <span className="absolute bottom-1 left-1 bg-black/80 px-1.5 py-0.5 rounded text-[10px] font-bold text-amber-300">★ {item.nota}</span>
          )}
          {selectionMode && (
            <span className={`absolute bottom-1 right-1 w-6 h-6 flex items-center justify-center rounded-full border-2 text-xs font-black shadow ${
              selected ? 'bg-purple-600 border-purple-400 text-white' : 'bg-slate-950/90 border-slate-500 text-transparent'
            }`}>✓</span>
          )}
          <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/90 to-transparent pointer-events-none"></div>
          <p className="absolute bottom-1.5 left-2 right-2 text-[11px] font-bold text-white leading-tight line-clamp-2 drop-shadow">
            {item.titulo}
          </p>
        </div>
      </button>

      {/* Ações rápidas (ocultas no modo de seleção) */}
      {!selectionMode && (
        <div className="grid grid-cols-4 gap-0.5 p-1 border-t border-slate-800">
          {/* Assistido */}
          <button
            onClick={() => onToggleWatched(item.id)}
            title={item.status_assistido === 'assistido' ? 'Marcar como não assistido' : 'Marcar como assistido'}
            aria-label="Alternar assistido"
            className={`${actBtn} ${
              item.status_assistido === 'assistido'
                ? 'bg-emerald-950 text-emerald-400 border-emerald-500/30'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-emerald-400 hover:border-emerald-500/30'
            }`}
          >
            ✓
          </button>

          {/* +TAG */}
          <div className="relative">
            <button
              onClick={() => { setTagOpen((v) => !v); setPrioOpen(false); }}
              title="Adicionar tag"
              aria-label="Adicionar tag"
              className={`${actBtn} w-full bg-slate-950 text-slate-400 border-slate-800 hover:text-purple-300 hover:border-purple-500/40`}
            >
              #
            </button>
            {tagOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setTagOpen(false)}></div>
                <div className="absolute bottom-full right-0 mb-1.5 z-50 w-48 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-2">
                  {itemTags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {itemTags.map((t) => (
                        <span key={t} className="inline-flex items-center gap-0.5 bg-purple-950/50 text-purple-300 text-[10px] px-1.5 py-0.5 rounded border border-purple-500/20">
                          #{t}
                          <button onClick={() => onRemoveItemTag(item.id, t)} title="Remover" className="text-purple-400/60 hover:text-red-300 font-bold leading-none">×</button>
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="flex gap-1 mb-2">
                    <input
                      type="text"
                      value={tagDraft}
                      onChange={(e) => setTagDraft(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTagFromDraft(); } }}
                      placeholder="Nova tag…"
                      className="flex-1 min-w-0 py-1 px-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 placeholder-slate-600 text-[11px] focus:outline-none focus:ring-1 focus:ring-purple-500"
                    />
                    <button onClick={addTagFromDraft} disabled={!tagDraft.trim()} className="px-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white text-sm font-bold rounded-lg">+</button>
                  </div>
                  {suggestTags.length > 0 && (
                    <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto">
                      {suggestTags.map((t) => (
                        <button key={t} onClick={() => onAddItemTag(item.id, t)} className="text-[10px] text-slate-300 bg-slate-950 border border-slate-800 hover:border-purple-500/40 hover:text-purple-300 px-1.5 py-0.5 rounded-lg transition-colors">+ {t}</button>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Adicionar a uma lista */}
          <button
            onClick={() => onAddToList(item)}
            title="Adicionar a uma lista"
            aria-label="Adicionar a uma lista"
            className={`${actBtn} bg-slate-950 text-slate-400 border-slate-800 hover:text-purple-300 hover:border-purple-500/40`}
          >
            ➕
          </button>

          {/* Prioridade */}
          <div className="relative">
            <button
              onClick={() => { setPrioOpen((v) => !v); setTagOpen(false); }}
              title={`Prioridade: ${prio.label}`}
              aria-label="Definir prioridade"
              className={`${actBtn} w-full ${prio.v > 0 ? prio.badge : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white hover:border-slate-600'}`}
            >
              🚩
            </button>
            {prioOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setPrioOpen(false)}></div>
                <div className="absolute bottom-full right-0 mb-1.5 z-50 w-36 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-1">
                  {PRIORITIES.map((p) => {
                    const on = (item.prioridade || 0) === p.v;
                    return (
                      <button
                        key={p.v}
                        onClick={() => { onSetPriority(item.id, p.v); setPrioOpen(false); }}
                        className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-[11px] font-semibold transition-colors ${on ? 'bg-slate-800 text-white' : 'text-slate-300 hover:bg-slate-800/60'}`}
                      >
                        <span>{p.dot}</span> {p.label} {on && <span className="ml-auto text-[9px] text-purple-400">✓</span>}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
