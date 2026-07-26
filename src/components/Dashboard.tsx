// Aba de métricas e progresso.
import type { Item, Stats } from '../types';
import { formatMinutes } from '../lib/library';

interface DashboardProps {
  stats: Stats;
  items: Item[];
}

export default function Dashboard({ stats, items }: DashboardProps) {
  const fiveStar = items.filter((i) => i.nota === 5);

  return (
    <section className="space-y-6 max-w-5xl mx-auto">

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

        <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex items-center justify-between shadow">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Acervo Geral</p>
            <h3 className="text-2xl font-black text-white mt-1">{stats.total}</h3>
          </div>
          <div className="p-2.5 bg-purple-950/50 rounded-xl text-purple-400 text-sm">📁</div>
        </div>

        <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex items-center justify-between shadow">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Filmes / Séries</p>
            <h3 className="text-xl font-black text-white mt-1">
              {stats.movies} <span className="text-xs text-slate-500">Filmes</span> / {stats.shows} <span className="text-xs text-slate-500">Séries</span>
            </h3>
          </div>
          <div className="p-2.5 bg-indigo-950/50 rounded-xl text-indigo-400 text-sm">🎬</div>
        </div>

        <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex items-center justify-between shadow">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Concluídos</p>
            <h3 className="text-2xl font-black text-emerald-400 mt-1">
              {stats.watched} <span className="text-xs text-slate-500">({stats.watchedPercent}%)</span>
            </h3>
          </div>
          <div className="p-2.5 bg-emerald-950/50 rounded-xl text-emerald-400 text-sm">✓</div>
        </div>

        <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex items-center justify-between shadow">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Em Curso</p>
            <h3 className="text-2xl font-black text-blue-400 mt-1">{stats.inProgress}</h3>
          </div>
          <div className="p-2.5 bg-blue-950/50 rounded-xl text-blue-400 text-sm">⏳</div>
        </div>

      </div>

      {/* Conclusão Geral */}
      <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-3 shadow-lg">
        <div className="flex justify-between items-center text-xs">
          <span className="font-bold text-slate-300">Progresso de Visualização Total</span>
          <span className="text-purple-400 font-black">{stats.watched} de {stats.total} assistidos ({stats.watchedPercent}%)</span>
        </div>
        <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-slate-850 p-0.5">
          <div className="bg-gradient-to-r from-purple-600 to-indigo-500 h-full rounded-full transition-all duration-700" style={{ width: `${stats.watchedPercent}%` }}></div>
        </div>
        {stats.tempoAssistidoMin > 0 && (
          <p className="text-[11px] text-slate-400 pt-1">
            ⏱️ Tempo total assistido (estimado): <strong className="text-slate-200">{formatMinutes(stats.tempoAssistidoMin)}</strong>
            <span className="text-slate-600"> — requer dados de duração do TMDB</span>
          </p>
        )}
      </div>

      {/* Distribuição por Tipo */}
      {stats.byType.length > 0 && (
        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-3 shadow-lg">
          <h4 className="text-xs font-bold uppercase tracking-wider text-white">🗂️ Por Tipo de Conteúdo</h4>
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
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">🎭 Principais Géneros</h4>
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
            <p className="text-xs text-slate-500 italic">Sem géneros registados ainda.</p>
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
            <p className="text-xs text-slate-500 italic">Sem anos registados ainda.</p>
          )}
        </div>

      </div>

      {/* Obras com Classificação de 5 Estrelas */}
      <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-3 shadow-lg">
        <h4 className="text-xs font-bold uppercase tracking-wider text-white">⭐ Títulos de Excelência (Classificação Máxima)</h4>
        {fiveStar.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {fiveStar.map((item) => (
              <div key={item.id} className="bg-slate-950 p-2.5 rounded-xl border border-slate-850 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200 truncate pr-2">{item.titulo}</span>
                <span className="bg-amber-950 text-amber-400 text-[10px] px-2 py-0.5 rounded border border-amber-500/20 font-black">★ 5</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-500 italic">Nenhum título com nota máxima atribuída por enquanto.</p>
        )}
      </div>

    </section>
  );
}
