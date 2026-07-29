// Barra de ações em lote para o modo de multi-seleção.
import { useState } from 'react';
import { PRIORITIES } from '../lib/contentTypes';

interface BulkActionBarProps {
  count: number;
  totalVisible: number;
  allTags: string[];
  onSetPriority: (v: number) => void;
  onSetWatched: (watched: boolean) => void;
  onAddTags: (tags: string[]) => void;
  onAddToList: () => void;
  onCreateList: () => void;
  onSelectAll: () => void;
  onClear: () => void;
  onExit: () => void;
}

export default function BulkActionBar({
  count,
  totalVisible,
  allTags,
  onSetPriority,
  onSetWatched,
  onAddTags,
  onAddToList,
  onCreateList,
  onSelectAll,
  onClear,
  onExit,
}: BulkActionBarProps) {
  const [prioOpen, setPrioOpen] = useState(false);
  const [tagOpen, setTagOpen] = useState(false);
  const [listOpen, setListOpen] = useState(false);
  const [tagDraft, setTagDraft] = useState('');
  const [picked, setPicked] = useState<string[]>([]);
  const disabled = count === 0;

  const closeAll = () => { setPrioOpen(false); setTagOpen(false); setListOpen(false); };
  const suggest = allTags.filter((t) => !picked.some((x) => x.toLowerCase() === t.toLowerCase()));
  const togglePick = (t: string) =>
    setPicked((p) => (p.some((x) => x.toLowerCase() === t.toLowerCase()) ? p.filter((x) => x.toLowerCase() !== t.toLowerCase()) : [...p, t]));
  const addDraft = () => {
    const v = tagDraft.trim();
    if (v && !picked.some((x) => x.toLowerCase() === v.toLowerCase())) setPicked((p) => [...p, v]);
    setTagDraft('');
  };
  const applyTags = () => {
    const all = [...picked];
    const v = tagDraft.trim();
    if (v && !all.some((x) => x.toLowerCase() === v.toLowerCase())) all.push(v);
    if (all.length) onAddTags(all);
    setPicked([]);
    setTagDraft('');
    setTagOpen(false);
  };

  const btn = 'text-[11px] font-bold px-2.5 py-1.5 rounded-xl border transition-colors disabled:opacity-40 disabled:cursor-not-allowed';
  const btnNeutral = `${btn} bg-slate-950/70 border-purple-500/20 text-slate-200 hover:border-purple-400/60`;
  // Popover centralizado acima da barra, com largura limitada à viewport (não corta no celular).
  const popBase = 'absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-[70] bg-slate-900 border border-slate-700 rounded-xl shadow-2xl';

  return (
    <div className="fixed inset-x-0 bottom-24 z-[60] px-3 pointer-events-none">
      <div className="pointer-events-auto relative max-w-3xl mx-auto bg-purple-950/95 backdrop-blur border border-purple-500/50 rounded-2xl shadow-2xl shadow-purple-900/40 p-3">

        {/* Popover: Prioridade */}
        {prioOpen && (
          <>
            <div className="fixed inset-0 z-[65]" onClick={() => setPrioOpen(false)}></div>
            <div className={`${popBase} w-44 p-1`}>
              {PRIORITIES.map((p) => (
                <button
                  key={p.v}
                  onClick={() => { onSetPriority(p.v); setPrioOpen(false); }}
                  className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-[11px] font-semibold text-slate-300 hover:bg-slate-800/60 transition-colors"
                >
                  <span>{p.dot}</span> {p.label}
                </button>
              ))}
            </div>
          </>
        )}

        {/* Popover: Tags */}
        {tagOpen && (
          <>
            <div className="fixed inset-0 z-[65]" onClick={() => setTagOpen(false)}></div>
            <div className={`${popBase} w-[min(20rem,calc(100vw-2.5rem))] p-2.5`}>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Adicionar tags à seleção</p>
              <div className="flex gap-1 mb-2">
                <input
                  type="text"
                  value={tagDraft}
                  onChange={(e) => setTagDraft(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addDraft(); } }}
                  placeholder="Nova tag…"
                  className="flex-1 min-w-0 py-1 px-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 placeholder-slate-600 text-[11px] focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
                <button onClick={addDraft} disabled={!tagDraft.trim()} className="px-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-white text-sm font-bold rounded-lg">+</button>
              </div>
              {picked.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {picked.map((t) => (
                    <span key={t} className="inline-flex items-center gap-0.5 bg-purple-950/50 text-purple-300 text-[10px] px-1.5 py-0.5 rounded border border-purple-500/20">
                      #{t}
                      <button onClick={() => togglePick(t)} className="text-purple-400/60 hover:text-red-300 font-bold leading-none">×</button>
                    </span>
                  ))}
                </div>
              )}
              {suggest.length > 0 && (
                <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto mb-2">
                  {suggest.map((t) => (
                    <button key={t} onClick={() => togglePick(t)} className="text-[10px] text-slate-300 bg-slate-950 border border-slate-800 hover:border-purple-500/40 hover:text-purple-300 px-1.5 py-0.5 rounded-lg transition-colors">+ {t}</button>
                  ))}
                </div>
              )}
              <button onClick={applyTags} disabled={picked.length === 0 && !tagDraft.trim()} className="w-full py-1.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white text-[11px] font-bold rounded-lg">Aplicar</button>
            </div>
          </>
        )}

        {/* Popover: Listas */}
        {listOpen && (
          <>
            <div className="fixed inset-0 z-[65]" onClick={() => setListOpen(false)}></div>
            <div className={`${popBase} w-[min(18rem,calc(100vw-2.5rem))] p-1`}>
              <button onClick={() => { setListOpen(false); onAddToList(); }} className="w-full text-left px-3 py-2 rounded-lg text-[11px] font-semibold text-slate-300 hover:bg-slate-800/60 transition-colors">➕ Adicionar a uma lista</button>
              <button onClick={() => { setListOpen(false); onCreateList(); }} className="w-full text-left px-3 py-2 rounded-lg text-[11px] font-semibold text-purple-300 hover:bg-slate-800/60 transition-colors">＋ Criar nova lista com a seleção</button>
            </div>
          </>
        )}

        {/* Linha 1: contagem e seleção */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-black text-white bg-purple-600 rounded-full px-2.5 py-1">{count}</span>
          <span className="text-[11px] text-purple-100 font-semibold mr-auto">selecionado{count === 1 ? '' : 's'}</span>
          <button onClick={onSelectAll} className={btnNeutral}>Selecionar todos ({totalVisible})</button>
          <button onClick={onClear} disabled={disabled} className={btnNeutral}>Limpar</button>
          <button onClick={onExit} className={`${btn} bg-slate-800 border-slate-600 text-white hover:bg-slate-700`}>✕ Sair</button>
        </div>

        {/* Linha 2: ações em lote */}
        <div className="flex items-center gap-2 flex-wrap mt-2 pt-2 border-t border-purple-500/20">
          <button onClick={() => onSetWatched(true)} disabled={disabled} className={`${btn} bg-emerald-950/60 border-emerald-500/30 text-emerald-300 hover:bg-emerald-950`}>✓ Visto</button>
          <button onClick={() => onSetWatched(false)} disabled={disabled} className={`${btn} bg-slate-950/70 border-purple-500/20 text-slate-300 hover:border-slate-500`}>↩ Não visto</button>
          <button onClick={() => { const v = !prioOpen; closeAll(); setPrioOpen(v); }} disabled={disabled} className={btnNeutral}>🚩 Prioridade</button>
          <button onClick={() => { const v = !tagOpen; closeAll(); setTagOpen(v); }} disabled={disabled} className={btnNeutral}># Tags</button>
          <button onClick={() => { const v = !listOpen; closeAll(); setListOpen(v); }} disabled={disabled} className={btnNeutral}>📑 Listas</button>
        </div>
      </div>
    </div>
  );
}
