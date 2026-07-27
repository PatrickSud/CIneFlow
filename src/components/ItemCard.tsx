// Cartão de um título na lista.
import { useState } from 'react';
import type { Item } from '../types';
import { typeLabel, typeEmoji, isSerial, POSTER_FALLBACK, priorityInfo, PRIORITIES } from '../lib/contentTypes';
import StarRating from './StarRating';

interface ItemCardProps {
  item: Item;
  onOpenDetail: (item: Item) => void;
  onRate: (id: string, star: number) => void;
  onToggleWatched: (id: string) => void;
  onEdit: (item: Item) => void;
  onDelete: (id: string, titulo: string) => void;
  onTagClick: (tag: string) => void;
  onAddToList: (item: Item) => void;
  onSetPriority: (id: string, value: number) => void;
  allTags: string[];
  onAddItemTag: (id: string, tag: string) => void;
  onRemoveItemTag: (id: string, tag: string) => void;
}

export default function ItemCard({
  item,
  onOpenDetail,
  onRate,
  onToggleWatched,
  onEdit,
  onDelete,
  onTagClick,
  onAddToList,
  onSetPriority,
  allTags,
  onAddItemTag,
  onRemoveItemTag,
}: ItemCardProps) {
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
  return (
    <div className="bg-slate-900/80 border border-slate-800/80 hover:border-purple-500/40 rounded-2xl overflow-hidden transition-all duration-300 shadow-lg flex flex-col justify-between group">

      {/* Header com Capa */}
      <div className="flex items-start p-4 space-x-4">
        {/* Imagem do Pôster (abre detalhes) */}
        <button
          type="button"
          onClick={() => onOpenDetail(item)}
          title="Ver detalhes"
          className="w-20 h-28 flex-shrink-0 bg-slate-950 rounded-xl overflow-hidden shadow-inner border border-slate-800 relative cursor-pointer"
        >
          <img
            src={item.poster_url || POSTER_FALLBACK}
            alt={item.titulo}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = POSTER_FALLBACK;
            }}
          />
          {/* Selo Tipo */}
          <div className="absolute top-1 left-1 bg-black/80 px-1.5 py-0.5 rounded text-[10px] font-bold text-slate-200" title={typeLabel(item.tipo)}>
            {typeEmoji(item.tipo)}
          </div>
        </button>

        {/* Info do Card */}
        <div className="flex-1 min-w-0 space-y-1.5">
          <div className="flex items-start justify-between gap-1.5">
            {/* Esquerda: ano + prioridade */}
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <span className="text-[10px] font-bold text-slate-400">{item.ano || 'N/A'}</span>
              {prio.v > 0 && (
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${prio.badge}`} title={`Prioridade: ${prio.label}`}>
                  {prio.dot} {prio.label}
                </span>
              )}
            </div>

            {/* Meio: botão +TAG + chips (ocupa o espaço até o estado) */}
            <div className="relative flex items-center flex-wrap gap-1 flex-1 min-w-0">
              <button
                type="button"
                onClick={() => setTagOpen((v) => !v)}
                className="text-[9px] font-black uppercase tracking-wide px-1.5 py-0.5 rounded border border-dashed border-slate-600 text-slate-400 hover:text-purple-300 hover:border-purple-500/50 transition-colors flex-shrink-0"
              >
                + Tag
              </button>
              {itemTags.map((t, tIdx) => (
                <span key={tIdx} className="inline-flex items-center gap-0.5 bg-purple-950/50 text-purple-300 text-[9px] px-1.5 py-0.5 rounded border border-purple-500/20">
                  <button type="button" onClick={() => onTagClick(t)} title={`Filtrar por #${t}`} className="hover:text-purple-100">#{t}</button>
                  <button type="button" onClick={() => onRemoveItemTag(item.id, t)} title="Remover tag" className="text-purple-400/60 hover:text-red-300 font-bold leading-none">×</button>
                </span>
              ))}
              {tagOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setTagOpen(false)}></div>
                <div className="absolute top-full left-0 mt-1 z-50 w-52 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-2">
                  <div className="flex gap-1 mb-2">
                    <input
                      type="text"
                      value={tagDraft}
                      onChange={(e) => setTagDraft(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTagFromDraft(); } }}
                      placeholder="Nova tag…"
                      className="flex-1 min-w-0 py-1 px-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 placeholder-slate-600 text-[11px] focus:outline-none focus:ring-1 focus:ring-purple-500"
                    />
                    <button
                      type="button"
                      onClick={addTagFromDraft}
                      disabled={!tagDraft.trim()}
                      className="px-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white text-sm font-bold rounded-lg"
                    >
                      +
                    </button>
                  </div>
                  {suggestTags.length > 0 && (
                    <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto">
                      {suggestTags.map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => onAddItemTag(item.id, t)}
                          className="text-[10px] text-slate-300 bg-slate-950 border border-slate-800 hover:border-purple-500/40 hover:text-purple-300 px-1.5 py-0.5 rounded-lg transition-colors"
                        >
                          + {t}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
            </div>

            {/* Direita: Estado Badge */}
            <span className={`flex-shrink-0 px-2 py-0.5 rounded-full text-[9px] font-black tracking-wide uppercase ${
              item.status_assistido === 'assistido' ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/20' :
              item.status_assistido === 'em_andamento' ? 'bg-blue-950/80 text-blue-300 border border-blue-500/20' :
              'bg-slate-950/80 text-slate-400 border border-slate-800'
            }`}>
              {item.status_assistido === 'assistido' ? 'Assistido' :
               item.status_assistido === 'em_andamento' ? 'Em Curso' :
               'Pendente'}
            </span>
          </div>

          <h3
            onClick={() => onOpenDetail(item)}
            className="font-bold text-sm text-white leading-tight truncate group-hover:text-purple-300 transition-colors cursor-pointer"
            title={item.titulo}
          >
            {item.titulo}
          </h3>

          {/* Gêneros */}
          {Array.isArray(item.generos) && item.generos.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {item.generos.slice(0, 3).map((gen, gIdx) => (
                <span key={gIdx} className="bg-slate-950 text-[9px] px-1.5 py-0.5 rounded text-slate-400">
                  {gen}
                </span>
              ))}
            </div>
          ) : (
            <span className="text-[10px] text-slate-600 italic">Sem gêneros</span>
          )}

          {/* Classificação (estrelas) */}
          <div className="flex items-center pt-0.5">
            <StarRating value={item.nota || 0} onRate={(star) => onRate(item.id, star)} />
          </div>

          {/* Barra de Progresso (filmes) */}
          {!isSerial(item.tipo) && item.status_assistido === 'em_andamento' && item.progresso_porcentagem > 0 && (
            <div className="space-y-1 pt-1">
              <div className="flex justify-between items-center text-[9px] font-bold text-blue-400">
                <span>Progresso</span>
                <span>{item.progresso_porcentagem}%</span>
              </div>
              <div className="w-full bg-slate-950 h-1 rounded-full overflow-hidden">
                <div className="bg-blue-500 h-full rounded-full" style={{ width: `${item.progresso_porcentagem}%` }}></div>
              </div>
            </div>
          )}

          {isSerial(item.tipo) && (() => {
            const epVistos = item.episodios_vistos
              ? Object.values(item.episodios_vistos).reduce((a, v) => a + (Array.isArray(v) ? v.length : 0), 0)
              : 0;
            const total = item.num_episodios ?? 0;
            // Barra de progresso de episódios + contagem à direita
            const numTemps = item.num_temporadas ?? 0;
            if (total > 0 || epVistos > 0) {
              const pct = total > 0 ? Math.min(100, Math.round((epVistos / total) * 100)) : 0;
              return (
                <div className="flex items-center gap-2 pt-1">
                  {numTemps > 0 && (
                    <span className="text-[10px] font-bold text-indigo-300 whitespace-nowrap flex-shrink-0">
                      📺 {numTemps} {numTemps === 1 ? 'Temp.' : 'Temps.'}
                    </span>
                  )}
                  <div className="flex-1 bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-850">
                    <div className="bg-gradient-to-r from-purple-600 to-indigo-500 h-full rounded-full transition-all" style={{ width: `${pct}%` }}></div>
                  </div>
                  <span className="text-[10px] font-bold text-purple-300 whitespace-nowrap">{epVistos}/{total || '?'} ep.</span>
                </div>
              );
            }
            if (item.status_assistido === 'em_andamento' && ((item.temporada_atual ?? 0) > 0 || (item.episodio_atual ?? 0) > 0)) {
              return (
                <div className="pt-1.5 flex items-center space-x-1">
                  <span className="text-[10px] bg-blue-950/60 text-blue-300 px-1.5 py-0.5 rounded font-bold border border-blue-900/40">
                    📺 T{item.temporada_atual || 1} · E{item.episodio_atual || 1}
                  </span>
                </div>
              );
            }
            return null;
          })()}

          {isSerial(item.tipo) && item.status_assistido !== 'em_andamento' && item.temporadas_assistidas_max > 0 && (
            <div className="pt-1.5 flex items-center space-x-1">
              <span className="text-[10px] bg-indigo-950/60 text-indigo-300 px-1.5 py-0.5 rounded font-bold border border-indigo-900/30">
                📺 {item.temporadas_assistidas_max} {item.temporadas_assistidas_max === 1 ? 'Temp.' : 'Temps.'}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Notas Pessoais */}
      {item.notas_pessoais && (
        <p className="mx-4 mb-3 text-[10px] text-slate-400 bg-slate-950/50 p-2 rounded-lg italic line-clamp-2 border border-slate-850">
          "{item.notas_pessoais}"
        </p>
      )}

      {/* Footer do Card — ações padronizadas */}
      <div className="px-4 py-3 bg-slate-900/40 border-t border-slate-800/80">
        <div className="grid grid-cols-5 gap-1.5">
          <button
            onClick={() => onToggleWatched(item.id)}
            className={`h-9 flex items-center justify-center rounded-xl border text-base transition-all active:scale-95 ${
              item.status_assistido === 'assistido'
                ? 'bg-emerald-950 text-emerald-400 border-emerald-500/30'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-emerald-400 hover:border-emerald-500/30'
            }`}
            title={item.status_assistido === 'assistido' ? 'Marcar como não assistido' : 'Marcar como assistido'}
            aria-label="Alternar estado assistido"
          >
            ✓
          </button>

          <div className="relative">
            <button
              onClick={() => setPrioOpen((v) => !v)}
              className={`w-full h-9 flex items-center justify-center rounded-xl border text-base transition-all active:scale-95 ${
                prio.v > 0 ? prio.badge : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white hover:border-slate-600'
              }`}
              title={`Prioridade: ${prio.label}`}
              aria-label="Definir prioridade"
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

          <button
            onClick={() => onAddToList(item)}
            className="h-9 flex items-center justify-center rounded-xl border border-slate-800 bg-slate-950 text-slate-400 hover:text-purple-300 hover:border-purple-500/40 text-base transition-all active:scale-95"
            title="Adicionar a uma lista"
            aria-label="Adicionar a uma lista"
          >
            ➕
          </button>
          <button
            onClick={() => onEdit(item)}
            className="h-9 flex items-center justify-center rounded-xl border border-slate-800 bg-slate-950 text-slate-400 hover:text-purple-300 hover:border-purple-500/40 text-base transition-all active:scale-95"
            title="Editar ficha"
            aria-label="Editar ficha"
          >
            ✏️
          </button>
          <button
            onClick={() => onDelete(item.id, item.titulo)}
            className="h-9 flex items-center justify-center rounded-xl border border-slate-800 bg-slate-950 text-slate-500 hover:text-red-400 hover:border-red-500/40 text-base transition-all active:scale-95"
            title="Remover da biblioteca"
            aria-label="Remover título da biblioteca"
          >
            🗑️
          </button>
        </div>
      </div>

    </div>
  );
}
