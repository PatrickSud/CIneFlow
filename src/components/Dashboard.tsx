// Aba de métricas e progresso.
import { useState } from 'react';
import type { Item, Stats } from '../types';
import { formatMinutes } from '../lib/library';

interface DashboardProps {
  stats: Stats;
  items: Item[];
  onOpenItem?: (item: Item) => void;
  autoListActive?: boolean;
  onCreateAutoList?: () => void;
}

export default function Dashboard({ stats, items, onOpenItem, autoListActive = false, onCreateAutoList }: DashboardProps) {
  const fiveStar = items.filter((i) => i.nota === 5);
  const [showAllFive, setShowAllFive] = useState(false);
  const FIVE_LIMIT = 9;
  const visibleFive = showAllFive ? fiveStar : fiveStar.slice(0, FIVE_LIMIT);

  return (
    <section className="space-y-6 max-w-5xl mx-auto">

      {/* Progresso de Visualização (unifica concluídos, em curso e total) */}
      <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-4 shadow-lg">
        <div className="flex justify-between items-center text-xs">
          <span className="font-bold text-slate-300 uppercase tracking-wider">📊 Progresso de Visualização</span>
          <span className="text-purple-400 font-black">{stats.watched} de {stats.total} ({stats.watchedPercent}%)</span>
        </div>

        <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-slate-850 p-0.5">
          <div className="bg-gradient-to-r from-purple-600 to-indigo-500 h-full rounded-full transition-all duration-700" style={{ width: `${stats.watchedPercent}%` }}></div>
        </div>

        {/* Mini-indicadores: concluídos, em curso, pendentes */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-slate-950 rounded-xl border border-slate-850 p-3 text-center">
            <p className="text-lg font-black text-emerald-400 leading-none">{stats.watched}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">✓ Concluídos</p>
            <p className="text-[9px] text-slate-600">{stats.watchedPercent}%</p>
          </div>
          <div className="bg-slate-950 rounded-xl border border-slate-850 p-3 text-center">
            <p className="text-lg font-black text-blue-400 leading-none">{stats.inProgress}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">🍿 Em Curso</p>
          </div>
          <div className="bg-slate-950 rounded-xl border border-slate-850 p-3 text-center">
            <p className="text-lg font-black text-slate-300 leading-none">{stats.unwatched}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">⏳ Pendentes</p>
          </div>
        </div>

        {stats.tempoAssistidoMin > 0 && (
          <p className="text-[11px] text-slate-400">
            ⏱️ Tempo total assistido (estimado): <strong className="text-slate-200">{formatMinutes(stats.tempoAssistidoMin)}</strong>
            <span className="text-slate-600"> — requer dados de duração do TMDB</span>
          </p>
        )}
      </div>

      {/* Distribuição por Tipo (com o total do acervo no título) */}
      {stats.byType.length > 0 && (
        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-3 shadow-lg">
          <h4 className="text-xs font-bold uppercase tracking-wider text-white">
            🗂️ Por Tipo de Conteúdo <span className="text-purple-400">(Total {stats.total})</span>
          </h4>
          <div className="flex flex-wrap gap-2">
            {stats.byType.map((t) => (
              <div key={t.id} className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-850">
                <span>{t.emoji}</span>
                <span className="text-xs font-semibold text-slate-300">{t.label}</span>
                <span className="text-xs font-black text-purple-400">{t.qtd}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Nota média + Distribuições */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Distribuição por Gênero */}
        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-3 shadow-lg">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">🎭 Principais Gêneros</h4>
            <span className="text-[10px] bg-amber-950 text-amber-400 px-2 py-0.5 rounded border border-amber-500/20 font-black">
              Nota média ★ {stats.avgRating}
            </span>
          </div>
          {stats.topGenres.length > 0 ? (
            <div className="space-y-2 pt-1">
              {stats.topGenres.map((g) => (
                <div key={g.nome} className="space-y-1">
                  <div className="flex justify-between text-[10px] font-bold">
                    <span className="text-slate-300">{g.nome}</span>
                    <span className="text-slate-500">{g.qtd}</span>
                  </div>
                  <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-850">
                    <div
                      className="bg-gradient-to-r from-purple-600 to-indigo-500 h-full rounded-full transition-all duration-700"
                      style={{ width: `${(g.qtd / stats.topGenres[0].qtd) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic">Sem gêneros registrados ainda.</p>
          )}
        </div>

        {/* Distribuição por Década */}
        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-3 shadow-lg">
          <h4 className="text-xs font-bold uppercase tracking-wider text-white">📅 Por Década de Lançamento</h4>
          {stats.decades.length > 0 ? (
            <div className="flex items-end justify-between gap-1.5 pt-3 h-40">
              {stats.decades.map((d) => {
                const maxDec = Math.max(...stats.decades.map((x) => x.qtd));
                const h = Math.max(6, Math.round((d.qtd / maxDec) * 100));
                return (
                  <div key={d.dec} className="flex-1 flex flex-col items-center justify-end h-full gap-1" title={`${d.qtd} título(s)`}>
                    <span className="text-[9px] font-bold text-slate-400">{d.qtd}</span>
                    <div
                      className="w-full bg-gradient-to-t from-purple-600 to-indigo-400 rounded-t-md transition-all duration-700"
                      style={{ height: `${h}%` }}
                    ></div>
                    <span className="text-[8px] font-bold text-slate-500">{`${String(d.dec).slice(2)}s`}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic">Sem anos registrados ainda.</p>
          )}
        </div>

      </div>

      {/* Títulos de Excelência (5 estrelas) */}
      <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-3 shadow-lg">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <h4 className="text-xs font-bold uppercase tracking-wider text-white">
            ⭐ Títulos de Excelência <span className="text-slate-500 normal-case">({fiveStar.length})</span>
          </h4>
          {onCreateAutoList && (
            autoListActive ? (
              <button
                onClick={onCreateAutoList}
                className="text-[10px] font-bold text-emerald-300 bg-emerald-950/50 border border-emerald-500/30 px-2.5 py-1 rounded-lg hover:bg-emerald-950"
                title="Abrir a lista automática"
              >
                ✓ Lista automática ativa
              </button>
            ) : (
              <button
                onClick={onCreateAutoList}
                className="text-[10px] font-bold text-purple-300 bg-purple-950/40 border border-purple-500/30 px-2.5 py-1 rounded-lg hover:bg-purple-950/60"
                title="Cria uma lista que se atualiza sozinha quando um título recebe 5 estrelas"
              >
                ＋ Criar lista automática
              </button>
            )
          )}
        </div>

        {fiveStar.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {visibleFive.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onOpenItem?.(item)}
                  title="Ver detalhes"
                  className="text-left bg-slate-950 p-2.5 rounded-xl border border-slate-850 hover:border-purple-500/40 flex items-center justify-between transition-colors"
                >
                  <span className="text-xs font-bold text-slate-200 truncate pr-2">{item.titulo}</span>
                  <span className="bg-amber-950 text-amber-400 text-[10px] px-2 py-0.5 rounded border border-amber-500/20 font-black flex-shrink-0">★ 5</span>
                </button>
              ))}
            </div>
            {fiveStar.length > FIVE_LIMIT && (
              <button
                onClick={() => setShowAllFive((v) => !v)}
                className="w-full py-2 text-[11px] font-bold text-purple-300 border border-slate-800 hover:border-purple-500/40 rounded-xl transition-colors"
              >
                {showAllFive ? 'Ver menos' : `Ver mais… (+${fiveStar.length - FIVE_LIMIT})`}
              </button>
            )}
          </>
        ) : (
          <p className="text-xs text-slate-500 italic">Nenhum título com nota máxima atribuída por enquanto.</p>
        )}
      </div>

    </section>
  );
}
